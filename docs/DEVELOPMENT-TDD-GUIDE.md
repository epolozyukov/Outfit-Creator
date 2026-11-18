# Adidas Outfit Creator – Development, TDD & Coverage Guide

Companion to `adidas-outfit-creator-mvp-spec.md` (v1.2). It explains **how to build the MVP test-first** and what coverage to enforce.

---

## 0. Spec decisions (adopted in spec v1.3)

The v1.2 spec left a few things open. These decisions are now written into the spec (v1.3) and the tests below depend on them. If you change one, change it in both files.

| # | Gap in spec | Assumed decision |
|---|---|---|
| D1 | `category: string` is untyped | Use a union: `"shoes" \| "top" \| "bottom" \| "socks" \| "jacket" \| "accessory"`. Football "shorts" = `bottom`; "football footwear" = `shoes` with `activities: ["football"]`. |
| D2 | Socks are required for Football but absent from suggested catalogue mix | Add ≥3 socks to the catalogue (≥2 football-compatible, so a replacement exists). |
| D3 | Which optional layers are added, and when | `jacket`: added if weather is `cold` or `rainy` and a compatible one exists; never for `hot`; optional for `mild` (not added). `accessory`: added at most one, only if one scores ≥ 4. |
| D4 | Hard filter vs scoring for weather/style | Activity = hard filter. Weather and style = score only (so an outfit can always be built). Max score 7. |
| D5 | "Colour coordination +1" is undefined | +1 if the product colour is in a neutral set (`black`, `white`, `grey`) **or** matches the colour of an already-picked item. Items are picked in a fixed order: shoes → top → bottom → socks → jacket → accessory. |
| D6 | "Controlled variation" | Weighted random pick among the top 3 scoring candidates per slot, using an **injectable RNG** (default `Math.random`). Tests pass a seeded RNG. |
| D7 | "Generate Another Look" must differ | Engine receives `exclude: Outfit`. It retries up to 10 times to differ; if the catalogue gives no alternative it returns the same outfit and the UI shows a friendly note. |
| D8 | Replacement candidates | Same slot, compatible with activity (hard), **excluding the current item and items already in the outfit**, sorted by score desc then price asc. Empty → friendly message. |
| D9 | Money | Store `price` as integer **grosz** (`priceMinor`) or integer PLN; format via `Intl.NumberFormat("pl-PL", {style:"currency", currency:"PLN"})`. No float sums. |
| D10 | "Create My Outfit" before all 3 selections | Button **disabled** until activity, weather and style are all chosen; helper text explains why. |
| D11 | Explanation text after a replacement | Explanation stays about the preferences (it does not mention specific products), so it needs no regeneration. |
| D12 | Acceptance #13 "design implemented consistently" | Verified by a manual checklist + design tokens defined once in `globals.css` (not automated). |

---

## 1. Tech & tooling

| Purpose | Tool |
|---|---|
| App | Next.js (App Router), TypeScript `strict: true`, Tailwind, lucide-react |
| Unit + component tests | **Vitest** + **@testing-library/react** + **@testing-library/user-event** + **@testing-library/jest-dom** + `jsdom` |
| Coverage | **@vitest/coverage-v8** |
| Accessibility checks | **vitest-axe** (component level) |
| E2E (happy path only) | **Playwright** against `npm run build && npm run start` |
| Optional property tests | **fast-check** (engine invariants) |
| Quality gate | ESLint + `tsc --noEmit` |

Setup (pre-workshop):

