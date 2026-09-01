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
| Styling | Tailwind CSS 4 (CSS-first) | The accent colour is a CSS variable rewritten at runtime, which `@theme inline` resolves at use time |
| State | Zustand, persisted to `sessionStorage` | The configuration survives the Stripe round trip without a cart API |
| Payments | Stripe hosted Checkout | PCI scope stays with Stripe; the dashboard is the back office |
| Database | Neon serverless Postgres | One `orders` table, written by the webhook |
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

`/admin` lists orders, marks them shipped and records a tracking number. Auth is a
single password checked in constant time, with an HMAC-signed expiry cookie: there is
exactly one operator and no roles to model. Everything else — catalog, refunds,
disputes, invoices, VAT, payouts — lives in the Stripe dashboard.

## Scripts

```bash
npm run dev        # Turbopack dev server
npm run build      # production build
npm run lint       # biome check
npm run format     # biome format --write
npm run typecheck  # tsc --noEmit
npm run db:setup   # psql "$DATABASE_URL" -f db/schema.sql
```

## Deploy

Vercel: import the repo, set the variables above, point a Stripe webhook endpoint at
`https://<domain>/api/webhooks/stripe` for `checkout.session.completed` and
`charge.refunded`. The two marketing routes are prerendered per locale; `/admin`, the
success page and the API routes are dynamic.

## Legality

Colored auxiliary lighting is prohibited in traffic in most European countries. The
copy sells the kit for track, show and stationary use, and says so in the FAQ and the
footer. Keep it that way, and check the rules for any market you add.

## Not done yet

- Real motorcycle models. The silhouettes are procedural: see `docs/architecture.md`.
- `mentions-legales`, `cgv` and `confidentialite` pages linked from the footer.
- `public/` assets: favicon, OG image.
- Stock tracking. The webhook records orders but nothing decrements inventory.
