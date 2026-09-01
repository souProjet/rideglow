import Stripe from "stripe";

let client: Stripe | null = null;

/**
 * Lazily constructed so a missing key fails on the first checkout request with
 * a clear message, instead of crashing the whole server at import time and
 * taking the marketing pages down with it.
 */
export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key, { typescript: true });
  }
  return client;
}
