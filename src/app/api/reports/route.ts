import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { createReport } from "@/modules/reports/service";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { targetEntityType, targetEntityId, reasonCode, description } =
      body as {
        targetEntityType: "user" | "listing" | "message";
        targetEntityId: string;
        reasonCode: string;
        description: string;
      };

    const report = await createReport(
      session?.user?.id ?? null,
      targetEntityType,
      targetEntityId,
      reasonCode,
      description,
    );
    return jsonResponse(report, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
