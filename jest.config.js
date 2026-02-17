module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/config/',
  ],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js',
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!server.js', // Exclude server.js from coverage (it's just bootstrap)
  ],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 30,
      lines: 35,
      statements: 35,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  verbose: true,
  testTimeout: 30000,
};
