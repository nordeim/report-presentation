# AGENTS.md — Nave & Spire

Compact instructions for AI agents working in this repo.

## Quick Reference

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (`npx next dev --webpack` if Turbopack panics) |
| Type check | `npm run typecheck` |
| Lint | `npm run lint` |
| Tests | `npm test` (Vitest one-shot) / `npm run test:watch` |
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
All `src/app/**/page.tsx` are RSC. Use `'use client'` **only** for interactivity (state, clipboard, router.refresh) plus the `src/app/error.tsx` boundary. Current client components:
- `FindingsBoard` — filter state
- `CopySwatch` — clipboard copy
- `ReviewForm` — form + `router.refresh()`
- `error.tsx` — error boundary (DB-aware hint)

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
- Colors (primitives): `--color-bsc`/`--color-bsc-deep` (sapphire), `--color-oll`/`--color-oll-deep` (Marian blue), `--color-rule`/`--color-rule-soft` (gold), `--color-ink`/`--color-ink-soft`, `--color-paper`/`--color-paper-deep`, `--color-rose`, `--color-sage`, `--color-cream`, `--color-high-sev`, `--color-gold-700` — full tints (sapphire-300 etc.) live as data in `audit-data.ts` (18 tokens/site)
- Shadow: `--shadow-journal`
- Motion utilities (all transform/opacity only): `.rise-in` (+ `.d1`–`.d4` stagger), `.hero-ken-burns` (20s), `.bloom-drift` (14s), `.card-lift`, `.gold-rule`, `.drawer-in` — plus `.bg-grain`, `.gold-hairline`, `.weave`

### 5. Test suite (Vitest + RTL)
`npm test` runs 29 unit/component/regression tests (`vitest run`). Co-locate `*.test.ts(x)` next to the module: `src/lib/format.test.ts`, `src/db/schema.test.ts` (pins schema ≡ `drizzle/0000_wise_gateway.sql`), `src/lib/server/rate-limit.test.ts`, `src/regression/docs-drift.test.ts` (retired-identifier guard), `src/regression/repo-hygiene.test.ts` (build-portability contracts — see Gotchas), `src/regression/docs-contract.test.ts` (living-docs sync — see References). E2E: browser passes are manual/playwright — see `docs/CODE_AUDIT_2026-09-08.md`. New logic ships with tests (red → green).

### 6. TypeScript strict = enforced
`strict: true`, `noEmit: true`, `isolatedModules: true`. Never use `any`. Prefer `interface` for object shapes. Explicit `Promise<>` returns on exported async functions.

### 7. Path alias `@/*` → `./src/*`
Use `@/components`, `@/lib`, `@/db` — not relative `../../`.

## Architecture (non-obvious)

```
src/
├── app/                    # App Router pages + API routes
│   ├── api/                # /reviews (POST, rate-limited), /health (GET), /audit (GET)
│   ├── compare|findings|palettes|reviews|method/  # feature pages
│   ├── error.tsx           # 'use client' error boundary (DB-aware)
│   ├── not-found.tsx       # 404 Folio not found
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
│   ├── index.ts            # Pool singleton (globalThis) + drizzle instance
│   ├── schema.ts           # 6 tables: sites, criteria, scores, findings, palette_tokens, reviews
│   └── schema.test.ts      # Pins schema ≡ committed migration
├── lib/
│   ├── queries.ts          # getFullAudit(), insertReview()
│   ├── seed.ts             # ensureSeeded() — idempotent, race-safe
│   ├── format.ts           # Pure formatters (score, severity, contrast)
│   ├── server/rate-limit.ts# Per-IP fixed-window limiter for POST /api/reviews
│   └── audit-data.ts       # ALL seed constants (sites, criteria, scores, findings, palettes)
├── regression/
│   └── docs-drift.test.ts  # Retired-identifier scan (maison_dev guard)
└── scripts/seed.ts         # Standalone seeder (db:seed / db:setup)
```

## Environment

**Required**: `DATABASE_URL` in `.env.local` (gitignored). Copy `.env.example` to start.  
Local dev (docker compose): `postgresql://nave_spire_user:nave_spire_secret@127.0.0.1:5432/nave_spire_dev` — must match `docker-compose.yml` / `drizzle.config.ts`.  
Alternative plain postgres: `postgresql://postgres:postgres@127.0.0.1:5432/app_db`.  
Production needs `?sslmode=require`. For fresh DB (clone → prod): `cp .env.example .env.local` → set `DATABASE_URL` → `sudo docker compose up -d` (or managed Postgres) → `npm run db:setup`.

