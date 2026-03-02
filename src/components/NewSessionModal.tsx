import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { getPhaseConfig } from "../lib/phaseConfig";

interface NewSessionModalProps {
  isOpen: boolean;
  path: "exploration" | "evaluation";
  onClose: () => void;
  onCreated: (sessionId: Id<"sessions">) => void;
}

function daysUntilDoubling(launchDateMs: number): number {
  const now = Date.now();
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
  if (now < launchDateMs) return Math.ceil((launchDateMs - now) / 86400000);
  const weeksElapsed = Math.floor((now - launchDateMs) / MS_PER_WEEK);
  const nextDoubling = launchDateMs + (weeksElapsed + 1) * MS_PER_WEEK;
  return Math.ceil((nextDoubling - now) / 86400000);
}

export function NewSessionModal({ isOpen, path, onClose, onCreated }: NewSessionModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useMutation(api.sessions.createSession);
  const sessionCount = useQuery(api.sessions.countSessionsByPath, { path });
  const freeTierStatus = useQuery(api.pricing.getFreeTierStatus);
  const currentPrice = useQuery(api.pricing.getCurrentPrice);
  const pricingConfig = useQuery(api.pricing.getPricingConfig);
  const { getToken } = useAuth();

  if (!isOpen) return null;

  const title = path === "exploration" ? "New Exploration" : "New Evaluation";
  const placeholder = path === "exploration"
    ? "e.g., Healthcare tech gaps"
    : "e.g., AI-powered scheduling app";

  const isAtLimit = sessionCount !== undefined && sessionCount >= 5;

  const pathKey = path === "exploration" ? "exploreRemaining" : "evaluateRemaining";
  const otherPathKey = path === "exploration" ? "evaluateRemaining" : "exploreRemaining";
  const otherPathLabel = path === "exploration" ? "evaluation" : "exploration";
  const freeTierLoading = freeTierStatus === undefined;
  const isPaywalled = !freeTierLoading && freeTierStatus !== null && freeTierStatus[pathKey] === 0;

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
      const startPhase = path === "exploration" ? 0 : 3;
      const phaseConfig = getPhaseConfig(startPhase);
      const sessionId = await createSession({
        name: name.trim(),
        path,
        description: description.trim() || undefined,
        greeting: phaseConfig?.greeting,
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

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (isRedirecting) return;
    if (!name.trim()) {
      setError("Please enter a name for your session");
      return;
    }

    setIsRedirecting(true);
    setError(null);

    try {
      const token = await getToken({ template: "convex" });
      if (!token) {
        setError("Please sign in to continue");
        setIsRedirecting(false);
        return;
      }

      const response = await fetch(
        "https://glad-bloodhound-996.convex.site/api/stripe/create-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
          },
          body: JSON.stringify({
            path,
            name: name.trim(),
            description: description.trim(),
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Failed to start checkout");
      }

      const data = await response.json() as { url: string };
      window.location.href = data.url;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to start checkout. Please try again.");
      }
      setIsRedirecting(false);
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

  const priceDisplay = currentPrice?.configured
    ? `$${(currentPrice.priceUsd).toFixed(2)}`
    : null;

  const daysDisplay = pricingConfig
    ? daysUntilDoubling(pricingConfig.launchDate)
    : null;

  const otherRemaining = freeTierStatus ? freeTierStatus[otherPathKey] : 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <form onSubmit={isPaywalled ? handlePay : handleCreate} className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>

          {/* Paywall pricing section */}
          {isPaywalled && (
            <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Ready for your next discovery?</p>
              {priceDisplay && (
                <p className="text-3xl font-bold text-gray-900">{priceDisplay}</p>
              )}
              {daysDisplay !== null && (
                <p className="text-xs font-bold text-gray-500 mt-1">
                  Price doubles in {daysDisplay} {daysDisplay === 1 ? "day" : "days"}
                </p>
              )}
              {otherRemaining > 0 && (
                <div className="mt-3 p-2 bg-white/70 border border-primary-200 rounded text-xs text-gray-600">
                  You still have {otherRemaining} free {otherPathLabel} session{otherRemaining > 1 ? "s" : ""}
                </div>
              )}
            </div>
          )}

          {/* Show limit warning before it's reached (non-paywalled) */}
          {!isPaywalled && sessionCount !== undefined && sessionCount >= 4 && sessionCount < 5 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              You have {sessionCount} of 5 {path === "exploration" ? "explorations" : "evaluations"}.
              After this one, you'll need to archive or complete some before creating more.
            </div>
          )}

          {/* Show at-limit message (non-paywalled) */}
          {!isPaywalled && isAtLimit && (
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
              disabled={isCreating || isRedirecting || (!isPaywalled && isAtLimit)}
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
              disabled={isCreating || isRedirecting || (!isPaywalled && isAtLimit)}
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
            {isPaywalled ? (
              <>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isRedirecting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Maybe later
                </button>
                <button
                  type="submit"
                  disabled={isRedirecting || !name.trim()}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRedirecting ? "Redirecting to checkout..." : priceDisplay ? `Pay ${priceDisplay}` : "Pay"}
                </button>
              </>
            ) : (
              <>
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
                  disabled={isCreating || isAtLimit || !name.trim() || freeTierLoading}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
