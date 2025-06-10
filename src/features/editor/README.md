# Editor Feature

## Purpose

The Editor feature manages the Monaco Editor with Vim bindings integration, providing a realistic Vim-like editing experience for users to practice commands.

## Components

### MonacoEditor

A React component that wraps the Monaco Editor with Vim bindings. It handles:
- Editor initialization and configuration
- Vim mode integration
- Command status tracking
- UI state management for editor feedback

## Services

### MonacoEditorService

Manages the Monaco Editor lifecycle and integration:
- Editor instance creation and destruction
- Vim mode initialization
- Command execution tracking
- Text content manipulation
- Editor state management

## Public API

```typescript
// From index.ts
export { MonacoEditor } from './components/MonacoEditor';
export { useEditor } from './hooks/useEditor';
export { 
  executeCommand, 
  resetEditor, 
  setEditorContent 
} from './services/editorActions';
export type { EditorState, EditorCommand } from './types';
```

## Usage Example

```tsx
import { MonacoEditor, useEditor, setEditorContent } from '@/features/editor';

function VimPractice() {
  const { editorState, editorDispatch } = useEditor();
  
  // Set initial content
  useEffect(() => {
    editorDispatch(setEditorContent('This is sample text for practicing Vim commands'));
  }, []);
  
  return (
    <div className="editor-container">
      <MonacoEditor 
        height="400px" 
        theme="vs-dark"
        options={{
          lineNumbers: 'on',
          minimap: { enabled: false }
        }}
      />
      <div className="status-bar">
        {editorState.mode === 'normal' ? 'NORMAL' : editorState.mode.toUpperCase()}
      </div>
    </div>
  );
}
```

## Dependencies

- monaco-editor: Core editor functionality
- monaco-vim: Vim keybindings and mode support
- React for component architecture

## Integration Points

- Integrates with the command-learning feature to verify user command execution
- Provides editor state to learning-paths feature for progress tracking
- Uses shared UI components for consistent styling

## Testing

Tests for this feature focus on:
1. Editor initialization
2. Vim command execution
3. Editor state management
4. Component rendering and interactions

Example test: `tests/editor/monaco-editor.spec.ts`
