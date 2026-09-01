import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

export const metadata: Metadata = { robots: { index: false } };

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const [{ locale }, { session_id }] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  // The tail of the session id is enough for support to find the order, and
  // short enough to read down the phone.
  const reference = session_id ? session_id.slice(-12).toUpperCase() : null;

  return (
    <>
      <section className="glow-pool grid min-h-svh place-items-center px-5 py-32 text-center sm:px-8">
        <div className="max-w-lg space-y-6">
          <span aria-hidden className="mx-auto block h-px w-16 rule-glow" />
          <h1 className="type-display text-[clamp(2rem,5vw,3rem)]">{t.success.title}</h1>
          <p className="text-pretty text-[1.0625rem] leading-relaxed text-chalk-dim">
            {t.success.body}
          </p>

          {reference && (
            <p className="type-eyebrow">
              {t.success.orderRef} <span className="text-chalk">{reference}</span>
            </p>
          )}

          <div className="pt-4">
            <Button href={`/${locale}`} variant="ghost">
              {t.success.back}
            </Button>
          </div>
        </div>
      </section>
      <SiteFooter locale={locale} t={t} />
    </>
  );
}
