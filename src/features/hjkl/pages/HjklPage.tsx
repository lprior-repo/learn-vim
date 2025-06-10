import React, { useState, useEffect, useCallback } from 'react'
import { HjklEditor, HjklTutorial, HjklProgress, HjklLearningPath } from '../components'
import { LearningProgress, Position } from '../types'
import { ProgressService } from '../services'

interface HjklPageState {
  progress: LearningProgress
  currentPosition: Position
  isLoading: boolean
  showShortcuts: boolean
  feedback: string | null
}

export const HjklPage: React.FC = () => {
  const [state, setState] = useState<HjklPageState>({
    progress: {
      completedCommands: [],
      currentChallenge: 'Learn H Key',
      score: 0
    },
    currentPosition: { line: 0, column: 0 },
    isLoading: true,
    showShortcuts: false,
    feedback: null
  })

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = () => {
      try {
        const savedProgress = ProgressService.loadProgress()
        if (savedProgress) {
          setState(prev => ({
            ...prev,
            progress: savedProgress,
            isLoading: false
          }))
        } else {
          setState(prev => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        console.error('Failed to load progress:', error)
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }

    loadProgress()
  }, [])

  // Save progress whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      ProgressService.saveProgress(state.progress)
    }
  }, [state.progress, state.isLoading])

  // Handle movement from editor
  const handleMovement = useCallback((key: string, success: boolean) => {
    setState(prev => {
      if (!success) {
        // Show error feedback
        const errorMessages = {
          h: 'Cannot move left: at boundary',
          j: 'Cannot move down: at boundary',
          k: 'Cannot move up: at boundary',
          l: 'Cannot move right: at boundary'
        }
        
        return {
          ...prev,
          feedback: errorMessages[key as keyof typeof errorMessages] || 'Movement failed'
        }
      }

      // Update progress for successful movement
      const wasAlreadyCompleted = prev.progress.completedCommands.includes(key)
      if (wasAlreadyCompleted) {
        return {
          ...prev,
          feedback: `✓ Moved ${key === 'h' ? 'left' : key === 'j' ? 'down' : key === 'k' ? 'up' : 'right'} successfully`
        }
      }

      const newCompletedCommands = [...prev.progress.completedCommands, key]
      const newScore = newCompletedCommands.length * 25 // 25 points per command
      
      // Determine next challenge
      let nextChallenge: string | null = null
      const challengeMap = {
        0: 'Learn H Key',
        1: 'Learn J Key', 
        2: 'Learn K Key',
        3: 'Learn L Key'
      }
      
      nextChallenge = challengeMap[newCompletedCommands.length as keyof typeof challengeMap] || null

      const newProgress: LearningProgress = {
        completedCommands: newCompletedCommands,
        currentChallenge: nextChallenge,
        score: newScore
      }

      // Show success feedback
      const successMessage = newCompletedCommands.length === 4 
        ? `🎉 All HJKL Commands Mastered!`
        : `Great! ${key.toUpperCase()} key mastered`

      return {
        ...prev,
        progress: newProgress,
        feedback: successMessage
      }
    })

    // Clear feedback after 3 seconds
    setTimeout(() => {
      setState(prev => ({ ...prev, feedback: null }))
    }, 3000)
  }, [])

  // Handle position changes
  const handlePositionChange = useCallback((position: Position) => {
    setState(prev => ({
      ...prev,
      currentPosition: position
    }))
  }, [])

  // Handle command selection from tutorial
  const handleCommandSelect = useCallback((command: string) => {
    setState(prev => ({
      ...prev,
      feedback: `Practicing ${command.toUpperCase()} key movement`
    }))

    // Clear feedback after 2 seconds
    setTimeout(() => {
      setState(prev => ({ ...prev, feedback: null }))
    }, 2000)
  }, [])

  // Handle step selection from learning path
  const handleStepSelect = useCallback((command: string) => {
    setState(prev => ({
      ...prev,
      feedback: `Practicing ${command.toUpperCase()} key movement`
    }))

    // Clear feedback after 2 seconds
    setTimeout(() => {
      setState(prev => ({ ...prev, feedback: null }))
    }, 2000)
  }, [])

  // Reset progress
  const handleResetProgress = useCallback(() => {
    const resetProgress: LearningProgress = {
      completedCommands: [],
      currentChallenge: 'Learn H Key',
      score: 0
    }

    setState(prev => ({
      ...prev,
      progress: resetProgress,
      feedback: 'Progress reset successfully'
    }))

    ProgressService.clearProgress()

    // Clear feedback after 2 seconds
    setTimeout(() => {
      setState(prev => ({ ...prev, feedback: null }))
    }, 2000)
  }, [])

  // Toggle shortcuts help
  const toggleShortcuts = useCallback(() => {
    setState(prev => ({
      ...prev,
      showShortcuts: !prev.showShortcuts
    }))
  }, [])

  if (state.isLoading) {
    return (
      <div className="hjkl-page flex items-center justify-center min-h-screen">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading HJKL trainer...</span>
      </div>
    )
  }

  const isComplete = state.progress.completedCommands.length === 4

  return (
    <div data-testid="hjkl-page" className="hjkl-page min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            HJKL Movement Training
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Master the fundamental movement keys in Vim. Learn to navigate efficiently using h, j, k, and l keys.
          </p>
        </header>

        {/* Feedback Messages */}
        {state.feedback && (
          <div className="feedback-message fixed top-4 right-4 z-50 p-4 bg-blue-600 text-white rounded-lg shadow-lg max-w-sm">
            {state.feedback}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tutorial and Learning Path */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tutorial Section */}
            <section>
              <HjklTutorial 
                progress={state.progress}
                onCommandSelect={handleCommandSelect}
              />
            </section>

            {/* Editor Section */}
            <section>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Practice Editor
                </h2>
                <HjklEditor
                  showPosition={true}
                  learningMode={true}
                  onMovement={handleMovement}
                  onPositionChange={handlePositionChange}
                />
              </div>
            </section>

            {/* Learning Path Section */}
            <section>
              <HjklLearningPath
                progress={state.progress}
                onStepSelect={handleStepSelect}
              />
            </section>
          </div>

          {/* Right Column - Progress and Help */}
          <div className="space-y-6">
            {/* Progress Section */}
            <section>
              <HjklProgress
                progress={state.progress}
                onReset={handleResetProgress}
              />
            </section>

            {/* Help Section */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Help
                </h3>
                <button
                  onClick={toggleShortcuts}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {state.showShortcuts ? 'Hide' : 'Show'} Shortcuts
                </button>
              </div>

              {state.showShortcuts && (
                <div className="shortcuts-help">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Keyboard Shortcuts
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">H</span>
                      <span className="text-gray-600">Move cursor left</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">J</span>
                      <span className="text-gray-600">Move cursor down</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">K</span>
                      <span className="text-gray-600">Move cursor up</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">L</span>
                      <span className="text-gray-600">Move cursor right</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="tips-section mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">
                  Learning Tips
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Focus on one key at a time</li>
                  <li>• Practice regularly for muscle memory</li>
                  <li>• Don't use arrow keys while learning</li>
                </ul>
              </div>
            </section>

            {/* Next Steps */}
            {isComplete && (
              <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  What's Next?
                </h3>
                <p className="text-green-700 text-sm mb-4">
                  Great job mastering HJKL! Ready to learn more advanced Vim movements?
                </p>
                <button
                  onClick={() => {
                    // This would navigate to word movement page in a real app
                    setState(prev => ({
                      ...prev,
                      feedback: 'Navigate to word movement training'
                    }))
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Continue to Word Movement
                </button>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}