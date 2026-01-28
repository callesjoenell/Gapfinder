import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface HeaderProps {
  sessionId: Id<"sessions"> | null;
}

const phaseNames: Record<number, string> = {
  0: "Know Yourself",
  1: "Find Gaps",
  2: "Research",
  3: "Your Idea",
  4: "Customers",
  5: "Problem",
  6: "Solution",
  7: "Score",
  8: "Refine",
  9: "Launch",
};

export function Header({ sessionId }: HeaderProps) {
  const session = useQuery(
    api.sessions.getSession,
    sessionId ? { sessionId } : "skip"
  );

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
      {session ? (
        <>
          <h1 className="font-semibold text-gray-900">{session.name}</h1>
          <span className="mx-3 text-gray-300">|</span>
          <span className="text-gray-500">
            Phase {session.currentPhase}: {phaseNames[session.currentPhase]}
          </span>
        </>
      ) : (
        <h1 className="text-gray-400">Select a session to begin</h1>
      )}
    </header>
  );
}
