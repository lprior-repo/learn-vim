/**
 * Comprehensive unit tests for VimLearningPath domain model
 * Following TDD principles and functional programming
 */

import { describe, it, expect } from '@jest/globals';
import {
  LearningObjective,
  LearningModule,
  LearningPath,
  createLearningObjective,
  createLearningModule,
  createLearningPath,
  getModulesByCategory,
  getModulesBySkillLevel,
  getPrerequisiteObjectives,
  isObjectiveReady,
  getNextObjectives,
  calculateProgress,
  isValidSkillLevel,
  isValidLearningCategory,
  isValidLearningObjective
} from '../VimLearningPath';

describe('VimLearningPath Domain Model', () => {
  describe('createLearningObjective', () => {
    const validObjectiveProps = {
      id: 'basic-h',
      title: 'Learn h key movement',
      description: 'Master the h key for leftward movement',
      category: 'basic-movement' as const,
      skillLevel: 'beginner' as const,
      estimatedTimeMinutes: 5
    };

    it('should create a valid learning objective', () => {
      // Act
      const result = createLearningObjective(validObjectiveProps);

      // Assert
      expect(result.id).toBe('basic-h');
      expect(result.title).toBe('Learn h key movement');
      expect(result.category).toBe('basic-movement');
      expect(result.skillLevel).toBe('beginner');
      expect(result.estimatedTimeMinutes).toBe(5);
      expect(result.prerequisites).toEqual([]);
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.prerequisites)).toBe(true);
    });

    it('should create objective with prerequisites', () => {
      // Arrange
      const propsWithPrereqs = {
        ...validObjectiveProps,
        prerequisites: ['mode-switching']
      };

      // Act
      const result = createLearningObjective(propsWithPrereqs);

      // Assert
      expect(result.prerequisites).toEqual(['mode-switching']);
      expect(Object.isFrozen(result.prerequisites)).toBe(true);
    });

    it('should throw error for empty id', () => {
      // Arrange
      const propsWithEmptyId = { ...validObjectiveProps, id: '' };

      // Act & Assert
      expect(() => createLearningObjective(propsWithEmptyId))
        .toThrow('Learning objective ID is required');
    });

    it('should throw error for empty title', () => {
      // Arrange
      const propsWithEmptyTitle = { ...validObjectiveProps, title: '' };

      // Act & Assert
      expect(() => createLearningObjective(propsWithEmptyTitle))
        .toThrow('Learning objective title is required');
    });

    it('should throw error for non-positive time', () => {
      // Arrange
      const propsWithZeroTime = { ...validObjectiveProps, estimatedTimeMinutes: 0 };

      // Act & Assert
      expect(() => createLearningObjective(propsWithZeroTime))
        .toThrow('Estimated time must be positive');
    });

    it('should trim whitespace from id and title', () => {
      // Arrange
      const propsWithWhitespace = {
        ...validObjectiveProps,
        id: '  basic-h  ',
        title: '  Learn h key  '
      };

      // Act
      const result = createLearningObjective(propsWithWhitespace);

      // Assert
      expect(result.id).toBe('basic-h');
      expect(result.title).toBe('Learn h key');
    });
  });

  describe('createLearningModule', () => {
    const validObjective = createLearningObjective({
      id: 'basic-h',
      title: 'Learn h key',
      description: 'Learn h key movement',
      category: 'basic-movement',
      skillLevel: 'beginner',
      estimatedTimeMinutes: 5
    });

    const validModuleProps = {
      id: 'basic-movement-module',
      title: 'Basic Movement',
      description: 'Learn basic cursor movement',
      category: 'basic-movement' as const,
      skillLevel: 'beginner' as const,
      objectives: [validObjective]
    };

    it('should create a valid learning module', () => {
      // Act
      const result = createLearningModule(validModuleProps);

      // Assert
      expect(result.id).toBe('basic-movement-module');
      expect(result.title).toBe('Basic Movement');
      expect(result.category).toBe('basic-movement');
      expect(result.objectives).toHaveLength(1);
      expect(result.estimatedTimeMinutes).toBe(5);
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.objectives)).toBe(true);
      expect(Object.isFrozen(result.exercises)).toBe(true);
    });

    it('should calculate total time from objectives', () => {
      // Arrange
      const secondObjective = createLearningObjective({
        id: 'basic-j',
        title: 'Learn j key',
        description: 'Learn j key movement',
        category: 'basic-movement',
        skillLevel: 'beginner',
        estimatedTimeMinutes: 7
      });

      const propsWithMultipleObjectives = {
        ...validModuleProps,
        objectives: [validObjective, secondObjective]
      };

      // Act
      const result = createLearningModule(propsWithMultipleObjectives);

      // Assert
      expect(result.estimatedTimeMinutes).toBe(12); // 5 + 7
    });

    it('should include exercises when provided', () => {
      // Arrange
      const propsWithExercises = {
        ...validModuleProps,
        exercises: ['exercise-1', 'exercise-2']
      };

      // Act
      const result = createLearningModule(propsWithExercises);

      // Assert
      expect(result.exercises).toEqual(['exercise-1', 'exercise-2']);
    });

    it('should throw error for empty objectives array', () => {
      // Arrange
      const propsWithEmptyObjectives = { ...validModuleProps, objectives: [] };

      // Act & Assert
      expect(() => createLearningModule(propsWithEmptyObjectives))
        .toThrow('Learning module must have at least one objective');
    });
  });

  describe('createLearningPath', () => {
    const validModule = createLearningModule({
      id: 'basic-movement-module',
      title: 'Basic Movement',
      description: 'Learn basic movement',
      category: 'basic-movement',
      skillLevel: 'beginner',
      objectives: [
        createLearningObjective({
          id: 'basic-h',
          title: 'Learn h key',
          description: 'Learn h key movement',
          category: 'basic-movement',
          skillLevel: 'beginner',
          estimatedTimeMinutes: 5
        })
      ]
    });

    const validPathProps = {
      id: 'vim-beginner',
      title: 'Vim Beginner Path',
      description: 'Complete beginner course',
      targetLevel: 'beginner' as const,
      modules: [validModule]
    };

    it('should create a valid learning path', () => {
      // Act
      const result = createLearningPath(validPathProps);

      // Assert
      expect(result.id).toBe('vim-beginner');
      expect(result.title).toBe('Vim Beginner Path');
      expect(result.targetLevel).toBe('beginner');
      expect(result.modules).toHaveLength(1);
      expect(result.totalTimeMinutes).toBe(5);
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.modules)).toBe(true);
    });

    it('should calculate total time from modules', () => {
      // Arrange
      const secondModule = createLearningModule({
        id: 'word-movement-module',
        title: 'Word Movement',
        description: 'Learn word movement',
        category: 'word-movement',
        skillLevel: 'beginner',
        objectives: [
          createLearningObjective({
            id: 'word-w',
            title: 'Learn w key',
            description: 'Learn w key movement',
            category: 'word-movement',
            skillLevel: 'beginner',
            estimatedTimeMinutes: 10
          })
        ]
      });

      const propsWithMultipleModules = {
        ...validPathProps,
        modules: [validModule, secondModule]
      };

      // Act
      const result = createLearningPath(propsWithMultipleModules);

      // Assert
      expect(result.totalTimeMinutes).toBe(15); // 5 + 10
    });

    it('should throw error for empty modules array', () => {
      // Arrange
      const propsWithEmptyModules = { ...validPathProps, modules: [] };

      // Act & Assert
      expect(() => createLearningPath(propsWithEmptyModules))
        .toThrow('Learning path must have at least one module');
    });
  });

  describe('helper functions', () => {
    const objectives = [
      createLearningObjective({
        id: 'basic-h',
        title: 'Learn h key',
        description: 'Learn h key movement',
        category: 'basic-movement',
        skillLevel: 'beginner',
        estimatedTimeMinutes: 5
      }),
      createLearningObjective({
        id: 'word-w',
        title: 'Learn w key',
        description: 'Learn w key movement',
        category: 'word-movement',
        skillLevel: 'beginner',
        estimatedTimeMinutes: 10,
        prerequisites: ['basic-h']
      }),
      createLearningObjective({
        id: 'advanced-search',
        title: 'Advanced search',
        description: 'Learn advanced search',
        category: 'search',
        skillLevel: 'advanced',
        estimatedTimeMinutes: 20,
        prerequisites: ['word-w']
      })
    ];

    const modules = [
      createLearningModule({
        id: 'basic-movement',
        title: 'Basic Movement',
        description: 'Basic movement module',
        category: 'basic-movement',
        skillLevel: 'beginner',
        objectives: [objectives[0]]
      }),
      createLearningModule({
        id: 'word-movement',
        title: 'Word Movement',
        description: 'Word movement module',
        category: 'word-movement',
        skillLevel: 'beginner',
        objectives: [objectives[1]]
      }),
      createLearningModule({
        id: 'search-module',
        title: 'Search Module',
        description: 'Search module',
        category: 'search',
        skillLevel: 'advanced',
        objectives: [objectives[2]]
      })
    ];

    describe('getModulesByCategory', () => {
      it('should filter modules by category', () => {
        // Act
        const result = getModulesByCategory(modules, 'basic-movement');

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].category).toBe('basic-movement');
      });

      it('should return empty array for non-existent category', () => {
        // Act
        const result = getModulesByCategory(modules, 'file-operations');

        // Assert
        expect(result).toHaveLength(0);
      });
    });

    describe('getModulesBySkillLevel', () => {
      it('should filter modules by skill level', () => {
        // Act
        const result = getModulesBySkillLevel(modules, 'beginner');

        // Assert
        expect(result).toHaveLength(2);
        expect(result.every(m => m.skillLevel === 'beginner')).toBe(true);
      });
    });

    describe('getPrerequisiteObjectives', () => {
      it('should return prerequisites for objective', () => {
        // Act
        const result = getPrerequisiteObjectives(objectives, objectives[1]);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('basic-h');
      });

      it('should return empty array for objective without prerequisites', () => {
        // Act
        const result = getPrerequisiteObjectives(objectives, objectives[0]);

        // Assert
        expect(result).toHaveLength(0);
      });
    });

    describe('isObjectiveReady', () => {
      it('should return true when all prerequisites are completed', () => {
        // Act
        const result = isObjectiveReady(['basic-h'], objectives[1]);

        // Assert
        expect(result).toBe(true);
      });

      it('should return false when prerequisites are missing', () => {
        // Act
        const result = isObjectiveReady([], objectives[1]);

        // Assert
        expect(result).toBe(false);
      });

      it('should return true for objective without prerequisites', () => {
        // Act
        const result = isObjectiveReady([], objectives[0]);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('getNextObjectives', () => {
      it('should return objectives ready to be completed', () => {
        // Act
        const result = getNextObjectives(objectives, ['basic-h']);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('word-w');
      });

      it('should exclude already completed objectives', () => {
        // Act
        const result = getNextObjectives(objectives, ['basic-h', 'word-w']);

        // Assert
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('advanced-search');
      });
    });

    describe('calculateProgress', () => {
      it('should calculate progress percentage', () => {
        // Act
        const result = calculateProgress(10, 3);

        // Assert
        expect(result).toBe(30);
      });

      it('should return 0 for zero total objectives', () => {
        // Act
        const result = calculateProgress(0, 5);

        // Assert
        expect(result).toBe(0);
      });

      it('should round to nearest integer', () => {
        // Act
        const result = calculateProgress(3, 1);

        // Assert
        expect(result).toBe(33); // 33.33... rounded
      });
    });
  });

  describe('type guards', () => {
    describe('isValidSkillLevel', () => {
      it('should return true for valid skill levels', () => {
        expect(isValidSkillLevel('beginner')).toBe(true);
        expect(isValidSkillLevel('intermediate')).toBe(true);
        expect(isValidSkillLevel('advanced')).toBe(true);
        expect(isValidSkillLevel('expert')).toBe(true);
      });

      it('should return false for invalid values', () => {
        expect(isValidSkillLevel('invalid')).toBe(false);
        expect(isValidSkillLevel('')).toBe(false);
        expect(isValidSkillLevel(null)).toBe(false);
        expect(isValidSkillLevel(123)).toBe(false);
      });
    });

    describe('isValidLearningCategory', () => {
      it('should return true for valid categories', () => {
        expect(isValidLearningCategory('basic-movement')).toBe(true);
        expect(isValidLearningCategory('search')).toBe(true);
        expect(isValidLearningCategory('file-operations')).toBe(true);
      });

      it('should return false for invalid categories', () => {
        expect(isValidLearningCategory('invalid')).toBe(false);
        expect(isValidLearningCategory('')).toBe(false);
        expect(isValidLearningCategory(null)).toBe(false);
      });
    });

    describe('isValidLearningObjective', () => {
      it('should return true for valid learning objective', () => {
        // Arrange
        const validObj = createLearningObjective({
          id: 'test',
          title: 'Test',
          description: 'Test description',
          category: 'basic-movement',
          skillLevel: 'beginner',
          estimatedTimeMinutes: 5
        });

        // Act & Assert
        expect(isValidLearningObjective(validObj)).toBe(true);
      });

      it('should return false for invalid objects', () => {
        expect(isValidLearningObjective({})).toBe(false);
        expect(isValidLearningObjective(null as any)).toBe(false);
        expect(isValidLearningObjective('string' as any)).toBe(false);
      });
    });
  });
});