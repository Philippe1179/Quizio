import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Downgrade to warning — existing codebase uses conditional setState
      // in effects intentionally (auth guards, timer expiry). These patterns
      // are correct and don't cause infinite loops.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]);

export default eslintConfig;
