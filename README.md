# Nave & Spire

![Next.js](https://img.shields.io/badge/Next.js-16.3.4-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.6-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.3.3-06B6D4?logo=tailwindcss&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-0.45.2-C5F74F?logo=drizzle&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Tests](https://img.shields.io/badge/tests-vitest%2029%2F29-brightgreen)

A design audit journal comparing two Singapore parish websites — **Church of the Blessed Sacrament (BSC)** and **Church of Our Lady of Lourdes (OLL)** — across ten evidence-backed criteria. Scores are derived from source tokens, components, and information architecture, not from rendered screenshots.

## Overview

Nave & Spire is a Next.js 16 web application that presents a structured, evidence-backed comparison of two parish websites built on the same component scaffold. It surfaces where the fork diverges (typography, colour identity, accent tokens, information architecture choices) and where it does not (radii, motion system, layout primitives). The journal includes a findings ledger with confidence-tagged entries, a side-by-side score comparison, interactive palette swatches, and a visitor review system.

## Key Features

| Feature | Description |
|---------|-------------|
| 📊 **Side-by-side Comparison** | Ten criteria scored 0–10 with delta, per-site rationale, and visual score bars |
| 🔍 **Findings Board** | Filterable ledger by severity (high/medium/low/info) and scope (BSC/OLL/shared) |
| 🎨 **Palette Explorer** | 18 tokens per site with copy-to-clipboard, grouped by semantic role (Surface, Ink, Blue, Gold, Accent) |
| ✍️ **Visitor Reviews** | Submit Visual/UX/A11y scores (1–10) with comments; persisted to PostgreSQL |
| 📖 **Methodology Page** | Documents sources, scoring approach, confidence levels, and what would raise confidence |
| ♿ **Accessibility-First** | Skip link, gold focus ring (2px/3px offset), `prefers-reduced-motion` kill-switch (drawer trap is upstream parish-site, journal `Masthead` is static) |

## Architecture

### Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js (App Router) | 16.3.4 | RSC, routing, API routes |
| UI | React | 19.2.6 | Component model |
| Language | TypeScript | 5.9.3 | Strict mode, no `any` |
| Styling | Tailwind CSS | 4.3.3 | CSS-first `@theme` config |
| Database | PostgreSQL | 17 | Primary data store |
| ORM | Drizzle ORM | 0.45.2 | Type-safe queries, migrations |
| Testing | Vitest + RTL | latest | Unit/component tests (`npm test`) |
| Fonts | next/font | 16.3.4 | Self-hosted Google Fonts (6 families) |
| Images | next/image | 16.3.4 | Optimized, priority-loaded heroes |

### Architectural Principles

1. **Server Components by default** — All pages are RSC; `'use client'` only for interactivity
2. **Force-dynamic rendering** — Every data-fetching page exports `export const dynamic = "force-dynamic"`
3. **Auto-seeding on first query** — `ensureSeeded()` populates DB from `audit-data.ts` constants
4. **Source over screenshot** — All scores derived from committed source, not live SPA paint
5. **Confidence-tagged findings** — Every finding carries `verified | reasoned | assumed`

### Data Flow

```mermaid
flowchart TB
    A[Request] --> B[Page (RSC)]
    B --> C[getFullAudit()]
    C --> D{ensureSeeded()}
    D -->|Fresh DB| E[Insert seeds from audit-data.ts]
    D -->|Seeded| F[Query 6 tables in parallel]
    F --> G[In-memory joins]
    G --> H[Return FullAudit]
    H --> I[Render page]
```

### Layered Structure

```
Layer 1 — App (RSC pages + API routes)   src/app/**    → may import Layer 2 + 3
Layer 2 — Components (RSC + client)      src/components/** → may import Layer 3 (type-only @/db/schema allowed)
Layer 3 — Domain (queries, seed, rate-limit, format, audit-data, db) src/lib/** + src/db/**
```

All DB access goes through `src/lib/queries.ts` (`getFullAudit()`, `insertReview()`), which calls `ensureSeeded()` first. `POST /api/reviews` additionally passes a per-IP fixed-window rate limiter (`src/lib/server/rate-limit.ts`, 5 req/min, bounded client map). The limiter is in-memory per instance, so enforcement is best-effort across instances — live-verified 2026-09-08 that the deployed host may answer from more than one instance (see `docs/CODE_AUDIT_2026-09-08.md` M-A); a deterministic global limit needs a shared store.

## File Hierarchy

```
📂 src/
├── 📂 app/                          # Next.js App Router
│   ├── 📂 api/                      # Route handlers
│   │   ├── 📂 reviews/route.ts      # POST /api/reviews (submit review, rate-limited)
│   │   ├── 📂 health/route.ts       # GET /api/health (DB check)
│   │   └── 📂 audit/route.ts        # GET /api/audit (full JSON export)
│   ├── 📂 compare/page.tsx          # Side-by-side score comparison
│   ├── 📂 findings/page.tsx         # Filterable findings board
│   ├── 📂 palettes/page.tsx         # Token swatches with copy
│   ├── 📂 reviews/page.tsx          # Visitor scoreboard + form
│   ├── 📂 method/page.tsx           # Methodology & sources
│   ├── 📄 error.tsx                 # DB-aware error boundary ('use client')
│   ├── 📄 not-found.tsx             # 404 "Folio not found."
│   ├── 📄 globals.css               # Tailwind v4 @theme + motion utilities
│   ├── 📄 layout.tsx                # Root: fonts, Masthead, StudioFooter
│   └── 📄 page.tsx                  # Home: hero, verdict, score bars, IA, type
├── 📂 components/                   # React components (RSC + client)
│   ├── 📄 Masthead.tsx              # Sticky header, nav links
│   ├── 📄 StudioFooter.tsx          # Footer, links, disclaimer
│   ├── 📄 ScoreBar.tsx              # Visual score bar (RSC)
│   ├── 📄 FindingsBoard.tsx         # Filterable list ('use client')
│   ├── 📄 CopySwatch.tsx            # Token card + clipboard ('use client')
│   └── 📄 ReviewForm.tsx            # Submission form ('use client')
├── 📂 db/                           # Drizzle ORM
│   ├── 📄 index.ts                  # Pool singleton (globalThis) + drizzle instance
│   ├── 📄 schema.ts                 # 6 tables (sites, criteria, scores, findings, palette_tokens, reviews)
│   └── 📄 schema.test.ts            # Schema ≡ committed migration pin
├── 📂 lib/                          # Business logic
│   ├── 📂 server/rate-limit.ts      # Fixed-window per-IP limiter (+ .test.ts)
│   ├── 📄 queries.ts                # getFullAudit(), insertReview()
│   ├── 📄 seed.ts                   # ensureSeeded() — idempotent, race-safe
│   ├── 📄 format.ts                 # Pure formatters (score, severity, contrast)
│   ├── 📄 format.test.ts            # Unit tests incl. no-raw-hex token rule
│   └── 📄 audit-data.ts             # ALL seed constants (sites, criteria, scores, findings, palettes)
└── 📂 regression/
    ├── 📄 docs-drift.test.ts        # Retired-identifier scan (maison_dev guard)
    ├── 📄 repo-hygiene.test.ts      # Build-portability contracts (symlinks, env, configs)
    └── 📄 docs-contract.test.ts     # Living-docs sync (stale strings, test count, config pins)
```

## Quick Start

### Prerequisites

- Node.js ≥ 22
- PostgreSQL ≥ 17 (local or managed)

### Setup

```bash
# 1. Clone & install
git clone <repo-url>
cd report-presentation
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local: set DATABASE_URL — local dev is "postgresql://nave_spire_user:nave_spire_secret@127.0.0.1:5432/nave_spire_dev"
# Must match docker-compose.yml + drizzle.config.ts. Or use plain postgres: "postgresql://postgres:postgres@127.0.0.1:5432/app_db"

# 3. Initialize database (fresh clone → production-ready)
# Option A — one-shot setup (generate + migrate + seed): recommended for fresh clones and CI
npm run db:setup
# Option B — step-by-step (if you prefer explicit control)
# npm run db:generate   # create drizzle/0000_*.sql from src/db/schema.ts (no-op if already generated)
# npm run db:migrate    # apply drizzle/*.sql to DATABASE_URL (idempotent)
# npm run db:seed       # idempotent seed via ensureSeeded() — 2 sites, 10 criteria, 20 scores, 10 findings, 36 tokens
# Note: auto-seeding also runs on first request via getFullAudit() → ensureSeeded(),
# so Option A is not strictly required — but it makes `npm run build && npm start` deterministic for production.

# 4. Start development server
npm run dev             # use `npx next dev --webpack` if Turbopack dev panics (see Troubleshooting)
```

### Verify Setup

- Open `http://localhost:3000` → Home page renders with hero, verdict, score bars
- Navigate to `/compare` → Side-by-side comparison loads
- Navigate to `/findings` → Findings board with filter controls
- Navigate to `/palettes` → Token grids for BSC & OLL
- Navigate to `/reviews` → Review form + empty scoreboard
- Navigate to `/method` → Methodology documentation
- `GET /api/health` → Returns `{ "ok": true }` if DB connected

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string — must match `docker-compose.yml` + `drizzle.config.ts` for local dev | `postgresql://nave_spire_user:nave_spire_secret@127.0.0.1:5432/nave_spire_dev` (or `postgresql://postgres:postgres@127.0.0.1:5432/app_db` for plain postgres) |

**Production**: Add `?sslmode=require` to connection string. See `.env.example` for all variants. For fresh production DB, run `npm run db:setup` after setting `DATABASE_URL`.

## Design System

### Typography (via `next/font` + CSS variables)

| Variable | Font | Usage |
|----------|------|-------|
| `--font-display` | Syne | Issue number, main headlines |
| `--font-body` | Newsreader | Body copy, article text |
| `--font-sans` | Figtree | UI labels, nav, buttons, metadata |
| `--font-fraunces` | Fraunces | BSC display headlines |
| `--font-cormorant` | Cormorant Garamond | OLL display headlines |
| `--font-source` | Source Sans 3 | Body text on both parish sites |

### Color Tokens (Tailwind v4 `@theme` in `src/app/globals.css`)

**BSC — Sapphire**
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bsc` | `#3458a8` | Primary sapphire (links, accents) |
| `--color-bsc-deep` | `#0a1122` | Hero/footer background |
| Full tints (sapphire-300 `#7a9bdb`, gold `#d4ad42`, pine/terracotta) | — | 18 tokens/site in `src/lib/audit-data.ts` (`PALETTE_SEEDS`) |

**OLL — Marian Blue**
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-oll` | `#2c4a8e` | Primary Marian blue |
| `--color-oll-deep` | `#0a1428` | Hero/footer background |
| Full tints (blue-300 `#7f9fde`, gold `#d4ad42`, rose/sage) | — | 18 tokens/site in `src/lib/audit-data.ts` |
| `--color-rose` | `#8a4a5f` | Mystical Rose accent (in `@theme`) |
| `--color-sage` | `#2f4f37` | Formation accent (in `@theme`) |

**Shared**
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-ink` | `#16130e` | Primary text |
| `--color-ink-soft` | `#3a342c` | Secondary text |
| `--color-paper` | `#f3eee4` | Page background |
| `--color-paper-deep` | `#e7dfd0` | Section bands |
| `--color-rule` | `#b8943e` | Gold (rules, focus, CTAs) |
| `--color-rule-soft` | `#d4ad42` | Gold highlight |
| `--color-cream` | `#f8f5ef` | Card/surface fills |

### Motion Utilities (all `transform`/`opacity` only, reduced-motion compliant)

| Utility | Description |
|---------|-------------|
| `.rise-in` + `.d1`–`.d4` | `cubic-bezier(0.22,1,0.36,1)` entrance, 0.08s stagger, `@keyframes rise-in` |
| `.hero-ken-burns` | 20s slow zoom (`scale 1 → 1.06`) |
| `.bloom-drift` | 14s subtle parallax (`translateY + scale`, infinite alternate) |
| `.card-lift` | Hover lift (`translateY(-3px)`) |
| `.gold-rule` | `scaleX(0→1)` draw on `.group:hover` |
| `.drawer-in` | 260ms slide (`translateY(-6px)` + opacity) |

All gated by `@media (prefers-reduced-motion: reduce)` → durations = `0.01ms` (see `src/app/globals.css`).

## Database Schema

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `audit_sites` | Parish metadata | `slug`, `name`, `themeColor`, `overallScore`, `heroImage` |
| `audit_criteria` | 10 scoring dimensions | `slug`, `name`, `description`, `sortOrder` |
| `audit_scores` | Site×criterion scores | `siteId`, `criterionId`, `score`, `notes` |
| `audit_findings` | Audit findings ledger | `siteSlug` (nullable=shared), `severity`, `title`, `evidence`, `recommendation`, `confidence` |
| `audit_palette_tokens` | Design tokens per site | `siteId`, `token`, `hex`, `usage`, `groupName`, `sortOrder` |
| `audit_reviews` | Visitor submissions | `reviewerName`, `preferredSite`, `visualScore`, `uxScore`, `a11yScore`, `comment`, `createdAt` |

## API Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/reviews` | POST | ❌ (rate-limited) | Submit review (name, site, 3× scores 1–10, comment 12–800 chars) — 5 req/min per IP, then `429` + `Retry-After`. Enforcement is best-effort across instances (in-memory limiter; live-verified multi-instance deployment) |
| `/api/health` | GET | ❌ | DB connectivity check (`select 1`) |
| `/api/audit` | GET | ❌ | Full audit JSON (sites, criteria, scores, findings, tokens, reviews) |

**Response envelope** (as implemented):

```jsonc
// Success — payload key names the resource
{ "ok": true, "audit": T }   // GET /api/audit
{ "ok": true, "review": T }  // POST /api/reviews (201)
{ "ok": true }               // GET /api/health
// Error
{ "error": "string" }        // 400 validation, body varies by route
{ "ok": false }              // GET /api/health on DB failure (500)
{ "ok": false, "error": "string" } // GET /api/audit on failure (500)
// Rate limited (POST /api/reviews)
{ "error": "Too many reviews from this address. Try again shortly." } // 429 + Retry-After header
```

## Commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (`npx next dev --webpack` if Turbopack panics) |
| Type check | `npm run typecheck` |
| Lint | `npm run lint` |
| Tests (unit/component) | `npm test` (Vitest, once-off) · `npm run test:watch` |
| Build | `npm run build` |
| DB: setup (fresh clone → prod) | `npm run db:setup` (= `db:generate` + `db:migrate` + `db:seed`) |
| DB: generate migration | `npm run db:generate` (`drizzle-kit generate`) |
| DB: apply migrations | `npm run db:migrate` (`drizzle-kit migrate`) |
| DB: seed (idempotent) | `npm run db:seed` (`tsx src/scripts/seed.ts` via `ensureSeeded()`) |
| DB: studio (GUI) | `npm run db:studio` (`drizzle-kit studio`) |
| DB: push schema (dev, no migration file) | `npm run db:push` (`drizzle-kit push`) |

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Requirements

- PostgreSQL instance accessible via `DATABASE_URL`
- Node.js 22+ runtime
- Static assets served from `.next/static/`

### Platform Notes

- **Vercel**: Zero-config; set `DATABASE_URL` in project settings
- **Cloudflare Pages/Workers**: Use `@cloudflare/next-on-pages` adapter; D1 not supported (requires PostgreSQL)
- **Docker**: Multi-stage build with `node:22-alpine` base; copy `.next/standalone` for minimal image

### Security Headers

`next.config.ts` emits `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and a baseline CSP (`default-src 'self'`, `frame-ancestors 'none'`) on every route. CSP uses `'unsafe-inline'` for scripts/styles because Next's inline bootstrap requires it without a nonce middleware — strict nonce-based CSP is future work (see `docs/CODE_AUDIT_2026-09-07.md`).

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Fresh clone — how to init DB for production? | `cp .env.example .env.local` → set `DATABASE_URL` → `sudo docker compose up -d` (or point to managed Postgres) → `npm run db:setup` (generate + migrate + seed, idempotent). Verify `GET /api/health` → `{ok:true}` and `GET /api/audit` → 2 sites. |
| `npm run build` fails / pages show "DATABASE_URL is required" at **runtime** | Build itself does NOT need DB (`force-dynamic` skips `getFullAudit()` at build). Runtime does — ensure `DATABASE_URL` in `.env.local` matches `docker-compose.yml` (`nave_spire_dev`). Check `GET /api/health` — see `src/app/error.tsx` fallback for DB hint. |
| `next build`/`next dev` panics `FileSystemPath … mattpocok-skills` | **Fixed v1.2.0.** Root cause was committed machine-local `skills/` symlinks escaping the repo root (Tailwind v4 auto-detection → Turbopack root-escape). `globals.css` now scopes detection to `src/` (`source("../")`) and the link names are gitignored — recreate local links with `ln -s` if needed; they stay untracked. Guard: `src/regression/repo-hygiene.test.ts`. |
| ~~`npm run lint` shows warnings from `/skills/` directory~~ | **Resolved v1.2.0** — `skills/**` is vendored agent tooling, now in `eslint.config.mjs` `globalIgnores`. `npm run lint` is 0 errors / 0 warnings. |
| `POST /api/reviews` returns `429` | Rate limit reached (5 req/min per IP, in-memory per instance). Wait for the `Retry-After` window. Behind serverless multi-instance, use a shared store for global limits. Enforcement is best-effort across instances — live-verified 2026-09-08 (see `docs/CODE_AUDIT_2026-09-08.md` M-A). |
| Page returns empty data on fresh DB | Ensure `ensureSeeded()` runs — it's called by `getFullAudit()`. Check DB connectivity. |
| Motion doesn't respect `prefers-reduced-motion` | All animations use transform/opacity only. Verify CSS in `globals.css` uses `@media (prefers-reduced-motion: reduce)`. |
| Fonts not loading in production | `next/font` self-hosts at build time. Ensure `npm run build` completes without network errors. |

## License

MIT — see `LICENSE` (if present) or project root.

## References

- **CLAUDE.md** — Full implementation standards, architecture, anti-patterns for AI agents
- **AGENTS.md** — Compact agent onboarding instructions
- `docs/CODE_AUDIT_2026-09-07.md` — Session 2–3 tiered audit + remediation evidence
- `docs/CODE_AUDIT_2026-09-08.md` — Session 5 deep audit + live E2E re-validation
- `src/lib/audit-data.ts` — Source of truth for all scores, findings, palette tokens
- `src/app/globals.css` — Design system (`@theme` tokens, motion utilities)
- `drizzle.config.ts` (env-aware, reads `DATABASE_URL`) + `drizzle.config.json` (fallback) — DB dialect + schema location; `drizzle/` holds committed migrations
- `src/scripts/seed.ts` — standalone seeder (`ensureSeeded()`) for `npm run db:seed` / `db:setup`
