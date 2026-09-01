"use client";

import { useMemo } from "react";
import {
  CatmullRomCurve3,
  ExtrudeGeometry,
  type ExtrudeGeometryOptions,
  LatheGeometry,
  Quaternion,
  Shape,
  Vector2,
  Vector3,
} from "three";
import {
  type Anchors,
  getAnchors,
  getSilhouette,
  type Silhouette,
  type Vec3,
} from "@/lib/bike-geometry";
import type { BikeFamily } from "@/lib/catalog";

/**
 * The bike reads as dark anodized aluminum under a hard rim light, so the
 * strips stay the only color in the frame. Body masses are extruded side
 * profiles rather than boxes, and each one is placed off an anchor rather than
 * a constant, which is what keeps the outline saying "motorcycle" across four
 * families without a modeled asset.
 *
 * Metalness stays mid: a near-black body at metalness 0.9 has almost no diffuse
 * term, so in a sparse studio environment it renders as a hole in the picture.
 */
const BODY = {
  // Lifted off near-black and pulled back off full metal: at #1c2028 / 0.45 the
  // diffuse term was so small that the near flank carried no gradient at all
  // and every preset but the rim-lit three-quarter showed a silhouette.
  color: "#242a34",
  metalness: 0.38,
  roughness: 0.3,
  // Painted panels are lacquer over metal, not bare metal. The clearcoat lobe is
  // the sharp highlight that separates a tank from a machined case, and without
  // it every mass on the bike came back wearing the same soft sheen.
  clearcoat: 0.75,
  clearcoatRoughness: 0.22,
} as const;
const CASE = { color: "#1b1f26", metalness: 0.74, roughness: 0.5 } as const;
const FRAME = { color: "#232830", metalness: 0.72, roughness: 0.4 } as const;
const RUBBER = {
  color: "#0b0c0e",
  metalness: 0.02,
  roughness: 0.95,
  // Rubber scatters at grazing angles: this is the dusty edge light along the
  // shoulder of a tire, which is most of what makes one read as rubber.
  sheen: 0.4,
  sheenColor: "#333a44",
} as const;
const CHROME = { color: "#98a2b0", metalness: 1, roughness: 0.2 } as const;
const SEAT = { color: "#0d0f12", metalness: 0.03, roughness: 0.86 } as const;

type Profile = readonly (readonly [number, number])[];
type Finish = {
  color: string;
  metalness: number;
  roughness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  sheen?: number;
  sheenColor?: string;
};

/**
 * A closed side profile pushed through Z. The outline is sampled off a closed
 * Catmull-Rom so the control points read as a smooth panel, not a polygon.
 */
function useSlab(profile: Profile, depth: number, bevel: number) {
  return useMemo(() => {
    // Tension above the 0.5 default: at 0.5 the interpolation rounds every
    // control point away and each panel comes out a smooth pod, so the tank,
    // the seat and the block all read as the same blob.
    const curve = new CatmullRomCurve3(
      profile.map(([x, y]) => new Vector3(x, y, 0)),
      true,
      "catmullrom",
      0.68,
    );
    const shape = new Shape(curve.getSpacedPoints(72).map((p) => new Vector2(p.x, p.y)));
    const options: ExtrudeGeometryOptions = {
      depth: Math.max(0.001, depth - bevel * 2),
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 1,
    };
    const geometry = new ExtrudeGeometry(shape, options);
    geometry.translate(0, 0, -depth / 2 + bevel);
    geometry.computeVertexNormals();
    return geometry;
  }, [profile, depth, bevel]);
}

function Slab({
  profile,
  depth,
  bevel = 0.03,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  material = BODY,
}: {
  profile: Profile;
  depth: number;
  bevel?: number;
  position?: Vec3;
  rotation?: Vec3;
  material?: Finish;
}) {
  const geometry = useSlab(profile, depth, bevel);
  return (
    <mesh geometry={geometry} position={position} rotation={rotation}>
      <meshPhysicalMaterial {...material} />
    </mesh>
  );
}

