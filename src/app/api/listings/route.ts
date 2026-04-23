import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { createListing, getUserListings } from "@/modules/listings/service";
import { createListingSchema } from "@/modules/listings/validators";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const listings = await getUserListings(session.user.id, status);
    return jsonResponse(listings);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = createListingSchema.parse(body);

    const listing = await createListing(
      session.user.id,
      session.user.accountType,
      session.user.countryCode ?? "DE",
      null,
      "free", // TODO: Get from subscription
      data,
    );

    return jsonResponse(listing, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
