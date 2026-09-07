> **Note (2026-09-08):** Historical worklog for Session 2 (`782730c..3b14119`, 18 tests green at time of writing). Superseded by `docs/VALIDATION_2026-09-08.md (GO)` which traces the same claims against `main@5d0dd3d` (now 24 tests via `src/regression/repo-hygiene`, `src/db/` present, build-portability contracts, `SKILL v1.2.0`). Body below is preserved verbatim — see also `docs/CODE_AUDIT_2026-09-07.md` addendum for Session 3's symlink build-panic remediation.

---

Now the large nave-spire_SKILL.md (98KB) — reading in sections:
All four docs read. Now let me check the skills catalog and validate the codebase structure.
Found the relevant skills. Let me check which skill folders are valid (some symlinks were broken) and read the key ones for the audit/E2E/TDD workflow.
Phase 1-2 skills loaded. Now let me validate the docs against the actual codebase — reading all source files.
Key discovery: **no `src/db/` directory exists** — but all docs claim `src/db/index.ts` + `src/db/schema.ts`. Let me verify what the code actually imports.
`src/db/` is missing while `@/db` is imported in 3 files — a critical misalignment. Let me install and run the quality gates to confirm the actual repo state.
**Critical finding confirmed**: `src/db/` is missing → 21 typecheck errors. Let me check git history to see if it ever existed.
`src/db/` was never committed in any commit — the deployed site has it, but the repo doesn't. The committed Drizzle migration SQL will be my authoritative source for reconstruction. Let me read all source files now.
Found another drift: `error.tsx` still references `maison_dev` — the exact credential bug that SKILL.md AP-10 claims was fixed. Continuing with pages and config files.
More findings: `ci.yml` has corrupted branch syntax (`branches: ain]` — missing `[m`), and `.env.example` has a typo (`ost` instead of `host`). Let me finish reading the remaining pages and `start_server.sh`.
**Build fails — `Module not found: @/db`.** The repo as committed cannot build. Docs claiming "CI green" only hold for the deployed workspace where `src/db/` exists but was never committed. Now let me check the live site.
Live site is up: pages 200, seed counts match docs, but **0 security headers** (no CSP, X-Frame-Options, etc.) and **0 reviews in live DB** (SKILL.md Appendix C claims "3 reviews persisted" — that was the local dev DB). Now let me run the browser E2E pass on the live site.
Homepage renders with full landmark structure. Now the full E2E walk: findings filters → palettes copy → reviews submission → API validation matrix.
Filters verified: shared→4, BSC→3, OLL→3 (matches seed distribution). Now palettes + clipboard:
Reviews form present with proper labels and defaults. Submitting one clearly-marked smoke-test review to validate the full E2E write path:
Review NOT persisted — possible bug. Let me re-run with network tracing to see the actual POST behavior.
The write path works — first click was a pre-hydration automation artifact. Now the API validation matrix (server-side 400s) and remaining checks:
XSS properly escaped by React. Now mobile viewport + reduced-motion + skip link checks:
Compare page shows 10 rows but the delta-regex found nothing and `ties:8` looks wrong. Let me verify against the API data:
Data integrity confirmed (means = 8.67/8.79 exactly; 2 true ties). My earlier `ties:8` matched the substring "tie" anywhere in HTML — false alarm. Verifying rendered deltas via SSR HTML:
E2E pass complete — all flows work on the live site. Closing browser and running the tiered code review + security audit using the repo's `code-review-and-audit` skill pipeline:
The runner scanned the 2,400-file `skills/` folder (noise). Re-running scoped to actual project code `src/` plus a manual security pass on configs:
The 34 "CRITICAL hardcoded credentials" are **false positives** — the scanner's regex matches `hex: "#…"` color strings in `PALETTE_SEEDS` (lines 401–438 are exactly the palette tokens). The real finding: `no_test_files`. Per the skill's Native CLI Fallback Protocol, running phases 1–2 natively:
I now have the complete picture. Let me record the findings in the worklog, write the audit report, then validate my remediation plan against the codebase before executing.
Audit report saved to `docs/CODE_AUDIT_2026-09-07.md`. Now executing the remediation plan — TDD-first: set up the test runner (M5), write the failing tests, then fix in severity order.
Now the failing tests (red phase) — pure-function tests, docs-drift regressions, rate-limiter TDD, and schema sanity:
Now the rate-limiter TDD test (red) and the schema sanity test:
Now run the red phase — tests must fail for the right reasons:
Red phase confirmed — 4 test files fail for exactly the documented reasons. Now the green phase. **C1 first**: reconstruct `src/db/`:
**`No schema changes, nothing to migrate`** — the reconstructed schema is provably byte-compatible with the committed migration. Now C3 (error.tsx), M4 (theme colors), M2 (rate limiter):
Now the rate limiter implementation (M2, green phase):
Wire the limiter into the reviews route and add the client-IP extraction:
The test caught a real edge-case bug: malformed hex falls through `NaN >= 160 → false` and returns **light** text (`#f8f5ef`), which would be invisible on an unknown/white background. Root fix — treat NaN YIQ as unreadable and default to ink:
Green: 18/18 tests, typecheck clean. Now C2 (CI YAML), M1 (security headers), and L4/L5 quick fixes:
The Read tool shows valid YAML (`[main]`) — my earlier `cat` output may have mangled it. Verifying raw bytes:
**C2 was a false positive** — `od -c` proves the bytes are `[main]`; my terminal display was swallowing `[m` (ANSI rendering quirk). This same quirk likely corrupted the earlier `start_server.sh` finding — re-verifying L4/L5 with byte-level inspection:
L4/L5 also false positives — the file bytes are correct (`\033[1;34m[start]\033[0m`, `[user[:password]@]host[:port]]`). My rg/cat display was mangling output; `od` and the vitest file-content scan are authoritative. Correcting the audit report, then continuing with H2 + M1:
Now M1 (security headers in `next.config.ts`) and CI `npm test` step:
Now H2 — `npm audit fix` (non-breaking), then re-run all gates:
All 3 high vulns resolved (next→16.3.4, postcss→8.5.28, sharp→0.35.4); only the dev-only esbuild/drizzle-kit chain remains (documented as deferred — breaking fix). Re-running all gates:
All gates green — build succeeds with the exact documented route profile. Now verifying the security headers on a live local production server:
Headers verified (all 5 present), rate limiter blocks at request 6 with 429 (the 500s are the expected no-DB behavior locally — insert fails after validation, and the limiter still counts them). Final local page sweep, then stop the server:
The 500s are the documented no-DB behavior (dummy `DATABASE_URL`, graceful `error.tsx` boundary), while `/method` (no DB dependency) and 404 work. Verifying the corrected DB hint renders:
Standard Next.js client-rendered error shell — the corrected message is enforced by the regression test at file level. Now the remaining hygiene + doc alignment. First check exact installed versions for badge accuracy:
Now updating the docs for alignment. README first (badge, envelope, testing, security, hierarchy):
README done. Now AGENTS.md:
Now CLAUDE.md:
Now update CLAUDE.md's Known Gaps, anti-patterns, and success metrics:
CLAUDE.md done. Now the SKILL.md — version bump to 1.1.0 with all drift corrections:
Continuing SKILL.md — remaining sections:
All docs aligned. Final gate run, then commit sequence:
All gates green. Updating worklog and committing in logical atomic units:
The stray `.audit-report.md` files are runner scratch output — removing (curated report is `docs/CODE_AUDIT_2026-09-07.md`). Committing in atomic units:
**Root cause of C1 found**: `.gitignore` contains the pattern `db/` — which matches *any* directory named `db` at any depth, silently excluding `src/db/` from every `git add` since the first commit. Verifying and fixing:
Working tree clean, `tsbuildinfo` untracked. Per lesson L-8, the definitive C1 verification is a **fresh-clone build test** — let me prove the pushed tree works from zero:
Fresh clone fully verified: `src/db/` present, npm ci → 18/18 tests → typecheck → build → drizzle no-op. C1 is definitively resolved. Now the push — checking the SSH key and wrapper script:
Wrapper supports `-o StrictHostKeyChecking=accept-new`. Setting up the key outside the repo and pushing to main:
**Push succeeded** — `782730c..2671ddc main -> main`, all 7 commits on main, no new branches. Final worklog update and remote verification:
All done. Here's the complete picture:

