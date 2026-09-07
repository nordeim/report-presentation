DB initialized, seeded, and fully tested — live via nave_spire_postgres. 
 
### 1. DB Alignment — DONE 
 
All 3 sources now agree on nave_spire_dev: 
 
┌───────────────────────────┬──────────────────────────────────────────────────────────────────────────────┐ 
│ File                      │ Now                                                                          │ 
├───────────────────────────┼──────────────────────────────────────────────────────────────────────────────┤ 
│ docker-compose.yml        │ nave_spire_user:nave_spire_secret@nave_spire_dev (healthy)                   │ 
├───────────────────────────┼──────────────────────────────────────────────────────────────────────────────┤ 
│ .env.local / .env.example │ postgresql://nave_spire_user:nave_spire_secret@127.0.0.1:5432/nave_spire_dev │ 
├───────────────────────────┼──────────────────────────────────────────────────────────────────────────────┤ 
│ drizzle.config.json       │ nave_spire_dev                                                               │ 
└───────────────────────────┴──────────────────────────────────────────────────────────────────────────────┘ 
 
Extensions pgcrypto + pg_trgm verified. 
 
### 2. Schema + Seed — VERIFIED 
 
``` 
  npx drizzle-kit push  → Changes applied (6 tables) 
  getFullAudit() → 2 sites (bsc 8.67 / oll 8.79, 10 scores each, 18 tokens each) 
                  10 criteria · 10 findings (high/medium/low/info) · 36 tokens 
                  health select 1 → {ok:1} · idempotent re-seed OK 
``` 
 
### 3. Quality Gates (with live DB) — ALL GREEN 
 
``` 
  npm run typecheck → exit 0 
  npm run lint      → 0 errors, 12 skills/ warnings (expected) 
  npm run build     → ✓ 8.3s, all routes ƒ dynamic 
``` 
 
### 4. Live API — PASS 
 
┌──────────────────────────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────┐ 
│ Test                                                                             │ Result                                                                              │ 
├──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤ 
│ GET /api/health                                                                  │ 200 {ok:true}                                                                       │ 
├──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤ 
│ GET /api/audit                                                                   │ 200 {ok:true, audit: 2 sites, 10 criteria, 10 findings, 3 reviews}                  │ 
├──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤ 
│ POST /api/reviews 400 cases                                                      │ name <2/>80, comment <12/>800, bad preferredSite, scores ∉ 1–10 — all correctly 400 │ 
├──────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤ 
│ POST valid (3 inserts: Pete Tester bsc 9/8/10, Second Reader tie, Audit Bot oll) │ 201 {ok:true} + psql count(*) = 3 persisted                                         │ 
└──────────────────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────┘ 
 
### 5. Page Rendering — PASS (webpack dev)

│ Note: next dev (Turbopack, default in Next 16) panics on globals.css with FileSystemPath("").join("../mattpocok-skills/...") — a Tailwind v4 + Turbopack dev-only bug scanning siblings of the project root. 
│ Build (next build via Turbopack) succeeds. Workaround is next dev --webpack which passes: 
 
``` 
  / → 200 (77KB, id="main", heroes studi-hero/bsc-tent/oll-spire/nave-light all hit) 
  /compare → 200 (deltas Δ, both parishes) 
  /findings → 200 (high/medium/low/info) 
  /palettes → 200 (18 tokens copy, Surface/Ink/Sapphire/Marian/Gold/Accent) 
  /reviews → 200 (form + 3 reviews visible) 
  /method → 200 
  /this-does-not-exist → 404 "Folio not found." (not-found.tsx) 
  images → 200 image/jpeg 20–23KB each (placeholders now serve) 
  css → .rise-in / hero-ken-burns / bloom-drift / card-lift + focus-visible (23) + prefers-reduced-motion (2) all present 
``` 
 
VALIDATION_REPORT.md updated with full live-test appendix (430 lines). 
 
### Recommendation 
 
- Replace the 4 placeholder JPEGs with real parish photography when available — no code change. 
- Keep next dev --webpack locally until Turbopack upstream fixes the dev scan panic (or pin dev script to next dev --webpack). 
- CI is ready: .github/workflows/ci.yml runs lint + typecheck + build with a dummy DATABASE_URL. 
 
