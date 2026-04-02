module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.app.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // any 타입 금지
    '@typescript-eslint/no-explicit-any': 'error',
    // 미사용 변수 오류
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // non-null assertion 금지
    '@typescript-eslint/no-non-null-assertion': 'error',
    // 명시적 반환 타입 요구 (함수)
    '@typescript-eslint/explicit-function-return-type': 'off',
    // 명시적 모듈 경계 타입
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // floating promise 금지
    '@typescript-eslint/no-floating-promises': 'error',
    // unsafe 규칙들
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    // 일반 규칙
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: ['dist/', 'node_modules/', 'vite.config.ts', 'coverage/'],
};
