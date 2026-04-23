import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { getAllSpecies } from "@/modules/species/service";
import { db } from "@/lib/db";
import { species } from "@/modules/species/schema";
import { logAuditEvent } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const limit = parseInt(
      request.nextUrl.searchParams.get("limit") ?? "100",
      10,
    );
    const results = await getAllSpecies(limit);
    return jsonResponse(results);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { scientificName, family, genus, crossBorderAllowed } = body as {
      scientificName: string;
      family: string;
      genus: string;
      crossBorderAllowed: boolean;
    };

    const [created] = await db
      .insert(species)
      .values({ scientificName, family, genus, crossBorderAllowed })
      .returning();

    await logAuditEvent(
      session.user.id,
      "species.created",
      "species",
      created!.id,
    );

    return jsonResponse(created, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
