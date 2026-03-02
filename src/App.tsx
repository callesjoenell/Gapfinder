import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { Layout } from "./components/layout/Layout";
import { Chat } from "./components/Chat";
import { NewSessionModal } from "./components/NewSessionModal";
import { OnboardingView } from "./components/OnboardingView";
import { PathOverview } from "./components/PathOverview";
import { useSessionState } from "./hooks/useSessionState";
import { WelcomePage } from "./components/WelcomePage";
import { AboutPage } from "./components/pages/AboutPage";
import { ContactPage } from "./components/pages/ContactPage";
import { FAQPage } from "./components/pages/FAQPage";
import { TermsPage } from "./components/pages/TermsPage";
import { RefundPage } from "./components/pages/RefundPage";

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/refund" element={<RefundPage />} />
          <Route path="/*" element={<AuthenticatedApp />} />
        </Routes>
      </BrowserRouter>
    </>
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
    return <WelcomePage />;
  }

  return <MainApp />;
}

function MainApp() {
  const [currentSessionId, setCurrentSessionId] = useState<Id<"sessions"> | null>(null);
  const [modalPath, setModalPath] = useState<"exploration" | "evaluation" | null>(null);
  const [showOverview, setShowOverview] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const session = useQuery(
    api.sessions.getSession,
    currentSessionId ? { sessionId: currentSessionId } : "skip"
  );

  // Stable session: remember the last valid session data so Chat stays mounted
  // during transient Convex WebSocket reconnects (when useQuery briefly returns undefined).
  // Only clear stableSession when currentSessionId explicitly changes.
  const stableSessionRef = useRef(session);
  if (session !== undefined) {
    // session is defined (either a valid session object or null for "not found")
    // update our stable reference so we always use the latest valid data
    stableSessionRef.current = session;
  }
  // When currentSessionId changes, reset to undefined so we get a clean loading state
  // (this prevents showing stale session data from the wrong session)
  const prevSessionIdRef = useRef(currentSessionId);
  if (prevSessionIdRef.current !== currentSessionId) {
    prevSessionIdRef.current = currentSessionId;
    stableSessionRef.current = undefined;
  }
  const stableSession = stableSessionRef.current;

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

  // Track session count before payment redirect to detect new session after webhook
  const prePaymentSessionCountRef = useRef<number | null>(null);
  const pendingPaymentStartRef = useRef<number | null>(null);

  // Handle payment return URL params
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "cancelled") {
      toast.info("No charge — you can try again anytime");
      setSearchParams({}, { replace: true });
    }
    if (payment === "success") {
      const totalCount =
        (explorationSessions?.length ?? 0) + (evaluationSessions?.length ?? 0);
      prePaymentSessionCountRef.current = totalCount;
      pendingPaymentStartRef.current = Date.now();
      setPendingPayment(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, explorationSessions, evaluationSessions]);

  // Auto-select new session after payment webhook creates it
  useEffect(() => {
    if (!pendingPayment) return;

    const allSessions = [
      ...(explorationSessions ?? []),
      ...(evaluationSessions ?? []),
    ];
    const currentCount = allSessions.length;
    const preCount = prePaymentSessionCountRef.current;

    if (preCount !== null && currentCount > preCount) {
      // New session appeared — find the newest one by lastActiveAt
      const newest = allSessions.reduce((latest, s) =>
        s.lastActiveAt > latest.lastActiveAt ? s : latest
      );
      setCurrentSessionId(newest._id);
      setShowOverview(true);
      setPendingPayment(false);
      prePaymentSessionCountRef.current = null;
      pendingPaymentStartRef.current = null;
      return;
    }

    // 30-second timeout
    if (pendingPaymentStartRef.current !== null) {
      const elapsed = Date.now() - pendingPaymentStartRef.current;
      if (elapsed > 30_000) {
        toast.error("Something went wrong setting up your session. Please contact support.");
        setPendingPayment(false);
        prePaymentSessionCountRef.current = null;
        pendingPaymentStartRef.current = null;
      }
    }
  }, [pendingPayment, explorationSessions, evaluationSessions]);

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
            setShowOverview(true);
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
        onSelectSession={(id) => {
          setCurrentSessionId(id);
          setShowOverview(false);
        }}
        onNewSession={(path) => setModalPath(path)}
      >
        {pendingPayment ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Setting up your session...</p>
            </div>
          </div>
        ) : stableSession && showOverview ? (
          <PathOverview
            sessionPath={stableSession.path}
            onStart={() => setShowOverview(false)}
          />
        ) : stableSession ? (
          <Chat
            key={stableSession._id.toString()}
            sessionId={stableSession._id}
            currentPhase={stableSession.currentPhase}
            sessionPath={stableSession.path}
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
          setShowOverview(true);
          setModalPath(null);
        }}
      />

    </>
  );
}

export default App;
