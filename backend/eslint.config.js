import js from '@eslint/js';

export default [
  {
    ignores: ['node_modules/**'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { args: 'none' }],
    },
  },
];
