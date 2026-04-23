import { eq, and, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { wishlists } from "./schema";
import { NotFoundError, ValidationError } from "@/lib/errors";
import {
  getEffectiveTierConfig,
  type SubscriptionTier,
} from "@/lib/feature-flags";

export async function addToWishlist(
  userId: string,
  speciesId: string,
  userTier: SubscriptionTier,
  options?: {
    maxPriceCents?: number;
    acceptCrossBorder?: boolean;
    notifyEnabled?: boolean;
  },
) {
  const tierConfig = getEffectiveTierConfig(userTier);

  // Check limit
  const [countResult] = await db
    .select({ total: count() })
    .from(wishlists)
    .where(eq(wishlists.userId, userId));

  if (countResult && countResult.total >= tierConfig.wishlistLimit) {
    throw new ValidationError(
      `Wishlist limit of ${tierConfig.wishlistLimit} reached. Upgrade for more.`,
    );
  }

  // Check duplicate
  const existing = await db.query.wishlists.findFirst({
    where: and(
      eq(wishlists.userId, userId),
      eq(wishlists.speciesId, speciesId),
    ),
  });

  if (existing) {
    throw new ValidationError("This species is already in your wishlist");
  }

  const [entry] = await db
    .insert(wishlists)
    .values({
      userId,
      speciesId,
      maxPriceCents: options?.maxPriceCents ?? null,
      acceptCrossBorder: options?.acceptCrossBorder ?? false,
      notifyEnabled: options?.notifyEnabled ?? true,
    })
    .returning();

  return entry;
}

export async function removeFromWishlist(userId: string, wishlistId: string) {
  const existing = await db.query.wishlists.findFirst({
    where: eq(wishlists.id, wishlistId),
  });

  if (!existing) throw new NotFoundError("Wishlist entry", wishlistId);
  if (existing.userId !== userId)
    throw new ValidationError("You can only remove your own wishlist entries");

  await db.delete(wishlists).where(eq(wishlists.id, wishlistId));
}

export async function getUserWishlist(userId: string) {
  return db.query.wishlists.findMany({
    where: eq(wishlists.userId, userId),
    with: { species: { with: { commonNames: true } } },
    orderBy: wishlists.createdAt,
  });
}
