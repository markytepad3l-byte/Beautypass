/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '@beautypass/shared': '<rootDir>/../../packages/shared/src',
  },
  globalSetup: './tests/setup.ts',
  globalTeardown: './tests/teardown.ts',
}
