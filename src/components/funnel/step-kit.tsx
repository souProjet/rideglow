"use client";

import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { ADDONS, KITS } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { useConfigurator } from "@/lib/store";

export function StepKit({
  t,
  locale,
  soldOut,
}: {
  t: Dictionary;
  locale: Locale;
  soldOut: ReadonlySet<string>;
}) {
  const kitId = useConfigurator((s) => s.kitId);
  const setKit = useConfigurator((s) => s.setKit);
  const addonIds = useConfigurator((s) => s.addonIds);
  const toggleAddon = useConfigurator((s) => s.toggleAddon);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="type-display text-[1.75rem]">{t.kits.title}</h2>
        <p className="text-[0.9375rem] leading-relaxed text-chalk-dim">{t.kits.lede}</p>
      </header>

      {/* Real radio inputs rather than buttons with role="radio": arrow-key
          navigation inside the group then comes from the browser. */}
      <fieldset className="grid gap-3">
        <legend className="sr-only">{t.kits.title}</legend>
        {KITS.map((kit) => {
          const selected = kit.id === kitId;
          const copy = t.kits.items[kit.id];
          // A sold-out kit that is already selected stays selectable: it is the
          // visitor's current state, and the review step is where they are told
          // it cannot be paid for.
          const out = soldOut.has(`kit:${kit.id}`);
          const locked = out && !selected;
          return (
            <label
              key={kit.id}
              className={[
                "relative rounded-card border p-5 transition-[border-color,background-color,opacity] duration-200 ease-[var(--ease-out-expo)]",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-glow",
                locked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                selected ? "border-glow bg-glow-faint" : "border-line",
                !selected && !locked ? "hover:border-line-bright hover:bg-ink-raised" : "",
              ].join(" ")}
            >
              <input
                type="radio"
                name="kit"
                value={kit.id}
                checked={selected}
                disabled={locked}
                onChange={() => setKit(kit.id)}
                className="sr-only"
              />

              {out ? (
                <span
                  className="absolute -top-2 right-4 border border-line-bright bg-ink px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-chalk-dim"
                  data-numeric
                >
                  {t.kits.soldOut}
                </span>
              ) : (
                kit.recommended && (
                  <span
                    className="absolute -top-2 right-4 bg-glow px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-ink"
                    data-numeric
                  >
                    {t.kits.recommended}
                  </span>
                )
              )}

              <span className="flex items-baseline justify-between gap-4">
                <span className="text-[1.125rem] font-semibold text-chalk">{copy.name}</span>
                <span className="text-[1.125rem] font-semibold text-chalk" data-numeric>
                  {formatPrice(kit.priceCents, locale)}
                </span>
              </span>

              <span className="mt-1.5 block text-[0.875rem] text-chalk-dim">{copy.blurb}</span>
              <span className="mt-1 block text-[0.75rem] text-chalk-dim" data-numeric>
                {kit.strips} {t.kits.strips}
              </span>

              <span className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4">
                {kit.features.map((feature) => (
                  <span
                    key={feature}
                    className="flex items-start gap-2 text-[0.8125rem] text-chalk-dim"
                  >
                    <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-glow" />
                    {t.kits.features[feature as keyof typeof t.kits.features]}
                  </span>
                ))}
              </span>
            </label>
          );
        })}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="type-eyebrow mb-3">{t.kits.addonsTitle}</legend>
        {ADDONS.map((addon) => {
          const checked = addonIds.includes(addon.id);
          const copy = t.kits.addons[addon.id];
          // Unticking a sold-out add-on has to stay possible: it is the way out
          // of a selection that can no longer be paid for.
          const out = soldOut.has(`addon:${addon.id}`);
          const locked = out && !checked;
          return (
            <label
              key={addon.id}
              className={[
                "flex items-start gap-3 rounded-card border p-4 transition-colors",
                locked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                checked ? "border-glow bg-glow-faint" : "border-line",
                !checked && !locked ? "hover:border-line-bright" : "",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={locked}
                onChange={() => toggleAddon(addon.id)}
                className="mt-1 size-4 shrink-0 accent-[var(--glow)]"
              />
              <span className="flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-[0.9375rem] font-medium text-chalk">
                    {copy.name}
                    {out && (
                      <span className="ml-2 text-[0.6875rem] uppercase tracking-[0.12em] text-chalk-dim">
                        {t.kits.soldOut}
                      </span>
                    )}
                  </span>
                  <span className="text-[0.875rem] text-chalk" data-numeric>
                    +{formatPrice(addon.priceCents, locale)}
                  </span>
                </span>
                <span className="mt-1 block text-[0.8125rem] text-chalk-dim">{copy.blurb}</span>
              </span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
