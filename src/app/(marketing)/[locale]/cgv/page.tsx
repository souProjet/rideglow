import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalFacts, LegalPage, LegalSection } from "@/components/site/legal-page";
import { getDictionary } from "@/i18n";
import { isLocale, LOCALES } from "@/i18n/config";
import { SHIPPING_COUNTRIES } from "@/lib/catalog";
import { formatCountry } from "@/lib/format";
import { COMPANY, LEGAL_COMPLETE } from "@/lib/legal";

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
    title: t.legal.terms.title,
    description: t.legal.terms.intro,
    alternates: { canonical: `/${locale}/cgv` },
    robots: { index: LEGAL_COMPLETE, follow: true },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const s = t.legal.terms;

  return (
    <LegalPage locale={locale} t={t} title={s.title} intro={s.intro}>
      <LegalSection title={s.scope.title} body={s.scope.body} />
      <LegalSection title={s.products.title} body={s.products.body} />
      <LegalSection title={s.order.title} body={s.order.body} />
      <LegalSection title={s.price.title} body={s.price.body} />

      <LegalSection title={s.delivery.title} body={s.delivery.body}>
        {/* The list comes from the same constant Stripe enforces at checkout,
            so the terms cannot promise a country the payment step refuses. */}
        <ul className="flex flex-wrap gap-x-2 gap-y-2">
          {SHIPPING_COUNTRIES.map((code) => (
            <li
              key={code}
              className="rounded-[2px] border border-line px-2 py-1 text-[0.8125rem] text-chalk"
            >
              {formatCountry(code, locale)}
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title={s.withdrawal.title} body={s.withdrawal.body} />
      <LegalSection title={s.warranty.title} body={s.warranty.body} />
      <LegalSection title={s.compliance.title} body={s.compliance.body} />

      <LegalSection title={s.disputes.title} body={s.disputes.body}>
        <LegalFacts
          caption={t.footer.contact}
          gap={t.legal.gap}
          rows={[
            { label: t.legal.fields.mediator, value: COMPANY.mediator },
            { label: t.legal.fields.mediatorUrl, value: COMPANY.mediatorUrl },
            { label: t.legal.fields.email, value: COMPANY.email },
          ]}
        />
      </LegalSection>

      <LegalSection title={s.law.title} body={s.law.body} />
    </LegalPage>
  );
}
