# AGENTS.md — Nave & Spire

Compact instructions for AI agents working in this repo.

## Quick Reference

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
No arbitrary Tailwind values. Extend `@theme` instead. Key tokens:
- Fonts: `--font-display` (Syne), `--font-body` (Newsreader), `--font-sans` (Figtree), `--font-fraunces`, `--font-cormorant`, `--font-source`
- Colors: `--color-bsc`/`--color-bsc-deep` (sapphire), `--color-oll`/`--color-oll-deep` (Marian blue), `--color-rule` (gold), `--color-ink`, `--color-paper`
- Shadow: `--shadow-journal`

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

**Required**: `DATABASE_URL` in `.env.local` (gitignored).  
Example: `postgresql://postgres:postgres@127.0.0.1:5432/app_db`  
Update to match your Postgres instance. Production needs `?sslmode=require`.

## Common Gotchas

- **Build fails without DB** — `npm run build` runs `getFullAudit()` at build time. Set `DATABASE_URL` or use a dummy DB for CI.
- **ESLint warnings from `skills/`** — `npm run lint` shows warnings from `/skills/` directory (not project code). Ignore.
- **Motion = transform/opacity only** — All CSS animations in `globals.css` use transform/opacity for `prefers-reduced-motion` compliance. Do not add keyframes that can't be reduced.
- **Confidence tags on findings** — `audit-data.ts` findings carry `confidence: "verified" | "reasoned" | "assumed"`. Preserve when adding findings.
- **Gold is shared** -- `--color-rule` `#d4ad42` is identical for both sites. Do not "uniquify" it.

## Commands That Differ From Defaults

- `npm run typecheck` → `tsc --noEmit` (not `tsc`)
- `npm run lint` → `eslint .` (flat config, extends Next.js core-web-vitals)
- No `npm test`, `npm run test:watch`, etc.
- Drizzle Kit commands via `npx` (not a script)

## References

- `CLAUDE.md` — Full implementation standards, architecture, anti-patterns
- `src/lib/audit-data.ts` — Source of truth for all scores, findings, palette tokens
- `src/app/globals.css` — Design system (@theme tokens, motion utilities)
- `drizzle.config.json` — DB dialect + schema location