"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type AddonId, type BikeId, type CartTotals, type KitId, priceCart } from "@/lib/catalog";
import { getLedMode, type LedModeId } from "@/lib/led-modes";

export type FunnelStep = "bike" | "kit" | "review";

export const FUNNEL_STEPS: readonly FunnelStep[] = ["bike", "kit", "review"] as const;

type ConfiguratorState = {
  bikeId: BikeId;
  kitId: KitId;
  addonIds: AddonId[];
  modeId: LedModeId;
  /** Base colour for solid and breathe. */
  color: string;
  /** Real microphone input, opt-in. Falls back to a synthetic groove. */
  micEnabled: boolean;
  step: FunnelStep;

  setBike: (id: BikeId) => void;
  setKit: (id: KitId) => void;
  toggleAddon: (id: AddonId) => void;
  setMode: (id: LedModeId) => void;
  setColor: (hex: string) => void;
  setMicEnabled: (enabled: boolean) => void;
  goTo: (step: FunnelStep) => void;
  next: () => void;
  back: () => void;
};

/**
 * Persisted to sessionStorage so a visitor who bounces off Stripe Checkout and
 * comes back still has their configuration.
 *
 * `skipHydration` matters: rehydrating during store creation would make the
 * first client render disagree with the server's, so the Configurator calls
 * `rehydrate()` from an effect instead.
 */
export const useConfigurator = create<ConfiguratorState>()(
  persist(
    (set) => ({
      bikeId: "roadster",
      kitId: "signature",
      addonIds: [],
      modeId: "sound",
      color: "#3be8ff",
      micEnabled: false,
      step: "bike",

      setBike: (bikeId) => set({ bikeId }),
      // The ride mode needs the GPS module; dropping to the core kit has to drop
      // the mode with it or the preview would sell hardware that is not in the box.
      setKit: (kitId) =>
        set((s) => ({
          kitId,
          modeId: kitId === "core" && getLedMode(s.modeId)?.requiresGps ? "sound" : s.modeId,
        })),
      toggleAddon: (id) =>
        set((s) => ({
          addonIds: s.addonIds.includes(id)
            ? s.addonIds.filter((a) => a !== id)
            : [...s.addonIds, id],
        })),
      setMode: (modeId) => set({ modeId }),
      setColor: (color) => set({ color }),
      setMicEnabled: (micEnabled) => set({ micEnabled }),
      goTo: (step) => set({ step }),
      next: () =>
        set((s) => {
          const i = FUNNEL_STEPS.indexOf(s.step);
          return { step: FUNNEL_STEPS[Math.min(i + 1, FUNNEL_STEPS.length - 1)] ?? s.step };
        }),
      back: () =>
        set((s) => {
          const i = FUNNEL_STEPS.indexOf(s.step);
          return { step: FUNNEL_STEPS[Math.max(i - 1, 0)] ?? s.step };
        }),
    }),
    {
      name: "rideglow.configuration",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      // The funnel step and the microphone permission are per-visit state, not
      // part of what the visitor configured.
      partialize: (s) => ({
        bikeId: s.bikeId,
        kitId: s.kitId,
        addonIds: s.addonIds,
        modeId: s.modeId,
        color: s.color,
      }),
    },
  ),
);

/** Client-side preview of the total. The checkout route recomputes it. */
export function useTotals(): CartTotals {
  const kitId = useConfigurator((s) => s.kitId);
  const bikeId = useConfigurator((s) => s.bikeId);
  const addonIds = useConfigurator((s) => s.addonIds);
  return priceCart({ bikeId, kitId, addonIds });
}
