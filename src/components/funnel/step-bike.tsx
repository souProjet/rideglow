"use client";

import type { Dictionary } from "@/i18n";
import { BIKES } from "@/lib/catalog";
import { useConfigurator } from "@/lib/store";

export function StepBike({ t }: { t: Dictionary }) {
  const bikeId = useConfigurator((s) => s.bikeId);
  const setBike = useConfigurator((s) => s.setBike);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="type-display text-[1.75rem]">{t.bikes.title}</h2>
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
              className={`cursor-pointer rounded-card border p-5 transition-all duration-200 ease-[var(--ease-out-expo)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-glow ${
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
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-[1.0625rem] font-semibold text-chalk">{copy.name}</span>
                <span className="text-[0.75rem] text-chalk-dim" data-numeric>
                  {bike.ledCount}
                </span>
              </span>
              <span className="mt-2 block text-[0.8125rem] leading-relaxed text-chalk-dim">
                {copy.blurb}
              </span>

              <span className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                {bike.stripRuns.map((run) => (
                  <span
                    key={run.label}
                    className="text-[0.6875rem] uppercase tracking-[0.1em] text-chalk-dim"
                    data-numeric
                  >
                    {t.bikes.stripRuns[run.label as keyof typeof t.bikes.stripRuns]} {run.mm} mm
                  </span>
                ))}
              </span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
