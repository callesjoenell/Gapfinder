import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface ResearchIntensityControlProps {
  sessionId: Id<"sessions">;
  currentIntensity: "low" | "medium" | "high";
  label?: string;
}

const INTENSITY_CONFIG = {
  low: {
    label: "Low",
    description: "Only flag major unsupported claims",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    activeColor: "bg-blue-500 text-white border-blue-600",
  },
  medium: {
    label: "Medium",
    description: "Flag claims, competitors, and pain points",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    activeColor: "bg-blue-500 text-white border-blue-600",
  },
  high: {
    label: "High",
    description: "Flag everything including assumptions",
    color: "bg-blue-100 text-blue-700 border-blue-300",
    activeColor: "bg-blue-500 text-white border-blue-600",
  },
};

/**
 * Three-level toggle for research intensity setting.
 * Controls how aggressively Claude suggests research opportunities.
 * Compact design that fits inline in progress bar area.
 */
export function ResearchIntensityControl({
  sessionId,
  currentIntensity,
  label = "Research",
}: ResearchIntensityControlProps) {
  const setIntensity = useMutation(api.conversationState.setResearchIntensity);

  const handleIntensityChange = async (intensity: "low" | "medium" | "high") => {
    if (intensity === currentIntensity) return;

    await setIntensity({
      sessionId,
      intensity,
    });
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500 mr-1">{label}:</span>
      {(Object.keys(INTENSITY_CONFIG) as Array<"low" | "medium" | "high">).map((intensity) => {
        const config = INTENSITY_CONFIG[intensity];
        const isActive = intensity === currentIntensity;
        const colorClass = isActive ? config.activeColor : config.color;

        return (
          <button
            key={intensity}
            onClick={() => handleIntensityChange(intensity)}
            className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${colorClass}`}
            title={config.description}
            aria-label={`Set research intensity to ${config.label}: ${config.description}`}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
