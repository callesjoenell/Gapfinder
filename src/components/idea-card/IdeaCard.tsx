/**
 * IdeaCard - Container component managing card state and layout
 * Renders BlobBackground with measured dimensions and collapse functionality
 */

import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';

// DEBUG: Full layout hierarchy debug mode
const IDEA_DEBUG = true;
import { useLocalStorage } from 'react-use';
import type { Id } from '../../../convex/_generated/dataModel';
import { useQuery, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { BlobBackground } from './BlobBackground';
import { BlobWords } from './BlobWords';
import { IdeaCardContent } from './IdeaCardContent';
import { TestingControls } from './TestingControls';
import { MOCK_PHASE_STATES } from '../../fixtures/phaseStates';

interface IdeaCardProps {
  sessionId: Id<'sessions'>;
  currentPhase: number;
  splitRatio?: number;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function IdeaCard({ sessionId, currentPhase, splitRatio, onCollapseChange }: IdeaCardProps) {
  // Persistent collapse state via localStorage
  const [isCollapsed, setIsCollapsed] = useLocalStorage('ideaCard-collapsed', false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Notify parent of collapse state changes
  useEffect(() => {
    onCollapseChange?.(!!isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed, setIsCollapsed]);

  // Test mode detection and state
  const [isTestMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('testMode') === 'true';
  });
  const [testPhase, setTestPhase] = useState(0);

  // Query idea card data from Convex (skip in test mode)
  const ideaData = useQuery(
    api.ideas.getIdeaCard,
    isTestMode ? 'skip' : { sessionId }
  );

  // Query message count for triggering extraction on new messages (skip in test mode)
  const messageCount = useQuery(
    api.messages.getMessageCount,
    isTestMode ? 'skip' : { sessionId }
  );

  // Query session score for color transition (skip in test mode)
  const scoreData = useQuery(
    api.sessions.getSessionScore,
    isTestMode ? 'skip' : { sessionId }
  );

  // Action to trigger idea extraction
  const extractIdea = useAction(api.ideasActions.extractIdeaContent);

  // Track previous message count to detect new messages
  const prevMessageCountRef = useRef<number>(messageCount ?? 0);

  // Trigger extraction on phase changes AND message count changes (CARD-06)
  // Skip in test mode
  useEffect(() => {
    if (isTestMode) return;

    // Only trigger if we have a valid message count
    if (messageCount === undefined) return;

    // Trigger extraction when:
    // 1. Phase changes to >= 1 (initial keyword extraction)
    // 2. New messages arrive (idea refinement during conversation)
    const hasNewMessages = messageCount > prevMessageCountRef.current;

    if (currentPhase >= 1 && (hasNewMessages || prevMessageCountRef.current === 0)) {
      extractIdea({ sessionId });
    }

    prevMessageCountRef.current = messageCount;
  }, [isTestMode, currentPhase, messageCount, sessionId, extractIdea]);

  // Use mock data in test mode, real data otherwise
  const effectivePhase = isTestMode ? testPhase : currentPhase;
  const mockData = isTestMode ? MOCK_PHASE_STATES[testPhase] : null;
  const effectiveIdeaData = isTestMode
    ? mockData
    : ideaData;

  // Compute merge state with edge case handling:
  // Only merge if both phase >= 3 AND we have an actual idea sentence
  // This handles the case where extractIdeaContent runs but returns ideaReady=false
  const isMerging = effectivePhase >= 3 && !!effectiveIdeaData?.ideaSentence;

  // Compute color scheme based on score threshold
  const effectiveScore = isTestMode ? mockData?.score ?? null : scoreData?.score ?? null;
  const passesThreshold = effectiveScore !== null && effectiveScore >= 20;
  const colorScheme: 'orange' | 'green' = passesThreshold ? 'green' : 'orange';

  // Debug: log IdeaCard computed styles on every render
  useEffect(() => {
    if (!IDEA_DEBUG || !containerRef.current) return;
    const el = containerRef.current;
    const c = window.getComputedStyle(el);
    console.log(
      `[DEBUG IDEA-CARD] offsetH=${el.offsetHeight} clientH=${el.clientHeight}`,
      `| height=${c.height} style.height=${el.style.height}`,
      `| flex=${c.flex} flexShrink=${c.flexShrink} flexGrow=${c.flexGrow}`,
      `| overflow=${c.overflow} overflowY=${c.overflowY}`,
      `| position=${c.position}`,
      `| splitRatio=${splitRatio}`,
    );
  });

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
  }, [splitRatio]);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-white/50 overflow-hidden duration-300 shrink-0"
      style={{
        height: isCollapsed ? '4rem' : `${(splitRatio ?? 0.5) * 100}%`,
        transitionProperty: 'height',
        ...(IDEA_DEBUG ? { outline: "4px solid yellow" } : {}),
      }}
    >
      {IDEA_DEBUG && (
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 120,
            background: "yellow",
            color: "black",
            fontSize: 10,
            fontFamily: "monospace",
            padding: "1px 4px",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          IDEA-CARD (h={isCollapsed ? '4rem' : `${Math.round((splitRatio ?? 0.5) * 100)}%`})
        </span>
      )}
      {/* Collapse/expand toggle button */}
      <button
        onClick={handleToggleCollapse}
        className="absolute top-2 right-2 z-30 p-2 rounded-md bg-white/80 hover:bg-white transition-colors"
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

      {/* Blob background - only render when expanded, positioned as background layer */}
      {!isCollapsed && (
        <div className="absolute inset-0 z-0">
          <BlobBackground
            phase={effectivePhase}
            width={dimensions.width}
            height={dimensions.height}
            isMerging={isMerging}
            colorScheme={colorScheme}
          />
        </div>
      )}

      {/* BlobWords - render when phase 1-2 and not merging */}
      {!isCollapsed && !isMerging && effectivePhase >= 1 && effectiveIdeaData?.ideaKeywords && (
        <BlobWords
          keywords={effectiveIdeaData.ideaKeywords}
          blobBounds={[
            { x: 150, y: 100, width: 200, height: 200 },
            { x: 650, y: 100, width: 200, height: 200 },
            { x: 100, y: 300, width: 200, height: 200 },
            { x: 700, y: 300, width: 200, height: 200 },
            { x: 150, y: 500, width: 200, height: 200 },
            { x: 650, y: 500, width: 200, height: 200 },
          ]}
          phase={effectivePhase}
        />
      )}

      {/* IdeaCardContent - render when merged, positioned over blob background */}
      {!isCollapsed && isMerging && effectiveIdeaData?.ideaSentence && (
        <IdeaCardContent
          ideaSentence={effectiveIdeaData.ideaSentence}
          supportingSentences={effectiveIdeaData.supportingSentences ?? []}
          isVisible={isMerging}
          colorScheme={colorScheme}
        />
      )}

      {/* Testing controls - only render in test mode */}
      {isTestMode && (
        <TestingControls
          currentTestPhase={testPhase}
          onPhaseChange={setTestPhase}
        />
      )}

      {/* Collapsed state - show phase indicator with gradient hint */}
      {isCollapsed && (
        <div
          className="flex items-center h-full px-4 transition-all duration-300"
          style={{
            background: colorScheme === 'green'
              ? 'linear-gradient(90deg, rgba(144,238,144,0.3) 0%, rgba(34,139,34,0.2) 100%)'
              : 'linear-gradient(90deg, rgba(255,229,180,0.3) 0%, rgba(255,165,0,0.2) 100%)',
          }}
        >
          <span className="text-sm text-gray-700 font-medium">
            Phase {effectivePhase}
          </span>
          <span className="text-xs text-gray-500 ml-2">
            {effectivePhase === 0 && 'Initial exploration'}
            {effectivePhase >= 1 && effectivePhase <= 2 && 'Building idea'}
            {effectivePhase >= 3 && effectivePhase <= 6 && 'Idea formed'}
            {effectivePhase >= 7 && 'Evaluating'}
          </span>
        </div>
      )}
    </div>
  );
}
