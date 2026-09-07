# Nave & Spire — Tiered Code Review + Security Audit (2026-09-08)

Mode: `deep` per `skills/code-review-and-audit` (audit_runner.py deep + checklist_runner.py src-scoped + native CLI fallbacks for the phases whose Python scripts are not vendored). Scope: `src/`, root configs, CI, living docs (AGENTS/CLAUDE/README/SKILL), live deployment `https://nave-spire.jesspete.shop/`. Evidence: every finding cites file/line or command output. Confidence tags per repo convention (Verified = executed and observed here; Reasoned = logical inference from observed evidence).

This is the Session-5 pass. It validates the Session-2/3 remediations (C1 `src/db` reconstruction, M1 headers, M2 rate limiter, M4 tokens, M5 suite, F1a–F3e portability) against the current tree AND the live site.

## Summary (counts by severity)

| Severity | Count | Items |
|----------|-------|-------|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 2 | M-A, M-B |
| Low | 3 | L-A, L-B, L-C |
| Info | 4 | I-A, I-B, I-C, I-D |

Regression check of all prior findings (C1, C3, H2, M1–M5, F1a–F3e, L6, L7): **no regressed item**. Full verification ledger at the end.

## 🔴 Critical

None found.

## 🟠 High

None found. `npm audit` reports 4 moderate advisories, all in the dev-only esbuild → @esbuild-kit → drizzle-kit chain (see I-C); no runtime advisories.

## 🟡 Medium

### M-A — Rate limiter's "single-node" assumption does not hold on the live deployment (Confidence: Verified behavior / Reasoned cause)

- **Location:** `src/lib/server/rate-limit.ts:4-6` (comment: "adequate for the single-node deployment this journal ships on"); mirrored by README "API Reference" note, CLAUDE.md Known Gap #8, SKILL.md §14.5.
- **Evidence (live, 2026-09-08):**
  - Burst A (8 earlier POSTs spread across two invocations, then 4 rapid invalid POSTs): all returned 400 — no 429 at request ≥5 within the plausible window.
  - Burst B (6 rapid invalid POSTs in one invocation): `429` from the **3rd** request, with `retry-after: 18`.
  - Burst C (clean window, 6 rapid invalid POSTs after 65s idle): six 400s — **no 429 at request 6**.
