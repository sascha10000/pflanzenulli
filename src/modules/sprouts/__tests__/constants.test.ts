import { describe, expect, it } from "vitest";
import {
  calculateLevel,
  getLevelTitle,
  getSproutsForReview,
  LEVEL_THRESHOLDS,
} from "../constants";

describe("calculateLevel", () => {
  it("returns level 1 for 0 sprouts", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("returns level 2 at exactly 25 sprouts", () => {
    expect(calculateLevel(25)).toBe(2);
  });

  it("returns level 2 at 59 sprouts (just below level 3)", () => {
    expect(calculateLevel(59)).toBe(2);
  });

  it("returns level 3 at 60 sprouts", () => {
    expect(calculateLevel(60)).toBe(3);
  });

  it("returns level 10 at 18000 sprouts", () => {
    expect(calculateLevel(18000)).toBe(10);
  });

  it("returns level 10 for very high sprout totals", () => {
    expect(calculateLevel(99999)).toBe(10);
  });

  it("returns correct level at every boundary", () => {
    for (const threshold of LEVEL_THRESHOLDS) {
      expect(calculateLevel(threshold.sproutsRequired)).toBe(threshold.level);
    }
  });

  it("returns previous level just below each boundary", () => {
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      const threshold = LEVEL_THRESHOLDS[i]!;
      const prev = LEVEL_THRESHOLDS[i - 1]!;
      expect(calculateLevel(threshold.sproutsRequired - 1)).toBe(prev.level);
    }
  });
});

describe("getLevelTitle", () => {
  it("returns English title", () => {
    expect(getLevelTitle(1, "en")).toBe("Seedling");
    expect(getLevelTitle(10, "en")).toBe("Plant Whisperer");
  });

  it("returns German title", () => {
    expect(getLevelTitle(1, "de")).toBe("Sämling");
    expect(getLevelTitle(10, "de")).toBe("Pflanzenflüsterer");
  });
});

describe("getSproutsForReview", () => {
  it("returns 20 for 5-star review", () => {
    expect(getSproutsForReview(5)).toBe(20);
  });

  it("returns 10 for 4-star review", () => {
    expect(getSproutsForReview(4)).toBe(10);
  });

  it("returns 3 for 3-star review", () => {
    expect(getSproutsForReview(3)).toBe(3);
  });

  it("returns 0 for 2-star review", () => {
    expect(getSproutsForReview(2)).toBe(0);
  });

  it("returns 0 for 1-star review", () => {
    expect(getSproutsForReview(1)).toBe(0);
  });
});
