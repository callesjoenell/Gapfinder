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
- Shows emotional language ("frustrated", "obsessed", "love", "hate")
- Asks follow-up questions about their own answers
- Mentions time investments ("spent 3 years", "been doing this since")

Analyze the conversation and determine:
1. Depth level for each topic
2. Which specific moments showed high energy
3. What the user is most focused on right now
4. Whether they're ready to complete this phase
5. If not ready, what topics need more depth`;
}
