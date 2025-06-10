/**
 * Domain model for Vim commands following DDD and functional programming principles
 * 
 * Following Pragmatic Programmer principles:
 * - DRY: Single source of truth for command definitions
 * - Tell Don't Ask: Commands encapsulate behavior
 * - Make it easy to change: Extensible categorization
 */

// Value objects - immutable and self-validating
export interface KeySequence {
  readonly value: string;
  readonly modifiers: ReadonlyArray<KeyModifier>;
}

export interface Description {
  readonly value: string;
  readonly examples?: ReadonlyArray<string>;
}

export type KeyModifier = 'Ctrl' | 'Alt' | 'Shift' | 'Meta';

export type VimMode = 'normal' | 'insert' | 'visual' | 'visual-line' | 'visual-block' | 'command';

export type CommandCategory = 
  | 'navigation' 
  | 'editing' 
  | 'modes' 
  | 'text-objects' 
  | 'search' 
  | 'marks' 
  | 'scrolling' 
  | 'file-operations'
  | 'advanced';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Core domain entity
export interface VimCommand {
  readonly id: string;
  readonly keySequence: KeySequence;
  readonly description: Description;
  readonly category: CommandCategory;
  readonly difficulty: DifficultyLevel;
  readonly availableInModes: ReadonlyArray<VimMode>;
  readonly prerequisites?: ReadonlyArray<string>; // Command IDs
}

// Factory functions for creating value objects (functional approach)
export const createKeySequence = (value: string): KeySequence => {
  if (!value || value.trim().length === 0) {
    throw new Error('Key sequence cannot be empty');
  }

  const modifiers: KeyModifier[] = [];
  const cleanValue = value.trim();
  
  if (cleanValue.includes('Ctrl+')) modifiers.push('Ctrl');
  if (cleanValue.includes('Alt+')) modifiers.push('Alt');
  if (cleanValue.includes('Shift+')) modifiers.push('Shift');
  if (cleanValue.includes('Meta+')) modifiers.push('Meta');

  return Object.freeze({
    value: cleanValue,
    modifiers: Object.freeze(modifiers)
  });
};

export const createDescription = (value: string, examples?: ReadonlyArray<string>): Description => {
  if (!value || value.trim().length === 0) {
    throw new Error('Description cannot be empty');
  }

  return Object.freeze({
    value: value.trim(),
    examples: examples ? Object.freeze([...examples]) : undefined
  });
};

// Pure function for command creation with validation
export const createVimCommand = (props: {
  id: string;
  keySequence: string;
  description: string;
  category: CommandCategory;
  difficulty: DifficultyLevel;
  availableInModes: ReadonlyArray<VimMode>;
  examples?: ReadonlyArray<string>;
  prerequisites?: ReadonlyArray<string>;
}): VimCommand => {
  if (!props.id || props.id.trim().length === 0) {
    throw new Error('Command ID is required');
  }

  return Object.freeze({
    id: props.id.trim(),
    keySequence: createKeySequence(props.keySequence),
    description: createDescription(props.description, props.examples),
    category: props.category,
    difficulty: props.difficulty,
    availableInModes: Object.freeze([...props.availableInModes]),
    prerequisites: props.prerequisites ? Object.freeze([...props.prerequisites]) : undefined
  });
};

// Pure functions for command queries (functional programming)
export const isCommandAvailableInMode = (command: VimCommand, mode: VimMode): boolean =>
  command.availableInModes.includes(mode);

export const getCommandsByCategory = (commands: ReadonlyArray<VimCommand>, category: CommandCategory): ReadonlyArray<VimCommand> =>
  commands.filter(cmd => cmd.category === category);

export const getCommandsByDifficulty = (commands: ReadonlyArray<VimCommand>, difficulty: DifficultyLevel): ReadonlyArray<VimCommand> =>
  commands.filter(cmd => cmd.difficulty === difficulty);

export const getPrerequisiteCommands = (commands: ReadonlyArray<VimCommand>, command: VimCommand): ReadonlyArray<VimCommand> =>
  command.prerequisites 
    ? commands.filter(cmd => command.prerequisites!.includes(cmd.id))
    : [];

// Type guard functions (defensive programming)
export const isValidKeySequence = (value: unknown): value is KeySequence =>
  typeof value === 'object' && 
  value !== null && 
  'value' in value && 
  'modifiers' in value;

export const isValidVimCommand = (value: unknown): value is VimCommand =>
  typeof value === 'object' && 
  value !== null && 
  'id' in value && 
  'keySequence' in value && 
  'description' in value &&
  'category' in value &&
  'difficulty' in value &&
  'availableInModes' in value;