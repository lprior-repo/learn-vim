// Integration tests for HJKL React components
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { 
  HjklEditor, 
  HjklTutorial, 
  HjklProgress,
  HjklCommandCard,
  HjklLearningPath 
} from '../../components'
import { HjklMovementService } from '../../services'
import { Position, LearningProgress } from '../../types'

// Mock the HjklMovementService
jest.mock('../../services', () => ({
  HjklMovementService: jest.fn().mockImplementation(() => ({
    executeMovement: jest.fn(),
    getCurrentPosition: jest.fn(),
    getEditorBounds: jest.fn(),
    registerCommands: jest.fn()
  }))
}))

describe('HJKL Component Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('HjklEditor', () => {
    test('should render editor with Monaco integration', async () => {
      render(<HjklEditor />)
      
      expect(screen.getByTestId('hjkl-editor')).toBeInTheDocument()
      expect(screen.getByTestId('editor-container')).toBeInTheDocument()
    })

    test('should handle h key press', async () => {
      const user = userEvent.setup()
      render(<HjklEditor />)
      
      const editor = screen.getByTestId('hjkl-editor')
      await user.type(editor, 'h')
      
      // Verify movement service was called
      await waitFor(() => {
        const mockService = jest.mocked(HjklMovementService).mock.instances[0]
        expect(mockService.executeMovement).toHaveBeenCalledWith('h')
      })
    })

    test('should handle j key press', async () => {
      const user = userEvent.setup()
      render(<HjklEditor />)
      
      const editor = screen.getByTestId('hjkl-editor')
      await user.type(editor, 'j')
      
      await waitFor(() => {
        const mockService = jest.mocked(HjklMovementService).mock.instances[0]
        expect(mockService.executeMovement).toHaveBeenCalledWith('j')
      })
    })

    test('should handle k key press', async () => {
      const user = userEvent.setup()
      render(<HjklEditor />)
      
      const editor = screen.getByTestId('hjkl-editor')
      await user.type(editor, 'k')
      
      await waitFor(() => {
        const mockService = jest.mocked(HjklMovementService).mock.instances[0]
        expect(mockService.executeMovement).toHaveBeenCalledWith('k')
      })
    })

    test('should handle l key press', async () => {
      const user = userEvent.setup()
      render(<HjklEditor />)
      
      const editor = screen.getByTestId('hjkl-editor')
      await user.type(editor, 'l')
      
      await waitFor(() => {
        const mockService = jest.mocked(HjklMovementService).mock.instances[0]
        expect(mockService.executeMovement).toHaveBeenCalledWith('l')
      })
    })

    test('should ignore non-hjkl keys', async () => {
      const user = userEvent.setup()
      render(<HjklEditor />)
      
      const editor = screen.getByTestId('hjkl-editor')
      await user.type(editor, 'abcd')
      
      await waitFor(() => {
        const mockService = jest.mocked(HjklMovementService).mock.instances[0]
        expect(mockService.executeMovement).not.toHaveBeenCalled()
      })
    })

    test('should display current position', async () => {
      const mockService = {
        executeMovement: jest.fn(),
        getCurrentPosition: jest.fn().mockReturnValue({ line: 5, column: 10 }),
        getEditorBounds: jest.fn(),
        registerCommands: jest.fn()
      }
      
      jest.mocked(HjklMovementService).mockImplementation(() => mockService)
      
      render(<HjklEditor showPosition={true} />)
      
      expect(screen.getByText('Line: 6, Column: 11')).toBeInTheDocument() // 1-based display
    })

    test('should handle learning mode toggle', async () => {
      const user = userEvent.setup()
      render(<HjklEditor learningMode={true} />)
      
      expect(screen.getByTestId('learning-mode-indicator')).toBeInTheDocument()
      expect(screen.getByText('Learning Mode')).toBeInTheDocument()
    })
  })

  describe('HjklTutorial', () => {
    test('should render all HJKL command cards', () => {
      render(<HjklTutorial />)
      
      expect(screen.getByText('h - Move Left')).toBeInTheDocument()
      expect(screen.getByText('j - Move Down')).toBeInTheDocument()
      expect(screen.getByText('k - Move Up')).toBeInTheDocument()
      expect(screen.getByText('l - Move Right')).toBeInTheDocument()
    })

    test('should handle command card interactions', async () => {
      const onCommandSelect = jest.fn()
      const user = userEvent.setup()
      
      render(<HjklTutorial onCommandSelect={onCommandSelect} />)
      
      const hCard = screen.getByTestId('command-card-h')
      await user.click(hCard)
      
      expect(onCommandSelect).toHaveBeenCalledWith('h')
    })

    test('should show tutorial progress', () => {
      const progress: LearningProgress = {
        completedCommands: ['h', 'j'],
        currentChallenge: 'basic-movement',
        score: 20
      }
      
      render(<HjklTutorial progress={progress} />)
      
      expect(screen.getByText('Progress: 50%')).toBeInTheDocument() // 2/4 commands
      expect(screen.getByText('Score: 20')).toBeInTheDocument()
    })

    test('should highlight completed commands', () => {
      const progress: LearningProgress = {
        completedCommands: ['h'],
        currentChallenge: 'basic-movement',
        score: 10
      }
      
      render(<HjklTutorial progress={progress} />)
      
      const hCard = screen.getByTestId('command-card-h')
      expect(hCard).toHaveClass('completed')
    })

    test('should show next challenge hint', () => {
      const progress: LearningProgress = {
        completedCommands: ['h'],
        currentChallenge: 'practice-j',
        score: 10
      }
      
      render(<HjklTutorial progress={progress} />)
      
      expect(screen.getByText('Next: Try the j key to move down')).toBeInTheDocument()
    })
  })

  describe('HjklProgress', () => {
    test('should display progress statistics', () => {
      const progress: LearningProgress = {
        completedCommands: ['h', 'j', 'k'],
        currentChallenge: 'master-l',
        score: 75
      }
      
      render(<HjklProgress progress={progress} />)
      
      expect(screen.getByText('3 / 4 Commands Mastered')).toBeInTheDocument()
      expect(screen.getByText('Score: 75')).toBeInTheDocument()
      expect(screen.getByText('Current Challenge: master-l')).toBeInTheDocument()
    })

    test('should show completion celebration', () => {
      const progress: LearningProgress = {
        completedCommands: ['h', 'j', 'k', 'l'],
        currentChallenge: null,
        score: 100
      }
      
      render(<HjklProgress progress={progress} />)
      
      expect(screen.getByText('🎉 All HJKL Commands Mastered!')).toBeInTheDocument()
      expect(screen.getByText('Perfect Score: 100')).toBeInTheDocument()
    })

    test('should display progress bar correctly', () => {
      const progress: LearningProgress = {
        completedCommands: ['h', 'j'],
        currentChallenge: 'practice-k',
        score: 50
      }
      
      render(<HjklProgress progress={progress} />)
      
      const progressBar = screen.getByTestId('progress-bar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '50')
      expect(progressBar).toHaveStyle('width: 50%')
    })

    test('should handle reset progress action', async () => {
      const onReset = jest.fn()
      const user = userEvent.setup()
      
      const progress: LearningProgress = {
        completedCommands: ['h'],
        currentChallenge: 'practice-j',
        score: 25
      }
      
      render(<HjklProgress progress={progress} onReset={onReset} />)
      
      const resetButton = screen.getByText('Reset Progress')
      await user.click(resetButton)
      
      expect(onReset).toHaveBeenCalled()
    })
  })

  describe('HjklCommandCard', () => {
    test('should render command information', () => {
      render(
        <HjklCommandCard 
          command="h" 
          description="Move cursor left" 
          isCompleted={false}
        />
      )
      
      expect(screen.getByText('h')).toBeInTheDocument()
      expect(screen.getByText('Move cursor left')).toBeInTheDocument()
    })

    test('should show completed state', () => {
      render(
        <HjklCommandCard 
          command="j" 
          description="Move cursor down" 
          isCompleted={true}
        />
      )
      
      const card = screen.getByTestId('command-card-j')
      expect(card).toHaveClass('completed')
      expect(screen.getByText('✓')).toBeInTheDocument()
    })

    test('should handle click events', async () => {
      const onClick = jest.fn()
      const user = userEvent.setup()
      
      render(
        <HjklCommandCard 
          command="k" 
          description="Move cursor up" 
          isCompleted={false}
          onClick={onClick}
        />
      )
      
      const card = screen.getByTestId('command-card-k')
      await user.click(card)
      
      expect(onClick).toHaveBeenCalledWith('k')
    })

    test('should show hover effects', async () => {
      const user = userEvent.setup()
      
      render(
        <HjklCommandCard 
          command="l" 
          description="Move cursor right" 
          isCompleted={false}
        />
      )
      
      const card = screen.getByTestId('command-card-l')
      await user.hover(card)
      
      expect(card).toHaveClass('hover')
    })
  })

  describe('HjklLearningPath', () => {
    test('should render learning objectives', () => {
      render(<HjklLearningPath />)
      
      expect(screen.getByText('HJKL Movement Basics')).toBeInTheDocument()
      expect(screen.getByText('Master the fundamental movement keys')).toBeInTheDocument()
      
      expect(screen.getByText('Step 1: Learn H (Left)')).toBeInTheDocument()
      expect(screen.getByText('Step 2: Learn J (Down)')).toBeInTheDocument()
      expect(screen.getByText('Step 3: Learn K (Up)')).toBeInTheDocument()
      expect(screen.getByText('Step 4: Learn L (Right)')).toBeInTheDocument()
    })

    test('should track learning progress through steps', () => {
      const progress: LearningProgress = {
        completedCommands: ['h', 'j'],
        currentChallenge: 'practice-k',
        score: 50
      }
      
      render(<HjklLearningPath progress={progress} />)
      
      expect(screen.getByTestId('step-h')).toHaveClass('completed')
      expect(screen.getByTestId('step-j')).toHaveClass('completed')
      expect(screen.getByTestId('step-k')).toHaveClass('current')
      expect(screen.getByTestId('step-l')).toHaveClass('pending')
    })

    test('should navigate to specific steps', async () => {
      const onStepSelect = jest.fn()
      const user = userEvent.setup()
      
      render(<HjklLearningPath onStepSelect={onStepSelect} />)
      
      const stepK = screen.getByTestId('step-k')
      await user.click(stepK)
      
      expect(onStepSelect).toHaveBeenCalledWith('k')
    })

    test('should show completion state', () => {
      const progress: LearningProgress = {
        completedCommands: ['h', 'j', 'k', 'l'],
        currentChallenge: null,
        score: 100
      }
      
      render(<HjklLearningPath progress={progress} />)
      
      expect(screen.getByText('🎓 Learning Path Complete!')).toBeInTheDocument()
      expect(screen.getByText('Ready for Advanced Movement')).toBeInTheDocument()
    })
  })
})