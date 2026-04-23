import { eq, and, sql, desc, asc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { listings, listingPhotos } from "./schema";
import { species } from "@/modules/species/schema";
import { users } from "@/modules/users/schema";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "@/lib/errors";
import { getEffectiveTierConfig, type SubscriptionTier } from "@/lib/feature-flags";
import type { CreateListingInput, UpdateListingInput } from "./validators";

const LISTING_EXPIRY_DAYS = 90;

export async function createListing(
  userId: string,
  userAccountType: string,
  userCountryCode: string,
  userGeohash: string | null,
  userTier: SubscriptionTier,
  data: CreateListingInput,
) {
  // Rule: Private users cannot create seed listings
  if (data.category === "seed" && userAccountType !== "commercial") {
    throw new ValidationError(
      "Only commercial accounts may list seeds. This is required by EU Seed Trading Law (SaatG).",
    );
  }

  // Rule: Check listing count limit
  const tierConfig = getEffectiveTierConfig(userTier);
  const [countResult] = await db
    .select({ total: count() })
    .from(listings)
    .where(
      and(
        eq(listings.userId, userId),
        eq(listings.status, "active"),
      ),
    );

  if (countResult && countResult.total >= tierConfig.listingLimit) {
    throw new ValidationError(
      `You have reached your listing limit of ${tierConfig.listingLimit}. Upgrade your plan for more listings.`,
    );
  }

  // Rule: Derive cross-border eligibility from species
  let crossBorderEligible = false;
  if (data.speciesId) {
    const sp = await db.query.species.findFirst({
      where: eq(species.id, data.speciesId),
      columns: { crossBorderAllowed: true },
    });
    if (sp) {
      crossBorderEligible = sp.crossBorderAllowed;
    }
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + LISTING_EXPIRY_DAYS);

  const [listing] = await db
    .insert(listings)
    .values({
      userId,
      title: data.title,
      description: data.description,
      category: data.category,
      speciesId: data.speciesId ?? null,
      conditionNotes: data.conditionNotes ?? null,
      priceCents: data.priceCents,
      currency: data.currency,
      isTradeable: data.isTradeable,
      quantityAvailable: data.quantityAvailable,
      quantityUnit: data.quantityUnit,
      countryCode: userCountryCode,
      locationGeohash: userGeohash,
      crossBorderEligible,
      plantAttributes: data.plantAttributes ?? null,
      expiresAt,
    })
    .returning();

  return listing;
}

export async function updateListing(
  userId: string,
  listingId: string,
  data: UpdateListingInput,
) {
  const existing = await db.query.listings.findFirst({
    where: eq(listings.id, listingId),
  });

  if (!existing) throw new NotFoundError("Listing", listingId);
  if (existing.userId !== userId)
    throw new ForbiddenError("You can only edit your own listings");

  // Re-derive cross-border if species changed
  let crossBorderEligible = existing.crossBorderEligible;
  if (data.speciesId && data.speciesId !== existing.speciesId) {
    const sp = await db.query.species.findFirst({
      where: eq(species.id, data.speciesId),
      columns: { crossBorderAllowed: true },
    });
    crossBorderEligible = sp?.crossBorderAllowed ?? false;
  }

  const [updated] = await db
    .update(listings)
    .set({
      ...data,
      crossBorderEligible,
      updatedAt: new Date(),
    })
    .where(eq(listings.id, listingId))
    .returning();

  return updated;
}

export async function withdrawListing(userId: string, listingId: string) {
  const existing = await db.query.listings.findFirst({
    where: eq(listings.id, listingId),
  });

  if (!existing) throw new NotFoundError("Listing", listingId);
  if (existing.userId !== userId)
    throw new ForbiddenError("You can only withdraw your own listings");

  const [updated] = await db
    .update(listings)
    .set({ status: "withdrawn", updatedAt: new Date() })
    .where(eq(listings.id, listingId))
    .returning();

  return updated;
}

export async function getListingById(id: string) {
  const listing = await db.query.listings.findFirst({
    where: eq(listings.id, id),
    with: {
      photos: { orderBy: [asc(listingPhotos.orderIndex)] },
      species: { with: { commonNames: true } },
      user: {
        columns: {
          id: true,
          displayName: true,
          accountType: true,
          countryCode: true,
          image: true,
          verificationStatus: true,
        },
      },
    },
  });

  if (!listing) throw new NotFoundError("Listing", id);
  return listing;
}

export async function getUserListings(
  userId: string,
  status?: string,
  limit = 20,
  offset = 0,
) {
  const conditions = [eq(listings.userId, userId)];
  if (status) {
    conditions.push(eq(listings.status, status as typeof listings.status.enumValues[number]));
  }

  return db.query.listings.findMany({
    where: and(...conditions),
    with: { photos: { orderBy: [asc(listingPhotos.orderIndex)], limit: 1 } },
    limit,
    offset,
    orderBy: [desc(listings.createdAt)],
  });
}

export async function incrementViewCount(listingId: string) {
  await db
    .update(listings)
    .set({ viewCount: sql`${listings.viewCount} + 1` })
    .where(eq(listings.id, listingId));
}

export async function expireOldListings() {
  const now = new Date();
  const result = await db
    .update(listings)
    .set({ status: "expired", updatedAt: now })
    .where(
      and(
        eq(listings.status, "active"),
        sql`${listings.expiresAt} < ${now}`,
      ),
    )
    .returning({ id: listings.id });

  return result.length;
}
