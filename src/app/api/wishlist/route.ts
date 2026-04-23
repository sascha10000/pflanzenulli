import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import {
  addToWishlist,
  getUserWishlist,
  removeFromWishlist,
} from "@/modules/wishlist/service";

export async function GET() {
  try {
    const session = await requireAuth();
    const wishlist = await getUserWishlist(session.user.id);
    return jsonResponse(wishlist);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { speciesId, maxPriceCents, acceptCrossBorder, notifyEnabled } =
      body as {
        speciesId: string;
        maxPriceCents?: number;
        acceptCrossBorder?: boolean;
        notifyEnabled?: boolean;
      };

    const entry = await addToWishlist(
      session.user.id,
      speciesId,
      "free", // TODO: Get from subscription
      { maxPriceCents, acceptCrossBorder, notifyEnabled },
    );
    return jsonResponse(entry, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { id } = (await request.json()) as { id: string };
    await removeFromWishlist(session.user.id, id);
    return jsonResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
