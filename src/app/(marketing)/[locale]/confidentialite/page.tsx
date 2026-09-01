import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalPage, LegalSection } from "@/components/site/legal-page";
import { getDictionary } from "@/i18n";
import { isLocale, LOCALES } from "@/i18n/config";
import { formatCountry } from "@/lib/format";
import { LEGAL_COMPLETE, PROCESSORS } from "@/lib/legal";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.legal.privacy.title,
    description: t.legal.privacy.intro,
    alternates: { canonical: `/${locale}/confidentialite` },
    robots: { index: LEGAL_COMPLETE, follow: true },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const s = t.legal.privacy;

  return (
    <LegalPage locale={locale} t={t} title={s.title} intro={s.intro}>
      <LegalSection title={s.controller.title} body={s.controller.body}>
        <Link
          href={`/${locale}/mentions-legales`}
          className="inline-block text-[0.9375rem] text-chalk underline decoration-line-bright underline-offset-4 transition-colors hover:decoration-glow"
        >
          {t.footer.legalNotice}
        </Link>
      </LegalSection>

      <LegalSection title={s.collected.title} body={s.collected.body} />
      <LegalSection title={s.purposes.title} body={s.purposes.body} />

      <LegalSection title={s.recipients.title} body={s.recipients.body}>
        <table className="w-full border-collapse text-left text-[0.875rem]">
          <caption className="sr-only">{t.legal.processorTable}</caption>
          <thead>
            <tr className="border-b border-line">
              {[t.legal.fields.company, t.legal.fields.role, t.legal.fields.country].map(
                (heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="py-2 pr-4 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-chalk-dim"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {PROCESSORS.map((processor) => (
              <tr key={processor.key} className="border-b border-line/60">
                <td className="py-3 pr-4 text-chalk">{processor.name}</td>
                <td className="py-3 pr-4 text-chalk-dim">{t.legal.processors[processor.key]}</td>
                <td className="py-3 pr-4 text-chalk-dim">
                  {formatCountry(processor.country, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[0.9375rem] leading-relaxed text-chalk-dim">{s.recipients.transfers}</p>
      </LegalSection>

      <LegalSection title={s.retention.title} body={s.retention.body} />
      <LegalSection title={s.cookies.title} body={s.cookies.body} />
      <LegalSection title={s.rights.title} body={s.rights.body} />
    </LegalPage>
  );
}
