"use client";

import { useEffect } from "react";
import { getLedMode } from "@/lib/led-modes";
import { useConfigurator } from "@/lib/store";

/**
 * Repaints the whole interface in the colour of the selected lighting mode.
 *
 * It follows the *mode*, not the live average of the strip: in sound mode the
 * average swings on every kick, and an accent colour that strobes with the bass
 * is unreadable and hostile to anyone photosensitive.
 */
export function GlowSync() {
  const modeId = useConfigurator((s) => s.modeId);
  const color = useConfigurator((s) => s.color);

  useEffect(() => {
    const mode = getLedMode(modeId);
    if (!mode) return;
    const accent = mode.id === "solid" || mode.id === "breathe" ? color : mode.accent;
    document.documentElement.style.setProperty("--glow", accent);
  }, [modeId, color]);

  return null;
}
