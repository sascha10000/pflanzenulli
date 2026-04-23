import { eq, and, or, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { transactions, tradeOffers } from "./schema";
import { listings } from "@/modules/listings/schema";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
  ConflictError,
} from "@/lib/errors";
import {
  transition,
  type TransactionEvent,
  type ActorRole,
  type SideEffect,
} from "./state-machine";

export async function initiateTransaction(
  buyerId: string,
  listingId: string,
  transactionType: "buy" | "trade",
  tradeOfferId?: string,
) {
  const listing = await db.query.listings.findFirst({
    where: eq(listings.id, listingId),
  });

  if (!listing) throw new NotFoundError("Listing", listingId);
  if (listing.status !== "active")
    throw new ValidationError("Listing is not available");
  if (listing.userId === buyerId)
    throw new ValidationError("You cannot buy your own listing");

  // Reserve the listing
  await db
    .update(listings)
    .set({ status: "reserved", updatedAt: new Date() })
    .where(eq(listings.id, listingId));

  const [tx] = await db
    .insert(transactions)
    .values({
      listingId,
      buyerId,
      sellerId: listing.userId,
      transactionType,
      state: "pending_acceptance",
      priceCentsAtPurchase: listing.priceCents,
      tradeOfferId: tradeOfferId ?? null,
      stateHistory: [
        {
          state: "pending_acceptance",
          timestamp: new Date().toISOString(),
          actorId: buyerId,
        },
      ],
    })
    .returning();

  return tx;
}

export async function advanceTransaction(
  transactionId: string,
  event: TransactionEvent,
  actorId: string,
) {
  const tx = await db.query.transactions.findFirst({
    where: eq(transactions.id, transactionId),
  });

  if (!tx) throw new NotFoundError("Transaction", transactionId);

  // Determine actor role
  let actorRole: ActorRole;
  if (actorId === tx.buyerId) actorRole = "buyer";
  else if (actorId === tx.sellerId) actorRole = "seller";
  else actorRole = "admin"; // TODO: verify admin role

  const context = {
    transactionId: tx.id,
    listingId: tx.listingId,
    buyerId: tx.buyerId,
    sellerId: tx.sellerId,
    transactionType: tx.transactionType,
  };

  const result = transition(tx.state, event, actorRole, context);

  const newHistory = [
    ...(tx.stateHistory ?? []),
    {
      state: result.newState,
      timestamp: new Date().toISOString(),
      actorId,
    },
  ];

  const [updated] = await db
    .update(transactions)
    .set({
      state: result.newState,
      stateHistory: newHistory,
      updatedAt: new Date(),
      completedAt:
        result.newState === "completed" ? new Date() : tx.completedAt,
    })
    .where(eq(transactions.id, transactionId))
    .returning();

  // Process side effects asynchronously
  await processSideEffects(result.sideEffects);

  return updated;
}

async function processSideEffects(effects: SideEffect[]) {
  for (const effect of effects) {
    switch (effect.type) {
      case "UPDATE_LISTING_STATUS":
        await db
          .update(listings)
          .set({
            status: effect.status as typeof listings.status.enumValues[number],
            updatedAt: new Date(),
          })
          .where(eq(listings.id, effect.listingId));
        break;
      case "AWARD_SPROUTS":
        // Will be implemented in M6 (Sprouts module)
        break;
      case "SEND_NOTIFICATION":
        // Will be implemented in M10 (Email module)
        break;
      case "SCHEDULE_ADDRESS_DELETION":
        // Will be implemented in M5 (Messaging module)
        break;
      case "LOG_AUDIT":
        // Will be implemented in M7 (Audit log)
        break;
    }
  }
}

export async function getTransaction(transactionId: string, userId: string) {
  const tx = await db.query.transactions.findFirst({
    where: eq(transactions.id, transactionId),
    with: {
      listing: true,
      buyer: {
        columns: { id: true, displayName: true, image: true, accountType: true },
      },
      seller: {
        columns: { id: true, displayName: true, image: true, accountType: true },
      },
    },
  });

  if (!tx) throw new NotFoundError("Transaction", transactionId);
  if (tx.buyerId !== userId && tx.sellerId !== userId) {
    throw new ForbiddenError("You are not a party to this transaction");
  }

  return tx;
}

export async function getUserTransactions(
  userId: string,
  state?: string,
  limit = 20,
  offset = 0,
) {
  const conditions = [
    or(eq(transactions.buyerId, userId), eq(transactions.sellerId, userId)),
  ];

  if (state) {
    conditions.push(
      eq(
        transactions.state,
        state as typeof transactions.state.enumValues[number],
      ),
    );
  }

  return db.query.transactions.findMany({
    where: and(...conditions),
    with: {
      listing: { columns: { id: true, title: true } },
    },
    limit,
    offset,
    orderBy: [desc(transactions.createdAt)],
  });
}

// --- Trade offers ---

export async function createTradeOffer(
  userId: string,
  listingId: string,
  offeredItems: Array<{ type: "listing" | "freetext"; value: string }>,
  message?: string,
) {
  const listing = await db.query.listings.findFirst({
    where: eq(listings.id, listingId),
  });

  if (!listing) throw new NotFoundError("Listing", listingId);
  if (!listing.isTradeable)
    throw new ValidationError("This listing does not accept trades");
  if (listing.userId === userId)
    throw new ValidationError("You cannot make a trade offer on your own listing");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const [offer] = await db
    .insert(tradeOffers)
    .values({
      listingId,
      offeringUserId: userId,
      offeredItems,
      message: message ?? null,
      status: "pending",
      expiresAt,
    })
    .returning();

  return offer;
}

export async function respondToTradeOffer(
  offerId: string,
  sellerId: string,
  action: "accept" | "reject",
) {
  const offer = await db.query.tradeOffers.findFirst({
    where: eq(tradeOffers.id, offerId),
    with: { listing: true },
  });

  if (!offer) throw new NotFoundError("TradeOffer", offerId);
  if (offer.listing.userId !== sellerId)
    throw new ForbiddenError("Only the listing owner can respond to offers");
  if (offer.status !== "pending")
    throw new ConflictError("This offer has already been responded to");

  const [updated] = await db
    .update(tradeOffers)
    .set({ status: action === "accept" ? "accepted" : "rejected" })
    .where(eq(tradeOffers.id, offerId))
    .returning();

  // If accepted, auto-create a transaction
  if (action === "accept") {
    await initiateTransaction(
      offer.offeringUserId,
      offer.listingId,
      "trade",
      offer.id,
    );
  }

  return updated;
}
