import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'node_modules/', 'coverage/'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/sim/**', 'src/core/**', 'src/data/**', 'src/i18n/**'],
    languageOptions: { globals: {} },
    rules: {
      // Simulácia musí bežať headless a deterministicky (testy, balans skripty).
      'no-restricted-globals': ['error', 'window', 'document', 'localStorage', 'navigator'],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Použi seedovaný RNG (src/core/rng.js).' },
      ],
    },
  },
  {
    files: ['tests/**', 'scripts/**', '*.config.js'],
    languageOptions: { globals: { ...globals.node } },
  },
];
