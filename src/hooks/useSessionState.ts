import { useCallback } from 'react';
import { useLocalStorage } from 'react-use';

interface SessionState {
  scrollPosition: number;
  draftMessage: string;
}

type SessionStates = Record<string, SessionState>;

const DEFAULT_STATE: SessionState = {
  scrollPosition: 0,
  draftMessage: '',
};

export function useSessionState(sessionId: string | null) {
  const [states, setStates] = useLocalStorage<SessionStates>(
    'gapfinder-session-states',
    {}
  );

  const currentState = sessionId && states ? states[sessionId] : null;

  const saveScrollPosition = useCallback(
    (position: number) => {
      if (!sessionId) return;
      setStates((prev) => ({
        ...prev,
        [sessionId]: {
          ...DEFAULT_STATE,
          ...prev?.[sessionId],
          scrollPosition: position,
        },
      }));
    },
    [sessionId, setStates]
  );

  const saveDraftMessage = useCallback(
    (draft: string) => {
      if (!sessionId) return;
      setStates((prev) => ({
        ...prev,
        [sessionId]: {
          ...DEFAULT_STATE,
          ...prev?.[sessionId],
          draftMessage: draft,
        },
      }));
    },
    [sessionId, setStates]
  );

  const clearDraftMessage = useCallback(() => {
    if (!sessionId) return;
    setStates((prev) => ({
      ...prev,
      [sessionId]: {
        ...DEFAULT_STATE,
        ...prev?.[sessionId],
        draftMessage: '',
      },
    }));
  }, [sessionId, setStates]);

  // Cleanup: remove state for sessions that no longer exist
  // This is called externally when sessions are deleted
  const removeSessionState = useCallback(
    (removedSessionId: string) => {
      setStates((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        delete next[removedSessionId];
        return next;
      });
    },
    [setStates]
  );

  return {
    scrollPosition: currentState?.scrollPosition ?? 0,
    draftMessage: currentState?.draftMessage ?? '',
    saveScrollPosition,
    saveDraftMessage,
    clearDraftMessage,
    removeSessionState,
  };
}
