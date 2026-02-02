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
 * Color pairs for the 6 blobs - gradient between yellow and orange
 */
export const BLOB_COLORS = [
  { fill: '#FFD700', gradient: '#FFF3B0' }, // Gold
  { fill: '#FFCC00', gradient: '#FFE680' }, // Deep yellow
  { fill: '#FFB700', gradient: '#FFD966' }, // Amber
  { fill: '#FFA500', gradient: '#FFCC80' }, // Orange
  { fill: '#FF9500', gradient: '#FFBB66' }, // Deep orange
  { fill: '#FFB84D', gradient: '#FFD9A3' }, // Light orange
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
