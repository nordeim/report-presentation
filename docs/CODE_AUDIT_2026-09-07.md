# Nave & Spire — Tiered Code Review + Security Audit (2026-09-07)

Mode: `deep` per `skills/code-review-and-audit` (audit_runner.py deep + native CLI fallbacks for phases the Python scripts could not run). Scope: `src/`, root configs, CI, live deployment `https://nave-spire.jesspete.shop/`. Evidence: every finding cites file/line or command output. Confidence tags per repo convention (Verified = executed and observed).

## Summary (counts by severity)

| Severity | Count | Items |
|----------|-------|-------|
| Critical | 1 | C1 |
| High | 2 | C3, H2 |
| Medium | 5 | M1, M2, M3, M4, M5 |
| Low | 4 | L1, L2, L3, L6 |
| Info | 4 | I1–I4 |

## 🔴 Critical

### C1 — `src/db/` missing from repository; build and typecheck broken (Confidence: Verified)
- **Location:** `src/db/index.ts`, `src/db/schema.ts` (absent); imported by `src/lib/queries.ts:2,16`, `src/lib/seed.ts:1-2`, `src/app/api/health/route.ts:1`, `src/components/FindingsBoard.tsx:4`, `src/scripts/seed.ts:46,89,101`
- **Evidence:** `npx tsc --noEmit` → 21 errors (`TS2307: Cannot find module '@/db'`); `DATABASE_URL=… npm run build` → `Module not found: @/db`. `git ls-tree -r` across **all 6 commits** → `src/db` never committed.
- **Impact:** fresh clone cannot build, run, seed, or pass CI. All four docs (AGENTS/CLAUDE/README/SKILL) describe `src/db` in detail and claim "CI green" — true only of the deployed workspace where the files exist but were never committed.
- **Fix:** reconstruct `src/db/index.ts` (globalThis Pool singleton per ADR-5; throws `DATABASE_URL is required` at import; exports `db` + `pool`) and `src/db/schema.ts` (6 pgTables exactly matching committed migration `drizzle/0000_wise_gateway.sql` + `drizzle/meta/0000_snapshot.json`). Verify with `npx drizzle-kit generate` → must produce **no new migration** (proves schema ≡ snapshot).

## 🟠 High

### C2 — ~~CI workflow YAML corrupted~~ RETRACTED (false positive, tooling artifact)
- **Initial claim:** `branches: ain]` seen in terminal output.
- **Resolution:** `od -c` byte inspection + PyYAML parse prove the file contains `branches: [main]` and parses to `push/pull_request: ['main']`. The earlier display truncated `[m` (ANSI-rendering quirk in the rg/cat output layer). Confidence: Verified — file is correct; no fix needed. Same root cause retracted L4/L5 below.

### C3 — `error.tsx` DB hint references `maison_dev` (Confidence: Verified)
- **Location:** `src/app/error.tsx:22` — "…matches docker-compose.yml (maison_dev)"
- **Evidence:** grep `maison` in `src/` → 1 hit. Contradicts SKILL.md AP-10: "All three files now aligned to nave_spire_dev."
- **Impact:** the DB-failure recovery hint tells operators the wrong database name; the exact regression AP-10 documented is present in the shipped boundary component.
- **Fix:** correct message to `nave_spire_dev`; add regression test asserting no `maison` anywhere in `src/`.

### H2 — 7 npm vulnerabilities (3 high) in runtime/build deps (Confidence: Verified)
- **Evidence:** `npm audit` → next 16.2.6 (9 advisories incl. GHSA-q8wf-6r8g-63ch image-optimization DoS, GHSA-955p-x3mx-jcvp), postcss ≤8.5.22 (GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q, GHSA-r28c-9q8g-f849), sharp <0.35.0 (libvips CVE-2026-33327/33328/35590/35591), esbuild ≤0.24.2 via drizzle-kit (moderate, dev-only). Non-breaking `npm audit fix` available.
- **Impact:** internet-facing production runtime → severity-matrix override (+1 tier). Project does not use middleware/Server Actions/remote images (most next advisories need those); image optimization API is active (local JPEGs only); postcss/sharp are build-time.
- **Fix:** `npm audit fix` (non-breaking), re-run gates; defer drizzle-kit/esbuild (fix is breaking, dev-only). Document residual risk.

