import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { ADDONS, FREE_SHIPPING_THRESHOLD_CENTS, KITS, SHIPPING_CENTS } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

function SectionHead({ eyebrow, title, lede }: { eyebrow?: string; title: string; lede?: string }) {
  return (
    <div className="max-w-2xl space-y-4">
      {eyebrow && <p className="type-eyebrow">{eyebrow}</p>}
      <h2 className="type-display text-[clamp(1.9rem,4.4vw,3.1rem)]">{title}</h2>
      {lede && (
        <p className="text-pretty text-[1.0625rem] leading-relaxed text-chalk-dim">{lede}</p>
      )}
    </div>
  );
}

/**
 * Specs are set as a workshop-manual table rather than feature cards: the
 * audience is people who will wire this to a battery, and a table is what they
 * already read.
 */
export function SpecSheet({ t }: { t: Dictionary }) {
  const rows = Object.values(t.spec.rows);

  return (
    <section id="specs" className="border-t border-line bg-ink px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[86rem]">
        <SectionHead title={t.spec.title} lede={t.spec.lede} />

        <dl className="mt-14 grid gap-x-16 border-t border-line sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-6 border-b border-line py-5"
            >
              <dt className="type-eyebrow shrink-0">{row.label}</dt>
              <dd className="text-right text-[0.9375rem] text-chalk" data-numeric>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/**
 * The price, on the one page a search engine is allowed to index.
 *
 * It used to exist only at step two of the configurator, which is `noindex`: a
 * visitor had to commit to a funnel to find out what the kit costs, and Google
 * never saw a figure at all. Both the prices and the feature lists are read
 * from the catalog and the funnel's own dictionary rather than restated here,
 * so this section and the checkout cannot quote different numbers.
 *
 * It also answers `#kit` in the header nav, which until now pointed at an
 * anchor that did not exist anywhere on the site.
 */
export function Pricing({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section id="kit" className="border-t border-line px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[86rem]">
        <SectionHead eyebrow={t.pricing.eyebrow} title={t.pricing.title} lede={t.pricing.lede} />

        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          {KITS.map((kit) => {
            const copy = t.kits.items[kit.id];
            return (
              <article
                key={kit.id}
                className={`relative flex flex-col rounded-card border p-8 ${
                  kit.recommended ? "border-glow bg-glow-faint" : "border-line"
                }`}
              >
                {kit.recommended && (
                  <span
                    className="absolute -top-2 left-8 bg-glow px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-ink"
                    data-numeric
                  >
                    {t.kits.recommended}
                  </span>
                )}

                <h3 className="text-[1.25rem] font-semibold text-chalk">{copy.name}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-chalk-dim">{copy.blurb}</p>

                <p className="mt-6 flex flex-wrap items-baseline gap-x-2.5">
                  <span className="type-display text-[2.75rem] leading-none" data-numeric>
                    {formatPrice(kit.priceCents, locale)}
                  </span>
                  <span className="text-[0.8125rem] text-chalk-dim">{t.pricing.vat}</span>
                  <span className="text-[0.75rem] text-chalk-dim" data-numeric>
                    {kit.strips} {t.kits.strips}
                  </span>
                </p>

                <ul className="mt-7 flex flex-col gap-2 border-t border-line pt-6">
                  {kit.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-[0.875rem] text-chalk-dim"
                    >
                      <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-glow" />
                      {t.kits.features[feature as keyof typeof t.kits.features]}
                    </li>
                  ))}
                </ul>

                {/* `mt-auto` rather than a fixed spacer: Core lists four
                    features and Signature seven, so the two buttons only line
                    up if the gap absorbs the difference. */}
                <div className="mt-auto pt-8">
                  <Button
                    href={`/${locale}/configurateur`}
                    variant={kit.recommended ? "primary" : "ghost"}
                  >
                    {t.pricing.cta}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-x-10 gap-y-3 border-t border-line pt-8 text-[0.875rem] text-chalk-dim sm:flex-row sm:flex-wrap">
          <p>
            {t.pricing.freeShippingFrom}{" "}
            <span data-numeric>{formatPrice(FREE_SHIPPING_THRESHOLD_CENTS, locale)}</span>,{" "}
            {t.pricing.otherwise} <span data-numeric>{formatPrice(SHIPPING_CENTS, locale)}</span>.
          </p>
          <p>{t.review.reassurance.returns}</p>
          <p>{t.review.reassurance.warranty}</p>
        </div>

        <p className="mt-3 text-[0.875rem] text-chalk-dim">
          {t.pricing.addonsLead}{" "}
          {ADDONS.map((addon, i) => (
            <span key={addon.id}>
              {i > 0 && " · "}
              {t.kits.addons[addon.id].name}{" "}
              <span data-numeric>{formatPrice(addon.priceCents, locale)}</span>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

/** Numbered here because fitting genuinely is a sequence: the order is the
 *  information, not decoration. */
export function Install({ t }: { t: Dictionary }) {
  const steps = Object.values(t.install.steps);

  return (
    <section className="border-t border-line px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[86rem]">
        <SectionHead title={t.install.title} lede={t.install.lede} />

        <ol className="mt-14 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.name} className="flex flex-col gap-4 bg-ink p-8">
              <span className="text-[2.5rem] leading-none text-line-bright" data-numeric>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[1.0625rem] font-semibold text-chalk">{step.name}</h3>
              <p className="text-[0.9375rem] leading-relaxed text-chalk-dim">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Faq({ t }: { t: Dictionary }) {
  const items = Object.values(t.faq.items);

  return (
    <section className="border-t border-line px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-[86rem] gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <SectionHead title={t.faq.title} />

        <div className="border-t border-line">
          {items.map((item) => (
            <details key={item.q} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[1.0625rem] font-medium text-chalk transition-colors hover:text-glow">
                {item.q}
                <span
                  aria-hidden
                  className="shrink-0 text-chalk-dim transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-2xl pb-6 text-[0.9375rem] leading-relaxed text-chalk-dim">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section className="glow-pool relative border-t border-line px-5 py-28 text-center sm:px-8 sm:py-36">
      <div className="mx-auto max-w-2xl space-y-6">
        <h2 className="type-display text-balance text-[clamp(2rem,5vw,3.4rem)]">{t.cta.title}</h2>
        <p className="text-[1.0625rem] text-chalk-dim">{t.cta.body}</p>
        <div className="pt-2">
          <Button href={`/${locale}/configurateur`}>{t.cta.button}</Button>
        </div>
      </div>
    </section>
  );
}
