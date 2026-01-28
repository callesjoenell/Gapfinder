import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (sessionId: Id<"sessions">) => void;
}

export function NewSessionModal({ isOpen, onClose, onCreated }: NewSessionModalProps) {
  const [name, setName] = useState("");
  const [path, setPath] = useState<"exploration" | "evaluation">("exploration");
  const [isCreating, setIsCreating] = useState(false);
  const createSession = useMutation(api.sessions.createSession);

  if (!isOpen) return null;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const sessionId = await createSession({ name: name.trim(), path });
      onCreated(sessionId);
      setName("");
      setPath("exploration");
      onClose();
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Session</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My startup idea"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              autoFocus
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Your Path
            </label>
            <div className="space-y-2">
              <label className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                path === "exploration" ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"
              }`}>
                <input
                  type="radio"
                  name="path"
                  value="exploration"
                  checked={path === "exploration"}
                  onChange={() => setPath("exploration")}
                  className="mt-1 text-primary-500"
                  disabled={isCreating}
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900">Exploration (Free)</div>
                  <div className="text-sm text-gray-500">
                    Phases 0-3: Discover your unfair advantage and find gaps
                  </div>
                </div>
              </label>
              <label className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                path === "evaluation" ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"
              }`}>
                <input
                  type="radio"
                  name="path"
                  value="evaluation"
                  checked={path === "evaluation"}
                  onChange={() => setPath("evaluation")}
                  className="mt-1 text-primary-500"
                  disabled={isCreating}
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900">Evaluation ($10)</div>
                  <div className="text-sm text-gray-500">
                    Phases 4-9: Score and sharpen your idea
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isCreating}
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
