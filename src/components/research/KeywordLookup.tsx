import { useState } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface KeywordResult {
  keyword: string;
  volume: number;
  cpc: number;
  competition: number;
}

interface KeywordLookupProps {
  onResults: (results: KeywordResult[]) => void;
  onCancel: () => void;
}

const MAX_KEYWORDS = 20;

export function KeywordLookup({ onResults, onCancel }: KeywordLookupProps) {
  const [keywords, setKeywords] = useState("");
  const [step, setStep] = useState<"input" | "confirm" | "loading" | "results">("input");
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const credits = useQuery(api.billing.getCredits);
  const checkAccess = useMutation(api.billing.checkKeywordAccess);
  const trackUsage = useMutation(api.billing.trackKeywordUsage);
  const lookupKeywords = useAction(api.research.keywordAction.lookupKeywords);

  const keywordList = keywords
    .split(/[,\n]/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
    .slice(0, MAX_KEYWORDS);

  const handleCheck = async () => {
    if (keywordList.length === 0) {
      setError("Enter at least one keyword");
      return;
    }

    const access = await checkAccess({ keywordCount: keywordList.length });
    if (!access.allowed) {
      setError(access.reason || "Cannot proceed with lookup");
      return;
    }

    setStep("confirm");
  };

  const handleConfirm = async () => {
    setStep("loading");
    setError(null);

    try {
      const data = await lookupKeywords({ keywords: keywordList });

      if (data.success && data.data) {
        await trackUsage({ creditsUsed: data.creditsUsed || keywordList.length });
        setResults(data.data);
        setStep("results");
        onResults(data.data);
      } else {
        setError(data.error || "Lookup failed");
        setStep("input");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStep("input");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Keyword Volume Lookup</h2>
        <p className="text-sm text-gray-500 mt-1">
          Credits remaining: {credits?.creditsRemaining ?? "..."}
        </p>
      </div>

      {step === "input" && (
        <>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter keywords (one per line or comma-separated, max {MAX_KEYWORDS})
          </label>
          <textarea
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., project management software, task tracking app, team collaboration tool"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {keywordList.length} keyword{keywordList.length !== 1 ? "s" : ""} entered
          </p>

          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleCheck}
              disabled={keywordList.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Check Availability
            </button>
          </div>
        </>
      )}

      {step === "confirm" && (
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-amber-800 font-medium">Confirm Credit Usage</p>
            <p className="text-amber-700 text-sm mt-1">
              This will use <strong>{keywordList.length}</strong> credit{keywordList.length !== 1 ? "s" : ""} from your balance.
            </p>
            <p className="text-amber-600 text-xs mt-2">
              After: {(credits?.creditsRemaining ?? 0) - keywordList.length} credits remaining
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setStep("input")}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Go Back
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Confirm & Lookup
            </button>
          </div>
        </div>
      )}

      {step === "loading" && (
        <div className="py-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Looking up keyword data...</p>
        </div>
      )}

      {step === "results" && (
        <div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Keyword</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Volume</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">CPC</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Competition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((r, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 text-gray-900">{r.keyword}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{r.volume.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-gray-700">${r.cpc.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{(r.competition * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
