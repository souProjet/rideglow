"use client";

import { useEffect } from "react";
import { Progress } from "@/components/funnel/progress";
import { StepBike } from "@/components/funnel/step-bike";
import { StepKit } from "@/components/funnel/step-kit";
import { StepReview } from "@/components/funnel/step-review";
import { ModeSwitch } from "@/components/mode-switch";
import { ShowroomCanvas } from "@/components/three/showroom-loader";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { formatPrice } from "@/lib/format";
import { useConfigurator, useTotals } from "@/lib/store";

/**
 * One route, three steps held in the store rather than in the URL. Navigating
 * between routes would tear down the WebGL context and re-run the ignition
 * animation on every click; keeping the canvas mounted is the whole reason the
 * preview feels live while the visitor configures.
 */
export function Configurator({ t, locale }: { t: Dictionary; locale: Locale }) {
  const step = useConfigurator((s) => s.step);
  const next = useConfigurator((s) => s.next);
  const back = useConfigurator((s) => s.back);
  const totals = useTotals();

  // The store is created with `skipHydration`, so a returning visitor's saved
  // configuration is pulled in here, after the first render has matched the
  // server's.
  useEffect(() => {
    void useConfigurator.persist.rehydrate();
  }, []);

  return (
    <div className="lg:grid lg:min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(26rem,32rem)]">
      <div className="sticky top-16 z-10 h-[46svh] lg:top-0 lg:h-svh">
        <div className="grain glow-pool relative h-full border-b border-line lg:border-r lg:border-b-0">
          <ShowroomCanvas
            className="absolute inset-0"
            labels={{
              loading: t.hero.loading,
              fallback: t.hero.fallback,
              micDenied: t.modes.micDenied,
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <div className="pointer-events-auto">
              <ModeSwitch t={t} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 bg-ink px-5 py-10 sm:px-8 lg:overflow-y-auto lg:py-14">
        <div className="mx-auto flex max-w-lg flex-col gap-10">
          <Progress t={t} />

          {step === "bike" && <StepBike t={t} />}
          {step === "kit" && <StepKit t={t} locale={locale} />}
          {step === "review" && <StepReview t={t} locale={locale} />}

          {step !== "review" && (
            <div className="flex items-center gap-3 border-t border-line pt-6">
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
          )}
        </div>
      </div>
    </div>
  );
}
