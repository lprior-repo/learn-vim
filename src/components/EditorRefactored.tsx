/**
 * Refactored Editor component following ThoughtWorks and Pragmatic Programmer principles
 * 
 * Principles applied:
 * - Single Responsibility: Only renders editor UI
 * - Dependency Injection: Services injected via props
 * - Pure functional patterns where possible
 * - Separation of concerns: UI, business logic, and data access separated
 * - Error boundaries and defensive programming
 * - CUPID principles: Composable, Unix philosophy, Predictable, Idiomatic, Domain-based
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { VimMode } from '../domain/VimCommand';
import { 
  MonacoService, 
  VimInstance, 
  MonacoEditor,
  EditorConfiguration,
  createDefaultEditorConfig 
} from '../services/MonacoEditorService';
import { VimCommandService } from '../services/VimCommandService';
import { useVimEditorStoreContext } from '../store/VimEditorStore';
import { extractModeFromStatusText } from '../utils/ModeUtils';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

// Component props interface following interface segregation
interface EditorProps {
  readonly content: string;
  readonly height?: string;
  readonly readOnly?: boolean;
  readonly onContentChange?: (content: string) => void;
  readonly onModeChange?: (mode: VimMode) => void;
  readonly onCommandExecuted?: (command: string) => void;
  readonly editorConfig?: Partial<EditorConfiguration>;
}

// Dependencies interface for dependency injection
interface EditorDependencies {
  readonly monacoService: MonacoService;
  readonly commandService: VimCommandService;
}

/**
 * Pure functional component for editor rendering
 * Separated from business logic and side effects
 */
const EditorUI: React.FC<{
  readonly editorRef: React.RefObject<HTMLDivElement>;
  readonly statusBarRef: React.RefObject<HTMLDivElement>;
  readonly height: string;
  readonly isLoading: boolean;
  readonly errors: ReadonlyArray<string>;
}> = ({ editorRef, statusBarRef, height, isLoading, errors }) => (
  <div className="relative rounded-md overflow-hidden shadow-lg border border-neutral-700" style={{ height }} data-testid="vim-editor">
    {isLoading && (
      <div className="absolute inset-0 flex flex-col gap-2 justify-center items-center bg-neutral-900/90 z-10">
        <LoadingSpinner />
        <p className="text-neutral-300">Loading editor...</p>
      </div>
    )}

    {errors.length > 0 && (
      <div className="absolute inset-0 flex flex-col gap-4 justify-center items-center bg-red-900/90 text-red-400 z-10">
        <p className="text-lg font-semibold">Error Initializing Editor</p>
        {errors.map((error, index) => (
          <p key={index} className="text-sm">{error}</p>
        ))}
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-red-800 hover:bg-red-700 rounded-md text-sm"
        >
          Retry
        </button>
      </div>
    )}

    <div ref={editorRef} className="w-full h-[calc(100%-30px)]"></div>
    <div
      ref={statusBarRef}
      className="h-[30px] bg-neutral-800 text-neutral-300 text-xs sm:text-sm font-mono px-2 sm:px-2.5 flex items-center border-t border-neutral-700 overflow-x-auto"
      data-testid="mode-indicator"
    ></div>
  </div>
);

/**
 * Custom hook for editor initialization and management
 * Encapsulates side effects and business logic
 */
