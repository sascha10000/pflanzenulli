/**
 * Detects free-text postal addresses in messages.
 *
 * EU address patterns: "Street Name + Number" or "PLZ/ZIP + City" combinations.
 * Conservative: better to block a few false positives than miss real addresses.
 */

// Pattern: German/EU style "Streetname 12" or "Streetname 12a"
const STREET_NUMBER = /\b[A-ZÄÖÜ][a-zäöüß]+(?:straße|str\.|gasse|weg|allee|platz|ring|damm|ufer|chaussee|avenue|rue|via|calle|straat)\s+\d{1,4}[a-z]?\b/i;

// Pattern: PLZ + City "10115 Berlin" or "75001 Paris"
const PLZ_CITY = /\b\d{4,5}\s+[A-ZÄÖÜ][a-zäöüß]{2,}\b/;

// Pattern: "Postfach" / "P.O. Box"
const PO_BOX = /\b(?:Postfach|P\.?O\.?\s*Box)\s+\d+/i;

// Pattern: Full postal code formats with country prefix "DE-10115" or "A-1010"
const COUNTRY_PLZ = /\b[A-Z]{1,2}[-\s]?\d{4,5}\b/;

const PATTERNS = [STREET_NUMBER, PLZ_CITY, PO_BOX, COUNTRY_PLZ];

export function containsAddress(text: string): boolean {
  return PATTERNS.some((pattern) => pattern.test(text));
}

export function getAddressDetectionMessage(locale: string): string {
  if (locale === "de") {
    return "Postadressen können nicht direkt im Chat geteilt werden. Bitte nutze den sicheren Adresstaustausch-Button, um deine Adresse verschlüsselt zu teilen.";
  }
  return "Postal addresses cannot be shared directly in chat. Please use the secure address exchange button to share your address safely.";
}
