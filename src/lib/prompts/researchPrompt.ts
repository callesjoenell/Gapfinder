/**
 * Research orchestration additions to system prompt
 * Added to base prompt when user is in Phase 0-2 (exploration research phases)
 */

export function getResearchPromptAddition(
  hasResearchFindings: boolean,
  manualResearchContext: string | null
): string {
  const baseResearch = `
## RESEARCH TOOLS

You have access to research tools to help validate ideas with real data:

**Auto-Research (use automatically when relevant):**
- search_reddit: Pain signals, complaints, frustrations
- search_hackernews: Tech builder sentiment, discussions
- search_tavily: General web search for any topic
- search_producthunt: Competition, what's launching
- search_stackoverflow: Technical problems, unanswered questions

**Paid Feature (always confirm with user first):**
- get_keyword_volume: Search volume data (costs credits - ALWAYS ask user before using)

**When to research:**
- User mentions a problem area -> search Reddit/HN for validation
- User names competitors -> search ProductHunt for similar products
- User wants market size -> offer keyword volume lookup (paid)
- User asks "is this a real problem?" -> search multiple sources for triangulation

**Research pattern:**
1. Identify what needs validation
2. Choose appropriate source(s)
3. Execute search, summarize findings
4. Connect findings back to user's specific situation

**Manual research (when user needs to do it themselves):**
For sources without APIs, guide users to do manual research:
- Facebook Groups: "I'll give you a checklist for Facebook Groups research"
- LinkedIn: "Let me prepare a LinkedIn research checklist"
- Twitter/X: "Here's what to look for on Twitter"
- Amazon Reviews: "Check Amazon reviews using this checklist"

When suggesting manual research, tell the user: "Type 'show checklist for [platform]' to get the research form."

**Summarizing research:**
- Lead with the insight, not the source
- "People on Reddit are frustrated about X" not "Reddit results show..."
- Connect every finding to the user's specific problem/idea
- Call out patterns across multiple sources when they align
`;

  const findingsContext = hasResearchFindings
    ? `
## PREVIOUS RESEARCH FINDINGS

Research has already been conducted in this session. Reference these findings when relevant, and build on them rather than re-researching the same topics.
`
    : "";

  const manualContext = manualResearchContext
    ? `
## USER'S MANUAL RESEARCH FINDINGS

The user has submitted manual research. Incorporate these insights into your analysis:

${manualResearchContext}
`
    : "";

  return baseResearch + findingsContext + manualContext;
}

/**
 * Get prompt for triggering manual research checklist
 */
export function getChecklistTriggerPatterns(): RegExp[] {
  return [
    /show\s+checklist\s+for\s+(facebook|linkedin|twitter|amazon)/i,
    /give\s+me\s+(the\s+)?(facebook|linkedin|twitter|amazon)\s+checklist/i,
    /(facebook|linkedin|twitter|amazon)\s+(groups?\s+)?research\s+checklist/i,
  ];
}

/**
 * Map trigger to checklist type
 */
export function parseChecklistType(
  message: string
): "facebook_groups" | "linkedin" | "twitter" | "amazon_reviews" | "conversation_prep" | "conversation_debrief" | null {
  const lower = message.toLowerCase();

  if (lower.includes("conversation prep") || lower.includes("interview prep") || lower.includes("prep checklist")) return "conversation_prep";
  if (lower.includes("conversation debrief") || lower.includes("debrief") || lower.includes("talked to") && lower.includes("checklist")) return "conversation_debrief";
  if (lower.includes("facebook")) return "facebook_groups";
  if (lower.includes("linkedin")) return "linkedin";
  if (lower.includes("twitter") || lower.includes("x ")) return "twitter";
  if (lower.includes("amazon")) return "amazon_reviews";

  return null;
}
