import { requireAuth } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { getUserSubscription } from "@/modules/subscriptions/service";
import { getEffectiveTierConfig, type SubscriptionTier } from "@/lib/feature-flags";

export async function GET() {
  try {
    const session = await requireAuth();
    const subscription = await getUserSubscription(session.user.id);
    const tier = (subscription.tier ?? "free") as SubscriptionTier;
    const effectiveConfig = getEffectiveTierConfig(tier);

    return jsonResponse({
      subscription,
      effectiveConfig,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
