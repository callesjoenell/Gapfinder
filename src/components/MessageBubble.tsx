import ReactMarkdown from "react-markdown";
import { markdownComponents } from "../lib/markdownConfig";
import { ThinkingSection } from "./ThinkingSection";
import type { Id } from "../../convex/_generated/dataModel";

interface MessageBubbleProps {
  message: {
    _id: Id<"messages"> | string;
    role: "user" | "assistant";
    content: string;
    thinking?: string;
    timestamp: number;
  };
  isStreaming?: boolean;
  streamingThinking?: string;
}

/**
 * Full-width message display like Claude.ai.
 * User messages: right-aligned, green background
 * Assistant messages: left-aligned, subtle background, with optional thinking
 */
export function MessageBubble({
  message,
  isStreaming,
  streamingThinking,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const thinking = streamingThinking || message.thinking;

  if (isUser) {
    // User messages: compact, right-aligned
    return (
      <div className="flex justify-end w-full">
        <div className="min-w-0 max-w-[85%] bg-primary-500 text-white rounded-2xl px-4 py-3">
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        </div>
      </div>
    );
  }

  // Assistant messages: full-width, with thinking section
  return (
    <div className="w-full">
      {/* Thinking section (if present) */}
      {thinking && (
        <ThinkingSection
          thinking={thinking}
          isStreaming={isStreaming && !message.content}
        />
      )}

      {/* Response content */}
      <div className="prose prose-sm max-w-none text-gray-900">
        <ReactMarkdown components={markdownComponents}>
          {message.content}
        </ReactMarkdown>
        {isStreaming && message.content && (
          <span className="inline-block w-2 h-4 bg-primary-400 ml-1 animate-pulse" />
        )}
      </div>
    </div>
  );
}
