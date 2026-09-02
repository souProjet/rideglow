/**
 * Single source of truth for what RideGlow sells.
 *
 * Bikes are chosen by frame family, not by manufacturer model: an addressable
 * strip kit is fitted to geometry (where the swingarm sits, whether there is a
 * fairing to hide the controller behind), and families keep the funnel to four
 * choices instead of four hundred. It also keeps us clear of third-party trade
 * dress in a 3D showroom.
 */

export type Currency = "eur";

/**
 * Where we ship. ISO 3166-1 alpha-2, and the same list the terms of sale state:
 * Stripe refuses an address outside it, so a country added to one and not the
 * other is a contradiction a buyer meets at the payment step.
 */
export const SHIPPING_COUNTRIES = [
  "FR",
  "BE",
  "LU",
  "CH",
  "DE",
  "ES",
  "IT",
  "NL",
  "PT",
  "AT",
  "IE",
  "GB",
] as const;

export type BikeFamily = {
  id: BikeId;
  /** Drives the procedural silhouette in the showroom. */
  silhouette: "roadster" | "sport" | "trail" | "custom";
  /**
   * One flank's runs, nose to tail, in millimeters. A kit dresses both flanks,
   * and the lengths are the measured arc of each authored path in
   * `bike-models.ts` (sport, trail) or `bike-geometry.ts` (roadster, custom),
   * so the figure a buyer reads is the tape the run actually consumes.
   *
   * Every run sits on a part, not on a line drawn beside the bike: a fender
   * lip, a fairing edge, a crankcase cover, the subframe loop. That is where
   * tape goes on a real bike, and it is why the fender and case runs are arcs.
   */
  stripRuns: { label: string; mm: number }[];
};

/** A kit dresses both flanks, so every run in `stripRuns` ships twice. */
export const SIDES = 2;

export type BikeId = "roadster" | "sport" | "trail" | "custom";

export const BIKES: readonly BikeFamily[] = [
  {
    id: "roadster",
    silhouette: "roadster",
    stripRuns: [
      { label: "frontFender", mm: 582 },
      { label: "fork", mm: 554 },
      { label: "engineCase", mm: 643 },
      { label: "swingarm", mm: 492 },
      { label: "subframe", mm: 296 },
    ],
  },
  {
    id: "sport",
    silhouette: "sport",
    stripRuns: [
      { label: "frontFender", mm: 230 },
      { label: "fork", mm: 331 },
      // A full fairing hides the cases, so the sport spends that run on the
      // fairing's own lower lip instead.
      { label: "fairingEdge", mm: 484 },
      { label: "subframe", mm: 448 },
      { label: "rearHugger", mm: 208 },
    ],
  },
  {
    id: "trail",
    silhouette: "trail",
    stripRuns: [
      { label: "frontFender", mm: 339 },
      { label: "fork", mm: 612 },
      { label: "engineCase", mm: 628 },
      // A trail bike carries its silencer over the swingarm, so the rear run
      // goes on the frame rail where it is actually visible.
      { label: "frameRail", mm: 563 },
      { label: "subframe", mm: 484 },
    ],
  },
  {
    id: "custom",
    silhouette: "custom",
    stripRuns: [
      { label: "frontFender", mm: 634 },
      { label: "fork", mm: 518 },
      { label: "engineCase", mm: 643 },
      { label: "swingarm", mm: 813 },
      { label: "subframe", mm: 296 },
    ],
  },
] as const;

/** Addressable LEDs across both flanks once every run is dressed. */
export function bikeLedCount(bike: BikeFamily): number {
  const mm = bike.stripRuns.reduce((sum, run) => sum + run.mm, 0) * SIDES;
  return Math.round((mm / 1000) * LEDS_PER_METER);
}

export type KitId = "core" | "signature";

export type Kit = {
  id: KitId;
  /** Minor units, EUR. Never store prices as floats. */
  priceCents: number;
  strips: number;
  features: readonly string[];
  gps: boolean;
  recommended: boolean;
};

/**
 * Kit prices track the strip count, at the same rate the `extension` add-on
 * charges: 19 EUR per meter of tape with its connectors. A run averages 492 mm
 * across the four families, so a pair of runs (one per side) is worth about
 * 19 EUR. Core gained two strips over the three-run build and Signature four,
 * which is the +20 and +40 below, rounded to a 9.
 */
export const KITS: readonly Kit[] = [
  {
    id: "core",
    priceCents: 16900,
    // Fork, tank and swingarm, both sides. `stripRuns` is one side, so a kit
    // ships twice the runs it covers: Core takes the first three.
    strips: 6,
    features: ["app", "sound", "spectrum", "ip67"],
    gps: false,
    recommended: false,
  },
  {
    id: "signature",
    priceCents: 26900,
    // All five runs, both sides. This is the build the showroom renders.
    strips: 10,
    features: ["app", "sound", "spectrum", "ip67", "gps", "lean", "indicators"],
    gps: true,
    recommended: true,
  },
] as const;

