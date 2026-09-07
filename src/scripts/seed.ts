#!/usr/bin/env tsx
/**
 * Nave & Spire — Database Seeder
 *
 * Idempotent, race-safe seeding via ensureSeeded(). Can be run standalone
 * (npm run db:seed) or as the final step of `npm run db:setup` after
 * `drizzle-kit generate` + `migrate` have created the 6 tables.
 *
 * Usage:
 *   npx tsx --env-file=.env.local src/scripts/seed.ts
 *   npm run db:seed
 *   DATABASE_URL="postgresql://..." npm run db:seed
 *
 * Env: DATABASE_URL is required. Loaded from --env-file, .env.local, .env,
 *      or the shell. See src/db/index.ts for the throw if absent.
 */

import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Load env files in Next.js priority order: .env.local > .env
// (tsx --env-file already handles this, but we also support direct `node` runs)
for (const file of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) {
    config({ path, override: false });
  }
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("✖ DATABASE_URL is required.");
    console.error("  Set it in .env.local (see .env.example) or pass it inline:");
    console.error('  DATABASE_URL="postgresql://user:pass@host:5432/db" npm run db:seed');
    process.exit(1);
  }

  // Mask password in logs
  const masked = url.replace(/:\/\/([^:]+):[^@]+@/, "://$1:****@");
  console.log(`→ DATABASE_URL: ${masked}`);

  // Dynamic imports after env is ready (src/db/index.ts throws if DATABASE_URL absent)
  const { getFullAudit } = await import("@/lib/queries");
  const { db } = await import("@/db");
  const { sql } = await import("drizzle-orm");

  // Quick connectivity check before seeding
  try {
    await db.execute(sql`select 1 as ok`);
    console.log("✓ DB connectivity OK (select 1)");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("✖ DB connectivity failed (select 1):", msg);
    console.error("  Is the postgres container running? Try: sudo docker compose up -d");
    process.exit(1);
  }

  // Idempotent seed — inserts 2 sites, 10 criteria, 20 scores, 10 findings, 36 tokens
  // on first run; no-op on subsequent runs (checked via select limit 1 on sites)
  console.log("→ Seeding (ensureSeeded)…");
  try {
    const before = Date.now();
    const audit = await getFullAudit();
    const ms = Date.now() - before;

    console.log(`✓ Seed OK in ${ms}ms`);
    console.log(`  Sites:    ${audit.sites.length} (${audit.sites.map((s) => `${s.site.slug} ${s.site.overallScore} (${s.scores.length} scores, ${s.tokens.length} tokens)`).join(" | ")})`);
    console.log(`  Criteria: ${audit.criteria.length} (${audit.criteria.map((c) => c.slug).join(", ")})`);
    console.log(`  Findings: ${audit.findings.length} (${audit.findings.map((f) => f.severity).join(", ")})`);
    console.log(`  Reviews:  ${audit.reviews.length} (user-generated, not seeded)`);

    // Verify expected counts for a fresh production DB
    const expected = { sites: 2, criteria: 10, findings: 10, scoresPerSite: 10, tokensPerSite: 18 };
    const ok =
      audit.sites.length === expected.sites &&
      audit.criteria.length === expected.criteria &&
      audit.findings.length === expected.findings &&
      audit.sites.every((s) => s.scores.length === expected.scoresPerSite && s.tokens.length === expected.tokensPerSite);

    if (!ok) {
      console.warn("⚠ Seed counts differ from expected fresh-DB snapshot — check audit-data.ts or run with a clean DB (docker compose down -v).");
    } else {
      console.log("✓ Counts match expected fresh-DB snapshot (2 / 10 / 10 / 10×2 / 18×2).");
    }

    // Gracefully close the pool so the process exits
    const { pool } = await import("@/db");
    await pool.end();
    console.log("✓ Done. Database is ready for production.");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("✖ Seeding failed:", msg);
    if (msg.includes("does not exist") || msg.includes("relation") || msg.includes("table")) {
      console.error("  Tables are missing — run migrations first:");
      console.error("  npm run db:generate && npm run db:migrate && npm run db:seed");
      console.error("  Or fresh: npx drizzle-kit push  (dev only, no migration file)");
    }
    try {
      const { pool } = await import("@/db");
      await pool.end();
    } catch {
      // ignore
    }
    process.exit(1);
  }
}

main();
