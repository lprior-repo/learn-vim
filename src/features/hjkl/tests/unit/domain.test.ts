// Unit tests for HJKL domain functions
import { describe, test, expect } from '@jest/globals'
import { 
  createVimCommand, 
  calculatePosition, 
  validateMovement,
  isValidHjklKey,
  getMovementDirection,
  applyMovement
} from '../../domain'
import { VimCommand, Position, MovementResult, EditorBounds } from '../../types'

describe('HJKL Domain Functions', () => {
  describe('createVimCommand', () => {
    test('should create immutable VimCommand for h key', () => {
      const command = createVimCommand({
        id: 'move-left',
        keySequence: 'h',
        description: 'Move cursor left',
        category: 'basic-movement',
        difficulty: 'beginner' as const,
        availableInModes: ['normal', 'visual']
      })

      expect(command.id).toBe('move-left')
      expect(command.keySequence).toBe('h')
      expect(command.description).toBe('Move cursor left')
      expect(command.category).toBe('basic-movement')
      expect(command.difficulty).toBe('beginner')
      expect(command.availableInModes).toEqual(['normal', 'visual'])
      expect(Object.isFrozen(command)).toBe(true)
    })

    test('should create immutable VimCommand for j key', () => {
      const command = createVimCommand({
        id: 'move-down',
        keySequence: 'j',
        description: 'Move cursor down',
        category: 'basic-movement',
        difficulty: 'beginner' as const,
        availableInModes: ['normal']
      })

      expect(command.id).toBe('move-down')
      expect(command.keySequence).toBe('j')
      expect(Object.isFrozen(command)).toBe(true)
    })

    test('should create immutable VimCommand for k key', () => {
      const command = createVimCommand({
        id: 'move-up',
        keySequence: 'k',
        description: 'Move cursor up',
        category: 'basic-movement',
        difficulty: 'beginner' as const,
        availableInModes: ['normal']
      })

      expect(command.id).toBe('move-up')
      expect(command.keySequence).toBe('k')
      expect(Object.isFrozen(command)).toBe(true)
    })

    test('should create immutable VimCommand for l key', () => {
      const command = createVimCommand({
        id: 'move-right',
        keySequence: 'l',
        description: 'Move cursor right',
        category: 'basic-movement',
        difficulty: 'beginner' as const,
        availableInModes: ['normal']
      })

      expect(command.id).toBe('move-right')
      expect(command.keySequence).toBe('l')
      expect(Object.isFrozen(command)).toBe(true)
    })
  })

  describe('calculatePosition', () => {
    const bounds: EditorBounds = { maxLine: 10, maxColumn: 20 }

    test('should calculate new position for h (left) movement', () => {
      const currentPos: Position = { line: 5, column: 10 }
      const result = calculatePosition(currentPos, 'h', bounds)
      
      expect(result.success).toBe(true)
      expect(result.newPosition).toEqual({ line: 5, column: 9 })
      expect(result.error).toBeUndefined()
    })

    test('should calculate new position for j (down) movement', () => {
      const currentPos: Position = { line: 5, column: 10 }
      const result = calculatePosition(currentPos, 'j', bounds)
      
      expect(result.success).toBe(true)
      expect(result.newPosition).toEqual({ line: 6, column: 10 })
      expect(result.error).toBeUndefined()
    })

    test('should calculate new position for k (up) movement', () => {
      const currentPos: Position = { line: 5, column: 10 }
      const result = calculatePosition(currentPos, 'k', bounds)
      
      expect(result.success).toBe(true)
      expect(result.newPosition).toEqual({ line: 4, column: 10 })
      expect(result.error).toBeUndefined()
    })

    test('should calculate new position for l (right) movement', () => {
      const currentPos: Position = { line: 5, column: 10 }
      const result = calculatePosition(currentPos, 'l', bounds)
      
      expect(result.success).toBe(true)
      expect(result.newPosition).toEqual({ line: 5, column: 11 })
      expect(result.error).toBeUndefined()
    })

    test('should handle left boundary collision', () => {
      const currentPos: Position = { line: 5, column: 0 }
      const result = calculatePosition(currentPos, 'h', bounds)
      
      expect(result.success).toBe(false)
      expect(result.newPosition).toEqual(currentPos)
      expect(result.error).toBe('Cannot move left: at left boundary')
    })

    test('should handle right boundary collision', () => {
      const currentPos: Position = { line: 5, column: 20 }
      const result = calculatePosition(currentPos, 'l', bounds)
      
      expect(result.success).toBe(false)
      expect(result.newPosition).toEqual(currentPos)
      expect(result.error).toBe('Cannot move right: at right boundary')
    })

    test('should handle top boundary collision', () => {
      const currentPos: Position = { line: 0, column: 10 }
      const result = calculatePosition(currentPos, 'k', bounds)
      
      expect(result.success).toBe(false)
      expect(result.newPosition).toEqual(currentPos)
      expect(result.error).toBe('Cannot move up: at top boundary')
    })

    test('should handle bottom boundary collision', () => {
      const currentPos: Position = { line: 10, column: 10 }
      const result = calculatePosition(currentPos, 'j', bounds)
      
      expect(result.success).toBe(false)
      expect(result.newPosition).toEqual(currentPos)
      expect(result.error).toBe('Cannot move down: at bottom boundary')
    })
  })

  describe('validateMovement', () => {
    const bounds: EditorBounds = { maxLine: 10, maxColumn: 20 }

    test('should validate legal h movement', () => {
      const pos: Position = { line: 5, column: 5 }
      expect(validateMovement(pos, 'h', bounds)).toBe(true)
    })

    test('should validate legal j movement', () => {
      const pos: Position = { line: 5, column: 5 }
      expect(validateMovement(pos, 'j', bounds)).toBe(true)
    })

    test('should validate legal k movement', () => {
      const pos: Position = { line: 5, column: 5 }
      expect(validateMovement(pos, 'k', bounds)).toBe(true)
    })

    test('should validate legal l movement', () => {
      const pos: Position = { line: 5, column: 5 }
      expect(validateMovement(pos, 'l', bounds)).toBe(true)
    })

    test('should invalidate illegal h movement at left boundary', () => {
      const pos: Position = { line: 5, column: 0 }
      expect(validateMovement(pos, 'h', bounds)).toBe(false)
    })

    test('should invalidate illegal l movement at right boundary', () => {
      const pos: Position = { line: 5, column: 20 }
      expect(validateMovement(pos, 'l', bounds)).toBe(false)
    })

    test('should invalidate illegal k movement at top boundary', () => {
      const pos: Position = { line: 0, column: 5 }
      expect(validateMovement(pos, 'k', bounds)).toBe(false)
    })

    test('should invalidate illegal j movement at bottom boundary', () => {
      const pos: Position = { line: 10, column: 5 }
      expect(validateMovement(pos, 'j', bounds)).toBe(false)
    })
  })

  describe('isValidHjklKey', () => {
    test('should validate h key', () => {
      expect(isValidHjklKey('h')).toBe(true)
    })

    test('should validate j key', () => {
      expect(isValidHjklKey('j')).toBe(true)
    })

    test('should validate k key', () => {
      expect(isValidHjklKey('k')).toBe(true)
    })

    test('should validate l key', () => {
      expect(isValidHjklKey('l')).toBe(true)
    })

    test('should invalidate non-hjkl keys', () => {
      expect(isValidHjklKey('a')).toBe(false)
      expect(isValidHjklKey('w')).toBe(false)
      expect(isValidHjklKey('1')).toBe(false)
      expect(isValidHjklKey('')).toBe(false)
    })
  })

  describe('getMovementDirection', () => {
    test('should return correct direction for h', () => {
      expect(getMovementDirection('h')).toEqual({ deltaLine: 0, deltaColumn: -1 })
    })

    test('should return correct direction for j', () => {
      expect(getMovementDirection('j')).toEqual({ deltaLine: 1, deltaColumn: 0 })
    })

    test('should return correct direction for k', () => {
      expect(getMovementDirection('k')).toEqual({ deltaLine: -1, deltaColumn: 0 })
    })

    test('should return correct direction for l', () => {
      expect(getMovementDirection('l')).toEqual({ deltaLine: 0, deltaColumn: 1 })
    })

    test('should throw error for invalid key', () => {
      expect(() => getMovementDirection('x')).toThrow('Invalid HJKL key: x')
    })
  })

  describe('applyMovement', () => {
    test('should apply movement correctly', () => {
      const pos: Position = { line: 5, column: 10 }
      const direction = { deltaLine: 1, deltaColumn: -1 }
      const newPos = applyMovement(pos, direction)
      
      expect(newPos).toEqual({ line: 6, column: 9 })
      expect(Object.isFrozen(newPos)).toBe(true)
    })

    test('should create immutable position', () => {
      const pos: Position = { line: 0, column: 0 }
      const direction = { deltaLine: 0, deltaColumn: 0 }
      const newPos = applyMovement(pos, direction)
      
      expect(Object.isFrozen(newPos)).toBe(true)
    })
  })
})