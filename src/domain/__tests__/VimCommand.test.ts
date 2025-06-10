/**
 * Comprehensive unit tests for VimCommand domain model
 * 
 * Following testing best practices:
 * - AAA pattern (Arrange, Act, Assert)
 * - Test one thing at a time
 * - Descriptive test names
 * - Edge cases and error conditions
 * - Pure function testing
 */

import { describe, it, expect, test } from '@jest/globals';
import {
  VimCommand,
  KeySequence,
  Description,
  createKeySequence,
  createDescription,
  createVimCommand,
  isCommandAvailableInMode,
  getCommandsByCategory,
  getCommandsByDifficulty,
  getPrerequisiteCommands,
  isValidKeySequence,
  isValidVimCommand
} from '../VimCommand';

describe('VimCommand Domain Model', () => {
  describe('createKeySequence', () => {
    it('should create a valid key sequence for simple key', () => {
      // Arrange
      const keyValue = 'h';
      
      // Act
      const result = createKeySequence(keyValue);
      
      // Assert
      expect(result).toEqual({
        value: 'h',
        modifiers: []
      });
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.modifiers)).toBe(true);
    });

    it('should create a valid key sequence with modifiers', () => {
      // Arrange
      const keyValue = 'Ctrl+r';
      
      // Act
      const result = createKeySequence(keyValue);
      
      // Assert
      expect(result).toEqual({
        value: 'Ctrl+r',
        modifiers: ['Ctrl']
      });
    });

    it('should handle multiple modifiers', () => {
      // Arrange
      const keyValue = 'Ctrl+Shift+v';
      
      // Act
      const result = createKeySequence(keyValue);
      
      // Assert
      expect(result.modifiers).toContain('Ctrl');
      expect(result.modifiers).toContain('Shift');
    });

    it('should throw error for empty key sequence', () => {
      // Arrange
      const keyValue = '';
      
      // Act & Assert
      expect(() => createKeySequence(keyValue)).toThrow('Key sequence cannot be empty');
    });

    it('should throw error for whitespace-only key sequence', () => {
      // Arrange
      const keyValue = '   ';
      
      // Act & Assert
      expect(() => createKeySequence(keyValue)).toThrow('Key sequence cannot be empty');
    });

    it('should trim whitespace from key value', () => {
      // Arrange
      const keyValue = '  h  ';
      
      // Act
      const result = createKeySequence(keyValue);
      
      // Assert
      expect(result.value).toBe('h');
    });
  });

  describe('createDescription', () => {
    it('should create a valid description without examples', () => {
      // Arrange
      const descValue = 'Move cursor left';
      
      // Act
      const result = createDescription(descValue);
      
      // Assert
      expect(result).toEqual({
        value: 'Move cursor left',
        examples: undefined
      });
      expect(Object.isFrozen(result)).toBe(true);
    });

    it('should create a valid description with examples', () => {
      // Arrange
      const descValue = 'Move cursor left';
      const examples = ['Press h to move left', 'Works in normal mode'];
      
      // Act
      const result = createDescription(descValue, examples);
      
      // Assert
      expect(result).toEqual({
        value: 'Move cursor left',
        examples: ['Press h to move left', 'Works in normal mode']
      });
      expect(Object.isFrozen(result.examples)).toBe(true);
    });

    it('should throw error for empty description', () => {
      // Arrange
      const descValue = '';
      
      // Act & Assert
      expect(() => createDescription(descValue)).toThrow('Description cannot be empty');
    });

    it('should trim whitespace from description', () => {
      // Arrange
      const descValue = '  Move left  ';
      
      // Act
      const result = createDescription(descValue);
      
      // Assert
      expect(result.value).toBe('Move left');
    });
  });

  describe('createVimCommand', () => {
    const validCommandProps = {
      id: 'move-left',
      keySequence: 'h',
      description: 'Move cursor left',
      category: 'navigation' as const,
      difficulty: 'beginner' as const,
      availableInModes: ['normal', 'visual'] as const
    };

    it('should create a valid vim command', () => {
      // Act
      const result = createVimCommand(validCommandProps);
      
      // Assert
      expect(result.id).toBe('move-left');
      expect(result.keySequence.value).toBe('h');
      expect(result.description.value).toBe('Move cursor left');
      expect(result.category).toBe('navigation');
      expect(result.difficulty).toBe('beginner');
      expect(result.availableInModes).toEqual(['normal', 'visual']);
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.availableInModes)).toBe(true);
    });

    it('should create a command with prerequisites', () => {
      // Arrange
      const propsWithPrereqs = {
        ...validCommandProps,
        prerequisites: ['command-mode']
      };
      
      // Act
      const result = createVimCommand(propsWithPrereqs);
      
      // Assert
      expect(result.prerequisites).toEqual(['command-mode']);
      expect(Object.isFrozen(result.prerequisites)).toBe(true);
    });

    it('should throw error for empty id', () => {
      // Arrange
      const propsWithEmptyId = { ...validCommandProps, id: '' };
      
      // Act & Assert
      expect(() => createVimCommand(propsWithEmptyId)).toThrow('Command ID is required');
    });

    it('should throw error for whitespace-only id', () => {
      // Arrange
      const propsWithWhitespaceId = { ...validCommandProps, id: '   ' };
      
      // Act & Assert
      expect(() => createVimCommand(propsWithWhitespaceId)).toThrow('Command ID is required');
    });

    it('should trim whitespace from id', () => {
      // Arrange
      const propsWithWhitespaceId = { ...validCommandProps, id: '  move-left  ' };
      
      // Act
      const result = createVimCommand(propsWithWhitespaceId);
      
      // Assert
      expect(result.id).toBe('move-left');
    });
  });

  describe('isCommandAvailableInMode', () => {
    const command = createVimCommand({
      id: 'test-command',
      keySequence: 'h',
      description: 'Test command',
      category: 'navigation',
      difficulty: 'beginner',
      availableInModes: ['normal', 'visual']
    });

    it('should return true for available mode', () => {
      // Act & Assert
      expect(isCommandAvailableInMode(command, 'normal')).toBe(true);
      expect(isCommandAvailableInMode(command, 'visual')).toBe(true);
    });

    it('should return false for unavailable mode', () => {
      // Act & Assert
      expect(isCommandAvailableInMode(command, 'insert')).toBe(false);
      expect(isCommandAvailableInMode(command, 'command')).toBe(false);
    });
  });

  describe('getCommandsByCategory', () => {
    const commands = [
      createVimCommand({
        id: 'move-left',
        keySequence: 'h',
        description: 'Move left',
        category: 'navigation',
        difficulty: 'beginner',
        availableInModes: ['normal']
      }),
      createVimCommand({
        id: 'delete-char',
        keySequence: 'x',
        description: 'Delete character',
        category: 'editing',
        difficulty: 'beginner',
        availableInModes: ['normal']
      }),
      createVimCommand({
        id: 'move-right',
        keySequence: 'l',
        description: 'Move right',
        category: 'navigation',
        difficulty: 'beginner',
        availableInModes: ['normal']
      })
    ];

    it('should return commands of specified category', () => {
      // Act
      const navigationCommands = getCommandsByCategory(commands, 'navigation');
      
      // Assert
      expect(navigationCommands).toHaveLength(2);
      expect(navigationCommands.every(cmd => cmd.category === 'navigation')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      // Act
      const searchCommands = getCommandsByCategory(commands, 'search');
      
      // Assert
      expect(searchCommands).toHaveLength(0);
    });
  });

  describe('getCommandsByDifficulty', () => {
    const commands = [
      createVimCommand({
        id: 'basic-move',
        keySequence: 'h',
        description: 'Basic move',
        category: 'navigation',
        difficulty: 'beginner',
        availableInModes: ['normal']
      }),
      createVimCommand({
        id: 'advanced-edit',
        keySequence: 'ciw',
        description: 'Advanced edit',
        category: 'editing',
        difficulty: 'advanced',
        availableInModes: ['normal']
      })
    ];

    it('should return commands of specified difficulty', () => {
      // Act
      const beginnerCommands = getCommandsByDifficulty(commands, 'beginner');
      
      // Assert
      expect(beginnerCommands).toHaveLength(1);
      expect(beginnerCommands[0].difficulty).toBe('beginner');
    });
  });

  describe('getPrerequisiteCommands', () => {
    const commands = [
      createVimCommand({
        id: 'command-mode',
        keySequence: ':',
        description: 'Enter command mode',
        category: 'modes',
        difficulty: 'intermediate',
        availableInModes: ['normal']
      }),
      createVimCommand({
        id: 'save-file',
        keySequence: ':w',
        description: 'Save file',
        category: 'file-operations',
        difficulty: 'intermediate',
        availableInModes: ['command'],
        prerequisites: ['command-mode']
      })
    ];

    it('should return prerequisite commands', () => {
      // Arrange
      const saveCommand = commands[1];
      
      // Act
      const prerequisites = getPrerequisiteCommands(commands, saveCommand);
      
      // Assert
      expect(prerequisites).toHaveLength(1);
      expect(prerequisites[0].id).toBe('command-mode');
    });

    it('should return empty array for commands without prerequisites', () => {
      // Arrange
      const commandModeCommand = commands[0];
      
      // Act
      const prerequisites = getPrerequisiteCommands(commands, commandModeCommand);
      
      // Assert
      expect(prerequisites).toHaveLength(0);
    });
  });

  describe('type guards', () => {
    describe('isValidKeySequence', () => {
      it('should return true for valid key sequence', () => {
        // Arrange
        const validKeySequence = createKeySequence('h');
        
        // Act & Assert
        expect(isValidKeySequence(validKeySequence)).toBe(true);
      });

      it('should return false for invalid objects', () => {
        // Act & Assert
        expect(isValidKeySequence({})).toBe(false);
        expect(isValidKeySequence({ value: 'h' })).toBe(false);
        expect(isValidKeySequence({ modifiers: [] })).toBe(false);
        expect(isValidKeySequence(null)).toBe(false);
        expect(isValidKeySequence(undefined)).toBe(false);
        expect(isValidKeySequence('string')).toBe(false);
      });
    });

    describe('isValidVimCommand', () => {
      it('should return true for valid vim command', () => {
        // Arrange
        const validCommand = createVimCommand({
          id: 'test',
          keySequence: 'h',
          description: 'Test',
          category: 'navigation',
          difficulty: 'beginner',
          availableInModes: ['normal']
        });
        
        // Act & Assert
        expect(isValidVimCommand(validCommand)).toBe(true);
      });

      it('should return false for invalid objects', () => {
        // Act & Assert
        expect(isValidVimCommand({})).toBe(false);
        expect(isValidVimCommand(null)).toBe(false);
        expect(isValidVimCommand(undefined)).toBe(false);
        expect(isValidVimCommand('string')).toBe(false);
      });
    });
  });
});