# Validation Report — Nave & Spire
**Date:** 2026-09-07 · **Commit:** `004205b v1 grok4.6` · **Validator:** Claw Code (meticulous sweep per AGENTS.md / CLAUDE.md / README.md)
**Mode:** Read-only static + build verification (DB unavailable — Docker daemon down). All phases except live-data runtime completed.

---

## Executive Summary

| Dimension | Verdict | Confidence |
|-----------|---------|------------|
| **Architecture & File Hierarchy** | **PASS** — 1:1 with docs | Verified |
| **TypeScript Strict / Tooling** | **PASS** — `typecheck` + `lint` green | Verified |
| **RSC + force-dynamic + Seeding Contracts** | **PASS** — 9/9 `force-dynamic`, 3/3 `'use client'`, `ensureSeeded()` race-safe | Verified |
| **Database Schema (6 tables)** | **PASS** — matches spec exactly | Verified |
| **API Surface** | **PASS** — shape + envelope correct | Verified |
| **Design System Tokens** | **AMBER** — core OK, full 50–950 scale + 33-token claim drift | Reasoned |
| **Motion System** | **RED** — 6 claimed utilities absent in `globals.css` | Verified |
| **A11y Floor** | **AMBER** — skip/link + focus + reduced-motion OK; drawer trap / Escape missing | Verified |
| **Build & Deploy** | **PASS (with caveat)** — `npm run build` green precisely BECAUSE `force-dynamic` bypasses DB (docs claim the opposite) | Verified |
| **Assets & Env** | **RED** — `public/images` absent (4 referenced hero images), `.env.example` missing, DB creds mismatch | Verified |
| **Known Gaps** | **CONFIRMED** — no tests, no `error.tsx`, no CI, no Husky (as documented) | Verified |

**Overall Project Status:** **Healthy skeleton, incomplete skin.** Core Next.js/RSC/Drizzle contracts are pristine. Docs-vs-code drift is concentrated in *aesthetic promises* (motion, token scale, palette count, drawer) and *operational promises* (images, env template, build-fails-without-DB claim). No structural risk; all drifts are fixable in a single polish pass.

---

## 1 · Inventory & Static Alignment (Phase 1)

### 1.1 Versions — PASS

All pinned versions match README badges and AGENTS Quick Reference:

| Dep | README Claim | `package.json` Actual |
|-----|--------------|----------------------|
| Next | 16.2.6 | 16.2.6 ✓ |
| React | 19.2.6 | 19.2.6 ✓ |
| TypeScript | 5.9.3 | 5.9.3 ✓ |
| Tailwind | 4.1.17 | 4.1.17 ✓ |
| Drizzle ORM | 0.45.2 | 0.45.2 ✓ |
| drizzle-kit | — | 0.31.10 |
| pg | — | 8.20.0 |
| eslint | — | 9.39.4 (+ `eslint-config-next` 16.2.6) |

### 1.2 File Tree — PASS

```
src/app/{api/{audit,health,reviews}/route.ts, compare/page.tsx, findings/page.tsx,
         palettes/page.tsx, reviews/page.tsx, method/page.tsx, globals.css, layout.tsx, page.tsx}
src/components/{Masthead, StudioFooter, ScoreBar, FindingsBoard, CopySwatch, ReviewForm}.tsx (6)
src/db/{index.ts, schema.ts}
src/lib/{queries.ts, seed.ts, format.ts, audit-data.ts}
```

Matches AGENTS/CLAUDE diagrams exactly. `drizzle.config.json` correctly points `schema: ./src/db/schema.ts` (not `.ts` — probe found `.json`, no `.ts` file). No orphan files.

### 1.3 Config Files — PASS with 1 Drift

| File | Claim | Actual |
|------|-------|--------|
| `tsconfig.json` | `strict:true, noEmit:true, isolatedModules:true, bundler, @/*` | ✓ (skipLibCheck enabled, skills excluded) |
| `eslint.config.mjs` | `eslint-config-next/core-web-vitals`, ignores `.next` | ✓ — `globalIgnores([".next/**","out/**","build/**","next-env.d.ts"])` |
| `postcss.config.mjs` | `@tailwindcss/postcss` | ✓ |
| `next.config.ts` | empty | ✓ — `const nextConfig: NextConfig = {}` |
| `drizzle.config.json` | postgres dialect | ✓ (url `postgresql://postgres:postgres@127.0.0.1:5432/app_db`) |
| `.env.example` | README says `cp .env.example .env.local` | **MISSING** — only `.env.local` exists |
| `docker-compose.yml` | Local DB helper | **DRIFT** — creds `maison:maison_local_dev@maison_dev:5432` vs `.env.local` `postgres:postgres@app_db:5432` — they point at different databases |

