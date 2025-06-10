// HJKL Feature Slice - Public API
// This file defines the public interface for the HJKL feature slice

// Export domain types and functions
export type { 
  VimCommand, 
  Position, 
  MovementResult, 
  EditorBounds, 
  HjklState, 
  LearningProgress 
} from './types'

export { 
  createVimCommand, 
  calculatePosition, 
  validateMovement,
  isValidHjklKey,
  getMovementDirection,
  applyMovement
} from './domain'

// Export data access
export { 
  getHjklCommands, 
  getHjklLearningPath,
  getCommandById,
  filterCommandsByDifficulty,
  getCommandsByMode,
  getCommandByKey,
  getAvailableModes,
  getLearningObjectives,
  getNextObjective
} from './data'

// Export services
export { 
  HjklMovementService,
  createMovementService,
  executeMovement,
  validateAndExecuteMovement,
  registerHjklCommands,
  trackMovementProgress,
  ProgressService,
  CommandRegistrationService
} from './services'

// Export components
export { 
  HjklEditor, 
  HjklTutorial, 
  HjklProgress,
  HjklCommandCard,
  HjklLearningPath
} from './components'

// Export page
export { HjklPage } from './pages'

// Export feature configuration
export const HJKL_FEATURE_CONFIG = {
  name: 'hjkl',
  title: 'HJKL Movement Training',
  description: 'Learn the fundamental Vim movement keys',
  route: '/hjkl',
  category: 'basic-movement',
  difficulty: 'beginner',
  estimatedTimeMinutes: 20
} as const