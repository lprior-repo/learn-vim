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
const MonacoVimEditor: React.FC<EditorProps> = ({ content, onModeChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const statusBarRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editorRef.current || !statusBarRef.current) return;

    let editor: any = null;
    let vim: any = null;
    let modeObserver: MutationObserver | null = null;

    // Improved Monaco and Vim loading mechanism
    const getMonacoAndVim = async () => {
      return new Promise<void>((resolve, reject) => {
        // Function to check if both libraries are loaded and fully initialized
        const checkLoaded = () => {
          // Check for Monaco
          const monacoLoaded = !!(window as any).monaco && 
                               !!(window as any).monaco.editor && 
                               typeof (window as any).monaco.editor.create === 'function';
          
          // Check for MonacoVim
          const vimLoaded = !!(window as any).MonacoVim && 
                            typeof (window as any).MonacoVim.initVimMode === 'function';
          
          console.log(`Library check: Monaco: ${monacoLoaded}, Vim: ${vimLoaded}`);
          
          if (monacoLoaded && vimLoaded) {
            console.log("Both Monaco and Vim are fully loaded and verified");
            resolve();
            return true;
          }
          return false;
        };
        
        // Try loading libraries using AMD pattern
        const loadLibrariesAMD = () => {
          console.log("Attempting to load libraries via AMD");
          
          const requireFunc = (window as any).require;
          if (typeof requireFunc !== 'function') {
            console.error("AMD loader not available");
            return false;
          }
          
          // Configure AMD loader if not already configured
          if (!(window as any).monacoLoaderConfigured) {
            requireFunc.config({
              paths: {
                vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs',
                'monaco-vim': 'https://cdn.jsdelivr.net/npm/monaco-vim@0.4.2/dist/monaco-vim'
              }
            });
            (window as any).monacoLoaderConfigured = true;
          }
          
          // Load Monaco and then MonacoVim
          requireFunc(['vs/editor/editor.main'], () => {
            console.log("Monaco loaded via AMD");
            
            requireFunc(['monaco-vim'], (MonacoVim: any) => {
              console.log("MonacoVim loaded via AMD");
              (window as any).MonacoVim = MonacoVim;
              checkLoaded();
            });
          });
          
          return true;
        };
        
        // Listen for the custom event from index.html
        document.addEventListener('monaco-vim-ready', () => {
          console.log("Received monaco-vim-ready event");
          // Verify libraries with a short delay to ensure initialization is complete
          setTimeout(() => {
            if (checkLoaded()) {
              console.log("Libraries verified after receiving ready event");
            } else {
              console.warn("Event received but libraries not verified, continuing to wait");
            }
          }, 500);
        }, { once: true });
        
        // Check if already loaded
        if (checkLoaded()) return;
        
        console.log("Libraries not initially loaded, trying to load them");
        
        // Try AMD loader first
        if (!(window as any).monacoAMDAttempted) {
          (window as any).monacoAMDAttempted = true;
          if (loadLibrariesAMD()) {
            console.log("AMD loading initiated");
          }
        }
        
        // Fallback: Poll for libraries to be loaded (max 15 seconds)
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (checkLoaded() || attempts > 75) { // Check for 15 seconds (75 * 200ms)
            clearInterval(interval);
            if (attempts > 75 && !checkLoaded()) {
              const error = new Error('Timeout waiting for Monaco and Vim to load');
              console.error(error);
              reject(error);
            }
          }
        }, 200);
      });
    };

    const initEditor = async () => {
      try {
        setLoading(true);

        // Wait for Monaco and Vim to be loaded
        await getMonacoAndVim();
        
        // Get Monaco from window object
        const monaco = (window as any).monaco;
        if (!monaco) {
          throw new Error('Monaco not loaded properly');
        }

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

        // Improved Vim mode initialization with better error handling and retry mechanism
        const initVimWithRetry = (retryCount = 0, maxRetries = 3) => {
          const MonacoVim = (window as any).MonacoVim;
          
          if (!MonacoVim) {
            if (retryCount < maxRetries) {
              console.warn(`Vim extension not found, retrying in 500ms (attempt ${retryCount + 1}/${maxRetries})`);
              setTimeout(() => initVimWithRetry(retryCount + 1, maxRetries), 500);
              return;
            }
            throw new Error('Vim extension not loaded properly after multiple attempts');
          }
          
          // Different ways MonacoVim might expose the initVimMode function
          let initVimMode;
          
          // Check different possible locations for the initVimMode function
          if (typeof MonacoVim.initVimMode === 'function') {
            console.log('Found initVimMode function directly on MonacoVim object');
            initVimMode = MonacoVim.initVimMode;
          } else if (typeof MonacoVim.default === 'object' && typeof MonacoVim.default.initVimMode === 'function') {
            console.log('Found initVimMode function on MonacoVim.default');
            initVimMode = MonacoVim.default.initVimMode;
          } else if (typeof MonacoVim === 'function') {
            console.log('MonacoVim appears to be the initVimMode function itself');
            initVimMode = MonacoVim;
          } else {
            // Log the structure of the MonacoVim object to help debugging
            console.error('MonacoVim structure:', JSON.stringify(Object.keys(MonacoVim)));
            
            if (retryCount < maxRetries) {
              console.warn(`initVimMode function not found, retrying in 500ms (attempt ${retryCount + 1}/${maxRetries})`);
              setTimeout(() => initVimWithRetry(retryCount + 1, maxRetries), 500);
              return;
            }
            throw new Error('initVimMode function not found on MonacoVim object after multiple attempts');
          }
          
          console.log('Initializing Vim mode...');
          try {
            // Ensure the status bar element is ready
            if (!statusBarRef.current) {
              throw new Error('Status bar element is not ready');
            }
            
            // Initialize Vim mode with the found function
            vim = initVimMode(editor, statusBarRef.current);
            console.log('Vim mode initialized successfully');
            
            // Verify Vim mode was properly initialized
            if (!vim || typeof vim.dispose !== 'function') {
              throw new Error('Vim mode initialization returned invalid object');
            }
          } catch (vimError: any) {
            console.error('Error initializing Vim mode:', vimError);
            
            if (retryCount < maxRetries) {
              console.warn(`Failed to initialize Vim mode, retrying in 1000ms (attempt ${retryCount + 1}/${maxRetries})`);
              setTimeout(() => initVimWithRetry(retryCount + 1, maxRetries), 1000);
              return;
            }
            
            throw new Error(`Failed to initialize Vim mode after ${maxRetries} attempts: ${vimError.message}`);
          }
        };
        
        // Start the Vim initialization with retry logic
        initVimWithRetry();

        // Add mode change listener if callback provided
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
      if (modeObserver) {
        modeObserver.disconnect();
      }
      if (vim) {
        try { vim.dispose(); } catch (e) { /* ignore */ }
      }
      if (editor) {
        try { editor.dispose(); } catch (e) { /* ignore */ }
      }
    };
  }, [content, onModeChange]);

  const styles = {
    wrapper: {
      position: 'relative' as const,
      height: '500px',
      borderRadius: '5px',
      overflow: 'hidden' as const,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      border: '1px solid #444'
    },
    editor: {
      width: '100%',
      height: 'calc(100% - 30px)'
    },
    statusBar: {
      height: '30px',
      backgroundColor: '#3a3a3a',
      color: '#d4d4d4',
      fontFamily: 'monospace',
      padding: '0 10px',
      display: 'flex' as const,
      alignItems: 'center' as const,
      borderTop: '1px solid #444'
    },
    loading: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: 'rgba(30, 30, 30, 0.9)',
      zIndex: 10
    },
    error: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: 'rgba(100, 30, 30, 0.9)',
      color: '#f14c4c',
      zIndex: 10
    }
  };

  return (
    <div style={styles.wrapper}>
      {loading && (
        <div style={styles.loading}>
          <p>Loading editor...</p>
        </div>
      )}

      {error && (
        <div style={styles.error}>
          <p>Error: {error}</p>
        </div>
      )}

      <div ref={editorRef} style={styles.editor}></div>
      <div ref={statusBarRef} style={styles.statusBar}></div>
    </div>
  );
};

