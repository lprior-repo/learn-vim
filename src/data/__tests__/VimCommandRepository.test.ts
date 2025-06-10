/**
 * Integration tests for VimCommandRepository following testing best practices
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  VimCommandRepository, 
  InMemoryVimCommandRepository,
  createVimCommandRepository 
} from '../VimCommandRepository';
import { createVimCommand } from '../../domain/VimCommand';

describe('VimCommandRepository', () => {
  let repository: VimCommandRepository;

  beforeEach(() => {
    repository = createVimCommandRepository();
  });

  describe('getAllCommands', () => {
    it('should return all commands', () => {
      // Act
      const commands = repository.getAllCommands();
      
      // Assert
      expect(commands.length).toBeGreaterThan(0);
      expect(Array.isArray(commands)).toBe(true);
      expect(Object.isFrozen(commands)).toBe(true);
    });

    it('should return immutable command array', () => {
      // Act
      const commands = repository.getAllCommands();
      
      // Assert
      expect(() => {
        (commands as any).push('new command');
      }).toThrow();
    });
  });

  describe('getCommandById', () => {
    it('should return command for valid ID', () => {
      // Act
      const command = repository.getCommandById('move-left');
      
      // Assert
      expect(command).toBeDefined();
      expect(command?.id).toBe('move-left');
      expect(command?.keySequence.value).toBe('h');
    });

    it('should return undefined for invalid ID', () => {
      // Act
      const command = repository.getCommandById('non-existent');
      
      // Assert
      expect(command).toBeUndefined();
    });

    it('should handle empty string ID', () => {
      // Act
      const command = repository.getCommandById('');
      
      // Assert
      expect(command).toBeUndefined();
    });
  });

  describe('getCommandsByCategory', () => {
    it('should return navigation commands', () => {
      // Act
      const commands = repository.getCommandsByCategory('navigation');
      
      // Assert
      expect(commands.length).toBeGreaterThan(0);
      expect(commands.every(cmd => cmd.category === 'navigation')).toBe(true);
    });

    it('should return editing commands', () => {
      // Act
      const commands = repository.getCommandsByCategory('editing');
      
      // Assert
      expect(commands.length).toBeGreaterThan(0);
      expect(commands.every(cmd => cmd.category === 'editing')).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      // Act
      const commands = repository.getCommandsByCategory('non-existent' as any);
      
      // Assert
      expect(commands).toHaveLength(0);
    });

    it('should include basic HJKL commands in navigation', () => {
      // Act
      const commands = repository.getCommandsByCategory('navigation');
      
      // Assert
      const hjklCommands = commands.filter(cmd => 
        ['move-left', 'move-down', 'move-up', 'move-right'].includes(cmd.id)
      );
      expect(hjklCommands).toHaveLength(4);
    });
  });

  describe('getCommandsByDifficulty', () => {
    it('should return beginner commands', () => {
      // Act
      const commands = repository.getCommandsByDifficulty('beginner');
      
      // Assert
      expect(commands.length).toBeGreaterThan(0);
      expect(commands.every(cmd => cmd.difficulty === 'beginner')).toBe(true);
    });

    it('should return advanced commands', () => {
      // Act
      const commands = repository.getCommandsByDifficulty('advanced');
      
      // Assert
      expect(commands.length).toBeGreaterThan(0);
      expect(commands.every(cmd => cmd.difficulty === 'advanced')).toBe(true);
    });

    it('should include HJKL in beginner commands', () => {
      // Act
      const commands = repository.getCommandsByDifficulty('beginner');
      
      // Assert
      const hjklCommands = commands.filter(cmd => 
        ['move-left', 'move-down', 'move-up', 'move-right'].includes(cmd.id)
      );
      expect(hjklCommands).toHaveLength(4);
    });
  });

  describe('getCommandsForMode', () => {
    it('should return commands available in normal mode', () => {
      // Act
      const commands = repository.getCommandsForMode('normal');
      
      // Assert
      expect(commands.length).toBeGreaterThan(0);
      expect(commands.every(cmd => cmd.availableInModes.includes('normal'))).toBe(true);
    });

    it('should return commands available in insert mode', () => {
      // Act
      const commands = repository.getCommandsForMode('insert');
      
      // Assert
      expect(commands.every(cmd => cmd.availableInModes.includes('insert'))).toBe(true);
    });

    it('should return commands available in visual mode', () => {
      // Act
      const commands = repository.getCommandsForMode('visual');
      
      // Assert
      expect(commands.every(cmd => cmd.availableInModes.includes('visual'))).toBe(true);
    });

    it('should return commands available in command mode', () => {
      // Act
      const commands = repository.getCommandsForMode('command');
      
      // Assert
      expect(commands.every(cmd => cmd.availableInModes.includes('command'))).toBe(true);
      // Should include file operations like :w, :q
      const fileOps = commands.filter(cmd => cmd.category === 'file-operations');
      expect(fileOps.length).toBeGreaterThan(0);
    });

    it('should not return commands not available in specified mode', () => {
      // Act
      const insertCommands = repository.getCommandsForMode('insert');
      
      // Assert
      // Most commands should not be available in insert mode
      expect(insertCommands.length).toBeLessThan(repository.getAllCommands().length);
    });
  });

  describe('getBeginnerCommands', () => {
    it('should return only beginner difficulty commands', () => {
      // Act
      const commands = repository.getBeginnerCommands();
      
      // Assert
      expect(commands.length).toBeGreaterThan(0);
      expect(commands.every(cmd => cmd.difficulty === 'beginner')).toBe(true);
    });

    it('should include essential commands', () => {
      // Act
      const commands = repository.getBeginnerCommands();
      
      // Assert
      const commandIds = commands.map(cmd => cmd.id);
      expect(commandIds).toContain('move-left');
      expect(commandIds).toContain('move-right');
      expect(commandIds).toContain('move-up');
      expect(commandIds).toContain('move-down');
      expect(commandIds).toContain('insert-before-cursor');
      expect(commandIds).toContain('escape-to-normal');
    });
  });

  describe('command data integrity', () => {
    it('should have consistent command structure', () => {
      // Act
      const commands = repository.getAllCommands();
      
      // Assert
      commands.forEach(command => {
        expect(command.id).toBeTruthy();
        expect(command.keySequence.value).toBeTruthy();
        expect(command.description.value).toBeTruthy();
        expect(command.category).toBeTruthy();
        expect(command.difficulty).toBeTruthy();
        expect(Array.isArray(command.availableInModes)).toBe(true);
        expect(command.availableInModes.length).toBeGreaterThan(0);
      });
    });

    it('should have unique command IDs', () => {
      // Act
      const commands = repository.getAllCommands();
      const ids = commands.map(cmd => cmd.id);
      
      // Assert
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid prerequisites references', () => {
      // Act
      const commands = repository.getAllCommands();
      const allIds = new Set(commands.map(cmd => cmd.id));
      
      // Assert
      commands.forEach(command => {
        if (command.prerequisites) {
          command.prerequisites.forEach(prereqId => {
            expect(allIds.has(prereqId)).toBe(true);
          });
        }
      });
    });
  });

  describe('InMemoryVimCommandRepository with custom data', () => {
    it('should work with custom command data', () => {
      // Arrange
      const customCommands = [
        createVimCommand({
          id: 'custom-command',
          keySequence: 'custom',
          description: 'Custom test command',
          category: 'navigation',
          difficulty: 'beginner',
          availableInModes: ['normal']
        })
      ];
      const customRepository = new InMemoryVimCommandRepository(customCommands);
      
      // Act
      const commands = customRepository.getAllCommands();
      
      // Assert
      expect(commands).toHaveLength(1);
      expect(commands[0].id).toBe('custom-command');
    });
  });

  describe('factory function', () => {
    it('should create repository instance', () => {
      // Act
      const repo = createVimCommandRepository();
      
      // Assert
      expect(repo).toBeInstanceOf(InMemoryVimCommandRepository);
      expect(typeof repo.getAllCommands).toBe('function');
      expect(typeof repo.getCommandById).toBe('function');
    });
  });
});