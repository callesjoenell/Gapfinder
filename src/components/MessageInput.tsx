import { useState, useRef, useEffect } from "react";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
  placeholder?: string;
  draftMessage?: string;
  onDraftChange?: (draft: string) => void;
  onSendSuccess?: () => void;
}

// Maximum height before the textarea scrolls (in rows of text, approximately)
const MAX_HEIGHT_PX = 200;

export function MessageInput({
  onSend,
  disabled,
  placeholder = "Type a message...",
  draftMessage,
  onDraftChange,
  onSendSuccess,
}: MessageInputProps) {
  const [content, setContent] = useState(draftMessage || "");
  // Track whether content change was from user typing (internal) vs external prop change
  const isInternalChange = useRef(false);

  // Sync with external draft message changes (e.g., when switching sessions)
  // Only applies when draftMessage changes AND it wasn't triggered by our own onChange
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (draftMessage !== undefined) {
      setContent(draftMessage);
    }
  }, [draftMessage]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || disabled) return;

    onSend(content.trim());
    setContent("");
    onSendSuccess?.();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="shrink-0 bg-transparent px-4 pb-4 pt-2">
      <div className="flex gap-3 items-end">
        {/*
          CSS Grid Mirror Technique for auto-sizing textarea:
          - A grid container where a hidden mirror div and textarea overlap in the same cell
          - The mirror div contains the same text and auto-sizes based on content
          - The textarea follows because they share the same grid cell (grid-area: 1/1)
          - ZERO JavaScript needed for sizing — immune to React re-renders and flex recalculations
        */}
        <div
          className="flex-1 grid rounded-xl border border-gray-200 shadow-sm bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500"
        >
          {/* Hidden mirror div — sizes the grid row, capped at max height */}
          <div
            className="invisible pointer-events-none whitespace-pre-wrap break-words px-4 py-3 text-base overflow-hidden"
            style={{
              gridArea: "1 / 1",
              maxHeight: `${MAX_HEIGHT_PX}px`,
            }}
            aria-hidden="true"
          >
            {/* Trailing space after newline ensures the last empty line has height */}
            {content + "\n "}
          </div>

          {/* Actual textarea — overlaps the mirror in the same grid cell */}
          <textarea
            value={content}
            onChange={(e) => {
              isInternalChange.current = true;
              setContent(e.target.value);
              onDraftChange?.(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className="resize-none bg-transparent px-4 py-3 text-base w-full focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
            style={{
              gridArea: "1 / 1",
              maxHeight: `${MAX_HEIGHT_PX}px`,
              overflowY: "auto",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !content.trim()}
          className="bg-primary-500 text-white rounded-xl px-6 py-3 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}
