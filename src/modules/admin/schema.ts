import {
  pgTable,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { generateId } from "@/lib/uuid";
import { users } from "@/modules/users/schema";

// Append-only audit log
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    actorUserId: text("actor_user_id").references(() => users.id),
    action: text("action").notNull(),
    targetEntityType: text("target_entity_type"),
    targetEntityId: text("target_entity_id"),
    metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_actor_idx").on(table.actorUserId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_created_idx").on(table.createdAt),
  ],
);
