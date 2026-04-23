import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { generateId } from "@/lib/uuid";
import { users } from "@/modules/users/schema";
import { species } from "@/modules/species/schema";

export const listingCategoryEnum = pgEnum("listing_category", [
  "plant",
  "cutting",
  "seed",
  "accessory",
]);

export const listingStatusEnum = pgEnum("listing_status", [
  "draft",
  "active",
  "reserved",
  "sold",
  "expired",
  "withdrawn",
  "hidden_by_moderation",
]);

export const quantityUnitEnum = pgEnum("quantity_unit", [
  "pieces",
  "grams",
  "ml",
]);

export const listings = pgTable(
  "listings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    speciesId: text("species_id").references(() => species.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: listingCategoryEnum("category").notNull(),
    conditionNotes: text("condition_notes"),
    priceCents: integer("price_cents").notNull(),
    currency: text("currency").default("EUR").notNull(),
    isTradeable: boolean("is_tradeable").default(false).notNull(),
    quantityAvailable: integer("quantity_available").default(1).notNull(),
    quantityUnit: quantityUnitEnum("quantity_unit").default("pieces").notNull(),
    status: listingStatusEnum("status").default("active").notNull(),
    countryCode: text("country_code").notNull(),
    locationGeohash: text("location_geohash"),
    crossBorderEligible: boolean("cross_border_eligible")
      .default(false)
      .notNull(),
    plantAttributes: jsonb("plant_attributes").$type<{
      potSize?: string;
      isRooted?: boolean;
      variegationPct?: number;
      ageMonths?: number;
      height?: string;
    }>(),
    viewCount: integer("view_count").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }),
  },
  (table) => [
    index("listings_user_idx").on(table.userId),
    index("listings_species_idx").on(table.speciesId),
    index("listings_status_idx").on(table.status),
    index("listings_category_idx").on(table.category),
    index("listings_country_idx").on(table.countryCode),
    index("listings_created_idx").on(table.createdAt),
  ],
);

export const listingPhotos = pgTable(
  "listing_photos",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
    width: integer("width"),
    height: integer("height"),
    altTextI18n: jsonb("alt_text_i18n").$type<Record<string, string>>(),
  },
  (table) => [index("listing_photos_listing_idx").on(table.listingId)],
);

// --- Relations ---

export const listingsRelations = relations(listings, ({ one, many }) => ({
  user: one(users, { fields: [listings.userId], references: [users.id] }),
  species: one(species, {
    fields: [listings.speciesId],
    references: [species.id],
  }),
  photos: many(listingPhotos),
}));

export const listingPhotosRelations = relations(listingPhotos, ({ one }) => ({
  listing: one(listings, {
    fields: [listingPhotos.listingId],
    references: [listings.id],
  }),
}));
