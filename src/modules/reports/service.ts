import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { reports } from "./schema";
import { NotFoundError } from "@/lib/errors";
import { logAuditEvent } from "@/lib/audit";

export async function createReport(
  reporterUserId: string | null,
  targetEntityType: "user" | "listing" | "message",
  targetEntityId: string,
  reasonCode: string,
  description: string,
) {
  const [report] = await db
    .insert(reports)
    .values({
      reporterUserId,
      targetEntityType,
      targetEntityId,
      reasonCode,
      description,
    })
    .returning();

  await logAuditEvent(
    reporterUserId,
    "report.created",
    "report",
    report!.id,
    { targetEntityType, targetEntityId, reasonCode },
  );

  return report;
}

export async function updateReportStatus(
  reportId: string,
  adminId: string,
  newStatus: "under_review" | "resolved" | "rejected",
  notes?: string,
) {
  const existing = await db.query.reports.findFirst({
    where: eq(reports.id, reportId),
  });

  if (!existing) throw new NotFoundError("Report", reportId);

  const [updated] = await db
    .update(reports)
    .set({
      status: newStatus,
      resolutionNotes: notes ?? existing.resolutionNotes,
      assignedAdminId: adminId,
      resolvedAt:
        newStatus === "resolved" || newStatus === "rejected"
          ? new Date()
          : null,
    })
    .where(eq(reports.id, reportId))
    .returning();

  await logAuditEvent(adminId, `report.${newStatus}`, "report", reportId, {
    notes: notes ?? "",
  });

  return updated;
}

export async function getReportsQueue(
  status?: string,
  limit = 20,
  offset = 0,
) {
  const conditions = status
    ? eq(reports.status, status as typeof reports.status.enumValues[number])
    : undefined;

  return db.query.reports.findMany({
    where: conditions,
    with: {
      reporter: { columns: { id: true, displayName: true } },
    },
    limit,
    offset,
    orderBy: [desc(reports.createdAt)],
  });
}
