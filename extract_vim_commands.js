#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the monaco-vim keymap file
const keymapFile = '/home/family/src/vim/node_modules/monaco-vim/src/cm/keymap_vim.js';

try {
  const content = fs.readFileSync(keymapFile, 'utf8');
  
  // Extract the defaultKeymap array (lines 47-877)
  const lines = content.split('\n');
  const keymapStart = 47; // 1-based line number, convert to 0-based
  const keymapEnd = 877;
  
  const keymapSection = lines.slice(keymapStart - 1, keymapEnd - 1).join('\n');
  
  // Extract the defaultExCommandMap array (lines 886-907)
  const exCommandStart = 886;
  const exCommandEnd = 907;
  
  const exCommandSection = lines.slice(exCommandStart - 1, exCommandEnd - 1).join('\n');
  
  console.log('='.repeat(80));
  console.log('VIM COMMANDS EXTRACTION ANALYSIS');
  console.log('='.repeat(80));
  
  console.log('\n1. DEFAULT KEYMAP STRUCTURE ANALYSIS');
  console.log('-'.repeat(50));
  
  // Analyze command types and their patterns
  const commandTypes = new Map();
  const contexts = new Set();
  const sampleCommands = new Map();
  
  // Parse the keymap using regex to extract command objects
  const keymapPattern = /{\s*keys:\s*"([^"]+)"[^}]+}/g;
  let match;
  
  while ((match = keymapPattern.exec(keymapSection)) !== null) {
    const fullMatch = match[0];
    const keys = match[1];
    
    // Extract type
    const typeMatch = fullMatch.match(/type:\s*"([^"]+)"/);
    const type = typeMatch ? typeMatch[1] : 'unknown';
    
    // Extract context
    const contextMatch = fullMatch.match(/context:\s*"([^"]+)"/);
    const context = contextMatch ? contextMatch[1] : 'default';
    
    // Track command types
    if (!commandTypes.has(type)) {
      commandTypes.set(type, []);
    }
    commandTypes.get(type).push({ keys, fullMatch });
    
    contexts.add(context);
    
    // Store sample commands for each type
    if (!sampleCommands.has(type) || sampleCommands.get(type).length < 3) {
      if (!sampleCommands.has(type)) {
        sampleCommands.set(type, []);
      }
      sampleCommands.get(type).push({ keys, fullMatch });
    }
  }
  
  console.log(`Total unique command types: ${commandTypes.size}`);
  console.log(`Total contexts found: ${Array.from(contexts).join(', ')}`);
  console.log(`\nCommand types breakdown:`);
  
  for (const [type, commands] of commandTypes.entries()) {
    console.log(`  ${type}: ${commands.length} commands`);
  }
  
  console.log('\n2. SAMPLE COMMANDS BY TYPE');
  console.log('-'.repeat(50));
  
  for (const [type, samples] of sampleCommands.entries()) {
    console.log(`\n${type.toUpperCase()} type commands:`);
    samples.forEach((sample, i) => {
      console.log(`  Sample ${i + 1}: ${sample.keys}`);
      // Pretty print the command object
      const formatted = sample.fullMatch
        .replace(/{\s*/, '{\n    ')
        .replace(/,\s*/g, ',\n    ')
        .replace(/\s*}/, '\n  }');
      console.log(`    ${formatted}`);
    });
  }
  
  console.log('\n3. EX COMMANDS ANALYSIS');
  console.log('-'.repeat(50));
  
  // Parse ex commands
  const exCommandPattern = /{\s*name:\s*"([^"]+)"[^}]*}/g;
  const exCommands = [];
  
  let exMatch;
  while ((exMatch = exCommandPattern.exec(exCommandSection)) !== null) {
    const fullMatch = exMatch[0];
    const name = exMatch[1];
    
    // Extract shortName
    const shortNameMatch = fullMatch.match(/shortName:\s*"([^"]+)"/);
    const shortName = shortNameMatch ? shortNameMatch[1] : null;
    
    // Extract other properties
    const possiblyAsync = fullMatch.includes('possiblyAsync: true');
    const excludeFromHistory = fullMatch.includes('excludeFromCommandHistory: true');
    
    exCommands.push({
      name,
      shortName,
      possiblyAsync,
      excludeFromHistory,
      fullMatch
    });
  }
  
  console.log(`Total ex commands: ${exCommands.length}`);
  console.log('\nEx commands list:');
  exCommands.forEach(cmd => {
    const short = cmd.shortName ? ` (short: ${cmd.shortName})` : '';
    const flags = [];
    if (cmd.possiblyAsync) flags.push('async');
    if (cmd.excludeFromHistory) flags.push('no-history');
    const flagStr = flags.length ? ` [${flags.join(', ')}]` : '';
    console.log(`  ${cmd.name}${short}${flagStr}`);
  });
  
  console.log('\n4. KEY PATTERNS ANALYSIS');
  console.log('-'.repeat(50));
  
  // Analyze key patterns
  const keyPatterns = new Map();
  
  for (const [type, commands] of commandTypes.entries()) {
    const patterns = new Set();
    
    commands.forEach(cmd => {
      const keys = cmd.keys;
      
      // Categorize key patterns
      if (keys.startsWith('<') && keys.endsWith('>')) {
        patterns.add('special-key');
      } else if (keys.includes('<')) {
        patterns.add('modified-key');
      } else if (keys.length === 1) {
        patterns.add('single-char');
      } else if (/^[a-z]+$/.test(keys)) {
        patterns.add('multi-char-lower');
      } else if (/^[A-Z]+$/.test(keys)) {
        patterns.add('multi-char-upper');
      } else {
        patterns.add('mixed-pattern');
      }
    });
    
    keyPatterns.set(type, Array.from(patterns));
  }
  
  console.log('\nKey patterns by command type:');
  for (const [type, patterns] of keyPatterns.entries()) {
    console.log(`  ${type}: ${patterns.join(', ')}`);
  }
  
  console.log('\n5. COMMAND PROPERTIES ANALYSIS');
  console.log('-'.repeat(50));
  
  // Analyze all properties used in commands
  const allProperties = new Set();
  
  for (const [type, commands] of commandTypes.entries()) {
    commands.forEach(cmd => {
      const props = cmd.fullMatch.match(/(\w+):\s*["{[]/g);
      if (props) {
        props.forEach(prop => {
          const propName = prop.replace(/:\s*["{[].*/, '');
          allProperties.add(propName);
        });
      }
    });
  }
  
  console.log(`All properties used: ${Array.from(allProperties).sort().join(', ')}`);
  
  console.log('\n6. EXTRACTION RECOMMENDATIONS');
  console.log('-'.repeat(50));
  
  console.log(`
Based on the analysis, here's the structure for vim command extraction:

DEFAULTKEYMAP ARRAY (lines 47-877):
- Location: var defaultKeymap = [ ... ];
- ${Array.from(commandTypes.keys()).map(type => `${commandTypes.get(type).length} ${type} commands`).join('\n- ')}

DEFAULTEXCOMMANDMAP ARRAY (lines 886-907):
- Location: var defaultExCommandMap = [ ... ];
- ${exCommands.length} ex commands with name/shortName mappings

KEY COMMAND PROPERTIES:
- keys: The key sequence (required)
- type: Command type (required) 
- context: Execution context (optional, defaults to all contexts)
- toKeys: Target keys for keyToKey mappings
- motion/operator/action: Function name for respective types
- motionArgs/operatorArgs/actionArgs: Arguments object
- isEdit: Boolean flag for edit operations

EXTRACTION STRATEGY:
1. Parse defaultKeymap array (lines 47-877) for key mappings
2. Parse defaultExCommandMap array (lines 886-907) for ex commands  
3. Group by command type and context
4. Extract all properties for complete command definitions
5. Build comprehensive vim command reference
  `);
  
} catch (error) {
  console.error('Error reading or parsing the keymap file:', error.message);
  process.exit(1);
}