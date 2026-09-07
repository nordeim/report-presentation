import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// import.meta.dirname (Node >= 20.11) — Vite deprecates the CJS dirname global
// under the native config loader; pinned by src/regression/docs-contract.test.ts.
const here = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "skills/**"],
    globals: false,
  },
  resolve: {
    alias: {
      "@": resolve(here, "./src"),
    },
  },
});
