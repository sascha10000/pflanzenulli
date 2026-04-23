import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { getUserById, updateProfile } from "@/modules/users/service";
import { updateProfileSchema } from "@/modules/users/validators";

export async function GET() {
  try {
    const session = await requireAuth();
    const user = await getUserById(session.user.id);
    return jsonResponse(user);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = updateProfileSchema.parse(body);
    const user = await updateProfile(session.user.id, data);
    return jsonResponse(user);
  } catch (error) {
    return errorResponse(error);
  }
}
