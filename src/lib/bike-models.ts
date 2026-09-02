import type { StripPath } from "@/lib/bike-geometry";
import type { BikeId } from "@/lib/catalog";

/**
 * Real GLB models, layered over the procedural placeholder.
 *
 * A family with no entry here keeps rendering the generated silhouette, so the
 * showroom works with zero, one or four models in place and the funnel never
 * waits on an asset.
 *
 * Two rules for anything added here.
 *
 * Licensing is part of the asset, not a footnote. `credit` is rendered under
 * the canvas whenever the model is on screen, which is what CC-BY requires;
 * a model with no usable commercial license does not go in this file.
 *
 * Avoid manufacturer-branded bikes. A Honda or a Harley model can carry a
 * perfectly clean CC-BY license and still be trade dress on a page that sells
 * an aftermarket product: that is a separate risk from the model's license,
 * and it is the reason the catalog sells frame families rather than models.
 */
export type BikeModel = {
  /** Served from /public/models. Keep it under ~3 MB: this is the hero. */
  url: string;
  /** Rendered under the canvas. Required for CC-BY. */
  credit: string;
  creditUrl: string;
  license: string;
  licenseUrl: string;
  /** Yaw applied before fitting, when the artist modeled it facing elsewhere. */
  yaw?: number;
  /**
   * Where the five runs go on this bike, measured off its own mesh, nose to
   * tail. Without it the rig falls back to the silhouette's derived runs,
   * which are solved for the placeholder and land in mid-air next to a
   * scanned bike.
   */
  strips?: readonly StripPath[];
};

