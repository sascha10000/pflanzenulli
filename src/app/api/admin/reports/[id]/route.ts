import { NextRequest } from "next/server";
import { requireModerator } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { updateReportStatus } from "@/modules/reports/service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireModerator();
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body as {
      status: "under_review" | "resolved" | "rejected";
      notes?: string;
    };

    const report = await updateReportStatus(id, session.user.id, status, notes);
    return jsonResponse(report);
  } catch (error) {
    return errorResponse(error);
  }
}
