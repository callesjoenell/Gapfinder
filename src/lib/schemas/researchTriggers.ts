import { z } from "zod";

export const TriggerDetectionSchema = z.object({
  triggers: z.array(z.object({
    category: z.enum(["market_claim", "competitor_mention", "pain_point", "assumption"]),
    quote: z.string().describe("Exact text from user that triggered detection"),
    suggestedSources: z.array(z.enum(["reddit", "hn", "producthunt", "tavily", "stackoverflow"])).max(3),
    researchAngle: z.string().describe("Specific search query or question to investigate"),
    priority: z.enum(["high", "medium", "low"]),
  })),
  shouldSuggest: z.boolean().describe("Based on intensity setting and trigger quality, should Claude suggest research now?"),
});

export type ResearchTrigger = z.infer<typeof TriggerDetectionSchema>["triggers"][number];

/**
 * Builds the trigger detection prompt with intensity-specific guidance
 */
export function buildTriggerDetectionPrompt(
  intensitySetting: "low" | "medium" | "high",
  searchedSources: string[]
): string {
  const intensityGuidance = {
    low: `**LOW INTENSITY MODE:**
Only trigger on explicit claims with no supporting evidence:
- User makes specific market size claims ("there are 2M people who...")
- User states facts about competitors without verification
- User claims problem severity without evidence

Do NOT trigger on:
- General statements or opinions
- Pain points (unless claiming market data)
- Vague assumptions`,

    medium: `**MEDIUM INTENSITY MODE:**
Trigger on claims, competitor mentions, and clear pain point descriptions:
- Market claims (size, growth, trends)
- Competitor mentions (features, pricing, gaps)
- Specific pain point descriptions ("every time I try X, Y happens")
- Distribution assumptions ("I can reach them via...")

Do NOT trigger on:
- General brainstorming
- Implicit assumptions (trigger only if central to the idea)`,

    high: `**HIGH INTENSITY MODE:**
Trigger on everything including implicit assumptions:
- All market claims
- All competitor mentions
- All pain point descriptions
- Assumptions about customer behavior
- Timing/trend assumptions
- Distribution assumptions
- Technology feasibility assumptions

Be proactive — if there's ANY claim that could be validated, trigger it.`,
  };

  const searchedText = searchedSources.length > 0
    ? `\n\nAlready searched sources (don't suggest again unless new angle): ${searchedSources.join(", ")}`
    : "";

  return `You are detecting research triggers in a conversation about an idea.

${intensityGuidance[intensitySetting]}

**Trigger Categories:**
1. **market_claim**: User makes claims about market size, growth, trends, or demand
2. **competitor_mention**: User mentions existing products, companies, or alternatives
3. **pain_point**: User describes specific problems or frustrations people experience
4. **assumption**: User assumes something about customers, behavior, or feasibility

**For each trigger:**
- Quote the exact text that triggered it
- Suggest up to 3 most relevant sources (reddit, hn, producthunt, tavily, stackoverflow)
- Provide a specific research angle (search query or question to investigate)
- Assign priority (high/medium/low) based on centrality to the idea

**Priority Guidelines:**
- HIGH: Core assumptions the idea depends on
- MEDIUM: Supporting claims that would strengthen/weaken the idea
- LOW: Nice-to-know background information

**shouldSuggest Decision:**
- Consider intensity setting and trigger quality
- Don't suggest if triggers are all LOW priority
- Don't suggest if already searched this angle
${searchedText}

Analyze the recent conversation and detect triggers.`;
}
