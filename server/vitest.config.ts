import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["**/*.d.ts", "**/node_modules/**"],
      thresholds: {
        statements: 28,
        branches: 22,
        functions: 28,
        lines: 28,
        "src/services/ResourceService.ts": {
          statements: 88,
          branches: 55,
          functions: 100,
          lines: 88
        },
        "src/middleware/authTier.ts": {
          statements: 70,
          branches: 25,
          functions: 100,
          lines: 70
        },
        "src/domain/**/*.ts": {
          statements: 80,
          branches: 90,
          functions: 65,
          lines: 75
        }
      }
    }
  }
});
