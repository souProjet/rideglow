/**
 * The palette the generated brand images run on.
 *
 * The site itself has no fixed accent: `--glow` is rewritten from whatever the
 * visitor picks in the showroom (see `globals.css`). A favicon and a social
 * card cannot be repainted per visitor, so they say the same thing a different
 * way: a run of chips, each one a different hue, which is what "addressable"
 * actually means. The two anchors below are the cold-start values of `--glow`
 * and `--glow-2`, so the static images and the live page start from one place.
 */
export const BRAND = {
  ink: "#0a0b0d",
  line: "#262a31",
  chalk: "#e8eaed",
  chalkDim: "#8a9099",
  glow: "#3be8ff",
  glow2: "#ff2d9b",
} as const;

/**
 * The rake of the roadster's fork, in radians, copied from `bike-geometry.ts`.
 * The mark is a strip run, and the run it draws is the fork-leg one: the mark
 * leans at the angle the product is actually taped to.
 */
export const MARK_RAKE = 0.44;

/** Degrees, for CSS transforms and SVG rotate(). */
export const MARK_RAKE_DEG = (MARK_RAKE * 180) / Math.PI;

/**
 * A hue sweep across the two anchors, as `hsl()`. Cyan through violet into
 * magenta: wide enough to read as a spectrum, narrow enough to stay the
 * brand's own span rather than a generic rainbow.
 */
export function chipColor(t: number): string {
  const hue = 187 + t * 133;
  return `hsl(${hue.toFixed(1)} 100% 62%)`;
}
