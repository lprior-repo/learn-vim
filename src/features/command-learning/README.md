# Command Learning Feature

## Purpose

The Command Learning feature provides a structured approach to learning and practicing Vim commands. It includes command discovery, practice exercises, and progress tracking to help users master Vim's powerful command set.

## Components

### CommandCard

A React component that displays a single Vim command with:
- Command keystroke sequence
- Description and usage examples
- Difficulty level indicator
- Practice button to try the command in the editor

### CommandList

A React component that displays a filterable, searchable list of Vim commands organized by categories.

### CommandPractice

A React component that presents guided practice exercises for specific commands, with:
- Task description
- Initial text state
- Expected outcome
- Real-time feedback

## Data

### VimCommandRepository

Manages the collection of available Vim commands:
- Command definitions with metadata
- Command categorization
- Command filtering and search

## Domain

### VimCommand

Immutable domain model representing a Vim command:
```typescript
interface VimCommand {
  id: string;
  keys: string;
  description: string;
  category: CommandCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  examples: string[];
  related?: string[];
}
```

## Services

### CommandLearningService

Tracks user progress and manages the learning experience:
- Command mastery tracking
- Recommendation of next commands to learn
- Practice session management

## Public API

```typescript
// From index.ts
export { CommandCard } from './components/CommandCard';
export { CommandList } from './components/CommandList';
export { CommandPractice } from './components/CommandPractice';
export { useCommandLearning } from './hooks/useCommandLearning';
export { 
  getAllCommands,
  getCommandById,
  getCommandsByCategory,
  searchCommands
} from './services/commandActions';
export type { VimCommand, CommandCategory } from './types';
```

## Usage Example

```tsx
import { 
  CommandList, 
  useCommandLearning,
  getCommandsByCategory 
} from '@/features/command-learning';

function CommandLearningPage() {
  const { learnedCommands, markCommandAsLearned } = useCommandLearning();
  const [category, setCategory] = useState('motion');
  const commands = getCommandsByCategory(category);
  
  return (
    <div className="command-learning-container">
      <h1>Learn Vim Commands</h1>
      <div className="category-selector">
        {/* Category selection UI */}
      </div>
      <CommandList 
        commands={commands}
        learnedCommands={learnedCommands}
        onCommandLearned={markCommandAsLearned}
      />
    </div>
  );
}
```

## Dependencies

- React for component architecture
- Features/editor for command execution in the Monaco editor
- Features/shared for UI components and utilities

## Integration Points

- Integrates with the editor feature to execute and verify commands
- Provides command data to learning-paths feature for structured learning
- Uses shared UI components for consistent styling

## Testing

Tests for this feature focus on:
1. Command data integrity
2. Command filtering and search functionality
3. Component rendering and interactions
4. Learning progress tracking

Example test: `tests/command-learning/command-list.spec.ts`
