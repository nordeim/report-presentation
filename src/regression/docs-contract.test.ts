import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Living-docs contract suite (Session 5, docs/CODE_AUDIT_2026-09-08.md M-B/L-A/L-B).
 *
 * The 2026-09-07/08 audits found the same failure mode twice: the four living
 * docs (AGENTS.md, CLAUDE.md, README.md, nave-spire_SKILL.md) drifted from the
 * code they describe — stale test counts, retired lint-noise claims, superseded
 * tool versions, a machine-specific path — while every countable claim is
 * supposed to be re-runnable from the doc (SKILL.md contract).
 *
 * These tests pin the corrected state so the drift cannot silently return:
 *  1. Retired strings must never reappear in a living doc.
 *  2. The docs must pin the CURRENT test-suite count — bump the docs in the
 *     same commit whenever you add tests (that is the contract, not a bug).
 *  3. next.config.ts keeps `poweredByHeader: false` (audit L-A).
 *  4. vitest.config.mts uses `import.meta.dirname` (audit L-B — Vite
 *     deprecates `__dirname` under the native config loader).
 */
const ROOT = resolve(__dirname, "..", "..");

function doc(name: string): string {
  return readFileSync(join(ROOT, name), "utf8");
}

const LIVING_DOCS = ["AGENTS.md", "CLAUDE.md", "README.md", "nave-spire_SKILL.md"];

/** Strings that described a superseded state and were corrected 2026-09-08. */
const RETIRED_STRINGS: Array<{ doc: string; stale: string; because: string }> = [
  { doc: "nave-spire_SKILL.md", stale: "18 unit/component tests", because: "suite outgrew 18 (24 at audit time)" },
  { doc: "nave-spire_SKILL.md", stale: "12 `skills/` warnings are expected noise", because: "skills/** lint-ignored since v1.2.0 — lint is 0/0" },
  { doc: "nave-spire_SKILL.md", stale: "12 skills/ warnings ignored", because: "skills/** lint-ignored since v1.2.0 — lint is 0/0" },
  { doc: "nave-spire_SKILL.md", stale: "postcss@8.5.8", because: "lockfile ships postcss 8.5.28" },
  { doc: "nave-spire_SKILL.md", stale: "| `4.1.17` + `@tailwindcss/postcss@4.1.17`", because: "lockfile ships tailwindcss 4.3.3 (postcss plugin stays 4.1.17)" },
  { doc: "nave-spire_SKILL.md", stale: "`9.39.4` / `16.2.6`", because: "lockfile ships eslint 9.39.5 / eslint-config-next 16.3.4" },
  { doc: "README.md", stale: "Tailwind%20CSS-4.1.17", because: "lockfile ships tailwindcss 4.3.3" },
  { doc: "README.md", stale: "| Styling | Tailwind CSS | 4.1.17 |", because: "lockfile ships tailwindcss 4.3.3" },
  { doc: "CLAUDE.md", stale: "Must match docker-compose.yml + drizzle.config.json", because: "drizzle.config.ts is the env-aware primary; .json is fallback" },
  { doc: "CLAUDE.md", stale: "/Home1/project/", because: "machine-specific absolute path" },
  { doc: "CLAUDE.md", stale: "Ignores `.next/`, `out/`, `build/`, `next-env.d.ts`.", because: "globalIgnores also covers skills/** (repo-hygiene pinned)" },
];

describe("living docs stay in sync with the codebase", () => {
  it("contains no retired strings in the four living docs", () => {
    const offenders: string[] = [];
    for (const { doc: name, stale, because } of RETIRED_STRINGS) {
      if (doc(name).includes(stale)) {
        offenders.push(`${name}: "${stale}" — ${because}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("pins the current test-suite count (29) in all four living docs", () => {
    // Contract: when you add tests, update the count in the same commit.
    expect(doc("README.md")).toMatch(/tests-vitest%2029%2F29/);
    expect(doc("AGENTS.md")).toContain("29 unit/component/regression tests");
    expect(doc("CLAUDE.md")).toContain("29 tests");
    expect(doc("nave-spire_SKILL.md")).toContain("29 unit/component/regression tests");
    expect(doc("nave-spire_SKILL.md")).toContain("29 via `vitest run`");
  });

  it("describes the review rate limiter as per-instance best-effort (live-verified)", () => {
    // Audit M-A: the live host answers from more than one instance, so the
    // 5 req/min window is enforced best-effort — docs must not claim more.
    expect(doc("README.md")).toMatch(/best-effort across instances/);
    expect(doc("nave-spire_SKILL.md")).toMatch(/best-effort across instances/);
    expect(doc("CLAUDE.md")).toMatch(/best-effort across instances/);
    expect(doc("AGENTS.md")).toMatch(/best-effort across instances/);
  });
});

describe("tooling contracts (Session 5)", () => {
  it("disables the x-powered-by header in next.config.ts", async () => {
    const config = (await import("../../next.config")) as { default: { poweredByHeader?: boolean } };
    expect(config.default.poweredByHeader).toBe(false);
  });

  it("keeps vitest.config.mts free of the deprecated __dirname", () => {
    const config = doc("vitest.config.mts");
    expect(config).not.toContain("__dirname");
    expect(config).toContain("import.meta.dirname");
  });
});
