/**
 * Repository for Vim Learning Paths following Repository Pattern and functional programming
 * 
 * Principles applied:
 * - Repository Pattern: Data access abstraction
 * - Functional Programming: Pure functions, immutable data
 * - SOLID: Single responsibility, dependency inversion
 */

import {
  LearningPath,
  LearningModule,
  LearningObjective,
  LearningCategory,
  VimSkillLevel,
  createLearningObjective,
  createLearningModule,
  createLearningPath
} from '../domain/VimLearningPath';

export interface VimLearningPathRepository {
  getAllPaths(): ReadonlyArray<LearningPath>;
  getPathById(id: string): LearningPath | undefined;
  getPathsByTargetLevel(level: VimSkillLevel): ReadonlyArray<LearningPath>;
  getModulesByCategory(category: LearningCategory): ReadonlyArray<LearningModule>;
  getBeginnerPath(): LearningPath;
  getIntermediatePath(): LearningPath;
  getAdvancedPath(): LearningPath;
}

export class InMemoryVimLearningPathRepository implements VimLearningPathRepository {
  private readonly paths: ReadonlyArray<LearningPath>;

  constructor(paths?: ReadonlyArray<LearningPath>) {
    this.paths = Object.freeze(paths || this.createDefaultPaths());
  }

  getAllPaths(): ReadonlyArray<LearningPath> {
    return this.paths;
  }

  getPathById(id: string): LearningPath | undefined {
    return this.paths.find(path => path.id === id);
  }

  getPathsByTargetLevel(level: VimSkillLevel): ReadonlyArray<LearningPath> {
    return this.paths.filter(path => path.targetLevel === level);
  }

  getModulesByCategory(category: LearningCategory): ReadonlyArray<LearningModule> {
    return this.paths
      .flatMap(path => path.modules)
      .filter(module => module.category === category);
  }

  getBeginnerPath(): LearningPath {
    const path = this.getPathById('vim-beginner');
    if (!path) {
      throw new Error('Beginner path not found');
    }
    return path;
  }

  getIntermediatePath(): LearningPath {
    const path = this.getPathById('vim-intermediate');
    if (!path) {
      throw new Error('Intermediate path not found');
    }
    return path;
  }

  getAdvancedPath(): LearningPath {
    const path = this.getPathById('vim-advanced');
    if (!path) {
      throw new Error('Advanced path not found');
    }
    return path;
  }

  private createDefaultPaths(): ReadonlyArray<LearningPath> {
    return [
      this.createBeginnerPath(),
      this.createIntermediatePath(),
      this.createAdvancedPath()
    ];
  }

