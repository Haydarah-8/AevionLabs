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
    // Agent/skill reference files — not part of the app bundle.
    ".agents/**",
    ".cursor/**",
    // One-off Node script (CommonJS); not part of the Next app bundle.
    "fetch-icons.js",
  ]),
  {
    rules: {
      /**
       * Honour the leading underscore the codebase already uses to mark a
       * binding as deliberately unused.
       *
       * Without this the convention is decorative: `isAdminRequest(_request)`
       * keeps the parameter for signature compatibility, and
       * `const { content: _content, ...rest } = post` exists precisely to drop
       * a field. Both were reported as mistakes, which trains the reader to
       * scroll past warnings — the opposite of what a linter is for.
       */
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]);

export default eslintConfig;
