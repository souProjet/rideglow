"use client";

import {
  AdaptiveDpr,
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Color, MathUtils, type PointLight, Vector3 } from "three";
import { Bike } from "@/components/three/bike";
import { BikeModelMesh } from "@/components/three/bike-model";
import { LedRig } from "@/components/three/led-rig";
import type { AudioSource } from "@/components/three/use-audio";
import { getSilhouette } from "@/lib/bike-geometry";
import { getBikeModel } from "@/lib/bike-models";
import type { BikeFamily } from "@/lib/catalog";
import type { LedModeId } from "@/lib/led-modes";
import type { ViewId } from "@/lib/store";

/** The bike sits on the origin; drop it so the camera frames the tank. */
const GROUND_Y = -0.58;

/**
 * The four angles the camera parks at, all on the same orbit radius so
 * switching between them reads as walking round the bike rather than zooming.
 * Every one sits inside the polar limits below, so OrbitControls never clamps
 * a preset halfway to where it was asked to go.
 */
const VIEW_POSITIONS: Record<ViewId, [number, number, number]> = {
  threeQuarter: [3.4, 1.15, 4.3],
  profile: [0, 0.7, 5.5],
  front: [5.3, 1, 1.4],
  rear: [-5, 1.15, -2.3],
};

/** Roughly how long a bike is, wheel to wheel, in scene units. */
const BIKE_LENGTH = 2.3;

/**
 * Flies the camera to the selected preset, then gets out of the way so orbit
 * dragging still works. `epoch` rather than `view` alone is what lets someone
 * who has dragged the camera re-pick the angle they are nominally already on.
 *
 * `fit` pulls the preset radius in until the bike spans the frame. The
 * configurator's canvas is nearly square, so a radius art-directed for the
 * hero's wide crop left the bike floating in dead space there.
 */
function CameraRig({ view, epoch, fit }: { view: ViewId; epoch: number; fit: boolean }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  const size = useThree((s) => s.size);
  const goal = useRef(new Vector3(...VIEW_POSITIONS.threeQuarter));
  const flying = useRef(false);

  // `epoch` is unused in the body on purpose: it is the signal that the same view
  // was re-picked after a drag, and dropping it would make that click do nothing.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    goal.current.set(...VIEW_POSITIONS[view]);

    if (fit && "fov" in camera && size.height > 0) {
      const vFov = ((camera.fov as number) * Math.PI) / 180;
      const hHalf = Math.atan(Math.tan(vFov / 2) * (size.width / size.height));
      const needed = BIKE_LENGTH / 2 / Math.tan(hHalf);
      goal.current.setLength(MathUtils.clamp(needed * 1.12, 3.6, 8));
    }

    flying.current = true;
  }, [view, epoch, fit, camera, size]);

  useFrame((_, delta) => {
    if (!flying.current) return;
    // Exponential easing on delta, so the flight takes the same time on a 60 Hz
    // laptop and a 120 Hz phone instead of running twice as fast.
    camera.position.lerp(goal.current, 1 - Math.exp(-5 * delta));
    if (camera.position.distanceTo(goal.current) < 0.005) {
      camera.position.copy(goal.current);
      flying.current = false;
    }
    (controls as { update?: () => void } | null)?.update?.();
  });

  return null;
}

/**
 * Pushes the rendered window left of the frustum center so the bike sits in the
 * right third and the hero copy gets clean ground on the left. Cheaper and more
 * honest than nudging the model, which would fight the orbit target.
 */
function FrameBias({ bias }: { bias: number }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  useEffect(() => {
    if (!("isPerspectiveCamera" in camera)) return;
    const wide = size.width >= 1024;
    if (!wide || bias === 0) {
      camera.clearViewOffset();
      return;
    }
    camera.setViewOffset(size.width, size.height, -size.width * bias, 0, size.width, size.height);
    return () => camera.clearViewOffset();
  }, [camera, size, bias]);

  return null;
}

/** Two lamps under the bike take the mean LED color, so the strip spills onto
 *  the floor and the engine cases instead of glowing in a vacuum. */
function Spill({ average }: { average: Color }) {
  const front = useRef<PointLight>(null);
  const rear = useRef<PointLight>(null);

  useFrame(() => {
    front.current?.color.copy(average);
    rear.current?.color.copy(average);
    const level = 0.9 + (average.r + average.g + average.b) * 2.1;
    if (front.current) front.current.intensity = level;
    if (rear.current) rear.current.intensity = level * 0.8;
  });

  return (
    <>
      <pointLight ref={front} position={[0.45, 0.3, 0]} distance={2.8} decay={2} />
      <pointLight ref={rear} position={[-0.5, 0.28, 0]} distance={2.6} decay={2} />
    </>
  );
}

type Props = {
  family: BikeFamily;
  modeId: LedModeId;
  color: string;
  audio: AudioSource;
  reducedMotion: boolean;
  /** 0 centers the bike; the hero biases it right to clear the headline. */
  frameBias?: number;
  view: ViewId;
  viewEpoch: number;
  autoRotate: boolean;
  /** Fired when the visitor grabs the camera, so the turntable gets out of the way. */
  onGrab: () => void;
};

