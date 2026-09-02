"use client";

import { useEffect, useState } from "react";
import { BuildReadout } from "@/components/funnel/build-readout";
import { Progress } from "@/components/funnel/progress";
import { StepBike } from "@/components/funnel/step-bike";
import { StepKit } from "@/components/funnel/step-kit";
import { StepReview } from "@/components/funnel/step-review";
import { ModeSwitch } from "@/components/mode-switch";
import { ShowroomCanvas } from "@/components/three/showroom-loader";
import { Button } from "@/components/ui/button";
import { ViewControls } from "@/components/view-controls";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { formatPrice } from "@/lib/format";
import { useConfigurator, useTotals } from "@/lib/store";

/**
 * One route, three steps held in the store rather than in the URL. Navigating
 * between routes would tear down the WebGL context and re-run the ignition
 * animation on every click; keeping the canvas mounted is the whole reason the
 * preview feels live while the visitor configures.
 *
 * The shell is sized to the viewport rather than to its content: a configurator
 * whose preview scrolls off the top is a page with a picture on it, and the
 * point here is that the bike stays in front of the visitor while they change
 * what is on it.
 */
export function Configurator({ t, locale }: { t: Dictionary; locale: Locale }) {
  const step = useConfigurator((s) => s.step);
  const next = useConfigurator((s) => s.next);
  const back = useConfigurator((s) => s.back);
  const totals = useTotals();
  const [soldOut, setSoldOut] = useState<ReadonlySet<string>>(() => new Set());

  // The store is created with `skipHydration`, so a returning visitor's saved
  // configuration is pulled in here, after the first render has matched the
  // server's.
  useEffect(() => {
    void useConfigurator.persist.rehydrate();
  }, []);

  // Availability is the one thing on this page that cannot be prerendered, so
  // it is fetched once here and read by both steps. A failure leaves the set
  // empty and the funnel behaves as it did before: the checkout route holds the
  // authoritative answer either way.
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/stock", { signal: controller.signal })
      .then((response) => response.json() as Promise<{ soldOut: string[] }>)
      .then((data) => setSoldOut(new Set(data.soldOut)))
      .catch(() => {
        /* advisory only */
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="pt-[var(--header-h)]">
      <div className="lg:grid lg:h-[calc(100svh-var(--header-h))] lg:grid-cols-[minmax(0,1fr)_minmax(25rem,30rem)]">
        <div className="sticky top-[var(--header-h)] z-10 h-[44svh] lg:top-0 lg:h-full">
          <div className="grain glow-pool relative h-full border-b border-line lg:border-r lg:border-b-0">
            <ShowroomCanvas
              className="absolute inset-0"
              overlay={<ViewControls t={t} />}
              labels={{
                loading: t.hero.loading,
                fallback: t.hero.fallback,
                micDenied: t.modes.micDenied,
              }}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-6">
              <div className="pointer-events-auto">
                <ModeSwitch t={t} />
              </div>
            </div>
          </div>
        </div>

        {/* `min-h-0` is what lets the scroller shrink inside the grid row on
            large screens. Without it the column grows to fit its content and
            the whole page scrolls again, canvas included. */}
        <div className="relative z-20 flex min-h-0 flex-col bg-ink lg:h-full">
          <div className="flex-1 overflow-y-auto px-5 py-8 sm:px-8 lg:py-10">
            <div className="mx-auto flex max-w-lg flex-col gap-8">
              <Progress t={t} />
              <BuildReadout t={t} locale={locale} />

              {step === "bike" && <StepBike t={t} />}
              {step === "kit" && <StepKit t={t} locale={locale} soldOut={soldOut} />}
              {step === "review" && <StepReview t={t} locale={locale} soldOut={soldOut} />}
            </div>
          </div>

          {step !== "review" && (
            <div className="sticky bottom-0 border-t border-line bg-ink px-5 py-4 sm:px-8">
              <div className="mx-auto flex max-w-lg items-center gap-3">
                {step !== "bike" && (
                  <Button variant="ghost" onClick={back}>
                    {t.funnel.back}
                  </Button>
                )}
                <Button onClick={next} className="flex-1">
                  {t.funnel.next}
                  <span className="opacity-70" data-numeric>
                    {formatPrice(totals.totalCents, locale)}
                  </span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