export type AddonId = "remote" | "extension" | "harness";

export type Addon = { id: AddonId; priceCents: number };

export const ADDONS: readonly Addon[] = [
  { id: "remote", priceCents: 2900 },
  { id: "extension", priceCents: 1900 },
  { id: "harness", priceCents: 2400 },
] as const;

/** Strip density, fixed by the WS2812B-2020 tape the kit ships. */
export const LEDS_PER_METER = 60;

/** What the `extension` add-on adds to the run, in millimeters. */
export const EXTENSION_MM = 1000;

export type BuildSummary = {
  /** Addressable LEDs the visitor ends up with. */
  ledCount: number;
  /** Total strip length across every run, in millimeters. */
  totalMm: number;
  /** Runs the kit ships for this geometry, extension included. */
  runs: number;
};

/**
 * What the configured kit actually amounts to, in the two units a buyer can
 * check against their own bike. Derived here rather than in the component so
 * the showroom, the funnel and the order confirmation cannot disagree.
 */
export function summarizeBuild(selection: CartSelection): BuildSummary {
  const bike = getBike(selection.bikeId);
  if (!bike) throw new Error(`Unknown bike: ${selection.bikeId}`);
  const kit = getKit(selection.kitId);
  if (!kit) throw new Error(`Unknown kit: ${selection.kitId}`);

  // The kit decides how many of the bike's runs get dressed, and it dresses
  // them symmetrically: Core takes the first three on each flank, Signature all
  // five. Summarizing the bike's whole run plan regardless of kit is what put
  // "5 brins" next to "6 bandes" on the same screen.
  const covered = bike.stripRuns.slice(0, kit.strips / SIDES);
  const extended = selection.addonIds.includes("extension");
  const totalMm =
    covered.reduce((sum, run) => sum + run.mm, 0) * SIDES + (extended ? EXTENSION_MM : 0);

  return {
    ledCount: Math.round((totalMm / 1000) * LEDS_PER_METER),
    totalMm,
    runs: covered.length * SIDES + (extended ? 1 : 0),
  };
}

export const SHIPPING_CENTS = 690;
/** Free shipping above this subtotal, in minor units. */
export const FREE_SHIPPING_THRESHOLD_CENTS = 20000;

export function getBike(id: string): BikeFamily | undefined {
  return BIKES.find((b) => b.id === id);
}

export function getKit(id: string): Kit | undefined {
  return KITS.find((k) => k.id === id);
}

export function getAddon(id: string): Addon | undefined {
  return ADDONS.find((a) => a.id === id);
}

export type CartSelection = {
  bikeId: BikeId;
  kitId: KitId;
  addonIds: readonly AddonId[];
};

export type CartTotals = {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  freeShipping: boolean;
};

/**
 * Authoritative pricing. The client renders this for feedback, the checkout
 * route recomputes it from the same function so a tampered payload cannot
 * change what is charged.
 */
export function priceCart(selection: CartSelection): CartTotals {
  const kit = getKit(selection.kitId);
  if (!kit) throw new Error(`Unknown kit: ${selection.kitId}`);

  const addonsTotal = selection.addonIds.reduce((sum, id) => {
    const addon = getAddon(id);
    if (!addon) throw new Error(`Unknown addon: ${id}`);
    return sum + addon.priceCents;
  }, 0);

  const subtotalCents = kit.priceCents + addonsTotal;
  const freeShipping = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const shippingCents = freeShipping ? 0 : SHIPPING_CENTS;

  return {
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    freeShipping,
  };
}

export function isBikeId(value: unknown): value is BikeId {
  return typeof value === "string" && BIKES.some((b) => b.id === value);
}

export function isKitId(value: unknown): value is KitId {
  return typeof value === "string" && KITS.some((k) => k.id === value);
}

export function isAddonId(value: unknown): value is AddonId {
  return typeof value === "string" && ADDONS.some((a) => a.id === value);
}

/**
 * Inventory key. Stock is held per kit and per add-on, never per (kit, bike):
 * the shelf holds controller boxes, tape and looms, and the bike family only
 * decides where the tape is cut. The two id spaces are independent, so the
 * namespace prefix keeps a future kit and add-on sharing a name apart.
 */
export type Sku = `kit:${KitId}` | `addon:${AddonId}`;

export const SKUS: readonly Sku[] = [
  ...KITS.map((kit) => `kit:${kit.id}` as const),
  ...ADDONS.map((addon) => `addon:${addon.id}` as const),
];

/** Every unit an order takes off the shelf. Quantities are always one. */
export function skusForSelection(selection: { kitId: KitId; addonIds: readonly AddonId[] }): Sku[] {
  return [`kit:${selection.kitId}`, ...selection.addonIds.map((id) => `addon:${id}` as const)];
}

export function isSku(value: unknown): value is Sku {
  return typeof value === "string" && SKUS.some((sku) => sku === value);
}
