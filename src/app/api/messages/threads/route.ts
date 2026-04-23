import { requireAuth } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { getUserThreads } from "@/modules/messages/service";

export async function GET() {
  try {
    const session = await requireAuth();
    const threads = await getUserThreads(session.user.id);
    return jsonResponse(threads);
  } catch (error) {
    return errorResponse(error);
  }
}