```bash
npx create-next-app@latest adidas-outfit-creator --ts --tailwind --eslint --app --src-dir
cd adidas-outfit-creator
npm i lucide-react
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event \
  @testing-library/jest-dom @vitest/coverage-v8 vitest-axe @playwright/test fast-check
npx playwright install chromium
```

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.*", "src/test/**", "src/types/**", "src/app/layout.tsx"],
      reporter: ["text", "html", "lcov"],
      thresholds: {
        statements: 85, lines: 85, functions: 85, branches: 80,
        "src/lib/**": { statements: 100, lines: 100, functions: 100, branches: 95 },
      },
    },
  },
});
```

`src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import * as matchers from "vitest-axe/matchers";
expect.extend(matchers);
```

`package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:e2e": "playwright test",
"typecheck": "tsc --noEmit",
"verify": "npm run lint && npm run typecheck && npm run test:coverage && npm run build"
```

> `npm run verify` is the single "am I done?" command. Run it before every push; Vercel runs only `npm run build`, so CI-style checks stay local (or add a GitHub Action running `verify`).

---

## 2. Test strategy (testing pyramid)

| Layer | Scope | Share of tests | Speed |
|---|---|---|---|
| **Unit** | `lib/outfitGenerator.ts`, pricing, formatting, catalogue integrity | ~60 % | ms |
| **Component** | Selectors, ProductCard, OutfitDisplay, ProductReplacement, page state | ~35 % | ms–100 ms |
| **E2E** | One happy path + one replacement path + mobile viewport | ~5 % (2–3 tests) | seconds |

Principles:

- **Business rules live in `lib/` and are pure.** No React, no `Math.random()` inside, no `Date`. This is where 100 % coverage is cheap and meaningful.
- **Test behaviour, not implementation.** Query by role/label/text (`getByRole("radio", {name: /running/i})`), never by CSS class.
- **No mocking of the catalogue in engine tests** for the integrity/matrix tests (use the real data). Use small hand-built fixtures for focused unit tests so they don't break when product data changes.
- **Coverage is a floor, not a goal.** The 64-combination matrix test and the invariants below matter more than the percentage.

---

## 3. Build order (TDD, outside-in on data, inside-out on logic)

Each step = **Red** (write failing test) → **Green** (minimum code) → **Refactor** (tests stay green) → commit.

Workshop budget is 60 min total, so time-box. **Steps 0–1 happen pre-workshop.** In-workshop, do steps 2–6 with TDD, and steps 7–9 as UI-first with component tests added where time allows.

### Step 0 – Scaffold (pre-workshop, ~10 min)
Project, tooling, `verify` script, empty `types/index.ts`. Commit a trivial passing test to prove the pipeline works.

### Step 1 – Types + catalogue + catalogue integrity tests (pre-workshop)
Write the integrity tests **first**; they define what a valid catalogue is and protect every later step.

`src/data/products.test.ts`
- every `id` is unique
- every product has non-empty `name`, `image`, `color`, `description`
- `priceMinor` is a positive integer
- every `image` file exists under `public/products/`
- every product has ≥1 activity, ≥1 weather tag, ≥1 style tag
- **coverage matrix:** for each activity, each required slot has **≥ 3** compatible products (1 chosen + ≥2 alternatives)
- football has ≥ 2 socks; every weather has ≥ 1 compatible jacket for ≥ 1 activity
- for each (activity × slot) there is ≥ 1 product per style (so style always has an effect)

> If this test fails, **fix the data, not the test**. It is the cheapest way to prevent "empty alternatives" bugs in front of the audience.

### Step 2 – Required slots per activity
`src/lib/outfitGenerator.test.ts` (first tests)

```ts
describe("getRequiredSlots", () => {
  it.each([
    ["running",  ["shoes", "top", "bottom"]],
    ["gym",      ["shoes", "top", "bottom"]],
    ["football", ["shoes", "top", "bottom", "socks"]],
    ["casual",   ["shoes", "top", "bottom"]],
  ])("%s requires %j", (activity, slots) => {
    expect(getRequiredSlots(activity as Activity)).toEqual(slots);
  });
});
```

### Step 3 – Scoring
Tests (using tiny fixtures):
- weather match = +3, style match = +3, both = +6, none = 0
- colour coordination = +1 only per D5
- **incompatible activity ⇒ not a candidate at all** (hard filter), even with max score
- score is a pure function: same input → same output

### Step 4 – `generateOutfit`
Tests, in this order (each drives a small piece of code):
1. returns one item per required slot for each activity
2. picks the highest-scoring product when RNG is forced to index 0
3. never returns a product incompatible with the activity
4. never returns the same product twice in one outfit
5. cold/rainy adds a jacket when available; hot never does (D3)
6. missing optional slot (no jacket in catalogue) ⇒ outfit still valid, no crash
7. missing **required** slot ⇒ throws a typed `IncompleteCatalogueError` (UI shows friendly error)
8. deterministic with a seeded RNG
9. `exclude` ⇒ result differs from the excluded outfit when alternatives exist (D7)
10. `exclude` ⇒ returns same outfit gracefully when no alternative exists

**Matrix test (the most valuable test in the project):**

```ts
const activities = ["running","gym","football","casual"] as const;
const weathers   = ["hot","mild","cold","rainy"] as const;
const styles     = ["performance","minimal","bold","streetwear"] as const;

describe.each(activities)("%s", (activity) =>
  describe.each(weathers)("%s", (weather) =>
    it.each(styles)("%s → complete, valid outfit", (style) => {
      const outfit = generateOutfit({ activity, weather, style }, products, { rng: seeded(1) });
      for (const slot of getRequiredSlots(activity)) expect(outfit.items.find(i => i.slot === slot)).toBeDefined();
      for (const i of outfit.items) expect(i.product.activities).toContain(activity);
      expect(new Set(outfit.items.map(i => i.product.id)).size).toBe(outfit.items.length);
    })
  )
);
```

= 64 cases, runs in milliseconds, covers acceptance criteria 5, 6 and FR-04 completely.

Optional fast-check property: *for any prefs and any seed, the outfit has no duplicates and total === sum of items.*

### Step 5 – Pricing & formatting
- `calculateTotal([])` = 0; sums integers exactly (no `0.1+0.2` problem)
- `formatPLN(34999)` → `"349,99 zł"` (assert on normalised whitespace; `Intl` uses a non-breaking space)

### Step 6 – Replacement logic
- `getAlternatives(outfit, slot, prefs)` returns same-slot, activity-compatible products
- excludes the current item and any item already in the outfit (D8)
- sorted by score desc, then price asc
- returns `[]` when none exist (UI turns this into the friendly message)
- `replaceItem(outfit, slot, product)`:
  - **only that slot changes**; other items are referentially equal (acceptance #9)
  - total is recalculated
  - original outfit is not mutated (assert with `Object.freeze` / deep-equal before/after)
  - throws on wrong-slot product

### Step 7 – State reducer (`useReducer`)
Extract it as a pure function `outfitReducer` so it's unit-testable without React.

State: `{ prefs: Partial<Prefs>, outfit: Outfit | null, replacingSlot: Slot | null, view: "config" | "outfit" }`

Tests: select activity/weather/style updates prefs · `GENERATE` is a no-op if prefs incomplete · `GENERATE` sets outfit and view · `REGENERATE` keeps prefs, passes `exclude` · `OPEN_REPLACE` / `CLOSE_REPLACE` · `REPLACE` updates one slot and closes panel · `BACK` keeps prefs (spec: "Back to Preferences").

### Step 8 – Components (component tests, RTL)

| Component | Key tests |
|---|---|
| `ActivitySelector` / `WeatherSelector` / `StyleSelector` | renders 4 options; semantic `radiogroup`; clicking selects; selected state exposed via `aria-checked`; arrow keys / Space work; each fires `onChange` with the right value |
| Config screen | **Create My Outfit disabled until all 3 chosen** (D10); enabled after; can change selection before generating |
| `ProductCard` | shows image with meaningful `alt`, name, category, colour, formatted price; **Change item** button has an accessible name including the product (`Change Ultraboost Light`) |
| `OutfitDisplay` | header "Your Outfit Is Ready!"; explanation shown; one card per item; summary shows activity/weather/style; total equals sum; **Generate Another Look**, **Back to Preferences** work; loading state shows then disappears (use `vi.useFakeTimers()`) |
| `ProductReplacement` | opens as `dialog` with focus moved inside; lists alternatives with image/name/price; selecting one calls back and closes; **Escape closes**; focus returns to the trigger; empty state shows friendly message (no blank panel) |
| a11y | `expect(await axe(container)).toHaveNoViolations()` for each screen |

### Step 9 – E2E (Playwright, 3 tests)
1. **Happy path:** pick Running / Mild / Performance → Create → see 3+ cards and total → total text equals sum of card prices.
2. **Replace:** change shoes → other cards unchanged (compare text before/after) → total updated.
3. **Mobile:** viewport 375×812 → same flow, no horizontal scroll (`scrollWidth <= innerWidth`).

Run against the production build (`webServer: { command: "npm run build && npm run start" }`) so E2E also proves acceptance #14.

---

## 4. Proposed module API (keep UI ignorant of the algorithm)

```ts
// src/types/index.ts
export type Slot = "shoes" | "top" | "bottom" | "socks" | "jacket" | "accessory";
export interface Prefs { activity: Activity; weather: Weather; style: Style }
export interface OutfitItem { slot: Slot; product: Product }
export interface Outfit { prefs: Prefs; items: OutfitItem[] }

// src/lib/outfitGenerator.ts  (pure – swappable for an AI service later)
getRequiredSlots(activity): Slot[]
scoreProduct(product, prefs, pickedSoFar): number
generateOutfit(prefs, catalogue, opts?: { rng?: () => number; exclude?: Outfit }): Outfit
getAlternatives(outfit, slot, catalogue): Product[]
replaceItem(outfit, slot, product): Outfit
calculateTotal(outfit): number
buildExplanation(prefs, outfit): string
// src/lib/format.ts
formatPLN(minor: number): string
```

A future AI recommender only needs to implement `generateOutfit`'s signature.

---

## 5. Coverage policy

| Area | Statements | Branches | Rationale |
|---|---|---|---|
| `src/lib/**` | **100 %** | **≥ 95 %** | Pure business logic; cheap to cover fully |
| `src/components/**` | ≥ 85 % | ≥ 80 % | Behavioural tests; don't chase decorative markup |
| Overall | ≥ 85 % | ≥ 80 % | Enforced by `thresholds` – `test:coverage` fails below this |
| Excluded | – | – | `layout.tsx`, `types/`, test files/setup |

Rules:
1. Thresholds are enforced in `vitest.config.ts`; `verify` fails if they drop.
2. A line covered only incidentally by an assertion-free test doesn't count. Reviewers check that every test has a meaningful `expect`.
3. **Mutation spot-check (optional, if time):** temporarily change `+3` to `+2` in the scorer, or remove the activity filter. At least one test must go red. If none does, add the missing test.
4. `public/products` images are covered by the catalogue integrity test, not coverage tooling.

---

## 6. Acceptance criteria → test traceability

| # | Acceptance criterion | Verified by |
|---|---|---|
| 1 | App starts locally | E2E boots production server; manual `npm run dev` |
| 2–4 | All activities / weather / styles selectable | Selector component tests (`it.each`) |
| 5 | Complete outfit generated | Engine matrix test (64 cases) |
| 6 | Required categories vary by activity | `getRequiredSlots` tests + matrix |
| 7 | Image, name, price displayed | `ProductCard` test |
| 8 | Items replaceable | `ProductReplacement` + E2E replace |
| 9 | Replacement leaves others unchanged | `replaceItem` unit test + E2E |
| 10 | Generate another outfit | `exclude` tests + reducer + component |
| 11 | Total recalculated correctly | `calculateTotal`, E2E (total == sum of cards) |
| 12 | Responsive | E2E mobile viewport; manual check at 375/768/1280 |
| 13 | Design consistent | Manual checklist (D12) |
| 14 | `npm run build` succeeds | `verify` script, E2E build step |
| 15 | Vercel URL works | Manual smoke test of deployed URL: run E2E with `BASE_URL=<vercel-url>` |
| 16 | 64 combinations all valid | Engine matrix test |
| 17 | Catalogue integrity | `products.test.ts` (Step 1) |
| 18 | `verify` passes, coverage thresholds met | `npm run verify`, thresholds in `vitest.config.ts` |
| 19 | Keyboard + a11y | Component tests with `user-event` keyboard and `vitest-axe` |
| 20 | Button disabled until 3 selections | Config screen component test + reducer `GENERATE` no-op test |

---

## 7. Workflow rules for vibe-coding with TDD

1. **Prompt pattern for the AI assistant:** *"Write failing tests for step N from DEVELOPMENT-TDD-GUIDE.md. Do not write implementation. Run them and show they fail."* Then: *"Now write the minimal implementation to pass. Do not change the tests."*
2. Never let the assistant edit a test to make it pass without you reading why.
3. Commit after every green: `test: …` (red, optional), `feat: …` (green), `refactor: …`.
4. Keep `npm run test:watch` open in a second terminal.
5. If you fall behind schedule, drop in this order: E2E → a11y tests → component tests for selectors → **never** engine/catalogue tests.

### Definition of Done (per step and for the MVP)
- [ ] `npm run verify` passes (lint, types, tests, coverage thresholds, build)
- [ ] No `any`, no `// @ts-ignore`, no skipped tests
- [ ] Acceptance traceability table is all ✅
- [ ] Manual visual check at mobile / tablet / desktop
- [ ] Deployed Vercel URL smoke-tested
