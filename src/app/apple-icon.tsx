import { ImageResponse } from "next/og";
import { BRAND, chipColor, MARK_RAKE, MARK_RAKE_DEG } from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * The same mark as `icon.svg`, raster because Safari will not read an SVG for
 * a home-screen tile. It is drawn rather than imported: iOS masks the tile to
 * a squircle, so this version pulls the run in off the edges instead of
 * bleeding past them the way the favicon does.
 */
const HALF = 52;
const CHIP = { w: 50, h: 24, count: 5 };

export default function AppleIcon() {
  const dx = Math.sin(MARK_RAKE) * HALF;
  const dy = -Math.cos(MARK_RAKE) * HALF;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: BRAND.ink,
        // Kept tight and faint: a wide navy wash turned the dimmed end chips
        // muddy, because they are the bright hue at low opacity over it.
        backgroundImage:
          "radial-gradient(circle at 50% 50%, rgba(96,84,255,0.20), rgba(10,11,13,0) 66%)",
      }}
    >
      {Array.from({ length: CHIP.count }, (_, i) => {
        const u = i / (CHIP.count - 1);
        const offset = (u - 0.5) * 2;
        return (
          <div
            key={u}
            style={{
              position: "absolute",
              left: size.width / 2 + dx * offset - CHIP.w / 2,
              top: size.height / 2 + dy * offset - CHIP.h / 2,
              width: CHIP.w,
              height: CHIP.h,
              borderRadius: 9,
              background: chipColor(u),
              boxShadow: `0 0 20px ${chipColor(u)}`,
              transform: `rotate(${MARK_RAKE_DEG}deg)`,
            }}
          />
        );
      })}
    </div>,
    size,
  );
}
