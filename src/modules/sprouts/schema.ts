import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { generateId } from "@/lib/uuid";
import { users } from "@/modules/users/schema";

// Append-only ledger — never update or delete
export const sproutLedger = pgTable(
  "sprout_ledger",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    amount: integer("amount").notNull(), // positive = earned
    reasonCode: text("reason_code").notNull(),
    referenceEntityType: text("reference_entity_type"),
    referenceEntityId: text("reference_entity_id"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("sprout_ledger_user_idx").on(table.userId),
    index("sprout_ledger_created_idx").on(table.createdAt),
  ],
);

export const badges = pgTable("badges", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  slug: text("slug").unique().notNull(),
  nameI18n: jsonb("name_i18n").$type<Record<string, string>>().notNull(),
  descriptionI18n: jsonb("description_i18n")
    .$type<Record<string, string>>()
    .notNull(),
  iconUrl: text("icon_url"),
  criteriaJson: jsonb("criteria_json").$type<Record<string, unknown>>(),
});

export const userBadges = pgTable(
  "user_badges",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    badgeId: text("badge_id")
      .notNull()
      .references(() => badges.id),
    awardedAt: timestamp("awarded_at", { mode: "date" }).defaultNow().notNull(),
    evidenceRef: text("evidence_ref"),
  },
  (table) => [index("user_badges_user_idx").on(table.userId)],
);

// --- Relations ---

export const sproutLedgerRelations = relations(sproutLedger, ({ one }) => ({
  user: one(users, {
    fields: [sproutLedger.userId],
    references: [users.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, { fields: [userBadges.userId], references: [users.id] }),
  badge: one(badges, { fields: [userBadges.badgeId], references: [badges.id] }),
}));