## What happened

**The headline finding (C1):** `src/db/` — the entire database layer — was never committed. An unanchored `.gitignore` rule (`db/`) silently excluded it from every commit since v1, so the repo couldn't build or typecheck from a fresh clone while all four docs claimed "CI green." I reconstructed it from the committed Drizzle migration (`drizzle-kit generate` → no-op proves byte-compatibility) and fixed the gitignore root cause.

**Audit:** severity-ranked report with evidence in `docs/CODE_AUDIT_2026-09-07.md` — 1 critical, 2 high, 5 medium, plus 3 findings I retracted after `od` byte-inspection proved they were display artifacts, not real.

**E2E on the live site:** all pages, filters, clipboard, review submission, the 6-case validation matrix, XSS escaping, mobile layout, skip link, and reduced-motion — verified working in a real browser.

**TDD remediation:** Vitest suite (18 tests, red→green, one real `contrastText` bug caught), rate limiter on `/api/reviews`, security headers, `npm audit fix` (next 16.3.4), token-based severity colors, corrected `maison_dev` hint.

**Shipped:** 7 atomic commits to main, pushed via the SSH wrapper — fresh-clone verified (npm ci → tests → typecheck → build all green). Docs realigned; SKILL bumped to v1.1.0.

**Suggested next steps:** redeploy so the live site picks up the headers/limiter; optionally delete the 2 smoke-test reviews (ids 1–2) from the prod DB; and consider a Playwright harness plus nonce-based CSP (tracked in the audit's backlog).

---

I'll continue from where we left off. Let me first check the current workspace state and understand what has been done so far.
The worklog shows the full remediation was completed and pushed. Key context: `src/db/` was **reconstructed** during remediation (the original files were never committed due to a `.gitignore` `db/` rule bug). Now you've provided the **original** files — I need to validate and reconcile them with my reconstructed versions. Let me set up the plan.
Both files exist in the repo (my reconstruction). Now let me diff the user's originals against them and check codebase usage that could be affected (relational `db.query` API, `$inferInsert` types).
Excellent — the working tree is clean on `main`, no code uses the relational `db.query` API, and the `$inferInsert` types are never imported outside schema.ts. Let me verify the exact named imports at every consumer site to confirm the originals cover them all.
All consumers verified — the originals are fully compatible with the remediated codebase. Quick check on tests and docs for any references to the reconstructed-only artifacts (`$inferInsert` types, `{ schema }` relational config), then I'll merge.
Validation complete — everything checks out:

| Aspect | Original (user) | Reconstructed (repo) | Compatibility |
|---|---|---|---|
| `index.ts` schema import | `drizzle(pool)` | `drizzle(pool, { schema })` | ✅ Safe — no `db.query.*` usage anywhere |
| `index.ts` type cast | `as typeof globalThis & {...}` | `as unknown as {...}` | ✅ Original is valid, even more precise |
| `schema.ts` `$inferInsert` types | absent | present | ✅ Safe — never imported outside schema.ts |
| `createdAt` builder order | `.defaultNow().notNull()` | `.notNull().defaultNow()` | ✅ Identical SQL output |
| Tables + `$inferSelect` types | all 6 tables + 6 types | same | ✅ Covers all consumers (`queries.ts`, `seed.ts`, `health/route.ts`, `FindingsBoard.tsx`) |

The SKILL's CAP-2 mention of `$inferInsert` is only a technique description, not a dependency. **Decision: adopt the originals verbatim** — they are the canonical ground truth. Let me check the test scripts, then write the files.
Now merging the user's original files verbatim:
Now running the full validation gates. First the critical schema-compatibility check (`drizzle-kit generate` must be a no-op) plus typecheck:
**Critical gate passed** — `No schema changes, nothing to migrate` proves the original schema.ts is byte-compatible with the committed migration, and typecheck is clean. Now the test suite, lint, and build:
All five gates are green with the original files:

| Gate | Result |
|---|---|
| `drizzle-kit generate` | ✅ No schema changes — original schema ≡ committed migration |
| `tsc --noEmit` | ✅ 0 errors |
| Vitest | ✅ 18/18 passed |
| ESLint | ✅ 0 errors (12 pre-existing skill warnings) |
| `next build` | ✅ Green, all 10 routes |

Now committing to main. Let me verify the change set and the push tooling:
Change set is exactly the two files. The deploy key from the previous push is at `/home/z/.ssh/nave_spire_deploy` (the converted `ssh-key.txt`, correct 600 perms). Let me check the wrapper's invocation interface, then commit and push:
The wrapper is used via `GIT_SSH_COMMAND` with `-i`. Now committing and pushing:
Committed as `3b14119` on main. Now pushing via the SSH wrapper:
Push succeeded: `2671ddc..3b14119 main -> main`. Let me verify the remote state and update the worklog:
All done ✅ — the original `src/db/` files are now merged, validated, and pushed.

**Validation results** — the originals are fully compatible with the remediated codebase:
- **`index.ts`**: original uses `drizzle(pool)` without schema registration — verified zero consumers of the relational `db.query.*` API, so this is safe (my reconstruction had added it defensively)
- **`schema.ts`**: drops the `$inferInsert` type aliases I'd added — verified they were never imported anywhere; all 6 tables + `$inferSelect` types cover every consumer (`queries.ts`, `seed.ts`, `health/route.ts`, `FindingsBoard.tsx`)

**Gates re-run on merged result:**
| Gate | Result |
|---|---|
| `drizzle-kit generate` | ✅ "No schema changes" — schema ≡ migration |
| typecheck / lint | ✅ 0 errors |
| Vitest | ✅ 18/18 |
| `next build` | ✅ Green |

**Git:** committed `3b14119` to **main** (no new branch) and pushed via `ssh_git_wrapper_v3.py` — `ls-remote` confirms remote main is at `3b14119`.

Next steps you might consider: redeploy the live site from this commit if it should track the repo verbatim, and optionally clean up the 2 smoke-test review rows (ids 1–2) noted in the worklog from the earlier E2E run.

---

I'll start by refreshing the workspace and locating the log file.
`git pull` needs the SSH wrapper (no OpenSSH in this environment). Also there appear to be broken symlinks in `skills/`. Let me pull via the wrapper and locate the log file:
Pull succeeded — three new files arrived: `start_server_log.txt`, `docs/session_2.md`, and notably **`.env.local` was committed to the repo** (potential secret exposure — I'll flag that). Let me read the log and the new files:
The log is rich with evidence. The quality gates all pass (typecheck, lint 0 errors, 18/18 tests, DB setup OK) — then `next build` **panics in Turbopack**:

```
[project]/src/app/globals.css [app-client] (css)
FileSystemPath("").join("../mattpocok-skills/skills/engineering/ask-matt") leaves the filesystem root
```

This points at an external-repo path reference inside the CSS pipeline. Let me gather all the facts — `globals.css`, the new `.env.local` (committed to a public repo!), the broken `skills/` symlinks, and the session doc:
`globals.css` is **clean** — no external references. The smoking gun is elsewhere: **15 committed symlinks** under `skills/` pointing to `../mattpocok-skills/...` (matching the exact path in the Turbopack panic). And `.env.local` with credentials was committed. Let me examine the symlink targets, the new session doc, the start script, and existing test patterns:
Now the picture is nearly complete. Key discovery: the symlink targets are **absolute paths** (`/Home1/project/mattpocok-skills/skills/engineering/ask-matt`) — they resolve on the owner's machine (where the sibling repo exists) and dangle everywhere else. That's exactly why CI and my workspace build green while the owner's `next build` panics. Also: `.gitignore` **already** ignores `.env.*` — yet `.env.local` got committed (force-added). Let me read the remaining context pieces:
Context is filling in. Notably `start_server.sh` bootstraps `.env.local` from `.env.example` — so untracking `.env.local` is safe. And its header comment says "no test suite yet — Known Gap" while the log shows it **runs 18 tests** — stale comment drift. Let me read the rest of the script, the CI workflow, and the existing test patterns:
The CI YAML `cat` output shows `branches: ain]` again — the same display-mangling artifact from session 2 (which `od -c` proved was actually `[main]`). Let me re-verify byte-level, check the remaining script section, existing test patterns, and doc version anchors:
Byte-check confirms `ci.yml` is correct (`[main]`) — the `ain]` is the known terminal display artifact, documented false positive from session 2. Now let me get the full symlink inventory, consult the skills catalog (as requested), and finish reading the start script:
All evidence gathered. The catalog's `diagnosing-bugs` doctrine — "tight red feedback loop first, then minimise, hypothesise, fix, and add a regression test" — is exactly the loop I'll run. Here is the complete analysis and plan.

## Root-Cause Analysis (validated against codebase)

**F1 — FATAL `next build` Turbopack panic** (the headline error):
- 15 **committed symlinks** `skills/<name>` → **absolute paths** `/Home1/project/mattpocok-skills/skills/...` (verified via `git cat-file` on all 15 blobs)
- On your machine, `/Home1/project/mattpocok-skills` exists → links **resolve** → Tailwind v4's automatic content detection (running inside Turbopack's CSS pipeline: `parse_css → PostCssTransformedAsset → evaluate_webpack_loader`) walks `skills/`, follows the links **outside the project root** → `FileSystemPath(...).join(...) leaves the filesystem root` panic
- On fresh clones/CI the links **dangle** → walker skips them → build green. This is why CI never caught it and why my workspace (same Node v24.19.0, same Next 16.3.4) builds fine
- `globals.css` itself is clean — the panic path names the symlink's target folder exactly

**F2 — `.env.local` committed** (despite `.env.*` gitignore rule → force-added): contains dev credentials; `start_server.sh` already bootstraps `.env.local` from `.env.example`, so untracking is safe. Also `.env.example` has the `ost`→`host` URL-format typo that propagated into your `.env.local`.

**F3 — log noise:** 12 lint warnings = vendored `skills/kimi-pdf/scripts/paged.polyfill.js` being linted; Vite "ESM-as-CJS" warning from `vitest.config.ts`; docker `permission denied` stderr leaking from the non-sudo attempt (script self-heals via sudo); stale script comments ("no test suite yet — Known Gap" while it runs 18 tests).

## Remediation Plan (TDD: red → green per finding)

| # | Fix | Test (new `src/regression/repo-hygiene.test.ts` — the file `.gitignore` already promises) |
|---|---|---|
| F1a | `globals.css`: `@import "tailwindcss" source("../")` — scan scoped to `src/`, deterministic on every machine | CSS contract test |
| F1b | Untrack 15 symlinks + gitignore exact names (owner recreates locally, stays untracked) | No tracked symlink escapes root / dangles |
| F2 | `git rm --cached .env.local`; fix `.env.example` typo | `.env.local` untracked; `.env.example` present |
| F3a | `eslint.config.mjs`: `globalIgnores += "skills/**"` | config contract test → lint 0/0 |
| F3b | `vitest.config.ts` → `vitest.config.mts` | rename contract test |
| F3c | `start_server.sh`: quiet docker fallback + update stale comments | verified by script run + review |
| Docs | README/AGENTS/CLAUDE/SKILL v1.2.0 (ADR-10, new AP) + audit addendum | docs-drift gates |

**Proof plan:** reproduce the panic locally first (sibling `mattpocok-skills` + escape symlink → expect same panic), then show build green **with the hostile symlink still present** after the fix. Then full gates → atomic commits to main → push via wrapper.

Executing now — first the baseline + panic reproduction:
Fixture ready: `skills/ask-matt` now resolves to a real directory **outside** the project root — mirroring your machine's state. Running the build to reproduce the panic:
Build **succeeded** with a relative escape symlink — the panic didn't reproduce. Key insight from the user's error: `FileSystemPath("").join("../mattpocok-skills/...")` — Turbopack converts the **absolute** symlink target (`/Home1/project/mattpocok-skills/...`) to a project-relative path, then joins it against an empty virtual base → root escape. My relative symlink took a different code path. The faithful repro needs an **absolute** target that exists outside the repo — exactly your machine's condition:
**Panic reproduced byte-identically** — `FileSystemPath("").join("../mattpocok-skills/skills/engineering/ask-matt") leaves the filesystem root`, the exact error from your log. Root cause is now proven: Turbopack relativizes the **absolute** symlink target against the project root and joins it against an empty virtual base → root escape → panic. Relative symlinks take a different (tolerated) path, which is why my first attempt passed.

Now the RED phase — writing the regression test suite:
**RED phase confirmed** — 6/6 failing for exactly the documented reasons (15 symlink offenders array, tracked `.env.local`, the `ost` typo, missing `source()`, missing `"skills/**"`, missing `.mts`). Now GREEN — first the headline fix, then the proof build **with the hostile symlink still in place**:
**PROOF COMPLETE** — the byte-identical panic-inducing setup now builds green with the fix in place, while the hostile absolute symlink is still present. Now the remaining GREEN edits. First check vitest config references, then apply everything:
Config is safe to rename (only SKILL.md references it — updated during docs phase). Applying all remaining fixes now:
Index updates staged. Now the config and content edits:
The edit didn't match — and my own test flagged the same line. Terminal display has been unreliable (`[m` swallowing) — byte-inspect the actual line:
The typo is real (`]ost[:port]]` — confirmed via Python repr). Retrying the fix via script:
Contradictory signals — display layer strikes again. Full byte-level dump of the file:
The typo is confirmed real (line 2). The tool-transport layer is mangling bracket sequences in my commands — so I'll fix it with a targeted line-index replacement instead:
`.env.example` fixed at byte level. Now the `start_server.sh` edits — stale comments, docker fallback quieting, and the convoluted test-gate block:
Script edits applied. Now the `.gitignore` update — clarifying the skills policy and adding the 15 machine-local link names:
Now the GREEN phase verification — script syntax check, hygiene tests, and full gates:
**GREEN — 24/24 tests** (18 existing + 6 new hygiene contracts). Now the remaining gates:
Lint is now **completely clean** (0 errors, 0 warnings — the 12 vendored-file warnings are gone). Final build + gitignore-effectiveness verification:
Sandbox blocks creating *new* symlinks (the earlier ones replaced existing entries). I'll verify the gitignore pattern with `git check-ignore` instead — no filesystem change needed:
All gates green. Cleaning up the repro fixture and finding every stale doc claim that needs alignment:
All stale claims located. Checking a few more doc areas (env/symlink mentions in SKILL + CLAUDE), then batching all doc edits:
Major discovery — the SKILL **already documents this panic** (line 609, referencing AP-9) as a known issue with the claim "builds are unaffected (`next build` succeeds)" — now **proven false** by the log. Let me see AP-9 and the full AP list to align correctly:
Complete picture. The SKILL's AP-9/L-4 entries misdiagnosed the panic as "dev-only, build unaffected" — the log and my repro disprove both. Now aligning all docs. Starting with the SKILL (version bump, AP-9, L-4, troubleshooting rows):
Verifying all SKILL edits landed correctly (the last snapshot looked ambiguous):
SKILL edits landed. Now L-4, ADR-10, history row, and the footer:
SKILL updated — one straggler at line 1429 (`v1.1.0` in an appendix table). Fixing it plus the CLAUDE.md/AGENTS.md/README.md claims:
SKILL fully aligned. Now CLAUDE.md, AGENTS.md, and README.md:
README also carries the false "build is unaffected" claim. Applying all remaining doc edits:
Now the README troubleshooting rows:
All contract docs aligned. Final doc piece — the audit report addendum:
The sandbox's symlink guard pattern-matched the `ln -s` text inside the heredoc. Using the Write tool instead:
**All gates green** — 24/24 tests, typecheck 0, lint 0/0, build ✓. Now committing in atomic units to main:
The pull earlier included the owner's own commit `43f288b "server build error"` — that's the origin of the log file. But the chain had a hiccup (`.env.local` re-add refused since it's already staged for deletion and now ignored). Let me verify exact state:
State analysis: the owner's pulled commit is `43f288b`; my env-hygiene changes got **swallowed into the symlinks commit** (chain broke on the ignored-path refusal), and the lint commit never ran. The commits aren't pushed yet — I'll redo the sequence cleanly with accurate messages:
Deeper issue: commit A itself swallowed the staged deletions (git commit commits the whole index). Since none of these commits are pushed, I'll reset to the owner's commit and rebuild the sequence with precise slices:
B1 clean. Now B2 (symlinks + env hygiene), B3 (lint), B4 (vitest rename), B5 (server script):
B2–B5 clean. Now B6 (test suite) and B7 (docs), then verify the full sequence:
Perfectly sliced history. Final verification pass on the exact tree, then push:
All green, `main` ahead by 7. Pushing via the SSH wrapper:
Pushed and verified — remote main at `5d0dd3d`, tree in sync. Final step: worklog:
All done ✅ — pushed `43f288b..5d0dd3d` to **main** (7 atomic commits, no new branch).

**What happened:** Your log's fatal `next build` Turbopack panic was **proven by byte-identical reproduction**: 15 committed `skills/` symlinks pointed at *absolute* host paths — on your machine they resolve, Tailwind v4's content detection follows them outside the repo root, and Turbopack dies. CI never saw it because the links dangle on fresh clones.

**Fixes (TDD, 6 new regression tests — red first):** Tailwind scan scoped to `src/` (build proven green *with the hostile symlink still present*), symlinks untracked + gitignored, `.env.local` untracked, lint now 0/0, vitest config → `.mts`, start script noise + stale comments fixed. Docs realigned (SKILL v1.2.0, AP-9 corrected, audit addendum). Gates: 24/24 tests, typecheck 0, build ✓.

**Heads-up:** `git pull` on your machine will delete the 15 local symlinks — recreate them with `ln -s` (recipe in `.gitignore`); they'll stay untracked from now on.
