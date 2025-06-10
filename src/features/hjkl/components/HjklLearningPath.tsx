import React from 'react'
import { LearningProgress } from '../types'
import { getHjklLearningPath } from '../data'

interface HjklLearningPathProps {
  progress?: LearningProgress
  onStepSelect?: (command: string) => void
}

export const HjklLearningPath: React.FC<HjklLearningPathProps> = ({
  progress,
  onStepSelect
}) => {
  const learningPath = getHjklLearningPath()
  const isComplete = progress && progress.completedCommands.length === 4

  const getStepStatus = (commandKey: string) => {
    if (!progress) return 'pending'
    
    if (progress.completedCommands.includes(commandKey)) {
      return 'completed'
    } else if (progress.completedCommands.length === 0 && commandKey === 'h') {
      return 'current'
    } else if (
      progress.completedCommands.length > 0 && 
      ['h', 'j', 'k', 'l'][progress.completedCommands.length] === commandKey
    ) {
      return 'current'
    }
    
    return 'pending'
  }

  const handleStepClick = (commandKey: string) => {
    onStepSelect?.(commandKey)
  }

  return (
    <div className="hjkl-learning-path p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="learning-path-header mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {learningPath.title}
        </h3>
        <p className="text-gray-600">
          {learningPath.description}
        </p>
        <div className="mt-2 text-sm text-gray-500">
          Estimated time: {learningPath.estimatedTimeMinutes} minutes
        </div>
      </div>

      {/* Learning Steps */}
      <div className="learning-steps space-y-4 mb-6">
        {learningPath.objectives.map((objective, index) => {
          const commandKey = ['h', 'j', 'k', 'l'][index]
          const stepStatus = getStepStatus(commandKey)
          const stepNumber = index + 1

          return (
            <div
              key={objective.id}
              data-testid={`step-${commandKey}`}
              className={`
                learning-step p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${stepStatus === 'completed' ? 'completed border-green-500 bg-green-50' : ''}
                ${stepStatus === 'current' ? 'current border-blue-500 bg-blue-50' : ''}
                ${stepStatus === 'pending' ? 'pending border-gray-300 bg-gray-50' : ''}
                hover:shadow-md
              `}
              onClick={() => handleStepClick(commandKey)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleStepClick(commandKey)
                }
              }}
            >
              <div className="flex items-center">
                {/* Step Number/Status Icon */}
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-4
                  ${stepStatus === 'completed' ? 'bg-green-600 text-white' : ''}
                  ${stepStatus === 'current' ? 'bg-blue-600 text-white' : ''}
                  ${stepStatus === 'pending' ? 'bg-gray-400 text-white' : ''}
                `}>
                  {stepStatus === 'completed' ? '✓' : stepNumber}
                </div>

                {/* Step Content */}
                <div className="flex-grow">
                  <h4 className={`
                    font-semibold
                    ${stepStatus === 'completed' ? 'text-green-900' : ''}
                    ${stepStatus === 'current' ? 'text-blue-900' : ''}
                    ${stepStatus === 'pending' ? 'text-gray-700' : ''}
                  `}>
                    Step {stepNumber}: Learn {commandKey.toUpperCase()} ({
                      commandKey === 'h' ? 'Left' :
                      commandKey === 'j' ? 'Down' :
                      commandKey === 'k' ? 'Up' :
                      'Right'
                    })
                  </h4>
                  
                  <p className={`
                    text-sm mt-1
                    ${stepStatus === 'completed' ? 'text-green-700' : ''}
                    ${stepStatus === 'current' ? 'text-blue-700' : ''}
                    ${stepStatus === 'pending' ? 'text-gray-600' : ''}
                  `}>
                    {objective.description}
                  </p>
                  
                  <div className={`
                    text-xs mt-2 flex items-center
                    ${stepStatus === 'completed' ? 'text-green-600' : ''}
                    ${stepStatus === 'current' ? 'text-blue-600' : ''}
                    ${stepStatus === 'pending' ? 'text-gray-500' : ''}
                  `}>
                    <span>⏱ {objective.estimatedTimeMinutes} min</span>
                    {stepStatus === 'current' && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Current
                      </span>
                    )}
                    {stepStatus === 'completed' && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* Command Key Display */}
                <div className={`
                  flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg border-2
                  ${stepStatus === 'completed' ? 'border-green-500 bg-green-100 text-green-800' : ''}
                  ${stepStatus === 'current' ? 'border-blue-500 bg-blue-100 text-blue-800' : ''}
                  ${stepStatus === 'pending' ? 'border-gray-300 bg-gray-100 text-gray-600' : ''}
                `}>
                  {commandKey}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress Summary */}
      <div className="progress-summary p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Path Progress
          </span>
          <span className="text-sm font-medium text-gray-700">
            {progress ? Math.round((progress.completedCommands.length / 4) * 100) : 0}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${progress ? Math.round((progress.completedCommands.length / 4) * 100) : 0}%` 
            }}
          />
        </div>
      </div>

      {/* Completion State */}
      {isComplete && (
        <div className="completion-state mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="text-center">
            <div className="text-2xl mb-2">🎓</div>
            <h4 className="text-lg font-bold text-green-900 mb-1">
              Learning Path Complete!
            </h4>
            <p className="text-green-700 text-sm mb-3">
              You've mastered all the HJKL movement commands. Great job!
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Ready for Advanced Movement
            </div>
          </div>
        </div>
      )}
    </div>
  )
}