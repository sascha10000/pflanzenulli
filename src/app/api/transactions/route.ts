import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import {
  initiateTransaction,
  getUserTransactions,
} from "@/modules/transactions/service";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const state = request.nextUrl.searchParams.get("state") ?? undefined;
    const txs = await getUserTransactions(session.user.id, state);
    return jsonResponse(txs);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { listingId, transactionType, tradeOfferId } = body as {
      listingId: string;
      transactionType: "buy" | "trade";
      tradeOfferId?: string;
    };

    const tx = await initiateTransaction(
      session.user.id,
      listingId,
      transactionType,
      tradeOfferId,
    );
    return jsonResponse(tx, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
