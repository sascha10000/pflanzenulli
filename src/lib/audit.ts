import { db } from "@/lib/db";
import { auditLogs } from "@/modules/admin/schema";

export async function logAuditEvent(
  actorUserId: string | null,
  action: string,
  targetEntityType?: string,
  targetEntityId?: string,
  metadata?: Record<string, unknown>,
) {
  await db.insert(auditLogs).values({
    actorUserId,
    action,
    targetEntityType: targetEntityType ?? null,
    targetEntityId: targetEntityId ?? null,
    metadataJson: metadata ?? null,
  });
}
