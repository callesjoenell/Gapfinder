import { useState, useRef, useEffect } from "react";

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

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Must set overflow:hidden before reading scrollHeight.
      // Without this, the browser may show a scrollbar instead of expanding,
      // and scrollHeight won't accurately reflect actual content height.
      textarea.style.overflow = "hidden";
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [content]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || disabled) return;

    onSend(content.trim());
    setContent("");
    onSendSuccess?.(); // Clear persisted draft
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4">
      <div className="flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            onDraftChange?.(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none overflow-hidden border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
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
