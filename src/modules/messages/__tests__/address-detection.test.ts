import { describe, expect, it } from "vitest";
import { containsAddress } from "../address-detection";

describe("address detection", () => {
  describe("should detect addresses", () => {
    it("German street + number", () => {
      expect(containsAddress("Musterstraße 12")).toBe(true);
    });

    it("abbreviated street", () => {
      expect(containsAddress("Hauptstr. 5")).toBe(true);
    });

    it("PLZ + city", () => {
      expect(containsAddress("10115 Berlin")).toBe(true);
    });

    it("Austrian PLZ + city", () => {
      expect(containsAddress("1010 Wien")).toBe(true);
    });

    it("full German address", () => {
      expect(
        containsAddress("Bitte sende an Musterstraße 12, 10115 Berlin"),
      ).toBe(true);
    });

    it("Postfach", () => {
      expect(containsAddress("Postfach 1234")).toBe(true);
    });

    it("P.O. Box", () => {
      expect(containsAddress("P.O. Box 5678")).toBe(true);
    });

    it("country prefix PLZ", () => {
      expect(containsAddress("DE-10115")).toBe(true);
    });

    it("street with house number suffix", () => {
      expect(containsAddress("Gartenweg 23a")).toBe(true);
    });
  });

  describe("should NOT detect as addresses", () => {
    it("normal text about plants", () => {
      expect(containsAddress("I have 12 plants for you")).toBe(false);
    });

    it("plant sizes", () => {
      expect(containsAddress("The Monstera is 45cm tall")).toBe(false);
    });

    it("prices", () => {
      expect(containsAddress("I'd sell it for 15 euros")).toBe(false);
    });

    it("greetings", () => {
      expect(containsAddress("Hello! Nice to meet you")).toBe(false);
    });

    it("plant care", () => {
      expect(
        containsAddress("Water it 2 times per week in summer"),
      ).toBe(false);
    });

    it("timestamps", () => {
      expect(containsAddress("Let's meet at 14:30")).toBe(false);
    });
  });
});
