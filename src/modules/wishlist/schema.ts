import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { generateId } from "@/lib/uuid";
import { users } from "@/modules/users/schema";
import { species } from "@/modules/species/schema";

export const wishlists = pgTable(
  "wishlists",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    speciesId: text("species_id")
      .notNull()
      .references(() => species.id),
    maxPriceCents: integer("max_price_cents"),
    acceptCrossBorder: boolean("accept_cross_border").default(false).notNull(),
    notifyEnabled: boolean("notify_enabled").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("wishlists_user_idx").on(table.userId),
    index("wishlists_species_idx").on(table.speciesId),
  ],
);

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, { fields: [wishlists.userId], references: [users.id] }),
  species: one(species, {
    fields: [wishlists.speciesId],
    references: [species.id],
  }),
}));
