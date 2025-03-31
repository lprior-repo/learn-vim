# Vim Trainer - Monaco Editor with Vim Bindings

A web application that provides a Monaco Editor with Vim bindings for learning and practicing Vim commands.

## Features

- Monaco Editor with Vim bindings
- Vim mode indicator (Normal, Insert, Visual)
- Command reference panel with common Vim commands
- Interactive tutorial content

## Prerequisites

- [Bun](https://bun.sh/) runtime (v1.0.0 or later)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vim-trainer.git
cd vim-trainer

# Install dependencies
bun install
```

## Development

```bash
# Start the development server
bun run dev
```

The application will be available at http://localhost:3000.

## Production

```bash
# Build and start in production mode
bun run start
```

## Project Structure

- `src/` - Source code
  - `App.tsx` - Main React application
  - `index.html` - HTML template
- `build.ts` - Build script
- `server.ts` - Simple Bun HTTP server

## Known Issues and Solutions

### Monaco/Vim Loading Issue

If you encounter the error: `monaco-vim-ready event fired but libraries not found`, it's likely due to a race condition where the event is fired before the libraries are fully loaded.

To fix this issue:

1. Open `src/index.html`
2. Modify the Vim extension loading code to ensure both libraries are properly loaded:

```javascript
// Load Vim extension after Monaco is loaded
const vimScript = document.createElement('script');
vimScript.src = 'https://cdn.jsdelivr.net/npm/monaco-vim@0.4.0/dist/monaco-vim.js';
vimScript.onload = function() {
  console.log('Vim extension loaded successfully');
  
  // Make sure both libraries are actually available before firing the event
  setTimeout(() => {
    if (window.monaco && window.MonacoVim) {
      console.log('Both Monaco and Vim are ready');
      document.dispatchEvent(new Event('monaco-vim-ready'));
    } else {
      console.error('Libraries not fully loaded when onload fired');
      window.monacoLoadError = 'Libraries not fully loaded when onload event fired';
    }
  }, 200); // Small delay to ensure everything is initialized
};
```

### Alternative Fix

Another approach is to modify `App.tsx` to make the editor initialization more robust:

```typescript
// In the getMonacoAndVim function
const checkLoaded = () => {
  // Wait until both libraries are definitely available in the window object
  if ((window as any).monaco && 
      (window as any).MonacoVim && 
      typeof (window as any).MonacoVim.initVimMode === 'function') {
    resolve();
    return true;
  }
  return false;
};
```

## License

MIT