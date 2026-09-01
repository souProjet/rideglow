"use client";

import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import { CatmullRomCurve3, Quaternion, Vector3 } from "three";
import { getAnchors, getSilhouette, type Silhouette, type Vec3 } from "@/lib/bike-geometry";
import type { BikeFamily } from "@/lib/catalog";

/** Anodised dark aluminium, the finish every bit of the bike shares. */
const BODY = { color: "#191c21", metalness: 0.88, roughness: 0.34 } as const;
const RUBBER = { color: "#0c0d0f", metalness: 0.05, roughness: 0.92 } as const;
const CHROME = { color: "#b8bec8", metalness: 1, roughness: 0.16 } as const;

function Wheel({ position, radius, width }: { position: Vec3; radius: number; width: number }) {
  const tube = width / 2;
  return (
    <group position={position}>
      <mesh castShadow>
        <torusGeometry args={[radius - tube, tube, 14, 56]} />
        <meshStandardMaterial {...RUBBER} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius - width, radius - width, width * 0.72, 32]} />
        <meshStandardMaterial {...CHROME} roughness={0.28} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} rotation={[0, 0, (i / 5) * Math.PI * 2]}>
          <boxGeometry args={[radius * 1.72, 0.022, width * 0.4]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.56, radius * 0.56, width * 1.06, 32]} />
        <meshStandardMaterial color="#2a2f37" metalness={1} roughness={0.42} />
      </mesh>
    </group>
  );
}

function Tube({ from, to, radius }: { from: Vec3; to: Vec3; radius: number }) {
  const [fx, fy, fz] = from;
  const [tx, ty, tz] = to;
  // Cylinders are born pointing up; aim their Y axis down the segment.
  const placement = useMemo(() => {
    const a = new Vector3(fx, fy, fz);
    const b = new Vector3(tx, ty, tz);
    const dir = b.clone().sub(a);
    return {
      position: a.clone().lerp(b, 0.5).toArray(),
      quaternion: new Quaternion()
        .setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize())
        .toArray() as [number, number, number, number],
      length: dir.length(),
    };
  }, [fx, fy, fz, tx, ty, tz]);

  return (
    <mesh position={placement.position} quaternion={placement.quaternion} castShadow>
      <cylinderGeometry args={[radius, radius, placement.length, 12]} />
      <meshStandardMaterial {...BODY} />
    </mesh>
  );
}

function Frame({ s }: { s: Silhouette }) {
  const curve = useMemo(() => {
    const a = getAnchors(s);
    return new CatmullRomCurve3([
      new Vector3(a.forkTop[0] - 0.02, a.forkTop[1] - 0.14, 0),
      new Vector3(a.tank[0] + 0.04, a.tank[1] - 0.06, 0),
      new Vector3(a.seat[0] + 0.06, a.seat[1] - 0.06, 0),
      new Vector3(a.tail[0], a.tail[1] - 0.04, 0),
    ]);
  }, [s]);

  return (
    <>
      {([-1, 1] as const).map((side) => (
        <mesh key={side} position={[0, 0, 0.1 * side]} castShadow>
          <tubeGeometry args={[curve, 40, 0.026, 8, false]} />
          <meshStandardMaterial {...BODY} />
        </mesh>
      ))}
    </>
  );
}

export function Bike({ family }: { family: BikeFamily }) {
  const s = getSilhouette(family.silhouette);
  const a = useMemo(() => getAnchors(s), [s]);

  return (
    <group>
      <Wheel position={a.frontAxle} radius={s.frontRadius} width={s.frontWidth} />
      <Wheel position={a.rearAxle} radius={s.rearRadius} width={s.rearWidth} />

      {/* Fork legs and swingarm, mirrored either side of the centreline. */}
      {([-1, 1] as const).map((side) => (
        <group key={side}>
          <Tube
            from={[a.frontAxle[0], a.frontAxle[1], 0.1 * side]}
            to={[a.forkTop[0], a.forkTop[1], 0.1 * side]}
            radius={0.026}
          />
          <Tube
            from={[a.rearAxle[0], a.rearAxle[1], 0.15 * side]}
            to={[a.swingarmPivot[0], a.swingarmPivot[1], 0.13 * side]}
            radius={0.03}
          />
        </group>
      ))}

      <Frame s={s} />

      {/* Engine mass. Everything above it is bodywork. */}
      <RoundedBox
        args={[0.54, 0.42, 0.36]}
        radius={0.05}
        smoothness={3}
        position={a.engine}
        castShadow
      >
        <meshStandardMaterial color="#131519" metalness={0.95} roughness={0.5} />
      </RoundedBox>

      <RoundedBox
        args={[s.tankLength, s.tankHeight, 0.34]}
        radius={0.1}
        smoothness={4}
        position={a.tank}
        castShadow
      >
        <meshStandardMaterial {...BODY} roughness={0.18} />
      </RoundedBox>

      <RoundedBox
        args={[0.44, 0.09, 0.26]}
        radius={0.04}
        smoothness={3}
        position={a.seat}
        castShadow
      >
        <meshStandardMaterial color="#0e1013" metalness={0.1} roughness={0.85} />
      </RoundedBox>

      <RoundedBox
        args={[0.3, 0.13, 0.2]}
        radius={0.05}
        smoothness={3}
        position={a.tail}
        rotation={[0, 0, -0.22 - s.tailRise]}
        castShadow
      >
        <meshStandardMaterial {...BODY} />
      </RoundedBox>

      {s.fairing && (
        <RoundedBox
          args={[0.5, 0.52, 0.42]}
          radius={0.14}
          smoothness={4}
          position={[a.headlight[0] - 0.12, a.headlight[1] - 0.2, 0]}
          castShadow
        >
          <meshStandardMaterial {...BODY} roughness={0.16} />
        </RoundedBox>
      )}

      {s.beak && (
        <RoundedBox
          args={[0.34, 0.07, 0.24]}
          radius={0.03}
          smoothness={3}
          position={[a.frontAxle[0] - 0.1, a.frontAxle[1] + 0.42, 0]}
          rotation={[0, 0, 0.16]}
          castShadow
        >
          <meshStandardMaterial {...BODY} />
        </RoundedBox>
      )}

      {/* Handlebar */}
      <mesh position={[a.forkTop[0] - 0.02, a.forkTop[1] + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.016, s.barWidth, 12]} />
        <meshStandardMaterial {...CHROME} roughness={0.3} />
      </mesh>

      {/* Headlight: the one warm source on the bike, so the LEDs stay the story. */}
      <mesh position={a.headlight}>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshStandardMaterial
          color="#fff4dd"
          emissive="#ffe9c4"
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>

      {/* Exhaust */}
      <mesh position={[-0.34, a.engine[1] - 0.06, 0.11]} rotation={[0, 0, Math.PI / 2 + 0.12]}>
        <cylinderGeometry args={[0.05, 0.055, 0.5, 20]} />
        <meshStandardMaterial {...CHROME} roughness={0.34} />
      </mesh>
    </group>
  );
}
