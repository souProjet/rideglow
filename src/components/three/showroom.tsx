"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Scene } from "@/components/three/scene";
import { useAudioSource } from "@/components/three/use-audio";
import { getBike } from "@/lib/catalog";
import { useConfigurator } from "@/lib/store";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type Props = {
  labels: { loading: string; fallback: string; micDenied: string };
  className?: string;
};

export function Showroom({ labels, className }: Props) {
  const bikeId = useConfigurator((s) => s.bikeId);
  const modeId = useConfigurator((s) => s.modeId);
  const color = useConfigurator((s) => s.color);
  const micEnabled = useConfigurator((s) => s.micEnabled);
  const setMicEnabled = useConfigurator((s) => s.setMicEnabled);

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
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
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
            />
          </Suspense>
        </Canvas>
      )}

      <div
        aria-hidden={ready}
        className={`pointer-events-none absolute inset-0 grid place-items-center bg-ink transition-opacity duration-700 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="type-eyebrow animate-pulse">{labels.loading}</p>
      </div>

      {micDenied && (
        <p role="status" className="absolute inset-x-0 bottom-3 text-center text-xs text-chalk-dim">
          {labels.micDenied}
        </p>
      )}
    </div>
  );
}
