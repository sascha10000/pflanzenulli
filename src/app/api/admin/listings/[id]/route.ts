import { NextRequest } from "next/server";
import { requireModerator } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { db } from "@/lib/db";
import { listings } from "@/modules/listings/schema";
import { eq } from "drizzle-orm";
import { logAuditEvent } from "@/lib/audit";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireModerator();
    const { id } = await params;
    const body = await request.json();
    const { action } = body as { action: "hide" | "unhide" };

    const newStatus =
      action === "hide" ? "hidden_by_moderation" : "active";

    const [updated] = await db
      .update(listings)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, id))
      .returning();

    await logAuditEvent(
      session.user.id,
      `listing.${action}`,
      "listing",
      id,
    );

    return jsonResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
