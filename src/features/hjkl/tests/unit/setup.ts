// Jest unit test setup for HJKL feature
import '@testing-library/jest-dom'

// Mock Monaco editor globals
global.monaco = {
  editor: {
    create: jest.fn(),
    defineTheme: jest.fn()
  }
}

// Mock window.require for Monaco
global.require = jest.fn()

// Setup console mocks
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn()
}