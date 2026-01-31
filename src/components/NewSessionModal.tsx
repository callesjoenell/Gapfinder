import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface NewSessionModalProps {
  isOpen: boolean;
  path: "exploration" | "evaluation";
  onClose: () => void;
  onCreated: (sessionId: Id<"sessions">) => void;
}

export function NewSessionModal({ isOpen, path, onClose, onCreated }: NewSessionModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useMutation(api.sessions.createSession);
  const sessionCount = useQuery(api.sessions.countSessionsByPath, { path });

  if (!isOpen) return null;

  const title = path === "exploration" ? "New Area Exploration" : "New Idea Evaluation";
  const placeholder = path === "exploration"
    ? "e.g., Healthcare tech gaps"
    : "e.g., AI-powered scheduling app";

  const isAtLimit = sessionCount !== undefined && sessionCount >= 5;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (isCreating) return;
    if (!name.trim()) {
      setError("Please enter a name for your session");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const sessionId = await createSession({
        name: name.trim(),
        path,
        description: description.trim() || undefined,
      });
      onCreated(sessionId);
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      // Backend throws descriptive error for limit
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create session. Please try again.");
      }
    } finally {
      setIsCreating(false);
    }
  }

  function handleClose() {
    setName("");
    setDescription("");
    setError(null);
    onClose();
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>

          {/* Show limit warning before it's reached */}
          {sessionCount !== undefined && sessionCount >= 4 && sessionCount < 5 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              You have {sessionCount} of 5 {path === "exploration" ? "explorations" : "evaluations"}.
              After this one, you'll need to archive or complete some before creating more.
            </div>
          )}

          {/* Show at-limit message */}
          {isAtLimit && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              {path === "exploration"
                ? "You've explored 5 different areas! Consider committing to one and starting an evaluation to dive deeper."
                : "You have 5 evaluations in progress. Archive or complete some before starting new ones."
              }
            </div>
          )}

          {/* Name field */}
          <div>
            <label htmlFor="session-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="session-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={placeholder}
              disabled={isCreating || isAtLimit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoFocus
            />
          </div>

          {/* Description field */}
          <div>
            <label htmlFor="session-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="session-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's the focus of this session?"
              disabled={isCreating || isAtLimit}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isAtLimit || !name.trim()}
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
