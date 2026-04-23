import { describe, expect, it } from "vitest";
import { formatMoney, centsToMajor, majorToCents } from "../money";

describe("money utilities", () => {
  it("converts cents to major units", () => {
    expect(centsToMajor(1299)).toBe(12.99);
    expect(centsToMajor(0)).toBe(0);
    expect(centsToMajor(100)).toBe(1);
  });

  it("converts major units to cents", () => {
    expect(majorToCents(12.99)).toBe(1299);
    expect(majorToCents(0)).toBe(0);
    expect(majorToCents(1)).toBe(100);
  });

  it("handles floating point correctly in majorToCents", () => {
    // 0.1 + 0.2 = 0.30000000000000004 in JS
    expect(majorToCents(0.1 + 0.2)).toBe(30);
  });

  it("formats money for German locale", () => {
    const result = formatMoney({ cents: 499, currency: "EUR" }, "de-DE");
    expect(result).toContain("4,99");
    expect(result).toContain("€");
  });

  it("formats money for English locale", () => {
    const result = formatMoney({ cents: 499, currency: "EUR" }, "en-US");
    expect(result).toContain("4.99");
  });
});
