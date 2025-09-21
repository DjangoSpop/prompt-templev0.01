/* eslint-disable @typescript-eslint/no-var-requires */
// Flat ESLint config focused on TS and our project rules.
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const nextPlugin = require('@next/eslint-plugin-next');
const reactHooks = require('eslint-plugin-react-hooks');

module.exports = [
  // Global ignores (replacement for .eslintignore)
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'coverage/**'],
  },
  {
    ignores: [
      // Ignore known WIP/legacy files that have parse issues
      'src/app/optimization/page-old.tsx',
      'src/app/page-old.tsx',
      'src/components/templates/enhanced-template-detail-component.tsx',
    ],
  },

  // Next.js recommended rules (flat config)
  nextPlugin.flatConfig.recommended,

  // TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
    plugins: { '@typescript-eslint': tsPlugin, 'react-hooks': reactHooks },
    rules: {
      // Relax strict rules so the codebase can pass lint while types improve
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
