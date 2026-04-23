/**
 * Sprout amounts per event. All numbers are placeholders to be tuned.
 */
export const SPROUT_AMOUNTS = {
  transaction_completed: 50,
  trade_completed: 75,
  review_received_5star: 20,
  review_received_4star: 10,
  review_received_3star: 3,
  review_received_below_3star: 0,
  first_listing: 25,
  guide_published: 100,
} as const;

/**
 * Anti-gaming thresholds.
 */
export const ANTI_GAMING = {
  maxFullValueTransactionsPerMonth: 3,
  reducedMultiplier: 0.1,
  reviewWindowDays: 30,
  lateReviewMultiplier: 0.5,
} as const;

/**
 * Level progression (logarithmic).
 */
export const LEVEL_THRESHOLDS = [
  { level: 1, sproutsRequired: 0, title: { en: "Seedling", de: "Sämling" } },
  { level: 2, sproutsRequired: 25, title: { en: "Sprout", de: "Keimling" } },
  { level: 3, sproutsRequired: 60, title: { en: "Grower", de: "Züchter" } },
  {
    level: 4,
    sproutsRequired: 150,
    title: { en: "Gardener", de: "Gärtner" },
  },
  {
    level: 5,
    sproutsRequired: 350,
    title: { en: "Enthusiast", de: "Enthusiast" },
  },
  {
    level: 6,
    sproutsRequired: 800,
    title: { en: "Horticulturalist", de: "Gartenbauer" },
  },
  {
    level: 7,
    sproutsRequired: 1800,
    title: { en: "Botanist", de: "Botaniker" },
  },
  {
    level: 8,
    sproutsRequired: 4000,
    title: { en: "Master Grower", de: "Meisterzüchter" },
  },
  {
    level: 9,
    sproutsRequired: 8500,
    title: { en: "Cultivator", de: "Kultivator" },
  },
  {
    level: 10,
    sproutsRequired: 18000,
    title: { en: "Plant Whisperer", de: "Pflanzenflüsterer" },
  },
] as const;

export function calculateLevel(sproutTotal: number): number {
  let level = 1;
  for (const threshold of LEVEL_THRESHOLDS) {
    if (sproutTotal >= threshold.sproutsRequired) {
      level = threshold.level;
    } else {
      break;
    }
  }
  return level;
}

export function getLevelTitle(
  level: number,
  locale: string,
): string {
  const entry = LEVEL_THRESHOLDS.find((t) => t.level === level);
  if (!entry) return "Unknown";
  return (locale === "de" ? entry.title.de : entry.title.en);
}

export function getSproutsForReview(rating: number): number {
  if (rating >= 5) return SPROUT_AMOUNTS.review_received_5star;
  if (rating >= 4) return SPROUT_AMOUNTS.review_received_4star;
  if (rating >= 3) return SPROUT_AMOUNTS.review_received_3star;
  return SPROUT_AMOUNTS.review_received_below_3star;
}
