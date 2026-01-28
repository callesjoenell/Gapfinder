import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Layout } from "./components/layout/Layout";
import { NewSessionModal } from "./components/NewSessionModal";
import { SignIn } from "./components/auth/SignIn";
import { AuthCallback } from "./components/auth/AuthCallback";
import type { Id } from "../convex/_generated/dataModel";

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
  const [currentSessionId, setCurrentSessionId] = useState<Id<"sessions"> | null>(null);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);

  return (
    <Layout
      currentSessionId={currentSessionId}
      onSelectSession={setCurrentSessionId}
      onNewSession={() => setIsNewSessionModalOpen(true)}
    >
      {/* Main content area - placeholder for now */}
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          {currentSessionId ? (
            <p className="text-gray-600">
              Chat interface will appear here
            </p>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Gap Finder
              </h1>
              <p className="text-gray-600 mb-6">
                Select a session from the sidebar or create a new one to begin.
              </p>
              <button
                onClick={() => setIsNewSessionModalOpen(true)}
                className="bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                Create Your First Session
              </button>
            </>
          )}
        </div>
      </div>

      <NewSessionModal
        isOpen={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
        onCreated={(sessionId) => setCurrentSessionId(sessionId)}
      />

      <SignOutButton />
    </Layout>
  );
}

function SignOutButton() {
  const { signOut } = useAuthActions();

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={() => signOut()}
        className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200"
      >
        Sign out
      </button>
    </div>
  );
}

export default App;
