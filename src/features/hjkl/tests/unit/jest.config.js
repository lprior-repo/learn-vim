// Jest configuration for HJKL unit tests
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/../../../$1'
  },
  collectCoverageFrom: [
    '../../../**/*.{ts,tsx}',
    '!../../../**/*.test.{ts,tsx}',
    '!../../../**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/**/*.test.{ts,tsx}'
  ]
}