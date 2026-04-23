import { eq, and, sql, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { sproutLedger, userBadges, badges } from "./schema";
import { userStats } from "@/modules/users/schema";
import { calculateLevel, ANTI_GAMING } from "./constants";
import { getEffectiveTierConfig, type SubscriptionTier } from "@/lib/feature-flags";

export async function awardSprouts(
  userId: string,
  amount: number,
  reasonCode: string,
  referenceEntityType?: string,
  referenceEntityId?: string,
  userTier: SubscriptionTier = "free",
) {
  // Apply tier multiplier
  const tierConfig = getEffectiveTierConfig(userTier);
  const adjustedAmount = Math.round(amount * tierConfig.sproutMultiplier);

  await db.insert(sproutLedger).values({
    userId,
    amount: adjustedAmount,
    reasonCode,
    referenceEntityType: referenceEntityType ?? null,
    referenceEntityId: referenceEntityId ?? null,
  });

  // Update cached stats
  await recomputeUserStats(userId);

  return adjustedAmount;
}

export async function getUserSproutTotal(userId: string): Promise<number> {
  const result = await db
    .select({ total: sql<number>`COALESCE(SUM(${sproutLedger.amount}), 0)` })
    .from(sproutLedger)
    .where(eq(sproutLedger.userId, userId));

  return result[0]?.total ?? 0;
}

export async function recomputeUserStats(userId: string) {
  const total = await getUserSproutTotal(userId);
  const level = calculateLevel(total);

  await db
    .update(userStats)
    .set({
      sproutTotal: total,
      level,
      recomputedAt: new Date(),
    })
    .where(eq(userStats.userId, userId));
}

/**
 * Anti-gaming: count transactions between two users this month.
 * Returns the multiplier to apply (1.0 for full, 0.1 for reduced).
 */
export async function getTransactionMultiplier(
  userId1: string,
  userId2: string,
): Promise<number> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(sproutLedger)
    .where(
      and(
        eq(sproutLedger.userId, userId1),
        gte(sproutLedger.createdAt, monthStart),
        sql`${sproutLedger.referenceEntityType} = 'transaction'`,
      ),
    );

  const count = result[0]?.count ?? 0;
  return count >= ANTI_GAMING.maxFullValueTransactionsPerMonth
    ? ANTI_GAMING.reducedMultiplier
    : 1.0;
}

/**
 * Check if a review is within the 30-day window.
 * Returns the multiplier to apply (1.0 for on-time, 0.5 for late).
 */
export function getReviewTimeMultiplier(
  transactionCompletedAt: Date,
): number {
  const now = new Date();
  const daysSince =
    (now.getTime() - transactionCompletedAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince > ANTI_GAMING.reviewWindowDays
    ? ANTI_GAMING.lateReviewMultiplier
    : 1.0;
}

// --- Badges ---

export async function getUserBadges(userId: string) {
  return db.query.userBadges.findMany({
    where: eq(userBadges.userId, userId),
    with: { badge: true },
    orderBy: userBadges.awardedAt,
  });
}

export async function awardBadge(
  userId: string,
  badgeSlug: string,
  evidenceRef?: string,
) {
  const badge = await db.query.badges.findFirst({
    where: eq(badges.slug, badgeSlug),
  });

  if (!badge) return null;

  // Check if already awarded
  const existing = await db.query.userBadges.findFirst({
    where: and(
      eq(userBadges.userId, userId),
      eq(userBadges.badgeId, badge.id),
    ),
  });

  if (existing) return existing;

  const [awarded] = await db
    .insert(userBadges)
    .values({
      userId,
      badgeId: badge.id,
      evidenceRef: evidenceRef ?? null,
    })
    .returning();

  return awarded;
}
