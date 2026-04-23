/**
 * Seed script: Populates the badges table.
 * Run: pnpm tsx scripts/seed-badges.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { badges } from "../src/modules/sprouts/schema";
import { generateId } from "../src/lib/uuid";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client);

const BADGE_DEFINITIONS = [
  {
    slug: "first_trade",
    nameI18n: { en: "First Trade", de: "Erster Tausch" },
    descriptionI18n: {
      en: "Completed your first transaction",
      de: "Deine erste Transaktion abgeschlossen",
    },
  },
  {
    slug: "aroid_specialist",
    nameI18n: { en: "Aroid Specialist", de: "Aroiden-Spezialist" },
    descriptionI18n: {
      en: "Completed 10+ Araceae transactions",
      de: "10+ Araceae-Transaktionen abgeschlossen",
    },
  },
  {
    slug: "founding_member",
    nameI18n: { en: "Founding Member", de: "Gründungsmitglied" },
    descriptionI18n: {
      en: "Registered during Early Access",
      de: "Während der Early-Access-Phase registriert",
    },
  },
  {
    slug: "cross_border_connector",
    nameI18n: { en: "Cross-Border Connector", de: "Grenzübergreifender Verbinder" },
    descriptionI18n: {
      en: "Completed 5+ inter-country transactions",
      de: "5+ länderübergreifende Transaktionen abgeschlossen",
    },
  },
  {
    slug: "how2_contributor",
    nameI18n: { en: "How2 Contributor", de: "How2-Mitwirkender" },
    descriptionI18n: {
      en: "Published at least one approved guide",
      de: "Mindestens einen genehmigten Guide veröffentlicht",
    },
  },
  {
    slug: "trusted_trader",
    nameI18n: { en: "Trusted Trader", de: "Vertrauenswürdiger Händler" },
    descriptionI18n: {
      en: "Maintained 4.5+ average rating over 10+ reviews",
      de: "4,5+ Durchschnittsbewertung bei 10+ Bewertungen",
    },
  },
];

async function seed() {
  console.log(`Seeding ${BADGE_DEFINITIONS.length} badges...`);

  for (const badge of BADGE_DEFINITIONS) {
    const existing = await db
      .select({ id: badges.id })
      .from(badges)
      .where(eq(badges.slug, badge.slug))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(badges).values({
        id: generateId(),
        ...badge,
      });
      console.log(`  Created: ${badge.slug}`);
    } else {
      console.log(`  Exists: ${badge.slug}`);
    }
  }

  console.log("Done.");
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