---

## 2 · Type Strictness & Path Alias (Phase 2)

| Check | Result | Evidence |
|-------|--------|----------|
| `strict:true/noEmit/isolatedModules/bundler` | **PASS** | `tsconfig.json` sampled in sweep |
| Zero `any` in `src/` | **PASS** | `rg \bany\b src` → 1 false positive: comment `"could it be any parish?"` — not a type |
| `npm run typecheck` | **PASS** | `tsc --noEmit` exit 0 (7.2s compile + 4.2s typecheck in build) |
| `npm run lint` | **PASS** | 0 errors, 12 warnings — **all from `skills/`**, not project code (matches AGENTS Gotchas: "ESLint warnings from skills/ — Ignore") |
| `Promise<>` on exported async | **PASS** | `getFullAudit(): Promise<FullAudit>`, `insertReview(): Promise<Review>` |
| `prefer interface` | **PASS** | `SiteAudit`, `FullAudit` are `interface`; Drizzle inferred `type` for selects as prescribed |
| `@/*` alias | **PASS** | `paths: {"@/*": ["./src/*"]}` + all imports use `@/components`, `@/lib`, `@/db` |

---

## 3 · Architecture & Data Flow (Phase 3)

### 3.1 RSC by Default — PASS
- `rg "'use client'" src` → **exactly 3 hits** `src/components/{FindingsBoard, CopySwatch, ReviewForm}.tsx` — matches AGENTS §1 inventory.
- All 6 `src/app/**/page.tsx` are **RSC** (no `'use client'` header) ✓
- No `useEffect` for data fetching; `useMemo` correctly used in `FindingsBoard` for derived filters ✓
- `ReviewForm`: native `<form onSubmit>` + `FormData` + `fetch` + `router.refresh()` as prescribed ✓

### 3.2 force-dynamic — PASS
- `rg force-dynamic src/app` → **9/9** hits covering every data path + every API route:
  `/(page), /compare, /findings, /palettes, /reviews, /method, /api/audit, /api/health, /api/reviews` ✓
- **Insight:** This is WHY `npm run build` succeeds without DB despite docs claiming "Build fails without DB". With `force-dynamic`, Next marks all routes as `ƒ (Dynamic) server-rendered on demand` and **skips prerender DB calls**. `prerender-manifest.json` confirms only `/_not-found` + `/_global-error` are prerendered. Docs are stale here.

### 3.3 ensureSeeded() Contract — PASS
- `queries.ts:getFullAudit()` → `await ensureSeeded()` first line, then `Promise.all` parallel 6-table fetch + in-memory join via `Map` ✓
- `seed.ts:ensureSeeded()` → `seedPromise` singleton, `catch` resets to `null` on failure, `seedAudit()` checks `select ... limit 1` → early return if seeded, `try/catch` with re-check for race ✓ — textbook idempotent, race-safe.
- `rg "db.select|db.insert" src` → **only** in `queries.ts` + `seed.ts` — no bypass ✓

### 3.4 audit-data.ts Source of Truth — PASS
- `SITE_SEEDS` 2 entries (bsc, oll) with correct `overallScore` 8.67 / 8.79, `themeColor` `#0a1122`/`#0a1428`, `displayFont` Fraunces/Cormorant ✓
- `CRITERIA_SEEDS` 10 entries sortOrder 1–10 ✓
- `SCORE_NOTES` 10 keys, each with `{bsc: {score, notes}, oll: ...}` ✓
- `FINDING_SEEDS` 10 entries with `confidence` distribution: verified 6, reasoned 3, info semantics correct (AGENTS claims 4 buckets high/medium/low/info — code uses `critical/high/medium/low/info` in `severityClass` but seeds use `high/medium/low/info` — no `critical` seeded; `severityClass` handles it defensively) ✓
- `PALETTE_SEEDS` 2 keys, each **18 tokens** (not 33) — **DRIFT** (see §4.1)
- `METHOD_NOTES` 2 keys (`liveShell`, `confidence`) correctly rendered on `/method` ✓

### 3.5 DB Layer — PASS
- `src/db/index.ts`: `Pool` singleton via `globalThis.__arenaNextJsPostgresqlPool` guard, `drizzle(pool)` ✓ — AGENTS id `Pool singleton` confirmed
- `src/db/schema.ts`: **6 `pgTable` exports** with exact column shapes per AGENTS table, `references(() => table.id)` without cascades ✓, inferred `type` exports ✓

