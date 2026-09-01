"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  type InstancedMesh,
  Matrix4,
  Vector3,
} from "three";
import type { AudioSource } from "@/components/three/use-audio";
import { getSilhouette, getStripRuns } from "@/lib/bike-geometry";
import type { BikeFamily } from "@/lib/catalog";
import { getLedMode, type LedFrame, type LedModeId } from "@/lib/led-modes";

/**
 * The strip is modeled the way the product is built rather than as a row of
 * glowing dots: a silicone channel with emitters at the tape's real pitch, and a
 * diffuser over the top that carries the light between them.
 *
 * The diffuser is what makes it read as a strip. Its vertices sit one per LED
 * and take that LED's color, so the ribbon interpolates between neighbours
 * exactly the way an IP65 sleeve smears the light of the chips underneath it.
 */

/** WS2812B-2020 at 60/m: one emitter every 16.7 mm. The scene is meters. */
const LED_PITCH = 1 / 60;
/** The silicone channel: 10 mm across, 3 mm proud of the bodywork. */
const TAPE_W = 0.01;
const TAPE_T = 0.003;
/** The emitter package: a 5 mm square, near flush with the tape. */
const CHIP = [0.005, 0.005, 0.0016] as const;

/** Pushes shaded colors past 1.0 so the bloom pass has something to bloom. */
const HDR_GAIN = 2.1;
/** The diffuser runs cooler than the chip: it is scattered light, not a source. */
const DIFFUSER_GAIN = 1.15;
/** Seconds the strip takes to light up LED by LED when a bike is selected. */
const IGNITION_SECONDS = 1.15;

type Frame = { p: Vector3; t: Vector3; n: Vector3; b: Vector3 };

/**
 * Every run lies in a constant-Z plane taped to the flank, so the tape's frame
 * comes from the plane, not from the curve's own binormal: a Frenet frame would
 * roll the strip onto its edge wherever the spline changes curvature.
 */
function sampleStrip(curve: CatmullRomCurve3, count: number, side: 1 | -1): Frame[] {
  const frames: Frame[] = [];
  for (let i = 0; i < count; i++) {
    const u = count === 1 ? 0 : i / (count - 1);
    const t = curve.getTangentAt(u);
    frames.push({
      p: curve.getPointAt(u),
      t,
      n: new Vector3(-t.y, t.x, 0).normalize(),
      b: new Vector3(0, 0, side),
    });
  }
  return frames;
}

