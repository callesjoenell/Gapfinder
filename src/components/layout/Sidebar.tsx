import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { SessionGroup } from "../SessionGroup";
import { ArchivedSection } from "../ArchivedSection";

interface SidebarProps {
  currentSessionId: Id<"sessions"> | null;
  onSelectSession: (sessionId: Id<"sessions">) => void;
  onNewSession: (path: "exploration" | "evaluation") => void;
}

export function Sidebar({
  currentSessionId,
  onSelectSession,
  onNewSession,
}: SidebarProps) {
  // Context menu state (lifted up for later plan)
  const [contextMenu, setContextMenu] = useState<{
    sessionId: Id<"sessions">;
    x: number;
    y: number;
  } | null>(null);

  // Query sessions by path
  const explorationSessions = useQuery(api.sessions.listSessionsByPath, {
    path: "exploration",
  });
  const evaluationSessions = useQuery(api.sessions.listSessionsByPath, {
    path: "evaluation",
  });
  const archivedSessions = useQuery(api.sessions.listArchivedSessions);

  const handleContextMenu = (sessionId: Id<"sessions">, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      sessionId,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  // Loading state
  const isLoading =
    explorationSessions === undefined ||
    evaluationSessions === undefined ||
    archivedSessions === undefined;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Session groups */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="p-4 text-center text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Area Exploration group */}
            <SessionGroup
              type="exploration"
              sessions={explorationSessions || []}
              currentSessionId={currentSessionId}
              onSelectSession={onSelectSession}
              onNewSession={() => onNewSession("exploration")}
              onContextMenu={handleContextMenu}
            />

            {/* Idea Evaluation group */}
            <SessionGroup
              type="evaluation"
              sessions={evaluationSessions || []}
              currentSessionId={currentSessionId}
              onSelectSession={onSelectSession}
              onNewSession={() => onNewSession("evaluation")}
              onContextMenu={handleContextMenu}
            />

            {/* Archived section (only appears after first archive) */}
            <ArchivedSection
              sessions={archivedSessions || []}
              currentSessionId={currentSessionId}
              onSelectSession={onSelectSession}
              onContextMenu={handleContextMenu}
            />
          </>
        )}
      </div>

      {/* Account section at bottom */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 text-sm">
          Settings
        </button>
      </div>

      {/* Context menu placeholder - will be implemented in 03-04 */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeContextMenu}
          onContextMenu={(e) => { e.preventDefault(); closeContextMenu(); }}
        />
      )}
    </aside>
  );
}
