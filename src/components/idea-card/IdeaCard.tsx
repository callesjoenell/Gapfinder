/**
 * IdeaCard - Container component managing card state and layout
 * Renders BlobBackground with measured dimensions and collapse functionality
 */

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
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
}

export function IdeaCard({ sessionId, currentPhase }: IdeaCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

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
          phase={effectivePhase}
          width={dimensions.width}
          height={dimensions.height}
          isMerging={isMerging}
          colorScheme={colorScheme}
        />
      )}

      {/* BlobWords - render when phase 1-2 and not merging */}
      {!isCollapsed && !isMerging && effectivePhase >= 1 && effectiveIdeaData?.ideaKeywords && (
        <BlobWords
          keywords={effectiveIdeaData.ideaKeywords}
          blobBounds={[
            { x: 200, y: 150, width: 160, height: 160 },
            { x: 600, y: 150, width: 160, height: 160 },
            { x: 150, y: 300, width: 160, height: 160 },
            { x: 650, y: 300, width: 160, height: 160 },
            { x: 200, y: 450, width: 160, height: 160 },
            { x: 600, y: 450, width: 160, height: 160 },
          ]}
          phase={effectivePhase}
        />
      )}

      {/* IdeaCardContent - render when merged */}
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
