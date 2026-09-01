"use client";

import { PixelRow } from "@/components/pixel-row";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { formatNumber } from "@/lib/format";
import { useBuildSummary } from "@/lib/store";

/**
 * What the current selection amounts to, in the two units a buyer can check
 * against their own bike before paying: how many LEDs, how much tape.
 *
 * The pixel row above the numbers is the LED count drawn at one pixel per LED,
 * so adding the extension add-on visibly lengthens the strip instead of only
 * moving a price.
 */
export function BuildReadout({ t, locale }: { t: Dictionary; locale: Locale }) {
  const build = useBuildSummary();

  return (
    <section aria-label={t.build.title} className="space-y-3">
      <PixelRow count={build.ledCount} />

      <dl className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[0.75rem] text-chalk-dim">
        <div className="flex items-baseline gap-1.5">
          <dt className="sr-only">{t.build.leds}</dt>
          <dd className="text-chalk" data-numeric>
            {build.ledCount}
          </dd>
          <span aria-hidden>{t.build.leds}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <dt className="sr-only">{t.build.length}</dt>
          <dd className="text-chalk" data-numeric>
            {formatNumber(build.totalMm, locale)} mm
          </dd>
          <span aria-hidden>{t.build.length}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <dt className="sr-only">{t.build.runs}</dt>
          <dd className="text-chalk" data-numeric>
            {build.runs}
          </dd>
          <span aria-hidden>{t.build.runs}</span>
        </div>
      </dl>
    </section>
  );
}
