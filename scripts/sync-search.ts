/**
 * Sync all active listings to Meilisearch.
 * Run: pnpm tsx scripts/sync-search.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { Meilisearch } from "meilisearch";
import { listings } from "../src/modules/listings/schema";
import { users } from "../src/modules/users/schema";
import { species, speciesCommonNames } from "../src/modules/species/schema";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client);

const meili = new Meilisearch({
  host: process.env.MEILISEARCH_URL || "http://localhost:7700",
  apiKey: process.env.MEILI_MASTER_KEY || "meilisearch_dev_key",
});

async function sync() {
  const index = meili.index("listings");

  // Configure index
  await index.updateSearchableAttributes([
    "title",
    "description",
    "speciesScientificName",
    "speciesCommonNames",
  ]);
  await index.updateFilterableAttributes([
    "category",
    "countryCode",
    "crossBorderEligible",
    "isTradeable",
    "status",
    "priceCents",
  ]);
  await index.updateSortableAttributes(["createdAt", "priceCents"]);

  // Fetch all active listings with related data
  const allListings = await db
    .select({
      id: listings.id,
      title: listings.title,
      description: listings.description,
      category: listings.category,
      priceCents: listings.priceCents,
      currency: listings.currency,
      isTradeable: listings.isTradeable,
      countryCode: listings.countryCode,
      crossBorderEligible: listings.crossBorderEligible,
      status: listings.status,
      createdAt: listings.createdAt,
      speciesId: listings.speciesId,
      userId: listings.userId,
    })
    .from(listings)
    .where(eq(listings.status, "active"));

  const documents = [];

  for (const listing of allListings) {
    let speciesScientificName = "";
    let speciesCommonNamesList: string[] = [];

    if (listing.speciesId) {
      const sp = await db
        .select({ scientificName: species.scientificName })
        .from(species)
        .where(eq(species.id, listing.speciesId))
        .limit(1);

      if (sp[0]) {
        speciesScientificName = sp[0].scientificName;
      }

      const names = await db
        .select({ name: speciesCommonNames.name })
        .from(speciesCommonNames)
        .where(eq(speciesCommonNames.speciesId, listing.speciesId));

      speciesCommonNamesList = names.map((n) => n.name);
    }

    const user = await db
      .select({
        displayName: users.displayName,
        accountType: users.accountType,
      })
      .from(users)
      .where(eq(users.id, listing.userId))
      .limit(1);

    documents.push({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      priceCents: listing.priceCents,
      currency: listing.currency,
      isTradeable: listing.isTradeable,
      countryCode: listing.countryCode,
      crossBorderEligible: listing.crossBorderEligible,
      status: listing.status,
      createdAt: listing.createdAt?.getTime() ?? 0,
      speciesScientificName,
      speciesCommonNames: speciesCommonNamesList,
      sellerDisplayName: user[0]?.displayName ?? "Unknown",
      sellerAccountType: user[0]?.accountType ?? "private",
    });
  }

  const result = await index.addDocuments(documents, { primaryKey: "id" });
  console.log(
    `Indexed ${documents.length} listings. Task UID: ${result.taskUid}`,
  );

  await client.end();
}

sync().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
