import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginN from 'eslint-plugin-n';
// turns off the rules that would fight Prettier; Prettier itself runs as its
// own `lint:format` script rather than as an ESLint rule
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginN.configs['flat/recommended'],
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      // `bin` names the built file; this tells `n/hashbang` which source it is
      n: { convertPath: [{ include: ['lib/**/*.ts'], replace: ['^lib/(.+)\\.ts$', 'dist/$1.js'] }] },
    },
    rules: {
      semi: ['error', 'always'],
      'n/prefer-node-protocol': 'error',
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
    },
  },
  {
    // these run on the pinned `devEngines.runtime`, not on what `engines` allows
    files: ['test/**', '*.config.*'],
    rules: {
      'n/no-unsupported-features/node-builtins': 'off',
    },
  },
  {
    // `describe` and `it` from `node:test` return promises the runner awaits
    files: ['test/**'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
  {
    ignores: ['dist/**', 'coverage/**'],
  },
);
