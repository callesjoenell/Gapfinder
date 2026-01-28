import { useRef, useEffect, useCallback, useState } from "react";

interface UseScrollIntentResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollToBottom: () => void;
  isUserScrolledUp: boolean;
}

export function useScrollIntent(): UseScrollIntentResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastScrollTop = useRef(0);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

      // User scrolled up from previous position
      if (scrollTop < lastScrollTop.current && !isAtBottom) {
        setIsUserScrolledUp(true);
      }

      // User scrolled back to bottom
      if (isAtBottom) {
        setIsUserScrolledUp(false);
      }

      lastScrollTop.current = scrollTop;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (!isUserScrolledUp && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [isUserScrolledUp]);

  return { containerRef, scrollToBottom, isUserScrolledUp };
}
