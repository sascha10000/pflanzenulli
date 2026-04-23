import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { getTransaction } from "@/modules/transactions/service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const tx = await getTransaction(id, session.user.id);
    return jsonResponse(tx);
  } catch (error) {
    return errorResponse(error);
  }
}
