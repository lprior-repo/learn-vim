// HJKL Services Layer
// Application services for HJKL movement and editor integration

import { Position, EditorBounds, MovementResult, LearningProgress } from '../types'
import { calculatePosition, validateMovement, isValidHjklKey } from '../domain'

// Monaco Editor interface
interface MonacoEditor {
  getPosition(): { lineNumber: number; column: number }
  setPosition(position: { lineNumber: number; column: number }): void
  getModel(): {
    getLineCount(): number
    getLineMaxColumn(lineNumber: number): number
  } | null
  addCommand(keybinding: number, handler: () => void): void
  onDidChangeCursorPosition(listener: (e: any) => void): { dispose(): void }
}

// HJKL Movement Service class
export class HjklMovementService {
  private editor: MonacoEditor

  constructor(editor: MonacoEditor) {
    this.editor = editor
  }

  // Get the underlying editor instance
  getEditor(): MonacoEditor {
    return this.editor
  }

  // Execute a movement command
  async executeMovement(key: string): Promise<MovementResult> {
    if (!isValidHjklKey(key)) {
      return Object.freeze({
        success: false,
        newPosition: this.getCurrentPosition(),
        error: `Invalid HJKL key: ${key}`
      })
    }

    const currentPosition = this.getCurrentPosition()
    const bounds = this.getEditorBounds()
    const result = calculatePosition(currentPosition, key, bounds)

    if (result.success) {
      // Convert from 0-based to 1-based for Monaco
      this.editor.setPosition({
        lineNumber: result.newPosition.line + 1,
        column: result.newPosition.column + 1
      })
    }

    return result
  }

  // Get current cursor position (0-based)
  getCurrentPosition(): Position {
    const position = this.editor.getPosition()
    return Object.freeze({
      line: position.lineNumber - 1,  // Convert from 1-based to 0-based
      column: position.column - 1     // Convert from 1-based to 0-based
    })
  }

  // Get editor bounds (0-based)
  getEditorBounds(): EditorBounds {
    const model = this.editor.getModel()
    if (!model) {
      return { maxLine: 0, maxColumn: 0 }
    }

    const lineCount = model.getLineCount()
    const maxLine = lineCount - 1  // Convert from 1-based to 0-based
    
    // Get max column for the last line, or use a reasonable default
    const maxColumn = lineCount > 0 ? model.getLineMaxColumn(lineCount) - 1 : 0

    return Object.freeze({ maxLine, maxColumn })
  }

  // Register HJKL command handlers
  registerCommands(): void {
    // This would register with Monaco's key binding system
    // Implementation depends on Monaco setup
  }
}

// Factory function for creating movement service
export const createMovementService = () => {
  return (editor: MonacoEditor) => new HjklMovementService(editor)
}

// Pure function for executing movement with validation
export const executeMovement = (
  position: Position,
  key: string,
  bounds: EditorBounds
): MovementResult => {
  return calculatePosition(position, key, bounds)
}

// Validate and execute movement in one step
export const validateAndExecuteMovement = (
  position: Position,
  key: string,
  bounds: EditorBounds
): MovementResult => {
  if (!isValidHjklKey(key)) {
    return Object.freeze({
      success: false,
      newPosition: position,
      error: `Invalid HJKL key: ${key}`
    })
  }

  if (!validateMovement(position, key, bounds)) {
    return Object.freeze({
      success: false,
      newPosition: position,
      error: `Movement not allowed: boundary collision`
    })
  }

  return executeMovement(position, key, bounds)
}

// Register HJKL commands with a key handler
export const registerHjklCommands = (
  registerCommand: (key: string, callback: () => void) => void
): void => {
  const hjklKeys = ['h', 'j', 'k', 'l']
  
  hjklKeys.forEach(key => {
    registerCommand(key, () => {
      // This callback would be provided by the caller
      // It's a higher-order function pattern
    })
  })
}

// Track learning progress for movements
export const trackMovementProgress = (
  currentProgress: LearningProgress,
  key: string,
  successful: boolean
): LearningProgress => {
  if (!successful) {
    return currentProgress // No change for failed movements
  }

  const completedCommands = [...currentProgress.completedCommands]
  
  // Add key to completed if not already there
  if (!completedCommands.includes(key)) {
    completedCommands.push(key)
  }

  // Calculate new score (10 points per unique command)
  const score = completedCommands.length * 10

  return Object.freeze({
    completedCommands: Object.freeze(completedCommands),
    currentChallenge: currentProgress.currentChallenge,
    score
  })
}

// Progress persistence service
export class ProgressService {
  private static readonly STORAGE_KEY = 'hjkl-progress'

  static saveProgress(progress: LearningProgress): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress))
    } catch (error) {
      console.warn('Failed to save HJKL progress:', error)
    }
  }

  static loadProgress(): LearningProgress | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null

      const parsed = JSON.parse(stored)
      return Object.freeze({
        completedCommands: Object.freeze([...parsed.completedCommands]),
        currentChallenge: parsed.currentChallenge,
        score: parsed.score
      })
    } catch (error) {
      console.warn('Failed to load HJKL progress:', error)
      return null
    }
  }

  static clearProgress(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear HJKL progress:', error)
    }
  }
}

// Command registration service
export class CommandRegistrationService {
  private registeredCommands: Map<string, () => void> = new Map()

  register(key: string, handler: () => void): void {
    this.registeredCommands.set(key, handler)
  }

  unregister(key: string): void {
    this.registeredCommands.delete(key)
  }

  execute(key: string): boolean {
    const handler = this.registeredCommands.get(key)
    if (handler) {
      handler()
      return true
    }
    return false
  }

  isRegistered(key: string): boolean {
    return this.registeredCommands.has(key)
  }

  getRegisteredKeys(): ReadonlyArray<string> {
    return Object.freeze([...this.registeredCommands.keys()])
  }
}