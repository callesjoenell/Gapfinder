/**
 * BlobWords - Word cloud overlay positioned within blob bounds
 * Renders keywords from conversation as text elements within each blob area
 */

import { motion } from 'framer-motion';
import { useWordCloud } from './hooks/useWordCloud';
import { BLOB_COLORS } from './utils/blobShapes';

interface Keyword {
  word: string;
  area: number;
  relevance: number;
}

interface BlobBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BlobWordsProps {
  keywords: Keyword[];
  blobBounds: BlobBounds[];
  phase: number;
}

/**
 * Darken a hex color for word display
 * Makes words 20% darker than blob color
 */
function darkenColor(hexColor: string, amount: number = 0.2): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Darken by reducing each channel
  const newR = Math.max(0, Math.round(r * (1 - amount)));
  const newG = Math.max(0, Math.round(g * (1 - amount)));
  const newB = Math.max(0, Math.round(b * (1 - amount)));

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

export function BlobWords({ keywords, blobBounds, phase }: BlobWordsProps) {
  // Only render if phase >= 1 (words appear in phases 1-2)
  if (phase < 1) {
    return null;
  }

  // Group keywords by area (0-5)
  const keywordsByArea = keywords.reduce(
    (acc, keyword) => {
      if (!acc[keyword.area]) {
        acc[keyword.area] = [];
      }
      acc[keyword.area].push(keyword);
      return acc;
    },
    {} as Record<number, Keyword[]>
  );

  // Render word clouds for each blob area
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 10 }}
    >
      {Object.entries(keywordsByArea).map(([areaStr, areaKeywords]) => {
        const area = parseInt(areaStr, 10);
        const bounds = blobBounds[area];

        if (!bounds) {
          return null;
        }

        // Map keywords to word cloud input format
        // Size based on relevance: 10-30px
        const words = areaKeywords.map((kw) => ({
          text: kw.word,
          size: 10 + kw.relevance * 20,
        }));

        return (
          <BlobWordCloud
            key={area}
            words={words}
            bounds={bounds}
            color={BLOB_COLORS[area]?.fill || '#FFA500'}
            phase={phase}
          />
        );
      })}
    </svg>
  );
}

/**
 * Word cloud for a single blob area
 */
interface BlobWordCloudProps {
  words: { text: string; size: number }[];
  bounds: BlobBounds;
  color: string;
  phase: number;
}

function BlobWordCloud({ words, bounds, color, phase }: BlobWordCloudProps) {
  const { layout } = useWordCloud(words, bounds);

  // Calculate opacity: fade out at phase 3
  const opacity = phase >= 3 ? 0 : 1;

  // Use darkened blob color for text (7% darker than blob)
  const textColor = darkenColor(color, 0.07);

  return (
    <g>
      {layout.map((word, i) => (
        <motion.text
          key={`${word.text}-${i}`}
          x={word.x}
          y={word.y}
          fontSize={word.size}
          fill={textColor}
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(${word.rotate} ${word.x} ${word.y})`}
          initial={{ opacity: 0 }}
          animate={{ opacity }}
          transition={{
            opacity: {
              duration: phase >= 3 ? 1.5 : 2,
              ease: 'easeInOut',
            },
          }}
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 500,
            userSelect: 'none',
          }}
        >
          {word.text}
        </motion.text>
      ))}
    </g>
  );
}
