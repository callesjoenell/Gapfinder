/**
 * Blob animation hook
 * Orchestrates blob drift and centripetal convergence based on phase
 */

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
  _shouldReduceMotion: boolean
): UseBlobAnimationReturn {
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

  // Generate transforms for each blob with centripetal convergence
  // The local drift animation is handled by Motion in BlobBackground
  const blobTransforms = BLOB_ZONES.map((zone) => {
    // Calculate position with centripetal convergence
    // Start position: zone position
    // End position (at convergenceFactor=0.3): 30% toward CARD_CENTER
    const x = lerp(zone.x, CARD_CENTER.x, convergenceFactor);
    const y = lerp(zone.y, CARD_CENTER.y, convergenceFactor);

    return {
      x,
      y,
      scale: 1,
    };
  });

  return {
    blobTransforms,
    edgeClarity,
  };
}