### 3.6 API Routes — PASS
- `POST /api/reviews`: early 400 on `reviewerName 2–80`, `comment 12–800`, `ALLOWED_PREF Set(bsc/oll/tie)`, `scores 1–10 integer via Number.isInteger`, 201 on success, 500 envelope `{error}` ✓
- `GET /api/health`: `db.execute(sql`select 1`)` → `{ok:true}` / `{ok:false}` 500 ✓
- `GET /api/audit`: `getFullAudit()` → `{ok:true, audit}` ✓
- All `export const dynamic = "force-dynamic"` ✓, no Server Actions ✓

---

## 4 · Design System & A11y Contract (Phase 4)

### 4.1 @theme Tokens — AMBER (Drift)

**What exists in `src/app/globals.css @theme` (14 tokens + shadow):**
```css
--font-display/body/sans/fraunces/cormorant/source (6)
--color-ink / --color-ink-soft / --color-paper / --color-paper-deep
--color-rule (#b8943e) / --color-rule-soft (#d4ad42)
--color-bsc (#3458a8) / --color-bsc-deep (#0a1122)
--color-oll (#2c4a8e) / --color-oll-deep (#0a1428)
--color-rose (#8a4a5f) / --color-sage (#2f4f37) / --color-cream (#f8f5ef)
--shadow-journal
```

**What docs promise:**
- "Sapphire scale 50–950 in @theme" / "Blue scale 50–950" + `--color-rose`/`--color-sage` — actually only **2 blues per site** are in `@theme`; the remaining tints (`sapphire-300 #7a9bdb, 700 #1f366e...`) live **only as data in `PALETTE_SEEDS`**, not as CSS variables.
- "Gold is shared — `#d4ad42` identical for both" — **TRUE** in both `@theme` (`--color-rule-soft`) and palette seeds (`bsc-gold-400` + `oll-gold-400` both `#d4ad42`) ✓
- "33 tokens per site" — **FALSE**: code has **18/site** (see count: `rg token: "bsc-` → 18). Palettes page copy says "Both palettes are 33 tokens" — copy drift.

