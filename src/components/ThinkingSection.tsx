import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { markdownComponents } from "../lib/markdownConfig";

interface ThinkingSectionProps {
  thinking: string;
  isStreaming?: boolean;
}

/**
 * Collapsible thinking section for Claude's extended thinking.
 * Collapsed by default - user expands if interested in reasoning.
 * Animates height smoothly using CSS transitions.
 */
export function ThinkingSection({
  thinking,
  isStreaming,
}: ThinkingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!thinking) return null;

  return (
    <div className="mb-3 border-l-2 border-primary-200 pl-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span>Thinking</span>
        {isStreaming && (
          <span className="inline-block w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
        )}
      </button>

      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isExpanded
            ? `${contentRef.current?.scrollHeight || 1000}px`
            : "0px",
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div className="pt-2 text-sm text-gray-600">
          <ReactMarkdown components={markdownComponents}>
            {thinking}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
