import { useState, useRef, useEffect, useCallback } from "react";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
  placeholder?: string;
  draftMessage?: string;
  onDraftChange?: (draft: string) => void;
  onSendSuccess?: () => void;
}

export function MessageInput({
  onSend,
  disabled,
  placeholder = "Type a message...",
  draftMessage,
  onDraftChange,
  onSendSuccess,
}: MessageInputProps) {
  const [content, setContent] = useState(draftMessage || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync with external draft message changes (e.g., when switching sessions)
  useEffect(() => {
    if (draftMessage !== undefined) {
      setContent(draftMessage);
    }
  }, [draftMessage]);

  // Resize textarea to fit content — called directly on input, not via effect
  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    // Reset to single row to get accurate scrollHeight
    textarea.style.height = "auto";
    // Cap at 200px max
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
    // Allow scrolling only when at max height
    textarea.style.overflowY = textarea.scrollHeight > 200 ? "auto" : "hidden";
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || disabled) return;

    onSend(content.trim());
    setContent("");
    onSendSuccess?.(); // Clear persisted draft
    // Reset textarea height after clearing
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.overflowY = "hidden";
      }
    });
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
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            onDraftChange?.(e.target.value);
            resizeTextarea();
          }}
          onInput={resizeTextarea}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          style={{ overflow: "hidden" }}
          className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 shadow-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
        />
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
