import React, { useEffect, useRef, useState, useCallback } from 'react'
import { HjklMovementService } from '../services'
import { Position } from '../types'

interface HjklEditorProps {
  showPosition?: boolean
  learningMode?: boolean
  onMovement?: (key: string, success: boolean) => void
  onPositionChange?: (position: Position) => void
}

export const HjklEditor: React.FC<HjklEditorProps> = ({
  showPosition = false,
  learningMode = false,
  onMovement,
  onPositionChange
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const [movementService, setMovementService] = useState<HjklMovementService | null>(null)
  const [currentPosition, setCurrentPosition] = useState<Position>({ line: 0, column: 0 })
  const [isLoading, setIsLoading] = useState(true)

  // Initialize Monaco editor
  useEffect(() => {
    const initializeEditor = async () => {
      try {
        // Wait for Monaco to be available
        if (typeof window.monaco === 'undefined') {
          // Load Monaco if not available
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.1/min/vs/loader.js'
          script.onload = () => {
            // Continue with Monaco initialization
            loadMonaco()
          }
          document.head.appendChild(script)
        } else {
          loadMonaco()
        }
      } catch (error) {
        console.error('Failed to initialize HJKL editor:', error)
        setIsLoading(false)
      }
    }

    const loadMonaco = () => {
      if (editorRef.current && window.monaco) {
        try {
          const editor = window.monaco.editor.create(editorRef.current, {
            value: 'Practice HJKL movement here!\n\nUse:\n- h to move left\n- j to move down\n- k to move up  \n- l to move right\n\nTry moving around!',
            language: 'plaintext',
            theme: 'vs-dark',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            readOnly: false,
            lineNumbers: 'on',
            wordWrap: 'on'
          })

          const service = new HjklMovementService(editor)
          setMovementService(service)
          
          // Update position initially
          const initialPos = service.getCurrentPosition()
          setCurrentPosition(initialPos)
          onPositionChange?.(initialPos)
          
          setIsLoading(false)
        } catch (error) {
          console.error('Failed to create Monaco editor:', error)
          setIsLoading(false)
        }
      }
    }

    initializeEditor()

    return () => {
      // Cleanup editor on unmount
      if (movementService) {
        try {
          movementService.getEditor().dispose?.()
        } catch (error) {
          console.warn('Error disposing editor:', error)
        }
      }
    }
  }, [])

  // Handle key presses
  const handleKeyDown = useCallback(async (event: KeyboardEvent) => {
    const key = event.key.toLowerCase()
    
    // Only handle HJKL keys
    if (!['h', 'j', 'k', 'l'].includes(key)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    if (movementService) {
      try {
        const result = await movementService.executeMovement(key)
        
        // Update position
        const newPosition = movementService.getCurrentPosition()
        setCurrentPosition(newPosition)
        onPositionChange?.(newPosition)
        
        // Notify parent of movement
        onMovement?.(key, result.success)
        
        // Show feedback for learning mode
        if (learningMode && result.success) {
          showMovementFeedback(key)
        }
      } catch (error) {
        console.error('Movement execution failed:', error)
        onMovement?.(key, false)
      }
    }
  }, [movementService, learningMode, onMovement, onPositionChange])

  // Show movement feedback
  const showMovementFeedback = (key: string) => {
    const directions = {
      h: 'left',
      j: 'down', 
      k: 'up',
      l: 'right'
    }
    
    // Create temporary feedback element
    const feedback = document.createElement('div')
    feedback.textContent = `✓ Moved ${directions[key as keyof typeof directions]} successfully`
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4ade80;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `
    
    document.body.appendChild(feedback)
    
    setTimeout(() => {
      document.body.removeChild(feedback)
    }, 2000)
  }

  // Add event listener for key presses
  useEffect(() => {
    if (!isLoading && editorRef.current) {
      const editorElement = editorRef.current
      editorElement.addEventListener('keydown', handleKeyDown)
      
      // Focus the editor
      editorElement.focus()
      
      return () => {
        editorElement.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isLoading, handleKeyDown])

  if (isLoading) {
    return (
      <div data-testid="hjkl-editor" className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-2 text-white">Loading HJKL trainer...</span>
      </div>
    )
  }

  return (
    <div className="hjkl-editor-container">
      <div 
        data-testid="hjkl-editor"
        className="hjkl-editor relative"
      >
        <div 
          data-testid="editor-container"
          ref={editorRef}
          className="h-64 border border-gray-300 rounded-lg"
          tabIndex={0}
        />
        
        {showPosition && (
          <div className="position-display mt-2 text-sm text-gray-600">
            Line: {currentPosition.line + 1}, Column: {currentPosition.column + 1}
          </div>
        )}
        
        {learningMode && (
          <div data-testid="learning-mode-indicator" className="learning-mode-indicator mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Learning Mode
            </span>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}