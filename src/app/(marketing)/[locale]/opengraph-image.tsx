import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getDictionary } from "@/i18n";
import { isLocale, LOCALES } from "@/i18n/config";
import { BRAND, chipColor, MARK_RAKE, MARK_RAKE_DEG } from "@/lib/brand";
import { BIKES, bikeLedCount } from "@/lib/catalog";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * The alt text is per locale, which `export const alt` cannot express, so the
 * card is declared as a one-image set instead.
 */
export function generateImageMetadata({ params }: { params: { locale: string } }) {
  const locale = isLocale(params.locale) ? params.locale : "fr";
  return [{ id: "card", alt: getDictionary(locale).meta.ogAlt, size, contentType }];
}

/**
 * Archivo is vendored rather than fetched: satori reads woff but not the woff2
 * that `next/font` produces, and a build that phones Google Fonts is a build
 * that fails offline. These are the wdth 112 / 100 static instances, which is
 * as close as Google serves to the wdth 118 the headings use. Both locales are
 * prerendered by
 * `generateStaticParams`, so these files are a build-time dependency and never
 * ship to the runtime. License in the same directory.
 */
async function loadFonts() {
  const dir = join(process.cwd(), "src/assets/fonts");
  const [display, text] = await Promise.all([
    readFile(join(dir, "archivo-display.woff")),
    readFile(join(dir, "archivo-text.woff")),
  ]);
  return [
    { name: "Archivo Display", data: display, weight: 600 as const, style: "normal" as const },
    { name: "Archivo Text", data: text, weight: 400 as const, style: "normal" as const },
  ];
}

/** The run: long enough to bleed off both edges, so the card shows a cut of it. */
const STRIP = { cx: 905, cy: 315, half: 470, count: 29, w: 104, h: 20 };

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDictionary(isLocale(locale) ? locale : "fr");

  const counts = BIKES.map(bikeLedCount);
  const spec = [
    `${Math.min(...counts)}–${Math.max(...counts)} LED`,
    t.modes.items.sound.name,
    t.modes.items.ride.name,
    t.modes.items.spectrum.name,
  ];

  const dx = Math.sin(MARK_RAKE) * STRIP.half;
  const dy = -Math.cos(MARK_RAKE) * STRIP.half;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: BRAND.ink,
        // Haze behind the run, so the ink is lit rather than flat. Painted on
        // the root: satori gives an absolutely positioned gradient div a
        // visible bounding box.
        backgroundImage:
          "radial-gradient(760px 760px at 74% 50%, rgba(96,84,255,0.26), rgba(10,11,13,0) 72%)",
        fontFamily: "Archivo Text",
      }}
    >
      {Array.from({ length: STRIP.count }, (_, i) => {
        const u = i / (STRIP.count - 1);
        const offset = (u - 0.5) * 2;
        return (
          <div
            key={u}
            style={{
              position: "absolute",
              left: STRIP.cx + dx * offset - STRIP.w / 2,
              top: STRIP.cy + dy * offset - STRIP.h / 2,
              width: STRIP.w,
              height: STRIP.h,
              borderRadius: STRIP.h / 2,
              background: chipColor(u),
              // Fades into the ink at both ends: a segment, not a finished bar.
              opacity: Math.max(0.12, 1 - Math.abs(offset) ** 2.4 * 0.92),
              boxShadow: `0 0 44px ${chipColor(u)}`,
              transform: `rotate(${MARK_RAKE_DEG}deg)`,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 76,
          top: 84,
          display: "flex",
          flexDirection: "column",
          width: 620,
        }}
      >
        <div
          style={{
            fontFamily: "Archivo Display",
            fontSize: 30,
            letterSpacing: "0.22em",
            color: BRAND.chalk,
          }}
        >
          RIDEGLOW
        </div>

        <div
          style={{
            marginTop: 56,
            fontFamily: "Archivo Display",
            fontSize: 68,
            lineHeight: 1.06,
            letterSpacing: "-0.015em",
            color: BRAND.chalk,
          }}
        >
          {t.meta.ogHeadline}
        </div>

        <div style={{ marginTop: 26, fontSize: 27, lineHeight: 1.45, color: BRAND.chalkDim }}>
          {t.meta.ogSub}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 76,
          bottom: 76,
          display: "flex",
          flexDirection: "column",
          width: 620,
        }}
      >
        <div style={{ width: "100%", height: 1, background: BRAND.line }} />
        <div style={{ marginTop: 22, display: "flex", gap: 22, alignItems: "center" }}>
          {spec.map((item) => (
            <div
              key={item}
              style={{
                fontSize: 19,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: BRAND.chalkDim,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>,
    { ...size, fonts: await loadFonts() },
  );
}
