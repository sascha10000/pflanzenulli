import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { searchSpecies, getAllSpecies } from "@/modules/species/service";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q");
    const limit = parseInt(
      request.nextUrl.searchParams.get("limit") ?? "20",
      10,
    );

    if (query) {
      const results = await searchSpecies(query, limit);
      return jsonResponse(results);
    }

    const results = await getAllSpecies(limit);
    return jsonResponse(results);
  } catch (error) {
    return errorResponse(error);
  }
}
