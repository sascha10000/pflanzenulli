import { Meilisearch } from "meilisearch";

const meiliUrl = process.env.MEILISEARCH_URL || "http://localhost:7700";
const meiliKey = process.env.MEILI_MASTER_KEY || "";

let client: Meilisearch | undefined;

export function getSearchClient(): Meilisearch {
  if (!client) {
    client = new Meilisearch({
      host: meiliUrl,
      apiKey: meiliKey,
    });
  }
  return client;
}