  private createBeginnerPath(): LearningPath {
    // Basic Movement Module
    const basicMovementObjectives = [
      createLearningObjective({
        id: 'hjkl-movement',
        title: 'Master HJKL Movement',
        description: 'Learn the fundamental h, j, k, l movement keys',
        category: 'basic-movement',
        skillLevel: 'beginner',
        estimatedTimeMinutes: 15
      }),
      createLearningObjective({
        id: 'arrow-keys-independence',
        title: 'Break Arrow Key Dependency',
        description: 'Practice moving without arrow keys',
        category: 'basic-movement',
        skillLevel: 'beginner',
        estimatedTimeMinutes: 20,
        prerequisites: ['hjkl-movement']
      })
    ];

    const basicMovementModule = createLearningModule({
      id: 'basic-movement',
      title: 'Basic Cursor Movement',
      description: 'Master the fundamental vim movement keys',
      category: 'basic-movement',
      skillLevel: 'beginner',
      objectives: basicMovementObjectives,
      exercises: [
        'Navigate through a simple text file using only h, j, k, l',
        'Practice moving cursor to specific words',
        'Complete basic navigation challenges'
      ]
    });

    // Insert Mode Module
    const insertModeObjectives = [
      createLearningObjective({
        id: 'insert-modes',
        title: 'Learn Insert Mode Variations',
        description: 'Master i, a, o, O, I, A for entering insert mode',
        category: 'insert-mode',
        skillLevel: 'beginner',
        estimatedTimeMinutes: 25,
        prerequisites: ['hjkl-movement']
      }),
      createLearningObjective({
        id: 'escape-to-normal',
        title: 'Master Mode Switching',
        description: 'Learn to quickly return to normal mode',
        category: 'mode-switching',
        skillLevel: 'beginner',
        estimatedTimeMinutes: 10,
        prerequisites: ['insert-modes']
      })
    ];

    const insertModeModule = createLearningModule({
      id: 'insert-mode',
      title: 'Insert Mode Mastery',
      description: 'Learn to efficiently enter and exit insert mode',
      category: 'insert-mode',
      skillLevel: 'beginner',
      objectives: insertModeObjectives,
      exercises: [
        'Practice inserting text at different positions',
        'Create new lines above and below cursor',
        'Edit text at beginning and end of lines'
      ]
    });

    // Basic Editing Module
    const basicEditingObjectives = [
      createLearningObjective({
        id: 'basic-deletion',
        title: 'Basic Deletion Commands',
        description: 'Learn x, X, dd for basic deletion',
        category: 'deletion',
        skillLevel: 'beginner',
        estimatedTimeMinutes: 20,
        prerequisites: ['escape-to-normal']
      }),
      createLearningObjective({
        id: 'undo-redo',
        title: 'Undo and Redo',
        description: 'Master u and Ctrl-r for undo/redo',
        category: 'undo-redo',
        skillLevel: 'beginner',
        estimatedTimeMinutes: 15,
        prerequisites: ['basic-deletion']
      })
    ];

    const basicEditingModule = createLearningModule({
      id: 'basic-editing',
      title: 'Basic Text Editing',
      description: 'Learn fundamental text editing operations',
      category: 'deletion',
      skillLevel: 'beginner',
      objectives: basicEditingObjectives,
      exercises: [
        'Delete characters, words, and lines',
        'Practice undo/redo workflow',
        'Edit text with confidence'
      ]
    });

    // File Operations Module
    const fileOperationsObjectives = [
      createLearningObjective({
        id: 'save-quit',
        title: 'Save and Quit',
        description: 'Learn :w, :q, :wq, :q! commands',
        category: 'file-operations',
        skillLevel: 'beginner',
        estimatedTimeMinutes: 15,
        prerequisites: ['undo-redo']
      })
    ];

    const fileOperationsModule = createLearningModule({
      id: 'file-operations',
      title: 'File Operations',
      description: 'Learn to save and exit vim properly',
      category: 'file-operations',
      skillLevel: 'beginner',
      objectives: fileOperationsObjectives,
      exercises: [
        'Save files with :w',
        'Exit vim with :q',
        'Handle unsaved changes'
      ]
    });

    return createLearningPath({
      id: 'vim-beginner',
      title: 'Vim Beginner Path',
      description: 'Complete introduction to vim for absolute beginners',
      targetLevel: 'beginner',
      modules: [
        basicMovementModule,
        insertModeModule,
        basicEditingModule,
        fileOperationsModule
      ]
    });
  }

