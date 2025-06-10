# ADR 0001: Feature Slice Architecture

## Status

Accepted (2023-05-10)

## Context

The Vim Trainer application has grown in complexity, making it challenging for developers and AI tools to understand the codebase holistically. Our current layered architecture (domain, data, services, components) makes it difficult to:

1. Understand feature boundaries 
2. Implement new features without touching multiple directories
3. Leverage AI tools effectively for code generation and maintenance
4. Onboard new developers efficiently

## Decision

We will reorganize the codebase into a Feature Slice Architecture, where each feature is a self-contained vertical slice with all necessary components.

### Structure

```
src/
  features/
    command-learning/  # Example feature slice
      README.md        # Feature documentation
      components/      # UI components specific to this feature
      data/            # Data services for this feature
      domain/          # Domain models specific to this feature
      services/        # Application services for this feature
      hooks/           # Custom hooks for this feature
      types.ts         # Feature-specific type definitions
      index.ts         # Public API of the feature
    editor/            # Monaco editor feature slice
    learning-paths/    # Learning paths feature slice
    shared/            # Shared utilities and components
      components/      # Shared UI components
      hooks/           # Shared hooks
      types/           # Shared type definitions
      utils/           # Shared utility functions
```

### Key Principles

1. **Self-containment**: Each feature slice should contain all necessary code to implement its functionality.
2. **Public API**: Each feature should expose a clear public API through its index.ts file.
3. **Max-dependency rule**: A file may only import from:
   - Within its own feature
   - The shared feature
   - One level up (rare cases)
4. **Documentation**: Each feature folder must have a README.md explaining its purpose and usage.

## Consequences

### Positive

1. Improved code organization and discoverability
2. Better support for AI-driven development
3. Easier onboarding for new developers
4. Clear feature boundaries and responsibilities
5. Reduced merge conflicts when multiple developers work on different features
6. Easier to understand impact of changes
7. Enables more precise code generation with AI tools

### Negative

1. Initial refactoring effort required
2. Some duplication may occur across features (balanced by maintainability benefits)
3. Learning curve for developers accustomed to the previous architecture

## Implementation Plan

1. Create the new directory structure
2. Move existing code into appropriate feature slices
3. Update imports and ensure tests pass
4. Add README.md to each feature slice
5. Document the transition in the main project README