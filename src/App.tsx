import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

// Types for our components
type VimCommand = {
  key: string;
  description: string;
};

type EditorProps = {
  content: string;
  onModeChange?: (mode: string) => void;
};

type CommandsPanelProps = {
  commands: VimCommand[];
};

type ModeIndicatorProps = {
  mode: string;
};

// Sample Vim commands to demonstrate
const VIM_COMMANDS: VimCommand[] = [
  { key: "i", description: "Enter Insert mode (before cursor)" },
  { key: "Esc", description: "Return to Normal mode" },
  { key: "h", description: "Move left" },
  { key: "j", description: "Move down" },
  { key: "k", description: "Move up" },
  { key: "l", description: "Move right" },
  { key: "w", description: "Move to start of next word" },
  { key: "b", description: "Move to start of previous word" },
  { key: "e", description: "Move to end of word" },
  { key: "0", description: "Move to start of line" },
  { key: "$", description: "Move to end of line" },
  { key: "x", description: "Delete character under cursor" },
  { key: "dd", description: "Delete entire line" },
  { key: "yy", description: "Copy (yank) entire line" },
  { key: "p", description: "Paste after cursor" },
  { key: "u", description: "Undo" },
  { key: "Ctrl+r", description: "Redo" }
];

// Sample content with Vim tutorial
const EDITOR_CONTENT = `# Vim Tutorial in Monaco Editor

## Basic Navigation (Normal Mode)

Use h, j, k, l to move around:
- h: left
- j: down
- k: up
- l: right

## Switching Modes

- Press i to enter Insert mode
- Press Esc to return to Normal mode

## Text Editing Commands

- x: delete character under cursor
- dd: delete entire line
- yy: copy (yank) a line
- p: paste what you've copied or deleted

## Word Navigation

- w: jump to start of next word
- b: jump back to start of word
- e: jump to end of word

## Try it yourself!

Practice your Vim commands below:
------------------------------------
This is a practice area. Try using Vim commands here!
Delete this line with 'dd'.
Copy this line with 'yy' and paste it below with 'p'.
Move around with h, j, k, l and try word navigation with w, b, e.
------------------------------------

Current mode is shown in the status bar below the editor.
`;

// Monaco Editor component with Vim binding
const MonacoVimEditor = ({ content, onModeChange }: EditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const statusBarRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editorRef.current || !statusBarRef.current) return;

    let editor: any = null;
    let vim: any = null;
    let modeObserver: MutationObserver | null = null;

    const initEditor = async () => {
      try {
        // Wait for Monaco and Vim to be ready from the event triggered in index.html
        const waitForLibraries = () => {
          return new Promise<void>((resolve, reject) => {
            // Check if already loaded
            if ((window as any).monaco && (window as any).MonacoVim) {
              resolve();
              return;
            }

            // Listen for the custom event from index.html
            document.addEventListener('monaco-vim-ready', () => resolve(), { once: true });
            
            // Set timeout in case libraries don't load
            setTimeout(() => {
              reject(new Error('Timeout waiting for Monaco and Vim to load'));
            }, 10000);
          });
        };

        await waitForLibraries();
        
        const monaco = (window as any).monaco;
        const MonacoVim = (window as any).MonacoVim;
        
        // Create editor instance
        editor = monaco.editor.create(editorRef.current, {
          value: content,
          language: 'markdown',
          theme: 'vs-dark',
          fontSize: 16,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          minimap: { enabled: true },
          wordWrap: 'on',
          automaticLayout: true
        });
        
        // Initialize Vim mode
        vim = MonacoVim.initVimMode(editor, statusBarRef.current);

        // Add mode change listener
        if (onModeChange && statusBarRef.current) {
          modeObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
              if (mutation.type === 'childList') {
                const statusText = statusBarRef.current?.textContent || '';
                if (statusText.includes('--INSERT--')) {
                  onModeChange('Insert');
                } else if (statusText.includes('--VISUAL--')) {
                  onModeChange('Visual');
                } else if (statusText.includes('--VISUAL LINE--')) {
                  onModeChange('Visual Line');
                } else if (statusText.includes('--VISUAL BLOCK--')) {
                  onModeChange('Visual Block');
                } else {
                  onModeChange('Normal');
                }
              }
            }
          });

          modeObserver.observe(statusBarRef.current, { childList: true, subtree: true });
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error initializing editor:', err);
        setError(err.message || 'Failed to initialize the editor');
        setLoading(false);
      }
    };

    initEditor();

    // Cleanup function
    return () => {
      modeObserver?.disconnect();
      if (vim) {
        try { vim.dispose(); } catch (e) { /* ignore */ }
      }
      if (editor) {
        try { editor.dispose(); } catch (e) { /* ignore */ }
      }
    };
  }, [content, onModeChange]);

  return (
    <div className="relative h-[500px] rounded-md overflow-hidden shadow-lg border border-neutral-700">
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-neutral-900/90 z-10">
          <p>Loading editor...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex justify-center items-center bg-red-900/90 text-red-400 z-10">
          <p>Error: {error}</p>
        </div>
      )}

      <div ref={editorRef} className="w-full h-[calc(100%-30px)]"></div>
      <div 
        ref={statusBarRef} 
        className="h-[30px] bg-neutral-800 text-neutral-300 font-mono px-2.5 flex items-center border-t border-neutral-700"
      ></div>
    </div>
  );
};

// Mode Indicator component
const ModeIndicator = ({ mode }: ModeIndicatorProps) => {
  const getModeColor = (mode: string): string => {
    switch (mode) {
      case 'Insert': return 'bg-[#6a9955] text-black';
      case 'Visual':
      case 'Visual Line':
      case 'Visual Block': return 'bg-[#b58900] text-black';
      case 'Normal':
      default: return 'bg-[#007acc] text-white';
    }
  };

  return (
    <div className="mt-2.5 font-bold">
      Current Mode: 
      <span className={`inline-block py-0.5 px-2 rounded ml-1.5 font-mono ${getModeColor(mode)}`}>
        {mode}
      </span>
    </div>
  );
};

// Commands Panel component
const CommandsPanel = ({ commands }: CommandsPanelProps) => {
  return (
    <div className="bg-neutral-800 rounded-md p-4 border border-neutral-700">
      <h2 className="mb-4 text-2xl text-[#569cd6]">Vim Commands Reference</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {commands.map((command, index) => (
          <div key={index} className="flex items-center gap-2 p-1.5 rounded bg-black/20">
            <span className="bg-[#007acc] text-white py-0.5 px-1.5 rounded font-mono font-bold min-w-[28px] text-center">
              {command.key}
            </span>
            <span className="text-sm">{command.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main App component
const App = () => {
  const [currentMode, setCurrentMode] = useState<string>("Normal");

  return (
    <div className="max-w-7xl mx-auto p-5">
      <header className="text-center mb-5 pb-5 border-b border-neutral-700">
        <h1 className="mb-1.5 text-[#007acc]">Vim in Monaco Editor</h1>
        <p className="text-neutral-300">Practice Vim commands in this interactive editor</p>
        <ModeIndicator mode={currentMode} />
      </header>

      <div className="flex flex-col gap-5">
        <div>
          <MonacoVimEditor
            content={EDITOR_CONTENT}
            onModeChange={setCurrentMode}
          />
        </div>

        <div>
          <CommandsPanel commands={VIM_COMMANDS} />
        </div>
      </div>

      <footer className="mt-5 text-center text-sm text-neutral-500 pt-5 border-t border-neutral-700">
        <p>Practice makes perfect! Keep trying different Vim commands to build muscle memory.</p>
      </footer>
    </div>
  );
};

// Initialize React app
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
