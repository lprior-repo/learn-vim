import React from 'react'
import { HjklCommandCard } from './HjklCommandCard'
import { LearningProgress } from '../types'
import { getHjklCommands } from '../data'

interface HjklTutorialProps {
  progress?: LearningProgress
  onCommandSelect?: (command: string) => void
}

export const HjklTutorial: React.FC<HjklTutorialProps> = ({
  progress,
  onCommandSelect
}) => {
  const commands = getHjklCommands()
  
  // Calculate progress percentage
  const progressPercentage = progress 
    ? Math.round((progress.completedCommands.length / commands.length) * 100)
    : 0

  // Get next challenge hint
  const getNextChallengeHint = () => {
    if (!progress) return null
    
    const nextCommand = ['h', 'j', 'k', 'l'].find(
      key => !progress.completedCommands.includes(key)
    )
    
    if (!nextCommand) return null
    
    const hints = {
      h: 'Try the h key to move left',
      j: 'Try the j key to move down', 
      k: 'Try the k key to move up',
      l: 'Try the l key to move right'
    }
    
    return hints[nextCommand as keyof typeof hints]
  }

  const nextHint = getNextChallengeHint()

  return (
    <div data-testid="hjkl-tutorial" className="hjkl-tutorial" aria-label="HJKL tutorial section">
      {/* Header */}
      <div className="tutorial-header mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          HJKL Movement Commands
        </h2>
        <p className="text-gray-600">
          Master the fundamental movement keys in Vim
        </p>
      </div>

      {/* Progress Display */}
      {progress && (
        <div className="progress-summary mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-900">
              Progress: {progressPercentage}%
            </span>
            <span className="text-sm font-medium text-blue-900">
              Score: {progress.score}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {progress.currentChallenge && (
            <p className="text-sm text-blue-800 mt-2">
              Current Challenge: {progress.currentChallenge}
            </p>
          )}
        </div>
      )}

      {/* Command Cards Grid */}
      <div className="command-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {commands.map((command) => (
          <HjklCommandCard
            key={command.id}
            command={command.keySequence}
            description={`${command.keySequence} - ${command.description.replace('Move cursor ', '')}`}
            isCompleted={progress?.completedCommands.includes(command.keySequence) || false}
            onClick={onCommandSelect}
          />
        ))}
      </div>

      {/* Learning Hints */}
      <div className="learning-hints bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Learning Tips
        </h3>
        
        <div className="tips-list space-y-2 text-sm text-gray-700">
          <p>• Remember: H moves left, L moves right</p>
          <p>• J moves down, K moves up</p>
          <p>• Think of J as "down" because it looks like an arrow pointing down</p>
          <p>• K is above J on the keyboard, so it moves up</p>
        </div>

        {nextHint && (
          <div className="next-hint mt-4 p-3 bg-blue-100 rounded border-l-4 border-blue-500">
            <p className="text-sm font-medium text-blue-900">
              Next: {nextHint}
            </p>
          </div>
        )}
      </div>

      {/* Completion Message */}
      {progress && progressPercentage === 100 && (
        <div className="completion-message mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🎉</span>
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                All HJKL Commands Mastered!
              </h3>
              <p className="text-green-700">
                Perfect! You've learned all the basic movement keys.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}