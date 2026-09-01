import type { Color } from "three";

/**
 * The lighting programs the controller actually ships with. One function per
 * mode, shading a single LED at a time so the showroom, the configurator
 * preview and (later) the firmware simulator all agree on what a mode looks
 * like.
 *
 * `shade` writes into `out` instead of returning a Color: it runs
 * ~90 LEDs x 60 fps, and allocating there is what turns a smooth canvas into a
 * garbage-collection stutter.
 */

export type LedModeId = "sound" | "ride" | "spectrum" | "breathe" | "solid";

export type LedFrame = {
  /** Seconds since the canvas mounted. */
  t: number;
  /** Overall audio level, 0..1. */
  energy: number;
  /** Normalised spectrum, low to high. */
  bands: Float32Array;
  /** Simulated road speed, 0..1. */
  speed: number;
  /** Lean angle, -1 (full left) .. 1 (full right). */
  lean: number;
  /** The color the visitor picked, used by solid and breathe. */
  base: Color;
};

export type LedMode = {
  id: LedModeId;
  /** Hex fed to `--glow`, so the whole interface takes the mode's color. */
  accent: string;
  /** Signature-kit only: needs the GPS + IMU module. */
  requiresGps: boolean;
  shade(out: Color, i: number, n: number, strip: number, frame: LedFrame): void;
};

const TAU = Math.PI * 2;
const hsl = { h: 0, s: 0, l: 0 };

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export const LED_MODES: readonly LedMode[] = [
  {
    id: "sound",
    accent: "#ff2d9b",
    requiresGps: false,
    shade(out, i, n, strip, f) {
      // Each LED owns a slice of the spectrum, low frequencies at the front of
      // the bike. Brightness is that band; hue climbs with frequency so a bass
      // hit floods the nose magenta and hats flick the tail cyan.
      const pos = n > 1 ? i / (n - 1) : 0;
      const band = f.bands[Math.min(f.bands.length - 1, (pos * f.bands.length) | 0)] ?? 0;
      const level = clamp01(band * 0.75 + f.energy * 0.35);
      out.setHSL(0.9 - pos * 0.42, 0.95, 0.04 + level * 0.5);
      // Mirror strips beat together rather than drifting apart.
      if (strip % 2 === 1) out.multiplyScalar(0.92);
    },
  },
  {
    id: "ride",
    accent: "#3be8ff",
    requiresGps: true,
    shade(out, i, n, strip, f) {
      const pos = n > 1 ? i / (n - 1) : 0;
      // Light streams backwards, faster as speed climbs: the visual grammar of
      // motion everyone already reads.
      const stream = 0.5 + 0.5 * Math.sin((pos * 6 - f.t * (1.5 + f.speed * 7)) * TAU * 0.16);
      // Lean lights up the inside of the corner. Even strips are the left side.
      const side = strip % 2 === 0 ? -1 : 1;
      const inside = clamp01(f.lean * side) * 0.55;
      const hue = 0.52 - f.speed * 0.14 + Math.abs(f.lean) * 0.06;
      out.setHSL(hue, 0.9, 0.06 + stream * 0.28 + inside);
    },
  },
  {
    id: "spectrum",
    accent: "#7c5cff",
    requiresGps: false,
    shade(out, i, n, strip, f) {
      const pos = n > 1 ? i / (n - 1) : 0;
      out.setHSL((pos * 0.55 + f.t * 0.11 + strip * 0.07) % 1, 0.92, 0.42);
    },
  },
  {
    id: "breathe",
    accent: "#ff8a3d",
    requiresGps: false,
    shade(out, i, n, _strip, f) {
      const pos = n > 1 ? i / (n - 1) : 0;
      // A slow swell with a lag along the strip, so it inhales nose to tail
      // instead of blinking as one block.
      const swell = 0.5 + 0.5 * Math.sin(f.t * 1.5 - pos * 1.1);
      f.base.getHSL(hsl);
      out.setHSL(hsl.h, hsl.s, 0.05 + swell * 0.4);
    },
  },
  {
    id: "solid",
    accent: "#e8eaed",
    requiresGps: false,
    shade(out, _i, _n, _strip, f) {
      // Normalised to the same lightness ceiling as the animated modes, so
      // switching to solid does not double the brightness of the whole bike.
      f.base.getHSL(hsl);
      out.setHSL(hsl.h, hsl.s, Math.min(hsl.l, 0.45));
    },
  },
] as const;

export function getLedMode(id: string): LedMode | undefined {
  return LED_MODES.find((m) => m.id === id);
}

export function isLedModeId(value: unknown): value is LedModeId {
  return typeof value === "string" && LED_MODES.some((m) => m.id === value);
}

/** Presets for the solid/breathe color picker. */
export const PRESET_COLORS = [
  "#3be8ff",
  "#7c5cff",
  "#ff2d9b",
  "#ff3b30",
  "#ff8a3d",
  "#3dff8a",
  "#ffffff",
] as const;
