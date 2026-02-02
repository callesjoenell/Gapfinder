/**
 * Word cloud layout hook using d3-cloud
 * Positions words within blob bounds using spiral positioning algorithm
 */

import { useEffect, useState } from 'react';
import cloud from 'd3-cloud';

interface WordInput {
  text: string;
  size: number;
}

interface WordLayout {
  text: string;
  x: number;
  y: number;
  size: number;
  rotate: number;
}

interface BlobBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseWordCloudReturn {
  layout: WordLayout[];
  isLoading: boolean;
}

/**
 * Generate word cloud layout within blob bounds
 * @param words - Array of words with sizes (10-30 based on relevance)
 * @param bounds - Blob bounds to constrain word positioning
 * @returns Positioned word layout and loading state
 */
export function useWordCloud(
  words: WordInput[],
  bounds: BlobBounds
): UseWordCloudReturn {
  const [layout, setLayout] = useState<WordLayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Handle empty words array gracefully
    if (words.length === 0) {
      setLayout([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Create d3-cloud layout
    const cloudLayout = cloud<WordInput>()
      .size([bounds.width, bounds.height])
      .words(words)
      .padding(5)
      .spiral('archimedean')
      .fontSize((d) => d.size)
      .on('end', (cloudWords) => {
        // Transform d3-cloud output to our layout format
        const positionedWords = cloudWords.map((word) => ({
          text: word.text || '',
          x: (word.x || 0) + bounds.x,
          y: (word.y || 0) + bounds.y,
          size: word.size || 12,
          rotate: word.rotate || 0,
        }));
        setLayout(positionedWords);
        setIsLoading(false);
      });

    // Start layout computation
    cloudLayout.start();

    // Cleanup: d3-cloud doesn't have explicit cleanup, but we set loading state
    return () => {
      setIsLoading(false);
    };
  }, [words, bounds.x, bounds.y, bounds.width, bounds.height]);

  return {
    layout,
    isLoading,
  };
}
