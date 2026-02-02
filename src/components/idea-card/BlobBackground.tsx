/**
 * BlobBackground - SVG rendering of 6 animated organic blobs
 * Blobs have gradient edges and drift subtly while converging toward center
 */

import { motion, useReducedMotion } from 'framer-motion';
import { useBlobAnimation } from './hooks/useBlobAnimation';
import {
  generateBlobPath,
  BLOB_SEEDS,
  BLOB_COLORS,
  BLOB_ZONES,
} from './utils/blobShapes';

interface BlobBackgroundProps {
  phase: number;
  width: number;
  height: number;
}

export function BlobBackground({ phase, width, height }: BlobBackgroundProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const { blobTransforms, edgeClarity } = useBlobAnimation(
    phase,
    shouldReduceMotion
  );

  // Calculate stdDeviation for blur based on edge clarity
  // edgeClarity 0.1 (1%) -> high blur (stdDeviation ~25)
  // edgeClarity 0.8 (80%) -> low blur (stdDeviation ~5)
  const blurStdDeviation = 30 - edgeClarity * 25;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 w-full h-full"
    >
      <defs>
        {/* Gradient definitions for each blob */}
        {BLOB_COLORS.map((color, i) => (
          <linearGradient
            key={`gradient-${i}`}
            id={`gradient-${i}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              style={{ stopColor: color.gradient, stopOpacity: 0.6 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: color.fill, stopOpacity: 0.6 }}
            />
          </linearGradient>
        ))}

        {/* Blur filter for gradient edges */}
        <filter id="blob-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blurStdDeviation} />
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
          80
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
            animate={{
              x: shouldReduceMotion ? 0 : [-5, 10, -8, 5, 0],
              y: shouldReduceMotion ? 0 : [0, -8, 12, -5, 0],
            }}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5, // Stagger animation start for each blob
            }}
          />
        );
      })}
    </svg>
  );
}