export function Scene({
  family,
  modeId,
  color,
  audio,
  reducedMotion,
  frameBias = 0,
  view,
  viewEpoch,
  autoRotate,
  onGrab,
}: Props) {
  const average = useMemo(() => new Color("#3be8ff"), []);
  const model = getBikeModel(family.id);

  return (
    <>
      <fog attach="fog" args={["#07080a", 7, 22]} />
      <PerspectiveCamera makeDefault fov={30} position={VIEW_POSITIONS.threeQuarter} />
      <FrameBias bias={frameBias} />
      <OrbitControls
        makeDefault
        target={[0, 0.02, 0]}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={3.6}
        maxDistance={8}
        minPolarAngle={0.9}
        maxPolarAngle={1.58}
        autoRotate={autoRotate && !reducedMotion}
        autoRotateSpeed={0.3}
        onStart={onGrab}
      />
      {/* The hero is art-directed around its own crop, so only the configurator
          asks the rig to fit the bike to the frame. */}
      <CameraRig view={view} epoch={viewEpoch} fit={frameBias === 0} />

      {/* Studio lighting built in-memory from lightformers: an HDRI would be a
          3 MB blocking download for a hero that has to paint immediately. */}
      <Environment resolution={256}>
        {/* Overhead softbox. Long and narrow rather than square: a wide source
            reflected in the clearcoat as a round white ball on the tank and the
            tail, where a strip light draws the streak a panel actually gets. */}
        <Lightformer
          form="rect"
          intensity={1.15}
          position={[0, 4.5, -1]}
          scale={[9, 1.1, 1]}
          color="#8ea6c8"
        />
        {/* The rim: a hard strip behind and low, which is what separates a dark
            bike from a dark background. Without it the whole thing reads as a
            silhouette-shaped hole. */}
        <Lightformer
          form="rect"
          intensity={2.6}
          position={[-3.4, 1.1, -3.2]}
          rotation={[0, Math.PI / 2.4, 0]}
          scale={[6, 1.2, 1]}
          color="#cfe0ff"
        />
        {/* Camera-side fill. The rim alone lights the far flank, so from the
            profile preset the whole near side of the bike fell into the
            background and the configurator showed a silhouette. */}
        <Lightformer
          form="rect"
          intensity={1.5}
          position={[4.5, 1.6, 2]}
          scale={[4, 3, 1]}
          color="#5a6578"
        />
      </Environment>
      <ambientLight intensity={0.18} />
      {/* Key from the camera side: without it the engine and the near flank fall
          into the same black as the background and the masses stop separating. */}
      <directionalLight position={[3.5, 4.5, 3]} intensity={1.05} color="#c7d6ee" />
      <directionalLight position={[2.2, 0.6, 5]} intensity={0.7} color="#7f97c4" />
      {/* Low fill from the floor. Without a bounce the flank below the tank has
          no gradient at all and the tank, seat and tail read as one black mass. */}
      <directionalLight position={[1.5, -2, 3.5]} intensity={0.32} color="#5d6b85" />
      {/* Kicker along the far flank, so the tank has a highlight to roll off. */}
      <directionalLight position={[-2.5, 1.2, -3]} intensity={0.9} color="#9fc0ff" />

      <group position={[0, GROUND_Y, 0]}>
        {model ? (
          // The generated silhouette stands in while the GLB streams, so the
          // hero never paints an empty floor.
          <Suspense fallback={<Bike family={family} />}>
            <BikeModelMesh model={model} silhouette={getSilhouette(family.silhouette)} />
          </Suspense>
        ) : (
          <Bike family={family} />
        )}
        <LedRig
          family={family}
          modeId={modeId}
          color={color}
          audio={audio}
          average={average}
          reducedMotion={reducedMotion}
        />
        <Spill average={average} />

        <ContactShadows
          position={[0, 0.004, 0]}
          opacity={0.62}
          scale={5.5}
          blur={2.2}
          far={1.2}
          resolution={512}
          color="#000000"
        />

        {/* Wide enough that its far edge never crosses the frame: at 16 m the
            boundary cut a hard diagonal across the hero. Fog closes the rest. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[44, 44]} />
          <MeshReflectorMaterial
            resolution={512}
            blur={[420, 140]}
            mixBlur={7}
            mixStrength={4.5}
            depthScale={1.2}
            minDepthThreshold={0.3}
            maxDepthThreshold={1.4}
            mirror={0.6}
            color="#080a0c"
            metalness={0.55}
            roughness={0.72}
          />
        </mesh>
      </group>

      <EffectComposer multisampling={4}>
        {/* The threshold sits above what a clearcoat specular can reach, so the
            bloom belongs to the strip. At 0.62 every highlight on the tank and
            the fender blew out into the same white blob as the LEDs. */}
        <Bloom
          mipmapBlur
          luminanceThreshold={0.92}
          luminanceSmoothing={0.12}
          intensity={1.15}
          radius={0.68}
        />
        <Vignette offset={0.3} darkness={0.68} />
      </EffectComposer>

      <AdaptiveDpr pixelated />
    </>
  );
}
