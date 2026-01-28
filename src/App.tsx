import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { SignIn } from "./components/auth/SignIn";
import { AuthCallback } from "./components/auth/AuthCallback";
import { Layout } from "./components/layout/Layout";
import { Chat } from "./components/Chat";
import { NewSessionModal } from "./components/NewSessionModal";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/*" element={<AuthenticatedApp />} />
      </Routes>
    </BrowserRouter>
  );
}

function AuthenticatedApp() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
          <SignIn />
        </div>
      </div>
    );
  }

  // Authenticated - show main app
  return <MainApp />;
}

function MainApp() {
  const { signOut } = useAuthActions();
  const [currentSessionId, setCurrentSessionId] = useState<Id<"sessions"> | null>(null);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);

  // Get current session details
  const session = useQuery(
    api.sessions.getSession,
    currentSessionId ? { sessionId: currentSessionId } : "skip"
  );

  // Get all sessions to auto-select first one
  const sessions = useQuery(api.sessions.listSessions);

  // Auto-select first session if none selected
  useEffect(() => {
    if (!currentSessionId && sessions && sessions.length > 0) {
      setCurrentSessionId(sessions[0]._id);
    }
  }, [currentSessionId, sessions]);

  return (
    <>
      <Layout
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewSession={() => setShowNewSessionModal(true)}
      >
        {session ? (
          <Chat
            sessionId={session._id}
            currentPhase={session.currentPhase}
            sessionPath={session.path}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-lg">No session selected</p>
              <button
                onClick={() => setShowNewSessionModal(true)}
                className="mt-4 text-primary-600 hover:text-primary-700"
              >
                Create your first session
              </button>
            </div>
          </div>
        )}
      </Layout>

      <NewSessionModal
        isOpen={showNewSessionModal}
        onClose={() => setShowNewSessionModal(false)}
        onCreated={(sessionId) => {
          setCurrentSessionId(sessionId as Id<"sessions">);
        }}
      />

      {/* Sign out button */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => signOut()}
          className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200"
        >
          Sign out
        </button>
      </div>
    </>
  );
}

export default App;
