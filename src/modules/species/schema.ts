import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { generateId } from "@/lib/uuid";

export const species = pgTable(
  "species",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    scientificName: text("scientific_name").unique().notNull(),
    family: text("family").notNull(),
    genus: text("genus").notNull(),
    gbifId: text("gbif_id"),
    crossBorderAllowed: boolean("cross_border_allowed")
      .default(false)
      .notNull(),
    isProtectedVariety: boolean("is_protected_variety")
      .default(false)
      .notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("species_genus_idx").on(table.genus),
    index("species_family_idx").on(table.family),
  ],
);

export const speciesCommonNames = pgTable(
  "species_common_names",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    speciesId: text("species_id")
      .notNull()
      .references(() => species.id, { onDelete: "cascade" }),
    languageCode: text("language_code").notNull(), // ISO 639-1
    name: text("name").notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
  },
  (table) => [
    index("species_common_names_species_idx").on(table.speciesId),
    index("species_common_names_lang_idx").on(
      table.speciesId,
      table.languageCode,
    ),
  ],
);

// --- Relations ---

export const speciesRelations = relations(species, ({ many }) => ({
  commonNames: many(speciesCommonNames),
}));

export const speciesCommonNamesRelations = relations(
  speciesCommonNames,
  ({ one }) => ({
    species: one(species, {
      fields: [speciesCommonNames.speciesId],
      references: [species.id],
    }),
  }),
);
