import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import {
  getThreadMessages,
  sendMessage,
  markAsRead,
} from "@/modules/messages/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const session = await requireAuth();
    const { threadId } = await params;

    // Mark messages as read on fetch
    await markAsRead(threadId, session.user.id);

    const msgs = await getThreadMessages(threadId, session.user.id);
    return jsonResponse(msgs);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const session = await requireAuth();
    const { threadId } = await params;
    const body = await request.json();
    const { message: text } = body as { message: string };

    const msg = await sendMessage(threadId, session.user.id, text);
    return jsonResponse(msg, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
