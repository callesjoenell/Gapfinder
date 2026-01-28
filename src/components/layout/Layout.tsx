import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import type { Id } from "../../../convex/_generated/dataModel";

interface LayoutProps {
  children: ReactNode;
  currentSessionId: Id<"sessions"> | null;
  onSelectSession: (sessionId: Id<"sessions">) => void;
  onNewSession: () => void;
}

export function Layout({
  children,
  currentSessionId,
  onSelectSession,
  onNewSession,
}: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentSessionId={currentSessionId}
        onSelectSession={onSelectSession}
        onNewSession={onNewSession}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header sessionId={currentSessionId} />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
