import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { getReviewsForUser } from "@/modules/reviews/service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const reviews = await getReviewsForUser(id);
    return jsonResponse(reviews);
  } catch (error) {
    return errorResponse(error);
  }
}
