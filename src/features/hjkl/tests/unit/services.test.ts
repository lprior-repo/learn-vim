// Unit tests for HJKL service functions
import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { 
  HjklMovementService,
  createMovementService,
  executeMovement,
  validateAndExecuteMovement,
  registerHjklCommands,
  trackMovementProgress
} from '../../services'
import { Position, EditorBounds, MovementResult, LearningProgress } from '../../types'

// Mock Monaco editor interface
const mockEditor = {
  getPosition: jest.fn(),
  setPosition: jest.fn(),
  getModel: jest.fn(),
  addCommand: jest.fn(),
  onDidChangeCursorPosition: jest.fn()
}

describe('HJKL Services', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('HjklMovementService', () => {
    test('should create service with editor instance', () => {
      const service = new HjklMovementService(mockEditor)
      
      expect(service).toBeDefined()
      expect(service.getEditor()).toBe(mockEditor)
    })

    test('should execute h movement successfully', async () => {
      mockEditor.getPosition.mockReturnValue({ lineNumber: 5, column: 10 })
      mockEditor.getModel.mockReturnValue({ getLineCount: () => 20, getLineMaxColumn: () => 30 })
      
      const service = new HjklMovementService(mockEditor)
      const result = await service.executeMovement('h')
      
      expect(result.success).toBe(true)
      expect(mockEditor.setPosition).toHaveBeenCalledWith({ lineNumber: 5, column: 9 })
    })

    test('should execute j movement successfully', async () => {
      mockEditor.getPosition.mockReturnValue({ lineNumber: 5, column: 10 })
      mockEditor.getModel.mockReturnValue({ getLineCount: () => 20, getLineMaxColumn: () => 30 })
      
      const service = new HjklMovementService(mockEditor)
      const result = await service.executeMovement('j')
      
      expect(result.success).toBe(true)
      expect(mockEditor.setPosition).toHaveBeenCalledWith({ lineNumber: 6, column: 10 })
    })

    test('should execute k movement successfully', async () => {
      mockEditor.getPosition.mockReturnValue({ lineNumber: 5, column: 10 })
      mockEditor.getModel.mockReturnValue({ getLineCount: () => 20, getLineMaxColumn: () => 30 })
      
      const service = new HjklMovementService(mockEditor)
      const result = await service.executeMovement('k')
      
      expect(result.success).toBe(true)
      expect(mockEditor.setPosition).toHaveBeenCalledWith({ lineNumber: 4, column: 10 })
    })

    test('should execute l movement successfully', async () => {
      mockEditor.getPosition.mockReturnValue({ lineNumber: 5, column: 10 })
      mockEditor.getModel.mockReturnValue({ getLineCount: () => 20, getLineMaxColumn: () => 30 })
      
      const service = new HjklMovementService(mockEditor)
      const result = await service.executeMovement('l')
      
      expect(result.success).toBe(true)
      expect(mockEditor.setPosition).toHaveBeenCalledWith({ lineNumber: 5, column: 11 })
    })

    test('should handle boundary collision gracefully', async () => {
      mockEditor.getPosition.mockReturnValue({ lineNumber: 1, column: 1 })
      mockEditor.getModel.mockReturnValue({ getLineCount: () => 20, getLineMaxColumn: () => 30 })
      
      const service = new HjklMovementService(mockEditor)
      const result = await service.executeMovement('h')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(mockEditor.setPosition).not.toHaveBeenCalled()
    })

    test('should get current position correctly', () => {
      mockEditor.getPosition.mockReturnValue({ lineNumber: 7, column: 15 })
      
      const service = new HjklMovementService(mockEditor)
      const position = service.getCurrentPosition()
      
      expect(position).toEqual({ line: 6, column: 14 }) // Convert from 1-based to 0-based
    })

    test('should get editor bounds correctly', () => {
      mockEditor.getModel.mockReturnValue({ 
        getLineCount: () => 25, 
        getLineMaxColumn: (line: number) => line === 1 ? 40 : 35 
      })
      
      const service = new HjklMovementService(mockEditor)
      const bounds = service.getEditorBounds()
      
      expect(bounds.maxLine).toBe(24) // Convert from 1-based to 0-based
      expect(bounds.maxColumn).toBeGreaterThan(0)
    })
  })

  describe('createMovementService', () => {
    test('should create service factory function', () => {
      const factory = createMovementService()
      
      expect(typeof factory).toBe('function')
    })

    test('should create service instance from factory', () => {
      const factory = createMovementService()
      const service = factory(mockEditor)
      
      expect(service).toBeInstanceOf(HjklMovementService)
    })
  })

  describe('executeMovement', () => {
    const position: Position = { line: 5, column: 10 }
    const bounds: EditorBounds = { maxLine: 20, maxColumn: 30 }

    test('should execute movement and return result', () => {
      const result = executeMovement(position, 'h', bounds)
      
      expect(result.success).toBe(true)
      expect(result.newPosition).toEqual({ line: 5, column: 9 })
      expect(Object.isFrozen(result)).toBe(true)
    })

    test('should handle invalid movement', () => {
      const invalidPosition: Position = { line: 0, column: 0 }
      const result = executeMovement(invalidPosition, 'h', bounds)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(Object.isFrozen(result)).toBe(true)
    })
  })

  describe('validateAndExecuteMovement', () => {
    const bounds: EditorBounds = { maxLine: 20, maxColumn: 30 }

    test('should validate and execute valid movement', () => {
      const position: Position = { line: 5, column: 10 }
      const result = validateAndExecuteMovement(position, 'j', bounds)
      
      expect(result.success).toBe(true)
      expect(result.newPosition).toEqual({ line: 6, column: 10 })
    })

    test('should reject invalid key', () => {
      const position: Position = { line: 5, column: 10 }
      const result = validateAndExecuteMovement(position, 'x', bounds)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid HJKL key')
    })

    test('should reject movement outside bounds', () => {
      const position: Position = { line: 0, column: 0 }
      const result = validateAndExecuteMovement(position, 'k', bounds)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('registerHjklCommands', () => {
    test('should register all 4 HJKL commands', () => {
      const commandCallbacks = new Map()
      const mockRegister = jest.fn((key, callback) => {
        commandCallbacks.set(key, callback)
      })
      
      registerHjklCommands(mockRegister)
      
      expect(mockRegister).toHaveBeenCalledTimes(4)
      expect(mockRegister).toHaveBeenCalledWith('h', expect.any(Function))
      expect(mockRegister).toHaveBeenCalledWith('j', expect.any(Function))
      expect(mockRegister).toHaveBeenCalledWith('k', expect.any(Function))
      expect(mockRegister).toHaveBeenCalledWith('l', expect.any(Function))
    })

    test('should register commands with correct callbacks', () => {
      let registeredCommands: Map<string, Function> = new Map()
      const mockRegister = jest.fn((key, callback) => {
        registeredCommands.set(key, callback)
      })
      
      registerHjklCommands(mockRegister)
      
      // Test that callbacks are functions
      expect(typeof registeredCommands.get('h')).toBe('function')
      expect(typeof registeredCommands.get('j')).toBe('function')
      expect(typeof registeredCommands.get('k')).toBe('function')
      expect(typeof registeredCommands.get('l')).toBe('function')
    })
  })

  describe('trackMovementProgress', () => {
    test('should track successful movement', () => {
      const initialProgress: LearningProgress = {
        completedCommands: [],
        currentChallenge: 'basic-movement',
        score: 0
      }
      
      const result = trackMovementProgress(initialProgress, 'h', true)
      
      expect(result.completedCommands).toContain('h')
      expect(result.score).toBeGreaterThan(0)
      expect(Object.isFrozen(result)).toBe(true)
    })

    test('should not change score for failed movement', () => {
      const initialProgress: LearningProgress = {
        completedCommands: [],
        currentChallenge: 'basic-movement',
        score: 10
      }
      
      const result = trackMovementProgress(initialProgress, 'h', false)
      
      expect(result.score).toBe(10)
      expect(result.completedCommands).not.toContain('h')
    })

    test('should not duplicate completed commands', () => {
      const initialProgress: LearningProgress = {
        completedCommands: ['h'],
        currentChallenge: 'basic-movement',
        score: 10
      }
      
      const result = trackMovementProgress(initialProgress, 'h', true)
      
      expect(result.completedCommands.filter(cmd => cmd === 'h')).toHaveLength(1)
    })

    test('should return immutable progress', () => {
      const initialProgress: LearningProgress = {
        completedCommands: [],
        currentChallenge: 'basic-movement',
        score: 0
      }
      
      const result = trackMovementProgress(initialProgress, 'j', true)
      
      expect(Object.isFrozen(result)).toBe(true)
      expect(Object.isFrozen(result.completedCommands)).toBe(true)
    })
  })
})