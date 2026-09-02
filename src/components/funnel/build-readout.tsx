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
 * The pixel row above the numbers is the build drawn at a fixed pitch, so a
 * bigger kit reads as a denser strip rather than only as a different price.
 * One cell per LED is what it used to be, and it does not fit: the cells have
 * a 1px floor and a 1px gap, so a 315-LED build demanded 629px inside a 318px
 * panel and took the page sideways with it.
 */
const LEDS_PER_CELL = 8;
export function BuildReadout({ t, locale }: { t: Dictionary; locale: Locale }) {
  const build = useBuildSummary();

  return (
    <section aria-label={t.build.title} className="space-y-3">
      <PixelRow count={Math.round(build.ledCount / LEDS_PER_CELL)} />

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
