/**
 * Functional state management for Vim editor using immutable patterns
 * 
 * Principles applied:
 * - Immutable state updates
 * - Pure reducer functions
 * - Functional composition
 * - Type safety with discriminated unions
 */

import React, { createContext, useContext, useReducer, useMemo } from 'react';
import type { VimMode } from '../domain/VimCommand';

// State interface
export interface VimEditorState {
  readonly mode: VimMode;
  readonly statusText: string;
  readonly isInitialized: boolean;
  readonly error: string | null;
  readonly lastCommand: string | null;
  readonly commandHistory: ReadonlyArray<string>;
}

// Action types using discriminated unions
export type VimEditorAction =
  | { type: 'SET_MODE'; payload: VimMode }
  | { type: 'SET_STATUS'; payload: string }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_COMMAND'; payload: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: VimEditorState = Object.freeze({
  mode: 'normal',
  statusText: '',
  isInitialized: false,
  error: null,
  lastCommand: null,
  commandHistory: Object.freeze([])
});

// Pure reducer function
export const vimEditorReducer = (
  state: VimEditorState, 
  action: VimEditorAction
): VimEditorState => {
  switch (action.type) {
    case 'SET_MODE':
      return Object.freeze({
        ...state,
        mode: action.payload
      });
      
    case 'SET_STATUS':
      return Object.freeze({
        ...state,
        statusText: action.payload
      });
      
    case 'SET_INITIALIZED':
      return Object.freeze({
        ...state,
        isInitialized: action.payload,
        error: action.payload ? null : state.error
      });
      
    case 'SET_ERROR':
      return Object.freeze({
        ...state,
        error: action.payload,
        isInitialized: action.payload ? false : state.isInitialized
      });
      
    case 'ADD_COMMAND':
      const newHistory = [...state.commandHistory, action.payload];
      // Keep only last 50 commands for memory efficiency
      const trimmedHistory = newHistory.length > 50 
        ? newHistory.slice(-50) 
        : newHistory;
        
      return Object.freeze({
        ...state,
        lastCommand: action.payload,
        commandHistory: Object.freeze(trimmedHistory)
      });
      
    case 'CLEAR_HISTORY':
      return Object.freeze({
        ...state,
        commandHistory: Object.freeze([]),
        lastCommand: null
      });
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
};

// Action creators (pure functions)
export const createSetModeAction = (mode: VimMode): VimEditorAction => 
  ({ type: 'SET_MODE', payload: mode });

export const createSetStatusAction = (status: string): VimEditorAction => 
  ({ type: 'SET_STATUS', payload: status });

export const createSetInitializedAction = (initialized: boolean): VimEditorAction => 
  ({ type: 'SET_INITIALIZED', payload: initialized });

export const createSetErrorAction = (error: string | null): VimEditorAction => 
  ({ type: 'SET_ERROR', payload: error });

export const createAddCommandAction = (command: string): VimEditorAction => 
  ({ type: 'ADD_COMMAND', payload: command });

export const createClearHistoryAction = (): VimEditorAction => 
  ({ type: 'CLEAR_HISTORY' });

export const createResetStateAction = (): VimEditorAction => 
  ({ type: 'RESET_STATE' });

// Selectors (pure functions)
export const selectIsReady = (state: VimEditorState): boolean => 
  state.isInitialized && !state.error;

export const selectHasError = (state: VimEditorState): boolean => 
  state.error !== null;

export const selectCommandCount = (state: VimEditorState): number => 
  state.commandHistory.length;

export const selectRecentCommands = (
  state: VimEditorState, 
  count: number = 10
): ReadonlyArray<string> => 
  state.commandHistory.slice(-count);

// Store interface
export interface VimEditorStore {
  readonly state: VimEditorState;
  readonly actions: {
    readonly setMode: (mode: VimMode) => void;
    readonly setStatus: (status: string) => void;
    readonly setInitialized: (initialized: boolean) => void;
    readonly setError: (error: string | null) => void;
    readonly addCommand: (command: string) => void;
    readonly clearHistory: () => void;
    readonly resetState: () => void;
  };
  readonly selectors: {
    readonly isReady: boolean;
    readonly hasError: boolean;
    readonly commandCount: number;
    readonly recentCommands: ReadonlyArray<string>;
  };
}

// Custom hook for using the store
export const useVimEditorStore = (): VimEditorStore => {
  const [state, dispatch] = useReducer(vimEditorReducer, initialState);
  
  // Memoized actions to prevent unnecessary re-renders
  const actions = useMemo(() => Object.freeze({
    setMode: (mode: VimMode) => dispatch(createSetModeAction(mode)),
    setStatus: (status: string) => dispatch(createSetStatusAction(status)),
    setInitialized: (initialized: boolean) => dispatch(createSetInitializedAction(initialized)),
    setError: (error: string | null) => dispatch(createSetErrorAction(error)),
    addCommand: (command: string) => dispatch(createAddCommandAction(command)),
    clearHistory: () => dispatch(createClearHistoryAction()),
    resetState: () => dispatch(createResetStateAction())
  }), [dispatch]);
  
  // Memoized selectors for performance
  const computedSelectors = useMemo(() => Object.freeze({
    isReady: selectIsReady(state),
    hasError: selectHasError(state),
    commandCount: selectCommandCount(state),
    recentCommands: selectRecentCommands(state)
  }), [state]);
  
  return useMemo(() => Object.freeze({
    state,
    actions,
    selectors: computedSelectors
  }), [state, actions, computedSelectors]);
};

// Context for dependency injection
const VimEditorStoreContext = createContext<VimEditorStore | null>(null);

export const VimEditorStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useVimEditorStore();
  
  return (
    <VimEditorStoreContext.Provider value={store}>
      {children}
    </VimEditorStoreContext.Provider>
  );
};

export const useVimEditorStoreContext = (): VimEditorStore => {
  const store = useContext(VimEditorStoreContext);
  if (!store) {
    throw new Error('useVimEditorStoreContext must be used within a VimEditorStoreProvider');
  }
  return store;
};