import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { searchListings } from "@/modules/listings/search";
import { searchListingsSchema } from "@/modules/listings/validators";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const searchParams = Object.fromEntries(
      request.nextUrl.searchParams.entries(),
    );
    const params = searchListingsSchema.parse(searchParams);
    const results = await searchListings(
      params,
      session?.user?.countryCode ?? undefined,
    );
    return jsonResponse(results);
  } catch (error) {
    return errorResponse(error);
  }
}
