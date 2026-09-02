# RideGlow

Sales site for an addressable RGB LED kit for motorcycles: a real-time 3D showroom
where the visitor sees the strips animate on their own frame family, followed by a
three-step funnel that ends in Stripe Checkout.

Working name. Rename the wordmark in `src/components/site/wordmark.tsx`, the footer
and `src/i18n/*` before launch.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | Static marketing pages plus the API routes the payment flow needs, in one deploy |
| 3D | React Three Fiber + drei + postprocessing | Procedural geometry, no asset pipeline yet |
| Styling | Tailwind CSS 4 (CSS-first) | The accent color is a CSS variable rewritten at runtime, which `@theme inline` resolves at use time |
| State | Zustand, persisted to `sessionStorage` | The configuration survives the Stripe round trip without a cart API |
| Payments | Stripe hosted Checkout | PCI scope stays with Stripe; the dashboard is the back office |
| Database | Neon serverless Postgres | An `orders` ledger and a `stock` counter, both written by the webhook |
| Email | Resend | Order confirmation |
| Lint + format | Biome | One tool, one pass |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill it in
npm run db:setup             # applies db/schema.sql to $DATABASE_URL
npm run dev
```

The site is at `http://localhost:3000`; `/` redirects to `/fr` or `/en` based on the
`NEXT_LOCALE` cookie then `accept-language`.

## Environment

| Variable | Used by | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Checkout success and cancel URLs | Defaults to `http://localhost:3000` |
| `STRIPE_SECRET_KEY` | `/api/checkout`, `/api/webhooks/stripe` | `sk_test_...` in development |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature check | From `stripe listen`, or the dashboard endpoint in production |
| `DATABASE_URL` | Neon | Pooled connection string |
| `ADMIN_PASSWORD` | `/admin` | Single operator, no user table |
| `ADMIN_SESSION_SECRET` | Admin cookie HMAC | Any long random string |
| `RESEND_API_KEY` | Order confirmation email | Optional in development; sending is skipped when unset |
| `ORDER_EMAIL_FROM` | Sender address | Must be a domain verified in Resend |

## Webhooks in development

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`. The handler reacts to
`checkout.session.completed` and `charge.refunded`; the insert is keyed on the Stripe
session id, so replays are harmless.

## Back office

`/admin` lists orders, marks them shipped, records a tracking number and holds the
stock counts. Auth is a single password checked in constant time, with an HMAC-signed
expiry cookie: there is exactly one operator and no roles to model. Everything else
(catalog, refunds, disputes, invoices, VAT, payouts) lives in the Stripe dashboard.

## Stock

Counts are held per kit and per add-on, never per (kit, bike): the shelf holds
controller boxes, tape and looms, and the bike family only decides where the tape is
cut. The keys are namespaced, `kit:signature` and `addon:remote`, and come from
`src/lib/catalog.ts`.

A reference with no row in `stock` is untracked and sells without limit, so applying
the schema changes nothing until a count is entered in `/admin`. Zero is the opposite
and blocks the sale. Clearing the field goes back to untracked.

The decrement is part of the insert the webhook already ran: one statement, with the
UPDATE driven by what the INSERT returned, so a Stripe retry conflicts on the session
id, returns no row and decrements nothing. Nothing is restocked on a refund, since a
refund is not a returned parcel.

Because it is one statement, `stock` has to exist before the webhook fires: run
`npm run db:setup` again before deploying, or every order write fails and Stripe
retries it. `/admin` says so as well, since it reads both tables.

Two deliberate gaps. Nothing is reserved between the moment Stripe opens a session and
the moment it is paid, so two visitors can buy the last unit within the same minute;
closing that needs a holds table with an `expires_at` and a `checkout.session.expired`
handler. And the count can go negative, because a constraint would make the webhook
500 on an order Stripe has already charged and retry it forever. A negative count is
an oversell, shown in red in the back office.

## Scripts

```bash
npm run dev        # Turbopack dev server
npm run build      # production build
npm run lint       # biome check
npm run format     # biome format --write
npm run typecheck  # tsc --noEmit
npm run db:setup   # applies db/schema.sql, idempotent
```

## Deploy

Vercel: import the repo, set the variables above, point a Stripe webhook endpoint at
`https://<domain>/api/webhooks/stripe` for `checkout.session.completed` and
`charge.refunded`. The two marketing routes are prerendered per locale; `/admin`, the
success page and the API routes are dynamic.

## Brand assets

The favicon, the Apple touch icon and the social card are all generated, so there is
nothing to redraw when the copy changes. `src/app/icon.svg` is the mark; `apple-icon.tsx`
and `(marketing)/[locale]/opengraph-image.tsx` build the raster versions with `next/og`.
Both card locales are prerendered at build time.

`src/assets/fonts` holds two Archivo instances as `.woff`, under the OFL alongside them.
They are vendored because satori reads woff but not the woff2 `next/font` produces, and
because a build that phones Google Fonts is a build that fails offline. They are a
build-time dependency and never reach the runtime.

Shared colors and the mark's rake live in `src/lib/brand.ts`. `icon.svg` repeats the
hexes because a static file cannot import them; change one, change both.

## Legality

Colored auxiliary lighting is prohibited in traffic in most European countries. The
copy sells the kit for track, show and stationary use, and says so in the FAQ and the
footer. Keep it that way, and check the rules for any market you add.

## Not done yet

- Real motorcycle models. The silhouettes are procedural: see `docs/architecture.md`.
- The company facts the legal pages need. `src/lib/legal.ts` marks each missing
  one `TBD`, the pages render it as a visible gap, and `LEGAL_COMPLETE` keeps
  all three out of the search index until every field is filled.
- A `favicon.ico`. Browsers that cannot read `icon.svg` get a 404 instead of a
  fallback; generating a real `.ico` needs an encoder this repo does not have.
- Stock holds. See the two gaps under "Stock" above.
