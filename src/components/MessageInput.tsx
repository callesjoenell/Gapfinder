import { useState, useRef, useEffect } from "react";
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

// Maximum height before the textarea scrolls (in rows of text, approximately)
const MAX_HEIGHT_PX = 200;

// DEBUG: Set to true to show visual debug outlines and console logs
const DEBUG = false;

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
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const renderCountRef = useRef(0);

  renderCountRef.current += 1;

  if (DEBUG) {
    console.log(`[MessageInput] render #${renderCountRef.current}, content.length=${content.length}, content=${JSON.stringify(content.slice(0, 50))}`);
  }

  // After each render, log computed styles of form, grid container, mirror, and textarea
  useEffect(() => {
    if (!DEBUG) return;
    const form = formRef.current;
    const grid = gridContainerRef.current;
    const mirror = mirrorRef.current;
    const textarea = textareaRef.current;

    if (form) {
      const computed = window.getComputedStyle(form);
      console.log(`[DEBUG MSG-INPUT-FORM] offsetH=${form.offsetHeight} clientH=${form.clientHeight}`,
        `| display=${computed.display} flex=${computed.flex}`,
        `| flexShrink=${computed.flexShrink} flexGrow=${computed.flexGrow}`,
        `| height=${computed.height} minH=${computed.minHeight} maxH=${computed.maxHeight}`,
        `| overflow=${computed.overflow}`
      );
    }
    if (grid) {
      const computed = window.getComputedStyle(grid);
      console.log(`[DEBUG grid] display=${computed.display}, gridTemplateRows=${computed.gridTemplateRows}, gridTemplateColumns=${computed.gridTemplateColumns}, width=${computed.width}, height=${computed.height}`);
    }
    if (mirror) {
      const computed = window.getComputedStyle(mirror);
      console.log(`[DEBUG mirror] gridArea=${computed.gridArea}, gridRowStart=${computed.gridRowStart}, gridColumnStart=${computed.gridColumnStart}, width=${computed.width}, height=${computed.height}, visibility=${computed.visibility}, fontSize=${computed.fontSize}, lineHeight=${computed.lineHeight}, padding=${computed.padding}`);
    }
    if (textarea) {
      const computed = window.getComputedStyle(textarea);
      console.log(`[DEBUG textarea] gridArea=${computed.gridArea}, gridRowStart=${computed.gridRowStart}, gridColumnStart=${computed.gridColumnStart}, width=${computed.width}, height=${computed.height}, fontSize=${computed.fontSize}, lineHeight=${computed.lineHeight}, padding=${computed.padding}, overflow=${computed.overflow}, resize=${computed.resize}`);
      console.log(`[DEBUG textarea] scrollHeight=${textarea.scrollHeight}, clientHeight=${textarea.clientHeight}, offsetHeight=${textarea.offsetHeight}`);
    }
  });

  // Expose form element to parent debug ref
  useEffect(() => {
    if (debugWrapRef && formRef.current) {
      debugWrapRef.current = formRef.current;
    }
  });

  // Sync content when sessionId changes (actual session switch).
  // This replaces the fragile isInternalChange + useEffect([draftMessage]) pattern.
  // By keying on sessionId instead of draftMessage, we avoid the feedback loop where
  // saveDraftMessage -> draftMessage prop change -> useEffect -> setContent("") was
  // accidentally clearing typed text.
  //
  // Note: Chat.tsx also adds key={sessionId} to this component, which already forces
  // a clean remount on session switch. This effect is a belt-and-suspenders guard in
  // case the key prop is not sufficient (e.g., same sessionId but different contexts).
  useEffect(() => {
    if (sessionId !== prevSessionIdRef.current) {
      prevSessionIdRef.current = sessionId;
      if (DEBUG) console.log(`[MessageInput] session changed to ${sessionId}, resetting content to draftMessage: ${JSON.stringify((draftMessage || "").slice(0, 50))}`);
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
      style={DEBUG ? { outline: "3px solid blue", position: "relative" } : undefined}
    >
      {DEBUG && (
        <span
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "blue",
            color: "white",
            fontSize: 10,
            fontFamily: "monospace",
            padding: "1px 4px",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          MSG-INPUT
        </span>
      )}
      <div
        className="flex gap-3 items-end"
        style={DEBUG ? { outline: "2px solid green" } : undefined}
      >
        {/*
          CSS Grid Mirror Technique for auto-sizing textarea:
          - A grid container where a hidden mirror div and textarea overlap in the same cell
          - The mirror div contains the same text and auto-sizes based on content
          - The textarea follows because they share the same grid cell (grid-area: 1/1)
          - ZERO JavaScript needed for sizing — immune to React re-renders and flex recalculations

          CRITICAL requirements for this to work:
          1. Grid container must have display:grid (Tailwind 'grid' class)
          2. Grid container must have grid-template-columns:1fr so it has exactly one column
          3. Mirror and textarea must have identical font-size, line-height, padding, width
          4. Mirror and textarea must be in the same grid cell: grid-row-start:1, grid-column-start:1
          5. Textarea must NOT have a rows attribute (fights grid height)
          6. Textarea must NOT have a fixed height
        */}
        <div
          ref={gridContainerRef}
          className="flex-1 grid rounded-xl border border-gray-200 shadow-sm bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500"
          style={{
            gridTemplateColumns: "1fr",
            ...(DEBUG ? { outline: "3px solid red" } : {}),
          }}
        >
          {/* Hidden mirror div — sizes the grid row, capped at max height */}
          <div
            ref={mirrorRef}
            className="invisible pointer-events-none whitespace-pre-wrap break-words px-4 py-3 text-base overflow-hidden"
            style={{
              gridRowStart: 1,
              gridColumnStart: 1,
              gridRowEnd: 2,
              gridColumnEnd: 2,
              maxHeight: `${MAX_HEIGHT_PX}px`,
              ...(DEBUG ? { outline: "3px dashed orange" } : {}),
            }}
            aria-hidden="true"
          >
            {/* Trailing space after newline ensures the last empty line has height */}
            {content + "\n "}
          </div>

          {/* Actual textarea — overlaps the mirror in the same grid cell */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              const newValue = e.target.value;
              if (DEBUG) console.log(`[MessageInput] onChange: newValue.length=${newValue.length}, lines=${newValue.split("\n").length}`);
              setContent(newValue);
              onDraftChange?.(newValue);
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className="resize-none bg-transparent px-4 py-3 text-base w-full focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
            style={{
              gridRowStart: 1,
              gridColumnStart: 1,
              gridRowEnd: 2,
              gridColumnEnd: 2,
              maxHeight: `${MAX_HEIGHT_PX}px`,
              overflowY: "auto",
              ...(DEBUG ? { outline: "3px solid purple" } : {}),
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
      {DEBUG && (
        <div className="text-xs text-red-500 mt-1 font-mono">
          [DEBUG] content.length={content.length} | lines={content.split("\n").length} | render#{renderCountRef.current}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}
