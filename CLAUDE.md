---
IMPORTANT: File is read fresh for every conversation. Be brief and practical.
---

# Nave & Spire

A design audit journal comparing two Singapore parish websites — Church of the Blessed Sacrament (BSC) and Church of Our Lady of Lourdes (OLL) — across ten evidence-backed criteria. Scores are derived from source tokens, components, and information architecture, not from rendered screenshots.

**Tech Stack**: Next.js 16 (App Router), React 19, TypeScript 5.9 (strict), Tailwind CSS v4 (CSS-first @theme), Drizzle ORM 0.45 + PostgreSQL, next/font, next/image.

**Maintainer**: Solo project (nordeim). Deployed on Vercel/Cloudflare with managed PostgreSQL.

## Foundational Principles

### Meticulous Approach (Six-Phase Workflow)

Follow this six-phase workflow for all implementation tasks:

1. **ANALYZE** - Deep, multi-dimensional requirement mining
   - Never make surface-level assumptions
   - Identify explicit requirements, implicit needs, and potential ambiguities
   - Explore multiple solution approaches
   - Perform risk assessment

2. **PLAN** - Structured execution roadmap
   - Create detailed plan with sequential phases
   - Present plan for explicit user confirmation
   - Never proceed without validation

3. **VALIDATE** - Explicit confirmation checkpoint
   - Obtain explicit user approval before implementation
   - Address any concerns or modifications

4. **IMPLEMENT** - Modular, tested, documented builds
   - Set up proper environment
   - Implement in logical, testable components
   - Create documentation alongside code

5. **VERIFY** - Rigorous QA against success criteria
   - Execute comprehensive testing
   - Review for best practices, security, performance
   - Consider edge cases and accessibility

6. **DELIVER** - Complete handoff with knowledge transfer
   - Provide complete solution with instructions
   - Document challenges and solutions
   - Suggest improvements and next steps

### Project-Specific Principles

- **Source over screenshot**: Scores and findings are reasoned from committed source (CSS tokens, component code, nav structures, READMEs), not from live SPA paint. The live hosts are client-only SPAs; first paint is an empty `<div id="root"></div>`.
- **Shared scaffold, distinct identity**: Both parish sites share a component/design system. This journal's value is in surfacing where the fork diverges (type, blue hue, accent tokens, IA choices) and where it does not (radii, motion, layout primitives).
- **Confidence tagging**: Every finding carries `confidence: "verified" | "reasoned" | "assumed"`. Verified = traceable to source lines. Reasoned = inferred from CSS + docs. Assumed = best guess.
- **No anonymous dumps**: Visitor reviews require a name (2–80 chars) and a substantive note (12–800 chars). Scores are 1–10 integers per dimension (Visual, UX, A11y).
- **Accessibility floor is locked (core)**: Skip link, 2px gold focus ring with 3px offset, `prefers-reduced-motion` kill-switch, semantic landmarks. These contracts must not regress. Drawer focus trap / Escape-to-close / single-open accordion are documented for the upstream parish sites and are aspirational for the journal `Masthead` (currently static) — implement before claiming WCAG AAA parity.

## Implementation Standards

### Next.js 16 (App Router) Specific

- **Server Components by default**: All pages are RSC. Use `'use client'` only for interactivity (filters, forms, clipboard copy).
- **Force-dynamic rendering**: Every data-fetching page exports `export const dynamic = "force-dynamic"` because audit data is seeded at request time and must reflect the latest DB state.
- **Next.js Image**: All images use `<Image />` with `fill` + `object-cover` for hero backgrounds; `priority` on above-the-fold hero.
- **next/font**: Six Google Fonts loaded in `layout.tsx` with CSS variables (`--font-syne`, `--font-newsreader`, etc.) and `display: "swap"`.
- **Route handlers**: API routes under `src/app/api/` (reviews POST, health GET, audit GET). No Server Actions — explicit route handlers for clarity.
- **Metadata API**: `export const metadata` in `layout.tsx` for SEO/JSON-LD.

### TypeScript 5.9 Strict Mode

