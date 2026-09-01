import { neon } from "@neondatabase/serverless";

export type OrderStatus = "paid" | "shipped" | "refunded";

export type Order = {
  id: string;
  payment_intent: string | null;
  created_at: string;
  email: string | null;
  amount_total_cents: number;
  currency: string;
  bike_id: string;
  kit_id: string;
  addon_ids: string[];
  shipping_name: string | null;
  shipping_line1: string | null;
  shipping_line2: string | null;
  shipping_postal_code: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  status: OrderStatus;
  tracking_number: string | null;
  shipped_at: string | null;
};

let client: ReturnType<typeof neon> | null = null;

export function sql() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    client = neon(url);
  }
  return client;
}

export async function listOrders(limit = 100): Promise<Order[]> {
  return (await sql()`
    select * from orders order by created_at desc limit ${limit}
  `) as Order[];
}

export async function insertOrder(order: {
  id: string;
  paymentIntent: string | null;
  email: string | null;
  amountTotalCents: number;
  currency: string;
  bikeId: string;
  kitId: string;
  addonIds: string[];
  shipping: {
    name: string | null;
    line1: string | null;
    line2: string | null;
    postalCode: string | null;
    city: string | null;
    country: string | null;
  };
}): Promise<void> {
  // Stripe retries webhooks, so the same session can arrive more than once.
  // The primary key plus DO NOTHING makes replay a no-op.
  await sql()`
    insert into orders (
      id, payment_intent, email, amount_total_cents, currency,
      bike_id, kit_id, addon_ids,
      shipping_name, shipping_line1, shipping_line2,
      shipping_postal_code, shipping_city, shipping_country
    ) values (
      ${order.id}, ${order.paymentIntent}, ${order.email},
      ${order.amountTotalCents}, ${order.currency},
      ${order.bikeId}, ${order.kitId}, ${order.addonIds},
      ${order.shipping.name}, ${order.shipping.line1}, ${order.shipping.line2},
      ${order.shipping.postalCode}, ${order.shipping.city}, ${order.shipping.country}
    )
    on conflict (id) do nothing
  `;
}

export async function markShipped(id: string, trackingNumber: string): Promise<Order | null> {
  const rows = (await sql()`
    update orders
       set status = 'shipped', tracking_number = ${trackingNumber}, shipped_at = now()
     where id = ${id}
    returning *
  `) as Order[];
  return rows[0] ?? null;
}

/** Refund events carry a payment intent, not the checkout session id. */
export async function markRefundedByIntent(paymentIntent: string): Promise<void> {
  await sql()`update orders set status = 'refunded' where payment_intent = ${paymentIntent}`;
}
