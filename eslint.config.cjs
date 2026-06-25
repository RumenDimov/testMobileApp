const tseslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');

module.exports = tseslint.config(
  {
    ignores: [
      'node_modules/',
      '.expo/',
      'dist/',
      'web-build/',
      'coverage/',
      'eslint.config.cjs',
      'metro.config.js',
      'tailwind.config.js',
    ],
  },
  tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
    },
  },
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/jsx-no-bind': 'off',
    },
  },
  reactHooksPlugin.configs.flat['recommended-latest'],
  {
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
);
