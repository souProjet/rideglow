import type { BikeFamily } from "@/lib/catalog";

/**
 * Procedural placeholder geometry for the showroom, in meters, +X forward,
 * +Y up, ground at y = 0.
 *
 * These are parameters, not a mesh: one generator with per-family numbers gives
 * four silhouettes that read as different bikes without four hand-modeled
 * assets. Swap this module for GLB loading when the real models land: the LED
 * rig only consumes `stripRuns`, so nothing else has to change.
 */

export type Vec3 = [number, number, number];

export type Silhouette = {
  wheelbase: number;
  frontRadius: number;
  rearRadius: number;
  frontWidth: number;
  rearWidth: number;
  /** Fork angle off vertical, radians. Bigger = more chopper. */
  rake: number;
  /** Ground clearance offset: lifts the engine and the swingarm pivot only. */
  stance: number;
  seatY: number;
  tankLength: number;
  tankHeight: number;
  tailRise: number;
  barY: number;
  barWidth: number;
  fairing: boolean;
  beak: boolean;
  /** Half-depth of every body mass: tank, seat, tail, engine. */
  bodyZ: number;
  /** Centerline offset of one fork leg, and its tube radius. */
  forkZ: number;
  forkR: number;
  /** Centerline offset of one swingarm arm, and its half-thickness. */
  swingarmZ: number;
  swingarmR: number;
};

/**
 * How far the tape's centerline stands off the surface it is taped to: half the
 * silicone channel plus the adhesive under it. The previous 30 mm was sized for
 * a strip drawn as beads threaded on a tube, and it left every run hovering a
 * finger's width off the bodywork instead of lying on it.
 */
export const LED_STANDOFF = 0.004;

const SILHOUETTES: Record<BikeFamily["silhouette"], Silhouette> = {
  roadster: {
    wheelbase: 1.42,
    frontRadius: 0.31,
    rearRadius: 0.31,
    frontWidth: 0.11,
    rearWidth: 0.17,
    rake: 0.44,
    stance: 0,
    seatY: 0.8,
    tankLength: 0.52,
    tankHeight: 0.26,
    tailRise: 0.08,
    barY: 1.04,
    barWidth: 0.66,
    fairing: false,
    beak: false,
    bodyZ: 0.17,
    forkZ: 0.1,
    forkR: 0.027,
    swingarmZ: 0.15,
    swingarmR: 0.032,
  },
  sport: {
    wheelbase: 1.4,
    frontRadius: 0.31,
    rearRadius: 0.31,
    frontWidth: 0.11,
    rearWidth: 0.19,
    rake: 0.41,
    stance: 0.02,
    seatY: 0.84,
    tankLength: 0.56,
    tankHeight: 0.22,
    tailRise: 0.16,
    barY: 0.94,
    barWidth: 0.5,
    fairing: true,
    beak: false,
    bodyZ: 0.185,
    forkZ: 0.105,
    forkR: 0.028,
    swingarmZ: 0.155,
    swingarmR: 0.034,
  },
  trail: {
    wheelbase: 1.54,
    frontRadius: 0.37,
    rearRadius: 0.32,
    frontWidth: 0.1,
    rearWidth: 0.15,
    rake: 0.48,
    stance: 0.11,
    seatY: 0.93,
    tankLength: 0.5,
    tankHeight: 0.3,
    tailRise: 0.05,
    barY: 1.18,
    barWidth: 0.8,
    fairing: false,
    beak: true,
    bodyZ: 0.16,
    forkZ: 0.115,
    forkR: 0.026,
    swingarmZ: 0.145,
    swingarmR: 0.03,
  },
  custom: {
    wheelbase: 1.72,
    frontRadius: 0.34,
    rearRadius: 0.29,
    frontWidth: 0.09,
    rearWidth: 0.22,
    rake: 0.62,
    stance: -0.07,
    seatY: 0.68,
    tankLength: 0.44,
    tankHeight: 0.24,
    tailRise: -0.02,
    barY: 1.02,
    barWidth: 0.72,
    fairing: false,
    beak: false,
    bodyZ: 0.175,
    forkZ: 0.115,
    forkR: 0.03,
    swingarmZ: 0.165,
    swingarmR: 0.036,
  },
};

export function getSilhouette(kind: BikeFamily["silhouette"]): Silhouette {
  return SILHOUETTES[kind];
}

