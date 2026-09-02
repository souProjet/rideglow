import { NextResponse } from "next/server";
import { SKUS } from "@/lib/catalog";
import { soldOut, stockLevels } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Availability for the configurator, which is prerendered per locale and so
 * cannot read this at build time. Advisory only: `/api/checkout` reads the same
 * table again before it opens a session, because a tab can sit open for a day.
 */
export async function GET() {
  try {
    return NextResponse.json({ soldOut: soldOut(await stockLevels(), SKUS) });
  } catch (error) {
    // A database outage must not close the shop. The checkout route makes the
    // same call and the same choice, so the worst case is an oversell, which
    // the back office shows as a negative count.
    console.error("[stock] levels unavailable", error);
    return NextResponse.json({ soldOut: [] });
  }
}
