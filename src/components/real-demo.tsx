"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";

/**
 * The one piece of footage on the site that is not rendered.
 *
 * It sits directly under the hero on purpose: the hero is a 3D bike, and the
 * first question a 3D bike raises is whether the product looks anything like
 * that in a car park at night. This answers it before the spec table asks the
 * visitor to believe anything else.
 *
 * The clip is graded to the site's palette but not restaged: it is a phone
 * video, it stays a phone video, and the copy says so. A "real customer photo"
 * that has clearly been through a studio is worth less than no photo at all.
 */
export function RealDemo({ t }: { t: Dictionary }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  // Autoplay only once the section is on screen, and never against a reduced
  // motion preference: 2 MB fetched during the hero's first paint buys
  // nothing, and a loop that starts itself is exactly what that preference is
  // asking us not to do.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // The sound is the demo: these are the LEDs following what the phone's mic
  // picked up in the car park. Autoplay has to start muted, so the toggle is
  // the point of the panel rather than a corner afterthought.
  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    setMuted(next);
    if (!next) void video.play().catch(() => {});
  }

  return (
    <section className="border-t border-line bg-ink px-5 py-24 sm:px-8 sm:py-32">
      {/* The clip is 9:16 because the phone that shot it was, and it is shown
          whole. Cutting a 16:9 band out of it to match the rest of the page
          threw away two thirds of the picture, then upscaled what was left:
          the bike came out cropped and soft, which is the opposite of what a
          proof panel is for. A portrait column beside the copy costs the page
          nothing and keeps the frame at its own shape. */}
      <div className="mx-auto grid max-w-[86rem] items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] lg:gap-20">
        <div className="max-w-2xl space-y-4">
          <p className="type-eyebrow flex items-center gap-3">
            <span aria-hidden className="h-px w-10 rule-glow" />
            {t.realDemo.eyebrow}
          </p>
          <h2 className="type-display text-[clamp(1.9rem,4.4vw,3.1rem)]">{t.realDemo.title}</h2>
          <p className="text-pretty text-[1.0625rem] leading-relaxed text-chalk-dim">
            {t.realDemo.lede}
          </p>

          {/* What the visitor is allowed to assume about the footage, stated
              rather than implied. A proof panel that is vague about its own
              provenance is not proof. */}
          <ul className="space-y-2.5 pt-2">
            {t.realDemo.notes.map((note) => (
              <li key={note} className="flex items-baseline gap-3 text-[0.875rem] text-chalk-dim">
                <span aria-hidden className="h-px w-4 shrink-0 translate-y-[-0.3em] rule-glow" />
                {note}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-[23rem] space-y-4">
          <div className="relative overflow-hidden rounded-card border border-line">
            <video
              ref={videoRef}
              className="block aspect-[9/16] w-full"
              src="/media/night-demo.mp4"
              poster="/media/night-demo.webp"
              preload="none"
              muted={muted}
              loop
              playsInline
              aria-label={t.realDemo.alt}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />

            {/* The poster is a still, so a visitor who never gets an autoplay
                (reduced motion, a battery-saving browser) needs a way in. */}
            {!playing && (
              <button
                type="button"
                onClick={() => void videoRef.current?.play().catch(() => {})}
                className="absolute inset-0 grid place-items-center text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-chalk"
              >
                <span className="rounded-card border border-line bg-ink/70 px-5 py-3">
                  {t.realDemo.play}
                </span>
              </button>
            )}
          </div>

          {/* The sound control sits under the clip rather than on it: the bike
              fills the frame edge to edge, so anything floated over it covers
              the product. */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={!muted}
              className={`rounded-card border px-4 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.1em] transition-colors ${
                muted
                  ? "border-line text-chalk-dim hover:border-glow hover:text-glow"
                  : "border-glow bg-glow text-ink"
              }`}
            >
              {muted ? t.realDemo.soundOn : t.realDemo.soundOff}
            </button>
            <p className="type-eyebrow text-chalk-dim">{t.realDemo.caption}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
