import { toast } from "sonner";
import { PHASES, PHASE_NAMES } from "../lib/phaseConfig";
import { PhaseSegment } from "./PhaseSegment";

interface PhaseProgressBarProps {
  currentPhase: number;
  currentProgress: number; // 0-100
  sessionPath: "exploration" | "evaluation";
  onPhaseClick: (phase: number) => void;
}

/**
 * Segmented progress bar showing all phases for the current session path.
 * - Exploration sessions show phases 0-3
 * - Evaluation sessions show phases 4-9
 */
export function PhaseProgressBar({
  currentPhase,
  currentProgress,
  sessionPath,
  onPhaseClick,
}: PhaseProgressBarProps) {
  // Filter phases by session path
  const visiblePhases = PHASES.filter((p) => p.path === sessionPath);

  const handleLockedClick = (phase: number) => {
    const phaseName = PHASE_NAMES[phase] || `Phase ${phase}`;
    const currentPhaseName = PHASE_NAMES[currentPhase] || `Phase ${currentPhase}`;

    toast.info(`Complete Phase ${currentPhase} (${currentPhaseName}) first`, {
      id: `locked-phase-${phase}`,
      description: `${phaseName} will unlock after you complete the current phase.`,
      duration: 4000,
    });
  };

  const handlePhaseClick = (phase: number) => {
    // For completed phases, trigger the click handler (will scroll in Plan 02)
    // For now, just console.log as placeholder
    console.log(`Phase ${phase} clicked - scroll to phase boundary (placeholder)`);
    onPhaseClick(phase);
  };

  // Determine state for each phase
  const getPhaseState = (phaseNumber: number): "locked" | "current" | "complete" => {
    if (phaseNumber < currentPhase) return "complete";
    if (phaseNumber === currentPhase) return "current";
    return "locked";
  };

  // Get current phase name for display
  const currentPhaseName = PHASE_NAMES[currentPhase] || `Phase ${currentPhase}`;

  return (
    <div className="px-4 py-3 bg-white border-b shadow-sm">
      {/* Segmented progress bar */}
      <div className="flex gap-1 pt-3">
        {visiblePhases.map((phase) => (
          <PhaseSegment
            key={phase.number}
            phase={phase.number}
            state={getPhaseState(phase.number)}
            progress={phase.number === currentPhase ? currentProgress : 0}
            onClick={() => handlePhaseClick(phase.number)}
            onLockedClick={() => handleLockedClick(phase.number)}
          />
        ))}
      </div>

      {/* Current phase name */}
      <div className="mt-2 text-sm font-medium text-gray-700 text-center">
        Phase {currentPhase}: {currentPhaseName}
      </div>
    </div>
  );
}
