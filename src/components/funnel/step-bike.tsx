"use client";

import { PixelRow } from "@/components/pixel-row";
import type { Dictionary } from "@/i18n";
import { BIKES, bikeLedCount } from "@/lib/catalog";
import { useConfigurator } from "@/lib/store";

/**
 * The card's row is a comparison bar, not a literal LED count: every card draws
 * the same number of cells and lights the share this bike takes of the longest
 * build. Drawing one cell per LED needed 307 px of minimum width in a 182 px
 * card, and the row leaked out past the panel on desktop.
 */
const ROW_CELLS = 34;
const MAX_LEDS = Math.max(...BIKES.map(bikeLedCount));

export function StepBike({ t }: { t: Dictionary }) {
  const bikeId = useConfigurator((s) => s.bikeId);
  const setBike = useConfigurator((s) => s.setBike);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="type-display text-[1.5rem]">{t.bikes.title}</h2>
        <p className="text-[0.9375rem] leading-relaxed text-chalk-dim">{t.bikes.lede}</p>
      </header>

      {/* Real radio inputs rather than buttons with role="radio": arrow-key
          navigation inside the group then comes from the browser. */}
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="sr-only">{t.bikes.title}</legend>
        {BIKES.map((bike) => {
          const selected = bike.id === bikeId;
          const copy = t.bikes.items[bike.id];
          return (
            <label
              key={bike.id}
              className={`cursor-pointer rounded-card border p-4 transition-[border-color,background-color] duration-200 ease-[var(--ease-out-expo)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-glow ${
                selected
                  ? "border-glow bg-glow-faint"
                  : "border-line hover:border-line-bright hover:bg-ink-raised"
              }`}
            >
              <input
                type="radio"
                name="bike"
                value={bike.id}
                checked={selected}
                onChange={() => setBike(bike.id)}
                className="sr-only"
              />

              <PixelRow
                count={ROW_CELLS}
                lit={selected ? Math.round((bikeLedCount(bike) / MAX_LEDS) * ROW_CELLS) : 0}
                className="mb-4 opacity-90"
              />

              <span className="block text-[1.0625rem] font-semibold text-chalk">{copy.name}</span>
              <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-chalk-dim">
                {copy.blurb}
              </span>

              {/* A spec block, label over value, so a two-word run name can wrap
                  without ever splitting the measurement it belongs to. */}
              <span className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-3">
                {bike.stripRuns.map((run) => (
                  <span key={run.label} className="flex flex-col gap-0.5">
                    <span className="text-[0.5625rem] uppercase leading-tight tracking-[0.14em] text-chalk-dim">
                      {t.bikes.stripRuns[run.label as keyof typeof t.bikes.stripRuns]}
                    </span>
                    <span className="whitespace-nowrap text-[0.75rem] text-chalk" data-numeric>
                      {run.mm} mm
                    </span>
                  </span>
                ))}
                <span className="flex flex-col gap-0.5">
                  <span className="text-[0.5625rem] uppercase leading-tight tracking-[0.14em] text-chalk-dim">
                    {t.bikes.ledCount}
                  </span>
                  <span className="whitespace-nowrap text-[0.75rem] text-chalk" data-numeric>
                    {bikeLedCount(bike)}
                  </span>
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
