import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth, SignIn, SignOutButton } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { Layout } from "./components/layout/Layout";
import { Chat } from "./components/Chat";
import { NewSessionModal } from "./components/NewSessionModal";
import { OnboardingView } from "./components/OnboardingView";
import { useSessionState } from "./hooks/useSessionState";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<AuthenticatedApp />} />
      </Routes>
    </BrowserRouter>
  );
}

function AuthenticatedApp() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Sign in to Gap Finder
          </h2>
          <SignIn routing="hash" />
        </div>
      </div>
    );
  }

  return <MainApp />;
}

function MainApp() {
  const [currentSessionId, setCurrentSessionId] = useState<Id<"sessions"> | null>(null);
  const [modalPath, setModalPath] = useState<"exploration" | "evaluation" | null>(null);

  const session = useQuery(
    api.sessions.getSession,
    currentSessionId ? { sessionId: currentSessionId } : "skip"
  );

  // Query both session types for onboarding check
  const explorationSessions = useQuery(api.sessions.listSessionsByPath, { path: "exploration" });
  const evaluationSessions = useQuery(api.sessions.listSessionsByPath, { path: "evaluation" });

  // Use session state hook for scroll and draft persistence
  const sessionState = useSessionState(currentSessionId);

  // Check if user has no sessions (show onboarding)
  const hasNoSessions =
    explorationSessions !== undefined &&
    evaluationSessions !== undefined &&
    explorationSessions.length === 0 &&
    evaluationSessions.length === 0;

  // Auto-select first session if none selected and sessions exist
  useEffect(() => {
    if (!currentSessionId && !hasNoSessions) {
      // Prefer exploration sessions, fallback to evaluation
      const firstSession = explorationSessions?.[0] || evaluationSessions?.[0];
      if (firstSession) {
        setCurrentSessionId(firstSession._id);
      }
    }
  }, [currentSessionId, hasNoSessions, explorationSessions, evaluationSessions]);

  // Show onboarding when no sessions exist
  if (hasNoSessions) {
    return (
      <>
        <OnboardingView
          onStartExploration={() => setModalPath("exploration")}
          onStartEvaluation={() => setModalPath("evaluation")}
        />
        <NewSessionModal
          isOpen={modalPath !== null}
          path={modalPath || "exploration"}
          onClose={() => setModalPath(null)}
          onCreated={(sessionId) => {
            setCurrentSessionId(sessionId);
            setModalPath(null);
          }}
        />
      </>
    );
  }

  return (
    <>
      <Layout
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewSession={(path) => setModalPath(path)}
      >
        {session ? (
          <Chat
            sessionId={session._id}
            currentPhase={session.currentPhase}
            sessionPath={session.path}
            scrollPosition={sessionState.scrollPosition}
            saveScrollPosition={sessionState.saveScrollPosition}
            draftMessage={sessionState.draftMessage}
            saveDraftMessage={sessionState.saveDraftMessage}
            clearDraftMessage={sessionState.clearDraftMessage}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-lg">No session selected</p>
              <button
                onClick={() => setModalPath("exploration")}
                className="mt-4 text-primary-600 hover:text-primary-700"
              >
                Create a new session
              </button>
            </div>
          </div>
        )}
      </Layout>

      <NewSessionModal
        isOpen={modalPath !== null}
        path={modalPath || "exploration"}
        onClose={() => setModalPath(null)}
        onCreated={(sessionId) => {
          setCurrentSessionId(sessionId);
          setModalPath(null);
        }}
      />

      <div className="fixed bottom-4 right-4">
        <SignOutButton>
          <button className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200">
            Sign out
          </button>
        </SignOutButton>
      </div>
    </>
  );
}

export default App;
