import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/api-response";
import { getUserSproutTotal } from "@/modules/sprouts/service";
import { getUserBadges } from "@/modules/sprouts/service";
import { calculateLevel, getLevelTitle } from "@/modules/sprouts/constants";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const [total, userBadges] = await Promise.all([
      getUserSproutTotal(id),
      getUserBadges(id),
    ]);

    const level = calculateLevel(total);

    return jsonResponse({
      sproutTotal: total,
      level,
      levelTitle: {
        en: getLevelTitle(level, "en"),
        de: getLevelTitle(level, "de"),
      },
      badges: userBadges,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
