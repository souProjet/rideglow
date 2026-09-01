"use client";

import type { Dictionary } from "@/i18n";
import { LED_MODES, PRESET_COLORS } from "@/lib/led-modes";
import { useConfigurator } from "@/lib/store";

/**
 * The hero's control surface, laid out like the switchgear on a left-hand
 * commodo: the visitor changes the mode before reading a single line of copy.
 */
export function ModeSwitch({ t }: { t: Dictionary }) {
  const modeId = useConfigurator((s) => s.modeId);
  const setMode = useConfigurator((s) => s.setMode);
  const kitId = useConfigurator((s) => s.kitId);
  const color = useConfigurator((s) => s.color);
  const setColor = useConfigurator((s) => s.setColor);
  const micEnabled = useConfigurator((s) => s.micEnabled);
  const setMicEnabled = useConfigurator((s) => s.setMicEnabled);

  const active = LED_MODES.find((m) => m.id === modeId) ?? LED_MODES[0];
  if (!active) return null;
  const showPalette = modeId === "solid" || modeId === "breathe";

  return (
    <div className="space-y-5">
      {/* Real radio inputs rather than buttons with role="radio": arrow-key
          navigation along the row then comes from the browser. */}
      <fieldset className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <legend className="sr-only">{t.modes.title}</legend>
        {LED_MODES.map((mode) => {
          const isActive = mode.id === modeId;
          const locked = mode.requiresGps && kitId === "core";
          return (
            <label
              key={mode.id}
              className={`flex shrink-0 cursor-pointer snap-start items-center gap-2 rounded-card border px-4 py-2.5 text-[0.8125rem] font-medium transition-all duration-200 ease-[var(--ease-out-expo)] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-35 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-glow ${
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
        <p
          key={active.id}
          className="max-w-md text-pretty text-[0.875rem] leading-relaxed text-chalk-dim"
        >
          {t.modes.items[active.id].blurb}
        </p>

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

      {showPalette && (
        <fieldset className="flex items-center gap-3">
          <legend className="sr-only">{t.modes.colorLabel}</legend>
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setColor(preset)}
              aria-label={preset}
              aria-pressed={color.toLowerCase() === preset}
              className={`size-6 rounded-full border transition-transform duration-200 hover:scale-110 ${
                color.toLowerCase() === preset ? "border-chalk scale-110" : "border-line"
              }`}
              style={{ backgroundColor: preset }}
            />
          ))}
        </fieldset>
      )}
    </div>
  );
}
