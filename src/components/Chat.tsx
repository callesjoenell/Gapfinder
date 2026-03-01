import { useState, useEffect, useRef, useCallback } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { PhaseProgressBar } from "./PhaseProgressBar";
import { IdeaCard } from "./idea-card";
import { ResizeDivider } from "./ResizeDivider";
import { useStreamingChat } from "../hooks/useStreamingChat";
import { useScrollRestoration } from "../hooks/useScrollRestoration";
import { useResizableSplit } from "../hooks/useResizableSplit";
import { usePhaseProgress } from "../hooks/usePhaseProgress";
import { usePhaseCompletion } from "../hooks/usePhaseCompletion";
import { ResearchPanel } from "./research/ResearchPanel";
import type { ChecklistType } from "./research/checklistConfig";
import { useCoverageState } from "../hooks/useCoverageState";
import { useResearchSuggestions } from "../hooks/useResearchSuggestions";
import { SuggestionChips, ResearchQueue, ResearchQueueBadge } from "./research";

// DEBUG: Full layout hierarchy debug mode
const CHAT_DEBUG = false;

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

// Floating debug panel that shows real-time heights of all containers
function DebugPanel({
  refs,
}: {
  refs: {
    chatOuter: React.RefObject<HTMLDivElement | null>;
    msgList: React.RefObject<HTMLDivElement | null>;
    msgInput: React.RefObject<HTMLElement | null>;
  };
}) {
  const [info, setInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    function measure() {
      const result: Record<string, string> = {};

      const entries: Array<[string, HTMLElement | null]> = [
        ["CHAT-OUTER", refs.chatOuter.current],
        ["MSG-LIST-WRAP", refs.msgList.current],
        ["MSG-INPUT", refs.msgInput.current],
      ];

      for (const [label, el] of entries) {
        if (!el) {
          result[label] = "not mounted";
          continue;
        }
        const c = window.getComputedStyle(el);
        result[label] =
          `H:${el.offsetHeight}px flex:${c.flex} shrink:${c.flexShrink} grow:${c.flexGrow} overflow:${c.overflowY} minH:${c.minHeight} maxH:${c.maxHeight}`;
      }

      setInfo(result);
    }

    measure();
    const interval = setInterval(measure, 500);
    return () => clearInterval(interval);
  }, [refs]);

  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        right: 8,
        zIndex: 99999,
        background: "rgba(0,0,0,0.85)",
        color: "#0f0",
        fontFamily: "monospace",
        fontSize: 10,
        padding: "6px 8px",
        borderRadius: 6,
        maxWidth: 480,
        pointerEvents: "none",
        lineHeight: 1.6,
      }}
    >
      <div style={{ color: "#ff0", fontWeight: "bold", marginBottom: 2 }}>
        LAYOUT DEBUG PANEL (updates every 500ms)
      </div>
      {Object.entries(info).map(([label, val]) => (
        <div key={label}>
          <span style={{ color: "#0ff" }}>{label}:</span> {val}
        </div>
      ))}
      <div style={{ color: "#888", marginTop: 4, fontSize: 9 }}>
        Colors: cyan=LAYOUT-OUTER teal=LAYOUT-INNER magenta=LAYOUT-MAIN<br />
        lime=CHAT yellow=IDEA-CARD orange=MSG-LIST-WRAP<br />
        pink=MSG-LIST blue=MSG-INPUT red=GRID green=FLEX-ROW purple=TEXTAREA
      </div>
    </div>
  );
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
  const [showKeywordLookup, setShowKeywordLookup] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [ideaCollapsed, setIdeaCollapsed] = useState(false);
  const scrollToPhaseRef = useRef<((phase: number) => void) | null>(null);
  const lastMessageCountRef = useRef(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Debug refs
  const chatOuterRef = useRef<HTMLDivElement>(null);
  const msgListWrapRef = useRef<HTMLDivElement>(null);
  const msgInputWrapRef = useRef<HTMLElement>(null);

  // Log on every render
  useEffect(() => {
    if (!CHAT_DEBUG) return;
    const el = chatOuterRef.current;
    if (!el) return;
    const c = window.getComputedStyle(el);
    console.log(
      `[DEBUG CHAT-OUTER] offsetH=${el.offsetHeight} clientH=${el.clientHeight}`,
      `| display=${c.display} flexDir=${c.flexDirection}`,
      `| height=${c.height} overflow=${c.overflow}`,
    );
  });

  // Resizable split between IdeaCard and chat
  const { splitRatio, isDragging, dividerProps } = useResizableSplit(chatContainerRef);

  // Coverage state tracking (includes progress, topics, research intensity)
  const { coverageProgress, topicDepths, researchIntensity } = useCoverageState(sessionId, currentPhase);

  // Phase progress tracking (fallback to old heuristic if no coverage data)
  const { currentProgress: heuristicProgress } = usePhaseProgress(currentPhase);
  const currentProgress = coverageProgress > 0 ? coverageProgress : heuristicProgress;

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
    detectedChecklistType,
    clearChecklistType,
  } = useStreamingChat(sessionId, currentPhase, sessionPath);

  // Greeting is now saved server-side in createSession mutation

  // Research suggestions based on conversation context
  const {
    suggestions,
    queuedItems,
    queueCount,
    triggerSuggestion,
    saveForLater,
    dismissSuggestion,
    triggerQueueItem,
    dismissQueueItem,
    pendingResearch,
    clearPendingResearch,
  } = useResearchSuggestions(
    sessionId,
    messages ? messages.map(m => ({ role: m.role, content: m.content })) : [],
    currentPhase
  );

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

  // When streaming starts, reset scroll-up state so user sees the response
  useEffect(() => {
    if (isStreaming) {
      setIsUserScrolledUp(false);
    }
  }, [isStreaming]);

  // Auto-scroll to bottom when new messages arrive or during streaming
  useEffect(() => {
    if (isUserScrolledUp) return;
    const container = containerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, streamingContent, streamingThinking, isStreaming, isUserScrolledUp, containerRef]);

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

  // Handle research triggers from suggestions/queue
  useEffect(() => {
    if (!pendingResearch) return;

    if (pendingResearch.type === "checklist" && pendingResearch.checklistType) {
      // Send message to trigger checklist
      sendMessage(`show checklist for ${pendingResearch.checklistType.replace("_", " ")}`);
    } else if (pendingResearch.type === "keywords") {
      setShowKeywordLookup(true);
    } else if (pendingResearch.type === "auto") {
      // For auto research, send a message that triggers Claude to use research tools
      const researchPrompt = `Please research this topic: ${pendingResearch.query}`;
      sendMessage(researchPrompt);
    }

    clearPendingResearch();
  }, [pendingResearch, clearPendingResearch, sendMessage]);

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

  // Handle checklist completion - could send a message to Claude with findings
  const handleChecklistComplete = useCallback((_type: ChecklistType) => {
    clearChecklistType();
    // Optional: Auto-send a message like "I've completed the [type] research checklist"
  }, [clearChecklistType]);

  // Handle keyword results - could inject into conversation context
  const handleKeywordResults = useCallback((_results: Array<{ keyword: string; volume: number; cpc: number; competition: number }>) => {
    setShowKeywordLookup(false);
    // Results are saved to session by the action, available for Claude context
  }, []);

  // Close research panel
  const handleResearchPanelClose = useCallback(() => {
    clearChecklistType();
    setShowKeywordLookup(false);
  }, [clearChecklistType]);

  return (
    <div
      ref={(el) => {
        // Assign to both chatContainerRef (for resizableSplit) and chatOuterRef (for debug)
        (chatContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        (chatOuterRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
      className="flex flex-col h-full bg-gray-50 relative"
      style={CHAT_DEBUG ? { outline: "4px solid lime" } : undefined}
    >
      {CHAT_DEBUG && (
        <span
          style={{
            position: "absolute",
            top: 20,
            left: 0,
            background: "lime",
            color: "black",
            fontSize: 10,
            fontFamily: "monospace",
            padding: "1px 4px",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          CHAT-OUTER
        </span>
      )}

      {/* Floating debug panel */}
      {CHAT_DEBUG && (
        <DebugPanel
          refs={{
            chatOuter: chatOuterRef,
            msgList: msgListWrapRef,
            msgInput: msgInputWrapRef,
          }}
        />
      )}

      {/* Research queue badge - shown when items are saved */}
      <div className="absolute top-2 right-2 z-10">
        <ResearchQueueBadge
          count={queueCount}
          onClick={() => setIsQueueOpen(true)}
        />
      </div>

      {/*
        IdeaCard — rendered directly (no wrapper div) to avoid breaking percentage height.
        The debug ref is captured inside IdeaCard itself via IDEA_DEBUG instrumentation.
        We skip the wrapper here because IdeaCard uses height:X% which requires its direct
        flex parent (Chat's outer div) to be the height reference.
      */}
      <IdeaCard
        sessionId={sessionId}
        currentPhase={currentPhase}
        splitRatio={splitRatio}
        onCollapseChange={setIdeaCollapsed}
      />

      {!ideaCollapsed && (
        <ResizeDivider isDragging={isDragging} onPointerDown={dividerProps.onPointerDown} />
      )}
      <PhaseProgressBar
        sessionId={sessionId}
        currentPhase={currentPhase}
        currentProgress={currentProgress}
        sessionPath={sessionPath}
        onPhaseClick={handlePhaseClick}
        coverageTopics={topicDepths}
        researchIntensity={researchIntensity}
      />

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-2 text-sm border-b border-red-100">
          {error}
        </div>
      )}

      {/* MessageList wrapper for debug measurement — flex col so MessageList's flex-1 still works */}
      <div
        ref={msgListWrapRef as React.RefObject<HTMLDivElement>}
        className="flex-1 min-h-0 flex flex-col relative"
        style={CHAT_DEBUG ? { outline: "4px solid orange" } : undefined}
      >
        {CHAT_DEBUG && (
          <span
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              background: "orange",
              color: "black",
              fontSize: 10,
              fontFamily: "monospace",
              padding: "1px 4px",
              zIndex: 9999,
              pointerEvents: "none",
            }}
          >
            MSG-LIST-WRAP
          </span>
        )}
        <MessageList
          messages={messages || []}
          streamingContent={streamingContent}
          streamingThinking={streamingThinking}
          isStreaming={isStreaming}
          sessionId={sessionId}
          containerRef={containerRef}
          onLoadMore={loadMore}
          isLoadingMore={isLoadingMore}
          canLoadMore={canLoadMore}
          onScrollToPhaseReady={handleScrollToPhaseReady}
        />
      </div>

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

      {/* Suggestion chips - only show for research phases */}
      {currentPhase <= 2 && (
        <SuggestionChips
          suggestions={suggestions}
          onTrigger={triggerSuggestion}
          onSaveForLater={saveForLater}
          onDismiss={dismissSuggestion}
        />
      )}

      <MessageInput
        key={sessionId.toString()}
        sessionId={sessionId}
        onSend={sendMessage}
        disabled={isStreaming}
        placeholder={
          isStreaming ? "Waiting for response..." : "Type a message..."
        }
        draftMessage={draftMessage}
        onDraftChange={saveDraftMessage}
        onSendSuccess={clearDraftMessage}
        debugWrapRef={msgInputWrapRef}
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

      {/* Research panel for checklists and keyword lookup */}
      <ResearchPanel
        sessionId={sessionId}
        activeChecklistType={detectedChecklistType}
        showKeywordLookup={showKeywordLookup}
        onClose={handleResearchPanelClose}
        onChecklistComplete={handleChecklistComplete}
        onKeywordResults={handleKeywordResults}
      />

      {/* Research queue drawer */}
      <ResearchQueue
        items={queuedItems}
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        onTrigger={triggerQueueItem}
        onDismiss={dismissQueueItem}
      />
    </div>
  );
}
