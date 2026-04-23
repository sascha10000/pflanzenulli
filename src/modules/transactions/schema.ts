import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { generateId } from "@/lib/uuid";
import { users } from "@/modules/users/schema";
import { listings } from "@/modules/listings/schema";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "buy",
  "trade",
]);

export const transactionStateEnum = pgEnum("transaction_state", [
  "pending_acceptance",
  "accepted",
  "address_exchanged",
  "shipping_claimed",
  "received_confirmed",
  "completed",
  "disputed",
  "cancelled",
  "expired",
]);

export const tradeOfferStatusEnum = pgEnum("trade_offer_status", [
  "pending",
  "accepted",
  "rejected",
  "expired",
  "withdrawn",
]);

export const transactions = pgTable(
  "transactions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => users.id),
    sellerId: text("seller_id")
      .notNull()
      .references(() => users.id),
    transactionType: transactionTypeEnum("transaction_type").notNull(),
    state: transactionStateEnum("state")
      .default("pending_acceptance")
      .notNull(),
    priceCentsAtPurchase: integer("price_cents_at_purchase").notNull(),
    tradeOfferId: text("trade_offer_id"),
    stateHistory: jsonb("state_history")
      .$type<Array<{ state: string; timestamp: string; actorId: string }>>()
      .default([])
      .notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { mode: "date" }),
  },
  (table) => [
    index("transactions_buyer_idx").on(table.buyerId),
    index("transactions_seller_idx").on(table.sellerId),
    index("transactions_listing_idx").on(table.listingId),
    index("transactions_state_idx").on(table.state),
  ],
);

export const tradeOffers = pgTable(
  "trade_offers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id),
    offeringUserId: text("offering_user_id")
      .notNull()
      .references(() => users.id),
    offeredItems: jsonb("offered_items")
      .$type<Array<{ type: "listing" | "freetext"; value: string }>>()
      .notNull(),
    message: text("message"),
    status: tradeOfferStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }),
  },
  (table) => [
    index("trade_offers_listing_idx").on(table.listingId),
    index("trade_offers_user_idx").on(table.offeringUserId),
  ],
);

// --- Relations ---

export const transactionsRelations = relations(transactions, ({ one }) => ({
  listing: one(listings, {
    fields: [transactions.listingId],
    references: [listings.id],
  }),
  buyer: one(users, {
    fields: [transactions.buyerId],
    references: [users.id],
    relationName: "buyer",
  }),
  seller: one(users, {
    fields: [transactions.sellerId],
    references: [users.id],
    relationName: "seller",
  }),
}));

export const tradeOffersRelations = relations(tradeOffers, ({ one }) => ({
  listing: one(listings, {
    fields: [tradeOffers.listingId],
    references: [listings.id],
  }),
  offeringUser: one(users, {
    fields: [tradeOffers.offeringUserId],
    references: [users.id],
  }),
}));
