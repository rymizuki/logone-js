const path = require('path')

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    es6: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2023,
    project: ['./base.json'],
    tsconfigRootDir: path.resolve(__dirname, '../tsconfig')
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  ignorePatterns: ['.eslintrc.js', 'build', 'tsup.config.ts'],
  rules: {},
  overrides: [
    {
      files: ['**/*.{spec,test}.{ts,tsx}'],
      env: {}
    }
  ]
}
