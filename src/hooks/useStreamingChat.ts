import { useState, useCallback } from "react";
import { useMutation, useQuery, useAction, usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { buildSystemPrompt } from "../lib/systemPrompts";
import { streamWithRetry, translateError } from "../lib/streamingRetry";
import { useThrottledStreamingText } from "./useThrottledStreamingText";
import { getResearchPromptAddition, parseChecklistType } from "../lib/prompts/researchPrompt";
import type { ChecklistType } from "../components/research/checklistConfig";

interface Message {
  _id: Id<"messages">;
  role: "user" | "assistant";
  content: string;
  thinking?: string;
  phase: number;
  timestamp: number;
}

interface UseStreamingChatResult {
  messages: Message[];
  streamingContent: string;
  streamingThinking: string;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  loadMore: (numItems: number) => void;
  isLoadingMore: boolean;
  canLoadMore: boolean;
  detectedChecklistType: ChecklistType | null;
  clearChecklistType: () => void;
}

export function useStreamingChat(
  sessionId: Id<"sessions"> | null,
  currentPhase: number,
  sessionPath: "exploration" | "evaluation"
): UseStreamingChatResult {
  // Raw streaming state (high frequency updates)
  const [rawStreamingContent, setRawStreamingContent] = useState("");
  const [rawStreamingThinking, setRawStreamingThinking] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Throttled display state (50ms batching)
  const streamingContent = useThrottledStreamingText(rawStreamingContent);
  const streamingThinking = useThrottledStreamingText(rawStreamingThinking);

  // Paginated messages query - loads most recent first, then older on scroll
  const {
    results: paginatedResults,
    status: paginationStatus,
    loadMore: loadMoreFn,
  } = usePaginatedQuery(
    api.messages.paginatedMessages,
    sessionId ? { sessionId } : "skip",
    { initialNumItems: 20 }
  );

  // Reverse the paginated results to show oldest at top (query returns desc order)
  const messages = paginatedResults ? [...paginatedResults].reverse() : [];
  const isLoadingMore = paginationStatus === "LoadingMore";
  const canLoadMore = paginationStatus === "CanLoadMore";

  const summaries = useQuery(
    api.summaries.getSessionSummaries,
    sessionId ? { sessionId } : "skip"
  );

  // Mutations and actions
  const saveMessage = useMutation(api.messages.saveMessage);
  const streamChat = useAction(api.claude.streamChat);
  const chatWithResearch = useAction(api.researchActions.chatWithResearch);

  // State for detected checklist trigger (exposed to Chat.tsx)
  const [detectedChecklistType, setDetectedChecklistType] = useState<ChecklistType | null>(null);

  // Query session for research findings (to pass context to prompt)
  const researchFindings = useQuery(
    api.sessions.getSessionResearchFindings,
    sessionId ? { sessionId } : "skip"
  );

  // Query manual research findings
  const manualResearchFindings = useQuery(
    api.manualResearch.getManualResearchForContext,
    sessionId ? { sessionId } : "skip"
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || isStreaming) return;

      // Check for checklist triggers first
      const checklistType = parseChecklistType(content);
      if (checklistType) {
        setDetectedChecklistType(checklistType);
        return; // Don't send message, just trigger UI
      }

      setError(null);
      setIsStreaming(true);
      setRawStreamingContent("");
      setRawStreamingThinking("");

      try {
        // Save user message immediately
        await saveMessage({
          sessionId,
          phase: currentPhase,
          role: "user",
          content,
        });

        // Build system prompt with current phase and summaries
        const currentSummaries = (summaries || []).map((s) => ({
          phase: s.phase,
          completedAt: s.completedAt,
          data: s.data,
        }));

        let systemPrompt = buildSystemPrompt({
          currentPhase,
          summaries: currentSummaries.filter((s) => s.phase < currentPhase),
          sessionPath,
        });

        // Add research prompt additions for phases 0-2 (exploration phases)
        const isResearchPhase = currentPhase >= 0 && currentPhase <= 2;
        if (isResearchPhase) {
          const hasResearchFindings = (researchFindings?.length || 0) > 0;
          const manualResearchContext = manualResearchFindings || null;

          systemPrompt += getResearchPromptAddition(
            hasResearchFindings,
            manualResearchContext
          );
        }

        // Format messages for Claude (use current messages state)
        const formattedMessages = [
          ...messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content },
        ];

        // Use research-enabled action for phases 0-2, standard action otherwise
        const response = isResearchPhase
          ? await streamWithRetry(() =>
              chatWithResearch({
                sessionId,
                systemPrompt,
                messages: formattedMessages,
              })
            )
          : await streamWithRetry(() =>
              streamChat({
                sessionId,
                systemPrompt,
                messages: formattedMessages,
              })
            );

        // Save assistant response with thinking
        await saveMessage({
          sessionId,
          phase: currentPhase,
          role: "assistant",
          content: response.text,
          thinking: response.thinking || undefined,
        });

        // Clear streaming state
        setRawStreamingContent("");
        setRawStreamingThinking("");
      } catch (e) {
        // Translate error to user-friendly message
        setError(translateError(e));
      } finally {
        setIsStreaming(false);
      }
    },
    [
      sessionId,
      currentPhase,
      sessionPath,
      messages,
      summaries,
      researchFindings,
      manualResearchFindings,
      isStreaming,
      saveMessage,
      streamChat,
      chatWithResearch,
    ]
  );

  return {
    messages,
    streamingContent,
    streamingThinking,
    isStreaming,
    error,
    sendMessage,
    loadMore: loadMoreFn,
    isLoadingMore,
    canLoadMore,
    detectedChecklistType,
    clearChecklistType: () => setDetectedChecklistType(null),
  };
}
