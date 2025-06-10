/**
 * Learning Path Detail Page Component - Shows detailed view of a specific learning path
 * 
 * Principles applied:
 * - Functional Programming: Pure components, memoization, immutable state
 * - CUPID: Composable, Unix philosophy, Predictable, Idiomatic, Domain-based
 */

import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createVimLearningPathRepository } from '../data/VimLearningPathRepository';
import { LearningModule, LearningObjective, VimSkillLevel } from '../domain/VimLearningPath';

const LearningPathDetailPage: React.FC = () => {
  const { pathId } = useParams<{ pathId: string }>();
  const repository = useMemo(() => createVimLearningPathRepository(), []);
  
  // Fetch the specific learning path
  const learningPath = useMemo(() => {
    if (!pathId) return undefined;
    return repository.getPathById(pathId);
  }, [repository, pathId]);

  // Calculate progress statistics
  const pathStats = useMemo(() => {
    if (!learningPath) return null;
    
    const totalObjectives = learningPath.modules.reduce(
      (sum, module) => sum + module.objectives.length, 
      0
    );
    
    const modulesByLevel = learningPath.modules.reduce((acc, module) => {
      acc[module.skillLevel] = (acc[module.skillLevel] || 0) + 1;
      return acc;
    }, {} as Record<VimSkillLevel, number>);

    return {
      totalModules: learningPath.modules.length,
      totalObjectives,
      totalTime: learningPath.totalTimeMinutes,
      modulesByLevel
    };
  }, [learningPath]);

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getSkillLevelColor = (level: VimSkillLevel): string => {
    const colors = {
      beginner: 'bg-green-600 text-white',
      intermediate: 'bg-yellow-600 text-black',
      advanced: 'bg-orange-600 text-white',
      expert: 'bg-red-600 text-white'
    };
    return colors[level];
  };

  const getDifficultyIcon = (level: VimSkillLevel): string => {
    const icons = {
      beginner: '🟢',
      intermediate: '🟡',
      advanced: '🟠',
      expert: '🔴'
    };
    return icons[level];
  };

  // Loading state
  if (!pathId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-400">Invalid Path</h1>
        <p className="text-neutral-400 mt-2">No path ID provided</p>
        <Link to="/learning-paths" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
          ← Back to Learning Paths
        </Link>
      </div>
    );
  }

  // Path not found
  if (!learningPath) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-400">Path Not Found</h1>
        <p className="text-neutral-400 mt-2">Learning path "{pathId}" does not exist</p>
        <Link to="/learning-paths" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
          ← Back to Learning Paths
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link to="/learning-paths" className="text-blue-400 hover:text-blue-300">
          Learning Paths
        </Link>
        <span className="text-neutral-500 mx-2">→</span>
        <span className="text-neutral-300">{learningPath.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-blue-400">
            {learningPath.title}
          </h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(learningPath.targetLevel)}`}>
            {learningPath.targetLevel} level
          </span>
        </div>

        <p className="text-lg text-neutral-300 mb-6">
          {learningPath.description}
        </p>

        {/* Stats */}
        {pathStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-neutral-800 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{pathStats.totalModules}</div>
              <div className="text-sm text-neutral-400">Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{pathStats.totalObjectives}</div>
              <div className="text-sm text-neutral-400">Objectives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{formatDuration(pathStats.totalTime)}</div>
              <div className="text-sm text-neutral-400">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{getDifficultyIcon(learningPath.targetLevel)}</div>
              <div className="text-sm text-neutral-400">Difficulty</div>
            </div>
          </div>
        )}
      </header>

      {/* Start Learning Button */}
      <div className="mb-8">
        <Link
          to={`/learning-path/${learningPath.id}/module/${learningPath.modules[0]?.id}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
        >
          Start Learning Path
          <span>→</span>
        </Link>
      </div>

      {/* Modules */}
      <section>
        <h2 className="text-2xl font-bold text-neutral-200 mb-6">Learning Modules</h2>
        
        <div className="space-y-6">
          {learningPath.modules.map((module, index) => (
            <ModuleCard 
              key={module.id} 
              module={module} 
              moduleNumber={index + 1}
              pathId={learningPath.id}
            />
          ))}
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="mt-12 bg-neutral-800 rounded-lg border border-neutral-700 p-6">
        <h2 className="text-xl font-bold text-neutral-200 mb-4">What You'll Learn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learningPath.modules.flatMap(module => module.objectives.slice(0, 2)).map(objective => (
            <div key={objective.id} className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <div>
                <h3 className="font-medium text-white">{objective.title}</h3>
                <p className="text-sm text-neutral-400">{objective.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Module Card Component
interface ModuleCardProps {
  module: LearningModule;
  moduleNumber: number;
  pathId: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, moduleNumber, pathId }) => {
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getSkillLevelColor = (level: VimSkillLevel): string => {
    const colors = {
      beginner: 'bg-green-600 text-white',
      intermediate: 'bg-yellow-600 text-black',
      advanced: 'bg-orange-600 text-white',
      expert: 'bg-red-600 text-white'
    };
    return colors[level];
  };

  return (
    <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {moduleNumber}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{module.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getSkillLevelColor(module.skillLevel)}`}>
                {module.skillLevel}
              </span>
              <span className="text-neutral-400 text-sm">
                {formatDuration(module.estimatedTimeMinutes)}
              </span>
              <span className="text-neutral-400 text-sm">
                {module.objectives.length} objectives
              </span>
            </div>
          </div>
        </div>
        <Link
          to={`/learning-path/${pathId}/module/${module.id}`}
          className="text-blue-400 hover:text-blue-300 font-medium text-sm"
        >
          Start Module →
        </Link>
      </div>

      <p className="text-neutral-300 mb-4">{module.description}</p>

      {/* Objectives */}
      <div className="mb-4">
        <h4 className="font-medium text-neutral-200 mb-2">Learning Objectives:</h4>
        <ul className="space-y-1">
          {module.objectives.map(objective => (
            <li key={objective.id} className="flex items-start gap-2 text-sm">
              <span className="text-blue-400 mt-1">•</span>
              <span className="text-neutral-400">{objective.title}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Exercises */}
      {module.exercises.length > 0 && (
        <div>
          <h4 className="font-medium text-neutral-200 mb-2">Practice Exercises:</h4>
          <ul className="space-y-1">
            {module.exercises.map((exercise, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-green-400 mt-1">•</span>
                <span className="text-neutral-400">{exercise}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LearningPathDetailPage;