"use client";

import { Canvas } from "@react-three/fiber";
import { type ReactNode, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Scene } from "@/components/three/scene";
import { useAudioSource } from "@/components/three/use-audio";
import { getBikeModel } from "@/lib/bike-models";
import { getBike } from "@/lib/catalog";
import { useConfigurator } from "@/lib/store";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type Props = {
  labels: { loading: string; fallback: string; micDenied: string };
  className?: string;
  /** Hero only: push the bike right so the headline gets clean ground. */
  frameBias?: number;
  /** Camera presets and any other chrome laid over the canvas, top right. */
  overlay?: ReactNode;
};

export function Showroom({ labels, className, frameBias = 0, overlay }: Props) {
  const bikeId = useConfigurator((s) => s.bikeId);
  const modeId = useConfigurator((s) => s.modeId);
  const color = useConfigurator((s) => s.color);
  const micEnabled = useConfigurator((s) => s.micEnabled);
  const setMicEnabled = useConfigurator((s) => s.setMicEnabled);
  const view = useConfigurator((s) => s.view);
  const viewEpoch = useConfigurator((s) => s.viewEpoch);
  const autoRotate = useConfigurator((s) => s.autoRotate);
  const setAutoRotate = useConfigurator((s) => s.setAutoRotate);

  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [micDenied, setMicDenied] = useState(false);

  const onDenied = useCallback(() => {
    setMicDenied(true);
    setMicEnabled(false);
  }, [setMicEnabled]);

  const onGrab = useCallback(() => setAutoRotate(false), [setAutoRotate]);

  const audio = useAudioSource(micEnabled, onDenied);

  useEffect(() => {
    const probe = document.createElement("canvas");
    setWebglOk(Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl")));
  }, []);

  // Rendering a 3D scene the visitor has scrolled past is pure battery burn.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? true),
      {
        rootMargin: "120px",
      },
    );
    observer.observe(node);
    const onVisibility = () => setVisible(!document.hidden && Boolean(containerRef.current));
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const family = getBike(bikeId);
  const credit = family ? getBikeModel(family.id) : undefined;

  if (webglOk === false || !family) {
    return (
      <div
        className={`grid place-items-center px-6 text-center text-sm text-chalk-dim ${className ?? ""}`}
      >
        <p className="max-w-xs text-balance">{labels.fallback}</p>
      </div>
    );
  }

  return (
    // The caller owns positioning: adding `relative` here would beat the
    // caller's `absolute inset-0` in the cascade and collapse the canvas to
    // its 300x150 default.
    <div ref={containerRef} className={className ?? "relative"}>
      {webglOk !== null && (
        <Canvas
          dpr={[1, 1.75]}
          frameloop={visible ? "always" : "never"}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          onCreated={() => setReady(true)}
        >
          <Suspense fallback={null}>
            <Scene
              family={family}
              modeId={modeId}
              color={color}
              audio={audio}
              reducedMotion={reducedMotion}
              frameBias={frameBias}
              view={view}
              viewEpoch={viewEpoch}
              autoRotate={autoRotate}
              onGrab={onGrab}
            />
          </Suspense>
        </Canvas>
      )}

      {overlay && <div className="absolute top-4 right-4 z-10">{overlay}</div>}

      <div
        aria-hidden={ready}
        className={`pointer-events-none absolute inset-0 grid place-items-center bg-ink transition-opacity duration-700 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="type-eyebrow animate-pulse">{labels.loading}</p>
      </div>

      {/* CC-BY is only satisfied if the credit ships with the render, so it
          lives next to the canvas rather than in a legal page nobody opens. */}
      {credit && (
        <p className="absolute right-3 bottom-2 text-[10px] text-chalk-dim/70">
          <a className="hover:text-chalk" href={credit.creditUrl} rel="noreferrer" target="_blank">
            {credit.credit}
          </a>{" "}
          &middot;{" "}
          <a className="hover:text-chalk" href={credit.licenseUrl} rel="noreferrer" target="_blank">
            {credit.license}
          </a>
        </p>
      )}

      {micDenied && (
        <p role="status" className="absolute inset-x-0 bottom-3 text-center text-xs text-chalk-dim">
          {labels.micDenied}
        </p>
      )}
    </div>
  );
}