// Mode Indicator component
const ModeIndicator: React.FC<ModeIndicatorProps> = ({ mode }) => {
  const getColorForMode = (mode: string): string => {
    switch (mode) {
      case 'Insert': return '#6a9955';
      case 'Visual':
      case 'Visual Line':
      case 'Visual Block': return '#b58900';
      case 'Normal':
      default: return '#007acc';
    }
  };

  const styles = {
    container: {
      marginTop: '10px',
      fontWeight: 'bold' as const
    },
    mode: {
      display: 'inline-block' as const,
      padding: '2px 8px',
      borderRadius: '4px',
      marginLeft: '5px',
      fontFamily: 'monospace',
      backgroundColor: getColorForMode(mode),
      color: mode === 'Insert' || mode.includes('Visual') ? 'black' : 'white'
    }
  };

  return (
    <div style={styles.container}>
      Current Mode: <span style={styles.mode}>{mode}</span>
    </div>
  );
};

// Commands Panel component
const CommandsPanel: React.FC<CommandsPanelProps> = ({ commands }) => {
  const styles = {
    panel: {
      backgroundColor: '#3a3a3a',
      borderRadius: '5px',
      padding: '15px',
      border: '1px solid #444'
    },
    title: {
      marginBottom: '15px',
      fontSize: '1.5rem',
      color: '#569cd6'
    },
    grid: {
      display: 'grid' as const,
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '8px'
    },
    item: {
      display: 'flex' as const,
      alignItems: 'center' as const,
      gap: '8px',
      padding: '5px',
      borderRadius: '4px',
      backgroundColor: 'rgba(0, 0, 0, 0.2)'
    },
    keyBadge: {
      backgroundColor: '#007acc',
      color: 'white',
      padding: '2px 6px',
      borderRadius: '3px',
      fontFamily: 'monospace',
      fontWeight: 'bold' as const,
      minWidth: '28px',
      textAlign: 'center' as const
    },
    description: {
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.panel}>
      <h2 style={styles.title}>Vim Commands Reference</h2>
      <div style={styles.grid}>
        {commands.map((command, index) => (
          <div key={index} style={styles.item}>
            <span style={styles.keyBadge}>{command.key}</span>
            <span style={styles.description}>{command.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Debug Info component to help troubleshoot
const DebugInfo: React.FC = () => {
  const [info, setInfo] = useState<{ [key: string]: any }>({
    monacoLoaded: false,
    vimLoaded: false,
    error: null
  });

  useEffect(() => {
    const checkStatus = () => {
      setInfo({
        monacoLoaded: !!(window as any).monaco,
        vimLoaded: !!(window as any).MonacoVim,
        error: (window as any).monacoLoadError || null
      });
    };

    // Initial check
    checkStatus();

    // Set up interval to check status
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const styles = {
    debug: {
      backgroundColor: '#202020',
      padding: '10px',
      marginBottom: '10px',
      borderRadius: '5px',
      fontFamily: 'monospace',
      fontSize: '12px'
    }
  };

  return (
    <div style={styles.debug}>
      <div>Monaco Loaded: {info.monacoLoaded ? '✅' : '❌'}</div>
      <div>Vim Extension Loaded: {info.vimLoaded ? '✅' : '❌'}</div>
      {info.error && <div style={{ color: 'red' }}>Error: {info.error}</div>}
    </div>
  );
};

// Main App component
const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<string>("Normal");
  const [showDebug, setShowDebug] = useState<boolean>(true);

  useEffect(() => {
    // Hide debug panel after 10 seconds
    const timer = setTimeout(() => setShowDebug(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '20px',
      paddingBottom: '20px',
      borderBottom: '1px solid #444'
    },
    title: {
      marginBottom: '5px',
      color: '#007acc'
    },
    subtitle: {
      color: '#d4d4d4'
    },
    mainContent: {
      display: 'flex' as const,
      flexDirection: 'column' as const,
      gap: '20px',
    },
    editorContainer: {
      flex: 3
    },
    panelContainer: {
      flex: 1
    },
    footer: {
      marginTop: '20px',
      textAlign: 'center' as const,
      fontSize: '14px',
      color: '#888',
      paddingTop: '20px',
      borderTop: '1px solid #444'
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Vim in Monaco Editor</h1>
        <p style={styles.subtitle}>Practice Vim commands in this interactive editor</p>
        <ModeIndicator mode={currentMode} />
      </header>

      {showDebug && <DebugInfo />}

      <div style={styles.mainContent}>
        <div style={styles.editorContainer}>
          <MonacoVimEditor
            content={EDITOR_CONTENT}
            onModeChange={setCurrentMode}
          />
        </div>

        <div style={styles.panelContainer}>
          <CommandsPanel commands={VIM_COMMANDS} />
        </div>
      </div>

      <footer style={styles.footer}>
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