export const BIKE_MODELS: Partial<Record<BikeId, BikeModel>> = {
  sport: {
    url: "/models/sport.glb",
    credit: "SPY-HYPERSPORT par Amvall",
    creditUrl: "https://sketchfab.com/Amvall.Vall",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    // Modeled nose down +Z, and the fit solves along X.
    yaw: Math.PI / 2,
    // Axles land at (0.72, 0.28) front and (-0.71, 0.30) rear once fitted.
    strips: [
      // Under the front fender, over the tire. `Object_17` is the only surface
      // up here and it is narrow, 4 to 6 cm of half-width: behind x = 0.60 the
      // probe starts returning the fairing nose at 0.111 instead, which is why
      // the run stops there rather than reaching the yoke.
      [
        [0.62, 0.585, 0.058],
        [0.68, 0.6, 0.044],
        [0.74, 0.6, 0.038],
        [0.8, 0.585, 0.043],
        [0.845, 0.552, 0.042],
      ],
      // Fork leg, axle end to yoke. It stops at y = 0.62: above the yoke the
      // only surface left leaning outboard is the screen surround, and a run
      // carried up there hung in front of the windscreen in three-quarter
      // view. The leg also rakes back 7 cm over its length, so the x moves.
      [
        [0.648, 0.3, 0.16],
        [0.65, 0.36, 0.15],
        [0.65, 0.44, 0.158],
        [0.64, 0.5, 0.164],
        [0.61, 0.56, 0.161],
        [0.59, 0.62, 0.152],
      ],
      // The fairing's lower lip, which is where tape goes on a faired bike: the
      // cases behind it are not visible from any angle the configurator offers,
      // so the sport spends this run on the edge instead of around a cover.
      // It starts at x = -0.12, not at the swingarm: behind that the SPY has no
      // lower bodywork at all, and a probe at 22 mm returns nothing at
      // (-0.20, 0.26). Measured at 45 mm it looked continuous, but the width it
      // reported came from a frame tube 4 cm away and the run rendered as a
      // wire strung under the bike.
      [
        [-0.12, 0.26, 0.166],
        [-0.04, 0.26, 0.17],
        [0.04, 0.27, 0.18],
        [0.12, 0.27, 0.186],
        [0.2, 0.28, 0.183],
        [0.28, 0.29, 0.184],
        [0.36, 0.31, 0.198],
      ],
      // Subframe loop, under the tail unit. It has to ride this high because
      // the SPY's tail is a cantilever: below y = 0.78 the probe returns
      // nothing from x = -0.62 to -0.30, a 30 cm hole where a run at seat
      // height crossed open air.
      [
        [-0.62, 0.9, 0.07],
        [-0.54, 0.87, 0.1],
        [-0.46, 0.82, 0.122],
        [-0.38, 0.78, 0.125],
        [-0.3, 0.74, 0.115],
        [-0.22, 0.7, 0.098],
      ],
      // Rear hugger, arcing over the tire. Same node as the tail: on this model
      // the tail unit and the hugger are one panel. It ends at x = -0.64
      // because the next station back, (-0.70, 0.63), is EMPTY.
      [
        [-0.46, 0.53, 0.072],
        [-0.52, 0.58, 0.085],
        [-0.58, 0.61, 0.086],
        [-0.64, 0.63, 0.077],
      ],
    ],
  },
  trail: {
    url: "/models/trail.glb",
    credit: "Honda CB500X par DevanirGrau",
    creditUrl: "https://sketchfab.com/devanirgrau",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    // Axles land at (0.78, 0.34) front and (-0.71, 0.32) rear once fitted.
    strips: [
      // Under the front fender, on `Object_10`. The shell tapers hard toward
      // the nose because the beak flares behind it: 12 cm of half-width at the
      // back of the arc, 5.5 cm over the tire. Above y = 0.72 the probe is
      // EMPTY, so this is the fender's own crown.
      [
        [0.64, 0.69, 0.124],
        [0.7, 0.71, 0.101],
        [0.76, 0.72, 0.089],
        [0.82, 0.72, 0.058],
        [0.87, 0.71, 0.055],
        [0.92, 0.69, 0.071],
        [0.96, 0.66, 0.076],
      ],
      // Fork leg, axle to lower yoke. Nearly constant width: the tube is a
      // tube, and the beak beside it is not what the run is taped to.
      [
        [0.68, 0.4, 0.14],
        [0.63, 0.55, 0.135],
        [0.58, 0.7, 0.138],
        [0.52, 0.85, 0.14],
        [0.46, 0.97, 0.142],
      ],
      // A closed ring around the crankcase cover, the run the sport cannot
      // carry. Every point on it lands on `Object_183` at 18 to 22 cm of
      // half-width, so the loop stays on one part the whole way round instead
      // of stepping between the case, the shroud and the header.
      [
        [0.16, 0.45, 0.215],
        [0.131, 0.521, 0.21],
        [0.06, 0.55, 0.179],
        [-0.011, 0.521, 0.214],
        [-0.04, 0.45, 0.214],
        [-0.011, 0.379, 0.183],
        [0.06, 0.35, 0.184],
        [0.131, 0.379, 0.215],
        [0.16, 0.45, 0.215],
      ],
      // Frame rail and side cover, not the swingarm. The muffler spans
      // x = -0.79 to -0.24 up to y = 0.573 and stands 30 cm off the
      // centerline, so on this side the whole swingarm is behind it: a run
      // there showed 4 cm of its 32 in profile. This line clears the muffler's
      // top edge and reads end to end.
      [
        [-0.46, 0.63, 0.165],
        [-0.39, 0.63, 0.164],
        [-0.32, 0.63, 0.152],
        [-0.25, 0.63, 0.162],
        [-0.18, 0.62, 0.18],
        [-0.11, 0.6, 0.166],
        [-0.04, 0.58, 0.197],
        [0.03, 0.56, 0.182],
        [0.1, 0.55, 0.171],
      ],
      // Subframe loop, under the grab rails. This bike has no rear hugger
      // modeled: the whole arc over the rear tire, from (-0.42, 0.56) round to
      // (-0.90, 0.65), probes EMPTY. The z steps out 7 cm between the first two
      // points because the rear rack is narrow and the seat panel below it is
      // not.
      [
        [-0.8, 0.86, 0.129],
        [-0.68, 0.86, 0.215],
        [-0.56, 0.85, 0.196],
        [-0.44, 0.83, 0.179],
        [-0.32, 0.81, 0.156],
      ],
    ],
  },
};

export function getBikeModel(id: BikeId): BikeModel | undefined {
  return BIKE_MODELS[id];
}

/** Credits for whatever models are actually on screen, deduplicated. */
export function getModelCredits(ids: readonly BikeId[]): BikeModel[] {
  const seen = new Set<string>();
  const out: BikeModel[] = [];
  for (const id of ids) {
    const model = BIKE_MODELS[id];
    if (!model || seen.has(model.url)) continue;
    seen.add(model.url);
    out.push(model);
  }
  return out;
}
