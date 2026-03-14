import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export const baseConfig = tseslint.config(
  { ignores: ["dist", "build", "coverage"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
  },
);