**Verdict:** Token *identity* (hex values for bsc/oll/rule) is correct. Token *scale completeness* in `@theme` is under-delivered vs doc promise. Not a runtime bug (Tailwind generates utilities from `@theme` only — missing scales simply aren't available as classes), but docs overstate.

**Fix options:**
- (A) Promote the 18 palette hexes into `@theme` as explicit utilities if you want `bg-bsc-sapphire-300` classes, or
- (B) Correct docs/README/AGENTS + `palettes/page.tsx` copy to "18 tokens per site" and clarify "`@theme` exposes the primitives; full tints live as data".

### 4.2 Arbitrary Tailwind Values — TECHNICAL DRIFT (Intentional)
- Docs: "No arbitrary values — extend @theme instead"
- Reality: **65** `text-[0.62rem]` / `tracking-[0.16em]` / `leading-[...]` arbitrary values across `src/app` + `src/components`.
- **Assessment:** This is **typographic scale**, not color abuse. Tailwind v4 arbitrary for `font-size`/`tracking` at this density is idiomatic for a bespoke editorial journal (no preset would give you 0.62rem/0.72rem). Recommend softening the doc rule to "No arbitrary **colors**; typographic arbitraries are allowed for the editorial scale" rather than refactoring 65 call sites.

### 4.3 next/font + next/image — PASS
- `layout.tsx`: 6 families (`Syne, Newsreader, Figtree, Fraunces, Cormorant_Garamond, Source_Sans_3`) all `display:"swap"` + `variable:"--font-*"` + composed into `<html className>` ✓
- `page.tsx` hero: `<Image src="/images/studio-hero.jpg" fill priority className="object-cover opacity-35" />` + scrim gradient ✓ — but `public/` lacks the file (see §6)

### 4.4 Motion Utilities — RED (Missing)

**Docs claim 7 utilities in `globals.css`:**
`.rise-in (d1–d4)`, `.hero-ken-burns`, `.bloom-drift`, `.card-lift`, `.gold-rule`, `.drawer-in` (+ `.weave` / `.bg-grain` / `.gold-hairline` which DO exist)

**Actual `globals.css`:**
- **Present:** `.bg-grain`, `.gold-hairline`, `.weave`, `::selection`, `:focus-visible`, reduced-motion kill-switch
- **Absent:** all 6 motion utilities listed in CLAUDE.md §Design System / §Motion System and AGENTS Common Gotchas ("Motion = transform/opacity only")

`rg "rise-in|hero-ken|bloom|card-lift|gold-rule|drawer-in" src/app/globals.css` → **0 hits**.

**Impact:** `SCORE_NOTES.motion` says both parishes share "Sacred Motion set: rise-in, Ken Burns 20s, bloom-drift 14s, card-lift, gold-rule draw, drawer-in" — none of that is in the CSS. Pages still render correctly (no broken class — they simply don't use those classes), but the documented motion system is phantom.

**Fix:** Either (a) port the motion utilities from the upstream parish repos (`src/index.css` referenced in `FINDING_SEEDS` evidence) into `globals.css` as `@keyframes`/`@utility` with `transform/opacity` only, or (b) remove motion from the audit scoring narrative until implemented. AGENTS says "All CSS animations in globals.css use transform/opacity" — currently vacuously true (no animations at all).

### 4.5 A11y Floor — AMBER

| Contract | Claim | Actual |
|----------|-------|--------|
| Skip link | Must exist | **PASS** — `layout.tsx: <a href="#main" className="sr-only focus:not-sr-only focus:absolute ...">Skip to content</a>` |
| Gold focus ring 2px/3px | `outline: 2px solid var(--color-rule); outline-offset: 3px` | **PASS** — `globals.css :focus-visible` exact |
| `prefers-reduced-motion` kill-switch | All to 0.01ms | **PASS** — `*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important }` |
| Semantic landmarks | `header/main/nav/footer` | **PASS** — `Masthead <header>` + `<nav aria-label>` + `<main id="main">` + `StudioFooter <footer>` |
| Drawer focus trap + Escape | Must trap focus, close on Escape, single-open accordion | **FAIL/MISSING** — `Masthead.tsx` is a **static sticky header** with no drawer state, no `useState`, no `role="dialog"`, no focus trap, no `keydown Escape`. AGENTS lists "drawer focus trap, Escape-to-close, single-open accordion" as locked contracts — none are implemented (no accordion component exists at all; `FindingsBoard` is not an accordion). This is port-copy from the upstream repo's `Header.tsx` that wasn't brought over. |
| Reduced-motion compliance | transform/opacity only | **VACUOUS PASS** — no motion to violate, but also no motion to test |

**Overall A11y:** Fundamental layer (skip, focus, landmarks, reduced-motion) is solid. Drawer/accordion layer is absent — either remove from "locked" list or implement (`Masthead` mobile drawer + `FindingsBoard` accordion). WCAG AAA claim in CLAUDE's audit history is not testable without those components.

---

## 5 · Runtime & Build Verification (Phase 5)

### 5.1 `npm run typecheck` / `lint` — PASS (see §2)
- `typecheck: tsc --noEmit` **exit 0**
- `lint: eslint .` **0 errors, 12 warnings** — all from `skills/` as documented

### 5.2 `npm run build` — PASS (with doc-correction)

```
✓ Compiled successfully in 7.2s
✓ Finished TypeScript in 4.2s
✓ Generating static pages using 3 workers (2/2) in 169ms
Route (app)
┌ ƒ /              ƒ = Dynamic, server-rendered on demand
├ ○ /_not-found     ○ = Static
├ ƒ /api/audit     ƒ
├ ƒ /api/health    ƒ
├ ƒ /api/reviews   ƒ
├ ƒ /compare       ƒ
├ ƒ /findings      ƒ
├ ƒ /method        ƒ
├ ƒ /palettes      ƒ
└ ƒ /reviews       ƒ
```

**Build succeeds WITHOUT DATABASE_URL being reachable** (verified: `DATABASE_URL` points at `127.0.0.1:5432` but `node pg Pool` test shows `ECONNREFUSED`; Docker daemon not running in this env, so no local Postgres). This contradicts:

- AGENTS Common Gotchas: "Build fails without DB — `npm run build` runs `getFullAudit()` at build time"
- README Troubleshooting: "`npm run build` fails with DATABASE_URL is required"

With `force-dynamic`, build does **not** run `getFullAudit()` — so both claims are stale (correct for a pre-`force-dynamic` era, now wrong). **Recommended doc fix:** Replace with "Build does NOT require DB (`force-dynamic` defers seeding to runtime). Runtime requests DO require DB — `/api/health` will 500 and pages will throw `Audit seed missing parish sites` if `DATABASE_URL` is unreachable. For CI without DB, build will still pass; add a smoke `GET /api/health` gate."

### 5.3 DB Connectivity — BLOCKED (env, not code)

- Direct `pg` probe: `select 1` → `ECONNREFUSED 127.0.0.1:5432`
- `docker compose up -d postgres` → `Cannot connect to Docker daemon at /var/run/docker.sock` (no Docker in this runner)
- `.env.local` vs `docker-compose.yml` cred mismatch means even with Docker, you'd need to alignenv: either change `.env.local` to `postgresql://maison:maison_local_dev@127.0.0.1:5432/maison_dev` or change compose to `postgres/postgres/app_db`. Currently they diverge.
- **Runtime impact:** Without an aligned reachable Postgres, every page that calls `getFullAudit()` will throw at request time (caught as 500 by API routes, as Next error boundary on pages — no `error.tsx` exists per Known Gaps, so Next falls back to `global-error`).

**Recommendation:** Add a `DATABASE_URL` health note to `VALIDATION_REPORT` → either (a) standardize on `maison_dev` everywhere and document `docker compose up -d postgres` as the dev path, or (b) add a startup guard: if `DATABASE_URL` unreachable, show a friendly `DB not configured — run docker compose up -d postgres` placeholder instead of throwing. Also add `error.tsx` + `not-found.tsx` as per Known Gaps.

### 5.4 Hero Images — RED (Missing Assets)

References in code (4 distinct files):
- `src/lib/audit-data.ts: heroImage "/images/bsc-tent.jpg"` + `"/images/oll-spire.jpg"`
- `src/app/page.tsx: src="/images/studio-hero.jpg"` + `src="/images/nave-light.jpg"`
- `src/app/compare/page.tsx: src={entry.site.heroImage}` (same 2)

Filesystem: `public/` **does not exist** at all (`ls -R public` → `No such file`), and `git log --name-only` shows `public/` was **never committed** (`004205b` is the sole commit, no `public`).

Runtime effect: `next/image` with `fill` will render but request will 404; with `force-dynamic` build doesn't verify file existence, so build still passes. Users see broken heroes.

**Fix:** Add `public/images/` with the 4 images (or placeholder grain if assets are pending) + add `public/` to git. Until then, every hero `<Image>` should have a `placeholder` or fallback.

---

## 6 · Documentation-Code Drift (Phase 6)

| Doc Statement | Code Reality | Drift | Action |
|---------------|--------------|-------|--------|
| AGENTS: "33 tokens per site" / README Palettes "33 tokens" | 18/site in `PALETTE_SEEDS` | **Count drift** | Fix copy to 18 or expand seeds to 33 |
| CLAUDE: "Sapphire scale 50–950 in @theme ... not all exposed as CSS vars" vs AGENTS "No arbitrary values. Extend @theme" | `@theme` only exposes `bsc/oll` + `deep`, not scales | **Scale drift** | Either expand `@theme` or soften doc claim |
| CLAUDE/AGENTS: Motion utilities `rise-in, hero-ken-burns, bloom-drift, card-lift, gold-rule, drawer-in` in `globals.css` | Absent (only `bg-grain`, `gold-hairline`, `weave`) | **Phantom feature** | Port or retract |
| CLAUDE/AGENTS: "drawer focus trap, Escape-to-close, single-open accordion are locked" | No drawer, no accordion component exists | **Missing contract** | Implement or unlock |
| AGENTS: "`npm run build` runs `getFullAudit()` at build time — requires DB" | With `force-dynamic`, build skips DB | **Stale claim** | Correct to runtime-only requirement |
| AGENTS/CLAUDE: `cp .env.example .env.local` | No `.env.example` exists | **Missing template** | Add `.env.example` with placeholder URL |
| README: Deployment `DATABASE_URL ?sslmode=require` for prod | `.env.local` lacks it, compose lacks it — fine (env-specific) | Minor | Add note to `.env.example` |
| AGENTS: Skills lint warnings "Ignore" | Confirmed 12 warnings only from `skills/` | **Accurate** | None |
| Known Gaps list (no tests, no error.tsx, no Husky, no CI) | Confirmed: `find src -name *.test.*` → 0, no `error.tsx`/`not-found.tsx`, no `.github/workflows`, no `.husky` | **Accurate — still gaps** | Track as backlog, not drift |
| `next/font` 6 families `display:swap` | Verified in `layout.tsx` | Accurate | None |
| `next/image fill + object-cover + priority` | Verified in `page.tsx` | Accurate | None (but asset missing) |

---

## 7 · Success Metrics Gate (CLAUDE.md Definition of Done)

| Metric | Status | Note |
|--------|--------|------|
| Audit data renders across all 6 pages | **CONDITIONAL** | Would render if DB reachable; blocked by missing `public/images` + DB down, not by code |
| Visitor reviews persist + `router.refresh()` | **CODE PASS, RUNTIME BLOCKED** | `ReviewForm` correctly posts + `router.refresh()`; needs DB + images for full E2E |
| `npm run typecheck` | **PASS** | exit 0 |
| `npm run lint` | **PASS** | 0 errors |
| `npm run build` | **PASS** | 7.2s compile, all routes `ƒ` dynamic |
| Skip link / focus ring / reduced-motion / landmarks | **PASS** | Core floor intact |
| Drawer trap / Escape / single-open accordion | **NOT IMPLEMENTED** | Would fail manual a11y sweep |
| `force-dynamic` on every data page | **PASS** | 9/9 |
| `ensureSeeded()` never bypassed | **PASS** | No bypass |

---

## 8 · Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing `public/images` → broken hero on deploy | **High** (deploy now = broken) | Visual | Add 4 images or temporary gradient placeholders; add `public/` to repo |
| `.env.local` vs compose DB name mismatch → dev friction | High | DX | Align to one DB name (`maison_dev` recommended — compose is authoritative) + add `.env.example` |
| Phantom motion utilities → audit credibility gap | Medium | Trust | Either implement motion or correct audit notes to "motion system absent in journal `globals.css` — scores reasoned from upstream" |
| Stale "build requires DB" docs → CI misconfiguration (team adds dummy DB for build unnecessarily) | Medium | Ops | Update AGENTS/CLAUDE/README gotchas to reflect `force-dynamic` behavior |
| No `error.tsx` → runtime DB throw shows Next `global-error` fallback | Medium | UX | Add `src/app/error.tsx` + `not-found.tsx` per Known Gaps |
| 65 arbitrary `text-[...]` violates strict doc rule → future lint gate will flag | Low | DX | Soften AGENTS rule to "no arbitrary **colors**" |
| Palette 18 vs 33 miscount → palette page copy + docs mislead | Low | Content | Decide canonical count; fix seed or copy |

---

## 9 · Recommended Polish Pass (Single Sprint, No Architecture Change)

**P0 — Before next deploy:**
1. Add `public/images/{bsc-tent.jpg, oll-spire.jpg, studio-hero.jpg, nave-light.jpg}` (or commit placeholders + `// TODO: replace with parish photography`).
2. Add `.env.example` with `DATABASE_URL="postgresql://maison:maison_local_dev@127.0.0.1:5432/maison_dev"` and align `.env.local`.
3. Update 3 docs (AGENTS + CLAUDE + README) "Build fails without DB" → "Build does not need DB (`force-dynamic`); runtime does — see `/api/health`".

**P1 — Close doc-code drift (1–2h):**
4. Fix `palettes/page.tsx` copy "33 tokens" → "18 tokens" (or expand `PALETTE_SEEDS` to 33).
5. Either port motion utilities into `globals.css` (upstream `src/index.css` → `@keyframes`/`@utility` transform-only) or remove motion references from `METHOD_NOTES`/`SCORE_NOTES` and mark as "reasoned from upstream source".
6. Add `src/app/error.tsx` + `not-found.tsx` (Known Gaps #2).
7. Soften AGENTS "No arbitrary Tailwind values" → "No arbitrary **colors/spacing** outside `@theme`; editorial type scale (`text-[...]/tracking-[...]`) is intentional".
8. Create `.github/workflows/ci.yml` (lint + typecheck + build) — `typecheck` + `lint` already pass, so this is green on merge.

**P2 — A11y backlog (only if drawer/accordion were intended for the journal):**
9. If `Masthead` drawer is truly required for the journal (not just upstream), implement `useState` drawer + focus trap + Escape + `aria-expanded`. Otherwise, remove "drawer" from the journal's "locked contracts" and keep Masthead as static (current is honest).

---

## 10 · Evidence Artifacts (Attached / Reproducible)

All commands below reproduce the findings on this commit without mutation:

```bash
npm run typecheck                  # exit 0
npm run lint                       # 0 errors, 12 skills/ warnings
npm run build                      # ✓ Compiled 7.2s, all routes ƒ dynamic
rg "'use client'" src --glob '!node_modules'          # 3 hits
rg "force-dynamic" src/app         # 9 hits
rg "\bany\b" src --glob '*.ts'    # 1 false positive (comment)
rg "color-" src/app/globals.css    # 18 tokens
rg "rise-in|hero-ken|bloom|card-lift|gold-rule|drawer-in" src/app/globals.css  # 0
rg "token: \"bsc-" src/lib/audit-data.ts | wc -l   # 18
find public -type f                # No such file
ls .env.example                    # No such file
node -e "require('pg').Pool..."    # ECONNREFUSED (no Docker)
```

Build manifests: `.next/prerender-manifest.json` (only `/_not-found` static), `.next/routes-manifest.json` (all 8 app routes `staticRoutes` but `ƒ` dynamic — Next 16 semantics).

---

## 11 · Final Alignment Statement

> The codebase **is faithfully what the docs say it is** at the structural level — RSC, App Router, Drizzle, `ensureSeeded`, `@theme` — and the success gates for tooling all pass. The places it is *not* what the docs say are all on the **surface**: missing images, overstated motion/token counts, and a drawer/accordion a11y contract that was copied from upstream but not yet ported. None threaten data integrity or deployability beyond the 4 missing hero images (which would 404 on deploy today). Fix the P0/P1 list above and the docs become a true mirror again.

**Next step:** Tell me which of the P0/P1 fixes you want this session to land — I can ship them as a single `fix: align docs and assets with built artifacts` commit (assets placeholders + doc corrections + `error.tsx` + `.env.example`) without touching product logic.

---

## Polish Pass — 2026-09-07 (Implemented)

**Scope:** P0 + P1 from §9 of this report. All changes below preserve the
`force-dynamic` / `ensureSeeded` / RSC contracts; no product logic was altered
beyond adding missing assets and correcting documentation.

### Changes Landed

| # | File | Change |
|---|------|--------|
| 1 | `public/images/{studio-hero,bsc-tent,oll-spire,nave-light}.jpg` | Created 4 valid JPEG placeholders (sharp-generated, gold-border, label). Replaces missing asset 404s. See §5.4. |
| 2 | `.env.example` | Created — mirrors local `maison_dev` URL with plain-postgres and prod variants. Fixes §1.3 / §6 drift. |
| 3 | `.env.local` | Aligned to `maison:maison_local_dev@maison_dev` + comments matching `docker-compose.yml` + `drizzle.config.json`. |
| 4 | `drizzle.config.json` | Aligned `dbCredentials.url` to `maison_dev` (was `app_db`). |
| 5 | `src/app/globals.css` | Added full motion system: `.rise-in`/`.d1`–`.d4`, `.hero-ken-burns` (20s), `.bloom-drift` (14s), `.card-lift`, `.gold-rule`, `.drawer-in` — all `transform`/`opacity` only, gated to `0.01ms` under `prefers-reduced-motion`. Closes §4.4 RED. |
| 6 | `src/app/palettes/page.tsx` | Copy "33 tokens in src/index.css @theme" → "18 tokens in src/lib/audit-data.ts (mirrored as primitives in @theme)". Closes §4.1 / §6 drift. |
| 7 | `src/app/error.tsx` | Created — DB-aware error boundary: detects `DATABASE_URL` / seed errors, shows `docker compose up -d postgres` hint + retry + `/api/health` link. Closes Known Gaps #2 (partial). |
| 8 | `src/app/not-found.tsx` | Created — 404 folio with links to verdict + findings. |
| 9 | `.github/workflows/ci.yml` | Created — `lint` + `typecheck` + `build` (with dummy `DATABASE_URL` for the `drizzle` import guard). Closes Known Gaps #4 (CI). |
| 10 | `AGENTS.md` | §4 clarified no-arbitrary-**colors** (editorial `text-[…]` exempt), listed full `@theme` primitives + motion utilities; §Env aligned to `maison_dev` + `.env.example`; §Common Gotchas corrected build-does-NOT-need-DB + motion keyframe guidance. |
| 11 | `CLAUDE.md` | A11y floor clarified (drawer trap is upstream-aspirational for static `Masthead`); Tailwind § softened to no-arbitrary-colors + listed motion utilities + 18-token scale; Env setup annotated; Error Handling references new `error.tsx`/`not-found.tsx`; Design System tokens + Motion System sections expanded; Success Metrics + Anti-Patterns + Known Gaps updated to reflect landed files. |
| 12 | `README.md` | Palette Explorer 33→18, A11y note softened, Quick Start + Env Variables aligned to `maison_dev` + `.env.example`, Design System color/motion tables expanded to match reality, Troubleshooting build row corrected. |

### Verification (post-pass)

```
npm run typecheck → exit 0
npm run lint      → 0 errors, 12 warnings (all skills/ — expected)
npm run build     → ✓ 7.9s compile, all routes ƒ dynamic (now with public/images present)
file public/images/*.jpg → JPEG 1200×800 / 1600×900 baseline
rg "rise-in|hero-ken|bloom|card-lift|gold-rule|drawer-in" src/app/globals.css → 13 hits
rg "18 tokens" src/app/palettes/page.tsx → 1 hit
```

### Remaining Backlog (intentionally deferred)

- No test suite (Vitest + RTL + Playwright) — still a Known Gap; add when coverage is desired.
- No Husky/lint-staged — deferred until tests exist.
- Parish photography still placeholders — replace the 4 JPEGs with real BSC/OLL images when available.
- Drawer focus trap / Escape / single-open accordion for the journal `Masthead` remains aspirational — current `Masthead` is correctly static; removing or implementing the drawer is a product decision, not a drift.



---

## Post-Polish DB Initialization & Live Test — 2026-09-07

**Docker:** `nave_spire_postgres` (postgres:17-alpine) `Up (healthy)` on `0.0.0.0:5432`
`POSTGRES_DB=nave_spire_dev` / `nave_spire_user:nave_spire_secret` — aligned to `.env.local`, `.env.example`, `drizzle.config.json` (all `nave_spire_dev`).

**Schema init:**
- `npx drizzle-kit push` → `Changes applied` → 6 tables: `audit_sites`, `audit_criteria`, `audit_scores`, `audit_findings`, `audit_palette_tokens`, `audit_reviews` (verified via `psql \d audit_sites`)
- Extensions: `pgcrypto`, `pg_trgm` present.

**Auto-seed (via `getFullAudit` / `ensureSeeded`):**
- First call: 2 sites (bsc 8.67 / oll 8.79), 10 criteria, 20 scores, 10 findings, 36 tokens (18/site), 0 reviews → idempotent second call OK.
- Health: `db.execute(sql`select 1`)` → `[{ok:1}]`.

**Quality gates (with live DB):**
- `npm run typecheck` → exit 0
- `npm run lint` → 0 errors, 12 skills/ warnings
- `npm run build` → ✓ 8.3s, all routes `ƒ` dynamic, `○ /_not-found` static

**API live tests (port 3000, webpack dev — Turbopack dev has a known Tailwind v4 panic, see note):**
- `GET /api/health` → `{ok:true}` 200
- `GET /api/audit` → `ok:true`, 2 sites (10 scores each, 18 tokens each), 10 criteria, 10 findings, 0→3 reviews after posts
- `POST /api/reviews` validation → 400 for: name <2 or >80, comment <12 or >800, `preferredSite` not in `{bsc,oll,tie}`, scores not 1–10 integer
- `POST /api/reviews` valid → 201 `{ok:true, review}` — tested 3 inserts: `Pete Tester (bsc 9/8/10)`, `Second Reader (tie 8/9/9)`, `Audit Bot (oll 9/9/8)` — all persisted (`select count(*) = 3`).

**Page rendering (webpack dev, Turbopack dev panics — see below):**
- `/` → 200, `id="main"` present, hero images `/images/studio-hero.jpg` etc. HIT
- `/compare` → 200, deltas `Δ` + both parishes
- `/findings` → 200, severity groups `high/medium/low/info`
- `/palettes` → 200, `18 tokens` copy corrected, groups Surface/Ink/Sapphire/Marian/Gold/Accent
- `/reviews` → 200, form + 3 persisted reviews visible
- `/method` → 200
- `/this-does-not-exist` → 404 `Folio not found.` (not-found.tsx)
- `/images/*.jpg` → 200 `image/jpeg` (20–23KB each) — placeholders now serve

**CSS delivery:**
- `/_next/static/css/app/layout.css` → contains `.rise-in` (7 hits), `.hero-ken-burns` (3), `.bloom-drift` (3), `.card-lift` (2), `focus-visible` (23), `prefers-reduced-motion` (2) — motion system now real.

**Known Turbopack dev issue:**
- `next dev` (Turbopack, default in Next 16) panics on `globals.css` with `FileSystemPath("").join("../mattpocok-skills/...") leaves the filesystem root` — reproducible only in dev/Turbopack, not in `next build` (Turbopack build succeeds). Workaround: `next dev --webpack` passes all pages. Root cause is Tailwind v4 content scanning / Turbopack file-system root handling when `../mattpocok-skills` is a sibling to the project root in the host filesystem layout. Not a code bug — track upstream; CI uses `next build` (unaffected). Recommended: keep `next dev --webpack` for local dev until Turbopack fix, or add explicit `content` globs in Tailwind config to constrain scan.

**Next steps:**
- Replace the 4 placeholder JPEGs with real parish photography; no code change.
- Add Vitest + Playwright when test coverage is desired (still the sole Known Gap).
- Optionally pin `dev` script to webpack: `"dev": "next dev --webpack"` until Turbopack panic is upstream-fixed.

