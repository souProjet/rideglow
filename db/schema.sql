-- RideGlow order ledger.
--
-- Stripe stays the system of record for money: this table exists only for the
-- three things the Stripe dashboard cannot tell us — has it shipped, with which
-- tracking number, and against which bike/kit configuration.
--
-- Apply with: psql "$DATABASE_URL" -f db/schema.sql

create table if not exists orders (
  -- Stripe Checkout session id. Also the idempotency key for webhook replays.
  id                  text primary key,
  payment_intent      text,
  created_at          timestamptz not null default now(),

  email               text,
  amount_total_cents  integer not null,
  currency            text    not null default 'eur',

  bike_id             text not null,
  kit_id              text not null,
  addon_ids           text[] not null default '{}',

  shipping_name        text,
  shipping_line1       text,
  shipping_line2       text,
  shipping_postal_code text,
  shipping_city        text,
  shipping_country     text,

  status              text not null default 'paid'
                        check (status in ('paid', 'shipped', 'refunded')),
  tracking_number     text,
  shipped_at          timestamptz
);

-- The back-office only ever lists newest first, and filters on what still
-- needs packing.
create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_status_idx on orders (status) where status = 'paid';
