import { products } from "@/data/products";
import { seeded } from "@/test/rng";
import type { Activity, Outfit, Prefs, Product, Slot, Style, Weather } from "@/types";
import {
  IncompleteCatalogueError,
  buildExplanation,
  calculateTotal,
  generateOutfit,
  getAlternatives,
  getRequiredSlots,
  replaceItem,
  scoreProduct,
} from "./outfitGenerator";

const mk = (over: Partial<Product> & { id: string }): Product => ({
  name: over.id,
  category: "top",
  image: "/products/x.svg",
  priceMinor: 1000,
  currency: "PLN",
  color: "red",
  activities: ["running"],
  weatherTags: ["mild"],
  styleTags: ["performance"],
  description: "d",
  ...over,
});

const prefs: Prefs = { activity: "running", weather: "mild", style: "performance" };

describe("getRequiredSlots", () => {
  it.each([
    ["running", ["shoes", "top", "bottom"]],
    ["gym", ["shoes", "top", "bottom"]],
    ["football", ["shoes", "top", "bottom", "socks"]],
    ["casual", ["shoes", "top", "bottom"]],
  ])("%s requires %j", (activity, slots) => {
    expect(getRequiredSlots(activity as Activity)).toEqual(slots);
  });
});

describe("scoreProduct", () => {
  const base = mk({ id: "a", color: "red", weatherTags: ["mild"], styleTags: ["performance"] });

  it("gives +3 for weather and +3 for style (no colour bonus for non-neutral)", () => {
    expect(scoreProduct(base, prefs, [])).toBe(6);
  });
  it("gives only weather points", () => {
    expect(scoreProduct({ ...base, styleTags: ["bold"] }, prefs, [])).toBe(3);
  });
  it("gives only style points", () => {
    expect(scoreProduct({ ...base, weatherTags: ["hot"] }, prefs, [])).toBe(3);
  });
  it("gives zero when nothing matches", () => {
    expect(scoreProduct({ ...base, weatherTags: ["hot"], styleTags: ["bold"] }, prefs, [])).toBe(0);
  });
  it("gives +1 colour bonus for neutral colours", () => {
    expect(scoreProduct({ ...base, color: "black" }, prefs, [])).toBe(7);
    expect(scoreProduct({ ...base, color: "white" }, prefs, [])).toBe(7);
    expect(scoreProduct({ ...base, color: "grey" }, prefs, [])).toBe(7);
  });
  it("gives +1 colour bonus when matching an already-picked colour", () => {
    const picked = [mk({ id: "p", color: "red" })];
    expect(scoreProduct(base, prefs, picked)).toBe(7);
  });
  it("is pure and deterministic", () => {
    expect(scoreProduct(base, prefs, [])).toBe(scoreProduct(base, prefs, []));
  });
});

