import { useState } from "react";
import { useQuery } from "convex/react";
import { SignOutButton } from "@clerk/clerk-react";
import { api } from "../../../convex/_generated/api";
import type { Id, Doc } from "../../../convex/_generated/dataModel";
import { SessionGroup } from "../SessionGroup";
import { ArchivedSection } from "../ArchivedSection";
import { SessionContextMenu } from "../SessionContextMenu";
import { DeleteConfirmModal } from "../DeleteConfirmModal";

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
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    sessionId: Id<"sessions">;
    x: number;
    y: number;
  } | null>(null);

  // Inline editing state
  const [editingSessionId, setEditingSessionId] = useState<Id<"sessions"> | null>(null);

  // Delete confirmation modal state
  const [deleteSession, setDeleteSession] = useState<Doc<"sessions"> | null>(null);

  // Query sessions by path
  const explorationSessions = useQuery(api.sessions.listSessionsByPath, {
    path: "exploration",
  });
  const evaluationSessions = useQuery(api.sessions.listSessionsByPath, {
    path: "evaluation",
  });
  const archivedSessions = useQuery(api.sessions.listArchivedSessions);

  // Look up session from all session lists for context menu
  const allSessions = [
    ...(explorationSessions || []),
    ...(evaluationSessions || []),
    ...(archivedSessions || []),
  ];
  const contextSession = contextMenu ? allSessions.find(s => s._id === contextMenu.sessionId) : null;

  const handleContextMenu = (sessionId: Id<"sessions">, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      sessionId,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleRename = () => {
    if (contextMenu) {
      setEditingSessionId(contextMenu.sessionId);
    }
    closeContextMenu();
  };

  const handleDelete = () => {
    if (contextSession) {
      setDeleteSession(contextSession);
    }
    closeContextMenu();
  };

  const handleDeleted = () => {
    // If deleted session was active, switch to first available session
    if (deleteSession && deleteSession._id === currentSessionId) {
      const firstSession = explorationSessions?.[0] || evaluationSessions?.[0];
      if (firstSession) {
        onSelectSession(firstSession._id);
      }
    }
  };

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
              editingSessionId={editingSessionId}
              onEditEnd={() => setEditingSessionId(null)}
            />

            {/* Idea Evaluation group */}
            <SessionGroup
              type="evaluation"
              sessions={evaluationSessions || []}
              currentSessionId={currentSessionId}
              onSelectSession={onSelectSession}
              onNewSession={() => onNewSession("evaluation")}
              onContextMenu={handleContextMenu}
              editingSessionId={editingSessionId}
              onEditEnd={() => setEditingSessionId(null)}
            />

            {/* Archived section (only appears after first archive) */}
            <ArchivedSection
              sessions={archivedSessions || []}
              currentSessionId={currentSessionId}
              onSelectSession={onSelectSession}
              onContextMenu={handleContextMenu}
              editingSessionId={editingSessionId}
              onEditEnd={() => setEditingSessionId(null)}
            />
          </>
        )}
      </div>

      {/* Account section at bottom */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 text-sm">
          Settings
        </button>
        <SignOutButton>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 text-sm">
            Sign out
          </button>
        </SignOutButton>
      </div>

      {/* Context menu */}
      <SessionContextMenu
        isOpen={contextMenu !== null}
        position={contextMenu || { x: 0, y: 0 }}
        session={contextSession || null}
        onClose={closeContextMenu}
        onRename={handleRename}
        onDeleted={handleDelete}
      />

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={deleteSession !== null}
        sessionId={deleteSession?._id || null}
        sessionName={deleteSession?.name || ""}
        onClose={() => setDeleteSession(null)}
        onDeleted={handleDeleted}
      />
    </aside>
  );
}
