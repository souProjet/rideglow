import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import {
  getAddon,
  getBike,
  getKit,
  isAddonId,
  isBikeId,
  isKitId,
  priceCart,
  SHIPPING_COUNTRIES,
  skusForSelection,
  summarizeBuild,
} from "@/lib/catalog";
import { soldOut, stockLevels } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const { bikeId, kitId, locale } = payload;
  const addonIds = Array.isArray(payload.addonIds) ? payload.addonIds : [];

  // The client sends identifiers only. Prices come from the catalog on this
  // side, so a tampered payload can change the order but never the amount.
  if (!isBikeId(bikeId) || !isKitId(kitId) || !isLocale(locale)) {
    return NextResponse.json({ error: "Invalid selection" }, { status: 400 });
  }
  if (!addonIds.every(isAddonId)) {
    return NextResponse.json({ error: "Invalid add-on" }, { status: 400 });
  }

  const bike = getBike(bikeId);
  const kit = getKit(kitId);
  if (!bike || !kit) {
    return NextResponse.json({ error: "Unknown product" }, { status: 400 });
  }

  // The configurator asks /api/stock for the same answer, but that was fetched
  // when the page loaded. This is the one that counts.
  try {
    const unavailable = soldOut(await stockLevels(), skusForSelection({ kitId, addonIds }));
    if (unavailable.length > 0) {
      return NextResponse.json({ error: "Sold out", soldOut: unavailable }, { status: 409 });
    }
  } catch (error) {
    // Fail open: a database we cannot read is not a reason to refuse money.
    // An oversell shows up as a negative count in the back office.
    console.error("[checkout] stock check skipped", error);
  }

  const t = getDictionary(locale);
  const totals = priceCart({ bikeId, kitId, addonIds });
  // The receipt quotes what this kit dresses on this bike, not what the bike
  // could take: the Stripe line item is the one number a buyer keeps.
  const build = summarizeBuild({ bikeId, kitId, addonIds });

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: kit.priceCents,
        product_data: {
          name: `RideGlow ${t.kits.items[kit.id].name}`,
          description: `${t.bikes.items[bike.id].name} (${build.ledCount} ${t.bikes.ledCount})`,
        },
      },
    },
    ...addonIds.map((id) => {
      const addon = getAddon(id);
      if (!addon) throw new Error(`Unknown addon: ${id}`);
      return {
        quantity: 1,
        price_data: {
          currency: "eur" as const,
          unit_amount: addon.priceCents,
          product_data: { name: t.kits.addons[id].name },
        },
      };
    }),
  ];

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      locale: locale === "fr" ? "fr" : "en",
      line_items: lineItems,
      success_url: `${SITE_URL}/${locale}/commande/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/${locale}/commande/annule`,
      // Spread rather than cast: this makes Stripe's own country union check the
      // list, so a typo in the catalog fails the build instead of the payment.
      shipping_address_collection: { allowed_countries: [...SHIPPING_COUNTRIES] },
      phone_number_collection: { enabled: true },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: t.review.shipping,
            fixed_amount: { amount: totals.shippingCents, currency: "eur" },
            delivery_estimate: {
              minimum: { unit: "business_day", value: 2 },
              maximum: { unit: "business_day", value: 5 },
            },
          },
        },
      ],
      // Read back by the webhook to write the order line without a second
      // round trip to Stripe for the expanded session.
      metadata: { bikeId, kitId, addonIds: addonIds.join(","), locale },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Checkout unavailable" }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout] session creation failed", error);
    return NextResponse.json({ error: "Checkout unavailable" }, { status: 502 });
  }
}
