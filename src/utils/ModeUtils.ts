/**
 * Pure functions for Vim mode handling
 * 
 * Principles applied:
 * - DRY: Single source of truth for mode logic
 * - Pure functions: No side effects, predictable outputs
 * - Immutable data: Mode information doesn't change objects
 * - Type safety: Strong typing for mode values
 */

import type { VimMode } from '../domain/VimCommand';

// Re-export VimMode for other modules
export type { VimMode };

// Color scheme for different modes (immutable configuration)
export const MODE_COLORS = Object.freeze({
  normal: 'bg-blue-600 text-white',
  insert: 'bg-green-600 text-white',
  visual: 'bg-yellow-600 text-black',
  'visual-line': 'bg-yellow-500 text-black',
  'visual-block': 'bg-yellow-700 text-white',
  command: 'bg-purple-600 text-white'
} as const);

// Mode display names (immutable configuration)
export const MODE_DISPLAY_NAMES = Object.freeze({
  normal: 'Normal',
  insert: 'Insert',
  visual: 'Visual',
  'visual-line': 'Visual Line',
  'visual-block': 'Visual Block',
  command: 'Command'
} as const);

// Mode status patterns for parsing vim status text
const MODE_PATTERNS = Object.freeze({
  insert: /--\s*INSERT\s*--/i,
  visual: /--\s*VISUAL\s*--/i,
  'visual-line': /--\s*VISUAL\s+LINE\s*--/i,
  'visual-block': /--\s*VISUAL\s+BLOCK\s*--/i,
  command: /^:/,
  normal: /--\s*NORMAL\s*--/i
} as const);

// Pure function to extract mode from status text
export const extractModeFromStatusText = (statusText: string): VimMode => {
  if (!statusText || typeof statusText !== 'string') {
    return 'normal';
  }

  const normalizedText = statusText.trim();
  
  // Check patterns in order of specificity (most specific first)
  if (MODE_PATTERNS['visual-line'].test(normalizedText)) return 'visual-line';
  if (MODE_PATTERNS['visual-block'].test(normalizedText)) return 'visual-block';
  if (MODE_PATTERNS.visual.test(normalizedText)) return 'visual';
  if (MODE_PATTERNS.insert.test(normalizedText)) return 'insert';
  if (MODE_PATTERNS.command.test(normalizedText)) return 'command';
  
  // Default to normal mode
  return 'normal';
};

// Pure function to get display name for mode
export const getModeDisplayName = (mode: VimMode): string => 
  MODE_DISPLAY_NAMES[mode] || 'Unknown';

// Pure function to get CSS classes for mode
export const getModeColorClasses = (mode: VimMode): string => 
  MODE_COLORS[mode] || MODE_COLORS.normal;

// Pure function to format mode for display
export const formatModeForDisplay = (mode: VimMode): string => {
  const displayName = getModeDisplayName(mode);
  return displayName.toUpperCase();
};

// Type guard for valid modes
export const isValidVimMode = (value: unknown): value is VimMode => {
  return typeof value === 'string' && 
         (value === 'normal' || 
          value === 'insert' || 
          value === 'visual' || 
          value === 'visual-line' || 
          value === 'visual-block' || 
          value === 'command');
};

// Pure function to check if mode allows command execution
export const isModeInteractive = (mode: VimMode): boolean => 
  mode !== 'command';

// Pure function to get available commands for mode (would use repository)
export const getModeTransitions = (currentMode: VimMode): ReadonlyArray<VimMode> => {
  const transitions: Record<VimMode, ReadonlyArray<VimMode>> = {
    normal: ['insert', 'visual', 'visual-line', 'visual-block', 'command'],
    insert: ['normal'],
    visual: ['normal', 'insert'],
    'visual-line': ['normal', 'insert'],
    'visual-block': ['normal', 'insert'],
    command: ['normal']
  };
  
  return transitions[currentMode] || [];
};

// Functional composition helper for mode validation and transformation
export const validateAndTransformMode = (rawMode: string): VimMode => {
  const normalized = rawMode.toLowerCase().trim() as VimMode;
  return isValidVimMode(normalized) ? normalized : 'normal';
};

// Pure function for mode comparison
export const isSameMode = (mode1: VimMode, mode2: VimMode): boolean =>
  mode1 === mode2;

// Pure function to check if mode change is valid
export const isValidModeTransition = (from: VimMode, to: VimMode): boolean => {
  const allowedTransitions = getModeTransitions(from);
  return allowedTransitions.includes(to);
};