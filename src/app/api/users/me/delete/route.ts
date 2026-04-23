import { requireAuth } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { deleteUserAccount } from "@/modules/users/service";

export async function DELETE() {
  try {
    const session = await requireAuth();
    const result = await deleteUserAccount(session.user.id);
    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
