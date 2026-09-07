import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

// Load env in Next.js priority: .env.local > .env > process.env
// drizzle-kit does not auto-load .env.local, so we do it here.
for (const file of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) {
    config({ path, override: false });
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  // Keep the local default for `npx drizzle-kit generate` on a fresh clone
  // where .env.local may not yet exist (e.g., CI with dummy URL).
  // Throwing here would break `generate` which only needs schema, not DB.
  console.warn("⚠ DATABASE_URL not set — using fallback nave_spire_dev for drizzle-kit. Set DATABASE_URL in .env.local or env for migrate/seed.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // Fallback keeps `generate` working without DB; `migrate`/`seed` will fail fast if URL is wrong.
    url: url ?? "postgresql://nave_spire_user:nave_spire_secret@127.0.0.1:5432/nave_spire_dev",
  },
  verbose: true,
  strict: true,
});
