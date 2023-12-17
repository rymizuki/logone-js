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
    project: ['./tsconfig.eslint.json']
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  ignorePatterns: ['src/**/*.js'],
  rules: {},
  overrides: [
    {
      files: ['**/*.{spec,test}.{ts,tsx}'],
      env: {}
    }
  ]
}
