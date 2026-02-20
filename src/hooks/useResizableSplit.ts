/**
 * useResizableSplit - Hook for managing a draggable split between two panels
 * Tracks pointer events to resize, persists ratio via localStorage
 */

import { useState, useCallback, useEffect, type RefObject } from 'react';
import { useLocalStorage } from 'react-use';

const MIN_RATIO = 0.15;
const MAX_RATIO = 0.70;
const STORAGE_KEY = 'ideaCard-splitRatio';
const DEFAULT_RATIO = 0.5;

interface UseResizableSplitReturn {
  splitRatio: number;
  isDragging: boolean;
  dividerProps: {
    onPointerDown: (e: React.PointerEvent) => void;
  };
}

export function useResizableSplit(
  containerRef: RefObject<HTMLDivElement | null>
): UseResizableSplitReturn {
  const [storedRatio, setStoredRatio] = useLocalStorage<number>(
    STORAGE_KEY,
    DEFAULT_RATIO
  );
  const [splitRatio, setSplitRatio] = useState<number>(storedRatio ?? DEFAULT_RATIO);
  const [isDragging, setIsDragging] = useState(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
    },
    []
  );

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const ratio = (e.clientY - rect.top) / rect.height;
      const clamped = Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio));

      setSplitRatio(clamped);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      // Persist on release
      setSplitRatio((current) => {
        setStoredRatio(current);
        return current;
      });
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, containerRef, setStoredRatio]);

  return {
    splitRatio,
    isDragging,
    dividerProps: { onPointerDown },
  };
}
