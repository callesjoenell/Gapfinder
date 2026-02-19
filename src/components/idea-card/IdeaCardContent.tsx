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
  colorScheme?: 'orange' | 'green';
}

export function IdeaCardContent({
  ideaSentence,
  supportingSentences,
  isVisible,
  colorScheme = 'orange',
}: IdeaCardContentProps) {
  const ideaRef = useRef<HTMLDivElement | null>(null);
  // Cast ref to match useFitText signature - HTMLDivElement extends HTMLElement
  const optimalFontSize = useFitText(ideaRef as React.RefObject<HTMLElement>, ideaSentence);

  // Define colors based on scheme
  const isGreen = colorScheme === 'green';
  const bgColor = isGreen ? '#1a4d1a' : 'transparent'; // Dark green or transparent
  const textColor = isGreen ? '#ffffff' : '#2d3748'; // White or dark gray

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={ideaSentence} // Trigger remount on content change for crossfade
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            backgroundColor: bgColor,
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: {
              delay: 1,
              duration: 2,
              ease: 'easeInOut',
            },
            backgroundColor: {
              duration: 2.5,
              ease: 'easeInOut',
            },
          }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8"
        >
          {/* Idea sentence - bold, larger, prominent */}
          <motion.div
            ref={ideaRef}
            className="w-full max-w-3xl text-center mb-6"
            animate={{ color: textColor }}
            transition={{ duration: 2.5, ease: 'easeInOut' }}
            style={{
              fontSize: `${optimalFontSize}px`,
              fontWeight: 'bold',
              lineHeight: 1.3,
              textShadow: isGreen ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(255,255,255,0.8)',
            }}
          >
            {ideaSentence}
          </motion.div>

          {/* Supporting sentences - smaller, lighter */}
          <div className="w-full max-w-2xl space-y-3">
            {supportingSentences.map((sentence, i) => {
              const blobColor = BLOB_COLORS[sentence.areaIndex]?.stops[0]?.color || '#FFA500';
              const supportingTextColor = isGreen ? '#e0e0e0' : '#4a5568';

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    color: supportingTextColor,
                  }}
                  transition={{
                    delay: 1.5 + i * 0.2,
                    duration: 0.8,
                    ease: 'easeOut',
                    color: { duration: 2.5, ease: 'easeInOut' },
                  }}
                  className="pl-4 border-l-4 text-sm"
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
