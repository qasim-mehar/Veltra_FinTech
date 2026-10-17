import { defineConfig } from "vitest/config";

// Minimal config, deliberately separate from Next.js builds. Pure-function tests
// only for M0 — no database, no server, no React.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