/** The channel itself, swept as a rectangular section along the run. */
function buildHousing(frames: Frame[]): BufferGeometry {
  const w = TAPE_W / 2;
  const t = TAPE_T / 2;
  const corners = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ] as const;
  const at = (f: Frame, sn: number, sb: number) =>
    f.p
      .clone()
      .addScaledVector(f.n, sn * w)
      .addScaledVector(f.b, sb * t);

  const positions: number[] = [];
  const push = (v: Vector3) => positions.push(v.x, v.y, v.z);

  for (let i = 0; i < frames.length - 1; i++) {
    const f0 = frames[i];
    const f1 = frames[i + 1];
    if (!f0 || !f1) continue;
    for (let k = 0; k < 4; k++) {
      const a = corners[k];
      const b = corners[(k + 1) % 4];
      if (!a || !b) continue;
      const p0 = at(f0, a[0], a[1]);
      const p1 = at(f0, b[0], b[1]);
      const p2 = at(f1, b[0], b[1]);
      const p3 = at(f1, a[0], a[1]);
      push(p0);
      push(p1);
      push(p2);
      push(p0);
      push(p2);
      push(p3);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/** The lit face: two vertices per LED, colored from that LED every frame. */
function buildDiffuser(frames: Frame[]): BufferGeometry {
  const w = TAPE_W * 0.72;
  const lift = TAPE_T * 0.5 + 0.0006;
  const positions: number[] = [];
  const colors: number[] = [];

  for (const f of frames) {
    const c = f.p.clone().addScaledVector(f.b, lift);
    const a = c.clone().addScaledVector(f.n, w);
    const b = c.clone().addScaledVector(f.n, -w);
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    colors.push(0, 0, 0, 0, 0, 0);
  }

  const index: number[] = [];
  for (let i = 0; i < frames.length - 1; i++) {
    const o = i * 2;
    index.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setIndex(index);
  return geometry;
}

type Props = {
  family: BikeFamily;
  modeId: LedModeId;
  color: string;
  audio: AudioSource;
  /** Mutated in place each frame with the mean emitted color, for the lights. */
  average: Color;
  reducedMotion: boolean;
};

export function LedRig({ family, modeId, color, audio, average, reducedMotion }: Props) {
  const meshRef = useRef<InstancedMesh>(null);
  const ignitionStart = useRef(0);

  const layout = useMemo(() => {
    const runs = getStripRuns(getSilhouette(family.silhouette));
    let total = 0;

    // The count comes from the run's measured length at the tape's real pitch.
    // Dividing a fixed LED budget between runs was what made the short fork run
    // look like beads on a wire while the tank run looked like a strip.
    const strips = runs.map((run) => {
      const curve = new CatmullRomCurve3(run.points.map((p) => new Vector3(...p)));
      const count = Math.max(8, Math.round(curve.getLength() / LED_PITCH));
      const frames = sampleStrip(curve, count, run.side);
      const offset = total;
      total += count;
      return {
        count,
        offset,
        frames,
        housing: buildHousing(frames),
        diffuser: buildDiffuser(frames),
      };
    });

    return { strips, total };
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

    for (const strip of layout.strips) {
      for (let i = 0; i < strip.count; i++) {
        const f = strip.frames[i];
        if (!f) continue;
        // Local X across the tape, Y along the run, Z out of the bodywork, so
        // the package sits flat on the channel wherever the run bends.
        matrix.makeBasis(f.n, f.t, f.b);
        matrix.setPosition(f.p.clone().addScaledVector(f.b, TAPE_T * 0.5));
        mesh.setMatrixAt(strip.offset + i, matrix);
      }
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

    let ar = 0;
    let ag = 0;
    let ab = 0;

    for (let s = 0; s < layout.strips.length; s++) {
      const strip = layout.strips[s];
      if (!strip) continue;
      const tint = strip.diffuser.getAttribute("color");
      const array = tint.array as Float32Array;

      for (let i = 0; i < strip.count; i++) {
        mode.shade(scratch, i, strip.count, s, frame);

        if (ignition < 1) {
          // Runs light up from the nose backwards, one LED at a time.
          const arrival = i / strip.count;
          scratch.multiplyScalar(ignition > arrival ? Math.min(1, (ignition - arrival) * 8) : 0);
        }

        ar += scratch.r;
        ag += scratch.g;
        ab += scratch.b;

        // Both vertices of the diffuser rib take this LED's color, so the
        // triangles between ribs fade one pixel into the next.
        const v = i * 6;
        const dr = scratch.r * DIFFUSER_GAIN;
        const dg = scratch.g * DIFFUSER_GAIN;
        const db = scratch.b * DIFFUSER_GAIN;
        array[v] = dr;
        array[v + 1] = dg;
        array[v + 2] = db;
        array[v + 3] = dr;
        array[v + 4] = dg;
        array[v + 5] = db;

        mesh.setColorAt(strip.offset + i, scratch.multiplyScalar(HDR_GAIN));
      }

      tint.needsUpdate = true;
    }

    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    average.setRGB(ar / layout.total, ag / layout.total, ab / layout.total);
  });

  return (
    <group>
      {layout.strips.map((strip) => (
        <group key={`${strip.offset}`}>
          {/* Silicone channel. Soft and matte: a glossy sleeve would mirror the
              studio back and read as chrome trim rather than as tape. */}
          <mesh geometry={strip.housing}>
            <meshPhysicalMaterial
              color="#0c0e12"
              metalness={0}
              roughness={0.52}
              sheen={0.35}
              sheenColor="#20252d"
              side={DoubleSide}
            />
          </mesh>
          <mesh geometry={strip.diffuser} renderOrder={2}>
            <meshBasicMaterial
              vertexColors
              toneMapped={false}
              transparent
              opacity={0.85}
              blending={AdditiveBlending}
              depthWrite={false}
              side={DoubleSide}
            />
          </mesh>
        </group>
      ))}

      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, layout.total]}
        frustumCulled={false}
      >
        <boxGeometry args={[CHIP[0], CHIP[1], CHIP[2]]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
