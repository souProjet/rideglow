"use client";

import type { Dictionary } from "@/i18n";
import { FUNNEL_STEPS, useConfigurator } from "@/lib/store";

const LABELS = {
  bike: (t: Dictionary) => t.bikes.title,
  kit: (t: Dictionary) => t.kits.title,
  review: (t: Dictionary) => t.review.title,
} as const;

export function Progress({ t }: { t: Dictionary }) {
  const step = useConfigurator((s) => s.step);
  const goTo = useConfigurator((s) => s.goTo);
  const current = FUNNEL_STEPS.indexOf(step);

  return (
    <nav aria-label={t.funnel.step} className="space-y-3">
      <p className="type-eyebrow" data-numeric>
        {t.funnel.step} {current + 1} {t.funnel.of} {FUNNEL_STEPS.length}
      </p>

      <ol className="flex gap-2">
        {FUNNEL_STEPS.map((id, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                // Going back is always allowed, going forward is not: the next
                // step depends on a choice that has not been made yet.
                disabled={i > current}
                onClick={() => goTo(id)}
                aria-current={active ? "step" : undefined}
                className="group w-full text-left disabled:cursor-default"
              >
                {/* The rule draws itself rather than changing color: a scaleX
                    is composited, and it reads as the step being completed
                    rather than as a light coming on. */}
                <span className="block h-0.5 w-full overflow-hidden bg-line">
                  <span
                    className={`block h-full w-full origin-left bg-glow transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                      active || done ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </span>
                <span
                  className={`mt-2 block text-[0.75rem] transition-colors ${
                    active
                      ? "text-chalk"
                      : done
                        ? "text-chalk-dim group-hover:text-chalk"
                        : "text-line-bright"
                  }`}
                >
                  {LABELS[id](t)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
