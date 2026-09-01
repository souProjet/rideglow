import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/footer";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { formatDate } from "@/lib/format";
import { LEGAL_UPDATED, TBD } from "@/lib/legal";

/**
 * The legal pages read as the workshop manual the rest of the site borrows
 * from: the heading sits in the margin and the clause sits in the column, so a
 * ten-part document can be scanned by heading without opening every paragraph.
 */
export function LegalPage({
  locale,
  t,
  title,
  intro,
  children,
}: {
  locale: Locale;
  t: Dictionary;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <>
      <article className="mx-auto max-w-[72rem] px-5 pt-24 pb-24 sm:px-8">
        <header className="border-b border-line pb-10">
          <h1 className="type-display text-[clamp(2rem,5vw,3.2rem)]">{title}</h1>
          <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-chalk-dim">{intro}</p>
          <p className="type-eyebrow mt-8">
            {t.legal.updated} <span data-numeric>{formatDate(LEGAL_UPDATED, locale)}</span>
          </p>
        </header>

        <div className="divide-y divide-line">{children}</div>
      </article>
      <SiteFooter locale={locale} t={t} />
    </>
  );
}

export function LegalSection({
  title,
  body,
  children,
}: {
  title: string;
  body: readonly string[];
  children?: ReactNode;
}) {
  return (
    <section className="grid gap-4 py-10 md:grid-cols-[16rem_minmax(0,1fr)] md:gap-10">
      <h2 className="type-eyebrow pt-1 text-chalk">{title}</h2>
      <div className="max-w-[46rem] space-y-4">
        {body.map((paragraph) => (
          <p key={paragraph} className="text-[0.9375rem] leading-relaxed text-chalk-dim">
            {paragraph}
          </p>
        ))}
        {children}
      </div>
    </section>
  );
}

/**
 * A legal fact nobody has supplied yet. It is shown rather than hidden: an
 * empty line in a legal notice looks finished, and a wrong one is worse than a
 * visible hole.
 */
export function LegalValue({ value, gap }: { value: string; gap: string }) {
  if (value !== TBD) return <span>{value}</span>;
  return (
    <span className="rounded-[2px] border border-dashed border-line-bright px-1.5 py-0.5 text-[0.6875rem] uppercase tracking-[0.12em] text-chalk-dim">
      {gap}
    </span>
  );
}

/** Label over value, the same spec block the bike cards use. */
export function LegalFacts({
  caption,
  rows,
  gap,
}: {
  caption: string;
  rows: readonly { label: string; value: string }[];
  gap: string;
}) {
  return (
    <div className="mt-6 rounded-card border border-line bg-ink-raised p-5">
      <p className="type-eyebrow">{caption}</p>
      <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1">
            <dt className="text-[0.6875rem] uppercase leading-tight tracking-[0.14em] text-chalk-dim">
              {row.label}
            </dt>
            <dd className="text-[0.875rem] text-chalk">
              <LegalValue value={row.value} gap={gap} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
