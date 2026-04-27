/**
 * BullMQ Worker entry point.
 *
 * Run as a separate process in production:
 *   pnpm tsx src/workers/index.ts
 *
 * Queues:
 * - listing-expiry: daily job to expire old listings
 * - address-cleanup: daily job to delete expired encrypted addresses
 * - search-index: index/deindex listings in Meilisearch
 * - email: send transactional emails
 * - sprouts: process sprout awards
 */

import "dotenv/config";
import { Worker, Queue } from "bullmq";
import { getRedis } from "@/lib/redis";
import { expireOldListings } from "@/modules/listings/service";
import { cleanupExpiredAddresses } from "@/modules/messages/service";
import { sendEmail } from "@/lib/email";
import { indexListing, removeListing } from "@/modules/listings/search";

const connection = getRedis();

// --- Listing Expiry Worker ---
new Worker(
  "listing-expiry",
  async () => {
    const count = await expireOldListings();
    console.log(`[listing-expiry] Expired ${count} listings`);
  },
  { connection },
);

// --- Address Cleanup Worker ---
new Worker(
  "address-cleanup",
  async () => {
    const count = await cleanupExpiredAddresses();
    console.log(`[address-cleanup] Deleted ${count} expired addresses`);
  },
  { connection },
);

// --- Email Worker ---
new Worker(
  "email",
  async (job) => {
    const { to, subject, html } = job.data as {
      to: string;
      subject: string;
      html: string;
    };
    await sendEmail({ to, subject, html });
    console.log(`[email] Sent to ${to}: ${subject}`);
  },
  { connection },
);

// --- Search Index Worker ---
new Worker(
  "search-index",
  async (job) => {
    const { action, document } = job.data as {
      action: "index" | "remove";
      document: Record<string, unknown>;
    };

    if (action === "index") {
      await indexListing(document as unknown as Parameters<typeof indexListing>[0]);
    } else {
      await removeListing(document.id as string);
    }

    console.log(`[search-index] ${action}: ${document.id}`);
  },
  { connection },
);

// --- Schedule repeating jobs ---
async function scheduleRepeatingJobs() {
  const expiryQueue = new Queue("listing-expiry", { connection });
  await expiryQueue.upsertJobScheduler("daily-expiry", {
    pattern: "0 3 * * *", // 3 AM daily
  });

  const cleanupQueue = new Queue("address-cleanup", { connection });
  await cleanupQueue.upsertJobScheduler("daily-cleanup", {
    pattern: "0 4 * * *", // 4 AM daily
  });

  console.log("[workers] Repeating jobs scheduled");
}

scheduleRepeatingJobs().catch(console.error);

console.log("[workers] All workers started");
