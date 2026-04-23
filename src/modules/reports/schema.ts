import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { generateId } from "@/lib/uuid";
import { users } from "@/modules/users/schema";

export const reportTargetTypeEnum = pgEnum("report_target_type", [
  "user",
  "listing",
  "message",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "under_review",
  "resolved",
  "rejected",
]);

export const reports = pgTable(
  "reports",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    reporterUserId: text("reporter_user_id").references(() => users.id),
    targetEntityType: reportTargetTypeEnum("target_entity_type").notNull(),
    targetEntityId: text("target_entity_id").notNull(),
    reasonCode: text("reason_code").notNull(),
    description: text("description").notNull(),
    status: reportStatusEnum("status").default("open").notNull(),
    resolutionNotes: text("resolution_notes"),
    assignedAdminId: text("assigned_admin_id").references(() => users.id),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at", { mode: "date" }),
  },
  (table) => [
    index("reports_status_idx").on(table.status),
    index("reports_target_idx").on(table.targetEntityType, table.targetEntityId),
  ],
);

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterUserId],
    references: [users.id],
    relationName: "reportsMade",
  }),
  assignedAdmin: one(users, {
    fields: [reports.assignedAdminId],
    references: [users.id],
    relationName: "reportsAssigned",
  }),
}));
