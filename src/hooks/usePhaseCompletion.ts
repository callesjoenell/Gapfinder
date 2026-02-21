import { useState, useCallback, useRef } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { getPhaseConfig } from "../lib/phaseConfig";
import { toast } from "sonner";

interface PhaseAssessment {
  isComplete: boolean;
  progressPercent: number;
  completionSignals: string[];
  missingElements: string[];
}

export function usePhaseCompletion(
  sessionId: Id<"sessions">,
  currentPhase: number,
  sessionPath: "exploration" | "evaluation"
) {
  const [assessment, setAssessment] = useState<PhaseAssessment | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const lastAssessedCount = useRef(0);

  const assessAction = useAction(api.claude.assessPhaseCompletionStructured);
  const advanceMutation = useMutation(api.sessions.advancePhase);

  // Check if we should assess (every 5 messages)
  const shouldAssess = useCallback((messageCount: number) => {
    const threshold = 5;
    const assessmentsDue = Math.floor(messageCount / threshold);
    const lastAssessments = Math.floor(lastAssessedCount.current / threshold);
    return assessmentsDue > lastAssessments;
  }, []);

  // Assess phase completion
  const assessCompletion = useCallback(
    async (recentMessages: { role: string; content: string }[]) => {
      if (isAssessing) return;

      const phaseConfig = getPhaseConfig(currentPhase);
      if (!phaseConfig) return;

      setIsAssessing(true);
      try {
        const result = await assessAction({
          currentPhase,
          recentMessages: recentMessages.slice(-10), // Last 10 messages
          phaseGoal: phaseConfig.description,
          completionCriteria: phaseConfig.completionCriteria,
        });

        setAssessment(result);
        lastAssessedCount.current = recentMessages.length;

        // If phase is complete, show confirmation
        if (result.isComplete && result.progressPercent >= 85) {
          setShowConfirmation(true);
        }

        return result;
      } catch (error) {
        console.error("Phase assessment failed:", error);
        return null;
      } finally {
        setIsAssessing(false);
      }
    },
    [assessAction, currentPhase, isAssessing]
  );

  // Advance to next phase (after user confirmation)
  const confirmAdvance = useCallback(async () => {
    const maxPhase = sessionPath === "exploration" ? 3 : 9;
    const nextPhase = currentPhase + 1;

    if (nextPhase > maxPhase) {
      toast.success(
        `Congratulations! You've completed the ${sessionPath} path!`,
        {
          duration: 5000,
        }
      );
      setShowConfirmation(false);
      return;
    }

    try {
      const nextConfig = getPhaseConfig(nextPhase);
      await advanceMutation({
        sessionId,
        toPhase: nextPhase,
        greeting: nextConfig?.greeting,
      });

      toast.success(`Phase ${nextPhase} unlocked!`, {
        id: `phase-${nextPhase}-unlock`,
        description: nextConfig
          ? `You can now progress to ${nextConfig.name}`
          : undefined,
        duration: 4000,
      });

      setShowConfirmation(false);
      setAssessment(null);
    } catch (error) {
      console.error("Phase advance failed:", error);
      toast.error("Failed to advance phase. Please try again.");
    }
  }, [advanceMutation, currentPhase, sessionId, sessionPath]);

  // Dismiss confirmation without advancing
  const dismissConfirmation = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  return {
    assessment,
    isAssessing,
    showConfirmation,
    shouldAssess,
    assessCompletion,
    confirmAdvance,
    dismissConfirmation,
  };
}
