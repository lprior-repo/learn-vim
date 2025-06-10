import React, { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import { initVimMode } from "monaco-vim";

// Types and interfaces
interface VimState {
  mode: "normal" | "insert" | "visual" | "visual line" | "visual block";
  position: {
    line: number;
    column: number;
  };
  register: string;
}

interface VimCommand {
  name: string;
  keys: string[];
  handler: (editor: any, vim: any, state: VimState) => void;
}

type EditorProps = {
  content: string;
  onModeChange?: (mode: string) => void;
  onContentChange?: (content: string) => void;
  readOnly?: boolean;
  onCommandExecuted?: (command: string) => void;
  height?: string;
  highlightLines?: number[];
  highlightText?: string;
};

// Core HJKL movement commands
// Enhanced movement commands with state verification
const movementCommands: VimCommand[] = [
  {
    name: "h",
    keys: ["h"],
    handler: async (editor, vim, state) => {
      const position = editor.getPosition();
      if (position.column > 1) {
        const targetColumn = position.column - 1;
        editor.setPosition({ lineNumber: position.lineNumber, column: targetColumn });

        // Verify position update
        await verifyPosition(editor, {
          lineNumber: position.lineNumber,
          column: targetColumn,
        });
      }
    },
  },
  {
    name: "j",
    keys: ["j"],
    handler: async (editor, vim, state) => {
      const position = editor.getPosition();
      const lineCount = editor.getModel().getLineCount();
      if (position.lineNumber < lineCount) {
        const targetLine = position.lineNumber + 1;
        const targetColumn = Math.min(position.column, editor.getModel().getLineMaxColumn(targetLine));
        editor.setPosition({ lineNumber: targetLine, column: targetColumn });

        // Verify position update
        await verifyPosition(editor, {
          lineNumber: targetLine,
          column: targetColumn,
        });
      }
    },
  },
  {
    name: "k",
    keys: ["k"],
    handler: async (editor, vim, state) => {
      const position = editor.getPosition();
      if (position.lineNumber > 1) {
        const targetLine = position.lineNumber - 1;
        const targetColumn = Math.min(position.column, editor.getModel().getLineMaxColumn(targetLine));
        editor.setPosition({ lineNumber: targetLine, column: targetColumn });

        // Verify position update
        await verifyPosition(editor, {
          lineNumber: targetLine,
          column: targetColumn,
        });
      }
    },
  },
  {
    name: "l",
    keys: ["l"],
    handler: async (editor, vim, state) => {
      const position = editor.getPosition();
      const lineLength = editor.getModel().getLineMaxColumn(position.lineNumber);
      if (position.column < lineLength) {
        const targetColumn = position.column + 1;
        editor.setPosition({ lineNumber: position.lineNumber, column: targetColumn });

        // Verify position update
        await verifyPosition(editor, {
          lineNumber: position.lineNumber,
          column: targetColumn,
        });
      }
    },
  },
];

// Helper to verify cursor position update
async function verifyPosition(editor: any, target: { lineNumber: number; column: number }, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const position = editor.getPosition();
    if (position.lineNumber === target.lineNumber && position.column === target.column) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Failed to verify cursor position update to Line ${target.lineNumber}, Column ${target.column}`);
}

// Custom hook for Monaco and Vim initialization
export function useMonacoVim({
  content,
  onModeChange,
  onContentChange,
  readOnly = false,
  onCommandExecuted,
}: Omit<EditorProps, "height" | "highlightLines" | "highlightText">) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const statusBarRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<any>(null);
  const vimInstanceRef = useRef<any>(null);
  const [vimState, setVimState] = useState<VimState>({
    mode: "normal",
    position: { line: 1, column: 1 },
    register: "",
  });

  useEffect(() => {
    if (!editorRef.current || !statusBarRef.current) return;

    let disposables: { dispose: () => void }[] = [];

    const initEditor = async () => {
      try {
        // Monaco and Vim are now bundled, no need to wait for CDN loading
        setError(null);

        // Create editor instance
        const editor = monaco.editor.create(editorRef.current, {
          value: content,
          language: "markdown",
          theme: "vs-dark",
          fontSize: 16,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          minimap: { enabled: true },
          wordWrap: "on",
          automaticLayout: true,
          readOnly: readOnly,
          renderWhitespace: "none",
          renderControlCharacters: false,
          renderLineHighlight: "none",
          renderValidationDecorations: "editable",
        });

        editorInstanceRef.current = editor;

        // Initialize Vim mode with retries
        let vim = null;
        let retries = 0;
        const maxRetries = 3;

        while (!vim && retries < maxRetries) {
          try {
            vim = await initVimMode(editor, statusBarRef.current);
            console.debug("[Editor] Vim mode initialized successfully");
          } catch (err) {
            retries++;
            console.warn(`[Editor] Vim init attempt ${retries} failed:`, err);
            if (retries === maxRetries) throw err;
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        vimInstanceRef.current = vim;

        // Note: Basic movement commands (h, j, k, l) are built into monaco-vim
        // No need to register them manually
        console.debug('[Editor] Using built-in Vim movement commands');

        // Direct mode change handler
        vim.on("mode-change", (mode: string) => {
          setVimState((prev) => ({ ...prev, mode: mode as VimState["mode"] }));
          onModeChange?.(mode);
        });

        // Direct cursor position tracking
        editor.onDidChangeCursorPosition((e) => {
          setVimState((prev) => ({
            ...prev,
            position: { line: e.position.lineNumber, column: e.position.column },
          }));
        });

        // Content change handler
        if (onContentChange) {
          const changeDisposable = editor.onDidChangeModelContent(() => {
            const newContent = editor.getValue();
            onContentChange(newContent);
          });
          disposables.push(changeDisposable);
        }

        // Command execution handler
        if (onCommandExecuted) {
          vim.on("command-executed", (command: string) => {
            onCommandExecuted(command);
          });
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Error initializing editor:", err);
        setError(err.message || "Failed to initialize editor");
        setLoading(false);
      }
    };

    initEditor();

    // Cleanup function
    return () => {
      disposables.forEach((d) => d.dispose());

      if (vimInstanceRef.current) {
        try {
          vimInstanceRef.current.dispose();
        } catch (e) {
          console.warn("Error disposing vim instance:", e);
        }
        vimInstanceRef.current = null;
      }

      if (editorInstanceRef.current) {
        try {
          editorInstanceRef.current.dispose();
        } catch (e) {
          console.warn("Error disposing editor instance:", e);
        }
        editorInstanceRef.current = null;
      }
    };
  }, [content, onModeChange, onContentChange, readOnly, onCommandExecuted]);

  return { loading, error, editorRef, statusBarRef };
}

// Library loading functions removed - Monaco and Monaco Vim are now bundled

const Editor: React.FC<EditorProps> = ({
  content,
  onModeChange,
  onContentChange,
  readOnly = false,
  onCommandExecuted,
  height = "500px",
  highlightLines = [],
  highlightText,
}) => {
  const { loading, error, editorRef, statusBarRef } = useMonacoVim({
    content,
    onModeChange,
    onContentChange,
    readOnly,
    onCommandExecuted,
  });

  return (
    <div className="relative rounded-md overflow-hidden shadow-lg border border-neutral-700" style={{ height }} data-testid="vim-editor">
      {loading && (
        <div className="absolute inset-0 flex flex-col gap-2 justify-center items-center bg-neutral-900/90 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neutral-300"></div>
          <p className="text-neutral-300">{error || "Loading editor..."}</p>
        </div>
      )}

      {!loading && error && (
        <div className="absolute inset-0 flex flex-col gap-4 justify-center items-center bg-red-900/90 text-red-400 z-10">
          <p className="text-lg font-semibold">Error Initializing Editor</p>
          <p className="text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-800 hover:bg-red-700 rounded-md text-sm">
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
};

export default Editor;
