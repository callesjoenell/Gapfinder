import { useState, useEffect, useRef } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useStreamingChat } from "../hooks/useStreamingChat";
import { useScrollRestoration } from "../hooks/useScrollRestoration";

interface ChatProps {
  sessionId: Id<"sessions">;
  currentPhase: number;
  sessionPath: "exploration" | "evaluation";
  scrollPosition: number;
  saveScrollPosition: (position: number) => void;
  draftMessage: string;
  saveDraftMessage: (draft: string) => void;
  clearDraftMessage: () => void;
}

export function Chat({
  sessionId,
  currentPhase,
  sessionPath,
  scrollPosition,
  saveScrollPosition,
  draftMessage,
  saveDraftMessage,
  clearDraftMessage,
}: ChatProps) {
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  const {
    messages,
    streamingContent,
    streamingThinking,
    isStreaming,
    error,
    sendMessage,
    loadMore,
    isLoadingMore,
    canLoadMore,
  } = useStreamingChat(sessionId, currentPhase, sessionPath);

  // Use scroll restoration hook
  const containerRef = useScrollRestoration({
    sessionId: sessionId.toString(),
    savedScrollPosition: scrollPosition,
    saveScrollPosition,
    isLoaded: messages !== undefined,
  });

  // Track if user has scrolled up
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // User is scrolled up if they're more than 100px from the bottom
      const isNearBottom = scrollTop >= scrollHeight - clientHeight - 100;
      setIsUserScrolledUp(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [containerRef]);

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-2 text-sm border-b border-red-100">
          {error}
        </div>
      )}

      <MessageList
        messages={messages || []}
        streamingContent={streamingContent}
        streamingThinking={streamingThinking}
        isStreaming={isStreaming}
        containerRef={containerRef}
        onLoadMore={loadMore}
        isLoadingMore={isLoadingMore}
        canLoadMore={canLoadMore}
      />

      {/* Scroll to bottom indicator */}
      {isUserScrolledUp && (
        <button
          onClick={() => {
            containerRef.current?.scrollTo({
              top: containerRef.current.scrollHeight,
              behavior: "smooth",
            });
          }}
          className="absolute bottom-24 right-8 bg-white shadow-lg rounded-full p-2 text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label="Scroll to bottom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      <MessageInput
        onSend={sendMessage}
        disabled={isStreaming}
        placeholder={
          isStreaming ? "Waiting for response..." : "Type a message..."
        }
        draftMessage={draftMessage}
        onDraftChange={saveDraftMessage}
        onSendSuccess={clearDraftMessage}
      />
    </div>
  );
}