/**
 * A torus cannot be a motorcycle tire: its section is circular, so the tread
 * ends up as wide as it is tall and the wheel reads as a doughnut. This lathes
 * the real section instead, flat across the tread with rounded shoulders.
 */
function useTire(radius: number, width: number, rimR: number) {
  return useMemo(() => {
    const w = width / 2;
    const shoulder = radius * 0.11;
    const profile: Vector2[] = [new Vector2(rimR, -w)];
    for (let i = 0; i <= 4; i++) {
      const a = (i / 4) * (Math.PI / 2);
      profile.push(
        new Vector2(radius - shoulder * (1 - Math.sin(a)), -w + shoulder * (1 - Math.cos(a))),
      );
    }
    for (let i = 4; i >= 0; i--) {
      const a = (i / 4) * (Math.PI / 2);
      profile.push(
        new Vector2(radius - shoulder * (1 - Math.sin(a)), w - shoulder * (1 - Math.cos(a))),
      );
    }
    profile.push(new Vector2(rimR, w));
    return new LatheGeometry(profile, 64);
  }, [radius, width, rimR]);
}

/**
 * A mudguard is a channel section swept around the axle, so it is a partial
 * lathe. Revolved from the same Y axis as the tire and laid over with it.
 */
function useShell(radius: number, width: number, phiStart: number, phiLength: number) {
  return useMemo(() => {
    const w = width / 2;
    const t = 0.014;
    return new LatheGeometry(
      [
        new Vector2(radius, -w),
        new Vector2(radius + t, -w),
        new Vector2(radius + t, w),
        new Vector2(radius, w),
      ],
      32,
      phiStart,
      phiLength,
    );
  }, [radius, width, phiStart, phiLength]);
}

function Wheel({ position, radius, width }: { position: Vec3; radius: number; width: number }) {
  const rimR = radius * 0.7;
  const hubR = radius * 0.16;
  const spokes = 5;
  const tire = useTire(radius, width, rimR);

  // Built around the Y axis so the section can be lathed, then laid over so the
  // axle runs down Z like the rest of the bike.
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh geometry={tire}>
        <meshPhysicalMaterial {...RUBBER} side={2} />
      </mesh>

      {/* Rim barrel. */}
      <mesh>
        <cylinderGeometry args={[rimR, rimR, width * 0.78, 48, 1, true]} />
        <meshStandardMaterial color="#31363f" metalness={1} roughness={0.36} side={2} />
      </mesh>

      {/* Cast spokes: hub to rim, not bars through the center. */}
      {Array.from({ length: spokes }, (_, i) => {
        const angle = (i / spokes) * Math.PI * 2;
        const mid = (hubR + rimR) / 2;
        return (
          <mesh
            key={angle}
            position={[Math.cos(angle) * mid, 0, Math.sin(angle) * mid]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[rimR - hubR, width * 0.3, radius * 0.15]} />
            <meshStandardMaterial color="#262b32" metalness={0.95} roughness={0.42} />
          </mesh>
        );
      })}

      <mesh>
        <cylinderGeometry args={[hubR, hubR, width * 1.05, 24]} />
        <meshStandardMaterial color="#2b3038" metalness={1} roughness={0.4} />
      </mesh>

      {/* Brake disc, one side only, like the real thing on a light bike. */}
      <mesh position={[0, width * 0.6, 0]}>
        <cylinderGeometry args={[radius * 0.6, radius * 0.6, 0.007, 40]} />
        <meshStandardMaterial color="#788292" metalness={1} roughness={0.26} />
      </mesh>
    </group>
  );
}

function Fender({
  position,
  radius,
  width,
  phiStart,
  phiLength,
}: {
  position: Vec3;
  radius: number;
  width: number;
  phiStart: number;
  phiLength: number;
}) {
  const geometry = useShell(radius, width, phiStart, phiLength);
  return (
    <mesh geometry={geometry} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <meshPhysicalMaterial {...BODY} side={2} />
    </mesh>
  );
}

