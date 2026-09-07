import { describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";

/**
 * Repo-hygiene regression suite — guards the build-portability contracts
 * discovered in the 2026-09-07 start_server_log triage:
 *
 *  F1  Committed symlinks that escape the repo root crash `next build` on
 *      machines where they resolve (Turbopack panic: FileSystemPath.join
 *      "leaves the filesystem root" — triggered by Tailwind v4 automatic
 *      content detection following the link). Dangling links pass CI, so
 *      this never showed up in CI — see docs/CODE_AUDIT_2026-09-07.md
 *      addendum. Guard: no tracked symlink may point outside the repo or
 *      dangle; Tailwind scan scope pinned to src/.
 *  F2  `.env.local` is machine-local (gitignored) — must never be tracked.
 *  F3  Vendored `skills/` trees are excluded from ESLint; the Vitest config
 *      uses the `.mts` extension so Vite loads it as ESM (no CJS warning).
 */
const ROOT = resolve(__dirname, "..", "..");

function git(args: string): string {
  return execSync(`git ${args}`, { cwd: ROOT, encoding: "utf8" }).trim();
}

describe("repo hygiene: tracked symlinks stay inside the repo", () => {
  it("has no tracked symlink whose target escapes the project root or dangles", () => {
    const offenders: string[] = [];
    for (const line of git("ls-files -s").split("\n")) {
      if (!line.trim()) continue;
      const [meta, path] = line.split("\t");
      const [mode, object] = meta.trim().split(/\s+/);
      if (mode !== "120000") continue; // 120000 = symlink entry
      const target = git(`cat-file -p ${object}`);
      const abs = resolve(ROOT, dirname(path), target);
      if (!abs.startsWith(ROOT + sep) || !existsSync(abs)) {
        offenders.push(`${path} -> ${target}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("repo hygiene: environment files", () => {
  it("does not track .env.local (machine-local secrets stay untracked)", () => {
    expect(git("ls-files .env.local")).toBe("");
  });

  it("ships a .env.example template for start_server.sh to bootstrap from", () => {
    const example = readFileSync(join(ROOT, ".env.example"), "utf8");
    expect(example).toMatch(/^DATABASE_URL="/m);
    // URL-format doc line must be well-formed: [user[:password]@]host[:port][/db][?options]
    expect(example).not.toMatch(/\]ost\[/);
    expect(example).toMatch(/\]host\[:port\]\[\//);
  });
});

describe("repo hygiene: CSS scan scope", () => {
  it("scopes Tailwind automatic content detection to src/ in globals.css", () => {
    const css = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");
    expect(css).toMatch(/@import\s+"tailwindcss"\s+source\("\.\.\/"\);/);
    // No external-repo references may re-enter the CSS pipeline.
    expect(css).not.toContain("mattpocok");
  });
});

describe("repo hygiene: tooling configs", () => {
  it("configures ESLint to ignore vendored skills/ trees", () => {
    const cfg = readFileSync(join(ROOT, "eslint.config.mjs"), "utf8");
    expect(cfg).toContain('"skills/**"');
  });

  it("uses vitest.config.mts so Vite loads the ESM config natively", () => {
    expect(existsSync(join(ROOT, "vitest.config.mts"))).toBe(true);
    expect(existsSync(join(ROOT, "vitest.config.ts"))).toBe(false);
  });
});
