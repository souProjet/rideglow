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
 * and it is the reason the catalogue sells frame families rather than models.
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
};

export const BIKE_MODELS: Partial<Record<BikeId, BikeModel>> = {};

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
