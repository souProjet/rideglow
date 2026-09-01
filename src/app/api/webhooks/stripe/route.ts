import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { insertOrder, markRefundedByIntent } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

/** Signature verification needs the exact bytes Stripe signed, so this route
 *  must never be statically optimized or run on the edge cache. */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch (error) {
    // An unverifiable payload is either a misconfigured secret or someone
    // posting fake orders. Neither is worth a 500.
    console.warn("[webhook] signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.payment_status !== "paid") break;

        const address = session.collected_information?.shipping_details?.address ?? null;
        const name = session.collected_information?.shipping_details?.name ?? null;
        const addonIds = (session.metadata?.addonIds ?? "").split(",").filter(Boolean);

        await insertOrder({
          id: session.id,
          paymentIntent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? null),
          email: session.customer_details?.email ?? null,
          amountTotalCents: session.amount_total ?? 0,
          currency: session.currency ?? "eur",
          bikeId: session.metadata?.bikeId ?? "unknown",
          kitId: session.metadata?.kitId ?? "unknown",
          addonIds,
          shipping: {
            name,
            line1: address?.line1 ?? null,
            line2: address?.line2 ?? null,
            postalCode: address?.postal_code ?? null,
            city: address?.city ?? null,
            country: address?.country ?? null,
          },
        });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const intent = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
        if (intent) await markRefundedByIntent(intent);
        break;
      }

      default:
        break;
    }
  } catch (error) {
    // Returning 500 makes Stripe retry, which is what we want for a transient
    // database failure: the insert is idempotent.
    console.error(`[webhook] handler failed for ${event.type}`, error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
