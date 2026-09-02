/**
 * The product drawn as an interface element: a run of individually addressable
 * pixels, `lit` of them on.
 *
 * It is a readout, not an ornament: the row is always the build beside it, at
 * whatever pitch the caller's container can hold, so the interface is made out
 * of the thing being sold rather than out of a generic progress bar. `count` is
 * cells, not LEDs, and callers scale it. See the note on the floor below.
 */
export function PixelRow({
  count,
  lit = count,
  className = "",
  "aria-hidden": ariaHidden = true,
}: {
  count: number;
  lit?: number;
  className?: string;
  "aria-hidden"?: boolean;
}) {
  // A tape has a pitch, so the pixels keep a fixed gap and share the leftover
  // width. Sizing each pixel instead would make the row's length depend on the
  // bike, which is not what the number means.
  //
  // The floor is real: n cells at min-w-px with a 1px gap cannot render below
  // 2n-1 px, so a caller has to pick a count its container can hold. min-w-0
  // and overflow-hidden keep a bad count clipped inside the card instead of
  // leaking past the panel edge, which is what 154 cells did in a 182px box.
  return (
    <span
      aria-hidden={ariaHidden}
      className={`flex h-1 w-full min-w-0 gap-px overflow-hidden ${className}`}
      // One filter over the row rather than a box-shadow on each pixel: a
      // 200-LED build meant 200 shadows repainting together every time the
      // selection changed, which is the one thing on this page that stuttered.
      style={{ filter: "drop-shadow(0 0 3px var(--glow-soft))" }}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: the index is the identity, pixel 40 is pixel 40 on the tape, and pixels are only added to or removed from the end
          key={i}
          className="min-w-px flex-1 transition-[background-color] duration-300 ease-[var(--ease-out-expo)]"
          style={{
            // The strip is addressable, so the row lights the way the product
            // does: one pixel after the next, from the nose back. Capped so a
            // long build still finishes its sweep in well under a second.
            transitionDelay: `${Math.min(i * 3, 420)}ms`,
            background: i < lit ? "var(--glow)" : "var(--line)",
          }}
        />
      ))}
    </span>
  );
}