- `strict: true` in `tsconfig.json` (enforced)
- Never use `any` — prefer `unknown` with narrowing
- Prefer `interface` for object shapes (Drizzle infers `type` for selects)
- Explicit return types on exported async functions (e.g., `Promise<FullAudit>`)
- Path alias `@/*` → `./src/*` (configured in tsconfig)
- `noEmit: true`, `isolatedModules: true`, `moduleResolution: "bundler"`

### Tailwind CSS v4 (CSS-first @theme)

- Design tokens defined in `src/app/globals.css` `@theme` block:
  - Fonts: `--font-display`, `--font-body`, `--font-sans`, `--font-fraunces`, `--font-cormorant`, `--font-source`
  - Colors (primitives): `--color-ink`/`--color-ink-soft`, `--color-paper`/`--color-paper-deep`, `--color-rule`/`--color-rule-soft` (gold `#b8943e`/`#d4ad42`), `--color-bsc`/`--color-bsc-deep`, `--color-oll`/`--color-oll-deep`, `--color-rose`, `--color-sage`, `--color-cream`, `--color-high-sev` (`#8f5038`, high-severity badge), `--color-gold-700` (`#85641c`) — full tints (sapphire-300 etc.) live as data in `audit-data.ts` (18 tokens/site, not 33)
  - Shadow: `--shadow-journal`
- No arbitrary **colors** outside `@theme` — extend `@theme` for colors/spacing/shadows. Editorial type scale (`text-[0.62rem]`, `tracking-[0.16em]`) is intentional and exempt.
- Custom utilities: `.font-display`, `.font-sans`, `.font-fraunces`, `.font-cormorant`, `.font-source`, `.bg-grain`, `.gold-hairline`, `.weave`, plus motion system (`.rise-in`/`.d1`–`.d4`, `.hero-ken-burns`, `.bloom-drift`, `.card-lift`, `.gold-rule`, `.drawer-in` — all transform/opacity only)
- Dark mode: not used (single cream/paper theme)
- Reduced motion: `@media (prefers-reduced-motion: reduce)` disables all animations/transitions (durations → 0.01ms)

### Drizzle ORM + PostgreSQL

- Schema in `src/db/schema.ts` using `pgTable`, `serial`, `varchar`, `text`, `integer`, `real`, `timestamp`
- Relations via `.references(() => table.column)` — no foreign key cascades in schema
- Database connection in `src/db/index.ts` with global `Pool` singleton for dev hot-reload
- Auto-seeding on first query via `ensureSeeded()` in `src/lib/seed.ts` — idempotent, race-safe
- Queries in `src/lib/queries.ts` use `Promise.all` for parallel fetches, then in-memory joins

### React 19 Patterns

- Server Components for data fetching (all pages)
- Client Components only where needed: `FindingsBoard` (filter state), `CopySwatch` (clipboard), `ReviewForm` (form state + router.refresh)
- `useMemo` for derived filter lists (`FindingsBoard`)
- No `useEffect` for data fetching — Server Components handle it
- Form handling: native `<form onSubmit>` + `FormData` + `fetch` to API route

## Development Workflow

### Environment Setup

```bash
# Prerequisites: Node.js 22+, PostgreSQL 17 (local or managed), pnpm (or npm)
cd report-presentation

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local  # Edit DATABASE_URL to point to your Postgres instance
# Local dev (docker compose): DATABASE_URL="postgresql://nave_spire_user:nave_spire_secret@127.0.0.1:5432/nave_spire_dev"
# Must match docker-compose.yml; drizzle.config.ts reads DATABASE_URL from .env.local itself (env-aware) and
# drizzle.config.json is the fallback

# Database: run migrations (or rely on auto-seed)
# Drizzle Kit for migrations:
npx drizzle-kit generate
npx drizzle-kit migrate

# Start development server
npm run dev
```

### Build & Quality Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server (port 3000) |
| `npm run build` | Production build (`.next/`) |
| `npm run start` | Start production server |
| `npm run lint` | ESLint 9 (flat config, Next.js core-web-vitals) |
| `npm run typecheck` | `tsc --noEmit` strict type check |
| `npm test` / `npm run test:watch` | Vitest suite (29 tests) / watch mode |