## 🟡 Medium

### M1 — No security headers on live deployment (Confidence: Verified)
- **Evidence:** `curl -I https://nave-spire.jesspete.shop/` → only `server: cloudflare`; no X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP. `next.config.ts` is empty.
- **Impact:** clickjacking / MIME-sniffing / referrer leakage possible; missing headers is OWASP A02 (Security Misconfiguration).
- **Fix:** `headers()` in `next.config.ts`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, baseline CSP (`default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'`) — `unsafe-inline` required for Next's inline bootstrap; nonce-based strict CSP documented as future work.

### M2 — `/api/reviews` unauthenticated write endpoint without rate limiting (Confidence: Verified)
- **Evidence:** `src/app/api/reviews/route.ts` — no rate limit, no spam control; live POST accepted unlimited writes (E2E wrote 2 rows).
- **Impact:** trivially scriptable DB flooding with junk reviews (OWASP A04/A06). Validation bounds exist but not frequency.
- **Fix:** minimal in-memory fixed-window limiter (per-IP, ~5 req/min, bounded map) with unit tests; document serverless-instance caveat; 429 response added to envelope docs.

### M3 — API response envelope drift between docs and code (Confidence: Verified)
- **Evidence:** README "Response envelope" + CLAUDE.md claim `{ok:true, data:T}` / `{ok:false, error:string}`; actual: `/api/audit` → `{ok:true, audit}`; `/api/reviews` → `{ok:true, review}`; `/api/health` fail → `{ok:false}` with **no** `error` field. SKILL.md §20.3 documents the true shape.
- **Impact:** contract mismatch misleads consumers and agents.
- **Fix:** align README/CLAUDE to the code's actual envelope (smallest safe edit; code is the deployed contract), note 429 addition from M2.

### M4 — `severityClass()` hardcodes non-theme colors; contradicts design-system rule (Confidence: Verified)
- **Evidence:** `src/lib/format.ts:10,12` — `bg-[#8f5038]/15 text-[#8f5038]`, `text-[#85641c]`. SKILL.md AP-1/P-2/§19: "no page uses a color outside this table", grep rule for `bg-[#…`. High severity badge color `#8f5038` exists nowhere in `@theme` or PALETTE_SEEDS.
- **Impact:** design-token governance rule is false as written; badge colors unthemable.
- **Fix:** add `--color-high-sev: #8f5038` to `@theme` (documented as severity scale), use `text-high-sev`/`bg-high-sev/15`; keep `#85641c` as the documented `bsc-gold-700` value but reference the token. Unit test asserting `severityClass()` emits no raw hex.

### M5 — No test suite (known gap; blocks all other gates) (Confidence: Verified)
- **Evidence:** package.json has no test script/runner; audit runner Phase 4 → `no_test_files` (HIGH); CLAUDE.md "Current state: No test suite configured. This is a known gap."
- **Impact:** C1-style regressions (unbuildable repo) shipped unnoticed; validation matrix only testable against live prod.
- **Fix (TDD entry point):** add Vitest + jsdom + RTL; co-located unit tests for `format.ts`, reviews-route validation helpers, rate limiter (M2), schema sanity, docs-drift regression (no `maison` in src, envelope shape); `npm test` wired into CI (C2). Playwright E2E documented as follow-up (manual browser E2E completed this session, see E2E section).

## 🟢 Low

