import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "public", "playwright-report", "test-results", ".revision"],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ["src/**/*.ts"],
    languageOptions: { globals: globals.browser },
    rules: { "no-console": "error" },
  },
  {
    files: ["scripts/**", "tests/**", "*.config.{js,ts}"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    rules: {
      eqeqeq: ["error", "always"],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  prettier,
);
