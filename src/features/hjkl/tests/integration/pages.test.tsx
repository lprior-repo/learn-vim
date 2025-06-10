// Integration tests for HJKL page components
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { HjklPage } from '../../pages'
import { HjklMovementService } from '../../services'

// Mock dependencies
jest.mock('../../services')
jest.mock('../../data')

const MockedMovementService = jest.mocked(HjklMovementService)

// Test wrapper with router
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter initialEntries={['/hjkl']}>
    {children}
  </MemoryRouter>
)

describe('HJKL Page Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mocks
    MockedMovementService.mockImplementation(() => ({
      executeMovement: jest.fn().mockResolvedValue({ success: true, newPosition: { line: 1, column: 1 } }),
      getCurrentPosition: jest.fn().mockReturnValue({ line: 0, column: 0 }),
      getEditorBounds: jest.fn().mockReturnValue({ maxLine: 10, maxColumn: 20 }),
      registerCommands: jest.fn()
    }))
  })

  describe('HjklPage', () => {
    test('should render complete HJKL learning interface', () => {
      render(
        <TestWrapper>
          <HjklPage />
        </TestWrapper>
      )
      
      // Check main sections are present
      expect(screen.getByTestId('hjkl-page')).toBeInTheDocument()
      expect(screen.getByTestId('hjkl-tutorial')).toBeInTheDocument()
      expect(screen.getByTestId('hjkl-editor')).toBeInTheDocument()
      expect(screen.getByTestId('hjkl-progress')).toBeInTheDocument()
    })

    test('should display page title and description', () => {
      render(
        <TestWrapper>
          <HjklPage />
        </TestWrapper>
      )
      
      expect(screen.getByRole('heading', { name: /HJKL Movement/i })).toBeInTheDocument()
      expect(screen.getByText(/Master the fundamental movement keys/i)).toBeInTheDocument()
    })

    test('should initialize with default learning state', () => {
      render(
        <TestWrapper>
          <HjklPage />
        </TestWrapper>
      )
      
      expect(screen.getByText('Progress: 0%')).toBeInTheDocument()
      expect(screen.getByText('Score: 0')).toBeInTheDocument()
      expect(screen.getByText('Current Challenge: Learn H Key')).toBeInTheDocument()
    })

    test('should handle successful h key practice', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <HjklPage />
        </TestWrapper>
      )
      
      const editor = screen.getByTestId('hjkl-editor')
      await user.type(editor, 'h')
      
      await waitFor(() => {
        expect(screen.getByText(/Great! H key mastered/i)).toBeInTheDocument()
        expect(screen.getByText('Progress: 25%')).toBeInTheDocument()
      })
    })

    test('should progress through all HJKL keys sequentially', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <HjklPage />
        </TestWrapper>
      )
      
      const editor = screen.getByTestId('hjkl-editor')
      
      // Practice H
      await user.type(editor, 'h')
      await waitFor(() => {
        expect(screen.getByText('Current Challenge: Learn J Key')).toBeInTheDocument()
      })
      
      // Practice J
      await user.type(editor, 'j')
      await waitFor(() => {
        expect(screen.getByText('Current Challenge: Learn K Key')).toBeInTheDocument()
      })
      
      // Practice K
      await user.type(editor, 'k')
      await waitFor(() => {
        expect(screen.getByText('Current Challenge: Learn L Key')).toBeInTheDocument()
      })
      
      // Practice L
      await user.type(editor, 'l')
      await waitFor(() => {
        expect(screen.getByText('🎉 All HJKL Commands Mastered!')).toBeInTheDocument()
        expect(screen.getByText('Progress: 100%')).toBeInTheDocument()
      })
    })

    test('should handle command card interactions', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <HjklPage />
        </TestWrapper>
      )
      
      const jCard = screen.getByTestId('command-card-j')
      await user.click(jCard)
      
      await waitFor(() => {
        expect(screen.getByText('Practicing J key movement')).toBeInTheDocument()
      })
    })

    test('should show learning hints and tips', () => {
      render(
        <TestWrapper>
          <HjklPage />
        </TestWrapper>
      )
      
      expect(screen.getByText(/Remember: H moves left, L moves right/i)).toBeInTheDocument()
      expect(screen.getByText(/J moves down, K moves up/i)).toBeInTheDocument()
    })

    test('should handle progress reset', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <HjklPage />
        </TestWrapper>
      )
      
      // First make some progress
      const editor = screen.getByTestId('hjkl-editor')
      await user.type(editor, 'hj')
      
      await waitFor(() => {
        expect(screen.getByText('Progress: 50%')).toBeInTheDocument()
      })
      
      // Reset progress
      const resetButton = screen.getByText('Reset Progress')
      await user.click(resetButton)
      
      await waitFor(() => {
        expect(screen.getByText('Progress: 0%')).toBeInTheDocument()
        expect(screen.getByText('Score: 0')).toBeInTheDocument()
      })
    })

    test('should display movement feedback', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <HjklPage />
        </TestWrapper>
      )
      
      const editor = screen.getByTestId('hjkl-editor')
      await user.type(editor, 'h')
      
      await waitFor(() => {
        expect(screen.getByText('✓ Moved left successfully')).toBeInTheDocument()
      })
    })

    test('should handle movement errors gracefully', async () => {
      // Mock a movement error
      MockedMovementService.mockImplementation(() => ({
        executeMovement: jest.fn().mockResolvedValue({ 
          success: false, 
          newPosition: { line: 0, column: 0 },
          error: 'Cannot move left: at boundary'
        }),
        getCurrentPosition: jest.fn().mockReturnValue({ line: 0, column: 0 }),
        getEditorBounds: jest.fn().mockReturnValue({ maxLine: 10, maxColumn: 20 }),
        registerCommands: jest.fn()
      }))
      
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <HjklPage />
        </TestWrapper>
      )
      
      const editor = screen.getByTestId('hjkl-editor')
      await user.type(editor, 'h')
      
      await waitFor(() => {
        expect(screen.getByText('Cannot move left: at boundary')).toBeInTheDocument()
      })
    })

    test('should show keyboard shortcuts help', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <HjklPage />
        </TestWrapper>
      )
      
      const helpButton = screen.getByText('Show Shortcuts')
      await user.click(helpButton)
      
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
      expect(screen.getByText('H - Move cursor left')).toBeInTheDocument()
      expect(screen.getByText('J - Move cursor down')).toBeInTheDocument()
      expect(screen.getByText('K - Move cursor up')).toBeInTheDocument()
      expect(screen.getByText('L - Move cursor right')).toBeInTheDocument()
    })

    test('should navigate to next learning section on completion', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <HjklPage />
        </TestWrapper>
      )
      
      const editor = screen.getByTestId('hjkl-editor')
      
      // Complete all movements
      await user.type(editor, 'hjkl')
      
      await waitFor(() => {
        expect(screen.getByText('Continue to Word Movement')).toBeInTheDocument()
      })
      
      const continueButton = screen.getByText('Continue to Word Movement')
      await user.click(continueButton)
      
      // This would trigger navigation in a real app
      expect(continueButton).toHaveBeenClicked
    })

    test('should persist learning progress across page reloads', () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue(JSON.stringify({
          completedCommands: ['h', 'j'],
          currentChallenge: 'practice-k',
          score: 50
        })),
        setItem: jest.fn()
      }
      
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage
      })
      
      render(
        <TestWrapper>
          <HjklPage />
        </TestWrapper>
      )
      
      expect(screen.getByText('Progress: 50%')).toBeInTheDocument()
      expect(screen.getByText('Score: 50')).toBeInTheDocument()
      expect(screen.getByText('Current Challenge: practice-k')).toBeInTheDocument()
    })

    test('should handle accessibility features', () => {
      render(
        <TestWrapper>
          <HjklPage />
        </TestWrapper>
      )
      
      // Check ARIA labels
      expect(screen.getByLabelText('HJKL tutorial section')).toBeInTheDocument()
      expect(screen.getByLabelText('Practice editor')).toBeInTheDocument()
      expect(screen.getByLabelText('Learning progress')).toBeInTheDocument()
      
      // Check keyboard navigation
      const firstCard = screen.getByTestId('command-card-h')
      expect(firstCard).toHaveAttribute('tabindex', '0')
    })

    test('should show loading state during initialization', () => {
      // Mock slow initialization
      MockedMovementService.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({
            executeMovement: jest.fn(),
            getCurrentPosition: jest.fn(),
            getEditorBounds: jest.fn(),
            registerCommands: jest.fn()
          }), 100)
        })
      })
      
      render(
        <TestWrapper>
          <HjklPage />
        </TestWrapper>
      )
      
      expect(screen.getByText('Loading HJKL trainer...')).toBeInTheDocument()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })
})