# AGENTS.md — Nave & Spire

Compact instructions for AI agents working in this repo.

## Quick Reference

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (`npx next dev --webpack` if Turbopack panics) |
| Type check | `npm run typecheck` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| DB: setup (fresh clone → prod) | `npm run db:setup` (= `db:generate` + `db:migrate` + `db:seed`) |
| DB: generate migration | `npm run db:generate` |
| DB: apply migrations | `npm run db:migrate` |
| DB: seed (idempotent) | `npm run db:seed` |
| DB: studio (GUI) | `npm run db:studio` |

## Repo Identity

**Nave & Spire** — Design audit journal comparing two Singapore parish sites (BSC, OLL).  
Stack: Next.js 16 (App Router), React 19, TypeScript 5.9 strict, Tailwind CSS v4 `@theme`, Drizzle ORM + PostgreSQL.

## Critical Conventions

### 1. Server Components by default
All `src/app/**/page.tsx` are RSC. Use `'use client'` **only** for interactivity (state, clipboard, router.refresh). Current client components:
- `FindingsBoard` — filter state
- `CopySwatch` — clipboard copy
- `ReviewForm` — form + `router.refresh()`

### 2. Force-dynamic on every data page
Every page fetching from DB exports:
```ts
export const dynamic = "force-dynamic"
```
Required because `getFullAudit()` calls `ensureSeeded()` which writes on first request.

### 3. Auto-seeding is mandatory
All queries route through `ensureSeeded()` in `src/lib/queries.ts`. Fresh DB = empty tables → seed runs on first query. **Never bypass** — direct `db.select()` without seeding will return empty results.

### 4. Design tokens live in `globals.css @theme`
No arbitrary Tailwind **colors** outside `@theme`. Editorial type scale (`text-[0.62rem]`, `tracking-[0.16em]`) is intentional and exempt. For colors/spacing/shadows, extend `@theme` instead. Key tokens:
- Fonts: `--font-display` (Syne), `--font-body` (Newsreader), `--font-sans` (Figtree), `--font-fraunces`, `--font-cormorant`, `--font-source`
- Colors (primitives): `--color-bsc`/`--color-bsc-deep` (sapphire), `--color-oll`/`--color-oll-deep` (Marian blue), `--color-rule`/`--color-rule-soft` (gold), `--color-ink`/`--color-ink-soft`, `--color-paper`/`--color-paper-deep`, `--color-rose`, `--color-sage`, `--color-cream` — full tints (sapphire-300 etc.) live as data in `audit-data.ts` (18 tokens/site)
- Shadow: `--shadow-journal`
- Motion utilities (all transform/opacity only): `.rise-in` (+ `.d1`–`.d4` stagger), `.hero-ken-burns` (20s), `.bloom-drift` (14s), `.card-lift`, `.gold-rule`, `.drawer-in` — plus `.bg-grain`, `.gold-hairline`, `.weave`

### 5. No test suite (yet)
`npm test` does not exist. When adding tests: Vitest + RTL for components, Playwright for E2E. Co-locate `*.test.tsx` next to component.

### 6. TypeScript strict = enforced
`strict: true`, `noEmit: true`, `isolatedModules: true`. Never use `any`. Prefer `interface` for object shapes. Explicit `Promise<>` returns on exported async functions.

### 7. Path alias `@/*` → `./src/*`
Use `@/components`, `@/lib`, `@/db` — not relative `../../`.

## Architecture (non-obvious)

```
src/
├── app/                    # App Router pages + API routes
│   ├── api/                # /reviews (POST), /health (GET), /audit (GET)
│   ├── compare|findings|palettes|reviews|method/  # feature pages
│   ├── globals.css         # Tailwind v4 @theme + motion utilities
│   ├── layout.tsx          # Root: fonts, Masthead, StudioFooter
│   └── page.tsx            # Home: hero, verdict, score bars, IA, type
├── components/             # Mixed RSC + client
│   ├── Masthead.tsx        # Sticky header, nav
│   ├── StudioFooter.tsx    # Footer, links, disclaimer
│   ├── ScoreBar.tsx        # Visual comparison bar (RSC)
│   ├── FindingsBoard.tsx   # Filterable list ('use client')
│   ├── CopySwatch.tsx      # Token card + clipboard ('use client')
│   └── ReviewForm.tsx      # Submission form ('use client')
├── db/
│   ├── index.ts            # Pool singleton + drizzle instance
│   └── schema.ts           # 6 tables: sites, criteria, scores, findings, palette_tokens, reviews
└── lib/
    ├── queries.ts          # getFullAudit(), insertReview()
    ├── seed.ts             # ensureSeeded() — idempotent, race-safe
    ├── format.ts           # Pure formatters (score, severity, contrast)
    └── audit-data.ts       # ALL seed constants (sites, criteria, scores, findings, palettes)
```

## Environment

**Required**: `DATABASE_URL` in `.env.local` (gitignored). Copy `.env.example` to start.  
Local dev (docker compose): `postgresql://nave_spire_user:nave_spire_secret@127.0.0.1:5432/nave_spire_dev` — must match `docker-compose.yml` / `drizzle.config.ts`.  
Alternative plain postgres: `postgresql://postgres:postgres@127.0.0.1:5432/app_db`.  
Production needs `?sslmode=require`. For fresh DB (clone → prod): `cp .env.example .env.local` → set `DATABASE_URL` → `sudo docker compose up -d` (or managed Postgres) → `npm run db:setup`.

## Common Gotchas

- **Build does NOT require DB** — All data pages are `force-dynamic`, so `npm run build` skips `getFullAudit()` and succeeds even with `DATABASE_URL` unreachable. **Runtime** does require DB — check `GET /api/health` and see `src/app/error.tsx` fallback.
- **ESLint warnings from `skills/`** — `npm run lint` shows warnings from `/skills/` directory (not project code). Ignore.
- **Motion = transform/opacity only** — All CSS animations in `globals.css` (`.rise-in`, `.hero-ken-burns`, `.bloom-drift`, `.card-lift`, `.gold-rule`, `.drawer-in`) use transform/opacity for `prefers-reduced-motion` compliance (killed to `0.01ms` under `@media (prefers-reduced-motion: reduce)`). Do not add keyframes that use layout properties (width/height).
- **Confidence tags on findings** — `audit-data.ts` findings carry `confidence: "verified" | "reasoned" | "assumed"`. Preserve when adding findings.
- **Gold is shared** -- `--color-rule` `#d4ad42` is identical for both sites. Do not "uniquify" it.

## Commands That Differ From Defaults

- `npm run typecheck` → `tsc --noEmit` (not `tsc`)
- `npm run lint` → `eslint .` (flat config, extends Next.js core-web-vitals)
- No `npm test`, `npm run test:watch`, etc.
- DB: `npm run db:setup` is the one-shot fresh-clone init (`generate` + `migrate` + `seed` via `src/scripts/seed.ts`); individual steps are `db:generate`/`db:migrate`/`db:seed`
- `drizzle.config.ts` is env-aware (reads `DATABASE_URL` via `dotenv`); `drizzle.config.json` is the fallback

## References

- `CLAUDE.md` — Full implementation standards, architecture, anti-patterns
- `src/lib/audit-data.ts` — Source of truth for all scores, findings, palette tokens
- `src/app/globals.css` — Design system (@theme tokens, motion utilities)
- `drizzle.config.ts` (env-aware) + `drizzle.config.json` (fallback) + `drizzle/` (committed migrations) — DB dialect + schema location
- `src/scripts/seed.ts` — standalone seeder for `db:seed` / `db:setup`
