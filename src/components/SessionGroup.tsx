import { useLocalStorage } from "react-use";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { SessionItem } from "./SessionItem";

interface SessionGroupProps {
  type: "exploration" | "evaluation";
  sessions: Doc<"sessions">[];
  currentSessionId: Id<"sessions"> | null;
  onSelectSession: (sessionId: Id<"sessions">) => void;
  onNewSession: () => void;
  onContextMenu: (sessionId: Id<"sessions">, e: React.MouseEvent) => void;
  editingSessionId: Id<"sessions"> | null;
  onEditEnd: () => void;
}

export function SessionGroup({
  type,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onContextMenu,
  editingSessionId,
  onEditEnd,
}: SessionGroupProps) {
  const [isExpanded, setIsExpanded] = useLocalStorage(
    `gapfinder-group-${type}-expanded`,
    true
  );

  const title = type === "exploration" ? "Area Exploration" : "Idea Evaluation";
  const buttonText = type === "exploration" ? "New Exploration" : "New Evaluation";
  const sessionCount = sessions.length;

  return (
    <div className="mb-2">
      {/* Group header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span>{title}</span>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {sessionCount}
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-1 space-y-1">
          {/* New session button at top */}
          <button
            onClick={onNewSession}
            className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            <span>{buttonText}</span>
          </button>

          {/* Session list */}
          {sessions.map((session) => (
            <SessionItem
              key={session._id}
              session={session}
              isActive={session._id === currentSessionId}
              onSelect={() => onSelectSession(session._id)}
              onContextMenu={(e) => onContextMenu(session._id, e)}
              isEditing={session._id === editingSessionId}
              onEditEnd={onEditEnd}
            />
          ))}

          {/* Empty state */}
          {sessions.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-gray-400">
              No {type === "exploration" ? "explorations" : "evaluations"} yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
