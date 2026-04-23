import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { db } from "@/lib/db";
import { species } from "@/modules/species/schema";
import { eq } from "drizzle-orm";
import { logAuditEvent } from "@/lib/audit";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const [updated] = await db
      .update(species)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(species.id, id))
      .returning();

    await logAuditEvent(
      session.user.id,
      "species.updated",
      "species",
      id,
      body,
    );

    return jsonResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
