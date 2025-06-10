/**
 * Repository for Vim commands following Repository pattern and functional programming
 * 
 * Principles applied:
 * - Single Responsibility: Only handles data access
 * - DRY: Centralized command definitions
 * - Immutable data structures
 * - Pure functions for queries
 */

import { 
  VimCommand, 
  createVimCommand, 
  CommandCategory, 
  DifficultyLevel,
  getCommandsByCategory,
  getCommandsByDifficulty,
  isCommandAvailableInMode,
  VimMode
} from '../domain/VimCommand';

// Immutable command data - single source of truth
const COMMAND_DATA: ReadonlyArray<VimCommand> = Object.freeze([
  // Mode switching commands
  createVimCommand({
    id: 'insert-before-cursor',
    keySequence: 'i',
    description: 'Enter Insert mode before cursor',
    category: 'modes',
    difficulty: 'beginner',
    availableInModes: ['normal'],
    examples: ['Press i to start typing before cursor position']
  }),
  
  createVimCommand({
    id: 'escape-to-normal',
    keySequence: 'Esc',
    description: 'Return to Normal mode',
    category: 'modes',
    difficulty: 'beginner',
    availableInModes: ['insert', 'visual', 'visual-line', 'visual-block', 'command']
  }),

  // Basic navigation
  createVimCommand({
    id: 'move-left',
    keySequence: 'h',
    description: 'Move cursor left',
    category: 'navigation',
    difficulty: 'beginner',
    availableInModes: ['normal', 'visual', 'visual-line', 'visual-block']
  }),

  createVimCommand({
    id: 'move-down',
    keySequence: 'j',
    description: 'Move cursor down',
    category: 'navigation',
    difficulty: 'beginner',
    availableInModes: ['normal', 'visual', 'visual-line', 'visual-block']
  }),

  createVimCommand({
    id: 'move-up',
    keySequence: 'k',
    description: 'Move cursor up',
    category: 'navigation',
    difficulty: 'beginner',
    availableInModes: ['normal', 'visual', 'visual-line', 'visual-block']
  }),

  createVimCommand({
    id: 'move-right',
    keySequence: 'l',
    description: 'Move cursor right',
    category: 'navigation',
    difficulty: 'beginner',
    availableInModes: ['normal', 'visual', 'visual-line', 'visual-block']
  }),

  // Word navigation
  createVimCommand({
    id: 'word-forward',
    keySequence: 'w',
    description: 'Move to start of next word',
    category: 'navigation',
    difficulty: 'beginner',
    availableInModes: ['normal', 'visual', 'visual-line', 'visual-block'],
    examples: ['Move through words: "hello world" -> w moves from h to w']
  }),

  createVimCommand({
    id: 'word-backward',
    keySequence: 'b',
    description: 'Move to start of previous word',
    category: 'navigation',
    difficulty: 'beginner',
    availableInModes: ['normal', 'visual', 'visual-line', 'visual-block']
  }),

  createVimCommand({
    id: 'word-end',
    keySequence: 'e',
    description: 'Move to end of current/next word',
    category: 'navigation',
    difficulty: 'beginner',
    availableInModes: ['normal', 'visual', 'visual-line', 'visual-block']
  }),

  // Line navigation
  createVimCommand({
    id: 'line-start',
    keySequence: '0',
    description: 'Move to start of line',
    category: 'navigation',
    difficulty: 'beginner',
    availableInModes: ['normal', 'visual', 'visual-line', 'visual-block']
  }),

  createVimCommand({
    id: 'line-end',
    keySequence: '$',
    description: 'Move to end of line',
    category: 'navigation',
    difficulty: 'beginner',
    availableInModes: ['normal', 'visual', 'visual-line', 'visual-block']
  }),

  // Basic editing
  createVimCommand({
    id: 'delete-char',
    keySequence: 'x',
    description: 'Delete character under cursor',
    category: 'editing',
    difficulty: 'beginner',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'delete-line',
    keySequence: 'dd',
    description: 'Delete entire line',
    category: 'editing',
    difficulty: 'beginner',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'yank-line',
    keySequence: 'yy',
    description: 'Copy (yank) entire line',
    category: 'editing',
    difficulty: 'beginner',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'paste-after',
    keySequence: 'p',
    description: 'Paste after cursor',
    category: 'editing',
    difficulty: 'beginner',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'undo',
    keySequence: 'u',
    description: 'Undo last change',
    category: 'editing',
    difficulty: 'beginner',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'redo',
    keySequence: 'Ctrl+r',
    description: 'Redo last undone change',
    category: 'editing',
    difficulty: 'beginner',
    availableInModes: ['normal']
  }),

  // Advanced insertion
  createVimCommand({
    id: 'insert-line-start',
    keySequence: 'I',
    description: 'Enter Insert mode at beginning of line',
    category: 'modes',
    difficulty: 'intermediate',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'insert-line-end',
    keySequence: 'A',
    description: 'Enter Insert mode at end of line',
    category: 'modes',
    difficulty: 'intermediate',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'open-below',
    keySequence: 'o',
    description: 'Open new line below and enter Insert mode',
    category: 'editing',
    difficulty: 'intermediate',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'open-above',
    keySequence: 'O',
    description: 'Open new line above and enter Insert mode',
    category: 'editing',
    difficulty: 'intermediate',
    availableInModes: ['normal']
  }),

  // File navigation
  createVimCommand({
    id: 'file-start',
    keySequence: 'gg',
    description: 'Go to beginning of file',
    category: 'navigation',
    difficulty: 'intermediate',
    availableInModes: ['normal', 'visual', 'visual-line', 'visual-block']
  }),

  createVimCommand({
    id: 'file-end',
    keySequence: 'G',
    description: 'Go to end of file',
    category: 'navigation',
    difficulty: 'intermediate',
    availableInModes: ['normal', 'visual', 'visual-line', 'visual-block']
  }),

  // Visual modes
  createVimCommand({
    id: 'visual-char',
    keySequence: 'v',
    description: 'Enter Visual (character) mode',
    category: 'modes',
    difficulty: 'intermediate',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'visual-line',
    keySequence: 'V',
    description: 'Enter Visual Line mode',
    category: 'modes',
    difficulty: 'intermediate',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'visual-block',
    keySequence: 'Ctrl+v',
    description: 'Enter Visual Block mode',
    category: 'modes',
    difficulty: 'advanced',
    availableInModes: ['normal']
  }),

  // Advanced editing
  createVimCommand({
    id: 'change-line-end',
    keySequence: 'C',
    description: 'Change text from cursor to end of line',
    category: 'editing',
    difficulty: 'intermediate',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'delete-line-end',
    keySequence: 'D',
    description: 'Delete text from cursor to end of line',
    category: 'editing',
    difficulty: 'intermediate',
    availableInModes: ['normal']
  }),

  // Text objects
  createVimCommand({
    id: 'change-inner-word',
    keySequence: 'ciw',
    description: 'Change inner word (delete word under cursor and enter Insert mode)',
    category: 'text-objects',
    difficulty: 'advanced',
    availableInModes: ['normal'],
    prerequisites: ['insert-before-cursor']
  }),

  createVimCommand({
    id: 'delete-around-word',
    keySequence: 'daw',
    description: 'Delete a word (including trailing space)',
    category: 'text-objects',
    difficulty: 'advanced',
    availableInModes: ['normal']
  }),

  // Bracket text objects
  createVimCommand({
    id: 'change-inner-braces',
    keySequence: 'ci{',
    description: 'Change text inside curly braces',
    category: 'text-objects',
    difficulty: 'advanced',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'change-inner-parens',
    keySequence: 'ci(',
    description: 'Change text inside parentheses',
    category: 'text-objects',
    difficulty: 'advanced',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'change-inner-brackets',
    keySequence: 'ci[',
    description: 'Change text inside square brackets',
    category: 'text-objects',
    difficulty: 'advanced',
    availableInModes: ['normal']
  }),

  // Search commands
  createVimCommand({
    id: 'search-forward',
    keySequence: '/',
    description: 'Search forward for pattern',
    category: 'search',
    difficulty: 'intermediate',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'search-backward',
    keySequence: '?',
    description: 'Search backward for pattern',
    category: 'search',
    difficulty: 'intermediate',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'search-next',
    keySequence: 'n',
    description: 'Find next search match',
    category: 'search',
    difficulty: 'intermediate',
    availableInModes: ['normal'],
    prerequisites: ['search-forward']
  }),

  createVimCommand({
    id: 'search-previous',
    keySequence: 'N',
    description: 'Find previous search match',
    category: 'search',
    difficulty: 'intermediate',
    availableInModes: ['normal'],
    prerequisites: ['search-forward']
  }),

  // Marks
  createVimCommand({
    id: 'set-mark',
    keySequence: 'ma',
    description: 'Set mark "a" at current position',
    category: 'marks',
    difficulty: 'advanced',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'jump-mark-line',
    keySequence: "'a",
    description: 'Jump to line of mark "a"',
    category: 'marks',
    difficulty: 'advanced',
    availableInModes: ['normal'],
    prerequisites: ['set-mark']
  }),

  createVimCommand({
    id: 'jump-mark-exact',
    keySequence: '`a',
    description: 'Jump to exact position of mark "a"',
    category: 'marks',
    difficulty: 'advanced',
    availableInModes: ['normal'],
    prerequisites: ['set-mark']
  }),

  // Repeat command
  createVimCommand({
    id: 'repeat-change',
    keySequence: '.',
    description: 'Repeat the last change',
    category: 'advanced',
    difficulty: 'intermediate',
    availableInModes: ['normal']
  }),

  // Scrolling
  createVimCommand({
    id: 'scroll-down-page',
    keySequence: 'Ctrl+f',
    description: 'Scroll down one page',
    category: 'scrolling',
    difficulty: 'intermediate',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'scroll-up-page',
    keySequence: 'Ctrl+b',
    description: 'Scroll up one page',
    category: 'scrolling',
    difficulty: 'intermediate',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'scroll-down-half',
    keySequence: 'Ctrl+d',
    description: 'Scroll down half a page',
    category: 'scrolling',
    difficulty: 'intermediate',
    availableInModes: ['normal']
  }),

  createVimCommand({
    id: 'scroll-up-half',
    keySequence: 'Ctrl+u',
    description: 'Scroll up half a page',
    category: 'scrolling',
    difficulty: 'intermediate',
    availableInModes: ['normal']
  }),

  // Command mode
  createVimCommand({
    id: 'command-mode',
    keySequence: ':',
    description: 'Enter command mode',
    category: 'modes',
    difficulty: 'intermediate',
    availableInModes: ['normal']
  }),

  // File operations
  createVimCommand({
    id: 'save-file',
    keySequence: ':w',
    description: 'Save file',
    category: 'file-operations',
    difficulty: 'intermediate',
    availableInModes: ['command'],
    prerequisites: ['command-mode']
  }),

  createVimCommand({
    id: 'quit',
    keySequence: ':q',
    description: 'Quit',
    category: 'file-operations',
    difficulty: 'intermediate',
    availableInModes: ['command'],
    prerequisites: ['command-mode']
  }),

  createVimCommand({
    id: 'save-quit',
    keySequence: ':wq',
    description: 'Save and quit',
    category: 'file-operations',
    difficulty: 'intermediate',
    availableInModes: ['command'],
    prerequisites: ['command-mode']
  }),

  createVimCommand({
    id: 'substitute-global',
    keySequence: ':s/old/new/g',
    description: 'Substitute "old" with "new" (global)',
    category: 'advanced',
    difficulty: 'advanced',
    availableInModes: ['command'],
    prerequisites: ['command-mode']
  }),

  createVimCommand({
    id: 'goto-line-1',
    keySequence: ':1',
    description: 'Go to line 1',
    category: 'navigation',
    difficulty: 'intermediate',
    availableInModes: ['command'],
    prerequisites: ['command-mode']
  }),

  createVimCommand({
    id: 'goto-last-line',
    keySequence: ':$',
    description: 'Go to last line',
    category: 'navigation',
    difficulty: 'intermediate',
    availableInModes: ['command'],
    prerequisites: ['command-mode']
  })
]);

