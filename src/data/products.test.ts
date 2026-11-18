import fs from "node:fs";
import path from "node:path";
import { products } from "./products";
import type { Activity, Slot, Style, Weather } from "@/types";

const ACTIVITIES: Activity[] = ["running", "gym", "football", "casual"];
const STYLES: Style[] = ["performance", "minimal", "bold", "streetwear"];
const WEATHERS: Weather[] = ["hot", "mild", "cold", "rainy"];
const REQUIRED: Record<Activity, Slot[]> = {
  running: ["shoes", "top", "bottom"],
  gym: ["shoes", "top", "bottom"],
  football: ["shoes", "top", "bottom", "socks"],
  casual: ["shoes", "top", "bottom"],
};

describe("catalogue integrity", () => {
  it("has 20-30 products", () => {
    expect(products.length).toBeGreaterThanOrEqual(20);
    expect(products.length).toBeLessThanOrEqual(30);
  });

  it("has unique ids", () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
  });

  it.each(products.map((p) => [p.id, p] as const))(
    "%s has complete, valid fields",
    (_id, p) => {
      expect(p.name.trim()).not.toBe("");
      expect(p.color.trim()).not.toBe("");
      expect(p.description.trim()).not.toBe("");
      expect(p.currency).toBe("PLN");
      expect(Number.isInteger(p.priceMinor)).toBe(true);
      expect(p.priceMinor).toBeGreaterThan(0);
      expect(p.activities.length).toBeGreaterThan(0);
      expect(p.weatherTags.length).toBeGreaterThan(0);
      expect(p.styleTags.length).toBeGreaterThan(0);
    },
  );

  it("has an image file for every product", () => {
    for (const p of products) {
      const file = path.join(process.cwd(), "public", p.image);
      expect(fs.existsSync(file), `${p.id}: missing ${p.image}`).toBe(true);
    }
  });

  describe.each(ACTIVITIES)("%s", (activity) => {
    it.each(REQUIRED[activity])(
      "has >= 3 compatible products for slot %s",
      (slot) => {
        const n = products.filter(
          (p) => p.category === slot && p.activities.includes(activity),
        ).length;
        expect(n).toBeGreaterThanOrEqual(3);
      },
    );

    it.each(REQUIRED[activity])(
      "has every style represented in slot %s",
      (slot) => {
        for (const style of STYLES) {
          const n = products.filter(
            (p) =>
              p.category === slot &&
              p.activities.includes(activity) &&
              p.styleTags.includes(style),
          ).length;
          expect(n, `${activity}/${slot}/${style}`).toBeGreaterThanOrEqual(1);
        }
      },
    );
  });

  it("has >= 2 football-compatible socks", () => {
    const n = products.filter(
      (p) => p.category === "socks" && p.activities.includes("football"),
    ).length;
    expect(n).toBeGreaterThanOrEqual(2);
  });

  it.each(["cold", "rainy"] as Weather[])(
    "has a compatible jacket for %s",
    (weather) => {
      expect(
        products.some(
          (p) => p.category === "jacket" && p.weatherTags.includes(weather),
        ),
      ).toBe(true);
    },
  );

  it("covers every weather with at least one non-jacket product", () => {
    for (const w of WEATHERS) {
      expect(
        products.some((p) => p.category !== "jacket" && p.weatherTags.includes(w)),
      ).toBe(true);
    }
  });
});
