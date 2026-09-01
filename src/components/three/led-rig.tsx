"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, Color, type InstancedMesh, Matrix4, Vector3 } from "three";
import type { AudioSource } from "@/components/three/use-audio";
import { getSilhouette, getStripRuns } from "@/lib/bike-geometry";
import type { BikeFamily } from "@/lib/catalog";
import { getLedMode, type LedFrame, type LedModeId } from "@/lib/led-modes";

/** Pushes shaded colours past 1.0 so the bloom pass has something to bloom. */
const HDR_GAIN = 2.1;
/** Seconds the strip takes to light up LED by LED when a bike is selected. */
const IGNITION_SECONDS = 1.15;

type Props = {
  family: BikeFamily;
  modeId: LedModeId;
  color: string;
  audio: AudioSource;
  /** Mutated in place each frame with the mean emitted colour, for the lights. */
  average: Color;
  reducedMotion: boolean;
};

export function LedRig({ family, modeId, color, audio, average, reducedMotion }: Props) {
  const meshRef = useRef<InstancedMesh>(null);
  const ignitionStart = useRef(0);

  const layout = useMemo(() => {
    const runs = getStripRuns(getSilhouette(family.silhouette));
    const perRun = Math.max(8, Math.round(family.ledCount / runs.length));
    const positions: Vector3[] = [];
    const curves: CatmullRomCurve3[] = [];

    for (const run of runs) {
      const curve = new CatmullRomCurve3(run.points.map((p) => new Vector3(...p)));
      curves.push(curve);
      // getSpacedPoints walks arc length, so LEDs stay evenly pitched around
      // the bends instead of bunching up where the spline curves hardest.
      for (const point of curve.getSpacedPoints(perRun - 1)) positions.push(point);
    }

    return { runs, perRun, positions, curves, total: positions.length };
  }, [family]);

  const baseColor = useMemo(() => new Color(color), [color]);
  const scratch = useMemo(() => new Color(), []);
  const frame = useMemo<LedFrame>(
    () => ({ t: 0, energy: 0, bands: audio.bands, speed: 0, lean: 0, base: baseColor }),
    [audio.bands, baseColor],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const matrix = new Matrix4();
    for (let i = 0; i < layout.positions.length; i++) {
      const p = layout.positions[i];
      if (p) mesh.setMatrixAt(i, matrix.setPosition(p));
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.count = layout.total;
    ignitionStart.current = 0;
  }, [layout]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const t = clock.getElapsedTime();
    if (ignitionStart.current === 0) ignitionStart.current = t;
    const ignition = reducedMotion
      ? 1
      : Math.min(1, (t - ignitionStart.current) / IGNITION_SECONDS);

    audio.sample(t);
    frame.t = t;
    frame.energy = audio.energy;
    frame.bands = audio.bands;
    frame.base = baseColor;
    // The showroom bike is parked, so `ride` plays back a simulated lap: a long
    // throttle swell and a slower left-right rhythm through corners.
    frame.speed = 0.5 + 0.5 * Math.sin(t * 0.31);
    frame.lean = Math.sin(t * 0.47) * 0.9;

    const mode = getLedMode(modeId);
    if (!mode) return;

    const { perRun, total } = layout;
    let ar = 0;
    let ag = 0;
    let ab = 0;

    for (let i = 0; i < total; i++) {
      const strip = (i / perRun) | 0;
      const indexInStrip = i % perRun;
      mode.shade(scratch, indexInStrip, perRun, strip, frame);

      if (ignition < 1) {
        // Runs light up from the nose backwards, one LED at a time.
        const arrival = indexInStrip / perRun;
        scratch.multiplyScalar(ignition > arrival ? Math.min(1, (ignition - arrival) * 8) : 0);
      }

      ar += scratch.r;
      ag += scratch.g;
      ab += scratch.b;
      mesh.setColorAt(i, scratch.multiplyScalar(HDR_GAIN));
    }

    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    average.setRGB(ar / total, ag / total, ab / total);
  });

  return (
    <group>
      {/* Silicone housing, so the LEDs read as mounted hardware rather than
          points floating alongside the bike. */}
      {layout.curves.map((curve, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: runs are a fixed, ordered rig
        <mesh key={i}>
          <tubeGeometry args={[curve, 32, 0.009, 6, false]} />
          <meshStandardMaterial color="#0a0b0d" roughness={0.6} metalness={0.2} />
        </mesh>
      ))}

      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, layout.total]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.0135, 8, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
