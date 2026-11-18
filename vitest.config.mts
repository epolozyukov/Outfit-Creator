import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.*",
        "src/test/**",
        "src/types/**",
        "src/app/layout.tsx",
      ],
      reporter: ["text", "html", "lcov"],
      thresholds: {
        statements: 85,
        lines: 85,
        functions: 85,
        branches: 80,
        "src/lib/**": {
          statements: 100,
          lines: 100,
          functions: 100,
          branches: 95,
        },
      },
    },
  },
});
