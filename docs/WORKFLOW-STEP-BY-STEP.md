# From Spec to Vercel with Claude Code – Step-by-Step Walkthrough

How the Outfit Creator MVP went from a written specification to a tested app on GitHub and Vercel, using Claude Code as a pair-programmer. Every step lists the prompt, what happened, how to verify it, and what went wrong (real problems, not a polished story).

**Result:** Next.js app, 247 unit/component tests + 3 E2E tests, 100% coverage on business logic, code on GitHub, Vercel build green.

**Honest caveats:** TDD was followed loosely (see Step 5). The public Vercel URL was not confirmed working at the time of writing (see Step 11).

---

## Overview

| # | Step | Output |
|---|---|---|
| 1 | Write the spec | `adidas-outfit-creator-mvp-spec.md` |
| 2 | Ask Claude to audit it | List of gaps and risks |
| 3 | Ask for a TDD + coverage guide | `DEVELOPMENT-TDD-GUIDE.md` |
| 4 | Fold the audit into the spec (v1.3) | Decisions D1–D12 in the spec |
| 5 | Build with TDD | App + tests |
| 6 | Verify: lint, types, coverage, build, E2E | `npm run verify` green |
| 7 | Run locally and look at it | App on `localhost:3000` |
| 8 | Ask whether TDD was really followed | Honest review |
| 9 | Prepare Git: `.env`, `.gitignore`, identity | Clean, safe commit |
| 10 | Push to GitHub | Code on `main` |
| 11 | Publish on Vercel and debug | Build green, URL issues fixed |

---

## Step 1 – Write the specification

Start with a written spec: vision, user journey, functional requirements, UI and brand rules, data model, recommendation logic, tech stack, acceptance criteria, **out-of-scope list**, and deployment plan. Ours was `adidas-outfit-creator-mvp-spec.md` (v1.2) for a 60-minute workshop.

Tips that paid off later:
- Explicit **out-of-scope** list (no scraping, no backend, no AI) kept the build small.
- Numbered **acceptance criteria** became the test checklist.
- A pure, isolated **recommendation engine** requirement made 100% coverage cheap.

## Step 2 – Ask Claude to audit the spec

**Prompt used (verbatim):**
> analyze @adidas-outfit-creator-mvp-spec.md provide your suggestions also think about building md file of how to develop it and TDD in it and test coverage

Claude read the file and returned ~14 findings. The ones that mattered:

| Finding | Why it mattered |
|---|---|
| Football needs socks, but the suggested catalogue had none | The Football outfit would fail |
| ~30 products might not cover 4×4×4 = 64 combinations | "Change item" could show no alternatives |
| `category` was an untyped string; "bottoms/shorts/football footwear" mixed | Needed a fixed set of slots |
| Rules left open: when to add jackets, what "colour coordination +1" means, "controlled variation", what alternatives exclude | Cannot write tests for undefined rules |
| Money as floats | Rounding errors in totals |
| No rule for "Create My Outfit" before all selections | Needed a decision |
| 60 min is tight for TDD | Prepare scaffold and catalogue beforehand |
| Logo/imagery approval unresolved | Legal risk; use placeholders + disclaimer |

**Takeaway:** ask for an audit *before* coding. Every vague sentence in a spec becomes a bug or an argument later.

## Step 3 – Generate the TDD and coverage guide

The same prompt asked for a development guide. Claude wrote `DEVELOPMENT-TDD-GUIDE.md` containing:
- Decisions D1–D12 (answers to the audit gaps).
- Tooling: Vitest, React Testing Library, vitest-axe, Playwright, fast-check; config and scripts.
- Testing pyramid (unit ~60%, component ~35%, E2E ~5%).
- Ten build steps, each Red → Green → Refactor, starting with catalogue integrity tests.
- A 64-case **matrix test** (every activity × weather × style yields a valid outfit).
- Coverage policy: `src/lib` 100% statements / ≥95% branches, overall ≥85% / ≥80%, enforced by thresholds.
- Traceability: each acceptance criterion → the test that proves it.
- A prompt pattern for AI-assisted TDD and a "what to drop if late" order.

## Step 4 – Fold the decisions back into the spec

**Prompt:** `adjust based on your suggestions`