/** Cylinders are born pointing up; aim their Y axis down the segment. */
function Tube({
  from,
  to,
  radius,
  radiusTop,
  material = CHROME,
}: {
  from: Vec3;
  to: Vec3;
  radius: number;
  radiusTop?: number;
  material?: Finish;
}) {
  const [fx, fy, fz] = from;
  const [tx, ty, tz] = to;
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
    <mesh position={placement.position} quaternion={placement.quaternion}>
      <cylinderGeometry args={[radiusTop ?? radius, radius, placement.length, 16]} />
      <meshPhysicalMaterial {...material} />
    </mesh>
  );
}

/**
 * Spar, downtube and subframe. Without the subframe the seat and tail cowl hang
 * in mid-air over the rear wheel, which was the single loudest tell that this
 * was not a motorcycle.
 */
function Chassis({ s, a }: { s: Silhouette; a: Anchors }) {
  // Three waypoints, both coordinates falling, and centripetal parameterization.
  // The four-point uniform version overshot into a visible loop in front of the
  // tank on every family: under a chopper's low seat the mid points ran back
  // uphill, and uniform Catmull-Rom answers that with a cusp.
  const spar = useMemo(
    () =>
      new CatmullRomCurve3(
        [
          new Vector3(a.headTube[0] - 0.02, a.headTube[1] - 0.03, 0),
          new Vector3(a.tank[0] - s.tankLength * 0.18, a.tank[1] - s.tankHeight * 0.62, 0),
          new Vector3(a.swingarmPivot[0] + 0.02, a.swingarmPivot[1] + 0.07, 0),
        ],
        false,
        "centripetal",
      ),
    [a, s.tankLength, s.tankHeight],
  );

  const sparZ = s.bodyZ - 0.02;
  const subZ = s.bodyZ * 0.55;

  return (
    <>
      {([-1, 1] as const).map((side) => (
        <group key={side}>
          <mesh position={[0, 0, sparZ * side]}>
            <tubeGeometry args={[spar, 48, 0.027, 10, false]} />
            <meshStandardMaterial {...FRAME} />
          </mesh>
          {/* Subframe: seat rail plus the strut that triangulates it. */}
          <Tube
            from={[a.seat[0] + 0.16, a.seat[1] - 0.1, subZ * side]}
            to={[a.tail[0] - 0.12, a.tail[1] - 0.05, subZ * side]}
            radius={0.018}
            material={FRAME}
          />
          <Tube
            from={[a.swingarmPivot[0] + 0.03, a.swingarmPivot[1] + 0.1, subZ * side]}
            to={[a.tail[0] + 0.04, a.tail[1] - 0.09, subZ * side]}
            radius={0.016}
            material={FRAME}
          />
        </group>
      ))}

      {/* Downtube: the frame element that says "naked bike" from the side. */}
      <Tube
        from={[a.headTube[0] - 0.01, a.headTube[1] - 0.07, 0]}
        to={[a.engine[0] + 0.16, a.engine[1] - 0.13, 0]}
        radius={0.023}
        material={FRAME}
      />

      {/* Monoshock, right where the eye expects to find it. */}
      <Tube
        from={[a.swingarmPivot[0] + 0.05, a.swingarmPivot[1] - 0.03, 0]}
        to={[a.seat[0] + 0.04, a.seat[1] - 0.15, 0]}
        radius={0.024}
        material={CHROME}
      />

      {/* Head tube itself, so the fork does not float free of the frame. */}
      <Tube
        from={[a.headTube[0] - 0.03, a.headTube[1] - 0.07, 0]}
        to={[a.headTube[0] + 0.03, a.headTube[1] + 0.07, 0]}
        radius={0.038}
        material={FRAME}
      />
    </>
  );
}

