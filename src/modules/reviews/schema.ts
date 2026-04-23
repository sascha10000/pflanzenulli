import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { generateId } from "@/lib/uuid";
import { users } from "@/modules/users/schema";
import { transactions } from "@/modules/transactions/schema";

export const reviews = pgTable(
  "reviews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    transactionId: text("transaction_id")
      .notNull()
      .references(() => transactions.id),
    reviewerId: text("reviewer_id")
      .notNull()
      .references(() => users.id),
    reviewedId: text("reviewed_id")
      .notNull()
      .references(() => users.id),
    rating: integer("rating").notNull(), // 1-5
    text: text("text"),
    isPublic: boolean("is_public").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    unique("reviews_tx_reviewer").on(table.transactionId, table.reviewerId),
    index("reviews_reviewed_idx").on(table.reviewedId),
  ],
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  transaction: one(transactions, {
    fields: [reviews.transactionId],
    references: [transactions.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: "reviewsWritten",
  }),
  reviewed: one(users, {
    fields: [reviews.reviewedId],
    references: [users.id],
    relationName: "reviewsReceived",
  }),
}));
