import { useState, useCallback } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { buildSystemPrompt } from "../lib/systemPrompts";

interface Message {
  _id: Id<"messages">;
  role: "user" | "assistant";
  content: string;
  phase: number;
  timestamp: number;
}

interface UseStreamingChatResult {
  messages: Message[] | undefined;
  streamingContent: string;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
}

export function useStreamingChat(
  sessionId: Id<"sessions"> | null,
  currentPhase: number,
  sessionPath: "exploration" | "evaluation"
): UseStreamingChatResult {
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Queries
  const messages = useQuery(
    api.messages.getSessionMessages,
    sessionId ? { sessionId } : "skip"
  );
  const summaries = useQuery(
    api.summaries.getSessionSummaries,
    sessionId ? { sessionId } : "skip"
  );

  // Mutations and actions
  const saveMessage = useMutation(api.messages.saveMessage);
  const chat = useAction(api.claude.chat);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || isStreaming) return;

      setError(null);
      setIsStreaming(true);

      try {
        // Save user message immediately
        await saveMessage({
          sessionId,
          phase: currentPhase,
          role: "user",
          content,
        });

        // Build system prompt with current phase and summaries from prior phases
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

        // Format messages for Claude (current messages + new user message)
        const currentMessages = messages || [];
        const formattedMessages = [
          ...currentMessages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content },
        ];

        // Call Claude (non-streaming for now - streaming via SSE would be Phase 2 Chat Core)
        const response = await chat({
          sessionId,
          systemPrompt,
          messages: formattedMessages,
        });

        // Save assistant response
        await saveMessage({
          sessionId,
          phase: currentPhase,
          role: "assistant",
          content: response,
        });

        setStreamingContent("");
      } catch (e) {
        console.error("Chat error:", e);
        setError(e instanceof Error ? e.message : "Failed to send message");
      } finally {
        setIsStreaming(false);
      }
    },
    [sessionId, currentPhase, sessionPath, messages, summaries, isStreaming, saveMessage, chat]
  );

  return {
    messages,
    streamingContent,
    isStreaming,
    error,
    sendMessage,
  };
}
