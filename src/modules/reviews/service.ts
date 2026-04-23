import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { reviews } from "./schema";
import { transactions } from "@/modules/transactions/schema";
import { NotFoundError, ValidationError, ConflictError } from "@/lib/errors";
import { getSproutsForReview, ANTI_GAMING } from "@/modules/sprouts/constants";
import {
  awardSprouts,
  getReviewTimeMultiplier,
} from "@/modules/sprouts/service";

export async function createReview(
  transactionId: string,
  reviewerId: string,
  rating: number,
  text: string | null,
  isPublic: boolean,
) {
  if (rating < 1 || rating > 5) {
    throw new ValidationError("Rating must be between 1 and 5");
  }

  const tx = await db.query.transactions.findFirst({
    where: eq(transactions.id, transactionId),
  });

  if (!tx) throw new NotFoundError("Transaction", transactionId);

  // Must be a participant
  if (tx.buyerId !== reviewerId && tx.sellerId !== reviewerId) {
    throw new ValidationError("You are not a party to this transaction");
  }

  // Transaction must be in received_confirmed or completed state
  if (tx.state !== "received_confirmed" && tx.state !== "completed") {
    throw new ValidationError(
      "Transaction must be confirmed before you can leave a review",
    );
  }

  // Check if already reviewed
  const existing = await db.query.reviews.findFirst({
    where: and(
      eq(reviews.transactionId, transactionId),
      eq(reviews.reviewerId, reviewerId),
    ),
  });

  if (existing) {
    throw new ConflictError("You have already reviewed this transaction");
  }

  // Determine who is being reviewed
  const reviewedId =
    reviewerId === tx.buyerId ? tx.sellerId : tx.buyerId;

  const [review] = await db
    .insert(reviews)
    .values({
      transactionId,
      reviewerId,
      reviewedId,
      rating,
      text,
      isPublic,
    })
    .returning();

  // Award sprouts to the reviewed user (if public review)
  if (isPublic) {
    const baseSprouts = getSproutsForReview(rating);
    if (baseSprouts > 0) {
      const timeMultiplier = getReviewTimeMultiplier(
        tx.completedAt ?? tx.updatedAt,
      );
      const finalAmount = Math.round(baseSprouts * timeMultiplier);
      await awardSprouts(
        reviewedId,
        finalAmount,
        `review_received_${rating}star`,
        "review",
        review!.id,
      );
    }
  }

  return review;
}

export async function getReviewsForUser(
  userId: string,
  limit = 20,
  offset = 0,
) {
  return db.query.reviews.findMany({
    where: and(eq(reviews.reviewedId, userId), eq(reviews.isPublic, true)),
    with: {
      reviewer: { columns: { id: true, displayName: true, image: true } },
    },
    limit,
    offset,
    orderBy: [desc(reviews.createdAt)],
  });
}