## Common Gotchas

- **Build does NOT require DB** — All data pages are `force-dynamic`, so `npm run build` skips `getFullAudit()` and succeeds even with `DATABASE_URL` unreachable. **Runtime** does require DB — check `GET /api/health` and see `src/app/error.tsx` fallback.
- **Commit everything the deploy needs** — `src/db/` once shipped only in the deploy workspace and the fresh-clone build broke (see `docs/CODE_AUDIT_2026-09-07.md` C1). Pre-ship on a fresh clone: `npm ci && npm test && npm run typecheck && npm run build`.
- **`POST /api/reviews` is rate-limited** — 5 req/min per IP via `src/lib/server/rate-limit.ts`; over the limit returns `429` + `Retry-After`. The limiter is in-memory per instance, so enforcement is best-effort across instances — live-verified 2026-09-08 that the deployed host may answer from more than one instance, and a clean 6-request burst can slip through (docs/CODE_AUDIT_2026-09-08.md M-A).
- **Security headers live in `next.config.ts`** — X-Frame-Options/nosniff/Referrer-Policy/Permissions-Policy/CSP. Don't remove `frame-ancestors 'none'`.
- **Never commit machine-local `skills/` symlinks or `.env.local`** — the 15 `skills/<name>` links point at absolute host paths outside the repo; where they resolve, Tailwind v4 auto-detection follows them and Turbopack panics (`FileSystemPath … leaves the filesystem root` — fatal in `next build` AND `next dev`, see AP-9 in the SKILL). Their names are gitignored (recreate locally with `ln -s`); `.env.*` is gitignored too; `src/regression/repo-hygiene.test.ts` fails if either is ever tracked again.
- **ESLint is 0 errors / 0 warnings** — `skills/**` is vendored agent tooling and lives in `eslint.config.mjs` `globalIgnores`. Don't lint it; don't remove the ignore.
- **Motion = transform/opacity only** — All CSS animations in `globals.css` (`.rise-in`, `.hero-ken-burns`, `.bloom-drift`, `.card-lift`, `.gold-rule`, `.drawer-in`) use transform/opacity for `prefers-reduced-motion` compliance (killed to `0.01ms` under `@media (prefers-reduced-motion: reduce)`). Do not add keyframes that use layout properties (width/height).
- **Confidence tags on findings** — `audit-data.ts` findings carry `confidence: "verified" | "reasoned" | "assumed"`. Preserve when adding findings.
- **Gold is shared** -- `--color-rule` `#d4ad42` is identical for both sites. Do not "uniquify" it.

## Commands That Differ From Defaults

- `npm run typecheck` → `tsc --noEmit` (not `tsc`)
- `npm run lint` → `eslint .` (flat config, extends Next.js core-web-vitals)
- `npm test` → `vitest run` (29 unit/component/regression tests); `npm run test:watch` for watch mode
- DB: `npm run db:setup` is the one-shot fresh-clone init (`generate` + `migrate` + `seed` via `src/scripts/seed.ts`); individual steps are `db:generate`/`db:migrate`/`db:seed`
- `drizzle.config.ts` is env-aware (reads `DATABASE_URL` via `dotenv`); `drizzle.config.json` is the fallback

## References

- `CLAUDE.md` — Full implementation standards, architecture, anti-patterns
- `docs/CODE_AUDIT_2026-09-07.md` — Session 2–3 tiered audit + E2E findings + remediation evidence
- `docs/CODE_AUDIT_2026-09-08.md` — Session 5 deep audit (live E2E re-validation; M-A rate-limit truth, M-B living-doc drift remediated via `src/regression/docs-contract.test.ts`)
- `src/lib/audit-data.ts` — Source of truth for all scores, findings, palette tokens
- `src/app/globals.css` — Design system (@theme tokens, motion utilities)
- `drizzle.config.ts` (env-aware) + `drizzle.config.json` (fallback) + `drizzle/` (committed migrations) — DB dialect + schema location
- `src/scripts/seed.ts` — standalone seeder for `db:seed` / `db:setup`
