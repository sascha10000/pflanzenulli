import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { upsertCommercialProfile } from "@/modules/users/service";
import { commercialProfileSchema } from "@/modules/users/validators";

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = commercialProfileSchema.parse(body);
    const profile = await upsertCommercialProfile(session.user.id, data);
    return jsonResponse(profile);
  } catch (error) {
    return errorResponse(error);
  }
}