export function Bike({ family }: { family: BikeFamily }) {
  const s = getSilhouette(family.silhouette);
  const a = useMemo(() => getAnchors(s), [s]);
  const { tankLength: tl, tankHeight: th } = s;

  const tankProfile = useMemo<Profile>(
    () => [
      [tl * 0.5, -th * 0.06],
      [tl * 0.4, -th * 0.44],
      [tl * 0.02, -th * 0.5],
      [-tl * 0.38, -th * 0.34],
      [-tl * 0.5, th * 0.14],
      [-tl * 0.28, th * 0.48],
      [tl * 0.14, th * 0.5],
      [tl * 0.42, th * 0.26],
    ],
    [tl, th],
  );

  // Flat pad, thin, sitting on the rails. The old one was a 0.6 m wing.
  const seatProfile = useMemo<Profile>(
    () => [
      [0.19, 0.015],
      [0.19, -0.05],
      [-0.06, -0.06],
      [-0.19, -0.03],
      [-0.19, 0.025],
      [0.02, 0.04],
    ],
    [],
  );

  const tailProfile = useMemo<Profile>(
    () => [
      [0.2, -0.01],
      [0.19, -0.1],
      [0.0, -0.12],
      [-0.16, -0.05],
      [-0.18, 0.05],
      [0.04, 0.08],
    ],
    [],
  );

  // Barrels leaning forward over a crankcase, tucked under the tank.
  const engineProfile = useMemo<Profile>(
    () => [
      [0.13, 0.19],
      [0.21, 0.03],
      [0.17, -0.12],
      [0.04, -0.19],
      [-0.14, -0.16],
      [-0.21, 0.0],
      [-0.13, 0.13],
      [0.0, 0.18],
    ],
    [],
  );

  // A nose cone around the steering head, not a wall in front of it: the older
  // profile was 0.44 x 0.58 and reached past the front axle, so it hid the
  // fork, the wheel and the lamp behind one black panel.
  const fairingProfile = useMemo<Profile>(
    () => [
      [0.15, 0.14],
      [0.16, -0.06],
      [0.06, -0.22],
      [-0.12, -0.2],
      [-0.16, 0.08],
      [-0.04, 0.24],
    ],
    [],
  );

  const beakProfile = useMemo<Profile>(
    () => [
      [0.3, 0.02],
      [0.22, -0.05],
      [-0.2, -0.06],
      [-0.24, 0.03],
      [-0.02, 0.07],
    ],
    [],
  );

  const swingarmProfile = useMemo<Profile>(() => {
    const [rx, ry] = a.rearAxle;
    const [px, py] = a.swingarmPivot;
    return [
      [rx - 0.03, ry + 0.055],
      [px + 0.02, py + 0.06],
      [px + 0.02, py - 0.06],
      [rx - 0.03, ry - 0.05],
    ];
  }, [a.rearAxle, a.swingarmPivot]);

  return (
    <group>
      <Wheel position={a.frontAxle} radius={s.frontRadius} width={s.frontWidth} />
      <Wheel position={a.rearAxle} radius={s.rearRadius} width={s.rearWidth} />

      <Fender
        position={a.frontAxle}
        radius={s.frontRadius + 0.035}
        width={s.frontWidth * 1.55}
        phiStart={Math.PI * 0.46}
        phiLength={Math.PI * 0.74}
      />

      {([-1, 1] as const).map((side) => (
        <group key={side}>
          {/* Fork leg: fat slider at the bottom, thinner stanchion up top. */}
          <Tube
            from={[a.frontAxle[0], a.frontAxle[1], s.forkZ * side]}
            to={[a.forkTop[0], a.forkTop[1], s.forkZ * side]}
            radius={s.forkR}
            radiusTop={s.forkR * 0.78}
          />
          <Slab
            profile={swingarmProfile}
            depth={s.swingarmR * 1.7}
            bevel={0.012}
            position={[0, 0, s.swingarmZ * side]}
            material={CASE}
          />
        </group>
      ))}

      {/* Triple clamp: the detail that stops the fork reading as two loose pipes. */}
      <Tube
        from={[a.forkTop[0], a.forkTop[1] - 0.02, -s.forkZ * 1.25]}
        to={[a.forkTop[0], a.forkTop[1] - 0.02, s.forkZ * 1.25]}
        radius={0.032}
      />

      <Chassis s={s} a={a} />

      <Slab
        profile={engineProfile}
        depth={s.bodyZ * 1.7}
        bevel={0.035}
        position={a.engine}
        material={CASE}
      />
      {/* Cylinder fins and a radiator. Two cheap meshes, and between them the
          only reason the space under the tank reads as an engine and not a
          shadow. */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[a.engine[0] + 0.09, a.engine[1] + 0.07 + i * 0.042, 0]}
          rotation={[0, 0, -0.18]}
        >
          <boxGeometry args={[0.19 - i * 0.02, 0.013, s.bodyZ * 1.6]} />
          <meshStandardMaterial color="#2a303a" metalness={0.8} roughness={0.44} />
        </mesh>
      ))}
      <mesh position={[a.engine[0] + 0.23, a.engine[1] + 0.02, 0]} rotation={[0, 0, 0.16]}>
        <boxGeometry args={[0.045, 0.27, s.bodyZ * 1.45]} />
        <meshStandardMaterial color="#101318" metalness={0.6} roughness={0.72} />
      </mesh>

      <Slab profile={tankProfile} depth={s.bodyZ * 1.9} bevel={0.03} position={a.tank} />
      <Slab
        profile={seatProfile}
        depth={s.bodyZ * 1.0}
        bevel={0.02}
        position={a.seat}
        material={SEAT}
      />
      <Slab profile={tailProfile} depth={s.bodyZ * 1.15} bevel={0.03} position={a.tail} />

      {s.fairing && (
        <Slab
          profile={fairingProfile}
          depth={s.bodyZ * 1.5}
          bevel={0.04}
          position={[a.headTube[0] + 0.01, a.headTube[1] + 0.05, 0]}
        />
      )}

      {s.beak && (
        <Slab
          profile={beakProfile}
          depth={s.bodyZ * 1.3}
          bevel={0.022}
          position={[a.headTube[0] + 0.04, a.headTube[1] - 0.24, 0]}
          rotation={[0, 0, 0.14]}
        />
      )}

      {/* Handlebar */}
      <mesh position={[a.forkTop[0] - 0.03, a.forkTop[1] + 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, s.barWidth, 16]} />
        <meshStandardMaterial {...CHROME} roughness={0.3} />
      </mesh>

      {/* Headlight: a round lamp facing down +X. A sphere here read as a chrome
          egg, and a polished one mirrored the whole studio back at the camera.
          The bike is parked, so the lens stays dark with one specular hit. */}
      <group position={a.headlight} rotation={[0, 0, -Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.105, 0.088, 0.11, 28]} />
          <meshStandardMaterial {...CASE} />
        </mesh>
        <mesh position={[0, 0.058, 0]}>
          <cylinderGeometry args={[0.092, 0.092, 0.012, 28]} />
          <meshStandardMaterial
            color="#14181f"
            metalness={0.35}
            roughness={0.22}
            emissive="#8fa4c4"
            emissiveIntensity={0.06}
          />
        </mesh>
      </group>

      {/* Exhaust: header off the front of the block, muffler up on the right. */}
      <Tube
        from={[a.engine[0] + 0.15, a.engine[1] - 0.12, s.bodyZ * 0.4]}
        to={[a.engine[0] - 0.14, a.engine[1] - 0.21, s.bodyZ * 0.62]}
        radius={0.022}
      />
      <Tube
        from={[a.engine[0] - 0.14, a.engine[1] - 0.21, s.bodyZ * 0.62]}
        to={[a.tail[0] + 0.06, a.engine[1] + 0.08, s.bodyZ * 0.82]}
        radius={0.026}
        radiusTop={0.058}
        material={CASE}
      />
    </group>
  );
}