- **Impact:** the 5 req/min contract is enforced **best-effort**, not deterministically. A fixed-window limiter with `limit: 5` must 429 on request 6 of a clean window when all requests reach the same map; Burst C shows they did not. The observed pattern is consistent with more than one server instance (or instance recycling) behind Cloudflare, each holding its own in-memory map — exactly the multi-instance caveat the code itself documents as the limit of the design. The stale part is the *comment/docs* claiming the deployment is single-node; the live host no longer matches that claim, so the documented guarantee is stronger than the delivered one.
- **Fix (shipped):** align the code comment + all three docs to the verified reality: enforcement is per-instance and best-effort; a shared store (Redis/edge) remains the real fix and stays documented as future work (Known Gap #8). No behavior change — deliberately not "fixed" with a naive rewrite that would silently change the contract mid-journal.

### M-B — Living-doc drift: AGENTS/CLAUDE/README/SKILL describe a superseded state (Confidence: Verified)

Each item verified against the current file and lockfile:

| # | Doc claim (stale) | File:line | Actual (verified) |
|---|-------------------|-----------|-------------------|
| 1 | "18 unit/component tests" (SKILL §11.1, App. B) | nave-spire_SKILL.md:645, 1338 | 24 tests green locally (vitest run) |
| 2 | "12 skills/ warnings are expected noise" / "0 errors (12 skills/ warnings ignored)" (SKILL §3.3, §11.1, App. B) | nave-spire_SKILL.md:176, 643, 1337 | v1.2.0 added `skills/**` to ESLint `globalIgnores`; `npm run lint` = 0 errors / 0 warnings (observed) |
| 3 | postcss `8.5.8`, eslint `9.39.4`, eslint-config-next `16.2.6`, Tailwind `4.1.17` (SKILL §2 table; README badge/stack row) | nave-spire_SKILL.md:94,100; README.md:6,37 | lockfile: postcss 8.5.28, eslint 9.39.5, eslint-config-next 16.3.4, tailwindcss 4.3.3 (range `^4.1.17`) |
| 4 | `drizzle.config.json` presented as the Drizzle CLI config (SKILL §2, §3.2, Quick Ref) | nave-spire_SKILL.md:96,160,1421 | `drizzle.config.ts` is env-aware primary (drizzle-kit defaults to it — see start_server_log.txt: "using default 'drizzle.config.ts'"); `.json` is fallback (AGENTS.md:120 already correct) |
| 5 | "Must match docker-compose.yml + drizzle.config.json" (CLAUDE.md:118, 135) | CLAUDE.md | must match docker-compose.yml; drizzle.config.ts reads `DATABASE_URL` from `.env.local` itself |
| 6 | `cd /Home1/project/report-presentation` in Environment Setup | CLAUDE.md:111 | machine-specific absolute path from the owner's host; meaningless elsewhere |
| 7 | ESLint ignore list omits `skills/**` (CLAUDE.md:191 "Ignores `.next/`, `out/`, `build/`, `next-env.d.ts`") | CLAUDE.md | eslint.config.mjs also ignores `skills/**` (repo-hygiene test pins it) |

- **Impact:** SKILL.md is declared "the single-source-of-truth engineering reference … run the command and you will see the same result"; these drifts break that promise for the next agent (the exact failure mode documented as Lesson L-2/AP-7).
- **Fix (shipped):** all seven corrected; a new `docs-contract` regression suite (`src/regression/docs-contract.test.ts`) now pins the corrected strings + current test count so the drift cannot silently return (it fails whenever the suite count changes without a docs update).

## 🟢 Low

### L-A — `x-powered-by: Next.js` exposed on live responses (Confidence: Verified)

- **Evidence:** `curl -I https://nave-spire.jesspete.shop/` → `x-powered-by: Next.js` (observed 2026-09-08). Next.js emits it by default.
- **Impact:** framework/ version fingerprinting; inconsistent with the otherwise hardened header set (M1 remediation). OWASP A02-adjacent hardening, minor.
- **Fix (shipped):** `poweredByHeader: false` in `next.config.ts`, pinned by a contract test that imports the config.

### L-B — `vitest.config.mts` uses `__dirname` (Confidence: Verified)

- **Evidence:** running `npm test` prints: "Your Vite config uses features that are unsupported by `configLoader: 'native'` … `__dirname` (vitest.config.mts:15:20). Use `import.meta.dirname` instead" — Vite flags this as a future default-breakage.
- **Impact:** deprecation warning on every test run; config will break when Vite flips the default loader.
- **Fix (shipped):** `import.meta.dirname`, pinned by the docs-contract suite (config must not contain `__dirname`).

### L-C — CLAUDE.md setup instructions reference a host-specific path (Confidence: Verified)

- **Evidence:** CLAUDE.md:111 `cd /Home1/project/report-presentation`.
- **Impact:** any other machine (including CI or a fresh clone agent) reads an invalid instruction; small, but it is the file agents read first.
- **Fix (shipped):** generic `cd report-presentation`.

## ⚪ Info

| # | Finding | Note |
|---|---------|------|
| I-A | 3 E2E smoke rows written to the LIVE reviews DB during this session (ids 1–3, reviewer `E2E Smoke Bot` / `Browser E2E`, every row labeled "safe to delete") | Owner may delete via psql: `DELETE FROM audit_reviews WHERE reviewer_name IN ('E2E Smoke Bot','Browser E2E');` Rows are transparently labeled; XSS-escaping verified on their render. |
| I-B | Headless-browser anomaly: first submit click on `/reviews` produced no fetch, no status, no error; immediate retry submitted normally (201). Not reproducible on retry; no console/page errors. | Most likely a headless-click/hydration timing artifact of the automation tool, not product code (Reasoned). Monitor; no change made. |
| I-C | 4 moderate npm audit advisories: esbuild ≤0.24.2 (GHSA-67mh-4wv8-2f99) via @esbuild-kit/core-utils → @esbuild-kit/esm-loader → drizzle-kit; fix requires breaking drizzle-kit downgrade | Dev-only chain (drizzle-kit never ships to the runtime bundle); deferred unchanged from prior sessions (prior I4). Revisit at next drizzle-kit major. |
| I-D | Vitest hints "jsdom was created 5 times" — could be shared via `pool: 'vmThreads'` | Perf hygiene only (~3s); not worth the isolation tradeoff today. |

## ✅ Passed checks (all Verified this session)

Local gates (fresh clone, Node 24.19.0):

- `npm run typecheck` → 0 errors
- `npm run lint` → 0 errors / 0 warnings
- `npm test` → 24/24 (5 files) — prior to remediation additions
- `DATABASE_URL=<dummy> npm run build` → ✓ compiled 9.5s, all routes `ƒ` dynamic
- `npx drizzle-kit generate` not re-run (schema untouched; `schema.test.ts` pins schema ≡ migration)

Live deployment (https://nave-spire.jesspete.shop/):

- Routes: `/`, `/compare`, `/findings`, `/palettes`, `/reviews`, `/method`, `/api/health`, `/api/audit` → 200; unknown path → 404 "Folio not found."
- Security headers **all present**: CSP (`default-src 'self'; … frame-ancestors 'none'`), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy (M1 remediation confirmed live)
- `/api/health` → `{ok:true}`; `/api/audit` → 2 sites (bsc 8.67 / oll 8.79, 10 scores + 18 tokens each), 10 criteria, 10 findings, 0 reviews pre-test — matches seed snapshot exactly
- API validation matrix 6/6 → exact 400 messages (short name / bad site / short comment / score 11 / score 8.5 / non-JSON)
- Valid POST → 201 `{ok:true, review}`; board reflects submission via `router.refresh()` ("3 logged")
- Rate limit: `429` + `Retry-After` observed (enforcement path live; see M-A for boundary non-determinism)
- Browser E2E (agent-browser, headless): no console errors/page errors on any page; findings filters high=1 / medium=3 / low=3 / info=3, scopes bsc=3 / oll=3 / shared=4, empty-state copy "No findings in this cut."; palettes 36 swatches grouped, clipboard write flips "Copied" state; compare shows all 10 deltas (`Δ +0.7 OLL`, `tie`, …); method sections render
- A11y live: skip link first in tab order and visible on focus (142×40 @ 16,16); `:focus-visible` gold ring token `#b8943e` in deployed CSS; landmarks `header/nav[aria-label]`, `main#main`, `footer`
- Mobile 375px: no horizontal overflow (`scrollWidth == clientWidth == 375`), mobile nav row visible, desktop nav hidden
- Deployed CSS bundle contains all 6 motion utilities + `prefers-reduced-motion` kill-switch + `focus-visible` + `.bg-grain`/`.gold-hairline`/`.weave`
- Stored-XSS escaping re-confirmed on live-rendered review rows (no `<script>` in markup)

Code review dimensions (Phase 6 expert pass over all of `src/` + configs):

- Correctness: guards for missing seed rows (`throw` → error boundary), filter logic verified against live counts, NaN path in `contrastText` handled
- Security: no eval/innerHTML/dangerouslySetInnerHTML; SQL only via Drizzle parameterized calls + constant `sql\`select 1\``; no secrets in `src/` (rg scan; the 34 checklist "credential" hits in `audit-data.ts` are hex color values — same false-positive class documented in the prior audit); external input validated early; rate limiter bounded (maxClients 1000, oldest-evicted)
- Error handling: API routes return typed envelopes; `unknown` catches with narrowing everywhere; `error.tsx` DB-aware
- Performance: 6 parallel selects + in-memory joins (no N+1); font preloads; hero `priority` only above the fold
- Maintainability/consistency: 3-layer boundary respected (type-only `@/db/schema` import in FindingsBoard is the documented exception); UPPER_SNAKE_CASE module constants per CLAUDE.md (checklist "PascalCase const" hits are convention-compliant, not findings)
- Dependency health: runtime tree clean; dev-only esbuild chain deferred (I-C)

Prior-finding regression check: C1 `src/db/` committed and pinned by `schema.test.ts`; C3 no `maison` anywhere (`docs-drift.test.ts` + re-grep); M1 headers live; M2 limiter live (see M-A for the doc-truth gap); M3 envelope docs match implementation; M4 `severityClass()` uses `@theme` tokens (`format.test.ts` no-raw-hex); F1a/F1b `source("../")` + zero tracked mode-120000 entries (`repo-hygiene.test.ts`, 6/6 green); L6 `tsconfig.tsbuildinfo` untracked; L7 type-only exception documented.

## Verification ledger

| Check | Method | Result |
|-------|--------|--------|
| typecheck / lint / tests / build | npm scripts, fresh clone | 0 / 0-0 / 24-24 (pre-remediation) / ✓ |
| ci.yml `branches: ain]` artifact | `od -c` + PyYAML parse | false positive re-confirmed — bytes are `branches: [main]`; YAML parses; `on` → `True` key per YAML 1.1 (expected) |
| Live smoke (routes/404/headers/health/audit) | curl | pass (details above) |
| API validation matrix + rate limit | curl (14 POSTs total, all labeled or invalid) | 400×12 exact messages, 201×2, 429 observed |
| Browser journey | agent-browser (headless Chromium) | pass; zero console/page errors |
| Mobile 375px + skip link + focus token | agent-browser eval + computed styles | pass |
| Deployed CSS tokens | fetched `/_next/static/chunks/*.css` | all motion + a11y tokens present |
| Secret / dangerous-pattern scan | rg over `src/` | clean (palette-token keyword false positives only) |
| npm audit | npm 11.17 | 4 moderate, dev-only chain |
| audit_runner.py deep | skills/code-review-and-audit | repo-wide run drowned in vendored `skills/` noise (2893 phase-3 findings — all vendored tooling); triaged per prior-audit precedent; src-scoped checklist run triaged manually (34 "credentials" = hex colors; "PascalCase const" = project convention) |
| Docs-vs-code claims | file-by-file diff of every countable claim | 7 drifts (M-B), 1 stale deployment assumption (M-A) |

## Remediation backlog (executed this session)

| ID | Severity | Remediation | TDD evidence |
|----|----------|-------------|--------------|
| M-A | Medium | rate-limit.ts header comment + README + CLAUDE Gap #8 + SKILL §14.5 now state per-instance best-effort enforcement (live-verified); shared store stays future work | No behavior change; docs pinned by docs-contract suite |
| M-B | Medium | All 7 doc drifts corrected in AGENTS/CLAUDE/README/SKILL (SKILL → v1.3.0) | `src/regression/docs-contract.test.ts` RED (7 stale strings present) → GREEN after doc edits |
| L-A | Low | `poweredByHeader: false` in next.config.ts | Contract test imports config → RED (undefined) → GREEN (false) |
| L-B | Low | vitest.config.mts `__dirname` → `import.meta.dirname` | Contract test asserts no `__dirname` → RED → GREEN; suite green, warning gone |
| L-C | Low | CLAUDE.md path made generic | Covered by docs-contract stale-string scan |
| I-A | Info | 3 labeled smoke rows remain in live DB (owner-removable via SQL in the Info table above) | — |

## Follow-ups for the owner

1. Delete the 3 smoke review rows (SQL above) if the live board should start clean.
2. Known Gap #8 (shared-store rate limiting) is now live-verified as a real behavioral gap, not just a serverless caveat — prioritize if review-spam matters.
3. Deferred: dev-only esbuild/drizzle-kit advisory chain (I-C); Playwright harness; nonce CSP; Husky pre-commit (CLAUDE.md Known Gaps unchanged).
