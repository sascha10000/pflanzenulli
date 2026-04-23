import { describe, expect, it, beforeEach } from "vitest";
import {
  getEffectiveTierConfig,
  getTierConfig,
  isEarlyAccessEnabled,
} from "../feature-flags";

describe("feature flags", () => {
  beforeEach(() => {
    delete process.env.EARLY_ACCESS_ENABLED;
  });

  it("returns correct limits for free tier", () => {
    const config = getTierConfig("free");
    expect(config.listingLimit).toBe(10);
    expect(config.wishlistLimit).toBe(20);
    expect(config.sproutMultiplier).toBe(1.0);
    expect(config.hasPriorityBoost).toBe(false);
  });

  it("returns correct limits for plus tier", () => {
    const config = getTierConfig("plus");
    expect(config.listingLimit).toBe(50);
    expect(config.wishlistLimit).toBe(Infinity);
    expect(config.sproutMultiplier).toBe(1.5);
    expect(config.hasPriorityBoost).toBe(true);
  });

  it("returns correct limits for pro tier", () => {
    const config = getTierConfig("pro");
    expect(config.listingLimit).toBe(Infinity);
    expect(config.hasAnalytics).toBe(true);
    expect(config.hasShopPage).toBe(true);
  });

  it("gives free users Plus features during early access", () => {
    process.env.EARLY_ACCESS_ENABLED = "true";
    const config = getEffectiveTierConfig("free");
    expect(config.listingLimit).toBe(50);
    expect(config.sproutMultiplier).toBe(1.5);
  });

  it("returns actual tier when early access is disabled", () => {
    process.env.EARLY_ACCESS_ENABLED = "false";
    const config = getEffectiveTierConfig("free");
    expect(config.listingLimit).toBe(10);
  });

  it("detects early access enabled", () => {
    process.env.EARLY_ACCESS_ENABLED = "true";
    expect(isEarlyAccessEnabled()).toBe(true);
  });

  it("detects early access disabled", () => {
    expect(isEarlyAccessEnabled()).toBe(false);
  });
});
