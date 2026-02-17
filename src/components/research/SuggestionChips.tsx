import { type ResearchSuggestion } from "../../lib/researchSuggestions";

interface SuggestionChipsProps {
  suggestions: ResearchSuggestion[];
  onTrigger: (suggestion: ResearchSuggestion) => void;
  onSaveForLater: (suggestion: ResearchSuggestion) => void;
  onDismiss: (suggestionId: string) => void;
}

export function SuggestionChips({
  suggestions,
  onTrigger,
  onSaveForLater,
  onDismiss,
}: SuggestionChipsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500 mr-1">Research:</span>
        {suggestions.map((suggestion) => (
          <SuggestionChip
            key={suggestion.id}
            suggestion={suggestion}
            onTrigger={onTrigger}
            onSaveForLater={onSaveForLater}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
}

interface SuggestionChipProps {
  suggestion: ResearchSuggestion;
  onTrigger: (suggestion: ResearchSuggestion) => void;
  onSaveForLater: (suggestion: ResearchSuggestion) => void;
  onDismiss: (suggestionId: string) => void;
}

function SuggestionChip({
  suggestion,
  onTrigger,
  onSaveForLater,
  onDismiss,
}: SuggestionChipProps) {
  const icon = getIconForType(suggestion.type);
  const isPaid = suggestion.type === "keyword_volume";

  return (
    <div className="group relative inline-flex items-center">
      {/* Main chip - click to trigger */}
      <button
        onClick={() => onTrigger(suggestion)}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
          transition-colors
          ${isPaid
            ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
          }
        `}
        title={suggestion.description}
      >
        <span>{icon}</span>
        <span>{suggestion.label}</span>
        {isPaid && <span className="text-xs opacity-75">(paid)</span>}
      </button>

      {/* Action buttons - appear on hover */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
        {/* Save for later */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSaveForLater(suggestion);
          }}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
          title="Save for later"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>

        {/* Dismiss */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(suggestion.id);
          }}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
          title="Dismiss"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function getIconForType(type: string): string {
  switch (type) {
    case "pain_validation":
      return "🔍";
    case "competitor_check":
      return "🏆";
    case "keyword_volume":
      return "📊";
    case "manual_facebook":
      return "👥";
    case "manual_linkedin":
      return "💼";
    case "manual_twitter":
      return "🐦";
    case "manual_amazon":
      return "📦";
    case "general_search":
      return "🌐";
    default:
      return "🔎";
  }
}
