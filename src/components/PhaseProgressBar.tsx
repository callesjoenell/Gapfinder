import { PHASES, PHASE_NAMES } from "../lib/phaseConfig";
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
 * Phase progress header showing:
 * 1. Current phase name + step indicator (e.g. "Step 2 of 7")
 * 2. Progress bar for current phase
 * 3. Next phase preview
 * 4. Research intensity with brief explanation
 * 5. Coverage topic dots
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
  const visiblePhases = PHASES.filter((p) => p.path === sessionPath);
  const currentIndex = visiblePhases.findIndex((p) => p.number === currentPhase);
  const nextPhase = currentIndex < visiblePhases.length - 1 ? visiblePhases[currentIndex + 1] : null;
  const currentPhaseName = PHASE_NAMES[currentPhase] || `Phase ${currentPhase}`;

  // Depth colors for topic dots
  const depthColors = {
    not_mentioned: "border border-gray-300 bg-white",
    surface: "bg-gray-300",
    moderate: "bg-blue-400",
    deep: "bg-blue-700",
  };

  const depthLabels = {
    not_mentioned: "Not covered yet",
    surface: "Briefly mentioned",
    moderate: "Discussed",
    deep: "Explored in depth",
  };

  const INTENSITY_HINTS: Record<string, string> = {
    low: "Only flags major unsupported claims",
    medium: "Flags claims, competitors & pain points",
    high: "Flags everything including assumptions",
  };

  return (
    <div className="px-4 py-3 bg-white border-b shadow-sm">
      {/* Row 1: Phase name + step count */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {currentPhaseName}
          </span>
          <span className="text-xs text-gray-400">
            Step {currentIndex + 1} of {visiblePhases.length}
          </span>
        </div>
        <span className="text-xs font-medium text-blue-600">
          {Math.round(currentProgress)}%
        </span>
      </div>

      {/* Row 2: Segmented progress — all phases as mini segments */}
      <div className="flex gap-0.5 mb-1.5">
        {visiblePhases.map((phase) => {
          const isComplete = phase.number < currentPhase;
          const isCurrent = phase.number === currentPhase;
          const isLocked = phase.number > currentPhase;

          return (
            <button
              key={phase.number}
              onClick={() => !isLocked && onPhaseClick(phase.number)}
              className={`relative h-1.5 flex-1 rounded-full transition-all duration-300 ${
                isComplete
                  ? "bg-green-500 hover:bg-green-600 cursor-pointer"
                  : isCurrent
                    ? "bg-blue-200 cursor-default"
                    : "bg-gray-200 cursor-default opacity-50"
              }`}
              title={`${PHASE_NAMES[phase.number]}${isComplete ? " (complete)" : isCurrent ? " (current)" : " (locked)"}`}
              aria-label={`${PHASE_NAMES[phase.number]} - ${isComplete ? "complete" : isCurrent ? "current" : "locked"}`}
            >
              {isCurrent && currentProgress > 0 && (
                <div
                  className="absolute inset-0 bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, currentProgress))}%` }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Row 3: Next phase preview + research control */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {nextPhase ? (
            <>Next: <span className="text-gray-500">{nextPhase.name}</span></>
          ) : (
            <span className="text-green-600">Final step</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ResearchIntensityControl
            sessionId={sessionId}
            currentIntensity={researchIntensity}
          />
        </div>
      </div>

      {/* Row 4: Research hint */}
      <div className="mt-1 text-[11px] text-gray-400 text-right">
        {INTENSITY_HINTS[researchIntensity]}
      </div>

      {/* Row 5: Coverage topic dots (current phase) */}
      {coverageTopics.length > 0 && (
        <div className="mt-2 flex items-center gap-2 justify-center flex-wrap">
          {coverageTopics.map((topic) => {
            const colorClass = depthColors[topic.depth as keyof typeof depthColors] || depthColors.not_mentioned;
            const depthLabel = depthLabels[topic.depth as keyof typeof depthLabels] || "Not covered";

            return (
              <div
                key={topic.key}
                className="flex items-center gap-1"
                title={`${topic.label}: ${depthLabel}`}
              >
                <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                <span className="text-[10px] text-gray-400">{topic.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
