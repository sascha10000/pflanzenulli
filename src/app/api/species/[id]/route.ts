import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { getSpeciesById } from "@/modules/species/service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await getSpeciesById(id);
    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
