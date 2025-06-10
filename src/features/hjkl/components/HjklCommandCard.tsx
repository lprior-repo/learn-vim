import React, { useState } from 'react'

interface HjklCommandCardProps {
  command: string
  description: string
  isCompleted: boolean
  onClick?: (command: string) => void
}

export const HjklCommandCard: React.FC<HjklCommandCardProps> = ({
  command,
  description,
  isCompleted,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    onClick?.(command)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      data-testid={`command-card-${command}`}
      className={`
        command-card relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
        ${isCompleted ? 'completed border-green-500 bg-green-50' : 'border-gray-300 bg-white'}
        ${isHovered ? 'hover shadow-lg transform scale-105' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Practice ${command} key - ${description}`}
    >
      {/* Completion checkmark */}
      {isCompleted && (
        <div className="absolute top-2 right-2 text-green-600">
          <span className="text-lg font-bold">✓</span>
        </div>
      )}

      {/* Command key */}
      <div className="command-key text-center mb-2">
        <span className={`
          inline-flex items-center justify-center w-12 h-12 rounded-lg text-xl font-bold
          ${isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}
        `}>
          {command}
        </span>
      </div>

      {/* Description */}
      <div className="command-description text-center">
        <p className={`text-sm ${isCompleted ? 'text-green-800' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>

      {/* Hover effect indicator */}
      {isHovered && !isCompleted && (
        <div className="absolute inset-0 bg-blue-50 rounded-lg opacity-50 pointer-events-none" />
      )}
    </div>
  )
}