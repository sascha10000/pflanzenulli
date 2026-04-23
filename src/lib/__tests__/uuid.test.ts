import { describe, expect, it } from "vitest";
import { generateId } from "../uuid";

describe("generateId", () => {
  it("generates valid UUIDv7 strings", () => {
    const id = generateId();
    // UUIDv7 format: 8-4-4-4-12 hex chars with version 7
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it("generates time-ordered IDs", () => {
    const id1 = generateId();
    const id2 = generateId();
    // UUIDv7 is lexicographically sortable by time
    expect(id1 < id2 || id1 === id2).toBe(true);
  });
});
