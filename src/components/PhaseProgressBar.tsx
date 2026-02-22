import { PHASE_NAMES } from "../lib/phaseConfig";
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

// 5 levels from gray to teal
const DEPTH_STYLES: Record<string, string> = {
  not_mentioned: "bg-gray-100 text-gray-400",
  surface:       "bg-primary-50 text-primary-400",
  moderate:      "bg-primary-100 text-primary-600",
  deep:          "bg-primary-200 text-primary-700 font-medium",
};

const DEPTH_LABELS: Record<string, string> = {
  not_mentioned: "Not yet covered",
  surface:       "Briefly touched",
  moderate:      "Discussed",
  deep:          "Explored in depth",
};

/**
 * Shows topics within the current phase as non-linear pills.
 * Color intensity = depth of coverage (gray → teal gradient).
 */
export function PhaseProgressBar({
  sessionId,
  currentPhase,
  coverageTopics = [],
  researchIntensity = "medium",
}: PhaseProgressBarProps) {
  const currentPhaseName = PHASE_NAMES[currentPhase] || `Phase ${currentPhase}`;

  return (
    <div className="px-4 py-2 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Left: topic pills with depth-based coloring */}
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          {coverageTopics.length > 0 ? (
            <>
              {coverageTopics.map((topic) => {
                const style = DEPTH_STYLES[topic.depth] || DEPTH_STYLES.not_mentioned;
                const label = DEPTH_LABELS[topic.depth] || DEPTH_LABELS.not_mentioned;

                return (
                  <span
                    key={topic.key}
                    className={`inline-block px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap transition-colors ${style}`}
                    title={`${topic.label}: ${label}`}
                  >
                    {topic.label}
                  </span>
                );
              })}
              <span className="text-[10px] text-gray-300 ml-1">color = depth</span>
            </>
          ) : (
            <span className="text-xs text-gray-400">{currentPhaseName}</span>
          )}
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
