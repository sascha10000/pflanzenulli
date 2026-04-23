import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  integer,
  real,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { generateId } from "@/lib/uuid";

// --- Enums ---

export const accountTypeEnum = pgEnum("account_type", [
  "private",
  "commercial",
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "unverified",
  "email_verified",
  "id_verified",
  "commercial_verified",
]);

export const userRoleEnum = pgEnum("user_role", [
  "user",
  "moderator",
  "admin",
]);

// --- Auth.js required tables ---

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateId()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),

  // Extended fields for Pflanzenulli
  displayName: text("display_name"),
  accountType: accountTypeEnum("account_type").default("private").notNull(),
  verificationStatus: verificationStatusEnum("verification_status")
    .default("unverified")
    .notNull(),
  role: userRoleEnum("role").default("user").notNull(),
  countryCode: text("country_code"), // ISO 3166-1 alpha-2
  preferredLanguage: text("preferred_language").default("en"),
  locationGeohash: text("location_geohash"),
  postalCode: text("postal_code"),
  bio: text("bio"),
  isBanned: boolean("is_banned").default(false).notNull(),
  banReason: text("ban_reason"),
  bannedAt: timestamp("banned_at", { mode: "date" }),
  gdprConsentAt: timestamp("gdpr_consent_at", { mode: "date" }),
  tosAcceptedAt: timestamp("tos_accepted_at", { mode: "date" }),
  tosVersion: text("tos_version"),
  onboardingCompleted: boolean("onboarding_completed")
    .default(false)
    .notNull(),
  lastActivityAt: timestamp("last_activity_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

// --- Commercial profile ---

export const commercialProfiles = pgTable("commercial_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  legalName: text("legal_name").notNull(),
  legalForm: text("legal_form"), // GmbH, UG, Sole Trader, etc.
  registeredAddress: text("registered_address").notNull(),
  vatId: text("vat_id"),
  imprintHtml: text("imprint_html"),
  revocationPolicyHtml: text("revocation_policy_html"),
  companyRegisterId: text("company_register_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// --- User stats (cache table) ---

export const userStats = pgTable("user_stats", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  sproutTotal: integer("sprout_total").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  transactionsCompleted: integer("transactions_completed").default(0).notNull(),
  reviewsReceivedCount: integer("reviews_received_count").default(0).notNull(),
  reviewsAverageRating: real("reviews_average_rating"),
  recomputedAt: timestamp("recomputed_at", { mode: "date" })
    .defaultNow()
    .notNull(),
});

// --- Relations ---

export const usersRelations = relations(users, ({ one, many }) => ({
  commercialProfile: one(commercialProfiles, {
    fields: [users.id],
    references: [commercialProfiles.userId],
  }),
  stats: one(userStats, {
    fields: [users.id],
    references: [userStats.userId],
  }),
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const commercialProfilesRelations = relations(
  commercialProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [commercialProfiles.userId],
      references: [users.id],
    }),
  }),
);

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, { fields: [userStats.userId], references: [users.id] }),
}));
