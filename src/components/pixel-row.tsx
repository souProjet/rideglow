/**
 * The product drawn as an interface element: a run of individually addressable
 * pixels, `lit` of them on.
 *
 * It is a readout, not an ornament. Wherever it appears the pixel count is the
 * number the copy beside it states, so the interface is built out of the thing
 * being sold rather than out of generic progress bars.
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
  return (
    <span aria-hidden={ariaHidden} className={`flex h-1 w-full gap-px ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: the index is the identity, pixel 40 is pixel 40 on the tape, and pixels are only added to or removed from the end
          key={i}
          className="min-w-px flex-1 transition-[background-color,box-shadow] duration-500"
          style={
            i < lit
              ? { background: "var(--glow)", boxShadow: "0 0 4px var(--glow-soft)" }
              : { background: "var(--line)" }
          }
        />
      ))}
    </span>
  );
}
