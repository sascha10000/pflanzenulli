export type SubscriptionTier = "free" | "plus" | "pro";

export interface TierConfig {
  listingLimit: number;
  wishlistLimit: number;
  sproutMultiplier: number;
  hasPriorityBoost: boolean;
  hasAnalytics: boolean;
  hasShopPage: boolean;
  hasBulkUpload: boolean;
  priorityBoostSlots: number;
}

const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  free: {
    listingLimit: 10,
    wishlistLimit: 20,
    sproutMultiplier: 1.0,
    hasPriorityBoost: false,
    hasAnalytics: false,
    hasShopPage: false,
    hasBulkUpload: false,
    priorityBoostSlots: 0,
  },
  plus: {
    listingLimit: 50,
    wishlistLimit: Infinity,
    sproutMultiplier: 1.5,
    hasPriorityBoost: true,
    hasAnalytics: false,
    hasShopPage: false,
    hasBulkUpload: true,
    priorityBoostSlots: 3,
  },
  pro: {
    listingLimit: Infinity,
    wishlistLimit: Infinity,
    sproutMultiplier: 1.5,
    hasPriorityBoost: true,
    hasAnalytics: true,
    hasShopPage: true,
    hasBulkUpload: true,
    priorityBoostSlots: 10,
  },
};

export function isEarlyAccessEnabled(): boolean {
  return process.env.EARLY_ACCESS_ENABLED === "true";
}

/**
 * Get the effective tier config for a user.
 * During Early Access, all users get Plus-level features.
 */
export function getEffectiveTierConfig(
  subscriptionTier: SubscriptionTier,
): TierConfig {
  if (isEarlyAccessEnabled()) {
    return TIER_CONFIGS.plus;
  }
  return TIER_CONFIGS[subscriptionTier];
}

export function getTierConfig(tier: SubscriptionTier): TierConfig {
  return TIER_CONFIGS[tier];
}
