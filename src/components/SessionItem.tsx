import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { InlineEditableText } from "./InlineEditableText";

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

interface SessionItemProps {
  session: Doc<"sessions">;
  isActive: boolean;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  isEditing?: boolean;
  onEditEnd?: () => void;
}

export function SessionItem({
  session,
  isActive,
  onSelect,
  onContextMenu,
  isEditing = false,
  onEditEnd = () => {},
}: SessionItemProps) {
  const updateSession = useMutation(api.sessions.updateSession);
  const phaseName = phaseNames[session.currentPhase] || `Phase ${session.currentPhase}`;

  const handleSave = async (newName: string) => {
    await updateSession({ sessionId: session._id, name: newName });
  };

  return (
    <button
      onClick={onSelect}
      onContextMenu={onContextMenu}
      className={`w-full text-left px-3 py-2 rounded-lg transition-colors group ${
        isActive
          ? "bg-primary-50 text-primary-700"
          : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      <div className="flex items-center justify-between">
        {isEditing ? (
          <InlineEditableText
            value={session.name}
            isEditing={true}
            onEditEnd={onEditEnd}
            onSave={handleSave}
            inputClassName="font-medium truncate flex-1 pr-2"
          />
        ) : (
          <span className="font-medium truncate flex-1 pr-2">{session.name}</span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-1">
        {/* Phase indicator dot */}
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            isActive ? "bg-primary-500" : "bg-gray-400"
          }`}
        />
        <span className="text-xs text-gray-500 truncate">{phaseName}</span>
      </div>
    </button>
  );
}