// Repository interface for dependency injection
export interface VimCommandRepository {
  getAllCommands(): ReadonlyArray<VimCommand>;
  getCommandById(id: string): VimCommand | undefined;
  getCommandsByCategory(category: CommandCategory): ReadonlyArray<VimCommand>;
  getCommandsByDifficulty(difficulty: DifficultyLevel): ReadonlyArray<VimCommand>;
  getCommandsForMode(mode: VimMode): ReadonlyArray<VimCommand>;
  getBeginnerCommands(): ReadonlyArray<VimCommand>;
}

// Implementation of repository
export class InMemoryVimCommandRepository implements VimCommandRepository {
  private readonly commands: ReadonlyArray<VimCommand>;

  constructor(commands: ReadonlyArray<VimCommand> = COMMAND_DATA) {
    this.commands = commands;
  }

  getAllCommands(): ReadonlyArray<VimCommand> {
    return this.commands;
  }

  getCommandById(id: string): VimCommand | undefined {
    return this.commands.find(cmd => cmd.id === id);
  }

  getCommandsByCategory(category: CommandCategory): ReadonlyArray<VimCommand> {
    return getCommandsByCategory(this.commands, category);
  }

  getCommandsByDifficulty(difficulty: DifficultyLevel): ReadonlyArray<VimCommand> {
    return getCommandsByDifficulty(this.commands, difficulty);
  }

  getCommandsForMode(mode: VimMode): ReadonlyArray<VimCommand> {
    return this.commands.filter(cmd => isCommandAvailableInMode(cmd, mode));
  }

  getBeginnerCommands(): ReadonlyArray<VimCommand> {
    return this.getCommandsByDifficulty('beginner');
  }
}

// Factory function for creating repository (dependency injection friendly)
export const createVimCommandRepository = (): VimCommandRepository => 
  new InMemoryVimCommandRepository();

// Default export for convenience
export default createVimCommandRepository;