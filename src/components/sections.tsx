import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

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
