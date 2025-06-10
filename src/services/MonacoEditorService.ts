/**
 * Service for Monaco Editor operations following SOLID principles
 * 
 * Principles applied:
 * - Single Responsibility: Only handles Monaco editor operations
 * - Open/Closed: Extensible through interfaces
 * - Interface Segregation: Small focused interfaces
 * - Dependency Inversion: Depends on abstractions
 */

import { VimMode } from '../domain/VimCommand';
import * as monaco from 'monaco-editor';
import { initVimMode } from 'monaco-vim';

// Value objects for editor configuration
export interface EditorPosition {
  readonly lineNumber: number;
  readonly column: number;
}

export interface EditorConfiguration {
  readonly theme: 'vs-dark' | 'vs-light' | 'hc-black';
  readonly fontSize: number;
  readonly wordWrap: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  readonly minimap: { enabled: boolean };
  readonly readOnly: boolean;
}

// Result types for error handling (functional approach)
export type EditorResult<T> = 
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string };

// Abstract interfaces for dependency injection
export interface MonacoEditor {
  getValue(): string;
  setValue(value: string): void;
  getPosition(): EditorPosition;
  setPosition(position: EditorPosition): void;
  getModel(): any;
  dispose(): void;
  onDidChangeModelContent(listener: () => void): { dispose(): void };
  onDidChangeCursorPosition(listener: (e: any) => void): { dispose(): void };
}

export interface VimInstance {
  addCustomCommand(name: string, handler: (editor: MonacoEditor) => void): void;
  on(event: string, handler: (data: any) => void): void;
  dispose(): void;
}

export interface MonacoService {
  createEditor(container: HTMLElement, config: EditorConfiguration): Promise<EditorResult<MonacoEditor>>;
  initializeVim(editor: MonacoEditor, statusBar: HTMLElement): Promise<EditorResult<VimInstance>>;
}

// Pure functions for editor operations
export const createDefaultEditorConfig = (overrides?: Partial<EditorConfiguration>): EditorConfiguration => ({
  theme: 'vs-dark',
  fontSize: 16,
  wordWrap: 'on',
  minimap: { enabled: true },
  readOnly: false,
  ...overrides
});

export const createEditorPosition = (lineNumber: number, column: number): EditorPosition => {
  if (lineNumber < 1 || column < 1) {
    throw new Error('Line number and column must be positive integers');
  }
  
  return Object.freeze({ lineNumber, column });
};

export const isValidPosition = (position: EditorPosition): boolean =>
  position.lineNumber >= 1 && position.column >= 1;

// Factory for creating success/error results
export const createSuccessResult = <T>(data: T): EditorResult<T> => 
  Object.freeze({ success: true, data });

export const createErrorResult = <T>(error: string): EditorResult<T> => 
  Object.freeze({ success: false, error });

// Implementation of Monaco service
export class MonacoEditorService implements MonacoService {
  private static readonly INIT_TIMEOUT = 20000;
  private static readonly MAX_RETRIES = 3;

  async createEditor(
    container: HTMLElement, 
    config: EditorConfiguration
  ): Promise<EditorResult<MonacoEditor>> {
    try {
      // Monaco is now bundled, no need to wait for CDN loading
      if (!monaco?.editor) {
        return createErrorResult('Monaco editor not available');
      }

      const editor = monaco.editor.create(container, {
        value: '',
        language: 'markdown',
        theme: config.theme,
        fontSize: config.fontSize,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        minimap: config.minimap,
        wordWrap: config.wordWrap,
        automaticLayout: true,
        readOnly: config.readOnly,
        renderWhitespace: 'none',
        renderControlCharacters: false,
        renderLineHighlight: 'none',
        renderValidationDecorations: 'editable'
      });

      return createSuccessResult(editor);
    } catch (error) {
      return createErrorResult(`Failed to create editor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async initializeVim(
    editor: MonacoEditor, 
    statusBar: HTMLElement
  ): Promise<EditorResult<VimInstance>> {
    try {
      // Monaco Vim is now bundled, no need to wait for CDN loading
      if (!initVimMode) {
        return createErrorResult('Monaco Vim not available');
      }

      // Retry vim initialization
      let vim: VimInstance | null = null;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= MonacoEditorService.MAX_RETRIES; attempt++) {
        try {
          vim = await initVimMode(editor, statusBar);
          break;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');
          if (attempt < MonacoEditorService.MAX_RETRIES) {
            await this.delay(1000);
          }
        }
      }

      if (!vim) {
        return createErrorResult(`Failed to initialize Vim after ${MonacoEditorService.MAX_RETRIES} attempts: ${lastError?.message || 'Unknown error'}`);
      }

      return createSuccessResult(vim);
    } catch (error) {
      return createErrorResult(`Failed to initialize Vim: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // CDN waiting methods removed - Monaco is now bundled

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Factory function for dependency injection
export const createMonacoEditorService = (): MonacoService => 
  new MonacoEditorService();