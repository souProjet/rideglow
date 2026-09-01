import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

export const metadata: Metadata = { robots: { index: false } };

export default async function CanceledPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <section className="grid min-h-svh place-items-center px-5 py-32 text-center sm:px-8">
        <div className="max-w-lg space-y-6">
          <h1 className="type-display text-[clamp(1.8rem,4.5vw,2.6rem)]">{t.canceled.title}</h1>
          <p className="text-[1.0625rem] leading-relaxed text-chalk-dim">{t.canceled.body}</p>
          <div className="pt-4">
            <Button href={`/${locale}/configurateur`}>{t.canceled.resume}</Button>
          </div>
        </div>
      </section>
      <SiteFooter locale={locale} t={t} />
    </>
  );
}
