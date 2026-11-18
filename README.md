# Outfit Creator (workshop concept)

Pick an activity, weather and style and get a complete sportswear outfit from a
local mock catalogue. Replace single items, generate another look, see the total.

> Workshop concept – not an official Adidas product. Product names, prices and
> images are illustrative placeholders.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

## Quality gates

```bash
npm test               # unit + component tests (Vitest)
npm run test:coverage  # with coverage thresholds (src/lib 100%)
npm run test:e2e       # Playwright against the production build
npm run verify         # lint + typecheck + coverage + build
```

## Structure

- `src/lib/outfitGenerator.ts` – pure recommendation engine (swappable)
- `src/lib/outfitReducer.ts` – pure UI state machine
- `src/data/products.ts` – mock catalogue (integrity enforced by `products.test.ts`)
- `src/components/` – UI

See `docs/adidas-outfit-creator-mvp-spec.md` and `docs/DEVELOPMENT-TDD-GUIDE.md`.
