import { useEffect } from "react";
import type { Id } from "../../convex/_generated/dataModel";

interface Message {
  _id: Id<"messages">;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface MessageListProps {
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onScrollChange: () => void;
}

export function MessageList({
  messages,
  streamingContent,
  isStreaming,
  containerRef,
  onScrollChange,
}: MessageListProps) {
  // Auto-scroll when new content arrives
  useEffect(() => {
    onScrollChange();
  }, [messages, streamingContent, onScrollChange]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
    >
      {messages.length === 0 && !isStreaming && (
        <div className="text-center text-gray-400 py-12">
          <p className="text-lg">Start a conversation</p>
          <p className="text-sm mt-2">
            I'm here to help you discover startup opportunities through guided exploration.
          </p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message._id} message={message} />
      ))}

      {isStreaming && streamingContent && (
        <MessageBubble
          message={{
            _id: "streaming" as Id<"messages">,
            role: "assistant",
            content: streamingContent,
            timestamp: Date.now(),
          }}
          isStreaming
        />
      )}

      {isStreaming && !streamingContent && (
        <div className="flex items-center gap-2 text-gray-400 px-4">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-sm">Thinking...</span>
        </div>
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: {
    _id: Id<"messages"> | string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
  };
  isStreaming?: boolean;
}

function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary-500 text-white"
            : "bg-white border border-gray-200 text-gray-900"
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-primary-400 ml-1 animate-pulse" />
        )}
      </div>
    </div>
  );
}
