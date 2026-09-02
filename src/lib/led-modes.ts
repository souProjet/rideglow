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
      // the bike. Hue climbs with frequency so a bass hit floods the nose
      // magenta and hats flick the tail cyan.
      const pos = n > 1 ? i / (n - 1) : 0;
      const band = f.bands[Math.min(f.bands.length - 1, (pos * f.bands.length) | 0)] ?? 0;
      // Squared, not linear. Mapping the band straight onto lightness put every
      // LED in the middle of its range and the tape sat there glowing: over
      // 450 ms it changed 193 sampled pixels, against 13k for breathe. The
      // square pushes the gaps between hits toward black, which is the contrast
      // that makes a run read as reacting rather than lit.
      const attack = band * band;
      // The kick also travels. A bass transient runs nose to tail twice a
      // second, so the bike pulses in sequence instead of flashing as one
      // block, and there is motion on screen even on a flat passage.
      const head = (f.t * 2.2 + strip * 0.05) % 1;
      const kick = Math.max(0, 1 - Math.abs(pos - head) * 6);
      const level = clamp01(attack * 1.6 + f.energy * 0.25 + kick * 0.55);
      out.setHSL(0.9 - pos * 0.42 - kick * 0.12, 0.95, 0.02 + level * 0.6);
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
      // motion everyone already reads. A comet rather than a sine, because a
      // sine spends most of its period mid-brightness and the run reads as a
      // gradient shifting under itself. Raising it to the fourth packs the
      // light into a short head with a tail behind it, which is what running
      // lights look like on real tape.
      const travel = (((pos - f.t * (0.28 + f.speed * 0.9) + strip * 0.09) % 1) + 1) % 1;
      const comet = travel * travel * travel * travel;
      // Lean lights up the inside of the corner. Even strips are the left side.
      const side = strip % 2 === 0 ? -1 : 1;
      const inside = clamp01(f.lean * side) * 0.55;
      const hue = 0.52 - f.speed * 0.14 + Math.abs(f.lean) * 0.06;
      out.setHSL(hue, 0.9, 0.05 + comet * 0.42 + inside);
    },
  },
  {
    id: "spectrum",
    accent: "#7c5cff",
    requiresGps: false,
    shade(out, i, n, strip, f) {
      const pos = n > 1 ? i / (n - 1) : 0;
      // Two things move. The rainbow scrolls, at 0.3 rather than the 0.11 it
      // used to: a full cycle took nine seconds, which is slower than anyone
      // watches a preview for. And a brighter node travels along with it, so
      // the mode reads as addressable rather than as a gradient someone painted
      // on the tape.
      const hue = (pos * 0.5 + f.t * 0.3 + strip * 0.08) % 1;
      const node = 0.5 + 0.5 * Math.sin((pos * 2 - f.t * 0.75 + strip * 0.15) * TAU);
      out.setHSL(hue, 0.92, 0.14 + node * node * 0.36);
    },
  },
  {
    id: "breathe",
    accent: "#ff8a3d",
    requiresGps: false,
    shade(out, i, n, strip, f) {
      const pos = n > 1 ? i / (n - 1) : 0;
      // A slow swell with a lag along the strip and a second lag between runs,
      // so it inhales nose to tail and front to back instead of blinking as one
      // block. Squared, so the trough holds dark and the peak arrives as a
      // breath rather than a dimmer sweep.
      const swell = 0.5 + 0.5 * Math.sin(f.t * 1.6 - pos * 1.6 - strip * 0.22);
      f.base.getHSL(hsl);
      out.setHSL(hsl.h, hsl.s, 0.03 + swell * swell * 0.48);
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
