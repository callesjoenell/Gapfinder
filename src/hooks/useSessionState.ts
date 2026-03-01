import { useCallback } from 'react';
import { useLocalStorage } from 'react-use';

// Scroll positions stored separately from draft messages to prevent stale-closure
// race condition in react-use's useLocalStorage set() function.
//
// The bug: react-use's set() memoizes with [key, setState] deps but captures
// `state` at creation time (not in deps). When saveDraftMessage and
// saveScrollPosition both call setStates(prev => ...) within the same render
// cycle, `prev` is the same stale snapshot. The second call (scroll) overwrites
// the first (draft), restoring draftMessage to its old value ("").
//
// Fix: Use two separate localStorage keys so each set() only owns its own slice.

type ScrollStates = Record<string, number>;
type DraftStates = Record<string, string>;

export function useSessionState(sessionId: string | null) {
  const [scrollStates, setScrollStates] = useLocalStorage<ScrollStates>(
    'gapfinder-scroll-positions',
    {}
  );

  const [draftStates, setDraftStates] = useLocalStorage<DraftStates>(
    'gapfinder-draft-messages',
    {}
  );

  const saveScrollPosition = useCallback(
    (position: number) => {
      if (!sessionId) return;
      setScrollStates((prev) => ({
        ...prev,
        [sessionId]: position,
      }));
    },
    [sessionId, setScrollStates]
  );

  const saveDraftMessage = useCallback(
    (draft: string) => {
      if (!sessionId) return;
      setDraftStates((prev) => ({
        ...prev,
        [sessionId]: draft,
      }));
    },
    [sessionId, setDraftStates]
  );

  const clearDraftMessage = useCallback(() => {
    if (!sessionId) return;
    setDraftStates((prev) => ({
      ...prev,
      [sessionId]: '',
    }));
  }, [sessionId, setDraftStates]);

  // Cleanup: remove state for sessions that no longer exist
  const removeSessionState = useCallback(
    (removedSessionId: string) => {
      setScrollStates((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        delete next[removedSessionId];
        return next;
      });
      setDraftStates((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        delete next[removedSessionId];
        return next;
      });
    },
    [setScrollStates, setDraftStates]
  );

  return {
    scrollPosition: (sessionId && scrollStates ? scrollStates[sessionId] : null) ?? 0,
    draftMessage: (sessionId && draftStates ? draftStates[sessionId] : null) ?? '',
    saveScrollPosition,
    saveDraftMessage,
    clearDraftMessage,
    removeSessionState,
  };
}