Claude edited the spec to **v1.3**: typed slots, jacket rule, accessory rule, `priceMinor` (integer grosz), injectable RNG, alternatives rules, disabled button, accessible dialog, disclaimer footer, socks in the catalogue, catalogue integrity rules, acceptance criteria 16–20, and pre-workshop preparation. It also aligned the guide.

**Takeaway:** keep spec and tests in sync. The spec is the source of truth; the guide references it.

## Step 5 – Build with TDD

**Prompt:**
> start the devlopment @adidas-outfit-creator-mvp-spec.md @DEVELOPMENT-TDD-GUIDE.md

What Claude did, in order:

1. **Scaffold:** `create-next-app` (TypeScript, Tailwind, ESLint, App Router, `src/`), installed `lucide-react` and the test stack, added `vitest.config.mts`, `playwright.config.ts`, and scripts (`test`, `test:coverage`, `test:e2e`, `typecheck`, `verify`). First commit-worthy proof: one trivial passing test.
2. **Types + catalogue tests first:** wrote `products.test.ts` against an empty catalogue → **31 tests failed (red)**.
3. **Catalogue:** generated 30 mock products with invented names and placeholder SVGs (no real Adidas assets). Tests went green except two – the integrity test **caught that Casual had too few bottoms**. Fix: tag one more product (fix data, not the test).
4. **Engine tests, then engine:** `getRequiredSlots`, `scoreProduct`, `generateOutfit`, `getAlternatives`, `replaceItem`, `calculateTotal`, `buildExplanation`, plus `formatPLN` and a pure `outfitReducer`. Tests failed (modules missing), then passed.
5. **Coverage gate bit back:** the 100% threshold on `src/lib` failed on three untested edge cases (RNG returning exactly 1; two rethrow paths). Claude added tests for them.
6. **Component tests, then components:** selectors (radiogroup, arrow keys), `ProductCard`, `ProductReplacement` (dialog, focus trap, Escape, focus return), `OutfitDisplay`, `OutfitApp` (integration). Red first, then green.
7. **Accessibility test found a real bug:** product names were `h3` directly under the page `h1` (axe "heading-order"). Fixed by using `h2`.
8. **E2E (Playwright):** happy path (total equals sum of card prices), replace one item (others unchanged), mobile viewport (no horizontal scroll).
9. **Styling:** monochrome Adidas-inspired design tokens in `globals.css`, Barlow Condensed + Inter fonts, footer disclaimer.

Gotcha: this Next.js version (16) ships with an `AGENTS.md` telling agents to read `node_modules/next/dist/docs/` first. Claude did, and confirmed a static page rendering one client component is fine with `cacheComponents` on.

## Step 6 – Verify everything

```bash
npm run verify        # lint + typecheck + tests with coverage thresholds + production build
npm run test:e2e      # Playwright against the production build
```

Issues fixed on the way: axe matcher types for TypeScript, `coverage/` linted by ESLint, Vitest config warning (renamed to `.mts`). Final: **247 tests passing; 99.6% statements, 99.2% branches overall; `src/lib` 100%; 3/3 E2E passing.**

Then a **visual check**: Claude captured screenshots of the real app (config, outfit, dialog) and spotted a placeholder label overflowing its circle, which it fixed. Passing tests don't prove it looks right.

## Step 7 – Run locally

**Prompt:** `please run locally`

```bash
npm run dev     # http://localhost:3000
```

## Step 8 – Ask whether TDD was really followed

**Prompt:** `did you follow the tdd and what is the unit test coverage`

Honest answer from Claude: tests came before code, but **not strict red-green-refactor**: whole test files were written in batches, "red" was mostly "module not found", E2E and a few edge-case tests were added after the fact, there were no per-step commits, no refactor pass, and the optional mutation spot-check was not run.

**Takeaway:** ask this question yourself. If strict TDD matters, prompt per step: *"Write ONE failing test for step N, run it, show it fails. Then minimal code. Then refactor."*

Where to find the tests: `src/**/*.test.ts(x)` next to the code, `e2e/outfit.spec.ts`, helpers in `src/test/`.

## Step 9 – Prepare Git safely

**Prompt:**
> planning to host on vercel create .env and add to gitignore and push after to https://github.com/<you>/<repo>

Claude first **inspected, read-only, in plan mode**: `.gitignore` (already ignored `.env*`), git status, remote, `gh auth status`, and the target repo (public, empty). It then asked two questions because they had real consequences:

