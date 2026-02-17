import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { getPhaseConfig } from "../lib/phaseConfig";

interface CoverageStateData {
  topics: Record<string, string>; // topic key -> depth level
  energyPeaks: string[];
  currentFocus?: string;
  readyForCompletion: boolean;
  whatsMissing?: string[];
  researchIntensity?: "low" | "medium" | "high";
  searchedSources: string[];
  lastUpdated: number;
}

export interface TopicDepth {
  key: string;
  label: string;
  depth: string; // not_mentioned | surface | moderate | deep
}

export interface UseCoverageStateResult {
  coverageState: Record<string, string> | null;
  searchedSources: string[];
  researchIntensity: "low" | "medium" | "high";
  coverageProgress: number; // 0-100 percentage
  topicDepths: TopicDepth[]; // for UI display
}

// Depth values for progress calculation
const DEPTH_VALUES = {
  not_mentioned: 0,
  surface: 33,
  moderate: 66,
  deep: 100,
};

/**
 * Hook for reading coverage state from Convex and computing progress.
 * Provides coverage data, research settings, and topic depth display data.
 */
export function useCoverageState(
  sessionId: Id<"sessions"> | null,
  currentPhase: number
): UseCoverageStateResult {
  // Query coverage state for session+phase
  const coverageData = useQuery(
    api.conversationState.getCoverageState,
    sessionId ? { sessionId, phase: currentPhase } : "skip"
  ) as CoverageStateData | null | undefined;

  // Query research intensity from session
  const researchIntensity = useQuery(
    api.conversationState.getResearchIntensity,
    sessionId ? { sessionId } : "skip"
  ) as "low" | "medium" | "high" | undefined;

  // Query searched sources
  const searchedSources = useQuery(
    api.conversationState.getSearchedSources,
    sessionId ? { sessionId, phase: currentPhase } : "skip"
  ) as string[] | undefined;

  // Get phase config for topic definitions
  const phaseConfig = getPhaseConfig(currentPhase);

  // Return null state if no data yet
  if (!coverageData || !phaseConfig) {
    return {
      coverageState: null,
      searchedSources: searchedSources || [],
      researchIntensity: researchIntensity || "medium",
      coverageProgress: 0,
      topicDepths: [],
    };
  }

  // Build topic depths array for UI display
  const topicDepths: TopicDepth[] = phaseConfig.coverageTopics.map((topic) => ({
    key: topic.key,
    label: topic.label,
    depth: (coverageData.topics[topic.key] as string) || "not_mentioned",
  }));

  // Calculate coverage progress: average depth across all topics
  const depthSum = topicDepths.reduce((sum, topic) => {
    const depthValue = DEPTH_VALUES[topic.depth as keyof typeof DEPTH_VALUES] || 0;
    return sum + depthValue;
  }, 0);

  const coverageProgress =
    topicDepths.length > 0 ? Math.round(depthSum / topicDepths.length) : 0;

  return {
    coverageState: coverageData.topics,
    searchedSources: searchedSources || [],
    researchIntensity: researchIntensity || "medium",
    coverageProgress,
    topicDepths,
  };
}
