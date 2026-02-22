import { PHASES } from "../lib/phaseConfig";
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
 * Phase progress header:
 * Row 1: Phase names as text (blue = done/current, gray = upcoming) + research trigger sensitivity
 */
export function PhaseProgressBar({
  sessionId,
  currentPhase,
  sessionPath,
  onPhaseClick,
  researchIntensity = "medium",
}: PhaseProgressBarProps) {
  const visiblePhases = PHASES.filter((p) => p.path === sessionPath);
  const currentIndex = visiblePhases.findIndex((p) => p.number === currentPhase);

  return (
    <div className="px-4 py-2.5 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Left: phase names as text breadcrumbs */}
        <div className="flex items-center gap-1 min-w-0 flex-wrap">
          {visiblePhases.map((phase, i) => {
            const isComplete = phase.number < currentPhase;
            const isCurrent = phase.number === currentPhase;

            return (
              <div key={phase.number} className="flex items-center">
                <button
                  onClick={() => (isComplete || isCurrent) ? onPhaseClick(phase.number) : undefined}
                  className={`text-xs whitespace-nowrap transition-colors ${
                    isCurrent
                      ? "font-semibold text-blue-600"
                      : isComplete
                        ? "font-medium text-blue-500 hover:text-blue-700 cursor-pointer"
                        : "font-normal text-gray-300"
                  }`}
                  disabled={!isComplete && !isCurrent}
                >
                  {phase.name}
                </button>
                {i < visiblePhases.length - 1 && (
                  <span className={`mx-1 text-[10px] ${i < currentIndex ? "text-blue-300" : "text-gray-200"}`}>
                    &rsaquo;
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: research trigger sensitivity */}
        <ResearchIntensityControl
          sessionId={sessionId}
          currentIntensity={researchIntensity}
          label="Research trigger sensitivity"
        />
      </div>
    </div>
  );
}
