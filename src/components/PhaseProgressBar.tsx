import { toast } from "sonner";
import { PHASES, PHASE_NAMES } from "../lib/phaseConfig";
import { PhaseSegment } from "./PhaseSegment";
import { ResearchIntensityControl } from "./ResearchIntensityControl";
import type { Id } from "../../convex/_generated/dataModel";
import type { TopicDepth } from "../hooks/useCoverageState";

interface PhaseProgressBarProps {
  sessionId: Id<"sessions">;
  currentPhase: number;
  currentProgress: number; // 0-100
  sessionPath: "exploration" | "evaluation";
  onPhaseClick: (phase: number) => void;
  coverageTopics?: TopicDepth[];
  researchIntensity?: "low" | "medium" | "high";
}

/**
 * Segmented progress bar showing all phases for the current session path.
 * - Exploration sessions show phases 0-3
 * - Evaluation sessions show phases 4-9
 */
export function PhaseProgressBar({
  sessionId,
  currentPhase,
  currentProgress,
  sessionPath,
  onPhaseClick,
  coverageTopics = [],
  researchIntensity = "medium",
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

  // Depth symbol mapping
  const depthSymbols = {
    not_mentioned: "○",
    surface: "◔",
    moderate: "◑",
    deep: "●",
  };

  // Depth colors for dots
  const depthColors = {
    not_mentioned: "border-2 border-gray-300 bg-white",
    surface: "bg-gray-300",
    moderate: "bg-gray-500",
    deep: "bg-gray-800",
  };

  return (
    <div className="px-4 py-3 bg-white border-b shadow-sm">
      {/* Header row with phase name and research intensity control */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-700">
          Phase {currentPhase}: {currentPhaseName}
        </div>
        <ResearchIntensityControl
          sessionId={sessionId}
          currentIntensity={researchIntensity}
        />
      </div>

      {/* Segmented progress bar */}
      <div className="flex gap-1">
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

      {/* Sub-topic coverage dots (for current phase only) */}
      {coverageTopics.length > 0 && (
        <div className="mt-2 flex items-center gap-1 justify-center">
          {coverageTopics.map((topic) => {
            const symbol = depthSymbols[topic.depth as keyof typeof depthSymbols] || "○";
            const colorClass = depthColors[topic.depth as keyof typeof depthColors] || depthColors.not_mentioned;

            return (
              <div
                key={topic.key}
                className={`w-2 h-2 rounded-full ${colorClass}`}
                title={`${topic.label}: ${symbol} ${topic.depth.replace('_', ' ')}`}
                aria-label={`${topic.label}: ${topic.depth.replace('_', ' ')}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
