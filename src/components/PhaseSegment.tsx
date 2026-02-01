import { PHASE_NAMES } from "../lib/phaseConfig";

interface PhaseSegmentProps {
  phase: number;
  state: "locked" | "current" | "complete";
  progress?: number; // 0-100 for current phase only
  onClick: () => void;
  onLockedClick: () => void;
}

/**
 * Individual phase segment with three visual states:
 * - locked: gray background, lock icon, not clickable for navigation
 * - current: blue background with partial fill overlay showing progress
 * - complete: green background, clickable to scroll to phase
 */
export function PhaseSegment({
  phase,
  state,
  progress = 0,
  onClick,
  onLockedClick,
}: PhaseSegmentProps) {
  const phaseName = PHASE_NAMES[phase] || `Phase ${phase}`;

  const handleClick = () => {
    if (state === "locked") {
      onLockedClick();
    } else {
      onClick();
    }
  };

  // Base classes for all states
  const baseClasses =
    "relative h-2 flex-1 rounded-sm transition-all duration-300";

  // State-specific classes
  const stateClasses = {
    locked: "bg-gray-200 cursor-not-allowed opacity-50",
    current: "bg-blue-400",
    complete: "bg-green-500 hover:bg-green-600 cursor-pointer",
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Lock icon for locked phases */}
      {state === "locked" && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <svg
            className="w-3 h-3 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      <button
        onClick={handleClick}
        className={`${baseClasses} ${stateClasses[state]}`}
        title={phaseName}
        aria-label={`${phaseName} - ${state}`}
      >
        {/* Partial fill overlay for current phase */}
        {state === "current" && progress > 0 && (
          <div
            className="absolute inset-0 bg-blue-600 rounded-sm transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        )}
      </button>
    </div>
  );
}
