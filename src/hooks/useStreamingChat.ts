import { useState, useCallback } from "react";
import { useMutation, useQuery, useAction, usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { buildSystemPrompt } from "../lib/systemPrompts";
import { streamWithRetry, translateError } from "../lib/streamingRetry";
import { useThrottledStreamingText } from "./useThrottledStreamingText";

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

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || isStreaming) return;

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

        const systemPrompt = buildSystemPrompt({
          currentPhase,
          summaries: currentSummaries.filter((s) => s.phase < currentPhase),
          sessionPath,
        });

        // Format messages for Claude (use current messages state)
        const formattedMessages = [
          ...messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content },
        ];

        // Call streaming action with retry (batch mode - backend accumulates full response)
        const response = await streamWithRetry(() =>
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
      isStreaming,
      saveMessage,
      streamChat,
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
  };
}
