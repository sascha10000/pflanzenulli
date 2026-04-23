import { eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { species, speciesCommonNames } from "./schema";
import { NotFoundError } from "@/lib/errors";
import { getSearchClient } from "@/lib/search";

const SPECIES_INDEX = "species";

export async function searchSpecies(query: string, limit = 20) {
  try {
    const client = getSearchClient();
    const index = client.index(SPECIES_INDEX);
    const results = await index.search(query, { limit });
    return results.hits;
  } catch {
    // Fallback to database search if Meilisearch is unavailable
    return searchSpeciesFromDb(query, limit);
  }
}

async function searchSpeciesFromDb(query: string, limit: number) {
  const pattern = `%${query}%`;
  const results = await db
    .select({
      id: species.id,
      scientificName: species.scientificName,
      family: species.family,
      genus: species.genus,
      crossBorderAllowed: species.crossBorderAllowed,
    })
    .from(species)
    .leftJoin(
      speciesCommonNames,
      eq(species.id, speciesCommonNames.speciesId),
    )
    .where(
      or(
        ilike(species.scientificName, pattern),
        ilike(species.genus, pattern),
        ilike(speciesCommonNames.name, pattern),
      ),
    )
    .groupBy(species.id)
    .limit(limit);

  return results;
}

export async function getSpeciesById(id: string) {
  const result = await db.query.species.findFirst({
    where: eq(species.id, id),
    with: { commonNames: true },
  });

  if (!result) {
    throw new NotFoundError("Species", id);
  }

  return result;
}

export async function getAllSpecies(limit = 500, offset = 0) {
  return db.query.species.findMany({
    with: { commonNames: true },
    limit,
    offset,
    orderBy: species.scientificName,
  });
}

// --- Meilisearch sync ---

export async function syncSpeciesToSearch() {
  const client = getSearchClient();
  const allSpecies = await db.query.species.findMany({
    with: { commonNames: true },
  });

  const documents = allSpecies.map((s) => ({
    id: s.id,
    scientificName: s.scientificName,
    family: s.family,
    genus: s.genus,
    crossBorderAllowed: s.crossBorderAllowed,
    commonNames: s.commonNames.map((cn) => cn.name),
  }));

  const index = client.index(SPECIES_INDEX);
  await index.addDocuments(documents, { primaryKey: "id" });
  await index.updateSearchableAttributes([
    "scientificName",
    "commonNames",
    "genus",
    "family",
  ]);
  await index.updateFilterableAttributes(["crossBorderAllowed"]);

  return { indexed: documents.length };
}
