import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { completeOnboarding } from "@/modules/users/service";
import { onboardingSchema } from "@/modules/users/validators";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const data = onboardingSchema.parse(body);
    const user = await completeOnboarding(session.user.id, data);
    return jsonResponse(user);
  } catch (error) {
    return errorResponse(error);
  }
}
