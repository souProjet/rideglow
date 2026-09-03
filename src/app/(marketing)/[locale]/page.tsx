import { notFound } from "next/navigation";
import { ModeSwitch } from "@/components/mode-switch";
import { RealDemo } from "@/components/real-demo";
import { Faq, FinalCta, Install, Pricing, SpecSheet } from "@/components/sections";
import { SiteFooter } from "@/components/site/footer";
import { ShowroomCanvas } from "@/components/three/showroom-loader";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { FREE_SHIPPING_THRESHOLD_CENTS, KITS } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { homeJsonLd, serializeJsonLd } from "@/lib/structured-data";

/** The entry price, so the hero quotes the catalog rather than a copy of it. */
const FROM_CENTS = Math.min(...KITS.map((kit) => kit.priceCents));

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      {/* The price, the return policy and the four objections, in the form a
          crawler reads. See `structured-data.ts` for what is deliberately
          absent from it. */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: the only way to emit a JSON-LD script body; the payload is escaped in `serializeJsonLd`
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(homeJsonLd(locale, t)) }}
      />
      <section id="modes" className="grain relative min-h-[100svh] overflow-hidden">
        <ShowroomCanvas
          className="absolute inset-0"
          frameBias={0.16}
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

            {/* The entry price next to the button that starts the funnel. A
                visitor who has to reach step two of the configurator to find
                out what this costs is a visitor deciding whether to keep
                going without the one number the decision turns on. */}
            <p className="text-[0.875rem] text-chalk-dim">
              {t.hero.priceFrom}{" "}
              <span className="font-semibold text-chalk" data-numeric>
                {formatPrice(FROM_CENTS, locale)}
              </span>
              {" · "}
              {t.pricing.freeShippingFrom}{" "}
              <span data-numeric>{formatPrice(FREE_SHIPPING_THRESHOLD_CENTS, locale)}</span>
            </p>
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

      {/* Straight after the 3D hero, because that is where the doubt is: the
          bike above is rendered, and the visitor's next thought is what the
          thing looks like on a real machine at night. */}
      <RealDemo t={t} />
      <SpecSheet t={t} />
      {/* After the contents, before the fitting guide: a buyer wants to know
          what they get, then what it costs, and only then how it goes on. */}
      <Pricing t={t} locale={locale} />
      <Install t={t} />
      <Faq t={t} />
      <FinalCta t={t} locale={locale} />
      <SiteFooter locale={locale} t={t} />
    </>
  );
}
