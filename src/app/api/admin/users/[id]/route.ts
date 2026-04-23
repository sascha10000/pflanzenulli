import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { db } from "@/lib/db";
import { users } from "@/modules/users/schema";
import { eq } from "drizzle-orm";
import { logAuditEvent } from "@/lib/audit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        commercialProfile: true,
        stats: true,
      },
    });

    return jsonResponse(user);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { action, reason, role } = body as {
      action?: "ban" | "unban";
      reason?: string;
      role?: "user" | "moderator" | "admin";
    };

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (action === "ban") {
      updates.isBanned = true;
      updates.banReason = reason ?? "Admin action";
      updates.bannedAt = new Date();
      await logAuditEvent(session.user.id, "user.banned", "user", id, {
        reason: reason ?? "",
      });
    } else if (action === "unban") {
      updates.isBanned = false;
      updates.banReason = null;
      updates.bannedAt = null;
      await logAuditEvent(session.user.id, "user.unbanned", "user", id);
    }

    if (role) {
      updates.role = role;
      await logAuditEvent(session.user.id, "user.role_changed", "user", id, {
        newRole: role,
      });
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();

    return jsonResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
