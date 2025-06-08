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
  { key: "Ctrl+r", description: "Redo" },
  { key: "I", description: "Enter Insert mode at beginning of line" },
  { key: "A", description: "Enter Insert mode at end of line" },
  { key: "o", description: "Open new line below and switch to Insert mode" },
  { key: "O", description: "Open new line above and switch to Insert mode" },
  { key: "gg", description: "Go to the beginning of the file" },
  { key: "G", description: "Go to the end of the file" },
  { key: "v", description: "Enter Visual mode" },
  { key: "V", description: "Enter Visual Line mode" },
  { key: "Ctrl+v", description: "Enter Visual Block mode" },
  { key: "C", description: "Change text from cursor to end of line" },
  { key: "D", description: "Delete text from cursor to end of line" }
];
export { VIM_COMMANDS };

if (process.env.NODE_ENV === 'test') {
  // Basic tests for VIM_COMMANDS array
  console.assert(Array.isArray(VIM_COMMANDS), 'VIM_COMMANDS should be an array');
  console.assert(VIM_COMMANDS.length >= 28, 'VIM_COMMANDS should have at least 28 entries');
  // Additional tests to check presence of modifier commands
  const keys = VIM_COMMANDS.map(cmd => cmd.key);
  console.assert(keys.includes("I"), 'VIM_COMMANDS should include the "I" modifier');
  console.assert(keys.includes("A"), 'VIM_COMMANDS should include the "A" modifier');
  console.assert(keys.includes("o"), 'VIM_COMMANDS should include the "o" command');
  console.assert(keys.includes("G"), 'VIM_COMMANDS should include the "G" command');
  console.log("All VIM_COMMANDS tests passed.");
}

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

// Custom hook for Monaco and Vim initialization
function useMonacoVim({ content, onModeChange }: EditorProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const statusBarRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<any>(null);
  const vimInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!editorRef.current || !statusBarRef.current) return;

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
        const editor = monaco.editor.create(editorRef.current, {
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
        
        // Store instance in ref for cleanup
        editorInstanceRef.current = editor;
        
        // Initialize Vim mode
        const vim = MonacoVim.initVimMode(editor, statusBarRef.current);
        vimInstanceRef.current = vim;

        // Add mode change listener
        if (onModeChange && statusBarRef.current) {
          modeObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
              if (mutation.type === 'childList') {
                const statusText = statusBarRef.current?.textContent || '';
                // Extract mode from status text
                let mode = 'Normal';
                if (statusText.includes('--INSERT--')) {
                  mode = 'Insert';
                } else if (statusText.includes('--VISUAL LINE--')) {
                  mode = 'Visual Line';
                } else if (statusText.includes('--VISUAL BLOCK--')) {
                  mode = 'Visual Block';
                } else if (statusText.includes('--VISUAL--')) {
                  mode = 'Visual';
                }
                onModeChange(mode);
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

    // Cleanup function - follows React principles for proper resource cleanup
    return () => {
      modeObserver?.disconnect();
      
      if (vimInstanceRef.current) {
        try { vimInstanceRef.current.dispose(); } catch (e) { /* ignore */ }
        vimInstanceRef.current = null;
      }
      
      if (editorInstanceRef.current) {
        try { editorInstanceRef.current.dispose(); } catch (e) { /* ignore */ }
        editorInstanceRef.current = null;
      }
    };
  }, [content, onModeChange]); // Only re-run if these dependencies change

  return { loading, error, editorRef, statusBarRef };
}

// Monaco Editor component with Vim binding
const MonacoVimEditor = ({ content, onModeChange }: EditorProps) => {
  const { loading, error, editorRef, statusBarRef } = useMonacoVim({ 
    content, 
    onModeChange 
  });

  return (
    <div className="relative h-[50vh] min-h-[300px] md:h-[500px] lg:h-[60vh] rounded-md overflow-hidden shadow-lg border border-neutral-700">
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
        className="h-[30px] bg-neutral-800 text-neutral-300 text-xs sm:text-sm font-mono px-2 sm:px-2.5 flex items-center border-t border-neutral-700 overflow-x-auto"
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
    <div className="mt-2 sm:mt-2.5 font-bold text-sm sm:text-base">
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
    <div className="bg-neutral-800 rounded-md p-3 sm:p-4 border border-neutral-700">
      <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl text-[#569cd6]">Vim Commands Reference</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">
        {commands.map((command, index) => (
          <div key={index} className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded bg-black/20">
            <span className="bg-[#007acc] text-white py-0.5 px-1.5 rounded font-mono font-bold min-w-[24px] sm:min-w-[28px] text-center text-xs sm:text-sm">
              {command.key}
            </span>
            <span className="text-xs sm:text-sm">{command.description}</span>
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
    <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-5 py-3 sm:py-5">
      <header className="text-center mb-3 sm:mb-5 pb-3 sm:pb-5 border-b border-neutral-700">
        <h1 className="mb-1 sm:mb-1.5 text-xl sm:text-2xl md:text-3xl text-[#007acc]">Vim in Monaco Editor</h1>
        <p className="text-sm sm:text-base text-neutral-300">Practice Vim commands in this interactive editor</p>
        <ModeIndicator mode={currentMode} />
      </header>

      <div className="flex flex-col gap-3 sm:gap-5">
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

      <footer className="mt-5 text-center text-xs sm:text-sm text-neutral-500 pt-3 sm:pt-5 border-t border-neutral-700">
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
