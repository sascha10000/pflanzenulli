import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  users,
  commercialProfiles,
  userStats,
} from "@/modules/users/schema";
import { NotFoundError, ValidationError } from "@/lib/errors";
import type {
  UpdateProfileInput,
  OnboardingInput,
  CommercialProfileInput,
} from "./validators";

export async function getUserById(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      commercialProfile: true,
      stats: true,
    },
  });

  if (!user) {
    throw new NotFoundError("User", userId);
  }

  return user;
}

export async function updateProfile(
  userId: string,
  data: UpdateProfileInput,
) {
  const [updated] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  if (!updated) {
    throw new NotFoundError("User", userId);
  }

  return updated;
}

export async function completeOnboarding(
  userId: string,
  data: OnboardingInput,
) {
  const [updated] = await db
    .update(users)
    .set({
      displayName: data.displayName,
      accountType: data.accountType,
      countryCode: data.countryCode,
      preferredLanguage: data.preferredLanguage,
      gdprConsentAt: new Date(),
      tosAcceptedAt: new Date(),
      tosVersion: "1.0",
      onboardingCompleted: true,
      verificationStatus: "email_verified",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  if (!updated) {
    throw new NotFoundError("User", userId);
  }

  return updated;
}

export async function upsertCommercialProfile(
  userId: string,
  data: CommercialProfileInput,
) {
  // Verify user exists and is commercial
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new NotFoundError("User", userId);
  }

  if (user.accountType !== "commercial") {
    throw new ValidationError(
      "Commercial profile can only be created for commercial accounts",
    );
  }

  const imprintHtml = generateImprint(data);

  const [profile] = await db
    .insert(commercialProfiles)
    .values({
      userId,
      ...data,
      imprintHtml,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: commercialProfiles.userId,
      set: {
        ...data,
        imprintHtml,
        updatedAt: new Date(),
      },
    })
    .returning();

  return profile;
}

function generateImprint(data: CommercialProfileInput): string {
  const parts = [data.legalName];
  if (data.legalForm) parts.push(`(${data.legalForm})`);
  parts.push(data.registeredAddress);
  if (data.vatId) parts.push(`VAT ID: ${data.vatId}`);
  if (data.companyRegisterId) {
    parts.push(`Commercial Register: ${data.companyRegisterId}`);
  }
  return parts.join("\n");
}

export async function exportUserData(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      commercialProfile: true,
      stats: true,
    },
  });

  if (!user) {
    throw new NotFoundError("User", userId);
  }

  // In a full implementation, also export listings, transactions,
  // messages, reviews, wishlist, sprout ledger, badges, etc.
  return {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      accountType: user.accountType,
      countryCode: user.countryCode,
      preferredLanguage: user.preferredLanguage,
      bio: user.bio,
      createdAt: user.createdAt,
    },
    commercialProfile: user.commercialProfile ?? null,
    stats: user.stats ?? null,
  };
}

export async function deleteUserAccount(userId: string) {
  // Anonymize user data rather than hard-delete to preserve referential integrity
  const [updated] = await db
    .update(users)
    .set({
      email: `deleted-${userId}@deleted.pflanzenulli.eu`,
      name: null,
      displayName: "Deleted User",
      image: null,
      bio: null,
      locationGeohash: null,
      postalCode: null,
      isBanned: false,
      banReason: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  if (!updated) {
    throw new NotFoundError("User", userId);
  }

  // Delete commercial profile if exists
  await db
    .delete(commercialProfiles)
    .where(eq(commercialProfiles.userId, userId));

  return { deleted: true };
}

export async function getUserPublicProfile(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      displayName: true,
      accountType: true,
      verificationStatus: true,
      countryCode: true,
      bio: true,
      image: true,
      createdAt: true,
    },
    with: {
      stats: true,
    },
  });

  if (!user) {
    throw new NotFoundError("User", userId);
  }

  return user;
}
