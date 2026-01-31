interface OnboardingViewProps {
  onStartExploration: () => void;
  onStartEvaluation: () => void;
}

export function OnboardingView({
  onStartExploration,
  onStartEvaluation,
}: OnboardingViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
        Welcome to Gap Finder
      </h1>
      <p className="text-gray-600 text-center mb-8">
        Discover ideas worth building by exploring your unfair advantages
      </p>

      <div className="space-y-6 w-full">
        {/* Area Exploration */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-primary-300 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Area Exploration
              </h2>
              <p className="text-gray-600 mb-4">
                Map your unfair advantages, find gaps in the market, and discover areas where you can make a real impact. This free exploration helps you understand where your unique experiences create opportunities.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ~30 min per phase
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  3 phases
                </span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                  Free
                </span>
              </div>
              <button
                onClick={onStartExploration}
                className="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                Start Exploring
              </button>
            </div>
          </div>
        </div>

        {/* Idea Evaluation */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-primary-300 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Idea Evaluation
              </h2>
              <p className="text-gray-600 mb-4">
                Have an idea already? Score and sharpen it through structured analysis. Identify your customers, clarify the problem, and refine your solution until you're confident it's worth building.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ~20 min per phase
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  6 phases
                </span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                  $10
                </span>
              </div>
              <button
                onClick={onStartEvaluation}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200"
              >
                Evaluate an Idea
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-8 text-center">
        Not sure where to start? Most people begin with Area Exploration to discover what makes them unique.
      </p>
    </div>
  );
}