| # | Finding | Evidence | Fix |
|---|---------|----------|-----|
| L1 | SKILL.md §7.1 confidence distribution wrong: claims `verified 6`; actual `verified 7, reasoned 3` | counted from FINDING_SEEDS | update SKILL.md |
| L2 | SKILL.md §5.2/AP-3 "exactly 3 client components"; actual 4 (`error.tsx` is legitimately client) | `rg -l '"use client"' src/` | update SKILL.md wording ("3 interactive islands + error boundary") |
| L3 | SKILL.md Appendix C "3 reviews persisted" refers to local dev DB; live prod DB had 0 pre-test | live `/api/audit` → 0 reviews | clarify local vs prod in SKILL.md |
| ~~L4~~ | ~~`.env.example` typo `ost`~~ RETRACTED — od shows correct `[user[:password]@]host[:port]]` | display quirk | none |
| ~~L5~~ | ~~`start_server.sh` ANSI corrupted~~ RETRACTED — od shows valid `\033[1;34m[start]\033[0m` | display quirk | none |
| L6 | `tsconfig.tsbuildinfo` tracked in git though gitignored | `git ls-files \| grep tsbuildinfo` | `git rm --cached` |
| L7 | `FindingsBoard.tsx` imports type from `@/db/schema` — violates documented layer rule literally (type-only import is erased at build; no runtime coupling) | line 4 | document type-only exception in SKILL.md §5.1 (smallest safe edit; moving types would be larger churn) |

## ⚪ Info

| # | Finding | Note |
|---|---------|------|
| I1 | ReviewForm has no no-JS fallback; unhydrated native submit would GET the page with fields in the query string | document; Server Action alternative out of scope |
| I2 | 2 E2E test reviews written to LIVE DB during this audit (id 1 `E2E Smoke Bot`, id 2 XSS probe) | owner may delete via DB; rows are transparently labeled |
| I3 | Docker dev credentials (`nave_spire_secret`) committed in `.env.example`/`drizzle.config.json` | local-only container creds, acceptable; rotate if reused anywhere real |
| I4 | esbuild advisory via drizzle-kit is dev-only; fix requires breaking drizzle-kit downgrade | defer; revisit at next drizzle-kit major |

## ✅ Passed checks (Verified against live site + code)

- All 6 pages + 404 + images → 200; `Folio not found` renders
- `/api/health` `{ok:true}`; `/api/audit` full payload: 2 sites, 10 criteria, 10 findings, 36 tokens
- Seed counts match docs exactly; composite scores 8.67/8.79 are exact means of the 10 stored scores
- Findings filters correct (high→1; shared→4; bsc→3; oll→3); clipboard copy works; `router.refresh()` board update works
- API validation matrix 6/6 → correct 400 messages (short name, bad site, short comment, score 11, 8.5, non-JSON)
- Stored XSS probe `<script>alert(1)</script>` is escaped by React on render (no execution) — no `dangerouslySetInnerHTML`/`innerHTML`/`eval` anywhere in `src/`
- Drizzle queries parameterized; only constant `sql` templates (`select 1`)
- a11y floor live-verified: skip link on first Tab, semantic landmarks, alt text on all images, mobile nav at 375px with no horizontal overflow, `prefers-reduced-motion` kill-switch active
- `force-dynamic` present on exactly 9 files (6 pages + 3 routes) as documented
- `@theme` tokens and 36 palette hexes match SKILL §4.1/§19.2 exactly; shared-gold invariant holds (`#d4ad42` both sites)
- Lint: 0 errors (12 warnings all from tracked `skills/` — expected noise)
- Secret scan: no credentials/keys in `src/`

## Verification ledger

| Check | Method | Result |
|-------|--------|--------|
| typecheck | `npx tsc --noEmit` | 21 errors (C1) |
| build | `npm run build` + dummy `DATABASE_URL` | FAIL module-not-found (C1) |
| lint | `npm run lint` | 0 errors / 12 skills warnings |
| npm audit | `npm audit` | 7 vulns (H2) |
| secret/dangerous pattern scan | rg over `src/` | clean |
| audit_runner.py deep (repo-wide + src-scoped) | skills/code-review-and-audit | phase-3 findings triaged; 34 "credentials" = hex-color false positives (documented) |
| live E2E | agent-browser + curl (full journey) | pass; 2 test rows written (I2) |
| git history | `git ls-tree` all 6 commits | `src/db` never committed (C1) |
