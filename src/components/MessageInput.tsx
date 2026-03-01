import { useState, useRef, useEffect, useLayoutEffect } from "react";
import type { Id } from "../../convex/_generated/dataModel";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
  placeholder?: string;
  draftMessage?: string;
  onDraftChange?: (draft: string) => void;
  onSendSuccess?: () => void;
  // sessionId is used to reset content when the session changes
  sessionId?: Id<"sessions">;
  // Debug: ref to allow parent to measure this form element
  debugWrapRef?: React.MutableRefObject<HTMLElement | null>;
}

// Maximum height before the textarea scrolls
const MAX_HEIGHT_PX = 200;

export function MessageInput({
  onSend,
  disabled,
  placeholder = "Type a message...",
  draftMessage,
  onDraftChange,
  onSendSuccess,
  sessionId,
  debugWrapRef,
}: MessageInputProps) {
  const [content, setContent] = useState(draftMessage || "");
  // Track the last sessionId we rendered for, to detect actual session switches
  const prevSessionIdRef = useRef(sessionId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Expose form element to parent debug ref
  useEffect(() => {
    if (debugWrapRef && formRef.current) {
      debugWrapRef.current = formRef.current;
    }
  });

  // Auto-resize textarea height to fit content.
  // useLayoutEffect runs synchronously after DOM mutations but before paint,
  // preventing any visible flash of incorrect height.
  // Runs whenever content changes (user types or submit clears).
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    // Reset to auto so scrollHeight can shrink on content deletion
    textarea.style.height = "auto";
    // Set to scrollHeight capped at MAX_HEIGHT_PX
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT_PX)}px`;
    // Only show scroll when at max height
    textarea.style.overflowY = textarea.scrollHeight > MAX_HEIGHT_PX ? "auto" : "hidden";
  }, [content]);

  // Sync content when sessionId changes (actual session switch).
  // The key={sessionId} on MessageInput already forces a clean remount on session switch.
  // This effect is a belt-and-suspenders guard in case of same-sessionId edge cases.
  useEffect(() => {
    if (sessionId !== prevSessionIdRef.current) {
      prevSessionIdRef.current = sessionId;
      setContent(draftMessage || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

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
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="shrink-0 bg-transparent px-4 pb-4 pt-2"
    >
      <div className="flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            const newValue = e.target.value;
            setContent(newValue);
            onDraftChange?.(newValue);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 shadow-sm bg-white px-4 py-3 text-base w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
          style={{ overflowY: "hidden" }}
        />
        <button
          type="submit"
          disabled={disabled || !content.trim()}
          className="bg-primary-500 text-white rounded-xl px-6 py-3 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
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
