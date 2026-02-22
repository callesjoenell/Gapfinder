import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { InlineEditableText } from "./InlineEditableText";
import { PHASES } from "../lib/phaseConfig";

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
  const sessionPath = session.path ?? "evaluation";
  const visiblePhases = PHASES.filter((p) => p.path === sessionPath);

  const handleSave = async (newName: string) => {
    await updateSession({ sessionId: session._id, name: newName });
  };

  return (
    <div
      onClick={onSelect}
      onContextMenu={onContextMenu}
      className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
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

      {/* Phase list — always visible, shows journey progress */}
      <div className="mt-1.5 flex flex-col gap-0.5">
        {visiblePhases.map((phase) => {
          const isComplete = phase.number < session.currentPhase;
          const isCurrent = phase.number === session.currentPhase;

          return (
            <div
              key={phase.number}
              className={`flex items-center gap-1.5 text-xs ${
                isCurrent || isComplete
                  ? "text-primary-600 font-medium"
                  : "text-gray-300"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                isCurrent || isComplete
                  ? "bg-primary-500"
                  : "bg-gray-300"
              }`} />
              <span>{phase.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
