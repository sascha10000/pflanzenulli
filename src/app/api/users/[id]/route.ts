import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { getUserPublicProfile } from "@/modules/users/service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const profile = await getUserPublicProfile(id);
    return jsonResponse(profile);
  } catch (error) {
    return errorResponse(error);
  }
}
