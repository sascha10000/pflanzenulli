import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { advanceTransaction } from "@/modules/transactions/service";
import type { TransactionEvent } from "@/modules/transactions/state-machine";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { event } = body as { event: TransactionEvent };

    const tx = await advanceTransaction(id, event, session.user.id);
    return jsonResponse(tx);
  } catch (error) {
    return errorResponse(error);
  }
}
