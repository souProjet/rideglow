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
 * The three runs a kit ships, mirrored left and right. Order matters: run 0 is
 * the front-most, which is what the sound mode assumes when it puts bass at the
 * nose.
 */
export function getStripRuns(s: Silhouette): StripRun[] {
  const a = getAnchors(s);
  const [tankX, tankY] = a.tank;
  const tl = s.tankLength;
  const th = s.tankHeight;

  // Every z is the half-depth of the part the run is taped to, plus the
  // standoff, so each run lies on its own panel. The masses do not share a
  // width: the tank slab is 1.9 x bodyZ deep and the swingarm 1.7 x its own
  // radius, so one shared offset put some runs inside the bike and others in
  // mid-air.
  const tankZ = s.bodyZ * 0.95 + LED_STANDOFF;
  const swingZ = s.swingarmZ + s.swingarmR * 0.85 + LED_STANDOFF;
  const forkZ = s.forkZ + s.forkR + LED_STANDOFF;

  const runs: { points: Vec3[]; z: number }[] = [
    {
      // The seam along the bottom of the tank, rising at the back where the
      // panel meets the seat. Set inside the profile rather than under it: run
      // below the tank and the strip hangs in the air over the frame spar.
      points: [
        [tankX + tl * 0.4, tankY - th * 0.2, 0],
        [tankX + tl * 0.05, tankY - th * 0.34, 0],
        [tankX - tl * 0.34, tankY - th * 0.2, 0],
        [tankX - tl * 0.46, tankY + th * 0.06, 0],
      ],
      z: tankZ,
    },
    {
      // Swingarm: axle to pivot, following the arm as it rises.
      points: [
        [a.rearAxle[0] + 0.05, a.rearAxle[1] + 0.02, 0],
        [
          (a.rearAxle[0] + a.swingarmPivot[0]) / 2,
          (a.rearAxle[1] + a.swingarmPivot[1]) / 2 + 0.025,
          0,
        ],
        [a.swingarmPivot[0] - 0.03, a.swingarmPivot[1], 0],
      ],
      z: swingZ,
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
            0,
          ] as Vec3,
      ),
      z: forkZ,
    },
  ];

  return runs.flatMap<StripRun>(({ points, z }) =>
    ([-1, 1] as const).map((side) => ({
      side,
      points: points.map(([x, y]) => [x, y, z * side] as Vec3),
    })),
  );
}
