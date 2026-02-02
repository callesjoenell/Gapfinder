/**
 * IdeaCardContent - Displays crystallized idea sentence and supporting sentences
 * Renders merged card content with dynamic text sizing and crossfade animations
 */

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFitText } from './hooks/useFitText';
import { BLOB_COLORS } from './utils/blobShapes';

interface SupportingSentence {
  text: string;
  areaIndex: number;
}

interface IdeaCardContentProps {
  ideaSentence: string;
  supportingSentences: SupportingSentence[];
  isVisible: boolean;
}

export function IdeaCardContent({
  ideaSentence,
  supportingSentences,
  isVisible,
}: IdeaCardContentProps) {
  const ideaRef = useRef<HTMLDivElement | null>(null);
  // Cast ref to match useFitText signature - HTMLDivElement extends HTMLElement
  const optimalFontSize = useFitText(ideaRef as React.RefObject<HTMLElement>, ideaSentence);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={ideaSentence} // Trigger remount on content change for crossfade
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: {
              delay: 1,
              duration: 2,
              ease: 'easeInOut',
            },
          }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8"
        >
          {/* Idea sentence - bold, larger, prominent */}
          <div
            ref={ideaRef}
            className="w-full max-w-3xl text-center mb-6"
            style={{
              fontSize: `${optimalFontSize}px`,
              fontWeight: 'bold',
              color: '#2d3748', // Dark gray
              lineHeight: 1.3,
            }}
          >
            {ideaSentence}
          </div>

          {/* Supporting sentences - smaller, lighter */}
          <div className="w-full max-w-2xl space-y-3">
            {supportingSentences.map((sentence, i) => {
              const blobColor = BLOB_COLORS[sentence.areaIndex]?.fill || '#FFA500';

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 1.5 + i * 0.2,
                    duration: 0.8,
                    ease: 'easeOut',
                  }}
                  className="pl-4 border-l-4 text-sm text-gray-600"
                  style={{
                    borderLeftColor: blobColor,
                  }}
                >
                  {sentence.text}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
