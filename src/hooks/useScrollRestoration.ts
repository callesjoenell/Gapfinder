import { useEffect, useLayoutEffect, useRef } from 'react';

interface UseScrollRestorationOptions {
  sessionId: string | null;
  savedScrollPosition: number;
  saveScrollPosition: (position: number) => void;
  isLoaded: boolean; // True when messages query is complete
}

export function useScrollRestoration({
  sessionId,
  savedScrollPosition,
  saveScrollPosition,
  isLoaded,
}: UseScrollRestorationOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isRestoringRef = useRef(false);
  const lastSessionIdRef = useRef<string | null>(null);

  // Save scroll position on scroll (throttled)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !sessionId) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Don't save if we're in the middle of restoring
        if (!isRestoringRef.current) {
          saveScrollPosition(container.scrollTop);
        }
      }, 100); // Throttle to 100ms
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [sessionId, saveScrollPosition]);

  // Restore scroll position on session switch
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !sessionId || !isLoaded) return;

    // Only restore if session actually changed
    if (lastSessionIdRef.current === sessionId) return;
    lastSessionIdRef.current = sessionId;

    if (savedScrollPosition > 0) {
      isRestoringRef.current = true;

      // Validate position is within bounds
      const maxScroll = container.scrollHeight - container.clientHeight;
      const targetPosition = Math.min(savedScrollPosition, maxScroll);

      container.scrollTop = targetPosition;

      // Reset restoration flag after a frame
      requestAnimationFrame(() => {
        isRestoringRef.current = false;
      });
    }
  }, [sessionId, savedScrollPosition, isLoaded]);

  // Reset last session ID when session changes to null
  useEffect(() => {
    if (sessionId === null) {
      lastSessionIdRef.current = null;
    }
  }, [sessionId]);

  return containerRef;
}
