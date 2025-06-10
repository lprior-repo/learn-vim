/**
 * Unit tests for ModeUtils following TDD principles
 */

import { describe, it, expect } from '@jest/globals';
import {
  extractModeFromStatusText,
  getModeDisplayName,
  getModeColorClasses,
  formatModeForDisplay,
  isValidVimMode,
  isModeInteractive,
  getModeTransitions,
  validateAndTransformMode,
  isSameMode,
  isValidModeTransition
} from '../ModeUtils';

describe('ModeUtils', () => {
  describe('extractModeFromStatusText', () => {
    it('should extract insert mode from status text', () => {
      expect(extractModeFromStatusText('--INSERT--')).toBe('insert');
      expect(extractModeFromStatusText('-- INSERT --')).toBe('insert');
      expect(extractModeFromStatusText('--insert--')).toBe('insert');
    });

    it('should extract visual modes from status text', () => {
      expect(extractModeFromStatusText('--VISUAL--')).toBe('visual');
      expect(extractModeFromStatusText('--VISUAL LINE--')).toBe('visual-line');
      expect(extractModeFromStatusText('--VISUAL BLOCK--')).toBe('visual-block');
    });

    it('should extract command mode from status text', () => {
      expect(extractModeFromStatusText(':w')).toBe('command');
      expect(extractModeFromStatusText(':')).toBe('command');
    });

    it('should default to normal mode for invalid input', () => {
      expect(extractModeFromStatusText('')).toBe('normal');
      expect(extractModeFromStatusText('random text')).toBe('normal');
      expect(extractModeFromStatusText('--NORMAL--')).toBe('normal');
    });

    it('should handle null and undefined input', () => {
      expect(extractModeFromStatusText(null as any)).toBe('normal');
      expect(extractModeFromStatusText(undefined as any)).toBe('normal');
    });
  });

  describe('getModeDisplayName', () => {
    it('should return correct display names', () => {
      expect(getModeDisplayName('normal')).toBe('Normal');
      expect(getModeDisplayName('insert')).toBe('Insert');
      expect(getModeDisplayName('visual')).toBe('Visual');
      expect(getModeDisplayName('visual-line')).toBe('Visual Line');
      expect(getModeDisplayName('visual-block')).toBe('Visual Block');
      expect(getModeDisplayName('command')).toBe('Command');
    });

    it('should return Unknown for invalid mode', () => {
      expect(getModeDisplayName('invalid' as any)).toBe('Unknown');
    });
  });

  describe('getModeColorClasses', () => {
    it('should return correct color classes', () => {
      expect(getModeColorClasses('normal')).toBe('bg-blue-600 text-white');
      expect(getModeColorClasses('insert')).toBe('bg-green-600 text-white');
      expect(getModeColorClasses('visual')).toBe('bg-yellow-600 text-black');
      expect(getModeColorClasses('visual-line')).toBe('bg-yellow-500 text-black');
      expect(getModeColorClasses('visual-block')).toBe('bg-yellow-700 text-white');
      expect(getModeColorClasses('command')).toBe('bg-purple-600 text-white');
    });

    it('should default to normal colors for invalid mode', () => {
      expect(getModeColorClasses('invalid' as any)).toBe('bg-blue-600 text-white');
    });
  });

  describe('formatModeForDisplay', () => {
    it('should format mode names to uppercase', () => {
      expect(formatModeForDisplay('normal')).toBe('NORMAL');
      expect(formatModeForDisplay('insert')).toBe('INSERT');
      expect(formatModeForDisplay('visual-line')).toBe('VISUAL LINE');
    });
  });

  describe('isValidVimMode', () => {
    it('should return true for valid modes', () => {
      expect(isValidVimMode('normal')).toBe(true);
      expect(isValidVimMode('insert')).toBe(true);
      expect(isValidVimMode('visual')).toBe(true);
      expect(isValidVimMode('visual-line')).toBe(true);
      expect(isValidVimMode('visual-block')).toBe(true);
      expect(isValidVimMode('command')).toBe(true);
    });

    it('should return false for invalid modes', () => {
      expect(isValidVimMode('invalid')).toBe(false);
      expect(isValidVimMode('')).toBe(false);
      expect(isValidVimMode(null)).toBe(false);
      expect(isValidVimMode(undefined)).toBe(false);
      expect(isValidVimMode(123)).toBe(false);
    });
  });

  describe('isModeInteractive', () => {
    it('should return true for interactive modes', () => {
      expect(isModeInteractive('normal')).toBe(true);
      expect(isModeInteractive('insert')).toBe(true);
      expect(isModeInteractive('visual')).toBe(true);
      expect(isModeInteractive('visual-line')).toBe(true);
      expect(isModeInteractive('visual-block')).toBe(true);
    });

    it('should return false for command mode', () => {
      expect(isModeInteractive('command')).toBe(false);
    });
  });

  describe('getModeTransitions', () => {
    it('should return correct transitions from normal mode', () => {
      const transitions = getModeTransitions('normal');
      expect(transitions).toContain('insert');
      expect(transitions).toContain('visual');
      expect(transitions).toContain('visual-line');
      expect(transitions).toContain('visual-block');
      expect(transitions).toContain('command');
    });

    it('should return correct transitions from insert mode', () => {
      const transitions = getModeTransitions('insert');
      expect(transitions).toEqual(['normal']);
    });

    it('should return correct transitions from visual modes', () => {
      expect(getModeTransitions('visual')).toEqual(['normal', 'insert']);
      expect(getModeTransitions('visual-line')).toEqual(['normal', 'insert']);
      expect(getModeTransitions('visual-block')).toEqual(['normal', 'insert']);
    });

    it('should return correct transitions from command mode', () => {
      const transitions = getModeTransitions('command');
      expect(transitions).toEqual(['normal']);
    });
  });

  describe('validateAndTransformMode', () => {
    it('should return valid mode as-is', () => {
      expect(validateAndTransformMode('normal')).toBe('normal');
      expect(validateAndTransformMode('insert')).toBe('insert');
    });

    it('should handle case insensitive input', () => {
      expect(validateAndTransformMode('NORMAL')).toBe('normal');
      expect(validateAndTransformMode('Insert')).toBe('insert');
    });

    it('should trim whitespace', () => {
      expect(validateAndTransformMode('  normal  ')).toBe('normal');
    });

    it('should default to normal for invalid input', () => {
      expect(validateAndTransformMode('invalid')).toBe('normal');
      expect(validateAndTransformMode('')).toBe('normal');
    });
  });

  describe('isSameMode', () => {
    it('should return true for same modes', () => {
      expect(isSameMode('normal', 'normal')).toBe(true);
      expect(isSameMode('insert', 'insert')).toBe(true);
    });

    it('should return false for different modes', () => {
      expect(isSameMode('normal', 'insert')).toBe(false);
      expect(isSameMode('visual', 'visual-line')).toBe(false);
    });
  });

  describe('isValidModeTransition', () => {
    it('should return true for valid transitions', () => {
      expect(isValidModeTransition('normal', 'insert')).toBe(true);
      expect(isValidModeTransition('normal', 'visual')).toBe(true);
      expect(isValidModeTransition('insert', 'normal')).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      expect(isValidModeTransition('insert', 'visual')).toBe(false);
      expect(isValidModeTransition('command', 'insert')).toBe(false);
    });
  });
});