/**
 * Learning Path Page Component - Main hub for vim learning paths
 * 
 * Principles applied:
 * - Functional Programming: Pure functional components, memoization
 * - CUPID: Composable, Unix philosophy, Predictable, Idiomatic, Domain-based
 * - React Best Practices: Proper hooks usage, performance optimization
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createVimLearningPathRepository } from '../data/VimLearningPathRepository';
import { VimSkillLevel } from '../domain/VimLearningPath';

const LearningPathPage: React.FC = () => {
  // Repository instance - memoized for performance
  const repository = useMemo(() => createVimLearningPathRepository(), []);
  
  // Fetch all learning paths - memoized computation
  const learningPaths = useMemo(() => repository.getAllPaths(), [repository]);
  
  // Group paths by skill level for better organization
  const pathsByLevel = useMemo(() => {
    return learningPaths.reduce((acc, path) => {
      if (!acc[path.targetLevel]) {
        acc[path.targetLevel] = [];
      }
      acc[path.targetLevel].push(path);
      return acc;
    }, {} as Record<VimSkillLevel, typeof learningPaths>);
  }, [learningPaths]);

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
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

  const getSkillLevelDescription = (level: VimSkillLevel): string => {
    const descriptions = {
      beginner: 'Perfect for vim newcomers. Learn the fundamentals.',
      intermediate: 'Build upon basics with advanced navigation and editing.',
      advanced: 'Master complex vim techniques and automation.',
      expert: 'Become a vim power user with advanced workflows.'
    };
    return descriptions[level];
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-400 mb-4">
          Vim Learning Paths
        </h1>
        <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
          Structured learning paths designed by vim experts. Progress from complete beginner 
          to vim master through carefully crafted modules and exercises.
        </p>
      </section>

      {/* Learning Paths by Level */}
      <section>
        {(['beginner', 'intermediate', 'advanced', 'expert'] as VimSkillLevel[]).map(level => {
          const paths = pathsByLevel[level] || [];
          if (paths.length === 0) return null;

          return (
            <div key={level} className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-neutral-200 capitalize">
                  {level} Level
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(level)}`}>
                  {paths.length} path{paths.length !== 1 ? 's' : ''}
                </span>
              </div>

              <p className="text-neutral-400 mb-6">
                {getSkillLevelDescription(level)}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paths.map(path => (
                  <Link
                    key={path.id}
                    to={`/learning-path/${path.id}`}
                    className="block bg-neutral-800 rounded-lg border border-neutral-700 hover:border-blue-500 transition-colors p-6 group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {path.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSkillLevelColor(path.targetLevel)}`}>
                        {path.targetLevel}
                      </span>
                    </div>

                    <p className="text-neutral-300 mb-4 line-clamp-2">
                      {path.description}
                    </p>

                    <div className="flex justify-between items-center text-sm text-neutral-400">
                      <span>{path.modules.length} modules</span>
                      <span>{formatDuration(path.totalTimeMinutes)}</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-neutral-700">
                      <div className="flex flex-wrap gap-2">
                        {path.modules.slice(0, 3).map(module => (
                          <span
                            key={module.id}
                            className="px-2 py-1 bg-neutral-700 text-neutral-300 text-xs rounded"
                          >
                            {module.title}
                          </span>
                        ))}
                        {path.modules.length > 3 && (
                          <span className="px-2 py-1 bg-neutral-700 text-neutral-400 text-xs rounded">
                            +{path.modules.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Quick Start Section */}
      <section className="bg-neutral-800 rounded-lg border border-neutral-700 p-8 mb-8">
        <h2 className="text-2xl font-bold text-blue-300 mb-4">
          New to Vim? Start Here
        </h2>
        <p className="text-neutral-300 mb-6">
          If you're completely new to vim, we recommend starting with our beginner path. 
          It covers all the fundamentals you need to become productive in vim.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/learning-path/vim-beginner"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-center transition-colors"
          >
            Start Beginner Path
          </Link>
          <Link
            to="/practice"
            className="border border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg font-medium text-center transition-colors"
          >
            Try Interactive Practice
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl">📚</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Structured Learning
          </h3>
          <p className="text-neutral-400 text-sm">
            Follow expertly designed paths that build skills progressively
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Hands-on Practice
          </h3>
          <p className="text-neutral-400 text-sm">
            Interactive exercises and real-world examples in every module
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Track Progress
          </h3>
          <p className="text-neutral-400 text-sm">
            Monitor your learning journey and celebrate achievements
          </p>
        </div>
      </section>
    </div>
  );
};

export default LearningPathPage;