/**
 * BlobBackground - SVG rendering of 6 animated organic blobs
 * Blobs have gradient edges and drift subtly while converging toward center
 */

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useBlobAnimation } from './hooks/useBlobAnimation';
import {
  generateBlobPath,
  BLOB_SEEDS,
  BLOB_COLORS,
  BLOB_ZONES,
  CARD_CENTER,
} from './utils/blobShapes';

interface BlobBackgroundProps {
  phase: number;
  width: number;
  height: number;
  isMerging?: boolean;
  colorScheme?: 'orange' | 'green';
}

export function BlobBackground({ phase, width, height, isMerging = false, colorScheme = 'orange' }: BlobBackgroundProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const { blobTransforms, edgeClarity } = useBlobAnimation(
    phase,
    shouldReduceMotion
  );

  // Define color schemes
  const colors = colorScheme === 'green'
    ? {
        gradients: [
          { gradient: '#90EE90', fill: '#228B22' }, // Light green to forest green
          { gradient: '#98FB98', fill: '#32CD32' }, // Pale green to lime green
          { gradient: '#90EE90', fill: '#228B22' },
          { gradient: '#98FB98', fill: '#32CD32' },
          { gradient: '#90EE90', fill: '#228B22' },
          { gradient: '#98FB98', fill: '#32CD32' },
        ]
      }
    : {
        gradients: BLOB_COLORS, // Use default orange spectrum
      };

  // Calculate stdDeviation for blur based on edge clarity
  // edgeClarity 0.1 (1%) -> high blur (stdDeviation ~25)
  // edgeClarity 0.8 (80%) -> low blur (stdDeviation ~5)
  const blurStdDeviation = 30 - edgeClarity * 25;

  // Calculate merge blur: when merging, blur decreases for crisp edges
  const mergeBlurStdDeviation = isMerging ? 5 : blurStdDeviation;

  return (
    <AnimatePresence mode="wait">
      <svg
        width={width}
        height={height}
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          {/* Gradient definitions for each blob */}
          {colors.gradients.map((color, i) => (
            <motion.linearGradient
              key={`gradient-${i}`}
              id={`gradient-${i}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <motion.stop
                offset="0%"
                animate={{
                  stopColor: color.gradient,
                  stopOpacity: 0.6,
                }}
                transition={{
                  duration: 2.5,
                  ease: 'easeInOut',
                }}
              />
              <motion.stop
                offset="100%"
                animate={{
                  stopColor: color.fill,
                  stopOpacity: 0.6,
                }}
                transition={{
                  duration: 2.5,
                  ease: 'easeInOut',
                }}
              />
            </motion.linearGradient>
          ))}

          {/* Blur filter for gradient edges */}
          <filter id="blob-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation={mergeBlurStdDeviation} />
            <feColorMatrix
              type="matrix"
              values={`
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 ${edgeClarity} 0
              `}
            />
          </filter>
        </defs>

        {/* Render 6 blobs with animation */}
        {BLOB_ZONES.map((_zone, i) => {
          const blobPath = generateBlobPath(
            BLOB_SEEDS[i],
            blobTransforms[i].x,
            blobTransforms[i].y,
            120,
            8, // edges
            1.8 // aspectRatio - horizontally stretched blobs
          );

          return (
            <motion.path
              key={i}
              d={blobPath}
              fill={`url(#gradient-${i})`}
              filter="url(#blob-blur)"
              style={{
                mixBlendMode: 'multiply',
                willChange: 'transform',
              }}
              animate={
                isMerging
                  ? {
                      // Merge animation: expand blobs in place to create wide horizontal band
                      // Blobs stay in their general positions but grow much larger
                      scale: 2.5,
                      x: 0,
                      y: 0,
                    }
                  : {
                      // Normal drift animation
                      x: shouldReduceMotion ? 0 : [-5, 10, -8, 5, 0],
                      y: shouldReduceMotion ? 0 : [0, -8, 12, -5, 0],
                    }
              }
              transition={
                isMerging
                  ? {
                      duration: 2.5,
                      ease: 'easeInOut',
                    }
                  : {
                      duration: 60,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.5,
                    }
              }
            />
          );
        })}
      </svg>
    </AnimatePresence>
  );
}
