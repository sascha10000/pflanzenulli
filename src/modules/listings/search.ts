import { getSearchClient } from "@/lib/search";
import type { SearchListingsInput } from "./validators";

const LISTINGS_INDEX = "listings";

interface ListingDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  speciesScientificName?: string;
  speciesCommonNames?: string[];
  priceCents: number;
  currency: string;
  isTradeable: boolean;
  countryCode: string;
  crossBorderEligible: boolean;
  status: string;
  createdAt: number;
  sellerDisplayName: string;
  sellerAccountType: string;
}

export async function indexListing(doc: ListingDocument) {
  const client = getSearchClient();
  const index = client.index(LISTINGS_INDEX);
  await index.addDocuments([doc], { primaryKey: "id" });
}

export async function removeListing(id: string) {
  const client = getSearchClient();
  const index = client.index(LISTINGS_INDEX);
  await index.deleteDocument(id);
}

export async function searchListings(
  params: SearchListingsInput,
  userCountryCode?: string,
) {
  const client = getSearchClient();
  const index = client.index(LISTINGS_INDEX);

  const filters: string[] = ['status = "active"'];

  if (params.category) {
    filters.push(`category = "${params.category}"`);
  }

  if (params.tradeable) {
    filters.push("isTradeable = true");
  }

  if (params.minPrice !== undefined) {
    filters.push(`priceCents >= ${params.minPrice}`);
  }

  if (params.maxPrice !== undefined) {
    filters.push(`priceCents <= ${params.maxPrice}`);
  }

  // Cross-border logic
  if (params.crossBorder) {
    filters.push("crossBorderEligible = true");
  } else if (params.country) {
    filters.push(`countryCode = "${params.country}"`);
  } else if (userCountryCode) {
    filters.push(`countryCode = "${userCountryCode}"`);
  }

  const sortMap: Record<string, string[]> = {
    newest: ["createdAt:desc"],
    price_asc: ["priceCents:asc"],
    price_desc: ["priceCents:desc"],
  };

  const results = await index.search(params.q ?? "", {
    filter: filters,
    sort: sortMap[params.sort] ?? ["createdAt:desc"],
    limit: params.limit,
    offset: (params.page - 1) * params.limit,
  });

  return {
    hits: results.hits,
    totalHits: results.estimatedTotalHits ?? 0,
    page: params.page,
    limit: params.limit,
  };
}

export async function setupListingsIndex() {
  const client = getSearchClient();
  const index = client.index(LISTINGS_INDEX);

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
}
