import React from 'react';
import { createRoot } from 'react-dom/client';
import { HjklPage } from './features/hjkl';

// Create a simple layout component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Vim Trainer
              </h1>
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Vertical Slice Architecture
              </span>
            </div>
            <nav className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                HJKL Training
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        {children}
      </main>

      {/* Simple footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>Vim Trainer - Learn Vim movements efficiently</p>
            <p className="mt-1">Built with Vertical Slice Architecture</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        </Layout>
      );
    }

    return this.props.children;
  }
}

/**
 * Main App component for Vim Trainer
 * 
 * Following Vertical Slice Architecture principles:
 * - Single feature focus (HJKL training)
 * - Self-contained and minimal
 * - Clean separation of concerns
 * - Error boundaries for resilience
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Layout>
        <HjklPage />
      </Layout>
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
} else {
  console.error('Root element not found');
}

export default App;