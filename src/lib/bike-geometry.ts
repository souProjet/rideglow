import type { BikeFamily } from "@/lib/catalog";

/**
 * Procedural placeholder geometry for the showroom, in metres, +X forward,
 * +Y up, ground at y = 0.
 *
 * These are parameters, not a mesh: one generator with per-family numbers gives
 * four silhouettes that read as different bikes without four hand-modelled
 * assets. Swap this module for GLB loading when the real models land — the LED
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
  /** Ride height offset applied to the whole upper body. */
  stance: number;
  seatY: number;
  tankX: number;
  tankLength: number;
  tankHeight: number;
  tailRise: number;
  barY: number;
  barWidth: number;
  fairing: boolean;
  beak: boolean;
};

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
    tankX: 0.28,
    tankLength: 0.52,
    tankHeight: 0.26,
    tailRise: 0.08,
    barY: 1.04,
    barWidth: 0.66,
    fairing: false,
    beak: false,
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
    tankX: 0.3,
    tankLength: 0.56,
    tankHeight: 0.22,
    tailRise: 0.16,
    barY: 0.94,
    barWidth: 0.5,
    fairing: true,
    beak: false,
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
    tankX: 0.26,
    tankLength: 0.5,
    tankHeight: 0.3,
    tailRise: 0.05,
    barY: 1.18,
    barWidth: 0.8,
    fairing: false,
    beak: true,
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
    tankX: 0.24,
    tankLength: 0.44,
    tankHeight: 0.24,
    tailRise: -0.02,
    barY: 1.02,
    barWidth: 0.72,
    fairing: false,
    beak: false,
  },
};

export function getSilhouette(kind: BikeFamily["silhouette"]): Silhouette {
  return SILHOUETTES[kind];
}

export type Anchors = {
  frontAxle: Vec3;
  rearAxle: Vec3;
  forkTop: Vec3;
  swingarmPivot: Vec3;
  engine: Vec3;
  tank: Vec3;
  seat: Vec3;
  tail: Vec3;
  headlight: Vec3;
};

export function getAnchors(s: Silhouette): Anchors {
  const frontX = s.wheelbase / 2;
  const rearX = -s.wheelbase / 2;
  const forkLength = s.barY - s.frontRadius + 0.04;
  return {
    frontAxle: [frontX, s.frontRadius, 0],
    rearAxle: [rearX, s.rearRadius, 0],
    forkTop: [
      frontX - Math.sin(s.rake) * forkLength,
      s.frontRadius + Math.cos(s.rake) * forkLength,
      0,
    ],
    swingarmPivot: [rearX + s.wheelbase * 0.42, s.rearRadius + 0.13 + s.stance, 0],
    engine: [-0.02, 0.46 + s.stance, 0],
    tank: [s.tankX, s.seatY - 0.02, 0],
    seat: [-0.18, s.seatY, 0],
    tail: [-0.5, s.seatY + s.tailRise, 0],
    headlight: [frontX - Math.sin(s.rake) * (forkLength * 0.82) + 0.07, s.barY - 0.12, 0],
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
  const bellyZ = s.fairing ? 0.16 : 0.13;
  const [tankX, tankY] = a.tank;
  const belly = tankY - s.tankHeight * 0.5 - 0.04;

  const runs: { points: Vec3[]; z: number }[] = [
    {
      // Under the tank or the fairing lip: the run everyone sees first.
      points: [
        [tankX + s.tankLength * 0.52, belly + 0.05, 0],
        [tankX, belly, 0],
        [tankX - s.tankLength * 0.55, belly - 0.02, 0],
        [a.engine[0] - 0.24, a.engine[1] - 0.02, 0],
      ],
      z: bellyZ,
    },
    {
      // Swingarm: axle to pivot, following the arm as it rises.
      points: [
        [a.rearAxle[0] + 0.04, a.rearAxle[1] + 0.01, 0],
        [
          (a.rearAxle[0] + a.swingarmPivot[0]) / 2,
          (a.rearAxle[1] + a.swingarmPivot[1]) / 2 + 0.02,
          0,
        ],
        [a.swingarmPivot[0], a.swingarmPivot[1], 0],
      ],
      z: 0.16,
    },
    {
      // Fork leg: axle up to the yoke, the run that flashes for indicators.
      points: [
        [a.frontAxle[0] - 0.01, a.frontAxle[1] + 0.06, 0],
        [(a.frontAxle[0] + a.forkTop[0]) / 2, (a.frontAxle[1] + a.forkTop[1]) / 2, 0],
        [a.forkTop[0] + 0.01, a.forkTop[1] - 0.08, 0],
      ],
      z: 0.105,
    },
  ];

  return runs.flatMap<StripRun>(({ points, z }) =>
    ([-1, 1] as const).map((side) => ({
      side,
      points: points.map(([x, y]) => [x, y, z * side] as Vec3),
    })),
  );
}
