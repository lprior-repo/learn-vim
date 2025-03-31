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

