import React from 'react'
import { LearningProgress } from '../types'

interface HjklProgressProps {
  progress: LearningProgress
  onReset?: () => void
}

export const HjklProgress: React.FC<HjklProgressProps> = ({
  progress,
  onReset
}) => {
  const totalCommands = 4 // h, j, k, l
  const completedCount = progress.completedCommands.length
  const progressPercentage = Math.round((completedCount / totalCommands) * 100)
  const isComplete = completedCount === totalCommands

  return (
    <div 
      data-testid="hjkl-progress" 
      className="hjkl-progress p-6 bg-white rounded-lg shadow-sm border border-gray-200"
      aria-label="Learning progress"
    >
      {/* Header */}
      <div className="progress-header mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Learning Progress
        </h3>
      </div>

      {/* Progress Statistics */}
      <div className="progress-stats grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Commands Mastered */}
        <div className="stat-item text-center p-3 bg-blue-50 rounded-lg">
          <div className="stat-value text-2xl font-bold text-blue-600">
            {completedCount} / {totalCommands}
          </div>
          <div className="stat-label text-sm text-blue-800">
            Commands Mastered
          </div>
        </div>

        {/* Score */}
        <div className="stat-item text-center p-3 bg-green-50 rounded-lg">
          <div className="stat-value text-2xl font-bold text-green-600">
            {isComplete ? 'Perfect Score: ' : 'Score: '}{progress.score}
          </div>
          <div className="stat-label text-sm text-green-800">
            Points Earned
          </div>
        </div>

        {/* Current Challenge */}
        <div className="stat-item text-center p-3 bg-purple-50 rounded-lg">
          <div className="stat-value text-lg font-semibold text-purple-600">
            {progress.currentChallenge || 'Complete!'}
          </div>
          <div className="stat-label text-sm text-purple-800">
            Current Challenge: {progress.currentChallenge || 'All done!'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-section mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Overall Progress
          </span>
          <span className="text-sm font-medium text-gray-700">
            {progressPercentage}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            data-testid="progress-bar"
            className={`h-3 rounded-full transition-all duration-500 ${
              isComplete ? 'bg-green-600' : 'bg-blue-600'
            }`}
            style={{ width: `${progressPercentage}%` }}
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          />
        </div>
      </div>

      {/* Command Progress Details */}
      <div className="command-progress-details mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">
          Individual Command Progress
        </h4>
        
        <div className="commands-grid grid grid-cols-2 md:grid-cols-4 gap-3">
          {['h', 'j', 'k', 'l'].map((command) => {
            const isCompleted = progress.completedCommands.includes(command)
            const commandNames = { h: 'Left', j: 'Down', k: 'Up', l: 'Right' }
            
            return (
              <div 
                key={command}
                className={`command-status p-3 rounded-lg border-2 transition-colors ${
                  isCompleted 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  <span className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${isCompleted ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}
                  `}>
                    {command}
                  </span>
                </div>
                <div className={`text-xs text-center ${
                  isCompleted ? 'text-green-800' : 'text-gray-600'
                }`}>
                  {commandNames[command as keyof typeof commandNames]}
                </div>
                {isCompleted && (
                  <div className="text-center mt-1">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Completion Celebration */}
      {isComplete && (
        <div className="completion-celebration mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h4 className="text-lg font-bold text-green-900 mb-1">
              All HJKL Commands Mastered!
            </h4>
            <p className="text-green-700 text-sm mb-3">
              Congratulations! You've mastered the fundamental movement keys.
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Ready for Advanced Movement
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="progress-actions flex justify-center">
        {onReset && (
          <button
            onClick={onReset}
            className="reset-button px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Reset Progress
          </button>
        )}
      </div>
    </div>
  )
}