import { forwardRef } from "react";
import { PHASE_NAMES } from "../lib/phaseConfig";

interface PhaseBoundaryProps {
  phase: number;
}

export const PhaseBoundary = forwardRef<HTMLDivElement, PhaseBoundaryProps>(
  ({ phase }, ref) => {
    const phaseName = PHASE_NAMES[phase] || `Phase ${phase}`;

    return (
      <div
        ref={ref}
        id={`phase-${phase}`}
        className="flex items-center gap-3 my-8 px-4"
      >
        <div className="h-px flex-1 bg-gray-300" />
        <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
          Phase {phase}: {phaseName}
        </span>
        <div className="h-px flex-1 bg-gray-300" />
      </div>
    );
  }
);

PhaseBoundary.displayName = "PhaseBoundary";