const useEditorInitialization = (
  dependencies: EditorDependencies,
  props: EditorProps
) => {
  const store = useVimEditorStoreContext();
  const editorRef = useRef<HTMLDivElement>(null);
  const statusBarRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<MonacoEditor | null>(null);
  const vimInstanceRef = useRef<VimInstance | null>(null);

  // Memoized event handlers
  const handleContentChange = useCallback((content: string) => {
    store.dispatch(store.actions.contentChanged(content));
    props.onContentChange?.(content);
  }, [store, props.onContentChange]);

  const handleModeChange = useCallback((statusText: string) => {
    const mode = extractModeFromStatusText(statusText);
    store.dispatch(store.actions.modeChanged(mode));
    props.onModeChange?.(mode);
  }, [store, props.onModeChange]);

  const handleCommandExecuted = useCallback((command: string) => {
    store.dispatch(store.actions.commandExecuted(command));
    props.onCommandExecuted?.(command);
  }, [store, props.onCommandExecuted]);

  // Editor initialization effect
  useEffect(() => {
    if (!editorRef.current || !statusBarRef.current) return;

    let mounted = true;
    const disposables: Array<{ dispose(): void }> = [];

    const initializeEditor = async () => {
      try {
        store.dispatch(store.actions.editorInitStart());

        // Create editor with configuration
        const editorConfig = createDefaultEditorConfig({
          readOnly: props.readOnly,
          ...props.editorConfig
        });

        const editorResult = await dependencies.monacoService.createEditor(
          editorRef.current!,
          editorConfig
        );

        if (!editorResult.success) {
          throw new Error(editorResult.error);
        }

        const editor = editorResult.data;
        editorInstanceRef.current = editor;

        // Set initial content
        if (props.content) {
          editor.setValue(props.content);
        }

        // Initialize Vim mode
        const vimResult = await dependencies.monacoService.initializeVim(
          editor,
          statusBarRef.current!
        );

        if (!vimResult.success) {
          throw new Error(vimResult.error);
        }

        const vim = vimResult.data;
        vimInstanceRef.current = vim;

        // Register basic movement commands
        const commandResult = await dependencies.commandService.registerBasicMovementCommands(vim, editor);
        if (!commandResult.success) {
          console.warn('Failed to register some commands:', commandResult.error);
        }

        // Set up event listeners
        const contentDisposable = editor.onDidChangeModelContent(() => {
          if (mounted) {
            handleContentChange(editor.getValue());
          }
        });
        disposables.push(contentDisposable);

        const positionDisposable = editor.onDidChangeCursorPosition((e) => {
          if (mounted) {
            store.dispatch(store.actions.positionChanged(e.position));
          }
        });
        disposables.push(positionDisposable);

        // Vim mode change listener
        vim.on('mode-change', (mode: string) => {
          if (mounted) {
            handleModeChange(mode);
          }
        });

        // Command execution listener
        vim.on('command-executed', (command: string) => {
          if (mounted) {
            handleCommandExecuted(command);
          }
        });

        if (mounted) {
          store.dispatch(store.actions.editorInitSuccess());
        }

      } catch (error) {
        if (mounted) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          store.dispatch(store.actions.editorInitFailure(errorMessage));
        }
      }
    };

    initializeEditor();

    // Cleanup function
    return () => {
      mounted = false;
      
      disposables.forEach(disposable => {
        try {
          disposable.dispose();
        } catch (error) {
          console.warn('Error disposing editor resource:', error);
        }
      });

      if (vimInstanceRef.current) {
        try {
          vimInstanceRef.current.dispose();
        } catch (error) {
          console.warn('Error disposing vim instance:', error);
        }
        vimInstanceRef.current = null;
      }

      if (editorInstanceRef.current) {
        try {
          editorInstanceRef.current.dispose();
        } catch (error) {
          console.warn('Error disposing editor instance:', error);
        }
        editorInstanceRef.current = null;
      }
    };
  }, [dependencies, props.content, props.readOnly, props.editorConfig, store, handleContentChange, handleModeChange, handleCommandExecuted]);

  return {
    editorRef,
    statusBarRef,
    editor: editorInstanceRef.current,
    vim: vimInstanceRef.current
  };
};

/**
 * Main Editor component
 * Composed of pure UI and business logic hook
 */
const EditorRefactored: React.FC<EditorProps & EditorDependencies> = (props) => {
  const { monacoService, commandService, ...editorProps } = props;
  const store = useVimEditorStoreContext();
  
  const { editorRef, statusBarRef } = useEditorInitialization(
    { monacoService, commandService },
    editorProps
  );

  return (
    <ErrorBoundary>
      <EditorUI
        editorRef={editorRef}
        statusBarRef={statusBarRef}
        height={props.height || '500px'}
        isLoading={!store.selectors.isEditorReady}
        errors={store.state.ui.errors}
      />
    </ErrorBoundary>
  );
};

// Higher-order component for dependency injection
export const withEditorDependencies = (
  dependencies: EditorDependencies
) => (props: EditorProps) => (
  <EditorRefactored {...props} {...dependencies} />
);

export default EditorRefactored;