// Unit tests for HJKL data access functions
import { describe, test, expect } from '@jest/globals'
import { 
  getHjklCommands, 
  getHjklLearningPath,
  getCommandById,
  filterCommandsByDifficulty,
  getCommandsByMode
} from '../../data'
import { VimCommand } from '../../types'

describe('HJKL Data Functions', () => {
  describe('getHjklCommands', () => {
    test('should return all 4 HJKL commands', () => {
      const commands = getHjklCommands()
      
      expect(commands).toHaveLength(4)
      expect(commands.map(cmd => cmd.keySequence)).toEqual(['h', 'j', 'k', 'l'])
    })

    test('should return immutable commands', () => {
      const commands = getHjklCommands()
      
      commands.forEach(command => {
        expect(Object.isFrozen(command)).toBe(true)
      })
    })

    test('should return commands with correct properties', () => {
      const commands = getHjklCommands()
      
      commands.forEach(command => {
        expect(command).toHaveProperty('id')
        expect(command).toHaveProperty('keySequence')
        expect(command).toHaveProperty('description')
        expect(command).toHaveProperty('category')
        expect(command).toHaveProperty('difficulty')
        expect(command).toHaveProperty('availableInModes')
        expect(command.category).toBe('basic-movement')
        expect(command.difficulty).toBe('beginner')
      })
    })

    test('should return commands in correct order', () => {
      const commands = getHjklCommands()
      const expectedIds = ['move-left', 'move-down', 'move-up', 'move-right']
      
      expect(commands.map(cmd => cmd.id)).toEqual(expectedIds)
    })
  })

  describe('getHjklLearningPath', () => {
    test('should return learning path with HJKL objectives', () => {
      const learningPath = getHjklLearningPath()
      
      expect(learningPath).toHaveProperty('id')
      expect(learningPath).toHaveProperty('title')
      expect(learningPath).toHaveProperty('description')
      expect(learningPath).toHaveProperty('objectives')
      expect(learningPath.objectives).toHaveLength(4)
    })

    test('should return immutable learning path', () => {
      const learningPath = getHjklLearningPath()
      
      expect(Object.isFrozen(learningPath)).toBe(true)
      learningPath.objectives.forEach(objective => {
        expect(Object.isFrozen(objective)).toBe(true)
      })
    })

    test('should have correct learning objectives order', () => {
      const learningPath = getHjklLearningPath()
      const expectedOrder = ['h-movement', 'j-movement', 'k-movement', 'l-movement']
      
      expect(learningPath.objectives.map(obj => obj.id)).toEqual(expectedOrder)
    })

    test('should have beginner skill level for all objectives', () => {
      const learningPath = getHjklLearningPath()
      
      learningPath.objectives.forEach(objective => {
        expect(objective.skillLevel).toBe('beginner')
        expect(objective.category).toBe('basic-movement')
      })
    })
  })

  describe('getCommandById', () => {
    test('should return command for valid h id', () => {
      const command = getCommandById('move-left')
      
      expect(command).toBeDefined()
      expect(command?.id).toBe('move-left')
      expect(command?.keySequence).toBe('h')
    })

    test('should return command for valid j id', () => {
      const command = getCommandById('move-down')
      
      expect(command).toBeDefined()
      expect(command?.id).toBe('move-down')
      expect(command?.keySequence).toBe('j')
    })

    test('should return command for valid k id', () => {
      const command = getCommandById('move-up')
      
      expect(command).toBeDefined()
      expect(command?.id).toBe('move-up')
      expect(command?.keySequence).toBe('k')
    })

    test('should return command for valid l id', () => {
      const command = getCommandById('move-right')
      
      expect(command).toBeDefined()
      expect(command?.id).toBe('move-right')
      expect(command?.keySequence).toBe('l')
    })

    test('should return undefined for invalid id', () => {
      const command = getCommandById('invalid-id')
      
      expect(command).toBeUndefined()
    })

    test('should return immutable command', () => {
      const command = getCommandById('move-left')
      
      expect(command).toBeDefined()
      if (command) {
        expect(Object.isFrozen(command)).toBe(true)
      }
    })
  })

  describe('filterCommandsByDifficulty', () => {
    test('should return all commands for beginner difficulty', () => {
      const commands = filterCommandsByDifficulty('beginner')
      
      expect(commands).toHaveLength(4)
      commands.forEach(command => {
        expect(command.difficulty).toBe('beginner')
      })
    })

    test('should return empty array for intermediate difficulty', () => {
      const commands = filterCommandsByDifficulty('intermediate')
      
      expect(commands).toHaveLength(0)
    })

    test('should return empty array for advanced difficulty', () => {
      const commands = filterCommandsByDifficulty('advanced')
      
      expect(commands).toHaveLength(0)
    })

    test('should return immutable commands', () => {
      const commands = filterCommandsByDifficulty('beginner')
      
      commands.forEach(command => {
        expect(Object.isFrozen(command)).toBe(true)
      })
    })
  })

  describe('getCommandsByMode', () => {
    test('should return commands available in normal mode', () => {
      const commands = getCommandsByMode('normal')
      
      expect(commands).toHaveLength(4)
      commands.forEach(command => {
        expect(command.availableInModes).toContain('normal')
      })
    })

    test('should return commands available in visual mode', () => {
      const commands = getCommandsByMode('visual')
      
      // Assuming some HJKL commands are available in visual mode
      expect(commands.length).toBeGreaterThan(0)
      commands.forEach(command => {
        expect(command.availableInModes).toContain('visual')
      })
    })

    test('should return empty array for invalid mode', () => {
      const commands = getCommandsByMode('invalid-mode')
      
      expect(commands).toHaveLength(0)
    })

    test('should return immutable commands', () => {
      const commands = getCommandsByMode('normal')
      
      commands.forEach(command => {
        expect(Object.isFrozen(command)).toBe(true)
      })
    })
  })
})