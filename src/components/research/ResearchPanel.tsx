import type { Id } from "../../../convex/_generated/dataModel";
import { ResearchChecklist } from "./ResearchChecklist";
import { KeywordLookup } from "./KeywordLookup";
import type { ChecklistType } from "./checklistConfig";

type PanelMode = "none" | "checklist" | "keywords";

interface ResearchPanelProps {
  sessionId: Id<"sessions">;
  activeChecklistType: ChecklistType | null;
  showKeywordLookup: boolean;
  onClose: () => void;
  onChecklistComplete: (type: ChecklistType) => void;
  onKeywordResults: (results: Array<{ keyword: string; volume: number; cpc: number; competition: number }>) => void;
}

export function ResearchPanel({
  sessionId,
  activeChecklistType,
  showKeywordLookup,
  onClose,
  onChecklistComplete,
  onKeywordResults,
}: ResearchPanelProps) {
  // Determine what to show
  const mode: PanelMode = activeChecklistType
    ? "checklist"
    : showKeywordLookup
      ? "keywords"
      : "none";

  if (mode === "none") {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="max-h-[90vh] overflow-y-auto">
        {mode === "checklist" && activeChecklistType && (
          <ResearchChecklist
            sessionId={sessionId}
            type={activeChecklistType}
            onComplete={() => {
              onChecklistComplete(activeChecklistType);
              onClose();
            }}
            onCancel={onClose}
          />
        )}

        {mode === "keywords" && (
          <KeywordLookup
            onResults={(results) => {
              onKeywordResults(results);
              onClose();
            }}
            onCancel={onClose}
          />
        )}
      </div>
    </div>
  );
}
