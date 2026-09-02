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

/**
 * Writes the order and takes its units off the shelf in one statement.
 *
 * The two have to be one statement, not two: Stripe retries webhooks, so the
 * same session arrives more than once, and a decrement that did not hang off
 * the insert would run again on every replay. Here the UPDATE is driven by what
 * the INSERT returned, so a replay conflicts, returns no row, and updates
 * nothing. A sku with no row in `stock` is untracked and quietly skipped.
 */
export async function recordPaidOrder(order: {
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
  await sql()`
    with inserted as (
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
      returning kit_id, addon_ids
    ),
    taken as (
      select 'kit:' || kit_id as sku from inserted
      union all
      select 'addon:' || unnest(addon_ids) from inserted
    )
    update stock s
       set on_hand = s.on_hand - 1, updated_at = now()
      from taken
     where s.sku = taken.sku
  `;
}

export type StockRow = { sku: string; on_hand: number; updated_at: string };

/**
 * Counts for every tracked sku. A sku missing from the map is not tracked,
 * which is deliberately not the same as zero: untracked sells without limit,
 * zero is sold out.
 */
export async function stockLevels(): Promise<Map<string, number>> {
  const rows = (await sql()`select sku, on_hand from stock`) as StockRow[];
  return new Map(rows.map((row) => [row.sku, row.on_hand]));
}

/** Which of `skus` cannot be sold right now. */
export function soldOut<T extends string>(levels: Map<string, number>, skus: readonly T[]): T[] {
  return skus.filter((sku) => {
    const onHand = levels.get(sku);
    return onHand !== undefined && onHand <= 0;
  });
}

export async function setStock(sku: string, onHand: number): Promise<void> {
  await sql()`
    insert into stock (sku, on_hand) values (${sku}, ${onHand})
    on conflict (sku) do update set on_hand = excluded.on_hand, updated_at = now()
  `;
}

/** Back to untracked. The count is gone, so the sku stops blocking sales. */
export async function untrackStock(sku: string): Promise<void> {
  await sql()`delete from stock where sku = ${sku}`;
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
