import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { createTradeOffer } from "@/modules/transactions/service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { offeredItems, message } = body as {
      offeredItems: Array<{ type: "listing" | "freetext"; value: string }>;
      message?: string;
    };

    const offer = await createTradeOffer(
      session.user.id,
      id,
      offeredItems,
      message,
    );
    return jsonResponse(offer, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
