import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CHECKLIST_CONFIGS, type ChecklistType } from "./checklistConfig";

interface ResearchChecklistProps {
  sessionId: Id<"sessions">;
  type: ChecklistType;
  onComplete: () => void;
  onCancel: () => void;
}

export function ResearchChecklist({
  sessionId,
  type,
  onComplete,
  onCancel,
}: ResearchChecklistProps) {
  const config = CHECKLIST_CONFIGS[type];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitResearch = useMutation(api.manualResearch.submitManualResearch);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, string>>();

  const onSubmit = async (data: Record<string, string>) => {
    setIsSubmitting(true);
    try {
      await submitResearch({
        sessionId,
        type,
        data,
      });
      onComplete();
    } catch (error) {
      console.error("Failed to submit research:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{config.title}</h2>
        <p className="text-gray-600 mt-1">{config.description}</p>
      </div>

      {/* Instructions */}
      <div className="mb-6 bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">How to research:</h3>
        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
          {config.instructions.map((instruction, i) => (
            <li key={i}>{instruction}</li>
          ))}
        </ol>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {config.fields.map((field) => (
          <div key={field.id}>
            <label
              htmlFor={field.id}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === "textarea" ? (
              <textarea
                id={field.id}
                {...register(field.id, { required: field.required })}
                placeholder={field.placeholder}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            ) : (
              <input
                id={field.id}
                type={field.type}
                {...register(field.id, { required: field.required })}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}

            {field.helpText && (
              <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
            )}

            {errors[field.id] && (
              <p className="mt-1 text-xs text-red-500">This field is required</p>
            )}
          </div>
        ))}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Submit Findings"}
          </button>
        </div>
      </form>
    </div>
  );
}
