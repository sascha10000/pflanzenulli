/**
 * Central schema re-export. All module schemas are imported here
 * so Drizzle's relational query API has access to everything.
 *
 * Add new module schemas as they are created.
 */

// Module schemas will be re-exported here as they're built:
export * from "@/modules/users/schema";
export * from "@/modules/species/schema";
export * from "@/modules/listings/schema";
export * from "@/modules/transactions/schema";
export * from "@/modules/messages/schema";
export * from "@/modules/sprouts/schema";
export * from "@/modules/reviews/schema";
export * from "@/modules/wishlist/schema";
export * from "@/modules/reports/schema";
export * from "@/modules/subscriptions/schema";
export * from "@/modules/admin/schema";
