import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "prefer-const": "error",
      "curly": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    }
  },
  {
    files: [
      "src/app/api/ai/chat/**/*.ts",
      "src/app/api/carbon/calculate/**/*.ts",
      "src/lib/validation.ts",
      "src/lib/carbon-calculator.ts"
    ],
    rules: {
      "@typescript-eslint/explicit-function-return-type": ["warn", { "allowExpressions": true }],
      "no-console": ["error", { "allow": ["warn"] }],
      "@typescript-eslint/consistent-type-imports": "error",
      "eqeqeq": ["error", "always"],
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
