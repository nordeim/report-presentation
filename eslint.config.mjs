import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  // Keep the starter on the flat config export that actually runs under the pinned ESLint/Next toolchain.
  ...nextCoreWebVitals,
  // skills/ is vendored agent tooling (incl. 32k-line polyfills) — not project
  // code; linting it produced 12 permanent warnings. Contract-pinned by
  // src/regression/repo-hygiene.test.ts.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "skills/**"]),
]);
