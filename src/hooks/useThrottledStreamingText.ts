import { useState, useEffect, useRef } from "react";

/**
 * Throttles streaming text updates to 50ms intervals.
 * Prevents render jank from high-frequency token updates.
 *
 * Why 50ms: Creates ~20 updates/second which is smooth to human perception
 * while dramatically reducing React renders compared to per-token updates
 * (100+ per second).
 *
 * @param streamingText - Raw text being updated frequently
 * @returns displayText - Text that updates at most every 50ms
 */
export function useThrottledStreamingText(streamingText: string): string {
  const [displayText, setDisplayText] = useState(streamingText);
  const bufferRef = useRef(streamingText);

  useEffect(() => {
    // Update buffer immediately (no render)
    bufferRef.current = streamingText;

    // Flush buffer to display every 50ms
    const intervalId = setInterval(() => {
      setDisplayText(bufferRef.current);
    }, 50);

    return () => clearInterval(intervalId);
  }, [streamingText]);

  // When streaming text is cleared, reset immediately
  // This handles the case when a new message starts
  useEffect(() => {
    if (streamingText === "") {
      setDisplayText("");
      bufferRef.current = "";
    }
  }, [streamingText === ""]);

  return displayText;
}
