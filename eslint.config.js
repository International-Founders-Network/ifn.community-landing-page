import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // `.netlify` holds esbuild-bundled function output produced by `netlify dev`.
  // It is generated, gitignored, and vendored third-party code — linting it only
  // ever reports on other people's bundles.
  //
  // `.claude/worktrees` holds ephemeral agent git worktrees, each a full copy of
  // this repo — including `apps/`. The `apps` pattern above is anchored to the
  // config's base path, so it only covers root-level `apps/` and does NOT stop
  // ESLint walking into `.claude/worktrees/<id>/apps/qr`. Linting that nested
  // copy violates the rule in AGENTS.md that root tooling never reaches into
  // `apps/` (it is an independent codebase with its own eslint config), so the
  // worktree root has to be ignored explicitly.
  globalIgnores(['dist', 'apps', '.netlify', '.claude/worktrees', '.claude/worktrees/**']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
