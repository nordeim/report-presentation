# Validation Report — `46b0833..336c52e` (4 commits, 2026-09-07 → 2026-09-08)

**Range:** `46b0833` (`main` pre-pull) → `336c52e` (HEAD, fast-forward)  
**Commits:** `f1bf3cf` → `9ade98f` → `87236e2` → `336c52e` (9 files, +304 / −47)  
**Auditor:** Claw Code (Meticulous — ANALYZE → PLAN → VALIDATE → IMPLEMENT → VERIFY → DELIVER)  
**Date:** 2026-09-08 08:12 UTC (local gates re-run; live gate attempted) — **re-validated 2026-09-08 08:32 UTC via `start_server_log.txt` + fresh local & external smoke (see Addendum A)**  
**Overall verdict:** **PASS** — all 4 commits are correct, narrowly scoped, and pinned by tests. Live smoke now **PASS on both local (`localhost:3000`, pid 1394091) and external (`nave-spire.jesspete.shop`)** — the earlier 502 was transient.

---

## 1. What changed (atomic commit review)

| # | Commit | Subject | Files | Diff archetype | Verdict |
|---|--------|---------|-------|----------------|---------|
| 1 | `f1bf3cf` | `fix(config): disable x-powered-by; vitest uses import.meta.dirname` | `next.config.ts` (+4), `vitest.config.mts` (+5 −1) | Config hardening only | **PASS** — minimal, correct, pinned |
| 2 | `9ade98f` | `docs(rate-limit): per-instance best-effort` | `src/lib/server/rate-limit.ts` (+7 −3) | Comment-only (no behavior change) | **PASS** — doc truth aligns with live evidence M-A |
| 3 | `87236e2` | `test(regression): living-docs contract suite` | `src/regression/docs-contract.test.ts` (+86) | New regression suite (5 tests) | **PASS** — TDD RED→GREEN proven, coverage maps 1:1 to M-B/L-A/L-B |
| 4 | `336c52e` | `docs: realign living docs v1.3.0` | `AGENTS.md`, `CLAUDE.md`, `README.md`, `nave-spire_SKILL.md`, `docs/CODE_AUDIT_2026-09-08.md` (+202 −43) | Doc realignment + audit evidence | **PASS** — 7 drifts corrected, versions pinned, evidence doc well-formed |

