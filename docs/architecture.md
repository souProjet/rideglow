# Architecture

## Route layout

There is no `src/app/layout.tsx`. Two route groups each own a root layout, so the
storefront and the back office share no CSS, no fonts and no chrome:

```
src/app/
  (marketing)/[locale]/     showroom, configurator, order result   -> its own <html>
  (backoffice)/admin/       orders list, login                     -> its own <html>
  api/checkout              creates the Stripe session
  api/webhooks/stripe       writes the order row
```

`src/proxy.ts` (Next 16 renamed `middleware.ts` to `proxy.ts`) redirects `/` to
`/fr` or `/en` from the `NEXT_LOCALE` cookie, then `accept-language`. It skips
`/api`, `/admin` and static paths.

## The 3D showroom

`showroom-loader.tsx` dynamically imports the whole 3D stack with `ssr: false`. Copy
and layout ship first; WebGL loads after. A feature detect swaps in a static fallback
when WebGL is unavailable.

Geometry is procedural. `src/lib/bike-geometry.ts` holds a `Silhouette` per frame
family (wheelbase, rake, stance, seat height, tank, tail rise, bar width, fairing,
beak) and derives three strip runs, mirrored left and right. **This is the swap point
for real models**: replace `getStripRuns()` with curves read from a GLB and the rest of
the pipeline is unchanged.

`led-rig.tsx` samples those curves with `getSpacedPoints` so the LED pitch stays even
whatever the run length, writes every instance matrix once in `useLayoutEffect`, and
per frame writes colours into the existing `instanceColor` buffer. One `InstancedMesh`
for up to 94 LEDs, no per-frame allocation.

Frame budget guards: `dpr={[1, 1.75]}`, `AdaptiveDpr`, an in-memory `Environment` of
`Lightformer`s instead of an HDRI download, and `frameloop` driven by an
IntersectionObserver plus `visibilitychange`, so the canvas stops rendering when it is
off screen or the tab is hidden.

## LED modes

`src/lib/led-modes.ts` is the program set. Each mode exposes
`shade(out, i, n, strip, frame)` writing into a caller-owned `Color`:

- `sound` maps each LED to a slice of the spectrum, bass at the nose
- `ride` streams light backwards with speed and lights the inside of the corner
- `spectrum`, `breathe`, `solid`

Audio comes from `getUserMedia` plus an `AnalyserNode`, grouped into 16 logarithmic
bands. Without microphone permission a synthetic 124 BPM groove drives the same input,
so the mode is never dead on arrival.

## The accent colour

`--glow` is a runtime variable, not a design token frozen at build time. `@theme inline`
makes `--color-glow: var(--glow)` resolve at use time, so every Tailwind utility
(`bg-glow`, `border-glow`, `text-glow`) follows whatever the store last wrote.

`glow-sync.tsx` writes it from the **mode's** accent, not the live average of the strip.
In sound mode the average swings on every kick, and an interface accent that strobes
with the bass is unreadable and hostile to anyone photosensitive. The live average
drives only the two spill lights inside the canvas.

## The funnel

All three steps live on one route, `/[locale]/configurateur`, with the step index in the
Zustand store. Routing between steps would tear down the WebGL context and replay the
ignition animation on every click; keeping the canvas mounted is the whole reason the
preview feels live while the visitor configures.

The store persists to `sessionStorage` with `skipHydration: true` and a manual
`rehydrate()` in an effect, which is what keeps the server and client markup identical
on first paint.

## Money

`src/lib/catalog.ts` is the single source of truth for products and prices, and it runs
on the server too. The client posts identifiers only; `/api/checkout` looks the prices
up again and builds the Stripe line items from the catalog, so a tampered payload can
change the order but never the amount.

The webhook verifies the Stripe signature on the raw body, returns 400 on a bad one, and
returns 500 on a handler failure so Stripe retries. The insert uses
`on conflict (id) do nothing`, keyed on the session id, so a retry cannot duplicate an
order. `charge.refunded` marks the row by payment intent.

## Data

One table. `db/schema.sql`:

```
orders(id pk = stripe session id, email, amount_total_cents, status,
       bike_id, kit_id, addon_ids, shipping_*, payment_intent, tracking_number,
       created_at)
```

`status` is `paid | shipped | refunded`. Stripe holds everything else.

## Internationalisation

Hand-rolled, no library. `src/i18n/fr.ts` is the source dictionary; `Translated<T>` maps
its string literals to `string`, so `en.ts` fails to compile if it drifts from the French
shape. A missing key is a build error, not a runtime `undefined`.
