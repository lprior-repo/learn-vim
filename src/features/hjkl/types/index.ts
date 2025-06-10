// HJKL Feature Types

export interface Position {
  readonly line: number
  readonly column: number
}

export interface VimCommand {
  readonly id: string
  readonly keySequence: string
  readonly description: string
  readonly category: string
  readonly difficulty: 'beginner' | 'intermediate' | 'advanced'
  readonly availableInModes: ReadonlyArray<string>
}

export interface MovementResult {
  readonly success: boolean
  readonly newPosition: Position
  readonly error?: string
}

export interface EditorBounds {
  readonly maxLine: number
  readonly maxColumn: number
}

export interface HjklState {
  readonly currentPosition: Position
  readonly editorBounds: EditorBounds
  readonly isLearningMode: boolean
}

export interface LearningProgress {
  readonly completedCommands: ReadonlyArray<string>
  readonly currentChallenge: string | null
  readonly score: number
}