DB is healthy — tell me if you want the dev script pinned to webpack or a production next start smoke on :3000.

---

db:setup landed — fresh-clone → production-ready, verified end-to-end. 
 
### What changed 
 
┌───────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ 
│ File                                  │ Change                                                                                                                                                                │ 
├───────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ package.json                          │ Added 6 scripts: db:generate (drizzle-kit generate), db:migrate (drizzle-kit migrate), db:seed (tsx src/scripts/seed.ts), db:setup = npm run db:generate && npm run   │ 
│                                       │ db:migrate && npm run db:seed, plus db:push/db:studio. Added tsx@4.23.13 to devDependencies (was npx tsx on-demand).                                                  │ 
├───────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ src/scripts/seed.ts                   │ New — idempotent CLI seeder: loads .env.local→.env via dotenv, checks DATABASE_URL (masked log), select 1 health, getFullAudit() (triggers ensureSeeded() → 2 sites,  │ 
│                                       │ 10 criteria, 20 scores, 10 findings, 36 tokens), verifies expected counts, closes pool, exits 0/1 with actionable hints (docker compose up -d, db:generate && migrate │ 
│                                       │ && seed).                                                                                                                                                             │ 
├───────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ drizzle.config.ts                     │ New — env-aware config: loads .env.local/.env via dotenv, reads process.env.DATABASE_URL with fallback nave_spire_dev for generate without DB; out: ./drizzle,        │ 
│                                       │ verbose:true, strict:true. drizzle.config.json kept as fallback.                                                                                                      │ 
├───────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ drizzle/0000_wise_gateway.sql +       │ Generated — first migration (6 tables) via npm run db:generate. Now committed-trackable (.gitignore has db/ but not drizzle/ — so drizzle/ will be committed on next  │ 
│ drizzle/meta/                         │ git add).                                                                                                                                                             │ 
├───────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤ 
│ README.md / AGENTS.md                 │ Quick Start now npm run db:setup (fresh clone → prod), Commands table expanded, Troubleshooting added fresh-clone row + Turbopack note, References now list           │ 
│                                       │ drizzle.config.ts + drizzle/ + src/scripts/seed.ts.                                                                                                                   │ 
└───────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ 
 
### Verification — fresh DB from scratch (the production path) 
 
```bash 
  sudo docker compose down -v          # wipe 
  sudo docker compose up -d            # → nave_spire_postgres healthy, 0 tables 
  npm run db:setup                     # ← the new script 
  # → db:generate: No schema changes, nothing to migrate 😴  (drizzle/ already committed) 
  # → db:migrate: ✓ migrations applied successfully!          (0000_wise_gateway on fresh DB) 
  # → db:seed: → DATABASE_URL nave_spire_dev, ✓ select 1, → Seeding… ✓ Seed OK 116ms 
  #   Sites: 2 (bsc 8.67/oll 8.79) | Criteria: 10 | Findings: 10 | Reviews: 0 
  #   ✓ Counts match 2/10/10/10×2/18×2 → Done. Database is ready for production. 
 
  # idempotent second run 
  npm run db:setup  # → generate no-op, migrate ✓, seed ✓ (still 0 reviews) 
 
  # still green 
  npm run typecheck # 0 
  npm run lint      # 0 errors 
  npm run build     # ✓ 7.9s, all routes ƒ dynamic 
  curl /api/health  # {ok:true} 
``` 
 
For a fresh GitHub clone, the production sequence is now:

```bash 
  git clone <repo> && cd report-presentation 
  npm install 
  cp .env.example .env.local   # set DATABASE_URL (nave_spire_dev or prod ?sslmode=require) 
  sudo docker compose up -d    # or point to managed Postgres 
  npm run db:setup             # generate + migrate + seed — idempotent 
  npm run build && npm start   # or npm run dev -- --webpack 
``` 
 
drizzle/ should be git add’ed on your next commit so generate is a no-op in CI; migrate + seed remain the deterministic production path.

