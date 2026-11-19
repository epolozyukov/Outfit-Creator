# Outfit Creator 

Pick an activity, weather and style and get a complete sportswear outfit from a
local mock catalogue. Replace single items, generate another look, see the total.

> Workshop concept – not an official Adidas product. Product names, prices and
> images are illustrative placeholders.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy

**Vercel** – import the GitHub repo; `vercel.json` pins the Next.js preset. No env vars.

**Databricks Apps** – the app runs as a Node server via `app.yaml`
(`npm run start:databricks`, which binds `0.0.0.0` on `DATABRICKS_APP_PORT`).

```bash
databricks apps create outfit-creator
databricks sync . /Workspace/Users/<you>/outfit-creator --exclude node_modules --exclude .next
databricks apps deploy outfit-creator --source-code-path /Workspace/Users/<you>/outfit-creator
# or: databricks bundle deploy -t dev && databricks bundle run outfit_creator -t dev
```

Test the Databricks start locally: `npm run build && DATABRICKS_APP_PORT=8000 npm run start:databricks`.

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
