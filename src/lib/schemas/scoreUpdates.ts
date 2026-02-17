import { z } from "zod";

export const RescoringSchema = z.object({
  opportunityName: z.string(),
  dimensionScores: z.object({
    market_fit: z.number().min(1).max(10),
    pain_urgency: z.number().min(1).max(10),
    timing: z.number().min(1).max(10),
    distribution: z.number().min(1).max(10),
    founder_fit: z.number().min(1).max(10),
  }),
  changes: z.array(z.object({
    dimension: z.string(),
    oldScore: z.number(),
    newScore: z.number(),
    direction: z.enum(["up", "down", "unchanged"]),
    explanation: z.string().describe("Natural language: why this changed"),
  })),
  overallAssessment: z.string().describe("1-2 sentence summary"),
  confidenceLevel: z.enum(["low", "medium", "high"]).describe("Based on evidence quality"),
});

export type RescoreResult = z.infer<typeof RescoringSchema>;

/**
 * Builds the rescoring prompt with critical rules
 */
export function buildRescoringPrompt(): string {
  return `You are updating opportunity scores based on new information from the conversation.

**CRITICAL RULES:**

1. **Scores CAN go down** — Be honest about weaknesses discovered
2. **Be useful, not encouraging** — No cheerleading, just accurate assessment
3. **Explain EVERY change** — Even if score stays the same, explain why
4. **Base on evidence** — Changes must be justified by conversation content
5. **Confidence matters** — Low confidence if based on assumptions, high if based on data

**Scoring Dimensions (1-10):**

1. **market_fit**: How well does this solve a real problem people have?
   - 1-3: Weak fit, unclear if anyone needs this
   - 4-6: Decent fit, some evidence of need
   - 7-10: Strong fit, clear evidence of demand

2. **pain_urgency**: How badly do people need this solved?
   - 1-3: Nice-to-have, low urgency
   - 4-6: Moderate pain, people actively seek solutions
   - 7-10: Severe pain, people willing to pay now

3. **timing**: Why is this the right time?
   - 1-3: No timing advantage, could've been built years ago
   - 4-6: Some timing factors support this
   - 7-10: Clear timing advantage (tech/regulation/market shift)

4. **distribution**: Can the founder reach customers efficiently?
   - 1-3: No clear path to customers
   - 4-6: Plausible distribution path, needs validation
   - 7-10: Direct access to customers, proven channel

5. **founder_fit**: Does this leverage founder's specific advantages?
   - 1-3: Generic opportunity anyone could pursue
   - 4-6: Some advantage but not unique
   - 7-10: Strong unfair advantage (expertise/network/insight)

**Your Task:**
1. Review the conversation for new information affecting these dimensions
2. Update each score (can go up, down, or stay the same)
3. For EACH dimension, explain what changed and why
4. Provide overall assessment (1-2 sentences)
5. Rate confidence based on evidence quality

**Example Change Explanation:**
"Market fit increased from 5 to 7 because user provided specific examples of 3 people asking for this solution, and found Reddit threads with 200+ upvotes discussing the exact problem."

Be brutally honest. User needs accurate assessment, not validation.`;
}
