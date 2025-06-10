/**
 * Service for Vim command management following functional programming principles
 * 
 * Principles applied:
 * - Pure functions for command operations
 * - Immutable command state
 * - Functional composition
 * - Error handling with Result types
 */

import { VimCommand, VimMode } from '../domain/VimCommand';
import { VimCommandRepository } from '../data/VimCommandRepository';
import { MonacoEditor, VimInstance, EditorPosition, EditorResult, createSuccessResult, createErrorResult } from './MonacoEditorService';

// Command execution context
export interface CommandContext {
  readonly editor: MonacoEditor;
  readonly vim: VimInstance;
  readonly currentMode: VimMode;
  readonly position: EditorPosition;
}

// Command handler signature
export type CommandHandler = (context: CommandContext) => Promise<void>;

// Command registration result
export interface CommandRegistration {
  readonly commandId: string;
  readonly dispose: () => void;
}

// Service interface
export interface VimCommandService {
  registerCommand(command: VimCommand, handler: CommandHandler): EditorResult<CommandRegistration>;
  registerBasicMovementCommands(vim: VimInstance, editor: MonacoEditor): Promise<EditorResult<ReadonlyArray<CommandRegistration>>>;
  getAvailableCommands(mode: VimMode): ReadonlyArray<VimCommand>;
}

// Pure function for position validation
const validatePosition = async (editor: MonacoEditor, targetPosition: EditorPosition): Promise<boolean> => {
  try {
    const model = editor.getModel();
    if (!model) return false;

    const lineCount = model.getLineCount();
    const maxColumn = model.getLineMaxColumn(targetPosition.lineNumber);

    return targetPosition.lineNumber >= 1 && 
           targetPosition.lineNumber <= lineCount &&
           targetPosition.column >= 1 && 
           targetPosition.column <= maxColumn;
  } catch {
    return false;
  }
};

// Pure function for safe position clamping
const clampPosition = (editor: MonacoEditor, position: EditorPosition): EditorPosition => {
  try {
    const model = editor.getModel();
    if (!model) return position;

    const lineCount = model.getLineCount();
    const clampedLine = Math.max(1, Math.min(position.lineNumber, lineCount));
    const maxColumn = model.getLineMaxColumn(clampedLine);
    const clampedColumn = Math.max(1, Math.min(position.column, maxColumn));

    return { lineNumber: clampedLine, column: clampedColumn };
  } catch {
    return position;
  }
};

// Movement command factories (pure functions)
export const createHorizontalMovement = (delta: number): CommandHandler => 
  async (context: CommandContext) => {
    const currentPos = context.editor.getPosition();
    const targetColumn = currentPos.column + delta;
    const targetPosition = { lineNumber: currentPos.lineNumber, column: targetColumn };
    
    if (await validatePosition(context.editor, targetPosition)) {
      context.editor.setPosition(targetPosition);
    }
  };

export const createVerticalMovement = (delta: number): CommandHandler => 
  async (context: CommandContext) => {
    const currentPos = context.editor.getPosition();
    const targetLine = currentPos.lineNumber + delta;
    const model = context.editor.getModel();
    
    if (model) {
      const maxColumn = model.getLineMaxColumn(targetLine);
      const targetColumn = Math.min(currentPos.column, maxColumn);
      const targetPosition = { lineNumber: targetLine, column: targetColumn };
      
      if (await validatePosition(context.editor, targetPosition)) {
        context.editor.setPosition(targetPosition);
      }
    }
  };

export const createLineEdgeMovement = (toEnd: boolean): CommandHandler => 
  async (context: CommandContext) => {
    const currentPos = context.editor.getPosition();
    const model = context.editor.getModel();
    
    if (model) {
      const targetColumn = toEnd 
        ? model.getLineMaxColumn(currentPos.lineNumber)
        : 1;
      
      context.editor.setPosition({
        lineNumber: currentPos.lineNumber,
        column: targetColumn
      });
    }
  };

export const createFileEdgeMovement = (toEnd: boolean): CommandHandler => 
  async (context: CommandContext) => {
    const model = context.editor.getModel();
    
    if (model) {
      const targetLine = toEnd ? model.getLineCount() : 1;
      const targetColumn = 1;
      
      context.editor.setPosition({
        lineNumber: targetLine,
        column: targetColumn
      });
    }
  };

// Implementation of command service
export class VimCommandServiceImpl implements VimCommandService {
  constructor(
    private readonly repository: VimCommandRepository
  ) {}

  registerCommand(command: VimCommand, handler: CommandHandler): EditorResult<CommandRegistration> {
    try {
      // Create a wrapped handler that provides context
      const wrappedHandler = async (editor: MonacoEditor) => {
        const context: CommandContext = {
          editor,
          vim: {} as VimInstance, // Will be injected properly in real implementation
          currentMode: 'normal', // Will be determined dynamically
          position: editor.getPosition()
        };
        
        await handler(context);
      };

      // In real implementation, this would register with vim instance
      const registration: CommandRegistration = {
        commandId: command.id,
        dispose: () => {
          // Cleanup logic
        }
      };

      return createSuccessResult(registration);
    } catch (error) {
      return createErrorResult(`Failed to register command ${command.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async registerBasicMovementCommands(
    vim: VimInstance, 
    editor: MonacoEditor
  ): Promise<EditorResult<ReadonlyArray<CommandRegistration>>> {
    try {
      const basicCommands = this.repository.getCommandsByCategory('navigation')
        .filter(cmd => cmd.difficulty === 'beginner');

      const registrations: CommandRegistration[] = [];

      // Register h, j, k, l commands with their handlers
      const commandHandlers: Record<string, CommandHandler> = {
        'move-left': createHorizontalMovement(-1),
        'move-down': createVerticalMovement(1),
        'move-up': createVerticalMovement(-1),
        'move-right': createHorizontalMovement(1),
        'line-start': createLineEdgeMovement(false),
        'line-end': createLineEdgeMovement(true),
        'file-start': createFileEdgeMovement(false),
        'file-end': createFileEdgeMovement(true)
      };

      for (const command of basicCommands) {
        const handler = commandHandlers[command.id];
        if (handler) {
          // Register with vim instance
          vim.addCustomCommand(command.id, async (editor: MonacoEditor) => {
            const context: CommandContext = {
              editor,
              vim,
              currentMode: 'normal', // Would be determined dynamically
              position: editor.getPosition()
            };
            
            await handler(context);
          });

          registrations.push({
            commandId: command.id,
            dispose: () => {
              // Cleanup logic would go here
            }
          });
        }
      }

      return createSuccessResult(Object.freeze(registrations));
    } catch (error) {
      return createErrorResult(`Failed to register movement commands: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getAvailableCommands(mode: VimMode): ReadonlyArray<VimCommand> {
    return this.repository.getCommandsForMode(mode);
  }
}

// Factory function
export const createVimCommandService = (repository: VimCommandRepository): VimCommandService =>
  new VimCommandServiceImpl(repository);