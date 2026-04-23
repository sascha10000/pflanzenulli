import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { db } from "@/lib/db";
import { users } from "@/modules/users/schema";
import { desc, ilike, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const search = request.nextUrl.searchParams.get("q");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "50", 10);
    const offset = parseInt(request.nextUrl.searchParams.get("offset") ?? "0", 10);

    const conditions = search
      ? or(
          ilike(users.email!, `%${search}%`),
          ilike(users.displayName!, `%${search}%`),
        )
      : undefined;

    const results = await db.query.users.findMany({
      where: conditions,
      columns: {
        id: true,
        email: true,
        displayName: true,
        accountType: true,
        verificationStatus: true,
        role: true,
        countryCode: true,
        isBanned: true,
        createdAt: true,
        lastActivityAt: true,
      },
      with: { stats: true },
      limit,
      offset,
      orderBy: [desc(users.createdAt)],
    });

    return jsonResponse(results);
  } catch (error) {
    return errorResponse(error);
  }
}
