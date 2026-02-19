import { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  analyzeForSuggestions,
  type ResearchSuggestion,
  type SuggestionType,
  getChecklistType,
} from "../lib/researchSuggestions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UseResearchSuggestionsResult {
  // Current suggestions based on conversation
  suggestions: ResearchSuggestion[];

  // Queue management
  queuedItems: Array<{
    _id: Id<"researchQueue">;
    type: string;
    label: string;
    description: string;
    query: string;
    source: string;
  }>;
  queueCount: number;

  // Actions
  triggerSuggestion: (suggestion: ResearchSuggestion) => void;
  saveForLater: (suggestion: ResearchSuggestion) => Promise<void>;
  dismissSuggestion: (suggestionId: string) => void;
  triggerQueueItem: (itemId: Id<"researchQueue">) => void;
  dismissQueueItem: (itemId: Id<"researchQueue">) => Promise<void>;

  // State for triggering research
  pendingResearch: {
    type: "auto" | "checklist" | "keywords";
    query?: string;
    source?: string;
    checklistType?: string;
  } | null;
  clearPendingResearch: () => void;
}

export function useResearchSuggestions(
  sessionId: Id<"sessions"> | null,
  messages: Message[],
  currentPhase: number
): UseResearchSuggestionsResult {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [pendingResearch, setPendingResearch] = useState<{
    type: "auto" | "checklist" | "keywords";
    query?: string;
    source?: string;
    checklistType?: string;
  } | null>(null);

  // Convex queries and mutations
  const queuedItems = useQuery(
    api.researchQueue.getPendingItems,
    sessionId ? { sessionId } : "skip"
  );

  const queueCount = useQuery(
    api.researchQueue.getPendingCount,
    sessionId ? { sessionId } : "skip"
  );

  const addToQueue = useMutation(api.researchQueue.addToQueue);
  const markCompleted = useMutation(api.researchQueue.markCompleted);
  const dismissItem = useMutation(api.researchQueue.dismissItem);

  // Get existing research findings to avoid duplicate suggestions
  const researchFindings = useQuery(
    api.sessions.getSessionResearchFindings,
    sessionId ? { sessionId } : "skip"
  );

  // Analyze messages for suggestions (only for phases 0-2)
  const suggestions = useMemo(() => {
    if (currentPhase > 2 || messages.length === 0) {
      return [];
    }

    const existingTopics = (researchFindings || []).map(f =>
      `${f.source}:${f.query}`
    );

    return analyzeForSuggestions(messages, existingTopics)
      .filter(s => !dismissedIds.has(s.id));
  }, [messages, currentPhase, researchFindings, dismissedIds]);

  // Clear dismissed IDs when session changes
  useEffect(() => {
    setDismissedIds(new Set());
  }, [sessionId]);

  // Trigger a suggestion immediately
  const triggerSuggestion = useCallback((suggestion: ResearchSuggestion) => {
    if (suggestion.type === "keyword_volume") {
      setPendingResearch({
        type: "keywords",
        query: suggestion.query,
      });
    } else if (suggestion.type.startsWith("manual_")) {
      const checklistType = getChecklistType(suggestion.type);
      if (checklistType) {
        setPendingResearch({
          type: "checklist",
          checklistType,
        });
      }
    } else {
      // Auto research (Reddit, HN, ProductHunt, etc.)
      setPendingResearch({
        type: "auto",
        query: suggestion.query,
        source: suggestion.source,
      });
    }

    // Dismiss from current suggestions
    setDismissedIds(prev => new Set([...Array.from(prev), suggestion.id]));
  }, []);

  // Save suggestion for later
  const saveForLater = useCallback(async (suggestion: ResearchSuggestion) => {
    if (!sessionId) return;

    await addToQueue({
      sessionId,
      type: suggestion.type,
      label: suggestion.label,
      description: suggestion.description,
      query: suggestion.query,
      source: suggestion.source,
      priority: suggestion.priority,
    });

    // Dismiss from current suggestions
    setDismissedIds(prev => new Set([...Array.from(prev), suggestion.id]));
  }, [sessionId, addToQueue]);

  // Dismiss a suggestion without saving
  const dismissSuggestion = useCallback((suggestionId: string) => {
    setDismissedIds(prev => new Set([...Array.from(prev), suggestionId]));
  }, []);

  // Trigger a queued item
  const triggerQueueItem = useCallback((itemId: Id<"researchQueue">) => {
    const item = queuedItems?.find(i => i._id === itemId);
    if (!item) return;

    if (item.type === "keyword_volume") {
      setPendingResearch({
        type: "keywords",
        query: item.query,
      });
    } else if (item.type.startsWith("manual_")) {
      const checklistType = getChecklistType(item.type as SuggestionType);
      if (checklistType) {
        setPendingResearch({
          type: "checklist",
          checklistType,
        });
      }
    } else {
      setPendingResearch({
        type: "auto",
        query: item.query,
        source: item.source,
      });
    }

    // Mark as completed
    markCompleted({ itemId });
  }, [queuedItems, markCompleted]);

  // Dismiss a queued item
  const dismissQueueItem = useCallback(async (itemId: Id<"researchQueue">) => {
    await dismissItem({ itemId });
  }, [dismissItem]);

  // Clear pending research state
  const clearPendingResearch = useCallback(() => {
    setPendingResearch(null);
  }, []);

  return {
    suggestions,
    queuedItems: queuedItems || [],
    queueCount: queueCount || 0,
    triggerSuggestion,
    saveForLater,
    dismissSuggestion,
    triggerQueueItem,
    dismissQueueItem,
    pendingResearch,
    clearPendingResearch,
  };
}
