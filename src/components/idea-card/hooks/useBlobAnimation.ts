/**
 * Blob animation hook
 * Orchestrates blob drift and centripetal convergence based on phase
 */

import { useMotionValue, useTransform, useAnimationFrame } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { BLOB_ZONES, CARD_CENTER } from '../utils/blobShapes';

interface BlobTransform {
  x: number;
  y: number;
  scale: number;
}

interface UseBlobAnimationReturn {
  blobTransforms: BlobTransform[];
  edgeClarity: number;
}

/**
 * Linear interpolation helper
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Animation hook for blob drift and convergence
 * @param phase - Current phase (0-9)
 * @param shouldReduceMotion - Accessibility flag to disable animations
 * @returns Blob transforms and edge clarity value
 */
export function useBlobAnimation(
  phase: number,
  shouldReduceMotion: boolean
): UseBlobAnimationReturn {
  const time = useMotionValue(0);
  const startTimeRef = useRef<number | null>(null);

  // Calculate edge clarity based on phase
  const edgeClarity = (() => {
    if (phase === 0) {
      // Phase 0: start at 0.1 (1%), end at 0.5 (50%)
      // This will be interpolated based on progress within phase 0
      return 0.3; // Mid-phase default for now
    } else if (phase >= 1 && phase <= 2) {
      return 0.6; // Phases 1-2
    } else if (phase >= 3) {
      return 0.8; // Phase 3+
    }
    return 0.1;
  })();

  // Calculate convergence factor - how much blobs move toward center
  // Phase 0: 0% (blobs at starting positions)
  // Phase 1: ~15% toward center
  // Phase 2: ~30% toward center
  // Phase 3+: merge animation takes over (handled in BlobBackground)
  const convergenceFactor = clamp(phase * 0.15, 0, 0.3);

  // Generate transforms for each blob
  const blobTransforms = BLOB_ZONES.map((zone, index) => {
    // Each blob has a unique offset in the animation cycle
    const phaseOffset = (index / BLOB_ZONES.length) * Math.PI * 2;

    // Use motion values for GPU-accelerated animations
    const currentTime = useTransform(time, (t) => t + phaseOffset);

    // Local drift within zone - subtle glacial motion
    const localDriftX = useTransform(
      currentTime,
      (t) => {
        if (shouldReduceMotion) return 0;
        // 60-second cycle: 0 -> 10 -> -5 -> 0
        const cycle = (t % 60000) / 60000; // Normalize to 0-1
        return Math.sin(cycle * Math.PI * 2) * 10;
      }
    );

    const localDriftY = useTransform(
      currentTime,
      (t) => {
        if (shouldReduceMotion) return 0;
        // Slightly different frequency for Y axis
        const cycle = (t % 60000) / 60000;
        return Math.cos(cycle * Math.PI * 2) * 10;
      }
    );

    // Calculate position with centripetal convergence
    // Start position: zone position
    // End position (at convergenceFactor=0.3): 30% toward CARD_CENTER
    const targetX = lerp(zone.x, CARD_CENTER.x, convergenceFactor);
    const targetY = lerp(zone.y, CARD_CENTER.y, convergenceFactor);

    // Get current values for return (motion values will update automatically)
    const x = shouldReduceMotion ? targetX : targetX;
    const y = shouldReduceMotion ? targetY : targetY;

    return {
      x,
      y,
      scale: 1,
    };
  });

  // Animate the time motion value
  useAnimationFrame((t) => {
    if (!shouldReduceMotion) {
      if (startTimeRef.current === null) {
        startTimeRef.current = t;
      }
      time.set(t - startTimeRef.current);
    }
  });

  // Reset on phase change
  useEffect(() => {
    startTimeRef.current = null;
  }, [phase]);

  return {
    blobTransforms,
    edgeClarity,
  };
}
