// React Testing Library integration test setup for HJKL feature
import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// Configure testing library
configure({ testIdAttribute: 'data-testid' })

// Mock Monaco Editor
global.monaco = {
  editor: {
    create: jest.fn().mockReturnValue({
      dispose: jest.fn(),
      getValue: jest.fn().mockReturnValue(''),
      setValue: jest.fn(),
      getPosition: jest.fn().mockReturnValue({ lineNumber: 1, column: 1 }),
      setPosition: jest.fn(),
      onDidChangeCursorPosition: jest.fn(),
      addCommand: jest.fn(),
      getModel: jest.fn().mockReturnValue({
        getLineCount: jest.fn().mockReturnValue(10),
        getLineMaxColumn: jest.fn().mockReturnValue(20)
      })
    }),
    defineTheme: jest.fn()
  }
}

// Mock window.require for Monaco
global.require = jest.fn()

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// Setup localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock