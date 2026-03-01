import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";

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

  // Resize textarea to fit content.
  // Resets to auto to measure scrollHeight, then sets explicit pixel height.
  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    // Reset to auto so scrollHeight reflects content, not current height
    textarea.style.height = "auto";
    const scrollH = textarea.scrollHeight;
    const newHeight = Math.min(scrollH, 200);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = scrollH > 200 ? "auto" : "hidden";
  }, []);

  // Re-apply correct height after every React render.
  // React re-applies style={{ overflow: "hidden" }} on render which can interact
  // with the textarea's intrinsic sizing. useLayoutEffect fires synchronously
  // after DOM commit but before browser paint, so users never see a snap-back.
  useLayoutEffect(() => {
    resizeTextarea();
  }, [content, resizeTextarea]);

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
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            isInternalChange.current = true;
            setContent(e.target.value);
            onDraftChange?.(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 shadow-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
          style={{ overflow: "hidden" }}
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
