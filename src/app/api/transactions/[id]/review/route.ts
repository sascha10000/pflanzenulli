import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { createReview } from "@/modules/reviews/service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { rating, text, isPublic } = body as {
      rating: number;
      text?: string;
      isPublic?: boolean;
    };

    const review = await createReview(
      id,
      session.user.id,
      rating,
      text ?? null,
      isPublic ?? true,
    );
    return jsonResponse(review, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
