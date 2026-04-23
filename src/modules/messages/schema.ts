import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { generateId } from "@/lib/uuid";
import { users } from "@/modules/users/schema";
import { listings } from "@/modules/listings/schema";
import { transactions } from "@/modules/transactions/schema";

export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "address_request",
  "address_reveal",
  "system",
]);

export const messageThreads = pgTable(
  "message_threads",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    participant1Id: text("participant1_id")
      .notNull()
      .references(() => users.id),
    participant2Id: text("participant2_id")
      .notNull()
      .references(() => users.id),
    listingId: text("listing_id").references(() => listings.id),
    transactionId: text("transaction_id").references(() => transactions.id),
    lastMessageAt: timestamp("last_message_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("message_threads_p1_idx").on(table.participant1Id),
    index("message_threads_p2_idx").on(table.participant2Id),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    threadId: text("thread_id")
      .notNull()
      .references(() => messageThreads.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    messageType: messageTypeEnum("message_type").default("text").notNull(),
    readAt: timestamp("read_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("messages_thread_idx").on(table.threadId),
    index("messages_sender_idx").on(table.senderId),
  ],
);

export const encryptedAddresses = pgTable("encrypted_addresses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  transactionId: text("transaction_id")
    .notNull()
    .references(() => transactions.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  encryptedData: text("encrypted_data").notNull(),
  iv: text("iv").notNull(),
  authTag: text("auth_tag").notNull(),
  sharedAt: timestamp("shared_at", { mode: "date" }).defaultNow().notNull(),
  deleteAfter: timestamp("delete_after", { mode: "date" }).notNull(),
});

// --- Relations ---

export const messageThreadsRelations = relations(
  messageThreads,
  ({ one, many }) => ({
    participant1: one(users, {
      fields: [messageThreads.participant1Id],
      references: [users.id],
      relationName: "threadParticipant1",
    }),
    participant2: one(users, {
      fields: [messageThreads.participant2Id],
      references: [users.id],
      relationName: "threadParticipant2",
    }),
    messages: many(messages),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  thread: one(messageThreads, {
    fields: [messages.threadId],
    references: [messageThreads.id],
  }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));
