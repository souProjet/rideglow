import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalFacts, LegalPage, LegalSection } from "@/components/site/legal-page";
import { getDictionary } from "@/i18n";
import { isLocale, LOCALES } from "@/i18n/config";
import { COMPANY, HOST, LEGAL_COMPLETE } from "@/lib/legal";

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
    title: t.legal.notice.title,
    description: t.legal.notice.intro,
    alternates: { canonical: `/${locale}/mentions-legales` },
    // An incomplete legal notice is not a page anyone should land on from a
    // search result, so it stays out of the index until the gaps are filled.
    robots: { index: LEGAL_COMPLETE, follow: true },
  };
}

export default async function LegalNoticePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const f = t.legal.fields;
  const gap = t.legal.gap;

  return (
    <LegalPage locale={locale} t={t} title={t.legal.notice.title} intro={t.legal.notice.intro}>
      <LegalSection title={t.legal.notice.publisher.title} body={t.legal.notice.publisher.body}>
        <LegalFacts
          caption={t.legal.identity}
          gap={gap}
          rows={[
            { label: f.legalName, value: COMPANY.legalName },
            { label: f.legalForm, value: COMPANY.legalForm },
            { label: f.capital, value: COMPANY.capital },
            { label: f.address, value: COMPANY.address },
            { label: f.registry, value: COMPANY.registry },
            { label: f.siret, value: COMPANY.siret },
            { label: f.vat, value: COMPANY.vat },
            { label: f.publisher, value: COMPANY.publisher },
            { label: f.phone, value: COMPANY.phone },
            { label: f.email, value: COMPANY.email },
          ]}
        />
      </LegalSection>

      <LegalSection title={t.legal.notice.hosting.title} body={t.legal.notice.hosting.body}>
        <LegalFacts
          caption={t.legal.host}
          gap={gap}
          rows={[
            { label: f.legalName, value: HOST.name },
            { label: f.address, value: HOST.address },
            { label: f.phone, value: HOST.phone },
          ]}
        />
      </LegalSection>

      <LegalSection title={t.legal.notice.ip.title} body={t.legal.notice.ip.body} />
      <LegalSection title={t.legal.notice.liability.title} body={t.legal.notice.liability.body} />
      <LegalSection title={t.legal.notice.data.title} body={t.legal.notice.data.body}>
        <Link
          href={`/${locale}/confidentialite`}
          className="inline-block text-[0.9375rem] text-chalk underline decoration-line-bright underline-offset-4 transition-colors hover:decoration-glow"
        >
          {t.footer.privacy}
        </Link>
      </LegalSection>
    </LegalPage>
  );
}
