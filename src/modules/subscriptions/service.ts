import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscriptions } from "./schema";
import type { SubscriptionTier } from "@/lib/feature-flags";

export async function getUserSubscription(userId: string) {
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });

  if (!sub) {
    return { tier: "free" as SubscriptionTier, status: "active" as const };
  }

  return sub;
}

export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const sub = await getUserSubscription(userId);
  return (sub.tier ?? "free") as SubscriptionTier;
}

/**
 * Handle Paddle webhook events.
 * In production, validate the webhook signature first.
 */
export async function handlePaddleWebhook(event: {
  event_type: string;
  data: Record<string, unknown>;
}) {
  switch (event.event_type) {
    case "subscription.created": {
      const data = event.data as {
        id: string;
        customer_id: string;
        custom_data?: { user_id?: string };
        items: Array<{ price: { product_id: string } }>;
        current_billing_period: { starts_at: string; ends_at: string };
      };

      const userId = data.custom_data?.user_id;
      if (!userId) return;

      const tier = mapProductToTier(
        data.items[0]?.price.product_id ?? "",
      );

      await db.insert(subscriptions).values({
        userId,
        paddleSubscriptionId: data.id,
        paddleCustomerId: data.customer_id,
        tier,
        status: "active",
        currentPeriodStart: new Date(data.current_billing_period.starts_at),
        currentPeriodEnd: new Date(data.current_billing_period.ends_at),
      });
      break;
    }

    case "subscription.updated": {
      const data = event.data as {
        id: string;
        status: string;
        current_billing_period?: { starts_at: string; ends_at: string };
      };

      const updates: Record<string, unknown> = {
        status: mapPaddleStatus(data.status),
        updatedAt: new Date(),
      };

      if (data.current_billing_period) {
        updates.currentPeriodStart = new Date(
          data.current_billing_period.starts_at,
        );
        updates.currentPeriodEnd = new Date(
          data.current_billing_period.ends_at,
        );
      }

      await db
        .update(subscriptions)
        .set(updates)
        .where(eq(subscriptions.paddleSubscriptionId, data.id));
      break;
    }

    case "subscription.cancelled": {
      const data = event.data as { id: string };
      await db
        .update(subscriptions)
        .set({
          status: "cancelled",
          cancelledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.paddleSubscriptionId, data.id));
      break;
    }
  }
}

function mapProductToTier(productId: string): "free" | "plus" | "pro" {
  // Map Paddle product IDs to tiers -- configure via env vars in production
  const plusProductId = process.env.PADDLE_PLUS_PRODUCT_ID;
  const proProductId = process.env.PADDLE_PRO_PRODUCT_ID;

  if (productId === proProductId) return "pro";
  if (productId === plusProductId) return "plus";
  return "free";
}

function mapPaddleStatus(
  status: string,
): "active" | "past_due" | "cancelled" | "paused" {
  switch (status) {
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "cancelled";
    case "paused":
      return "paused";
    default:
      return "active";
  }
}