  private createIntermediatePath(): LearningPath {
    // Word Movement Module
    const wordMovementObjectives = [
      createLearningObjective({
        id: 'word-navigation',
        title: 'Word Navigation',
        description: 'Master w, b, e for word-based movement',
        category: 'word-movement',
        skillLevel: 'intermediate',
        estimatedTimeMinutes: 25,
        prerequisites: ['save-quit']
      }),
      createLearningObjective({
        id: 'line-navigation',
        title: 'Line Navigation',
        description: 'Learn 0, $, ^, g_ for line navigation',
        category: 'line-movement',
        skillLevel: 'intermediate',
        estimatedTimeMinutes: 20,
        prerequisites: ['word-navigation']
      })
    ];

    const wordMovementModule = createLearningModule({
      id: 'word-movement',
      title: 'Word and Line Movement',
      description: 'Efficient navigation within lines and words',
      category: 'word-movement',
      skillLevel: 'intermediate',
      objectives: wordMovementObjectives,
      exercises: [
        'Navigate between words efficiently',
        'Move to line beginnings and endings',
        'Combine movements for speed'
      ]
    });

    // Search Module
    const searchObjectives = [
      createLearningObjective({
        id: 'basic-search',
        title: 'Basic Search',
        description: 'Learn /, ?, n, N for text search',
        category: 'search',
        skillLevel: 'intermediate',
        estimatedTimeMinutes: 30,
        prerequisites: ['line-navigation']
      }),
      createLearningObjective({
        id: 'character-search',
        title: 'Character Search',
        description: 'Master f, F, t, T for character finding',
        category: 'advanced-movement',
        skillLevel: 'intermediate',
        estimatedTimeMinutes: 25,
        prerequisites: ['basic-search']
      })
    ];

    const searchModule = createLearningModule({
      id: 'search',
      title: 'Search and Find',
      description: 'Locate text quickly with search commands',
      category: 'search',
      skillLevel: 'intermediate',
      objectives: searchObjectives,
      exercises: [
        'Search for words and patterns',
        'Navigate search results',
        'Find characters within lines'
      ]
    });

    // Visual Mode Module
    const visualModeObjectives = [
      createLearningObjective({
        id: 'visual-selection',
        title: 'Visual Mode Selection',
        description: 'Learn v, V, Ctrl-v for text selection',
        category: 'visual-mode',
        skillLevel: 'intermediate',
        estimatedTimeMinutes: 30,
        prerequisites: ['character-search']
      }),
      createLearningObjective({
        id: 'copy-paste',
        title: 'Copy and Paste',
        description: 'Master y, p, P for copying and pasting',
        category: 'copy-paste',
        skillLevel: 'intermediate',
        estimatedTimeMinutes: 25,
        prerequisites: ['visual-selection']
      })
    ];

    const visualModeModule = createLearningModule({
      id: 'visual-mode',
      title: 'Visual Mode and Copy/Paste',
      description: 'Select, copy, and paste text efficiently',
      category: 'visual-mode',
      skillLevel: 'intermediate',
      objectives: visualModeObjectives,
      exercises: [
        'Select text in different visual modes',
        'Copy and paste text blocks',
        'Manipulate selected text'
      ]
    });

    return createLearningPath({
      id: 'vim-intermediate',
      title: 'Vim Intermediate Path',
      description: 'Build upon basics with advanced navigation and editing',
      targetLevel: 'intermediate',
      modules: [
        wordMovementModule,
        searchModule,
        visualModeModule
      ]
    });
  }

  private createAdvancedPath(): LearningPath {
    // Text Objects Module
    const textObjectsObjectives = [
      createLearningObjective({
        id: 'text-objects',
        title: 'Text Objects',
        description: 'Master iw, aw, ip, ap, i", a" text objects',
        category: 'text-objects',
        skillLevel: 'advanced',
        estimatedTimeMinutes: 40,
        prerequisites: ['copy-paste']
      })
    ];

    const textObjectsModule = createLearningModule({
      id: 'text-objects',
      title: 'Text Objects',
      description: 'Operate on logical text units',
      category: 'text-objects',
      skillLevel: 'advanced',
      objectives: textObjectsObjectives,
      exercises: [
        'Select words, sentences, paragraphs',
        'Work with quoted text',
        'Manipulate code blocks'
      ]
    });

    // Macros Module
    const macrosObjectives = [
      createLearningObjective({
        id: 'macros',
        title: 'Macros',
        description: 'Learn to record and replay macros with q',
        category: 'macros',
        skillLevel: 'advanced',
        estimatedTimeMinutes: 35,
        prerequisites: ['text-objects']
      })
    ];

    const macrosModule = createLearningModule({
      id: 'macros',
      title: 'Macros and Automation',
      description: 'Automate repetitive tasks with macros',
      category: 'macros',
      skillLevel: 'advanced',
      objectives: macrosObjectives,
      exercises: [
        'Record simple macros',
        'Replay macros multiple times',
        'Create complex automation sequences'
      ]
    });

    // Registers Module
    const registersObjectives = [
      createLearningObjective({
        id: 'registers',
        title: 'Registers',
        description: 'Master vim registers for advanced copy/paste',
        category: 'registers',
        skillLevel: 'advanced',
        estimatedTimeMinutes: 30,
        prerequisites: ['macros']
      })
    ];

    const registersModule = createLearningModule({
      id: 'registers',
      title: 'Registers and Clipboard',
      description: 'Advanced clipboard management with registers',
      category: 'registers',
      skillLevel: 'advanced',
      objectives: registersObjectives,
      exercises: [
        'Use named registers',
        'Access system clipboard',
        'Manage multiple clipboard contents'
      ]
    });

    return createLearningPath({
      id: 'vim-advanced',
      title: 'Vim Advanced Path',
      description: 'Master advanced vim techniques for power users',
      targetLevel: 'advanced',
      modules: [
        textObjectsModule,
        macrosModule,
        registersModule
      ]
    });
  }
}

// Factory function
export const createVimLearningPathRepository = (): VimLearningPathRepository =>
  new InMemoryVimLearningPathRepository();