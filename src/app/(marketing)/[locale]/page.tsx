import { notFound } from "next/navigation";
import { ModeSwitch } from "@/components/mode-switch";
import { Faq, FinalCta, Install, SpecSheet } from "@/components/sections";
import { ShowroomCanvas } from "@/components/three/showroom-loader";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <section id="modes" className="grain relative min-h-[100svh] overflow-hidden">
        <ShowroomCanvas
          className="absolute inset-0"
          labels={{
            loading: t.hero.loading,
            fallback: t.hero.fallback,
            micDenied: t.modes.micDenied,
          }}
        />

        {/* Scrim: the copy sits on the left, the bike turns on the right. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(102deg,var(--ink)_4%,color-mix(in_oklab,var(--ink)_72%,transparent)_34%,transparent_62%)]"
        />

        <div className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-[86rem] flex-col justify-between gap-16 px-5 pt-28 pb-10 sm:px-8 sm:pt-32">
          <div className="pointer-events-auto max-w-xl space-y-6">
            <p className="type-eyebrow">{t.hero.eyebrow}</p>
            <h1 className="type-display text-balance text-[clamp(2.6rem,7.2vw,5.2rem)]">
              {t.hero.title}
            </h1>
            <p className="max-w-lg text-pretty text-[1.0625rem] leading-relaxed text-chalk-dim">
              {t.hero.lede}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button href={`/${locale}/configurateur`}>{t.hero.cta}</Button>
              <Button href={`/${locale}#specs`} variant="ghost">
                {t.hero.ctaSecondary}
              </Button>
            </div>
          </div>

          <div className="pointer-events-auto space-y-4">
            <p className="type-eyebrow flex items-center gap-3">
              <span aria-hidden className="h-px w-10 rule-glow" />
              {t.hero.hint}
            </p>
            <ModeSwitch t={t} />
          </div>
        </div>
      </section>

      <SpecSheet t={t} />
      <Install t={t} />
      <Faq t={t} />
      <FinalCta t={t} locale={locale} />
    </>
  );
}
