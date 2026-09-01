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
import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import { Color, type PointLight } from "three";
import { Bike } from "@/components/three/bike";
import { LedRig } from "@/components/three/led-rig";
import type { AudioSource } from "@/components/three/use-audio";
import type { BikeFamily } from "@/lib/catalog";
import type { LedModeId } from "@/lib/led-modes";

/** The bike sits on the origin; drop it so the camera frames the tank. */
const GROUND_Y = -0.58;

/** Two lamps under the bike take the mean LED colour, so the strip spills onto
 *  the floor and the engine cases instead of glowing in a vacuum. */
function Spill({ average }: { average: Color }) {
  const front = useRef<PointLight>(null);
  const rear = useRef<PointLight>(null);

  useFrame(() => {
    front.current?.color.copy(average);
    rear.current?.color.copy(average);
    const level = 1.2 + (average.r + average.g + average.b) * 2.4;
    if (front.current) front.current.intensity = level;
    if (rear.current) rear.current.intensity = level * 0.8;
  });

  return (
    <>
      <pointLight ref={front} position={[0.45, 0.36, 0]} distance={2.6} decay={2} />
      <pointLight ref={rear} position={[-0.5, 0.34, 0]} distance={2.4} decay={2} />
    </>
  );
}

type Props = {
  family: BikeFamily;
  modeId: LedModeId;
  color: string;
  audio: AudioSource;
  reducedMotion: boolean;
};

export function Scene({ family, modeId, color, audio, reducedMotion }: Props) {
  const average = useMemo(() => new Color("#3be8ff"), []);

  return (
    <>
      <PerspectiveCamera makeDefault fov={32} position={[2.9, 0.5, 3.4]} />
      <OrbitControls
        makeDefault
        target={[0, 0.02, 0]}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={2.8}
        maxDistance={6.5}
        minPolarAngle={0.85}
        maxPolarAngle={1.62}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.35}
      />

      {/* Studio lighting built in-memory from lightformers: an HDRI would be a
          3 MB blocking download for a hero that has to paint immediately. */}
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={1.4}
          position={[0, 4, -3]}
          scale={[9, 3, 1]}
          color="#7f93b4"
        />
        <Lightformer
          form="rect"
          intensity={0.9}
          position={[-4, 2, 2]}
          scale={[5, 4, 1]}
          color="#3d4757"
        />
        <Lightformer
          form="rect"
          intensity={0.7}
          position={[4, 1.5, 1]}
          scale={[4, 3, 1]}
          color="#5a6272"
        />
      </Environment>
      <ambientLight intensity={0.12} />
      <directionalLight position={[3, 6, 2]} intensity={0.5} castShadow />

      <group position={[0, GROUND_Y, 0]}>
        <Bike family={family} />
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
          position={[0, 0.002, 0]}
          opacity={0.75}
          scale={7}
          blur={2.6}
          far={1.4}
          resolution={512}
          color="#000000"
        />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[26, 26]} />
          <MeshReflectorMaterial
            resolution={512}
            blur={[380, 120]}
            mixBlur={9}
            mixStrength={22}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.3}
            mirror={0}
            color="#0a0b0d"
            metalness={0.62}
            roughness={0.88}
          />
        </mesh>
      </group>

      <EffectComposer multisampling={4}>
        <Bloom
          mipmapBlur
          luminanceThreshold={0.55}
          luminanceSmoothing={0.22}
          intensity={1.35}
          radius={0.76}
        />
        <Vignette offset={0.24} darkness={0.82} />
      </EffectComposer>

      <AdaptiveDpr pixelated />
    </>
  );
}
