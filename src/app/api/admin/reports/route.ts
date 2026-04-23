import { NextRequest } from "next/server";
import { requireModerator } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { getReportsQueue } from "@/modules/reports/service";

export async function GET(request: NextRequest) {
  try {
    await requireModerator();
    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const reports = await getReportsQueue(status);
    return jsonResponse(reports);
  } catch (error) {
    return errorResponse(error);
  }
}
