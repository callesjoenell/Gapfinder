import { useState, useEffect, useRef, useCallback } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { PhaseProgressBar } from "./PhaseProgressBar";
import { IdeaCard } from "./idea-card";
import { useStreamingChat } from "../hooks/useStreamingChat";
import { useScrollRestoration } from "../hooks/useScrollRestoration";
import { usePhaseProgress } from "../hooks/usePhaseProgress";
import { usePhaseCompletion } from "../hooks/usePhaseCompletion";

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
  const scrollToPhaseRef = useRef<((phase: number) => void) | null>(null);
  const lastMessageCountRef = useRef(0);

  // Phase progress tracking (monotonic - never regresses)
  const { currentProgress } = usePhaseProgress(currentPhase);

  // Phase completion detection and advancement
  const {
    assessment,
    isAssessing,
    showConfirmation,
    shouldAssess,
    assessCompletion,
    confirmAdvance,
    dismissConfirmation,
  } = usePhaseCompletion(sessionId, currentPhase, sessionPath);

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

  // Trigger phase assessment every 5 messages
  useEffect(() => {
    if (!messages || messages.length === 0 || isAssessing) return;

    const messageCount = messages.length;
    if (shouldAssess(messageCount) && messageCount > lastMessageCountRef.current) {
      lastMessageCountRef.current = messageCount;
      // Format messages for assessment
      const recentMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      assessCompletion(recentMessages);
    }
  }, [messages, shouldAssess, assessCompletion, isAssessing]);

  // Handle scroll to phase callback from MessageList
  const handleScrollToPhaseReady = useCallback(
    (scrollFn: (phase: number) => void) => {
      scrollToPhaseRef.current = scrollFn;
    },
    []
  );

  // Handle phase click - scroll to phase boundary for completed phases
  const handlePhaseClick = (phase: number) => {
    if (scrollToPhaseRef.current) {
      scrollToPhaseRef.current(phase);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      <IdeaCard sessionId={sessionId} currentPhase={currentPhase} />
      <PhaseProgressBar
        currentPhase={currentPhase}
        currentProgress={currentProgress}
        sessionPath={sessionPath}
        onPhaseClick={handlePhaseClick}
      />

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
        onScrollToPhaseReady={handleScrollToPhaseReady}
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

      {/* Phase completion confirmation dialog */}
      {showConfirmation && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Ready to advance?</h3>
            <p className="text-gray-600 mb-4">
              It looks like you've completed Phase {currentPhase}. Would you
              like to move on to the next phase?
            </p>
            {assessment?.completionSignals &&
              assessment.completionSignals.length > 0 && (
                <div className="mb-4 text-sm text-gray-500">
                  <p className="font-medium mb-1">What you've covered:</p>
                  <ul className="list-disc list-inside">
                    {assessment.completionSignals.slice(0, 3).map((signal, i) => (
                      <li key={i}>{signal}</li>
                    ))}
                  </ul>
                </div>
              )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={dismissConfirmation}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Not yet
              </button>
              <button
                onClick={confirmAdvance}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Yes, continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
