import type { Id } from "../../../convex/_generated/dataModel";

interface QueueItem {
  _id: Id<"researchQueue">;
  type: string;
  label: string;
  description: string;
  query: string;
  source: string;
}

interface ResearchQueueProps {
  items: QueueItem[];
  isOpen: boolean;
  onClose: () => void;
  onTrigger: (itemId: Id<"researchQueue">) => void;
  onDismiss: (itemId: Id<"researchQueue">) => void;
}

export function ResearchQueue({
  items,
  isOpen,
  onClose,
  onTrigger,
  onDismiss,
}: ResearchQueueProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-semibold text-gray-900">Research Queue</h2>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No saved research items.</p>
            <p className="text-xs mt-1">Click "+" on suggestions to save for later.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <QueueItemCard
                key={item._id}
                item={item}
                onTrigger={onTrigger}
                onDismiss={onDismiss}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface QueueItemCardProps {
  item: QueueItem;
  onTrigger: (itemId: Id<"researchQueue">) => void;
  onDismiss: (itemId: Id<"researchQueue">) => void;
}

function QueueItemCard({ item, onTrigger, onDismiss }: QueueItemCardProps) {
  const icon = getIconForType(item.type);
  const isPaid = item.type === "keyword_volume";

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="flex items-start gap-2">
        <span className="text-lg">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900">{item.label}</span>
            {isPaid && (
              <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                paid
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onTrigger(item._id)}
          className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
        >
          Do now
        </button>
        <button
          onClick={() => onDismiss(item._id)}
          className="px-3 py-1.5 text-gray-600 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          Remove
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

/**
 * Badge showing queue count - rendered in sidebar or header.
 */
export function ResearchQueueBadge({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  if (count === 0) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      title={`${count} saved research item${count !== 1 ? "s" : ""}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
        {count > 9 ? "9+" : count}
      </span>
    </button>
  );
}
