import type { Id } from "../../convex/_generated/dataModel";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useStreamingChat } from "../hooks/useStreamingChat";
import { useScrollIntent } from "../hooks/useScrollIntent";

interface ChatProps {
  sessionId: Id<"sessions">;
  currentPhase: number;
  sessionPath: "exploration" | "evaluation";
}

export function Chat({ sessionId, currentPhase, sessionPath }: ChatProps) {
  const { containerRef, scrollToBottom, isUserScrolledUp } = useScrollIntent();
  const { messages, streamingContent, isStreaming, error, sendMessage } =
    useStreamingChat(sessionId, currentPhase, sessionPath);

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-2 text-sm">
          Error: {error}
        </div>
      )}

      <MessageList
        messages={messages || []}
        streamingContent={streamingContent}
        isStreaming={isStreaming}
        containerRef={containerRef}
        onScrollChange={scrollToBottom}
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
          className="absolute bottom-24 right-8 bg-white shadow-lg rounded-full p-2 text-gray-600 hover:bg-gray-50"
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
      />
    </div>
  );
}
