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
  /** Strip runs the kit ships for this geometry, in millimeters. */
  stripRuns: { label: string; mm: number }[];
  /** Total addressable LEDs at 60 LED/m, rounded to the strip's cut marks. */
  ledCount: number;
};

export type BikeId = "roadster" | "sport" | "trail" | "custom";

export const BIKES: readonly BikeFamily[] = [
  {
    id: "roadster",
    silhouette: "roadster",
    stripRuns: [
      { label: "underTank", mm: 620 },
      { label: "swingarm", mm: 380 },
      { label: "fork", mm: 300 },
    ],
    ledCount: 78,
  },
  {
    id: "sport",
    silhouette: "sport",
    stripRuns: [
      { label: "underFairing", mm: 900 },
      { label: "swingarm", mm: 420 },
      { label: "tail", mm: 260 },
    ],
    ledCount: 94,
  },
  {
    id: "trail",
    silhouette: "trail",
    stripRuns: [
      { label: "underTank", mm: 700 },
      { label: "swingarm", mm: 460 },
      { label: "fork", mm: 420 },
    ],
    ledCount: 94,
  },
  {
    id: "custom",
    silhouette: "custom",
    stripRuns: [
      { label: "frameRail", mm: 820 },
      { label: "rearFender", mm: 340 },
      { label: "fork", mm: 320 },
    ],
    ledCount: 88,
  },
] as const;

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

export const KITS: readonly Kit[] = [
  {
    id: "core",
    priceCents: 14900,
    strips: 4,
    features: ["app", "sound", "spectrum", "ip67"],
    gps: false,
    recommended: false,
  },
  {
    id: "signature",
    priceCents: 22900,
    strips: 6,
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

  const baseMm = bike.stripRuns.reduce((sum, run) => sum + run.mm, 0);
  const extended = selection.addonIds.includes("extension");

  return {
    ledCount: bike.ledCount + (extended ? (EXTENSION_MM / 1000) * LEDS_PER_METER : 0),
    totalMm: baseMm + (extended ? EXTENSION_MM : 0),
    runs: bike.stripRuns.length + (extended ? 1 : 0),
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
