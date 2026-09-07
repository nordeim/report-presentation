# Nave & Spire

![Next.js](https://img.shields.io/badge/Next.js-16.2.6-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.6-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.17-06B6D4?logo=tailwindcss&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-0.45.2-C5F74F?logo=drizzle&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)

A design audit journal comparing two Singapore parish websites — **Church of the Blessed Sacrament (BSC)** and **Church of Our Lady of Lourdes (OLL)** — across ten evidence-backed criteria. Scores are derived from source tokens, components, and information architecture, not from rendered screenshots.

## Overview

Nave & Spire is a Next.js 16 web application that presents a structured, evidence-backed comparison of two parish websites built on the same component scaffold. It surfaces where the fork diverges (typography, colour identity, accent tokens, information architecture choices) and where it does not (radii, motion system, layout primitives). The journal includes a findings ledger with confidence-tagged entries, a side-by-side score comparison, interactive palette swatches, and a visitor review system.

## Key Features

| Feature | Description |
|---------|-------------|
| 📊 **Side-by-side Comparison** | Ten criteria scored 0–10 with delta, per-site rationale, and visual score bars |
| 🔍 **Findings Board** | Filterable ledger by severity (high/medium/low/info) and scope (BSC/OLL/shared) |
| 🎨 **Palette Explorer** | 33 tokens per site with copy-to-clipboard, grouped by semantic role (Surface, Ink, Blue, Gold, Accent) |
| ✍️ **Visitor Reviews** | Submit Visual/UX/A11y scores (1–10) with comments; persisted to PostgreSQL |
| 📖 **Methodology Page** | Documents sources, scoring approach, confidence levels, and what would raise confidence |
| ♿ **Accessibility-First** | Skip link, gold focus ring (2px/3px offset), `prefers-reduced-motion` kill-switch, drawer focus trap |

## Architecture

### Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js (App Router) | 16.2.6 | RSC, routing, API routes |
| UI | React | 19.2.6 | Component model |
| Language | TypeScript | 5.9.3 | Strict mode, no `any` |
| Styling | Tailwind CSS | 4.1.17 | CSS-first `@theme` config |
| Database | PostgreSQL | 17 | Primary data store |
| ORM | Drizzle ORM | 0.45.2 | Type-safe queries, migrations |
| Fonts | next/font | 16.2.6 | Self-hosted Google Fonts (6 families) |
| Images | next/image | 16.2.6 | Optimized, priority-loaded heroes |

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

## File Hierarchy

```
📂 src/
├── 📂 app/                          # Next.js App Router
│   ├── 📂 api/                      # Route handlers
│   │   ├── 📂 reviews/route.ts      # POST /api/reviews (submit review)
│   │   ├── 📂 health/route.ts       # GET /api/health (DB check)
│   │   └── 📂 audit/route.ts        # GET /api/audit (full JSON export)
│   ├── 📂 compare/page.tsx          # Side-by-side score comparison
│   ├── 📂 findings/page.tsx         # Filterable findings board
│   ├── 📂 palettes/page.tsx         # Token swatches with copy
│   ├── 📂 reviews/page.tsx          # Visitor scoreboard + form
│   ├── 📂 method/page.tsx           # Methodology & sources
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
│   ├── 📄 index.ts                  # Pool singleton + drizzle instance
│   └── 📄 schema.ts                 # 6 tables (sites, criteria, scores, findings, palette_tokens, reviews)
└── 📂 lib/                          # Business logic
    ├── 📄 queries.ts                # getFullAudit(), insertReview()
    ├── 📄 seed.ts                   # ensureSeeded() — idempotent, race-safe
    ├── 📄 format.ts                 # Pure formatters (score, severity, contrast)
    └── 📄 audit-data.ts             # ALL seed constants (sites, criteria, scores, findings, palettes)
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
# Edit .env.local: set DATABASE_URL to your PostgreSQL instance

# 3. (Optional) Run migrations explicitly
# Otherwise auto-seeding runs on first request
npx drizzle-kit generate
npx drizzle-kit migrate

# 4. Start development server
npm run dev
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
| `DATABASE_URL` | ✅ | PostgreSQL connection string | `postgresql://postgres:postgres@127.0.0.1:5432/app_db` |

**Production**: Add `?sslmode=require` to connection string.

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
| Sapphire 50–950 | Scale | Full range in `@theme` |

**OLL — Marian Blue**
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-oll` | `#2c4a8e` | Primary Marian blue |
| `--color-oll-deep` | `#0a1428` | Hero/footer background |
| Blue 50–950 | Scale | Full range in `@theme` |
| `--color-rose` | `#8a4a5f` | Mystical Rose accent |
| `--color-sage` | `#2f4f37` | Formation accent |

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

### Motion Utilities (transform/opacity only, reduced-motion compliant)

| Utility | Description |
|---------|-------------|
| `.rise-in` | Cubic-bezier entrance with stagger delays `d1`–`d4` |
| `.hero-ken-burns` | 20s slow zoom on hero images |
| `.bloom-drift` | 14s subtle parallax |
| `.card-lift` | Hover lift on cards |
| `.gold-rule` | Width animation on hover |
| `.drawer-in` | Mobile nav slide-in |

All gated by `@media (prefers-reduced-motion: reduce)` → durations = 0.01ms.

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
| `/api/reviews` | POST | ❌ | Submit review (name, site, 3× scores 1–10, comment 12–800 chars) |
| `/api/health` | GET | ❌ | DB connectivity check (`select 1`) |
| `/api/audit` | GET | ❌ | Full audit JSON (sites, criteria, scores, findings, tokens, reviews) |

**Response envelope**:
```json
// Success
{ "ok": true, "data": T }
// Error
{ "ok": false, "error": "string" }
```

## Commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` |
| Type check | `npm run typecheck` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| DB: generate migration | `npx drizzle-kit generate` |
| DB: apply migrations | `npx drizzle-kit migrate` |
| DB: studio (GUI) | `npx drizzle-kit studio` |
| DB: push schema (dev) | `npx drizzle-kit push` |

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

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm run build` fails with "DATABASE_URL is required" | Set `DATABASE_URL` in `.env.local` or CI secrets; build runs `getFullAudit()` at compile time |
| `npm run lint` shows warnings from `/skills/` directory | Expected — warnings come from tracked `skills/` folder, not project code. Ignore. |
| Page returns empty data on fresh DB | Ensure `ensureSeeded()` runs — it's called by `getFullAudit()`. Check DB connectivity. |
| Motion doesn't respect `prefers-reduced-motion` | All animations use transform/opacity only. Verify CSS in `globals.css` uses `@media (prefers-reduced-motion: reduce)`. |
| Fonts not loading in production | `next/font` self-hosts at build time. Ensure `npm run build` completes without network errors. |

## License

MIT — see `LICENSE` (if present) or project root.

## References

- **CLAUDE.md** — Full implementation standards, architecture, anti-patterns for AI agents
- **AGENTS.md** — Compact agent onboarding instructions
- `src/lib/audit-data.ts` — Source of truth for all scores, findings, palette tokens
- `src/app/globals.css` — Design system (`@theme` tokens, motion utilities)
- `drizzle.config.json` — DB dialect + schema location