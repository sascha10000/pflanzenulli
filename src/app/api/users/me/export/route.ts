import { requireAuth } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { exportUserData } from "@/modules/users/service";

export async function GET() {
  try {
    const session = await requireAuth();
    const data = await exportUserData(session.user.id);
    return jsonResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}