describe("generateOutfit (fixtures)", () => {
  const cat: Product[] = [
    mk({ id: "shoe-best", category: "shoes", color: "black", styleTags: ["performance"] }),
    mk({ id: "shoe-ok", category: "shoes", color: "red", styleTags: ["bold"] }),
    mk({ id: "shoe-other-activity", category: "shoes", activities: ["gym"], color: "black" }),
    mk({ id: "top-1", category: "top", color: "black" }),
    mk({ id: "top-2", category: "top", color: "red", styleTags: ["bold"] }),
    mk({ id: "bottom-1", category: "bottom", color: "black" }),
    mk({ id: "bottom-2", category: "bottom", color: "red", styleTags: ["bold"] }),
  ];

  it("picks the highest-scoring product when rng returns 0", () => {
    const o = generateOutfit(prefs, cat, { rng: () => 0 });
    expect(o.items.find((i) => i.slot === "shoes")?.product.id).toBe("shoe-best");
  });

  it("returns one item per required slot, in slot order", () => {
    const o = generateOutfit(prefs, cat, { rng: () => 0 });
    expect(o.items.map((i) => i.slot)).toEqual(["shoes", "top", "bottom"]);
  });

  it("never picks an incompatible activity product", () => {
    for (let s = 0; s < 30; s++) {
      const o = generateOutfit(prefs, cat, { rng: seeded(s) });
      expect(o.items.map((i) => i.product.id)).not.toContain("shoe-other-activity");
    }
  });

  it("stores prefs on the outfit", () => {
    expect(generateOutfit(prefs, cat, { rng: () => 0 }).prefs).toEqual(prefs);
  });

  it("uses Math.random when no rng is injected", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0);
    const o = generateOutfit(prefs, cat);
    expect(o.items).toHaveLength(3);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("is deterministic with a seeded rng", () => {
    const a = generateOutfit(prefs, cat, { rng: seeded(7) });
    const b = generateOutfit(prefs, cat, { rng: seeded(7) });
    expect(a).toEqual(b);
  });

  it("weights by score but never fails with an rng of ~1", () => {
    const o = generateOutfit(prefs, cat, { rng: () => 0.999999 });
    expect(o.items).toHaveLength(3);
  });

  it("falls back to the last candidate when rng returns exactly 1", () => {
    const o = generateOutfit(prefs, cat, { rng: () => 1 });
    expect(o.items).toHaveLength(3);
  });

  it("throws IncompleteCatalogueError when a required slot is empty", () => {
    const noShoes = cat.filter((p) => p.category !== "shoes");
    expect(() => generateOutfit(prefs, noShoes, { rng: () => 0 })).toThrow(
      IncompleteCatalogueError,
    );
    try {
      generateOutfit(prefs, noShoes, { rng: () => 0 });
    } catch (e) {
      expect((e as IncompleteCatalogueError).slot).toBe("shoes");
      expect((e as IncompleteCatalogueError).activity).toBe("running");
    }
  });

  it("adds a jacket for rainy/cold when a compatible one exists", () => {
    const jacket = mk({ id: "jk", category: "jacket", weatherTags: ["rainy"] });
    const o = generateOutfit({ ...prefs, weather: "rainy" }, [...cat, jacket], { rng: () => 0 });
    expect(o.items.some((i) => i.slot === "jacket")).toBe(true);
  });

  it("does not add a jacket for mild or hot weather", () => {
    const jacket = mk({ id: "jk", category: "jacket", weatherTags: ["mild", "hot", "rainy"] });
    for (const weather of ["mild", "hot"] as Weather[]) {
      const o = generateOutfit({ ...prefs, weather }, [...cat, jacket], { rng: () => 0 });
      expect(o.items.some((i) => i.slot === "jacket")).toBe(false);
    }
  });

  it("is still valid when no compatible jacket exists in cold weather", () => {
    const o = generateOutfit({ ...prefs, weather: "cold" }, cat, { rng: () => 0 });
    expect(o.items.some((i) => i.slot === "jacket")).toBe(false);
  });

  it("skips jackets that do not match the weather", () => {
    const jacket = mk({ id: "jk", category: "jacket", weatherTags: ["cold"] });
    const o = generateOutfit({ ...prefs, weather: "rainy" }, [...cat, jacket], { rng: () => 0 });
    expect(o.items.some((i) => i.slot === "jacket")).toBe(false);
  });

  it("adds an accessory only when it scores at least 4", () => {
    const good = mk({ id: "acc-good", category: "accessory", color: "red" });
    const weak = mk({ id: "acc-weak", category: "accessory", weatherTags: ["hot"], styleTags: ["bold"] });
    const withGood = generateOutfit(prefs, [...cat, good], { rng: () => 0 });
    expect(withGood.items.some((i) => i.slot === "accessory")).toBe(true);
    const withWeak = generateOutfit(prefs, [...cat, weak], { rng: () => 0 });
    expect(withWeak.items.some((i) => i.slot === "accessory")).toBe(false);
  });

  it("adds at most one accessory", () => {
    const a1 = mk({ id: "acc1", category: "accessory", color: "red" });
    const a2 = mk({ id: "acc2", category: "accessory", color: "red" });
    const o = generateOutfit(prefs, [...cat, a1, a2], { rng: () => 0 });
    expect(o.items.filter((i) => i.slot === "accessory")).toHaveLength(1);
  });

  describe("exclude", () => {
    const ids = (o: Outfit) => o.items.map((i) => i.product.id).join(",");

    it("returns a different outfit when alternatives exist", () => {
      const first = generateOutfit(prefs, cat, { rng: () => 0 });
      const rng = seeded(3);
      const second = generateOutfit(prefs, cat, { rng, exclude: first });
      expect(ids(second)).not.toBe(ids(first));
    });

    it("returns the same outfit gracefully when no alternative exists", () => {
      const tiny = [
        mk({ id: "s", category: "shoes" }),
        mk({ id: "t", category: "top" }),
        mk({ id: "b", category: "bottom" }),
      ];
      const first = generateOutfit(prefs, tiny, { rng: () => 0 });
      const again = generateOutfit(prefs, tiny, { rng: () => 0, exclude: first });
      expect(ids(again)).toBe(ids(first));
    });
  });
});

