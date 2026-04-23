import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { shareAddress, getSharedAddress } from "@/modules/messages/service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> },
) {
  try {
    const session = await requireAuth();
    const { transactionId } = await params;
    const body = await request.json();

    const result = await shareAddress(transactionId, session.user.id, body);
    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> },
) {
  try {
    const session = await requireAuth();
    const { transactionId } = await params;
    const targetUserId = request.nextUrl.searchParams.get("userId");

    if (!targetUserId) {
      return jsonResponse({ error: "userId query param required" }, 400);
    }

    const address = await getSharedAddress(
      transactionId,
      session.user.id,
      targetUserId,
    );
    return jsonResponse({ address });
  } catch (error) {
    return errorResponse(error);
  }
}
