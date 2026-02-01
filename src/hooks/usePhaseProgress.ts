import { useState, useCallback } from "react";

/**
 * Hook for managing phase progress with monotonic tracking.
 * Progress only moves forward, never regresses - even if Claude reassesses lower.
 */
export function usePhaseProgress(currentPhase: number) {
  const [maxProgress, setMaxProgress] = useState<Record<number, number>>({});

  /**
   * Update progress for a phase, always keeping the maximum value.
   * This ensures visual progress never moves backward.
   */
  const updateProgress = useCallback((phase: number, newProgress: number) => {
    setMaxProgress((prev) => ({
      ...prev,
      [phase]: Math.max(prev[phase] || 0, Math.min(100, Math.max(0, newProgress))),
    }));
  }, []);

  /**
   * Get the current (maximum seen) progress for a phase.
   */
  const getCurrentProgress = useCallback(
    (phase: number) => {
      return maxProgress[phase] || 0;
    },
    [maxProgress]
  );

  return {
    currentProgress: getCurrentProgress(currentPhase),
    updateProgress,
    getCurrentProgress,
  };
}
