import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { handlePaddleWebhook } from "@/modules/subscriptions/service";

export async function POST(request: NextRequest) {
  try {
    // TODO: Validate Paddle webhook signature in production
    const body = await request.json();

    await handlePaddleWebhook(body);
    return jsonResponse({ received: true });
  } catch (error) {
    return errorResponse(error);
  }
}
