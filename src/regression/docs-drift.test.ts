import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Recursively collect files under src/ with the given extensions.
 */
function collectSourceFiles(dir: string, exts: string[]): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectSourceFiles(full, exts));
    } else if (exts.some((ext) => entry.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

const SRC_ROOT = join(__dirname, "..");

describe("regression: retired identifiers never reappear in src/", () => {
  it("contains no reference to the retired 'maison_dev' database", () => {
    // C3: error.tsx shipped a DB hint naming maison_dev after the cred migration
    // to nave_spire_dev (SKILL.md AP-10). This test pins the migration.
    const offenders = collectSourceFiles(SRC_ROOT, [".ts", ".tsx"])
      .filter((file) => !file.includes(".test."))
      .filter((file) => readFileSync(file, "utf8").includes("maison"));
    expect(offenders).toEqual([]);
  });
});
