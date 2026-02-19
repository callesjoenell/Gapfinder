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
  // User feedback: 90% fuzzy → 70% fuzzy → 50% fuzzy
  // 90% fuzzy = edgeClarity 0.1 (very blurred)
  // 70% fuzzy = edgeClarity 0.3 (quite blurred)
  // 50% fuzzy = edgeClarity 0.5 (moderate blur - final merged state)
  const edgeClarity = (() => {
    if (phase === 0) {
      return 0.1; // 90% fuzzy - super blurred
    } else if (phase === 1) {
      return 0.15; // Still very fuzzy
    } else if (phase === 2) {
      return 0.3; // 70% fuzzy
    } else if (phase >= 3) {
      return 0.5; // 50% fuzzy - final merged state
    }
    return 0.1;
  })();

  // Calculate convergence factor - how much blobs move toward center
  // User feedback: Keep blobs MORE spread out and BIGGER in phases 0-2
  // Phase 0-2: 0% (blobs stay at starting positions - spread out)
  // Phase 3+: merge animation takes over (handled in BlobBackground)
  const convergenceFactor = phase >= 3 ? 0 : 0;

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
