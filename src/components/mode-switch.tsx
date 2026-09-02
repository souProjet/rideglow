"use client";

import type { Dictionary } from "@/i18n";
import { LED_MODES, PRESET_COLORS } from "@/lib/led-modes";
import { useConfigurator } from "@/lib/store";

/**
 * The hero's control surface, laid out like the switchgear on a left-hand
 * commodo: the visitor changes the mode before reading a single line of copy.
 */
/**
 * `compact` drops the mode blurb. The configurator overlays this on a 44svh
 * canvas, where the chips, the blurb, the mic button and the swatches together
 * took ~300px of a 371px canvas and left no bike visible behind them.
 */
export function ModeSwitch({ t, compact = false }: { t: Dictionary; compact?: boolean }) {
  const modeId = useConfigurator((s) => s.modeId);
  const setMode = useConfigurator((s) => s.setMode);
  const kitId = useConfigurator((s) => s.kitId);
  const color = useConfigurator((s) => s.color);
  const setColor = useConfigurator((s) => s.setColor);
  const micEnabled = useConfigurator((s) => s.micEnabled);
  const setMicEnabled = useConfigurator((s) => s.setMicEnabled);

  const active = LED_MODES.find((m) => m.id === modeId) ?? LED_MODES[0];
  if (!active) return null;
  // Chase, sound and GPS write their own colors, but hiding the palette on
  // those modes made it look like the control had disappeared. It stays put and
  // says why it is idle instead.
  const usesColor = modeId === "solid" || modeId === "breathe";

  return (
    <div className="space-y-5">
      {/* Real radio inputs rather than buttons with role="radio": arrow-key
          navigation along the row then comes from the browser. */}
      {/* min-w-0 is load-bearing: Chrome's UA sheet gives every fieldset
          min-inline-size: min-content, which defeats overflow-x and stretched
          the row to 591px inside a 390px viewport, taking the page with it. */}
      <fieldset className="-mx-5 flex min-w-0 snap-x gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <legend className="sr-only">{t.modes.title}</legend>
        {LED_MODES.map((mode) => {
          const isActive = mode.id === modeId;
          const locked = mode.requiresGps && kitId === "core";
          return (
            <label
              key={mode.id}
              className={`flex shrink-0 cursor-pointer snap-start items-center gap-2 rounded-card border px-4 py-2.5 text-[0.8125rem] font-medium transition-[border-color,background-color,color,opacity] duration-200 ease-[var(--ease-out-expo)] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-35 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-glow ${
                isActive
                  ? "border-glow bg-glow-faint text-chalk"
                  : "border-line text-chalk-dim hover:border-line-bright hover:text-chalk"
              }`}
            >
              <input
                type="radio"
                name="mode"
                value={mode.id}
                checked={isActive}
                disabled={locked}
                onChange={() => setMode(mode.id)}
                className="sr-only"
              />
              <span
                aria-hidden
                className="size-1.5 rounded-full transition-colors"
                style={{ backgroundColor: isActive ? "var(--glow)" : "var(--line-bright)" }}
              />
              {t.modes.items[mode.id].name}
              {mode.requiresGps && (
                <span
                  className="ml-0.5 text-[0.5625rem] uppercase tracking-[0.14em] text-chalk-dim"
                  data-numeric
                >
                  {t.modes.gpsBadge}
                </span>
              )}
            </label>
          );
        })}
      </fieldset>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {!compact && (
          <p
            key={active.id}
            className="max-w-md text-pretty text-[0.875rem] leading-relaxed text-chalk-dim"
          >
            {t.modes.items[active.id].blurb}
          </p>
        )}

        {modeId === "sound" && (
          <button
            type="button"
            onClick={() => setMicEnabled(!micEnabled)}
            aria-pressed={micEnabled}
            className={`shrink-0 rounded-card border px-4 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.1em] transition-colors ${
              micEnabled
                ? "border-glow bg-glow text-ink"
                : "border-line text-chalk-dim hover:border-glow hover:text-glow"
            }`}
          >
            {micEnabled ? t.modes.micActive : t.modes.micPrompt}
          </button>
        )}
      </div>

      <fieldset
        className={`flex flex-wrap items-center gap-x-3 gap-y-2 transition-opacity duration-300 ${
          usesColor ? "" : "opacity-45"
        }`}
      >
        <legend className="sr-only">{t.modes.colorLabel}</legend>
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setColor(preset)}
            aria-label={preset}
            aria-pressed={color.toLowerCase() === preset}
            className={`size-6 rounded-full border transition-transform duration-200 hover:scale-110 ${
              color.toLowerCase() === preset ? "scale-110 border-chalk" : "border-line"
            }`}
            style={{ backgroundColor: preset }}
          />
        ))}
        {!usesColor && (
          <span className="max-w-xs text-[0.6875rem] leading-snug text-chalk-dim">
            {t.build.ignoresColor}
          </span>
        )}
      </fieldset>
    </div>
  );
}
