import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
 
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/**",
        "tests/**",
        "*.config.*",
        ".next/**",
        "src/app/**/page.tsx",
        "src/app/**/layout.tsx",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "tests/e2e"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
