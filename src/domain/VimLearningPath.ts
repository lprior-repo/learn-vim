/**
 * Domain model for Vim Learning Path following DDD and functional programming principles
 * 
 * Principles applied:
 * - Domain-Driven Design: Value objects and entities for learning concepts
 * - Functional Programming: Pure functions, immutable data structures
 * - CUPID: Composable, Unix philosophy, Predictable, Idiomatic, Domain-based
 */

export type VimSkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type LearningCategory = 
  | 'basic-movement' 
  | 'word-movement' 
  | 'line-movement' 
  | 'advanced-movement'
  | 'insert-mode' 
  | 'visual-mode' 
  | 'mode-switching'
  | 'deletion' 
  | 'copy-paste' 
  | 'undo-redo'
  | 'search' 
  | 'file-operations'
  | 'text-objects'
  | 'macros'
  | 'registers';

export interface LearningObjective {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: LearningCategory;
  readonly skillLevel: VimSkillLevel;
  readonly estimatedTimeMinutes: number;
  readonly prerequisites: ReadonlyArray<string>;
}

export interface LearningModule {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: LearningCategory;
  readonly skillLevel: VimSkillLevel;
  readonly objectives: ReadonlyArray<LearningObjective>;
  readonly exercises: ReadonlyArray<string>;
  readonly estimatedTimeMinutes: number;
}

export interface LearningPath {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly targetLevel: VimSkillLevel;
  readonly modules: ReadonlyArray<LearningModule>;
  readonly totalTimeMinutes: number;
}

// Factory functions following functional programming principles
export const createLearningObjective = (props: {
  id: string;
  title: string;
  description: string;
  category: LearningCategory;
  skillLevel: VimSkillLevel;
  estimatedTimeMinutes: number;
  prerequisites?: ReadonlyArray<string>;
}): LearningObjective => {
  if (!props.id?.trim()) {
    throw new Error('Learning objective ID is required');
  }
  if (!props.title?.trim()) {
    throw new Error('Learning objective title is required');
  }
  if (props.estimatedTimeMinutes <= 0) {
    throw new Error('Estimated time must be positive');
  }

  return Object.freeze({
    id: props.id.trim(),
    title: props.title.trim(),
    description: props.description.trim(),
    category: props.category,
    skillLevel: props.skillLevel,
    estimatedTimeMinutes: props.estimatedTimeMinutes,
    prerequisites: Object.freeze(props.prerequisites || [])
  });
};

export const createLearningModule = (props: {
  id: string;
  title: string;
  description: string;
  category: LearningCategory;
  skillLevel: VimSkillLevel;
  objectives: ReadonlyArray<LearningObjective>;
  exercises?: ReadonlyArray<string>;
}): LearningModule => {
  if (!props.id?.trim()) {
    throw new Error('Learning module ID is required');
  }
  if (!props.title?.trim()) {
    throw new Error('Learning module title is required');
  }
  if (!props.objectives?.length) {
    throw new Error('Learning module must have at least one objective');
  }

  const totalTime = props.objectives.reduce((sum, obj) => sum + obj.estimatedTimeMinutes, 0);

  return Object.freeze({
    id: props.id.trim(),
    title: props.title.trim(),
    description: props.description.trim(),
    category: props.category,
    skillLevel: props.skillLevel,
    objectives: Object.freeze(props.objectives),
    exercises: Object.freeze(props.exercises || []),
    estimatedTimeMinutes: totalTime
  });
};

export const createLearningPath = (props: {
  id: string;
  title: string;
  description: string;
  targetLevel: VimSkillLevel;
  modules: ReadonlyArray<LearningModule>;
}): LearningPath => {
  if (!props.id?.trim()) {
    throw new Error('Learning path ID is required');
  }
  if (!props.title?.trim()) {
    throw new Error('Learning path title is required');
  }
  if (!props.modules?.length) {
    throw new Error('Learning path must have at least one module');
  }

  const totalTime = props.modules.reduce((sum, module) => sum + module.estimatedTimeMinutes, 0);

  return Object.freeze({
    id: props.id.trim(),
    title: props.title.trim(),
    description: props.description.trim(),
    targetLevel: props.targetLevel,
    modules: Object.freeze(props.modules),
    totalTimeMinutes: totalTime
  });
};

// Pure helper functions
export const getModulesByCategory = (
  modules: ReadonlyArray<LearningModule>, 
  category: LearningCategory
): ReadonlyArray<LearningModule> => 
  modules.filter(module => module.category === category);

export const getModulesBySkillLevel = (
  modules: ReadonlyArray<LearningModule>, 
  skillLevel: VimSkillLevel
): ReadonlyArray<LearningModule> => 
  modules.filter(module => module.skillLevel === skillLevel);

export const getPrerequisiteObjectives = (
  allObjectives: ReadonlyArray<LearningObjective>,
  objective: LearningObjective
): ReadonlyArray<LearningObjective> => 
  allObjectives.filter(obj => objective.prerequisites.includes(obj.id));

export const isObjectiveReady = (
  completedObjectives: ReadonlyArray<string>,
  objective: LearningObjective
): boolean => 
  objective.prerequisites.every(prereqId => completedObjectives.includes(prereqId));

export const getNextObjectives = (
  allObjectives: ReadonlyArray<LearningObjective>,
  completedObjectives: ReadonlyArray<string>
): ReadonlyArray<LearningObjective> => 
  allObjectives.filter(obj => 
    !completedObjectives.includes(obj.id) && 
    isObjectiveReady(completedObjectives, obj)
  );

export const calculateProgress = (
  totalObjectives: number,
  completedObjectives: number
): number => {
  if (totalObjectives <= 0) return 0;
  return Math.round((completedObjectives / totalObjectives) * 100);
};

// Type guards
export const isValidSkillLevel = (level: any): level is VimSkillLevel =>
  typeof level === 'string' && 
  ['beginner', 'intermediate', 'advanced', 'expert'].includes(level);

export const isValidLearningCategory = (category: any): category is LearningCategory =>
  typeof category === 'string' && [
    'basic-movement', 'word-movement', 'line-movement', 'advanced-movement',
    'insert-mode', 'visual-mode', 'mode-switching', 'deletion', 'copy-paste',
    'undo-redo', 'search', 'file-operations', 'text-objects', 'macros', 'registers'
  ].includes(category);

export const isValidLearningObjective = (obj: any): obj is LearningObjective =>
  obj !== null &&
  obj !== undefined &&
  typeof obj === 'object' &&
  typeof obj.id === 'string' &&
  typeof obj.title === 'string' &&
  typeof obj.description === 'string' &&
  isValidLearningCategory(obj.category) &&
  isValidSkillLevel(obj.skillLevel) &&
  typeof obj.estimatedTimeMinutes === 'number' &&
  Array.isArray(obj.prerequisites);