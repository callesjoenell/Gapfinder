import { Link } from "react-router-dom";
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
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center">
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
      </div>
      <nav className="flex gap-5 text-sm text-gray-400">
        <Link to="/about" className="hover:text-gray-600">About</Link>
        <Link to="/faq" className="hover:text-gray-600">FAQ</Link>
        <Link to="/contact" className="hover:text-gray-600">Contact</Link>
      </nav>
    </header>
  );
}
