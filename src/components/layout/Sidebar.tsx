import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface SidebarProps {
  currentSessionId: Id<"sessions"> | null;
  onSelectSession: (sessionId: Id<"sessions">) => void;
  onNewSession: () => void;
}

// Phase names for display
const phaseNames: Record<number, string> = {
  0: "Know Yourself",
  1: "Find Gaps",
  2: "Research",
  3: "Your Idea",
  4: "Customers",
  5: "Problem",
  6: "Solution",
  7: "Score",
  8: "Refine",
  9: "Launch",
};

export function Sidebar({ currentSessionId, onSelectSession, onNewSession }: SidebarProps) {
  const sessions = useQuery(api.sessions.listSessions);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* New session button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onNewSession}
          className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span>
          New Session
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto p-2">
        {sessions === undefined ? (
          <div className="p-4 text-center text-gray-400">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            No sessions yet. Create your first one!
          </div>
        ) : (
          <ul className="space-y-1">
            {sessions.map((session) => (
              <li key={session._id}>
                <button
                  onClick={() => onSelectSession(session._id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    currentSessionId === session._id
                      ? "bg-primary-50 text-primary-700"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="font-medium truncate">{session.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {/* Mini progress bar */}
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 transition-all"
                        style={{
                          width: `${((session.currentPhase + 1) / 10) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {phaseNames[session.currentPhase] || `Phase ${session.currentPhase}`}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Account section at bottom */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 text-sm">
          Settings
        </button>
      </div>
    </aside>
  );
}