### Database Commands

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Open Drizzle Studio (GUI)
npx drizzle-kit studio

# Push schema directly (dev only, no migration file)
npx drizzle-kit push
```

## Testing Strategy

**Current state**: Vitest + React Testing Library landed (2026-09-07). `npm test` → `vitest run` (29 tests green, incl. `src/regression/repo-hygiene.test.ts` — build-portability contracts: no tracked symlinks escaping the repo root, `.env.local` untracked, Tailwind scan scoped to `src/`, `skills/**` lint-ignored, `vitest.config.mts`; and `src/regression/docs-contract.test.ts` — living-docs sync: retired doc strings, current test count, `poweredByHeader: false`, no `__dirname` in the Vitest config); `npm run test:watch` for watch mode. Browser E2E was executed manually via agent-browser against the live site (see `docs/CODE_AUDIT_2026-09-07.md` and the 2026-09-08 re-validation in `docs/CODE_AUDIT_2026-09-08.md`); Playwright harness remains optional future work.

### Test Pyramid (as shipped)

| Layer | Tool | Scope | Files |
|-------|------|-------|-------|
| Unit | Vitest | Pure functions in `src/lib/format.ts` (incl. no-raw-hex token rule) | `src/lib/format.test.ts` |
| Schema pin | Vitest | 6 tables ≡ committed migration `drizzle/0000_wise_gateway.sql` | `src/db/schema.test.ts` |
| Unit | Vitest | Per-IP rate limiter (allow/block/window/bounded map) | `src/lib/server/rate-limit.test.ts` |
| Regression | Vitest (node:fs scan) | Retired identifiers never reappear (`maison_dev`) | `src/regression/docs-drift.test.ts` |
| Docs contract | Vitest (node:fs scan + config import) | Living docs stay in sync with code (counts, versions, config pins) | `src/regression/docs-contract.test.ts` |
| E2E | Manual (agent-browser) / future Playwright | Live journeys: pages, filters, clipboard, review submit, validation matrix, a11y floor | `docs/CODE_AUDIT_2026-09-07.md` |

### Test Conventions

- Test files co-located: `Component.test.tsx` / `module.test.ts` next to the code
- New logic ships with tests (red → green → refactor); bug fixes need a failing test first
- Run `npm test` before commits (CI runs it: `.github/workflows/ci.yml` → `npm test`)

## Code Quality Standards

### Linting & Formatting

```bash
# Lint (ESLint 9 flat config)
npm run lint

# Type check
npm run typecheck

# Format (Prettier — not yet configured; add when needed)
# npx prettier --write .
```

**ESLint Config**: `eslint.config.mjs` extends `eslint-config-next/core-web-vitals`. Ignores `.next/`, `out/`, `build/`, `next-env.d.ts`, `skills/**` (vendored agent tooling — lint is 0 errors / 0 warnings).

### Code Style Conventions

- **Early returns**: Guard clauses at top of functions (see `src/app/api/reviews/route.ts`)
- **Component props**: Explicit interfaces (`ScoreBarProps`, `FindingsBoardProps`)
- **Async functions**: Explicit `Promise<>` return types on exports
- **Constants**: `UPPER_SNAKE_CASE` for module-level constants (`SEVERITIES`, `SCOPES`, `LINKS`)
- **CSS classes**: Tailwind utility-first; custom utilities in `@theme` or `globals.css`
- **Imports**: `@/` alias for `src/`; relative imports only within same directory

## Git & Version Control

### Branching Strategy

- `main` — protected, deployable
- Feature branches: `feat/<short-description>` (short-lived, merge within 1–3 days)
- Fix branches: `fix/<short-description>`
- No long-running release branches

### Commit Standards

- Follow Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Atomic commits — one logical change per commit
- Commit messages: imperative mood, reference issue if applicable

## Error Handling & Debugging

### Error Handling Approach

- **API routes**: Validate input early, return 400 with `{ error: string }` for client errors, 500 with `{ error: string }` for server errors
- **Database**: `ensureSeeded()` wraps insert in try/catch with re-check for race conditions
- **Server Components**: `throw new Error(...)` for missing data — Next.js renders `src/app/error.tsx` (DB-aware: shows `docker compose up -d postgres` hint) and `src/app/not-found.tsx` for 404s
- **Client Components**: Toast/status messages via local state (`ReviewForm.status`)

### Debugging Tools

- **Database**: `npx drizzle-kit studio` for visual inspection
- **Logs**: `console.log` in Server Components appears in server terminal; client logs in browser DevTools
- **Network**: Browser DevTools → Network tab for API route inspection
- **React DevTools**: Component tree, props, state for client components

## Communication & Documentation

### Documentation Standards

- Explain "why" in code comments for non-obvious decisions (e.g., `ensureSeeded` race condition handling)
- `README.md` at repo root (currently minimal — expand when onboarding)
- `src/lib/audit-data.ts` contains all seed data + scoring rationale — this is the source of truth for scores
- Method page (`/method`) documents confidence levels and sources for transparency

### In-Code Documentation

- JSDoc not used — rely on TypeScript types and clear naming
- Complex seed data (`SCORE_NOTES`, `FINDING_SEEDS`) has inline comments explaining rationale
- CSS custom properties in `globals.css` are self-documenting via naming (`--color-bsc-sapphire-500`)

## Project-Specific Standards

### Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # Route handlers (POST /reviews rate-limited, GET /health, GET /audit)
│   ├── compare/            # Side-by-side comparison page
│   ├── findings/           # Filterable findings board
│   ├── palettes/           # Token swatches with copy-to-clipboard
│   ├── reviews/            # Visitor scoreboard + submission form
│   ├── method/             # Methodology & sources
│   ├── error.tsx           # 'use client' error boundary, DB-aware (nave_spire_dev hint)
│   ├── not-found.tsx       # 404 Folio not found
│   ├── globals.css         # Tailwind v4 @theme + global styles
│   ├── layout.tsx          # Root layout, fonts, Masthead, StudioFooter
│   └── page.tsx            # Home: hero, verdict, score bars, IA, type, findings preview
├── components/             # React components (mixed RSC + client)
│   ├── Masthead.tsx        # Sticky header, nav links
│   ├── StudioFooter.tsx    # Footer with links, disclaimer
│   ├── ScoreBar.tsx        # Visual score comparison bar (RSC)
│   ├── FindingsBoard.tsx   # Filterable findings list ('use client')
│   ├── CopySwatch.tsx      # Color token card with clipboard ('use client')
│   └── ReviewForm.tsx      # Review submission form ('use client')
├── db/                     # Drizzle ORM
│   ├── index.ts            # Pool singleton (globalThis) + db instance
│   ├── schema.ts           # Tables + inferred types
│   └── schema.test.ts      # Schema ≡ committed migration pin
├── lib/                    # Business logic
│   ├── queries.ts          # DB queries (getFullAudit, insertReview)
│   ├── seed.ts             # Idempotent seeding (ensureSeeded)
│   ├── format.ts           # Pure formatters (score, severity, contrast)
│   ├── format.test.ts      # Unit tests (incl. no-raw-hex token rule)
│   ├── server/rate-limit.ts + .test.ts  # Per-IP fixed-window limiter
│   └── audit-data.ts       # All seed constants: sites, criteria, scores, findings, palettes
├── regression/
│   └── docs-drift.test.ts  # Retired-identifier scan (maison_dev guard)
└── scripts/seed.ts         # Standalone seeder for db:seed / db:setup
```

### API Design

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/reviews` | POST | Submit visitor review (validated: name, site, 3 scores 1–10, comment) — per-IP rate limit 5 req/min → `429` + `Retry-After` |
| `/api/health` | GET | DB connectivity check (`select 1`) |
| `/api/audit` | GET | Full audit JSON (sites, criteria, scores, findings, tokens, reviews) |

**Response Format (as implemented)**:
```typescript
// Success — payload key names the resource
{ ok: true, audit: FullAudit }   // GET /api/audit
{ ok: true, review: Review }     // POST /api/reviews (201)
{ ok: true }                     // GET /api/health
// Errors
{ error: string }                // 400 validation (reviews)
{ ok: false, error: string }     // 500 (audit)
{ ok: false }                    // 500 (health)
{ error: string } + Retry-After  // 429 rate limited (reviews)
```

### Database Schema

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `audit_sites` | Parish metadata | `slug` (unique), `name`, `themeColor`, `overallScore`, `heroImage` |
| `audit_criteria` | 10 scoring dimensions | `slug` (unique), `name`, `description`, `sortOrder` |
| `audit_scores` | Site×criterion scores | `siteId`, `criterionId`, `score`, `notes` |
| `audit_findings` | Audit findings ledger | `siteSlug` (nullable=shared), `severity`, `title`, `evidence`, `recommendation`, `confidence` |
| `audit_palette_tokens` | Design tokens per site | `siteId`, `token`, `hex`, `usage`, `groupName`, `sortOrder` |
| `audit_reviews` | Visitor submissions | `reviewerName`, `preferredSite`, `visualScore`, `uxScore`, `a11yScore`, `comment`, `createdAt` |

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string (required) | `postgresql://user:pass@host:5432/db` |

### Design System Tokens (from `globals.css @theme`)

**Fonts** (CSS variables via next/font):
- `--font-display`: Syne (headlines, issue number)
- `--font-body`: Newsreader (body copy)
- `--font-sans`: Figtree (UI labels, nav, buttons)
- `--font-fraunces`: Fraunces (BSC display)
- `--font-cormorant`: Cormorant Garamond (OLL display)
- `--font-source`: Source Sans 3 (body on both parish sites)

**Colors (BSC — Sapphire)**:
- `--color-bsc` `#3458a8` (primary sapphire)
- `--color-bsc-deep` `#0a1122` (hero/footer background)
- Primitives in `@theme`; full tints (`bsc-sapphire-300 #7a9bdb`, `bsc-gold-400 #d4ad42`, pine/terracotta) live as 18 tokens/site in `audit-data.ts` (`PALETTE_SEEDS`)

**Colors (OLL — Marian Blue)**:
- `--color-oll` `#2c4a8e` (primary Marian blue)
- `--color-oll-deep` `#0a1428` (hero/footer background)
- Primitives in `@theme`; full tints (`oll-blue-300 #7f9fde`, `oll-gold-400 #d4ad42`, rose/sage) live as 18 tokens/site in `audit-data.ts`

**Shared**:
- `--color-ink` `#16130e`, `--color-ink-soft` `#3a342c`
- `--color-paper` `#f3eee4`, `--color-paper-deep` `#e7dfd0`
- `--color-rule` `#b8943e` (gold), `--color-rule-soft` `#d4ad42`
- `--color-cream` `#f8f5ef`

**Shadow**: `--shadow-journal` `0 24px 80px -28px rgba(22,19,14,0.35)`

### Motion System (in `globals.css`)

Utilities — all `transform`/`opacity` only for reduced-motion compliance (gated to `0.01ms` under `@media (prefers-reduced-motion: reduce)`):
- `.rise-in` — `cubic-bezier(0.22, 1, 0.36, 1)` entrance with stagger `.d1`–`.d4` (0.08s steps) via `@keyframes rise-in`
- `.hero-ken-burns` — 20s slow zoom (`scale 1 → 1.06`)
- `.bloom-drift` — 14s subtle parallax (`translateY + scale` infinite alternate)
- `.card-lift` — hover lift (`translateY(-3px)` transition)
- `.gold-rule` — `scaleX(0→1)` draw on `.group:hover`
- `.drawer-in` — 260ms slide (`translateY(-6px)` + opacity)

## Success Metrics

You are successful when:
- Audit data renders correctly across all pages (home, compare, findings, palettes, reviews, method) — requires reachable `DATABASE_URL` at **runtime** (build itself does NOT need DB; `force-dynamic` skips `getFullAudit()` at build)
- Visitor reviews persist to PostgreSQL and appear on `/reviews` after `router.refresh()` — and spam is throttled (429 after 5 req/min/IP)
- TypeScript strict check passes (`npm run typecheck`)
- ESLint passes (`npm run lint`)
- Test suite passes (`npm test` — 29 tests)
- Build succeeds (`npm run build` — succeeds even without DB)
- Security headers present on every response (X-Frame-Options, nosniff, CSP `frame-ancestors 'none'`)
- Accessibility contracts hold: skip link works, focus rings visible, reduced-motion kills all animation; drawer trap / Escape applies to upstream parish drawer (journal `Masthead` is currently static)

## System Integration

### Available Tools (for agents)

- **bash**: Execute terminal operations
- **read**: Read files and directories
- **glob**: Find files by pattern
- **edit**: Make exact string replacements
- **write**: Write files to filesystem
- **agent-browser**: Quick E2E smoke tests, React debugging, Core Web Vitals
- **playwright-cli**: Cross-browser E2E, request inspection, test debugging

## Anti-Patterns to Avoid

- **Don't skip tests** — Vitest is configured (`npm test`); new logic ships with co-located tests, bug fixes need a failing test first
- **Don't use `any`** — the codebase compiles with `strict: true`; keep it that way
- **Don't bypass `ensureSeeded()`** — all queries call it; direct DB access without seeding will fail on fresh DB
- **Don't hardcode colors in components** — use Tailwind classes from `@theme` (`bg-bsc`, `text-oll`, `border-rule`); editorial `text-[0.62rem]` is the one allowed arbitrary. Severity badge colors are tokens too (`bg-high-sev/15 text-high-sev`, `text-gold-700`)
- **Don't add `'use client'` unnecessarily** — Server Components are default; only client for interactivity (plus `error.tsx`)
- **Don't mutate seed data at runtime** — `audit-data.ts` is the source of truth; DB is seeded once from it
- **Don't skip accessibility** — the gold focus ring, skip link, and reduced-motion gate are non-negotiable; drawer trap when you add a drawer
- **Don't assume live SPA paint matches source** — the Method page explicitly documents this limitation
- **Don't remove security headers or the review rate limiter** — `next.config.ts` headers() and `src/lib/server/rate-limit.ts` are audit remediations (docs/CODE_AUDIT_2026-09-07.md M1/M2)

## Continuous Improvement

### Known Gaps (tracked for future work)

1. ~~**No test suite**~~ — Vitest + RTL landed 2026-09-07 (29 tests). Remaining: Playwright E2E harness + API-route integration tests with testcontainers
2. ~~**No `error.tsx` / `not-found.tsx`** — Added in polish pass (`src/app/error.tsx` is DB-aware)~~
3. **No pre-commit hooks** — Add Husky + lint-staged (CI covers lint+typecheck+test+build on push/PR to main)
4. ~~**No CI/CD pipeline** — `.github/workflows/ci.yml` covers lint+typecheck+test+build~~
5. **Image optimization** — Hero images are local `/public/images/*.jpg`; consider next/image remote patterns if migrating to CMS
6. **Analytics/telemetry** — None currently; consider Vercel Analytics or Plausible if needed
7. **Strict CSP nonce** — Current CSP uses `'unsafe-inline'` (Next inline bootstrap); move to nonce-based CSP via middleware
8. **Shared-store rate limiting** — The per-IP limiter is in-memory per instance; enforcement is best-effort across instances, live-verified 2026-09-08 that the deployed host answers from more than one instance (`docs/CODE_AUDIT_2026-09-08.md` M-A). Move to Redis/edge store for a deterministic global limit

### When Extending

- New audit criteria: Add to `CRITERIA_SEEDS` + `SCORE_NOTES` + run `drizzle-kit generate`
- New findings: Add to `FINDING_SEEDS` with proper `confidence` tag
- New pages: Follow pattern — Server Component page + `getFullAudit()` + `'use client'` components only where needed
- New API routes: Follow `/api/reviews` pattern — validate early, typed response, `force-dynamic`
