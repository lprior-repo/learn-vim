/**
 * Bun script that extracts vim commands from monaco-vim keymap
 * and creates a comprehensive command catalogue for vim training
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Read the monaco-vim keymap file
const vimPath = './node_modules/monaco-vim/src/cm/keymap_vim.js';
const source = await Bun.file(vimPath).text();

// Extract defaultKeymap array using regex since it's a simple structure
const keymapMatch = source.match(/var defaultKeymap = \[([\s\S]*?)\];/);
const exCommandMatch = source.match(/var defaultExCommandMap = \[([\s\S]*?)\];/);

if (!keymapMatch) {
  console.error('Could not find defaultKeymap in source');
  process.exit(1);
}

// Simple command structure
type VimCommand = {
  slug: string;
  keys: string;
  mode: 'normal' | 'insert' | 'visual' | 'command';
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
};

// Parse the keymap entries manually since they're object literals
function parseKeymapEntries(mapText: string): VimCommand[] {
  const commands: VimCommand[] = [];
  
  // Split by object boundaries and parse each entry
  const entries = mapText.split(/},\s*{/).map(entry => {
    if (!entry.startsWith('{')) entry = '{' + entry;
    if (!entry.endsWith('}')) entry = entry + '}';
    return entry;
  });

  for (const entry of entries) {
    try {
      // Extract keys using regex
      const keysMatch = entry.match(/keys:\s*["']([^"']+)["']/);
      if (!keysMatch) continue;
      
      const keys = keysMatch[1];
      
      // Skip meta keys and complex mappings for now
      if (keys.includes('<') || keys.includes('Ctrl') || keys.includes('Shift')) {
        continue;
      }
      
      // Determine category and description based on key patterns
      const { category, description, difficulty } = categorizeCommand(keys, entry);
      
      commands.push({
        slug: keys.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
        keys,
        mode: 'normal', // Most commands are normal mode
        description,
        category,
        difficulty
      });
    } catch (error) {
      // Skip malformed entries
      continue;
    }
  }
  
  return commands;
}

function categorizeCommand(keys: string, entry: string): {
  category: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
} {
  // Basic movement commands
  if (['h', 'j', 'k', 'l'].includes(keys)) {
    return {
      category: 'basic-movement',
      description: getBasicMovementDescription(keys),
      difficulty: 'beginner'
    };
  }
  
  // Word movement
  if (['w', 'b', 'e', 'W', 'B', 'E'].includes(keys)) {
    return {
      category: 'word-movement',
      description: getWordMovementDescription(keys),
      difficulty: 'beginner'
    };
  }
  
  // Line operations
  if (['0', '$', '^', 'g_'].includes(keys)) {
    return {
      category: 'line-movement',
      description: getLineMovementDescription(keys),
      difficulty: 'beginner'
    };
  }
  
  // Editing commands
  if (['i', 'a', 'o', 'O', 'I', 'A'].includes(keys)) {
    return {
      category: 'insert-mode',
      description: getInsertModeDescription(keys),
      difficulty: 'beginner'
    };
  }
  
  // Deletion
  if (['x', 'X', 'd', 'D'].includes(keys)) {
    return {
      category: 'deletion',
      description: getDeletionDescription(keys),
      difficulty: 'beginner'
    };
  }
  
  // Search
  if (['/', '?', 'n', 'N', '*', '#'].includes(keys)) {
    return {
      category: 'search',
      description: getSearchDescription(keys),
      difficulty: 'intermediate'
    };
  }
  
  // Visual mode
  if (['v', 'V'].includes(keys)) {
    return {
      category: 'visual-mode',
      description: getVisualModeDescription(keys),
      difficulty: 'intermediate'
    };
  }
  
  // Copy/paste
  if (['y', 'p', 'P'].includes(keys)) {
    return {
      category: 'copy-paste',
      description: getCopyPasteDescription(keys),
      difficulty: 'intermediate'
    };
  }
  
  // Undo/redo
  if (['u', 'U'].includes(keys)) {
    return {
      category: 'undo-redo',
      description: getUndoRedoDescription(keys),
      difficulty: 'beginner'
    };
  }
  
  // Advanced movement
  if (['gg', 'G', 'f', 'F', 't', 'T', ';', ','].includes(keys)) {
    return {
      category: 'advanced-movement',
      description: getAdvancedMovementDescription(keys),
      difficulty: 'intermediate'
    };
  }
  
  // Default case
  return {
    category: 'misc',
    description: `Execute command: ${keys}`,
    difficulty: 'advanced'
  };
}

// Description helpers
function getBasicMovementDescription(key: string): string {
  const movements = {
    'h': 'Move cursor left',
    'j': 'Move cursor down',
    'k': 'Move cursor up',
    'l': 'Move cursor right'
  };
  return movements[key] || 'Basic movement';
}

function getWordMovementDescription(key: string): string {
  const movements = {
    'w': 'Move to beginning of next word',
    'b': 'Move to beginning of previous word',
    'e': 'Move to end of current word',
    'W': 'Move to beginning of next WORD',
    'B': 'Move to beginning of previous WORD',
    'E': 'Move to end of current WORD'
  };
  return movements[key] || 'Word movement';
}

function getLineMovementDescription(key: string): string {
  const movements = {
    '0': 'Move to beginning of line',
    '$': 'Move to end of line',
    '^': 'Move to first non-blank character',
    'g_': 'Move to last non-blank character'
  };
  return movements[key] || 'Line movement';
}

function getInsertModeDescription(key: string): string {
  const modes = {
    'i': 'Insert before cursor',
    'a': 'Insert after cursor',
    'o': 'Open new line below',
    'O': 'Open new line above',
    'I': 'Insert at beginning of line',
    'A': 'Insert at end of line'
  };
  return modes[key] || 'Insert mode';
}

function getDeletionDescription(key: string): string {
  const deletions = {
    'x': 'Delete character under cursor',
    'X': 'Delete character before cursor',
    'd': 'Delete (requires motion)',
    'D': 'Delete to end of line'
  };
  return deletions[key] || 'Delete';
}

function getSearchDescription(key: string): string {
  const searches = {
    '/': 'Search forward',
    '?': 'Search backward',
    'n': 'Next search result',
    'N': 'Previous search result',
    '*': 'Search word under cursor forward',
    '#': 'Search word under cursor backward'
  };
  return searches[key] || 'Search';
}

function getVisualModeDescription(key: string): string {
  const modes = {
    'v': 'Visual character mode',
    'V': 'Visual line mode'
  };
  return modes[key] || 'Visual mode';
}

function getCopyPasteDescription(key: string): string {
  const operations = {
    'y': 'Yank (copy)',
    'p': 'Paste after cursor',
    'P': 'Paste before cursor'
  };
  return operations[key] || 'Copy/paste';
}

function getUndoRedoDescription(key: string): string {
  const operations = {
    'u': 'Undo last change',
    'U': 'Undo all changes on line'
  };
  return operations[key] || 'Undo/redo';
}

function getAdvancedMovementDescription(key: string): string {
  const movements = {
    'gg': 'Go to first line',
    'G': 'Go to last line',
    'f': 'Find character forward',
    'F': 'Find character backward',
    't': 'Till character forward',
    'T': 'Till character backward',
    ';': 'Repeat last f/F/t/T',
    ',': 'Repeat last f/F/t/T reversed'
  };
  return movements[key] || 'Advanced movement';
}

// Parse the commands
const commands = parseKeymapEntries(keymapMatch[1]);

// Add some essential commands manually that might be missing
const essentialCommands: VimCommand[] = [
  {
    slug: 'escape',
    keys: '<Esc>',
    mode: 'insert',
    description: 'Return to normal mode',
    category: 'mode-switching',
    difficulty: 'beginner'
  },
  {
    slug: 'save',
    keys: ':w',
    mode: 'command',
    description: 'Save file',
    category: 'file-operations',
    difficulty: 'beginner'
  },
  {
    slug: 'quit',
    keys: ':q',
    mode: 'command',
    description: 'Quit editor',
    category: 'file-operations',
    difficulty: 'beginner'
  },
  {
    slug: 'save_quit',
    keys: ':wq',
    mode: 'command',
    description: 'Save and quit',
    category: 'file-operations',
    difficulty: 'beginner'
  }
];

const allCommands = [...commands, ...essentialCommands];

// Group commands by category for better organization
const commandsByCategory = allCommands.reduce((acc, cmd) => {
  if (!acc[cmd.category]) {
    acc[cmd.category] = [];
  }
  acc[cmd.category].push(cmd);
  return acc;
}, {} as Record<string, VimCommand[]>);

// Create output directory
const outputPath = 'src/content/vim-commands.json';
mkdirSync(dirname(outputPath), { recursive: true });

// Write the commands
writeFileSync(outputPath, JSON.stringify({
  commands: allCommands,
  categories: commandsByCategory,
  metadata: {
    totalCommands: allCommands.length,
    categories: Object.keys(commandsByCategory),
    generatedAt: new Date().toISOString()
  }
}, null, 2), 'utf8');

console.log(`✅ Extracted ${allCommands.length} vim commands to ${outputPath}`);
console.log(`📂 Categories: ${Object.keys(commandsByCategory).join(', ')}`);