export type Anchors = {
  frontAxle: Vec3;
  rearAxle: Vec3;
  forkTop: Vec3;
  /** Where the frame grabs the steering axis, a little below the yoke. */
  headTube: Vec3;
  swingarmPivot: Vec3;
  engine: Vec3;
  tank: Vec3;
  seat: Vec3;
  tail: Vec3;
  headlight: Vec3;
};

/**
 * Every mass is placed off the one in front of it, nose to tail. The previous
 * version gave the tank, the seat and the engine their own constants, so they
 * drifted apart the moment a family changed its rake: the tank ended up
 * overlapping the fork and the engine swallowed the swingarm.
 */
export function getAnchors(s: Silhouette): Anchors {
  const frontX = s.wheelbase / 2;
  const rearX = -s.wheelbase / 2;
  const forkLength = s.barY - s.frontRadius + 0.04;
  const rakeSin = Math.sin(s.rake);
  const rakeCos = Math.cos(s.rake);

  const forkTop: Vec3 = [frontX - rakeSin * forkLength, s.frontRadius + rakeCos * forkLength, 0];
  // Down the steering axis is forward as well as down, which is why the head
  // tube sits ahead of the yoke rather than under it.
  const headDrop = forkLength * 0.21;
  const headTube: Vec3 = [forkTop[0] + rakeSin * headDrop, forkTop[1] - rakeCos * headDrop, 0];

  // The tank noses up to the fork and stops 3 cm short of it. Solving for the
  // fork line at tank height is what keeps that gap honest across four rakes.
  const tankY = s.seatY - 0.03;
  const forkAtTankY = frontX - rakeSin * ((tankY - s.frontRadius) / rakeCos);
  const tank: Vec3 = [forkAtTankY - 0.03 - s.tankLength * 0.5, tankY, 0];

  // The block hangs under the tank, ahead of the pivot, with the sump clear of
  // the road. Ride height is a per-family stance, not a global lift.
  const engine: Vec3 = [tank[0] - 0.12, 0.4 + s.stance, 0];
  const seat: Vec3 = [tank[0] - s.tankLength * 0.5 - 0.17, s.seatY, 0];

  return {
    frontAxle: [frontX, s.frontRadius, 0],
    rearAxle: [rearX, s.rearRadius, 0],
    forkTop,
    headTube,
    swingarmPivot: [engine[0] - 0.24, engine[1] + 0.06, 0],
    engine,
    tank,
    seat,
    tail: [seat[0] - 0.3, s.seatY - 0.03 + s.tailRise, 0],
    // A faired bike carries its lamp in the nose of the fairing, a naked one on
    // a bracket off the head tube. Same anchor, 4 cm apart.
    headlight: s.fairing
      ? [headTube[0] + 0.17, headTube[1] + 0.03, 0]
      : [headTube[0] + 0.13, headTube[1] + 0.05, 0],
  };
}

export type StripRun = {
  /** Spine of the run; the rig instances LEDs along a spline through these. */
  points: Vec3[];
  /** -1 left, 1 right. The `ride` mode uses this to light the inside of a turn. */
  side: -1 | 1;
};

/**
 * One run before mirroring: x, y, and the half-width of the panel it is taped
 * to at that point, all in fitted meters. The third component is a distance,
 * not a signed coordinate; `getStripRuns` gives it a sign per side.
 */
export type StripPath = readonly Vec3[];

/**
 * Runs measured off a real GLB instead of derived from the silhouette.
 *
 * The derived runs hang off `getAnchors`, where the tank, the swingarm pivot
 * and the fork are all solved from the same handful of numbers. That is what
 * keeps four generated bikes coherent, and it is exactly why it cannot fit a
 * scanned one: on the SPY, the tank position that puts the swingarm run on the
 * swingarm pushes the tank run off the back of the bodywork, and no rake
 * satisfies both. A bike we did not draw gets its three lines measured off its
 * own mesh: `scratchpad/parts.py` prints per-part bounds in fitted meters, and
 * these are read straight off that.
 */
export function getStripRuns(s: Silhouette, measured?: readonly StripPath[]): StripRun[] {
  const paths = measured ?? deriveStripPaths(s);

  return paths.flatMap<StripRun>((points) =>
    ([-1, 1] as const).map((side) => ({
      side,
      points: points.map(([x, y, z]) => [x, y, (z + LED_STANDOFF) * side] as Vec3),
    })),
  );
}

