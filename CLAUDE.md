# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands

- `bun run dev` - Start development server with hot reload on <http://localhost:3000>
- `bun run build` - Build production bundle using custom build system
- `bun test` - Run Playwright end-to-end tests
- `bun install` - Install dependencies (uses Bun package manager)

### Testing

- `bun test tests/basic.spec.ts` - Run basic application tests
- `bun test tests/hjkl.spec.ts` - Test core Vim movement commands
- `bun test tests/components/` - Run component-specific tests
- `bun test --headed` - Run tests with browser UI visible
- `bun test --debug` - Run tests in debug mode

## Architecture Overview

This is a Vim trainer web application built with React, TypeScript, and Monaco Editor with Vim bindings. The codebase follows clean architecture and functional programming principles.

### Key Architectural Layers

**Domain Layer** (`src/domain/`): Pure business logic with immutable VimCommand and VimLearningPath value objects. All objects use `Object.freeze()` for immutability.

**Data Layer** (`src/data/`): Repository pattern implementation. VimCommandRepository contains 50+ predefined Vim commands. Uses factory functions for dependency injection.

**Service Layer** (`src/services/`): Application services for Monaco editor lifecycle and Vim command execution. Uses Result types for error handling.

**State Management** (`src/store/`): Custom functional state management using useReducer with discriminated unions. Context-based dependency injection pattern.

### Technology Stack

- **Runtime**: Bun (build, dev server, package management)
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Editor**: Monaco Editor with monaco-vim bindings
- **Testing**: Playwright for comprehensive E2E testing
- **Build**: Custom build system in `build.ts` using Bun bundler

### Development Patterns

- **Functional Programming**: Immutable objects, pure functions, function composition
- **Error Handling**: Result types (`EditorResult<T>`) for safe operations, Error boundaries for UI resilience
- **Performance**: Lazy loading with React.lazy, memoized selectors, external Monaco loading
- **Testing**: Component tests, page tests, integration tests, user journey tests

### File Structure

```
src/
   domain/         # Pure business logic (VimCommand, VimLearningPath)
   data/          # Repository implementations
   services/      # Application services (Monaco, commands)
   store/         # State management with context
   components/    # Reusable UI components
   pages/         # Route-specific pages
   utils/         # Pure utility functions
```

### Important Notes

- Monaco Editor is loaded externally via CDN, not bundled
- All state updates must maintain immutability
- Commands are registered through VimCommandService
- Testing focuses on actual Vim key sequences and editor behavior
- Custom build system handles TypeScript compilation and Tailwind processing

