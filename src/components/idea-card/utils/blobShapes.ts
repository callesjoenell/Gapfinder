/**
 * Blob shape generation utilities
 * Provides reproducible organic blob shapes using seed-based randomness
 */

/**
 * Seed values for 6 reproducible blob shapes
 * Each seed generates a unique but consistent blob shape
 */
export const BLOB_SEEDS = [42, 137, 271, 419, 563, 701];

/**
 * Seeded pseudo-random number generator
 * Ensures same seed produces same blob shape every time
 */
function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

/**
 * Generate an organic blob SVG path using polar coordinates
 * @param seed - Seed for reproducible randomness
 * @param centerX - X coordinate of blob center
 * @param centerY - Y coordinate of blob center
 * @param radius - Base radius of the blob
 * @param edges - Number of control points (default 8 for smooth curves)
 * @param aspectRatio - Horizontal stretch factor (default 1.8 for wider blobs)
 * @returns SVG path string
 */
export function generateBlobPath(
  seed: number,
  centerX: number,
  centerY: number,
  radius: number,
  edges: number = 8,
  aspectRatio: number = 1.8
): string {
  const random = seededRandom(seed);
  const points: { x: number; y: number }[] = [];

  // Generate irregular points using polar coordinates with noise
  // Apply aspect ratio to make blobs wider horizontally
  for (let i = 0; i < edges; i++) {
    const angle = (i / edges) * Math.PI * 2;
    const radiusVariation = radius * (0.7 + random() * 0.6); // 70%-130% of base radius
    const angleNoise = (random() - 0.5) * 0.3; // Small angle variation

    const adjustedAngle = angle + angleNoise;
    // Apply aspect ratio to x-coordinate for horizontal stretching
    const x = centerX + Math.cos(adjustedAngle) * radiusVariation * aspectRatio;
    const y = centerY + Math.sin(adjustedAngle) * radiusVariation;

    points.push({ x, y });
  }

  // Create smooth path using quadratic curves
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];

    // Control point between current and next
    const controlX = (current.x + next.x) / 2;
    const controlY = (current.y + next.y) / 2;

    path += ` Q ${current.x} ${current.y}, ${controlX} ${controlY}`;
  }

  path += ' Z';
  return path;
}

/**
 * Multi-color gradient definitions for the 6 blobs
 * Each blob has a unique gradient blending between green, yellow, and orange
 * Gradients have 3-4 stops for rich color blending
 */
export const BLOB_COLORS = [
  // Blob 0: Yellow → Orange
  {
    stops: [
      { offset: '0%', color: '#FFD700' },    // gold yellow
      { offset: '50%', color: '#FFA500' },   // orange
      { offset: '100%', color: '#FF8C00' },  // dark orange
    ],
    direction: { x1: '0%', y1: '0%', x2: '100%', y2: '100%' }
  },
  // Blob 1: Light Green → Yellow
  {
    stops: [
      { offset: '0%', color: '#90EE90' },    // light green
      { offset: '60%', color: '#FFD700' },   // gold yellow
      { offset: '100%', color: '#FFA500' },  // orange
    ],
    direction: { x1: '100%', y1: '0%', x2: '0%', y2: '100%' }
  },
  // Blob 2: Orange → Yellow → Green hint
  {
    stops: [
      { offset: '0%', color: '#FFA500' },    // orange
      { offset: '40%', color: '#FFD700' },   // gold yellow
      { offset: '70%', color: '#FFEB3B' },   // bright yellow
      { offset: '100%', color: '#C5E1A5' },  // sage green
    ],
    direction: { x1: '0%', y1: '100%', x2: '100%', y2: '0%' }
  },
  // Blob 3: Yellow → Light Green
  {
    stops: [
      { offset: '0%', color: '#FFEB3B' },    // bright yellow
      { offset: '50%', color: '#FFF59D' },   // pale yellow
      { offset: '100%', color: '#98FB98' },  // pale green
    ],
    direction: { x1: '50%', y1: '0%', x2: '50%', y2: '100%' }
  },
  // Blob 4: Orange → Yellow
  {
    stops: [
      { offset: '0%', color: '#FF8C00' },    // dark orange
      { offset: '50%', color: '#FFB74D' },   // soft orange
      { offset: '100%', color: '#FFD700' },  // gold yellow
    ],
    direction: { x1: '100%', y1: '100%', x2: '0%', y2: '0%' }
  },
  // Blob 5: Green → Yellow → Orange
  {
    stops: [
      { offset: '0%', color: '#C5E1A5' },    // sage green
      { offset: '30%', color: '#D4E89D' },   // lime green
      { offset: '70%', color: '#FFD700' },   // gold yellow
      { offset: '100%', color: '#FFA500' },  // orange
    ],
    direction: { x1: '0%', y1: '50%', x2: '100%', y2: '50%' }
  },
];

/**
 * Center point that blobs drift toward during phases 0-2
 */
export const CARD_CENTER = { x: 400, y: 300 };

/**
 * Starting zones for the 6 blobs - outer edges arrangement
 * Each blob starts in its zone and drifts toward CARD_CENTER
 * Positioned to cover the full card area (800x600 viewBox)
 * Spread wider horizontally to use more of the 800px width
 * maxDrift defines the local movement range within the zone
 */
export const BLOB_ZONES = [
  { x: 80, y: 100, maxDrift: 15 }, // Top-left corner (further left)
  { x: 720, y: 100, maxDrift: 15 }, // Top-right corner (further right)
  { x: 50, y: 300, maxDrift: 15 }, // Middle-left edge (further left)
  { x: 750, y: 300, maxDrift: 15 }, // Middle-right edge (further right)
  { x: 80, y: 500, maxDrift: 15 }, // Bottom-left corner (further left)
  { x: 720, y: 500, maxDrift: 15 }, // Bottom-right corner (further right)
];
