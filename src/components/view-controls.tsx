"use client";

import type { Dictionary } from "@/i18n";
import { useConfigurator, VIEWS } from "@/lib/store";

/**
 * Camera presets, laid out like the view selector on a workshop rig rather than
 * as buttons on a page: hairline dividers, no fills, and the active angle
 * marked by the glow rule under it.
 *
 * Free orbit stays available underneath. These exist because a buyer checking
 * where a strip sits wants the side and the front on demand, and finding those
 * by dragging is guesswork.
 */
export function ViewControls({ t }: { t: Dictionary }) {
  const view = useConfigurator((s) => s.view);
  const setView = useConfigurator((s) => s.setView);
  const autoRotate = useConfigurator((s) => s.autoRotate);
  const setAutoRotate = useConfigurator((s) => s.setAutoRotate);

  return (
    <div className="flex items-stretch overflow-hidden rounded-card border border-line/80 bg-ink/70 backdrop-blur-md">
      <fieldset className="flex">
        <legend className="sr-only">{t.showroom.viewLabel}</legend>
        {VIEWS.map((id) => {
          const active = id === view;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              aria-pressed={active}
              className={`relative px-3 py-2 text-[0.6875rem] tracking-[0.08em] uppercase transition-colors ${
                active ? "text-chalk" : "text-chalk-dim hover:text-chalk"
              }`}
            >
              {t.showroom.views[id]}
              <span
                aria-hidden
                className={`absolute inset-x-2 bottom-1 h-px transition-colors ${
                  active ? "bg-glow" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </fieldset>

      <button
        type="button"
        onClick={() => setAutoRotate(!autoRotate)}
        aria-pressed={autoRotate}
        title={t.showroom.autoRotate}
        className={`flex items-center gap-1.5 border-l border-line/80 px-3 py-2 text-[0.6875rem] tracking-[0.08em] uppercase transition-colors ${
          autoRotate ? "text-chalk" : "text-chalk-dim hover:text-chalk"
        }`}
      >
        <span
          aria-hidden
          className="size-1.5 rounded-full transition-colors"
          style={{ background: autoRotate ? "var(--glow)" : "var(--line-bright)" }}
        />
        <span className="hidden sm:inline">{t.showroom.autoRotate}</span>
      </button>
    </div>
  );
}
