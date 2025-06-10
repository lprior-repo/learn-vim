// HJKL Domain Logic - Pure Functions
// This module contains all business logic for HJKL movement commands

import { VimCommand, Position, MovementResult, EditorBounds } from '../types'

// Valid HJKL keys
const HJKL_KEYS = ['h', 'j', 'k', 'l'] as const
type HjklKey = typeof HJKL_KEYS[number]

// Movement directions for each key
const MOVEMENT_MAP: Record<HjklKey, { deltaLine: number; deltaColumn: number }> = {
  h: { deltaLine: 0, deltaColumn: -1 },  // left
  j: { deltaLine: 1, deltaColumn: 0 },   // down
  k: { deltaLine: -1, deltaColumn: 0 },  // up
  l: { deltaLine: 0, deltaColumn: 1 }    // right
}

// Factory function to create immutable VimCommand objects
export const createVimCommand = (props: {
  id: string
  keySequence: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  availableInModes: ReadonlyArray<string>
}): VimCommand => {
  return Object.freeze({
    id: props.id,
    keySequence: props.keySequence,
    description: props.description,
    category: props.category,
    difficulty: props.difficulty,
    availableInModes: Object.freeze([...props.availableInModes])
  })
}

// Pure function to validate if a key is a valid HJKL key
export const isValidHjklKey = (key: string): key is HjklKey => {
  return HJKL_KEYS.includes(key as HjklKey)
}

// Pure function to get movement direction for a key
export const getMovementDirection = (key: string): { deltaLine: number; deltaColumn: number } => {
  if (!isValidHjklKey(key)) {
    throw new Error(`Invalid HJKL key: ${key}`)
  }
  return MOVEMENT_MAP[key]
}

// Pure function to apply movement to a position
export const applyMovement = (
  position: Position,
  direction: { deltaLine: number; deltaColumn: number }
): Position => {
  return Object.freeze({
    line: position.line + direction.deltaLine,
    column: position.column + direction.deltaColumn
  })
}

// Pure function to validate if a movement is legal within bounds
export const validateMovement = (
  position: Position,
  key: string,
  bounds: EditorBounds
): boolean => {
  if (!isValidHjklKey(key)) {
    return false
  }

  const direction = getMovementDirection(key)
  const newPosition = applyMovement(position, direction)

  // Check boundaries
  if (newPosition.line < 0 || newPosition.line > bounds.maxLine) {
    return false
  }
  
  if (newPosition.column < 0 || newPosition.column > bounds.maxColumn) {
    return false
  }

  return true
}

// Pure function to calculate new position with boundary checking
export const calculatePosition = (
  currentPosition: Position,
  key: string,
  bounds: EditorBounds
): MovementResult => {
  // Validate key
  if (!isValidHjklKey(key)) {
    return Object.freeze({
      success: false,
      newPosition: currentPosition,
      error: `Invalid HJKL key: ${key}`
    })
  }

  // Check if movement is valid
  if (!validateMovement(currentPosition, key, bounds)) {
    const errorMessages: Record<HjklKey, string> = {
      h: 'Cannot move left: at left boundary',
      j: 'Cannot move down: at bottom boundary', 
      k: 'Cannot move up: at top boundary',
      l: 'Cannot move right: at right boundary'
    }

    return Object.freeze({
      success: false,
      newPosition: currentPosition,
      error: errorMessages[key]
    })
  }

  // Calculate new position
  const direction = getMovementDirection(key)
  const newPosition = applyMovement(currentPosition, direction)

  return Object.freeze({
    success: true,
    newPosition,
    error: undefined
  })
}