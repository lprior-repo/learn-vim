import React from 'react';
import { VimMode } from '../domain/VimCommand';
import { 
  validateAndTransformMode, 
  getModeColorClasses, 
  formatModeForDisplay 
} from '../utils/ModeUtils';

interface ModeIndicatorProps {
  readonly mode: string;
  readonly className?: string;
}

/**
 * Pure functional component for displaying Vim mode
 * 
 * Principles applied:
 * - Single Responsibility: Only displays mode
 * - DRY: Uses centralized mode utilities
 * - Pure component: No side effects
 * - Type safety: Strong typing for props
 */
const ModeIndicator: React.FC<ModeIndicatorProps> = ({ mode, className = '' }) => {
  // Validate and normalize the mode using pure functions
  const validMode: VimMode = validateAndTransformMode(mode);
  const displayText = formatModeForDisplay(validMode);
  const colorClasses = getModeColorClasses(validMode);

  return (
    <div className={`font-bold ${className}`}>
      <span className="mr-2 text-neutral-300">Current Mode:</span>
      <span className={`inline-block py-1 px-3 rounded font-mono text-sm ${colorClasses}`}>
        {displayText}
      </span>
    </div>
  );
};

export default ModeIndicator;