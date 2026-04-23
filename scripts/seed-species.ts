/**
 * Seed script: Populates the species and species_common_names tables
 * from the curated data/species-seed.json file.
 *
 * Run: pnpm tsx scripts/seed-species.ts
 *
 * Idempotent: uses upsert on scientificName.
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { species, speciesCommonNames } from "../src/modules/species/schema";
import { generateId } from "../src/lib/uuid";
import seedData from "../data/species-seed.json";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

interface SeedEntry {
  scientificName: string;
  family: string;
  genus: string;
  crossBorderAllowed: boolean;
  commonNames: Record<string, string>;
}

async function seed() {
  console.log(`Seeding ${seedData.length} species...`);

  let created = 0;
  let updated = 0;

  for (const entry of seedData as SeedEntry[]) {
    // Upsert species
    const existing = await db
      .select({ id: species.id })
      .from(species)
      .where(eq(species.scientificName, entry.scientificName))
      .limit(1);

    let speciesId: string;

    if (existing.length > 0) {
      speciesId = existing[0]!.id;
      await db
        .update(species)
        .set({
          family: entry.family,
          genus: entry.genus,
          crossBorderAllowed: entry.crossBorderAllowed,
          updatedAt: new Date(),
        })
        .where(eq(species.id, speciesId));
      updated++;
    } else {
      speciesId = generateId();
      await db.insert(species).values({
        id: speciesId,
        scientificName: entry.scientificName,
        family: entry.family,
        genus: entry.genus,
        crossBorderAllowed: entry.crossBorderAllowed,
      });
      created++;
    }

    // Delete existing common names and re-insert
    await db
      .delete(speciesCommonNames)
      .where(eq(speciesCommonNames.speciesId, speciesId));

    const nameEntries = Object.entries(entry.commonNames).map(
      ([lang, name], idx) => ({
        id: generateId(),
        speciesId,
        languageCode: lang,
        name,
        isPrimary: idx === 0,
      }),
    );

    if (nameEntries.length > 0) {
      await db.insert(speciesCommonNames).values(nameEntries);
    }
  }

  console.log(`Done: ${created} created, ${updated} updated.`);
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
