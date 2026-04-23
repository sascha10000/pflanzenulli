import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { respondToTradeOffer } from "@/modules/transactions/service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { action } = body as { action: "accept" | "reject" };

    const offer = await respondToTradeOffer(id, session.user.id, action);
    return jsonResponse(offer);
  } catch (error) {
    return errorResponse(error);
  }
}
