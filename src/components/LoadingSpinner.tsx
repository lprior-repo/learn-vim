import React from "react";
import { Transition } from "@headlessui/react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  className?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "medium", className = "", fullScreen = false }) => {
  const sizeClasses = {
    small: "h-6 w-6 border-2",
    medium: "h-12 w-12 border-3",
    large: "h-16 w-16 border-4",
  };

  const spinner = (
    <Transition
      appear={true}
      show={true}
      enter="transition-opacity duration-500"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-500"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className={`relative ${className}`} data-testid="loading-spinner">
        <div
          className={`
            animate-spin rounded-full
            border-t-blue-400 border-r-blue-400
            border-b-transparent border-l-transparent
            ${sizeClasses[size]}
          `}
        />
      </div>
    </Transition>
  );

  if (fullScreen) {
    return <div className="fixed inset-0 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm">{spinner}</div>;
  }

  return spinner;
};

export default LoadingSpinner;
