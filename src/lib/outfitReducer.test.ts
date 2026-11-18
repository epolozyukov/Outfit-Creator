import { products } from "@/data/products";
import { seeded } from "@/test/rng";
import type { Product } from "@/types";
import { initialState, outfitReducer, type State } from "./outfitReducer";
import { calculateTotal, getAlternatives } from "./outfitGenerator";

const full = (s: State = initialState): State =>
  [
    { type: "SELECT_ACTIVITY", value: "running" },
    { type: "SELECT_WEATHER", value: "mild" },
    { type: "SELECT_STYLE", value: "performance" },
  ].reduce((acc, a) => outfitReducer(acc, a as never), s);

const generated = () =>
  outfitReducer(full(), { type: "GENERATE", catalogue: products, rng: seeded(1) });

describe("outfitReducer", () => {
  it("starts on the config view with no prefs", () => {
    expect(initialState).toMatchObject({ prefs: {}, outfit: null, view: "config" });
  });

  it("updates prefs on select", () => {
    const s = full();
    expect(s.prefs).toEqual({ activity: "running", weather: "mild", style: "performance" });
  });

  it("GENERATE is a no-op when prefs are incomplete", () => {
    const s = outfitReducer(initialState, { type: "GENERATE", catalogue: products });
    expect(s).toBe(initialState);
  });

  it("GENERATE sets outfit and view", () => {
    const s = generated();
    expect(s.view).toBe("outfit");
    expect(s.outfit?.items.length).toBeGreaterThanOrEqual(3);
    expect(s.error).toBeNull();
  });

  it("GENERATE with an incomplete catalogue sets a friendly error", () => {
    const s = outfitReducer(full(), { type: "GENERATE", catalogue: [] });
    expect(s.outfit).toBeNull();
    expect(s.error).toMatch(/couldn't|could not/i);
  });

  it("REGENERATE keeps prefs and tries to change the outfit", () => {
    const first = generated();
    const second = outfitReducer(first, { type: "REGENERATE", catalogue: products, rng: seeded(99) });
    expect(second.prefs).toEqual(first.prefs);
    expect(second.outfit).not.toBeNull();
    const ids = (s: State) => s.outfit?.items.map((i) => i.product.id).join();
    expect(ids(second)).not.toBe(ids(first));
    expect(second.notice).toBeNull();
  });

  it("REGENERATE sets a notice when nothing different exists", () => {
    const first = generated();
    const tiny: Product[] = first.outfit!.items.map((i) => i.product);
    const second = outfitReducer(first, { type: "REGENERATE", catalogue: tiny, rng: () => 0 });
    expect(second.notice).toMatch(/no other/i);
  });

  it("REGENERATE is a no-op without an outfit", () => {
    const s = outfitReducer(initialState, { type: "REGENERATE", catalogue: products });
    expect(s).toBe(initialState);
  });

  it("REGENERATE with a broken catalogue sets an error", () => {
    const s = outfitReducer(generated(), { type: "REGENERATE", catalogue: [] });
    expect(s.error).not.toBeNull();
  });

  it("OPEN_REPLACE / CLOSE_REPLACE toggle replacingSlot", () => {
    const opened = outfitReducer(generated(), { type: "OPEN_REPLACE", slot: "shoes" });
    expect(opened.replacingSlot).toBe("shoes");
    expect(outfitReducer(opened, { type: "CLOSE_REPLACE" }).replacingSlot).toBeNull();
  });

  it("REPLACE updates exactly one slot, closes the panel and updates the total", () => {
    const g = generated();
    const opened = outfitReducer(g, { type: "OPEN_REPLACE", slot: "shoes" });
    const alt = getAlternatives(g.outfit!, "shoes", products)[0];
    const s = outfitReducer(opened, { type: "REPLACE", product: alt });
    expect(s.replacingSlot).toBeNull();
    expect(s.outfit!.items.find((i) => i.slot === "shoes")?.product.id).toBe(alt.id);
    g.outfit!.items.filter((i) => i.slot !== "shoes").forEach((item, idx) => {
      expect(s.outfit!.items.filter((i) => i.slot !== "shoes")[idx]).toBe(item);
    });
    expect(calculateTotal(s.outfit!)).not.toBe(calculateTotal(g.outfit!));
  });

  it("REPLACE is a no-op when no slot is being replaced", () => {
    const g = generated();
    expect(outfitReducer(g, { type: "REPLACE", product: products[0] })).toBe(g);
  });

  it("BACK returns to config and keeps prefs", () => {
    const s = outfitReducer(generated(), { type: "BACK" });
    expect(s.view).toBe("config");
    expect(s.prefs.activity).toBe("running");
    expect(s.replacingSlot).toBeNull();
  });

  it("rethrows unexpected errors from GENERATE and REGENERATE", () => {
    const broken = null as unknown as Product[];
    expect(() => outfitReducer(full(), { type: "GENERATE", catalogue: broken })).toThrow();
    expect(() => outfitReducer(generated(), { type: "REGENERATE", catalogue: broken })).toThrow();
  });
});
