# HJKL Feature Slice

This directory contains all functionality related to HJKL (basic movement) commands in the Vim trainer application, organized as a vertical slice.

## Architecture

This slice follows vertical slice architecture principles:
- **Self-contained**: All HJKL functionality in one place
- **Pure functions**: Domain logic has no side effects
- **Clean boundaries**: Public API via index.ts
- **Comprehensive testing**: Unit, integration, and e2e tests

## Directory Structure

```
hjkl/
├── index.ts           # Public API exports
├── types/             # TypeScript interfaces and types
├── domain/            # Pure business logic functions
├── data/              # Data access and repository
├── services/          # Application services
├── components/        # React components
├── pages/             # Page components
└── tests/             # All test types
    ├── unit/          # Jest unit tests
    ├── integration/   # React Testing Library tests
    └── e2e/           # Playwright end-to-end tests
```

## Key Principles

- **Pure Functions**: Domain logic is side-effect free
- **Immutability**: All data structures use readonly/Object.freeze
- **TDD**: Test-driven development approach
- **Pipeline Architecture**: Data flows through pure functions