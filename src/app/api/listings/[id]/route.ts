import { NextRequest } from "next/server";
import { requireAuth, getSession } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import {
  getListingById,
  updateListing,
  withdrawListing,
  incrementViewCount,
} from "@/modules/listings/service";
import { updateListingSchema } from "@/modules/listings/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const listing = await getListingById(id);

    // Increment view count (fire and forget)
    incrementViewCount(id).catch(() => {});

    return jsonResponse(listing);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const data = updateListingSchema.parse(body);
    const listing = await updateListing(session.user.id, id, data);
    return jsonResponse(listing);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const listing = await withdrawListing(session.user.id, id);
    return jsonResponse(listing);
  } catch (error) {
    return errorResponse(error);
  }
}
