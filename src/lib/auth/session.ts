import { auth } from "@/modules/auth/config";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

export async function getSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session;
}

export async function requireCommercial() {
  const session = await requireAuth();
  if (session.user.accountType !== "commercial") {
    throw new ForbiddenError("Commercial account required");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "admin") {
    throw new ForbiddenError("Admin access required");
  }
  return session;
}

export async function requireModerator() {
  const session = await requireAuth();
  if (session.user.role !== "admin" && session.user.role !== "moderator") {
    throw new ForbiddenError("Moderator access required");
  }
  return session;
}
