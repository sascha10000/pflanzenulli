import { eq, and, or, desc, sql, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { messageThreads, messages, encryptedAddresses } from "./schema";
import { transactions } from "@/modules/transactions/schema";
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/errors";
import { containsAddress, getAddressDetectionMessage } from "./address-detection";
import { encryptAddress, decryptAddress } from "@/lib/encryption";

export async function getOrCreateThread(
  userId1: string,
  userId2: string,
  listingId?: string,
) {
  // Normalize participant order for idempotency
  const sorted = [userId1, userId2].sort();
  const p1 = sorted[0]!;
  const p2 = sorted[1]!;

  const existing = await db.query.messageThreads.findFirst({
    where: and(
      eq(messageThreads.participant1Id, p1),
      eq(messageThreads.participant2Id, p2),
      listingId
        ? eq(messageThreads.listingId, listingId)
        : isNull(messageThreads.listingId),
    ),
  });

  if (existing) return existing;

  const [thread] = await db
    .insert(messageThreads)
    .values({
      participant1Id: p1,
      participant2Id: p2,
      listingId: listingId ?? null,
    })
    .returning();

  return thread;
}

export async function sendMessage(
  threadId: string,
  senderId: string,
  body: string,
  locale = "en",
) {
  const thread = await db.query.messageThreads.findFirst({
    where: eq(messageThreads.id, threadId),
  });

  if (!thread) throw new NotFoundError("Thread", threadId);
  if (
    thread.participant1Id !== senderId &&
    thread.participant2Id !== senderId
  ) {
    throw new ForbiddenError("You are not a participant in this thread");
  }

  // Block free-text addresses
  if (containsAddress(body)) {
    throw new ValidationError(getAddressDetectionMessage(locale));
  }

  const [message] = await db
    .insert(messages)
    .values({
      threadId,
      senderId,
      body,
      messageType: "text",
    })
    .returning();

  // Update thread last message timestamp
  await db
    .update(messageThreads)
    .set({ lastMessageAt: new Date() })
    .where(eq(messageThreads.id, threadId));

  return message;
}

export async function getThreadMessages(
  threadId: string,
  userId: string,
  limit = 50,
  offset = 0,
) {
  const thread = await db.query.messageThreads.findFirst({
    where: eq(messageThreads.id, threadId),
  });

  if (!thread) throw new NotFoundError("Thread", threadId);
  if (thread.participant1Id !== userId && thread.participant2Id !== userId) {
    throw new ForbiddenError("You are not a participant in this thread");
  }

  return db.query.messages.findMany({
    where: eq(messages.threadId, threadId),
    with: {
      sender: { columns: { id: true, displayName: true, image: true } },
    },
    limit,
    offset,
    orderBy: [desc(messages.createdAt)],
  });
}

export async function getUserThreads(userId: string) {
  return db.query.messageThreads.findMany({
    where: or(
      eq(messageThreads.participant1Id, userId),
      eq(messageThreads.participant2Id, userId),
    ),
    with: {
      participant1: { columns: { id: true, displayName: true, image: true } },
      participant2: { columns: { id: true, displayName: true, image: true } },
    },
    orderBy: [desc(messageThreads.lastMessageAt)],
  });
}

export async function markAsRead(threadId: string, userId: string) {
  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.threadId, threadId),
        sql`${messages.senderId} != ${userId}`,
        isNull(messages.readAt),
      ),
    );
}

// --- Structured address exchange ---

export async function shareAddress(
  transactionId: string,
  userId: string,
  addressData: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    recipientName: string;
  },
) {
  const tx = await db.query.transactions.findFirst({
    where: eq(transactions.id, transactionId),
  });

  if (!tx) throw new NotFoundError("Transaction", transactionId);
  if (tx.buyerId !== userId && tx.sellerId !== userId) {
    throw new ForbiddenError("You are not a party to this transaction");
  }

  const plaintext = JSON.stringify(addressData);
  const encrypted = encryptAddress(plaintext, transactionId);

  const deleteAfter = new Date();
  deleteAfter.setDate(deleteAfter.getDate() + 30);

  await db
    .insert(encryptedAddresses)
    .values({
      transactionId,
      userId,
      encryptedData: encrypted.ciphertext,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      deleteAfter,
    });

  // Check if both parties have shared — auto-advance transaction
  const shared = await db
    .select({ userId: encryptedAddresses.userId })
    .from(encryptedAddresses)
    .where(eq(encryptedAddresses.transactionId, transactionId));

  const bothShared =
    shared.some((s) => s.userId === tx.buyerId) &&
    shared.some((s) => s.userId === tx.sellerId);

  return { shared: true, bothPartiesShared: bothShared };
}

export async function getSharedAddress(
  transactionId: string,
  requestingUserId: string,
  targetUserId: string,
) {
  const tx = await db.query.transactions.findFirst({
    where: eq(transactions.id, transactionId),
  });

  if (!tx) throw new NotFoundError("Transaction", transactionId);
  if (tx.buyerId !== requestingUserId && tx.sellerId !== requestingUserId) {
    throw new ForbiddenError("You are not a party to this transaction");
  }

  const addr = await db.query.encryptedAddresses.findFirst({
    where: and(
      eq(encryptedAddresses.transactionId, transactionId),
      eq(encryptedAddresses.userId, targetUserId),
    ),
  });

  if (!addr) return null;

  const decrypted = decryptAddress(
    {
      ciphertext: addr.encryptedData,
      iv: addr.iv,
      authTag: addr.authTag,
    },
    transactionId,
  );

  return JSON.parse(decrypted);
}

export async function cleanupExpiredAddresses() {
  const now = new Date();
  const result = await db
    .delete(encryptedAddresses)
    .where(sql`${encryptedAddresses.deleteAfter} < ${now}`)
    .returning({ id: encryptedAddresses.id });

  return result.length;
}
