import React from 'react';
import { createRoot } from 'react-dom/client';
import Routes from './routes';
import { VimEditorStoreProvider } from './store/VimEditorStore';
import ErrorBoundary from './components/ErrorBoundary';
import * as monaco from 'monaco-editor';
import { initVimMode } from 'monaco-vim';

// Expose Monaco and Monaco Vim globally for compatibility with existing tests
(window as any).monaco = monaco;
(window as any).MonacoVim = { initVimMode };

/**
 * Main App component with proper dependency injection and error boundaries
 * 
 * Principles applied:
 * - Dependency Injection: Store provided at top level
 * - Error Boundaries: Graceful error handling
 * - Separation of Concerns: App only handles composition
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <VimEditorStoreProvider>
        <Routes />
      </VimEditorStoreProvider>
    </ErrorBoundary>
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

export default App;