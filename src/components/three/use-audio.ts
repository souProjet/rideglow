"use client";

import { useEffect, useRef } from "react";

export const BAND_COUNT = 16;

export type AudioSource = {
  /** Normalised spectrum, low to high. Mutated in place every frame. */
  bands: Float32Array;
  /** Overall level, 0..1. */
  energy: number;
  /** True once the microphone is actually feeding the analyser. */
  live: boolean;
  /** Call once per rendered frame with elapsed seconds. */
  sample(t: number): void;
};

/**
 * Feeds the sound mode. With permission it reads the real microphone; without
 * it, a synthetic groove keeps the showroom alive so a first-time visitor sees
 * the product move before being asked for anything.
 */
export function useAudioSource(enabled: boolean, onDenied?: () => void): AudioSource {
  const source = useRef<AudioSource>(null);
  if (source.current === null) {
    source.current = {
      bands: new Float32Array(BAND_COUNT),
      energy: 0,
      live: false,
      sample: () => {},
    };
  }
  const ref = source.current;

  // Synthetic fallback: a four-on-the-floor kick, an offbeat bass and a hat
  // shimmer. Enough structure that the strip reads as "reacting to music".
  useEffect(() => {
    if (ref.live) return;
    ref.sample = (t: number) => {
      const beat = t * (124 / 60);
      const kick = (1 - (beat % 1)) ** 6;
      const snare = (1 - ((beat + 0.5) % 2)) ** 8;
      let sum = 0;
      for (let i = 0; i < BAND_COUNT; i++) {
        const f = i / (BAND_COUNT - 1);
        const low = kick * Math.max(0, 1 - f * 3.2);
        const mid = snare * Math.max(0, 1 - Math.abs(f - 0.45) * 4);
        const air = (0.5 + 0.5 * Math.sin(t * 11 + i * 1.7)) * f * f * 0.45;
        const v = Math.min(1, low + mid + air * (0.5 + 0.5 * kick));
        ref.bands[i] = v;
        sum += v;
      }
      ref.energy = sum / BAND_COUNT;
    };
  }, [ref]);

  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      onDenied?.();
      return;
    }

    let ctx: AudioContext | null = null;
    let stream: MediaStream | null = null;
    let canceled = false;

    navigator.mediaDevices
      .getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } })
      .then((granted) => {
        if (canceled) {
          for (const track of granted.getTracks()) track.stop();
          return;
        }
        stream = granted;
        ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.72;
        ctx.createMediaStreamSource(granted).connect(analyser);

        const raw = new Uint8Array(analyser.frequencyBinCount);
        // Logarithmic bin grouping: linear FFT bins would put fifteen of the
        // sixteen bands above 5 kHz, where music has almost no energy.
        const edges = Array.from({ length: BAND_COUNT + 1 }, (_, i) =>
          Math.round((raw.length - 1) ** (i / BAND_COUNT)),
        );

        ref.live = true;
        ref.sample = () => {
          analyser.getByteFrequencyData(raw as Uint8Array<ArrayBuffer>);
          let sum = 0;
          for (let b = 0; b < BAND_COUNT; b++) {
            const start = edges[b] ?? 0;
            const end = Math.max(start + 1, edges[b + 1] ?? start + 1);
            let acc = 0;
            for (let i = start; i < end; i++) acc += raw[i] ?? 0;
            // Slight lift on the top half; hats are quiet but carry the groove.
            const v = Math.min(1, (acc / (end - start) / 255) * (1 + b / BAND_COUNT));
            ref.bands[b] = v;
            sum += v;
          }
          ref.energy = sum / BAND_COUNT;
        };
      })
      .catch(() => {
        if (!canceled) onDenied?.();
      });

    return () => {
      canceled = true;
      ref.live = false;
      if (stream) for (const track of stream.getTracks()) track.stop();
      void ctx?.close();
    };
  }, [enabled, onDenied, ref]);

  return ref;
}
