/**
 * useFitText - Dynamic text sizing hook
 * Uses binary search to find the largest font size that fits content in container
 */

import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Calculate optimal font size for text to fit within container
 * @param containerRef - Reference to the container element
 * @param content - Text content to measure
 * @returns Optimal font size in pixels
 */
export function useFitText(
  containerRef: RefObject<HTMLElement>,
  content: string
): number {
  const [fontSize, setFontSize] = useState(24);

  useLayoutEffect(() => {
    if (!containerRef.current || !content) {
      return;
    }

    const container = containerRef.current;
    const maxWidth = container.clientWidth - 32; // Account for padding
    const maxHeight = container.clientHeight - 32;

    // Create temporary element for measurement
    const measureElement = document.createElement('div');
    measureElement.style.position = 'absolute';
    measureElement.style.visibility = 'hidden';
    measureElement.style.whiteSpace = 'normal';
    measureElement.style.wordBreak = 'break-word';
    measureElement.style.width = `${maxWidth}px`;
    measureElement.textContent = content;
    document.body.appendChild(measureElement);

    // Binary search for optimal font size
    let minSize = 12;
    let maxSize = 48;
    let optimalSize = minSize;

    while (minSize <= maxSize) {
      const midSize = Math.floor((minSize + maxSize) / 2);
      measureElement.style.fontSize = `${midSize}px`;

      const width = measureElement.offsetWidth;
      const height = measureElement.offsetHeight;

      if (width <= maxWidth && height <= maxHeight) {
        // Fits - try larger
        optimalSize = midSize;
        minSize = midSize + 1;
      } else {
        // Doesn't fit - try smaller
        maxSize = midSize - 1;
      }
    }

    // Cleanup
    document.body.removeChild(measureElement);

    setFontSize(optimalSize);
  }, [containerRef, content]);

  return fontSize;
}