describe("generateOutfit (real catalogue matrix)", () => {
  const activities: Activity[] = ["running", "gym", "football", "casual"];
  const weathers: Weather[] = ["hot", "mild", "cold", "rainy"];
  const styles: Style[] = ["performance", "minimal", "bold", "streetwear"];

  describe.each(activities)("%s", (activity) => {
    describe.each(weathers)("%s", (weather) => {
      it.each(styles)("%s → complete, valid outfit", (style) => {
        const outfit = generateOutfit({ activity, weather, style }, products, { rng: seeded(1) });
        for (const slot of getRequiredSlots(activity)) {
          expect(outfit.items.find((i) => i.slot === slot)).toBeDefined();
        }
        for (const i of outfit.items) {
          expect(i.product.activities).toContain(activity);
          expect(i.product.category).toBe(i.slot);
        }
        const ids = outfit.items.map((i) => i.product.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(outfit.items.some((i) => i.slot === "jacket")).toBe(
          weather === "cold" || weather === "rainy",
        );
      });
    });
  });
});

describe("calculateTotal", () => {
  it("is 0 for an empty outfit", () => {
    expect(calculateTotal({ prefs, items: [] })).toBe(0);
  });
  it("sums integer prices exactly", () => {
    const items = [
      { slot: "top" as Slot, product: mk({ id: "a", priceMinor: 10 }) },
      { slot: "bottom" as Slot, product: mk({ id: "b", priceMinor: 20 }) },
    ];
    expect(calculateTotal({ prefs, items })).toBe(30);
  });
});

describe("getAlternatives / replaceItem", () => {
  const cat: Product[] = [
    mk({ id: "top-a", category: "top", color: "red" }),
    mk({ id: "top-b", category: "top", color: "red", priceMinor: 500 }),
    mk({ id: "top-c", category: "top", color: "red", priceMinor: 300 }),
    mk({ id: "top-low", category: "top", weatherTags: ["hot"], styleTags: ["bold"], priceMinor: 100 }),
    mk({ id: "top-gym", category: "top", activities: ["gym"] }),
    mk({ id: "shoe-a", category: "shoes" }),
    mk({ id: "bottom-a", category: "bottom" }),
  ];
  const outfit: Outfit = {
    prefs,
    items: [
      { slot: "shoes", product: cat[5] },
      { slot: "top", product: cat[0] },
      { slot: "bottom", product: cat[6] },
    ],
  };

  it("returns same-slot, activity-compatible products excluding current", () => {
    const ids = getAlternatives(outfit, "top", cat).map((p) => p.id);
    expect(ids).not.toContain("top-a");
    expect(ids).not.toContain("top-gym");
    expect(ids).not.toContain("shoe-a");
    expect(ids.sort()).toEqual(["top-b", "top-c", "top-low"]);
  });

  it("sorts by score desc then price asc", () => {
    const ids = getAlternatives(outfit, "top", cat).map((p) => p.id);
    expect(ids).toEqual(["top-c", "top-b", "top-low"]);
  });

  it("excludes products already used elsewhere in the outfit", () => {
    const o: Outfit = { ...outfit, items: [...outfit.items, { slot: "accessory", product: cat[1] }] };
    expect(getAlternatives(o, "top", cat).map((p) => p.id)).not.toContain("top-b");
  });

  it("returns [] when none exist", () => {
    const only = [cat[0], cat[5], cat[6]];
    expect(getAlternatives(outfit, "top", only)).toEqual([]);
  });

  it("replaces only the chosen slot and keeps others referentially equal", () => {
    const frozen = Object.freeze({ ...outfit, items: Object.freeze([...outfit.items]) }) as Outfit;
    const next = replaceItem(frozen, "top", cat[1]);
    expect(next.items.find((i) => i.slot === "top")?.product.id).toBe("top-b");
    expect(next.items[0]).toBe(outfit.items[0]);
    expect(next.items[2]).toBe(outfit.items[2]);
    expect(frozen.items.find((i) => i.slot === "top")?.product.id).toBe("top-a");
    expect(calculateTotal(next)).toBe(
      calculateTotal(outfit) - cat[0].priceMinor + cat[1].priceMinor,
    );
  });

  it("throws when the product is in the wrong slot", () => {
    expect(() => replaceItem(outfit, "top", cat[5])).toThrow();
  });

  it("throws when the outfit has no item in that slot", () => {
    expect(() => replaceItem(outfit, "jacket", mk({ id: "j", category: "jacket" }))).toThrow();
  });
});

describe("buildExplanation", () => {
  it("mentions style, activity and weather", () => {
    const o: Outfit = { prefs, items: [] };
    const text = buildExplanation(prefs, o);
    expect(text).toContain("performance");
    expect(text).toContain("running");
    expect(text).toContain("mild");
  });
  it.each(["hot", "mild", "cold", "rainy"] as Weather[])("covers %s", (weather) => {
    expect(buildExplanation({ ...prefs, weather }, { prefs, items: [] }).length).toBeGreaterThan(20);
  });
  it("mentions an outer layer only when a jacket is present", () => {
    const withJacket: Outfit = {
      prefs,
      items: [{ slot: "jacket", product: mk({ id: "j", category: "jacket" }) }],
    };
    expect(buildExplanation(prefs, withJacket)).toMatch(/outer layer/);
    expect(buildExplanation(prefs, { prefs, items: [] })).not.toMatch(/outer layer/);
  });
});
