import { useEffect, useCallback } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { MessageBubble } from "./MessageBubble";

interface Message {
  _id: Id<"messages">;
  role: "user" | "assistant";
  content: string;
  thinking?: string;
  timestamp: number;
}

interface MessageListProps {
  messages: Message[];
  streamingContent: string;
  streamingThinking?: string;
  isStreaming: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onScrollChange: () => void;
  // Pagination props
  onLoadMore: (numItems: number) => void;
  isLoadingMore: boolean;
  canLoadMore: boolean;
}

export function MessageList({
  messages,
  streamingContent,
  streamingThinking,
  isStreaming,
  containerRef,
  onScrollChange,
  onLoadMore,
  isLoadingMore,
  canLoadMore,
}: MessageListProps) {
  // Auto-scroll when new content arrives
  useEffect(() => {
    onScrollChange();
  }, [messages, streamingContent, onScrollChange]);

  // Handle scroll to top for lazy loading older messages
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Load more when scrolled to within 100px of top
    if (container.scrollTop < 100 && canLoadMore && !isLoadingMore) {
      // Remember scroll position to restore after loading
      const scrollHeight = container.scrollHeight;
      onLoadMore(20); // Load 20 more messages
      // After loading, maintain relative scroll position
      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - scrollHeight;
      });
    }
  }, [containerRef, canLoadMore, isLoadingMore, onLoadMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [containerRef, handleScroll]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
    >
      {/* Loading more indicator at top */}
      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <div className="flex gap-1">
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      )}

      {/* Hint to scroll up if more messages available */}
      {canLoadMore && !isLoadingMore && messages.length > 0 && (
        <div className="text-center py-2 text-xs text-gray-400">
          Scroll up to load older messages
        </div>
      )}

      {messages.length === 0 && !isStreaming && (
        <div className="text-center text-gray-400 py-12">
          <p className="text-lg">Start a conversation</p>
          <p className="text-sm mt-2">
            I'm here to help you discover startup opportunities through guided
            exploration.
          </p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message._id} message={message} />
      ))}

      {/* Streaming message */}
      {isStreaming && (streamingContent || streamingThinking) && (
        <MessageBubble
          message={{
            _id: "streaming" as Id<"messages">,
            role: "assistant",
            content: streamingContent,
            timestamp: Date.now(),
          }}
          isStreaming
          streamingThinking={streamingThinking}
        />
      )}

      {/* Loading indicator (before any content arrives) */}
      {isStreaming && !streamingContent && !streamingThinking && (
        <div className="flex items-center gap-2 text-gray-400 px-4">
          <div className="flex gap-1">
            <span
              className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
          <span className="text-sm">Thinking...</span>
        </div>
      )}
    </div>
  );
}
