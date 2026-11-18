import type {
  Activity,
  Outfit,
  OutfitItem,
  Prefs,
  Product,
  Slot,
  Weather,
} from "@/types";

export type Rng = () => number;

export interface GenerateOptions {
  rng?: Rng;
  exclude?: Outfit;
}

export class IncompleteCatalogueError extends Error {
  constructor(
    public readonly slot: Slot,
    public readonly activity: Activity,
  ) {
    super(`No compatible "${slot}" product for activity "${activity}"`);
    this.name = "IncompleteCatalogueError";
  }
}

const REQUIRED_SLOTS: Record<Activity, Slot[]> = {
  running: ["shoes", "top", "bottom"],
  gym: ["shoes", "top", "bottom"],
  football: ["shoes", "top", "bottom", "socks"],
  casual: ["shoes", "top", "bottom"],
};

const NEUTRAL_COLORS = new Set(["black", "white", "grey"]);
const JACKET_WEATHER: Weather[] = ["cold", "rainy"];
const ACCESSORY_MIN_SCORE = 4;
const TOP_CANDIDATES = 3;
const MAX_ATTEMPTS = 10;

export function getRequiredSlots(activity: Activity): Slot[] {
  return [...REQUIRED_SLOTS[activity]];
}

export function scoreProduct(
  product: Product,
  prefs: Prefs,
  pickedSoFar: Product[],
): number {
  let score = 0;
  if (product.weatherTags.includes(prefs.weather)) score += 3;
  if (product.styleTags.includes(prefs.style)) score += 3;
  const coordinated =
    NEUTRAL_COLORS.has(product.color) ||
    pickedSoFar.some((p) => p.color === product.color);
  if (coordinated) score += 1;
  return score;
}

function compatible(
  catalogue: Product[],
  slot: Slot,
  activity: Activity,
  usedIds: Set<string>,
): Product[] {
  return catalogue.filter(
    (p) =>
      p.category === slot &&
      p.activities.includes(activity) &&
      !usedIds.has(p.id),
  );
}

function rank(
  candidates: Product[],
  prefs: Prefs,
  picked: Product[],
): { product: Product; score: number }[] {
  return candidates
    .map((product) => ({ product, score: scoreProduct(product, prefs, picked) }))
    .sort((a, b) => b.score - a.score || a.product.id.localeCompare(b.product.id));
}

/** Weighted pick (weight = score + 1) among the best few candidates. */
function weightedPick(
  ranked: { product: Product; score: number }[],
  rng: Rng,
): Product {
  const pool = ranked.slice(0, TOP_CANDIDATES);
  const total = pool.reduce((sum, c) => sum + c.score + 1, 0);
  let target = rng() * total;
  for (const c of pool) {
    target -= c.score + 1;
    if (target < 0) return c.product;
  }
  return pool[pool.length - 1].product;
}

function buildOnce(prefs: Prefs, catalogue: Product[], rng: Rng): Outfit {
  const items: OutfitItem[] = [];
  const picked = () => items.map((i) => i.product);
  const usedIds = () => new Set(picked().map((p) => p.id));

  const add = (slot: Slot, product: Product) => items.push({ slot, product });

  for (const slot of ["shoes", "top", "bottom", "socks"] as Slot[]) {
    if (!REQUIRED_SLOTS[prefs.activity].includes(slot)) continue;
    const candidates = compatible(catalogue, slot, prefs.activity, usedIds());
    if (candidates.length === 0) {
      throw new IncompleteCatalogueError(slot, prefs.activity);
    }
    add(slot, weightedPick(rank(candidates, prefs, picked()), rng));
  }

  if (JACKET_WEATHER.includes(prefs.weather)) {
    const jackets = compatible(catalogue, "jacket", prefs.activity, usedIds()).filter(
      (p) => p.weatherTags.includes(prefs.weather),
    );
    if (jackets.length > 0) {
      add("jacket", weightedPick(rank(jackets, prefs, picked()), rng));
    }
  }

  const accessories = rank(
    compatible(catalogue, "accessory", prefs.activity, usedIds()),
    prefs,
    picked(),
  ).filter((c) => c.score >= ACCESSORY_MIN_SCORE);
  if (accessories.length > 0) {
    add("accessory", weightedPick(accessories, rng));
  }

  return { prefs, items };
}

const signature = (o: Outfit) =>
  o.items.map((i) => `${i.slot}:${i.product.id}`).join("|");

export function generateOutfit(
  prefs: Prefs,
  catalogue: Product[],
  opts: GenerateOptions = {},
): Outfit {
  const rng = opts.rng ?? Math.random;
  let outfit = buildOnce(prefs, catalogue, rng);
  if (!opts.exclude) return outfit;
  const excluded = signature(opts.exclude);
  for (let attempt = 1; attempt < MAX_ATTEMPTS; attempt++) {
    if (signature(outfit) !== excluded) break;
    outfit = buildOnce(prefs, catalogue, rng);
  }
  return outfit;
}

export function getAlternatives(
  outfit: Outfit,
  slot: Slot,
  catalogue: Product[],
): Product[] {
  const usedIds = new Set(outfit.items.map((i) => i.product.id));
  const others = outfit.items.filter((i) => i.slot !== slot).map((i) => i.product);
  const candidates = compatible(catalogue, slot, outfit.prefs.activity, usedIds);
  return rank(candidates, outfit.prefs, others)
    .sort(
      (a, b) => b.score - a.score || a.product.priceMinor - b.product.priceMinor,
    )
    .map((c) => c.product);
}

export function replaceItem(
  outfit: Outfit,
  slot: Slot,
  product: Product,
): Outfit {
  if (product.category !== slot) {
    throw new Error(`Product "${product.id}" does not belong to slot "${slot}"`);
  }
  if (!outfit.items.some((i) => i.slot === slot)) {
    throw new Error(`Outfit has no "${slot}" item to replace`);
  }
  return {
    ...outfit,
    items: outfit.items.map((i) => (i.slot === slot ? { slot, product } : i)),
  };
}

export function calculateTotal(outfit: Outfit): number {
  return outfit.items.reduce((sum, i) => sum + i.product.priceMinor, 0);
}

const WEATHER_COPY: Record<Weather, string> = {
  hot: "lightweight, breathable pieces",
  mild: "breathable apparel",
  cold: "warm, covering layers",
  rainy: "weather-ready pieces",
};

export function buildExplanation(prefs: Prefs, outfit: Outfit): string {
  const layer = outfit.items.some((i) => i.slot === "jacket")
    ? " plus an outer layer for extra protection"
    : "";
  return (
    `Your ${prefs.style} ${prefs.activity} outfit is designed for ${prefs.weather} weather. ` +
    `It combines ${WEATHER_COPY[prefs.weather]} and footwear that suits your ${prefs.activity} plans${layer}.`
  );
}
