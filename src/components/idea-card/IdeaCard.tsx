/**
 * IdeaCard - Container component managing card state and layout
 * Renders BlobBackground with measured dimensions and collapse functionality
 */

import { useState, useRef, useLayoutEffect } from 'react';
import type { Id } from '../../../convex/_generated/dataModel';
import { BlobBackground } from './BlobBackground';

interface IdeaCardProps {
  sessionId: Id<'sessions'>;
  currentPhase: number;
}

export function IdeaCard({ currentPhase }: IdeaCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure container dimensions for BlobBackground
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    // Initial measurement
    updateDimensions();

    // Update on window resize
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`
        relative w-full bg-white/50 overflow-hidden transition-all duration-300
        ${isCollapsed ? 'h-16' : 'h-[40vh] md:h-[25vh]'}
      `}
    >
      {/* Collapse/expand toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-2 right-2 z-10 p-2 rounded-md bg-white/80 hover:bg-white transition-colors"
        aria-label={isCollapsed ? 'Expand card' : 'Collapse card'}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={`transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
        >
          {/* Chevron icon */}
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Blob background - only render when expanded */}
      {!isCollapsed && (
        <BlobBackground
          phase={currentPhase}
          width={dimensions.width}
          height={dimensions.height}
        />
      )}

      {/* Collapsed state - show phase indicator */}
      {isCollapsed && (
        <div className="flex items-center h-full px-4">
          <span className="text-sm text-gray-600">
            Phase {currentPhase}: Idea Card
          </span>
        </div>
      )}
    </div>
  );
}