/** Points along a circle, for a run that follows a fender or a case cover. */
function arcPoints(
  cx: number,
  cy: number,
  r: number,
  from: number,
  to: number,
  n: number,
): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const angle = from + ((to - from) * i) / (n - 1);
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  });
}

/**
 * The five runs a Signature kit ships, ordered nose to tail.
 *
 * Each one sits on a part a fitter can actually reach and stick tape to: the
 * underside of the front fender, the fork leg, a ring around the crankcase
 * cover, the swingarm, the subframe loop under the tail. Two of them are arcs
 * because the parts are round, and a straight run cut across a fender or a case
 * cover reads as a stray wire rather than a fitted strip.
 *
 * They are also spread across four heights on purpose: three runs on the upper
 * half of the bike read as one broken line from the side.
 */
function deriveStripPaths(s: Silhouette): StripPath[] {
  const a = getAnchors(s);
  const [engineX, engineY] = a.engine;
  const [tailX, tailY] = a.tail;

  // Every z is the half-depth of the part the run is taped to, plus the
  // standoff, so each run lies on its own panel. The masses do not share a
  // width: the tank slab is 1.9 x bodyZ deep and the swingarm 1.7 x its own
  // radius, so one shared offset put some runs inside the bike and others in
  // mid-air. `bike.tsx` is the source of these ratios.
  const engineZ = s.bodyZ * 0.85;
  const tailZ = s.bodyZ * 0.575;
  const swingZ = s.swingarmZ + s.swingarmR * 0.85;
  const forkZ = s.forkZ + s.forkR;
  // A fender shell clears the tire it covers: half the tire, plus the shell.
  const fenderZ = s.frontWidth / 2 + 0.014;

  const runs: { points: [number, number][]; z: number }[] = [
    {
      // Under the front fender, in the gap between the shell and the tire.
      // `bike.tsx` lathes that shell at frontRadius + 0.035 over phi 0.46pi to
      // 1.20pi, which after the mesh's own X rotation is 7 degrees below the
      // front of the axle, over the crown, to 126 degrees. The run is centered
      // in that sweep with 17 degrees of margin at each end, and sits 25 mm out
      // from the tire so its 14 mm of tape clears the shell instead of being
      // swept through it: at the shell's own radius, half the strip rendered
      // inside the fender.
      points: arcPoints(a.frontAxle[0], a.frontAxle[1], s.frontRadius + 0.025, 0.164, 1.909, 6),
      z: fenderZ,
    },
    {
      // Fork leg: axle up to the yoke, the run that flashes for indicators.
      // Sampled along the leg's own axis, because the leg is raked and a run
      // built from vertical offsets peels away from it as the rake steepens.
      points: ([0.16, 0.5, 0.88] as const).map(
        (u) =>
          [
            a.frontAxle[0] + (a.forkTop[0] - a.frontAxle[0]) * u,
            a.frontAxle[1] + (a.forkTop[1] - a.frontAxle[1]) * u,
          ] as [number, number],
      ),
      z: forkZ,
    },
    {
      // A closed ring around the crankcase cover, which is the one part of a
      // naked bike's engine that faces the viewer square on. Nine points, the
      // last landing back on the first, so the loop closes.
      points: arcPoints(engineX + 0.02, engineY - 0.02, 0.105, 0, Math.PI * 2, 9),
      z: engineZ,
    },
    {
      // Swingarm: axle to pivot, following the arm as it rises.
      points: [
        [a.rearAxle[0] + 0.05, a.rearAxle[1] + 0.02],
        [
          (a.rearAxle[0] + a.swingarmPivot[0]) / 2,
          (a.rearAxle[1] + a.swingarmPivot[1]) / 2 + 0.025,
        ],
        [a.swingarmPivot[0] - 0.03, a.swingarmPivot[1]],
      ],
      z: swingZ,
    },
    {
      // Subframe loop, under the tail unit, seat end backwards. Sits on the
      // narrowest slab on the bike, which is why it gets its own z.
      points: [
        [tailX + 0.14, tailY - 0.05],
        [tailX - 0.02, tailY - 0.04],
        [tailX - 0.15, tailY],
      ],
      z: tailZ,
    },
  ];

  return runs.map(({ points, z }) => points.map(([x, y]) => [x, y, z] as Vec3));
}
