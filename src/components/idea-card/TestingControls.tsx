/**
 * TestingControls - Dev mode navigation for testing visual states
 * Only renders when ?testMode=true URL parameter is present
 */

import { useEffect } from 'react';

interface TestingControlsProps {
  currentTestPhase: number;
  onPhaseChange: (phase: number) => void;
}

export function TestingControls({
  currentTestPhase,
  onPhaseChange,
}: TestingControlsProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPhaseChange(Math.max(0, currentTestPhase - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onPhaseChange(Math.min(9, currentTestPhase + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTestPhase, onPhaseChange]);

  return (
    <div
      className="fixed bottom-4 left-4 z-30 bg-black/70 text-white rounded-lg p-3 flex items-center gap-3 shadow-lg"
      role="toolbar"
      aria-label="Testing controls"
    >
      {/* Left arrow button */}
      <button
        onClick={() => onPhaseChange(Math.max(0, currentTestPhase - 1))}
        disabled={currentTestPhase === 0}
        className="p-2 hover:bg-white/20 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous phase"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="text-white"
        >
          <path
            d="M12.5 15L7.5 10L12.5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Phase display */}
      <div className="text-sm font-medium min-w-[120px] text-center">
        Test Phase: {currentTestPhase}
      </div>

      {/* Right arrow button */}
      <button
        onClick={() => onPhaseChange(Math.min(9, currentTestPhase + 1))}
        disabled={currentTestPhase === 9}
        className="p-2 hover:bg-white/20 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next phase"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="text-white"
        >
          <path
            d="M7.5 15L12.5 10L7.5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Keyboard hint */}
      <div className="text-xs text-white/60 ml-2 border-l border-white/30 pl-3">
        ← → to navigate
      </div>
    </div>
  );
}
