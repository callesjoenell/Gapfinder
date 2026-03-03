import { useState, useRef, useEffect, useLayoutEffect } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { useSpeechToText } from "../hooks/useSpeechToText";

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
  placeholder = "Type here or click the mic to talk",
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

  // Speech-to-text
  const { isListening, isSupported, transcript, toggle, resetTranscript } =
    useSpeechToText();

  // Track the portion of content that came from the last speech transcript,
  // so we can replace it (not append) when new interim/final results arrive.
  const lastTranscriptRef = useRef("");

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

  // Sync speech transcript into content.
  // Replace the previously injected speech portion at the end of content with the
  // updated transcript, so typed text is preserved at the start.
  useEffect(() => {
    if (!transcript) return;

    setContent((prev) => {
      const typed = lastTranscriptRef.current
        ? prev.endsWith(lastTranscriptRef.current)
          ? prev.slice(0, prev.length - lastTranscriptRef.current.length)
          : prev
        : prev;

      // Add a space separator when there is existing typed content
      const separator = typed.length > 0 && !typed.endsWith(" ") ? " " : "";
      const newContent = typed + separator + transcript;
      lastTranscriptRef.current = transcript;
      onDraftChange?.(newContent);
      return newContent;
    });
  // Only run when transcript changes — we intentionally exclude other deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || disabled) return;

    onSend(content.trim());
    setContent("");
    resetTranscript();
    lastTranscriptRef.current = "";
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
      <div className="relative rounded-xl border border-gray-200 shadow-sm bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 disabled:bg-gray-50">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            const newValue = e.target.value;
            setContent(newValue);
            // Reset speech portion tracking when user edits manually
            lastTranscriptRef.current = "";
            onDraftChange?.(newValue);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="w-full resize-none bg-transparent px-4 pt-3 pb-12 text-base focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 placeholder:text-gray-400"
          style={{ overflowY: "hidden" }}
        />
        {/* Bottom toolbar inside the input container — mic + send */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          {isSupported && (
            <button
              type="button"
              onClick={() => {
                if (!isListening) resetTranscript();
                toggle();
              }}
              disabled={disabled}
              className={`rounded-lg p-2 transition-colors ${
                isListening
                  ? "text-red-500 bg-red-50 animate-pulse"
                  : "text-gray-400 hover:text-primary-500 hover:bg-gray-100"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isListening ? "Stop recording" : "Start recording"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            disabled={disabled || !content.trim()}
            className="bg-primary-500 text-white rounded-lg p-2 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </div>
      </div>
      {isListening && (
        <p className="text-xs mt-2 text-red-400">
          Listening... Click mic to stop
        </p>
      )}
    </form>
  );
}
