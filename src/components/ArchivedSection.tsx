import { useLocalStorage } from "react-use";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { SessionItem } from "./SessionItem";

interface ArchivedSectionProps {
  sessions: Doc<"sessions">[];
  currentSessionId: Id<"sessions"> | null;
  onSelectSession: (sessionId: Id<"sessions">) => void;
  onContextMenu: (sessionId: Id<"sessions">, e: React.MouseEvent) => void;
  editingSessionId: Id<"sessions"> | null;
  onEditEnd: () => void;
}

export function ArchivedSection({
  sessions,
  currentSessionId,
  onSelectSession,
  onContextMenu,
  editingSessionId,
  onEditEnd,
}: ArchivedSectionProps) {
  const [isExpanded, setIsExpanded] = useLocalStorage(
    "gapfinder-archived-expanded",
    false // Collapsed by default per CONTEXT.md
  );

  // Don't render if no archived sessions (appears only after first archive)
  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 pt-2 mt-2">
      {/* Archived header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
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
          <span>Archived</span>
        </div>
        {/* Badge with count when collapsed */}
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {sessions.length}
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-1 space-y-1">
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
        </div>
      )}
    </div>
  );
}
