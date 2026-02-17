import { z } from "zod";
import { getPhaseConfig, getTopicKeys } from "../phaseConfig";

const depthEnum = z.enum(["not_mentioned", "surface", "moderate", "deep"]);

/**
 * Creates a phase-specific coverage extraction schema based on coverageTopics
 */
export function createCoverageSchema(phaseNumber: number) {
  const topicKeys = getTopicKeys(phaseNumber);
  const topicsShape: Record<string, typeof depthEnum> = {};

  for (const key of topicKeys) {
    topicsShape[key] = depthEnum;
  }

  return z.object({
    topicsDiscussed: z.object(topicsShape),
    energyPeaks: z.array(z.string()).describe("Specific topics/moments with high user energy"),
    currentFocus: z.string().describe("Topic user is most engaged with right now"),
    depthSummary: z.object({
      topicsAtDeep: z.number(),
      topicsAtModerate: z.number(),
      topicsAtSurface: z.number(),
      topicsNotMentioned: z.number(),
    }),
    readyForPhaseCompletion: z.boolean(),
    whatsMissing: z.array(z.string()).optional().describe("Topics needing more depth if not ready"),
  });
}

export type CoverageResult = z.infer<ReturnType<typeof createCoverageSchema>>;

/**
 * Builds the system prompt for coverage extraction
 */
export function buildCoverageExtractionPrompt(
  phaseNumber: number,
  currentCoverage: Record<string, string>
): string {
  const phaseConfig = getPhaseConfig(phaseNumber);
  if (!phaseConfig) {
    throw new Error(`Invalid phase number: ${phaseNumber}`);
  }

  const topicDescriptions = phaseConfig.coverageTopics
    .map((topic) => `- **${topic.key}**: ${topic.label} — ${topic.description}`)
    .join("\n");

  const currentCoverageText = Object.keys(currentCoverage).length > 0
    ? `\n\nCurrent coverage state:\n${Object.entries(currentCoverage)
        .map(([key, depth]) => `- ${key}: ${depth}`)
        .join("\n")}`
    : "";

  return `You are analyzing conversation coverage for Phase ${phaseNumber}: ${phaseConfig.name}.

Your task: Extract what topics have been discussed and at what depth level.

**Depth Definitions:**
- **not_mentioned**: Topic hasn't been brought up at all
- **surface**: Topic mentioned, but no specific detail or examples
- **moderate**: Specific examples provided, some personal detail shared
- **deep**: Multiple examples, emotional language, patterns identified by user

**Topics to track:**
${topicDescriptions}
${currentCoverageText}

**Energy Signals:**
Watch for moments where the user:
- Provides longer, more detailed answers
- Uses specific examples and stories
- Shows emotional language — BOTH pain ("frustrated", "hate", "exhausted") AND aspiration ("obsessed", "love", "longing", "dream of", "called to", "yearning", "inspired")
- Asks follow-up questions about their own answers
- Mentions time investments ("spent 3 years", "been doing this since")
- Describes identity or belonging signals ("I want to be someone who...", "I want to find my people", "I've always wanted to...")

IMPORTANT: Aspiration and belonging signals are EQUALLY powerful energy signals as pain signals. A short but deeply felt message about identity ("I want to help people become who they really are") can carry as much energy as a long frustrated rant. Watch for emotional weight, not just message length.

**Need Depth Assessment (for segment_depth and need_acuity topics):**
When these topics appear in a phase, assess using the Need Depth Ladder:
- Level 1-2 (surface): User describes use cases, broad audiences, convenience framing, "anyone could use this"
- Level 3 (moderate): User names a specific audience with a real desire, but hasn't explored what they DO about it today
- Level 4-5 (deep): User names a specific PERSON or vivid archetype AND one of these:
  - Pain path: describes failed workarounds, emotional cost of status quo, urgency to change
  - Aspiration path: describes what person does TODAY to chase this feeling (communities joined, premium paid, DIY rituals), what identity they're building, what "finding their people" would mean
  - Community path: describes people already forming groups, adopting shared identity markers, creating informal versions of this experience

Mark segment_depth/need_acuity as "deep" when evidence shows level 4-5 need — whether the driver is pain relief, identity becoming, community belonging, or experience creation.

Analyze the conversation and determine:
1. Depth level for each topic
2. Which specific moments showed high energy
3. What the user is most focused on right now
4. Whether they're ready to complete this phase
5. If not ready, what topics need more depth`;
}
