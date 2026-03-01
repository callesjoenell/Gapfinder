import { getPhaseByPath } from "../lib/phaseConfig";

interface PathOverviewProps {
  sessionPath: "exploration" | "evaluation";
  onStart: () => void;
}

export function PathOverview({ sessionPath, onStart }: PathOverviewProps) {
  const phases = getPhaseByPath(sessionPath);
  const isExploration = sessionPath === "exploration";

  const title = isExploration
    ? "Your Exploration Journey"
    : "Your Evaluation Journey";

  const subtitle = isExploration
    ? "You'll work through these stages to discover your unfair advantages and find gaps worth filling."
    : "You'll work through these stages to stress-test your idea until you're confident it's worth building.";

  const useColumns = !isExploration;

  function renderPhaseCard(phase: (typeof phases)[number], i: number) {
    return (
      <div
        key={phase.number}
        className="bg-white rounded-lg border border-gray-200 p-4"
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
              isExploration
                ? "bg-primary-100 text-primary-600"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-sm">
                {phase.name}
              </h3>
              <span className="text-xs text-gray-400">
                {phase.timeEstimate}
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {phase.description}
            </p>
            {phase.coverageTopics.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {phase.coverageTopics.map((topic) => (
                  <span
                    key={topic.key}
                    className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
                  >
                    {topic.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-full p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {title}
      </h1>
      <p className="text-gray-500 text-center mb-8 text-sm">
        {subtitle}
      </p>

      <div className={`w-full ${useColumns ? "columns-2 gap-4" : "max-w-2xl"}`}>
        {phases.map((phase, i) => (
          <div key={phase.number} className="mb-3 break-inside-avoid">
            {renderPhaseCard(phase, i)}
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className={`mt-8 px-8 py-3 rounded-lg font-medium text-white transition-colors ${
          isExploration
            ? "bg-primary-500 hover:bg-primary-600"
            : "bg-amber-500 hover:bg-amber-600"
        }`}
      >
        Start from the beginning
      </button>

      <p className="text-xs text-gray-400 mt-3 mb-4 text-center">
        Each stage builds on the last. Take your time.
      </p>
    </div>
  );
}