1. **Commit email.** The repo is public and git was configured with a work email. Chosen: use the GitHub **noreply** address (repo-local config only) and rewrite the single unpushed local commit.
2. **Docs.** Chosen: copy spec and guide into `docs/`.

Steps executed after plan approval:
- Repo-local `git config user.email "<id>+<login>@users.noreply.github.com"`; `git commit --amend --reset-author`.
- Created `.env` (comments only – the app needs no variables) and `.env.example`; changed `.gitignore` to keep the example (`!.env.example`) and ignore `test-results/`, `playwright-report/`.
- Ran `npm run verify` again; previewed `git add -A -n`; confirmed no `.env`, `coverage/`, `node_modules/` staged.

## Step 10 – Commit and push

```bash
git add -A && git commit        # message ends with the Co-Authored-By line
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Problem: **push failed** – `could not read Username ... Device not configured` (no HTTPS credentials). Fix without changing global config, borrowing the GitHub CLI login for one command:

```bash
git -c credential.helper= -c credential.helper='!gh auth git-credential' push -u origin main
```

Verified via the GitHub API: files present, `.env` returns 404, commit authors show the noreply address.

## Step 11 – Publish on Vercel (and debug)

1. Import the GitHub repo at vercel.com/new (framework auto-detects Next.js; build `npm run build`; no env vars).
2. **Check the deployment from GitHub** (no Vercel login needed):
   ```bash
   gh api repos/<you>/<repo>/commits/main/status --jq '.state, (.statuses[] | "\(.context): \(.state) \(.target_url)")'
   ```
   Result: `Vercel: success – Deployment has completed`.

Then the problems:

| Symptom | Cause | Fix |
|---|---|---|
| Browser showed an error / login redirect to `vercel.com/sso-api` | **Deployment Protection (Vercel Authentication)** is on by default; only logged-in team members can open the URL | Settings → Deployment Protection → disable, or use the Share button |
| Vercel platform page "404 NOT_FOUND" | Likely wrong **Framework Preset** ("Other") saved while the repo was empty, so Vercel served a static folder with nothing in it | Dashboard: set preset to Next.js and redeploy without cache; **and** commit `vercel.json` with `{"framework": "nextjs"}` so it cannot drift |
| Push rejected (non-fast-forward) | Someone edited the README on GitHub meanwhile | `git fetch`, inspect, `git rebase origin/main`, push. Never force-push |
| No shareable link visible | Default domain not shown / deployment labelled Preview | Deployments → latest → Visit; Settings → Domains → Add `*.vercel.app` name; set production branch to `main` and Promote to Production |

**Status when this was written:** the build for the latest commit was green, but a working public URL had **not yet been confirmed**. Final check once you have the URL:

```bash
BASE_URL=https://<your-url> npm run test:e2e
```

---

## Prompt cheat sheet

| Goal | Prompt |
|---|---|
| Audit | `Analyse @spec.md, list gaps, risks and suggestions.` |
| Dev guide | `Write a development guide with TDD, test strategy and coverage thresholds.` |
| Apply audit | `Adjust the spec based on your suggestions.` |
| Build | `Start the development from @spec.md and @guide.md. Tests first, show them failing, then implement.` |
| Strict TDD | `ONE failing test, run it, minimal code, refactor, repeat.` |
| Honest check | `Did you follow TDD? What is the coverage?` |
| Git prep | `Create .env, add to .gitignore, push to <repo URL>.` |
| Deploy debug | `Vercel shows <error>` (paste the exact error text) |

## Lessons learned

1. **Audit the spec first.** Vague rules and missing data (socks!) are cheaper to fix in text than in code.
2. **Make tests enforce data, not just logic.** The catalogue integrity test caught a gap before any user could.
3. **Coverage thresholds change behaviour.** The 100% gate forced real edge-case tests.
4. **Accessibility tests find real bugs** (heading order) that unit tests miss.
5. **Look at the running app.** Screenshots caught what tests didn't.
6. **Check privacy before pushing to a public repo** (commit email, `.env`, accidental files).
7. **Never force-push**; rebase after inspecting what changed.
8. **"Build succeeded" is not "site works".** Vercel needs the right preset, and Deployment Protection hides the site from everyone not logged in.
9. **Ask the AI to be honest about process** – it will tell you where it cut corners.
