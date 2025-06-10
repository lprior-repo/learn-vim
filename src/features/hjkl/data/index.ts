// HJKL Data Access Layer
// Repository pattern implementation for HJKL commands

import { VimCommand } from '../types'
import { createVimCommand } from '../domain'

// HJKL Command definitions
const HJKL_COMMANDS: VimCommand[] = [
  createVimCommand({
    id: 'move-left',
    keySequence: 'h',
    description: 'Move cursor left',
    category: 'basic-movement',
    difficulty: 'beginner',
    availableInModes: ['normal', 'visual', 'visual-line', 'visual-block']
  }),
  createVimCommand({
    id: 'move-down',
    keySequence: 'j',
    description: 'Move cursor down',
    category: 'basic-movement',
    difficulty: 'beginner',
    availableInModes: ['normal', 'visual', 'visual-line', 'visual-block']
  }),
  createVimCommand({
    id: 'move-up',
    keySequence: 'k',
    description: 'Move cursor up',
    category: 'basic-movement',
    difficulty: 'beginner',
    availableInModes: ['normal', 'visual', 'visual-line', 'visual-block']
  }),
  createVimCommand({
    id: 'move-right',
    keySequence: 'l',
    description: 'Move cursor right',
    category: 'basic-movement',
    difficulty: 'beginner',
    availableInModes: ['normal', 'visual', 'visual-line', 'visual-block']
  })
]

// Learning objectives for HJKL
const HJKL_LEARNING_OBJECTIVES = [
  {
    id: 'h-movement',
    title: 'Master H (Left Movement)',
    description: 'Learn to move cursor left with h key',
    category: 'basic-movement',
    skillLevel: 'beginner',
    estimatedTimeMinutes: 5,
    commandId: 'move-left'
  },
  {
    id: 'j-movement', 
    title: 'Master J (Down Movement)',
    description: 'Learn to move cursor down with j key',
    category: 'basic-movement',
    skillLevel: 'beginner',
    estimatedTimeMinutes: 5,
    commandId: 'move-down'
  },
  {
    id: 'k-movement',
    title: 'Master K (Up Movement)', 
    description: 'Learn to move cursor up with k key',
    category: 'basic-movement',
    skillLevel: 'beginner',
    estimatedTimeMinutes: 5,
    commandId: 'move-up'
  },
  {
    id: 'l-movement',
    title: 'Master L (Right Movement)',
    description: 'Learn to move cursor right with l key', 
    category: 'basic-movement',
    skillLevel: 'beginner',
    estimatedTimeMinutes: 5,
    commandId: 'move-right'
  }
]

// HJKL Learning Path definition
const HJKL_LEARNING_PATH = Object.freeze({
  id: 'hjkl-basics',
  title: 'HJKL Movement Basics',
  description: 'Master the fundamental movement keys in Vim',
  category: 'basic-movement',
  skillLevel: 'beginner',
  estimatedTimeMinutes: 20,
  objectives: Object.freeze([...HJKL_LEARNING_OBJECTIVES.map(obj => Object.freeze(obj))])
})

// Repository functions

// Get all HJKL commands
export const getHjklCommands = (): ReadonlyArray<VimCommand> => {
  return Object.freeze([...HJKL_COMMANDS])
}

// Get HJKL learning path
export const getHjklLearningPath = () => {
  return HJKL_LEARNING_PATH
}

// Get command by ID
export const getCommandById = (id: string): VimCommand | undefined => {
  return HJKL_COMMANDS.find(command => command.id === id)
}

// Filter commands by difficulty
export const filterCommandsByDifficulty = (
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): ReadonlyArray<VimCommand> => {
  return Object.freeze(
    HJKL_COMMANDS.filter(command => command.difficulty === difficulty)
  )
}

// Get commands by mode
export const getCommandsByMode = (mode: string): ReadonlyArray<VimCommand> => {
  return Object.freeze(
    HJKL_COMMANDS.filter(command => command.availableInModes.includes(mode))
  )
}

// Get command by key sequence
export const getCommandByKey = (keySequence: string): VimCommand | undefined => {
  return HJKL_COMMANDS.find(command => command.keySequence === keySequence)
}

// Get all available modes for HJKL commands
export const getAvailableModes = (): ReadonlyArray<string> => {
  const modes = new Set<string>()
  HJKL_COMMANDS.forEach(command => {
    command.availableInModes.forEach(mode => modes.add(mode))
  })
  return Object.freeze([...modes])
}

// Get learning objectives in order
export const getLearningObjectives = (): ReadonlyArray<typeof HJKL_LEARNING_OBJECTIVES[0]> => {
  return Object.freeze([...HJKL_LEARNING_OBJECTIVES])
}

// Get next learning objective after completing a command
export const getNextObjective = (completedCommandId: string): typeof HJKL_LEARNING_OBJECTIVES[0] | null => {
  const currentIndex = HJKL_LEARNING_OBJECTIVES.findIndex(obj => obj.commandId === completedCommandId)
  if (currentIndex === -1 || currentIndex >= HJKL_LEARNING_OBJECTIVES.length - 1) {
    return null
  }
  return HJKL_LEARNING_OBJECTIVES[currentIndex + 1]
}