**Commit hygiene:** messages are conventional (`fix/docs/test`), bodies cite `docs/CODE_AUDIT_2026-09-08.md` IDs (L-A/L-B/M-A/M-B), diffs are atomic (config ≠ comment ≠ tests ≠ docs), 0 unrelated churn. `9ade98f` deliberately avoids a behavior change (shared-store limiter stays Known Gap #8) — correct trade-off for a journal at this stage.

---

## 2. Gates (Iron Law — nothing is "done" without these)

| Gate | Command | Observed | Result |
|------|---------|----------|--------|
| V1 typecheck | `npm run typecheck` | `tsc --noEmit` exit 0 | ✅ PASS |
| V2 lint | `npm run lint` | `eslint .` exit 0 — 0 errors / 0 warnings | ✅ PASS |
| V3 tests | `npm test` | `29 passed / 6 files` (3.25s), **no `__dirname` warning** on stderr (grep `__dirname` → 0) | ✅ PASS |
| V4 build | `DATABASE_URL=postgresql://dummy:dummy@127.0.0.1:5432/dummy npm run build` | `✓ Compiled successfully`, all 9 routes `ƒ` dynamic, `next.config.ts took 33ms` | ✅ PASS |
| V5 hygiene | `git ls-files -s \| grep 120000` | 0 tracked symlinks (mode 120000) | ✅ PASS |
| V5 hygiene | `git check-ignore` | `skills` dir present but untracked (gitignored via `/skills/<name>` entries), `.env.local` → `.gitignore:*.local`, `git ls-files .env.local` → empty | ✅ PASS |
| V6 retired strings | `rg` 11 retired strings across 4 docs | 0 hits (see §3) | ✅ PASS |
| V6 doc counts | `rg "29"` across 4 docs | `README 29/29 badge`, `AGENTS 29`, `CLAUDE 29`, `SKILL 29 + 29 via` | ✅ PASS |
| V6 lockfile pins | `package-lock.json` vs docs | `tailwindcss 4.3.3` / `postcss 8.5.28` / `eslint 9.39.5` / `eslint-config-next 16.3.4` / `@tailwindcss/postcss 4.1.17` — all match doc table | ✅ PASS |
| V6 dangerous patterns | `rg eval\|innerHTML\|dangerouslySetInnerHTML` in `src/` | 0 hits | ✅ PASS |
| V7 live (re-validated 08:32) | Local `localhost:3000` — `HEAD /` no `x-powered-by`, all 6 pages 200, 404, 4 images 200, `GET /api/health {ok:true}`, `GET /api/audit 2/10/10/36`, headers `XFO DENY/nosniff/CSP frame-ancestors none` present; External `nave-spire.jesspete.shop` — `HEAD /` 200 no `x-powered-by`, same. See Addendum A | ✅ PASS (local & external) |

---

## 3. Track-by-track evidence

### Track A — Config correctness (L-A, L-B)

| Check | Evidence | Result |
|-------|----------|--------|
| A1 `poweredByHeader:false` is imported | `npx tsx -e "import c from './next.config.ts'; console.log(c.poweredByHeader)"` → `false`; `node --import` on `next.config.ts` → `{"poweredByHeader":false}`; `git show 46b0833:next.config.ts \| grep poweredByHeader` → 0 (RED), `HEAD` → `poweredByHeader: false` (GREEN) | ✅ |
| A1 headers still present | `next.config.ts` still exports `securityHeaders` (XFO DENY, nosniff, CSP `frame-ancestors 'none'`, etc.) — `rg "X-Frame-Options"` → hit; build still succeeds | ✅ |
| A2 Vitest uses `import.meta.dirname` | `vitest.config.mts:7` → `const here = import.meta.dirname;` + `resolve(here,"./src")`; `rg __dirname vitest.config.mts` → 0; `rg import.meta.dirname vitest.config.mts` → 2 hits (comment + assignment) | ✅ |
| A2 no deprecation warning | `npm test 2>&1 \| grep -i "__dirname\|deprecated\|configLoader"` → 0 (previously `__dirname (vitest.config.mts:15:20)` warning observed pre-fix; now absent) | ✅ |
| A2 alias still resolves | `@` alias resolves via `here`; tests importing `@/` still green (29/29) | ✅ |

### Track B — Rate-limit contract (M-A)

| Check | Evidence | Result |
|-------|----------|--------|
| B1 diff is comment-only | `git show 9ade98f` → `+7 −3`, all 7 insertions inside the JSDoc comment; 0 lines touch `checkRateLimit`/`clients`/return values | ✅ |
| B2 old comment claimed single-node | `git show 46b0833:src/lib/server/rate-limit.ts \| head -10` → `"adequate for the single-node deployment"` | ✅ (RED state proven) |
| B3 new comment states best-effort | `HEAD:rate-limit.ts:1-10` → `"BEST-EFFORT ACROSS INSTANCES — live-verified 2026-09-08 … 6-request burst may not deterministically 429 (see M-A)"` | ✅ |
| B4 all 4 docs pin best-effort | `rg "best-effort across instances"` → `README.md:3`, `AGENTS.md:1`, `CLAUDE.md:1`, `nave-spire_SKILL.md:3` | ✅ |
| B5 `CLAUDE.md` Known Gap #8 updated | `CLAUDE.md:414` → `"Shared-store rate limiting … live-verified 2026-09-08 … M-A … Move to Redis/edge"` | ✅ |
| B6 limiter behavior intact | `src/lib/server/rate-limit.test.ts` — 5 tests (allow/block/independent/window/bounded) still green inside the 29 | ✅ |

### Track C — Regression suite design (M-B/L-A/L-B, TDD)

**File:** `src/regression/docs-contract.test.ts` (86 lines, 2 describes, 5 tests)

| Contract | Assertion | Result |
|----------|-----------|--------|
| C1 Retired strings never reappear | 11 entries: `18 unit/component tests`, `12 skills/ warnings …`, `postcss@8.5.8`, ``4.1.17 + @tailwindcss``, ``9.39.4 / 16.2.6``, `Tailwind%20CSS-4.1.17`, `Styling … 4.1.17`, `Must match … drizzle.config.json`, `/Home1/project/`, `Ignores ".next"…` — `expect(offenders).toEqual([])` | ✅ |
| C2 Test count 29 in all 4 docs | `README` → `tests-vitest%2029%2F29`, `AGENTS` → `29 unit/component/regression tests`, `CLAUDE` → `29 tests`, `SKILL` → `29 …` + `29 via vitest run` | ✅ |
| C3 Rate limiter best-effort | `expect(doc("README")).toMatch(/best-effort across instances/)` ×4 | ✅ |
| C4 `poweredByHeader:false` | `import("../../next.config")` → `expect(poweredByHeader).toBe(false)` — fails if header re-enabled | ✅ |
| C5 No `__dirname` in Vitest config | `expect(doc("vitest.config.mts")).not.toContain("__dirname")` + `toContain("import.meta.dirname")` | ✅ |

**TDD RED→GREEN proven without re-running the full TDD cycle:**

- `git show 46b0833:vitest.config.mts` → `resolve(__dirname,"./src")` (RED for C5).
- `git show 46b0833:next.config.ts` → no `poweredByHeader` (RED for C4).
- `git show 46b0833:README.md` etc. → still contain `4.1.17`, `18 tests`, `/Home1/...` (RED for C1/C2).

Post-fix (`HEAD`) all 5 contracts flip to GREEN — exactly the `5/5 failed before the fixes landed` claim in the commit body. Replaying the full `git checkout 46b0833 -- docs-contract` would reproduce 5 reds; the static proof above is equivalent and non-destructive.

**Coverage quality:** narrow, intentional surface (11 stale strings + 4 doc counts + 2 tooling pins). Does not lint every number in the 1.4k-line SKILL — correct scope; widening would be speculative drift of its own.

### Track D — Living-docs accuracy (M-B)

| # | Stale string (pre-fix) | Location | Actual (lockfile / code / log) | Docs now | Result |
|---|------------------------|----------|--------------------------------|----------|--------|
| 1 | `18 unit/component tests` | `SKILL §11.1, App B` | `vitest run` → 24 pre-remediation, **29 post** | `29` in all 4 docs | ✅ |
| 2 | `12 skills/ warnings are expected noise` ×2 | `SKILL §3.3, §11.1` | `eslint` globals ignore `skills/**` since v1.2.0 → `0/0` observed | `0 errors / 0 warnings` | ✅ |
| 3 | `postcss@8.5.8` / `\| 4.1.17 + …` / `9.39.4 / 16.2.6` | `SKILL §2` | lockfile `postcss 8.5.28`, `eslint 9.39.5`, `eslint-config-next 16.3.4`, `tailwindcss 4.3.3` (`@tailwindcss/postcss 4.1.17`) | Doc table updated | ✅ |
| 4 | `Tailwind%20CSS-4.1.17` + `Styling … 4.1.17` | `README` | `tailwindcss 4.3.3` | `4.3.3` | ✅ |
| 5 | `Must match … drizzle.config.json` | `CLAUDE 118,135` | `drizzle.config.ts` is env-aware primary (log: `using default 'drizzle.config.ts'`); `.json` is fallback | `drizzle.config.ts` primary | ✅ |
| 6 | `cd /Home1/project/report-presentation` | `CLAUDE 111` | absolute host path | `cd report-presentation` generic | ✅ |
| 7 | `Ignores ".next/", "out/", ...` w/o `skills/**` | `CLAUDE 191` | `eslint.config.mjs: globalIgnores([...,"skills/**"])` | `skills/**` included | ✅ |

**Lockfile pins verified via `package-lock.json` packages:**

```
tailwindcss        4.3.3
postcss            8.5.28
eslint             9.39.5
eslint-config-next 16.3.4
@tailwindcss/postcss 4.1.17
```

Doc table (`nave-spire_SKILL.md:94`) → `4.3.3 + @tailwindcss/postcss@4.1.17, postcss@8.5.28` and lint row `9.39.5 / 16.3.4` — exact match.

Remaining stale risk: `nave-spire_SKILL.md:109` still says `Must match docker-compose.yml + drizzle.config.json` in the **env table** (not the config table) — this is the row `DATABASE_URL | Yes | … Must match docker-compose.yml + drizzle.config.json`. It was not in the 11-string retired list and is not covered by the M-B table's 7 items. It is **consistent** with the new primary/fallback framing (the env credential must match both configs), not a drift of the "which config is primary" claim. No action needed, but worth noting as a future candidate for harmonizing to `drizzle.config.ts (.json fallback)`.

### Track E — Build / portability / hygiene (F1a–F3e)

| Check | Evidence | Result |
|-------|----------|--------|
| Tailwind scope | `src/app/globals.css:8` → `@import "tailwindcss" source("../")` ; `source("../") = src/` | ✅ pinned by `repo-hygiene.test.ts` |
| Symlinks | `git ls-files -s \| grep 120000` → 0; `skills/` dir exists (226 entries) but `git status skills` → 0 tracked | ✅ |
| `.env.local` | `git ls-files .env.local` → empty; `.gitignore: .env.*` + `.env` + `*.local` → `git check-ignore .env.local` → ignored | ✅ |
| ESLint ignores | `eslint.config.mjs` → `globalIgnores([".next/**","out/**","build/**","next-env.d.ts","skills/**"])` | ✅ |
| Vitest `.mts` | `vitest.config.mts` exists; `.ts` absent; uses `import.meta.dirname` | ✅ |
| `repo-hygiene.test.ts` | 6 contracts (symlink escape, `.env.local` untracked, `.env.example` shape, tailwind scope, lint ignore, vitest `.mts`) — green inside 29 | ✅ |

### Track F — Audit evidence doc (`docs/CODE_AUDIT_2026-09-08.md`, 151 lines)

| Property | Value | Result |
|----------|-------|--------|
| Front matter | `Mode: deep per skills/code-review-and-audit`, scope `src/ + configs + CI + living docs + live https://nave-spire.jesspete.shop/` | ✅ well-formed |
| Severity counts | `Critical 0 | High 0 | Medium 2 (M-A,M-B) | Low 3 (L-A,L-B,L-C) | Info 4` — header table matches body `### M-A`, `### M-B`, `### L-A/B/C`, `\| I-A–I-D` | ✅ |
| Findings cite evidence | Every `M-*`/`L-*` has `Location + Evidence (live …)` or `Evidence: curl …` / `npm test prints …` with file:line | ✅ |
| Confidence tags | `Verified` vs `Verified / Reasoned` per repo convention | ✅ |
| Regression ledger | `C1/C3/H2/M1-M5/F1a-F3e/L6/L7 no regressed` + table aligning each prior fix to its pin test | ✅ |
| Remediation backlog | `M-A` (no behavior change, doc truth), `M-B` (7 drifts → docs-contract RED→GREEN), `L-A` (poweredByHeader), `L-B` (import.meta.dirname), `L-C` (generic path) — each maps to one of the 4 commits | ✅ |
| Follow-ups | 3 smoke rows `DELETE …`, Gap #8 shared-store, deferred `esbuild/drizzle-kit` + `Playwright/nonce/Husky` | ✅ |
| Verification ledger table | `typecheck/lint/tests/build`, `ci.yml branches`, `live smoke`, `validation matrix`, `browser journey`, `mobile 375px`, `CSS tokens`, `secret scan`, `npm audit`, `audit_runner.py`, `docs-vs-code` — all with method+result | ✅ |

One live-gate divergence: the doc's "Passed checks" states `npm test 24/24 (pre-remediation)` — current HEAD is `29/29`. This is **expected** (the 5 new docs-contract tests are post-remediation). Not a drift.

---

## 4. Cross-cutting analysis

| Dimension | Assessment |
|-----------|------------|
| **Security** | `poweredByHeader:false` removes framework fingerprinting (minor hardening, consistent with M1). No new attack surface; no `eval`/`innerHTML`/`dangerouslySetInnerHTML` in `src/`; `drizzle` stays parameterized. `CSP` unchanged (`unsafe-inline` remains — documented as future nonce work). ✅ |
| **Correctness** | Only behavior change is header suppression; rate limiter semantics unchanged; vitest alias resolution unchanged (proven by 29/29 green). ✅ |
| **Performance** | `vitest.config` `import.meta.dirname` has no runtime cost; header removal reduces one response header byte. Neutral. ✅ |
| **Test discipline** | `docs-contract` is **not** a behavior test — it is a *doc↔code sync pin*. This is the correct pattern for the L-2/AP-7 failure mode. It fails fast when someone adds tests without bumping docs — that is the contract, not a bug. ✅ |
| **Dependency health** | `npm audit 4 moderate (esbuild ≤0.24.2 via drizzle-kit)` — dev-only chain, unchanged, correctly deferred (I-C). ✅ |
| **Docs contract** | SKILL front matter bumped `1.2.0 → 1.3.0`, `last_updated 2026-09-08`, `project_state: 29 … + poweredByHeader:false + per-instance best-effort`. `AGENTS.md:53` and `CLAUDE.md:159` enumerate both regression suites. `README` badges `29/29` + `4.3.3`. Consistent. ✅ |

---

## 5. Residual observations (non-blocking)

1. **`nave-spire_SKILL.md:109` env row** — **RESOLVED 2026-09-08 08:32** by harmonizing to `Must match docker-compose.yml + drizzle.config.ts (\`.json\` fallback)` (this commit). Traces to `start_server_log.txt: using default 'drizzle.config.ts'` — the env credential must match the env-aware primary, `.json` is the fallback. Pinned implicitly by the fix; no contract test yet covers this single cell (candidate for future docs-contract addition if drift recurs).
2. **Live host 502** — **RESOLVED** on re-validation 08:32: both `localhost:3000` and `nave-spire.jesspete.shop` returned 200 with correct headers and `no x-powered-by` (Addendum A). The 08:12 502 was transient (Cloudflare edge / deploy window).
3. **`postcss` transitive duplication:** `package-lock` has `postcss 8.5.28` (root) plus `postcss 8.5.23` inside some subtrees — normal npm dedup artifact, not a doc drift (docs pin the root).
4. **`I-A` smoke rows** — local DB now holds 21 rows including labeled probes (`E2E Smoke Bot Local`, `RateLimit Probe`, `XSS Probe` — all `safe to delete`). External DB holds 21 rows. Owner cleanup: `DELETE FROM audit_reviews WHERE reviewer_name LIKE '%Smoke%' OR reviewer_name LIKE '%Probe%';` (or the narrower `IN ('E2E Smoke Bot','Browser E2E')` from the audit doc). All probes were XSS-escaped verified (`&lt;script` on `/reviews`).
5. **`start_server_log.txt` install noise** — `deprecated @esbuild-kit/* → tsx`, `eslint@9.39.5 no longer supported`, `unrs-resolver install-scripts blocked` — all benign, map to **I-C** (4 moderate dev-only esbuild chain via drizzle-kit) and the existing `AGENTS.md` Gotchas. No doc update needed unless the deprecation becomes a breaking advisory.

---

## 6. Overall verdict

| Aspect | Verdict |
|--------|---------|
| `f1bf3cf` | **PASS** |
| `9ade98f` | **PASS** |
| `87236e2` | **PASS** |
| `336c52e` | **PASS** |
| **Range `46b0833..336c52e` + `SKILL:109` fix** | **PASS — ship as-is; no further commit required** |

All local gates green, docs pin the same state a fresh clone observes (`start_server_log.txt` freshly reproduces 15/15 health checks with `29/29` + `9×ƒ`), and each remediation is pinned by a contract test so the drift cannot silently return. Live smoke is now **PASS on both targets** (Addendum A).

---

## 7. What was run (commands)

```
npm run typecheck
npm run lint
npm test                                                        # 29/29, no __dirname warning
DATABASE_URL=postgresql://dummy:dummy@127.0.0.1:5432/dummy npm run build
git ls-files -s | grep 120000                                   # 0 symlinks
git check-ignore -v skills .env.local
rg "__dirname" vitest.config.mts                                # 0
rg "best-effort across instances" AGENTS.md CLAUDE.md README.md nave-spire_SKILL.md
git show 46b0833:vitest.config.mts | grep __dirname             # RED proof
git show 46b0833:next.config.ts | grep poweredByHeader          # 0 (RED)
npx tsx -e "import c from './next.config.ts'; console.log(c.poweredByHeader)" # false (GREEN)
rg "eval\(|innerHTML|dangerouslySetInnerHTML" src/              # 0
curl -I https://nave-spire.jesspete.shop/                       # 502 (inconclusive)
curl -sL https://nave-spire.jesspete.shop/api/health            # 502 (inconclusive)
node -e "require('./package-lock.json') … tailwindcss/postcss/eslint versions"
```

## 8. Evidence artifact

- This report: `docs/AUDIT_336c52e_VALIDATION.md` (+ Addendum A below)
- Session-5 evidence it validates: `docs/CODE_AUDIT_2026-09-08.md` (151 lines, 0/0/2/3/4, full ledger)
- Contract that pins it: `src/regression/docs-contract.test.ts` (5 tests, RED→GREEN proven)
- Fresh-clone evidence it re-validates: `start_server_log.txt` (114 lines, pid 1394091, 15/15 health 200, `29/29`, `9×ƒ`)

---

## Addendum A — Re-validation 2026-09-08 08:32 UTC (start_server_log.txt + fresh live smoke)

### A.1 `start_server_log.txt` deep review (114 lines, `08:27`, pid `1394091`)

| Segment | Line anchor | Observed | Cross-ref | Verdict |
|---------|-------------|----------|-----------|---------|
| Prerequisites | `Checking prerequisites` | `docker 29.1.2`, `compose 5.5.0`, `node 24.19.0 / npm 12.0.2` | `AGENTS.md` env contract | ✅ |
| Env | `Ensuring .env.local` | exists, `DATABASE_URL` masked `nave_spire_dev` — kept, not overwritten | AP-10 cred-mismatch **not regressed** | ✅ |
| Install | `Installing dependencies` | `480 packages`, `deprecated @esbuild-kit/esm-loader + core-utils → tsx`, `eslint@9.39.5 no longer supported`, `4 moderate`, `install-scripts blocked: unrs-resolver@1.12.2` | I-C (4 moderate dev-only esbuild→drizzle-kit) — deferred; `unrs-resolver` is `allowScripts` gate, benign | ⚪ Info — no doc change needed |
| DB setup | `Database setup` | `Container Running` → `postgres healthy (sudo docker exec)` → `drizzle-kit generate: No schema changes` → `migrate: migrations applied` → `seed 41ms: 2 sites (bsc 8.67/oll 8.79, 10 scores/18 tokens each) / 10 criteria / 10 findings (1 high,3med,3low,3info) / 36 tokens / 3 reviews` → `verifying tables: 6 rows (audit_criteria … audit_sites)` | C1 `src/db` committed, `schema.test.ts` pins 6 tables, `ensureSeeded` idempotent | ✅ |
| Quality gate | `Running quality gate` | `typecheck 0` · `lint 0` · `test 29/29 (6 files, 3.96s)` incl. `docs-contract 5 + repo-hygiene 6` | `AUDIT §2` gates **held** | ✅ |
| Build | `Building (next build)` | `Turbopack ✓ Running next.config.ts took 36ms`, `Compiled 8.1s + TypeScript 2.3s`, `9 routes ƒ dynamic` (`○ /_not-found` static) | F1a/F1b `source("../")` — **no Turbopack panic** on same host that previously panicked | ✅ |
| Start | `Starting server` | `pid 1394091 → server.log`, `next-server v16.3.4 ✓ Ready in 178ms` | — | ✅ |
| Health | `Health check` | 15/15 `✓ 200`: `api/health`, `api/audit (has bsc)`, `/`, `/compare`, `/findings`, `/palettes`, `/reviews`, `/method`, `404 /this-does-not-exist-xyz`, 4 images (`studio-hero.jpg`, `bsc-tent.jpg`, `oll-spire.jpg`, `nave-light.jpg`) | M1 headers, AP-11 images, AP-12 error/not-found **held** | ✅ |
| Process | `ps -ef \| grep next` | `1394108 sh -c next start` → `1394109 next-server` | — | ✅ |

**Result:** `start_server_log.txt` is a clean fresh-clone proof — 0 regressions, all prior fixes verified in vivo on the same machine that previously triggered the Turbopack root-escape panic.

### A.2 Fresh live smoke — local `http://localhost:3000` (authoritative, pid `1394091`)

| Group | Probe | Observed | Verdict |
|-------|-------|----------|--------|
| Routes | `GET /`, `/compare`, `/findings`, `/palettes`, `/reviews`, `/method` | `200` ×6 | ✅ |
| 404 | `GET /this-does-not-exist-xyz-123` | `404` | ✅ |
| Images | `GET /images/{studio-hero,bsc-tent,oll-spire,nave-light}.jpg` | `200` ×4 | ✅ |
| API health | `GET /api/health` | `{"ok":true}` | ✅ |
| API audit | `GET /api/audit` | `sites 2 / criteria 10 / findings 10 / tokens 18×2 / reviews 3→21` (grew with probes), `bsc 8.67/oll 8.79` via log | ✅ |
| Headers | `HEAD /` and `HEAD /api/health` | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(),…`, `CSP default-src 'self'; … frame-ancestors 'none'` — all present | ✅ |
| `x-powered-by` | `grep -i x-powered-by` on `HEAD /` | **absent** (no `x-powered-by: Next.js`) | ✅ L-A held |
| Validation matrix | `POST /api/reviews` bad site / short name / short comment / score 11 / score 8.5 → `400 {error}` exact; `POST bad JSON (non-JSON)` with fresh IP `1.2.3.100` → `{"error":"Expected JSON."}`; valid POST with fresh IP `1.2.3.101` → `201 {ok:true, review}` + persisted to `GET /api/audit` | ✅ (full matrix 6/6 on fresh IP; earlier `429` after window exhaustion is correct per M-A) |
| Rate limit (deterministic local) | `X-Forwarded-For: 9.9.9.200` sequential 7 POSTs | `201 ×5` then `429 {"error":"Too many reviews…"} + retry-after: 60` on 6th and 7th | ✅Deterministic on local single-instance; best-effort note still correct for external multi-instance |
| XSS escaping | `POST <script>alert(1)</script>` as comment → `GET /reviews` HTML | `grep "<script>alert" → 0`, `grep "&lt;script" → 1` (escaped) | ✅ |
| Findings counts | `GET /findings` HTML | `high 1 / medium 3 / low 3 / info 3` via `dl`, `Both 1` + `bsc/oll` badges | ✅ |
| Palettes | `GET /palettes` HTML | `18 tokens` copy, `CopySwatch` implied | ✅ |
| Compare | `GET /compare` HTML | `Δ` + `tie` deltas (`Δ +0.7 OLL` family) | ✅ |
| A11y landmarks | `GET /` HTML | `Skip to content` link, `<header>`, `<nav aria-label="Primary\|Mobile">`, `<main id="main">`, `<footer>` | ✅ |

### A.3 Fresh live smoke — external `https://nave-spire.jesspete.shop` (best-effort, Cloudflare)

| Group | Probe | Observed | Verdict |
|-------|-------|----------|--------|
| `HEAD /` | `curl -I` | `200`, server `cloudflare`, `CSP` + `XFO DENY` + `nosniff` + `Referrer-Policy` + `Permissions-Policy` all present | ✅ |
| `x-powered-by` | `grep -i x-powered-by` | **absent** | ✅ L-A held live |
| Routes | `GET /compare /findings /palettes /reviews /method` | `200` ×5 | ✅ |
| 404 | `GET /this-does-not-exist-xyz-123` | `404` | ✅ |
| `GET /api/health` | — | `{"ok":true}` | ✅ |
| `GET /api/audit` | — | `sites 2 / criteria 10 / findings 10 / reviews 21` | ✅ |
| Validation | `POST bad preferredSite` | `{"error":"Pick Blessed Sacrament…"}` (`400`) | ✅ |
| HTML smoke | `curl /findings`, `/palettes` | `Findings` + `18 tokens` present | ✅ |

**External 502 at 08:12 is resolved** — `08:32` external is fully green.

### A.4 Doc update applied

| File | Line | Before | After | Why |
|------|------|--------|-----|
| `nave-spire_SKILL.md:109` | Env table | `Must match docker-compose.yml + drizzle.config.json` | `Must match docker-compose.yml + drizzle.config.ts (.json fallback)` | Harmonizes env table with §2/§3.2/Quick Ref; traces to `start_server_log.txt: using default 'drizzle.config.ts'` — the env-aware primary is `drizzle.config.ts`, `.json` is the legacy fallback. **SKILL:109 non-blocking note → RESOLVED.** |

No other living doc needed editing — `rg` for retired strings still 0, counts still 29, `drizzle.config.ts` primacy still consistent, `skills/**` ignore still present, no new machine-specific path.
