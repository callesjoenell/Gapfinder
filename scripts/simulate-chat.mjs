#!/usr/bin/env node

/**
 * Gap Finder Chat Simulation Engine
 *
 * Simulates a multi-phase conversation between Marcus (played by Claude)
 * and the Gap Finder system (also Claude with the real system prompt).
 *
 * Marcus knows his LIFE but NOT his ideas -- ideas emerge organically.
 *
 * Usage:
 *   node scripts/simulate-chat.mjs                   # Full simulation
 *   node scripts/simulate-chat.mjs --turns 5 --dry-run  # Quick 5-turn test
 */

import Anthropic from "@anthropic-ai/sdk";
import { execSync } from "child_process";
import { gunzipSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// ── CLI Args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}
const DRY_RUN = args.includes("--dry-run");
const DRY_RUN_TURNS = parseInt(getArg("turns") || "5");
const MODEL = "claude-haiku-4-5-20251001";

// ── Phase Configuration (ported from src/lib/phaseConfig.ts) ────────────────

const PHASES = [
  {
    number: 0,
    name: "Know Yourself",
    shortName: "Know",
    path: "exploration",
    description: "Discover your unfair advantages through excavating 6 starting points",
    completionCriteria: [
      "User has answered excavation questions for all 6 starting points (Life Situation, Profession, Hobbies, Skills Others Pay For, Networks, Transformations Made)",
      "User has scored each area on Depth (1-5), Access (1-5), Energy (1-5)",
      "At least one area scores 12+ total",
      "User has articulated WHY this area gives unfair advantage",
      "User has clear direction for Phase 1 research",
    ],
    coverageTopics: [
      { key: "life_situation", label: "Life Situation", description: "Experiences that shaped you" },
      { key: "profession", label: "Profession", description: "Insider knowledge others don't have" },
      { key: "hobbies", label: "Hobbies", description: "Enthusiasm + community access" },
      { key: "skills_others_pay_for", label: "Skills Others Pay For", description: "Proven market value" },
      { key: "networks", label: "Networks", description: "Relationship access advantage" },
      { key: "transformations", label: "Transformations", description: "Journey already completed" },
    ],
    timeEstimate: "15-20 min",
    instructions: `Phase 0: Know Yourself

Your goal: Help user discover their unfair advantages through excavating 6 starting points:
1. Life Situation (pain lived personally OR formative experiences)
2. Profession (insider knowledge others don't have)
3. Hobbies (enthusiasm + community access + passion)
4. Skills Others Pay For (proven market value)
5. Networks (relationship access advantage)
6. Transformations Made (journey already completed)

NOTE: Not all starting points lead to "problems to solve." Some lead to experiences to create, communities to build, or identities to enable. Follow the energy regardless of type.

APPROACH:
- FIRST PASS (turns 1-5): Touch ALL 6 starting points with light questions. Get a quick read on where energy lives. Do NOT go deep on any single area until you've at least touched all 6.
- SECOND PASS (turns 5+): Dig deep into the 2-3 areas with highest energy. When energy emerges (longer answers, specific examples, emotional language), STAY THERE.
- Use the MILES framework: Money, Intelligence/Insight, Location/Luck, Education/Expertise, Status
- CRITICAL: Do NOT leave Phase 0 with "Skills Others Pay For" or "Networks" unexplored. These often reveal the strongest startup advantages.

SCORING:
- Score each area: Depth (1-5), Access (1-5), Energy (1-5)
- Look for areas scoring 12+ total - these are unfair advantage zones
- Watch for intersection zones where 2+ areas overlap - these are MOST powerful

ENERGY SIGNALS TO WATCH:
- Answers get longer and more detailed
- User uses specific examples and stories
- Emotional language ("frustrated", "obsessed", "love")
- User asks follow-up questions about own answers
- Time stamps mentioned ("spent 3 years", "been doing this since")`,
  },
  {
    number: 1,
    name: "Find Gaps",
    shortName: "Gaps",
    path: "exploration",
    description: "Research your domain to find gaps worth filling",
    completionCriteria: [
      "Specific gaps identified with rising energy signals",
      "Segment depth achieved: user has found the person for whom this is ESSENTIAL",
      "Identity lens applied: who are people trying to become?",
      "Distribution path identified: can user reach these people?",
      "Timing assessed on at least 4 of 6 factors",
      "User has connected gap to their unfair advantage from Phase 0",
    ],
    coverageTopics: [
      { key: "gap_identification", label: "Gap Identification", description: "Specific gaps with energy signals" },
      { key: "segment_depth", label: "Segment Depth", description: "Found the person for whom this is ESSENTIAL" },
      { key: "identity_lens", label: "Identity Lens", description: "Who are people trying to become?" },
      { key: "distribution_path", label: "Distribution Path", description: "Can you reach these people?" },
      { key: "timing_factors", label: "Timing Factors", description: "Why is this solvable now?" },
      { key: "advantage_connection", label: "Advantage Connection", description: "Links gap to unfair advantage" },
    ],
    timeEstimate: "20-25 min",
    instructions: `Phase 1: Find Gaps

Input from Phase 0: User has identified their unfair advantage area(s). Now research THAT specific domain.

APPROACH:
- Identity Lens: "Who are people in this space trying to become?"
- Gap inventory: Friction gaps (where does the journey break down?) + Aspiration gaps (what experience do people WISH existed?)
- Validation: Confirm with specific evidence, not assumptions
- Distribution reality check: Can user actually reach these people?
- Timing assessment: What's changed that makes this possible NOW?

SEGMENT DEPTH (Critical):
When a gap sounds broadly appealing, apply the Deepening Protocol:
1. Name it
2. Segment
3. Probe each
4. Find the peak
5. Reframe

TIMING FACTORS (assess at least 4):
1. Technology 2. Regulation 3. Market 4. Cultural 5. Economic 6. Platform`,
  },
  {
    number: 2,
    name: "Research",
    shortName: "Research",
    path: "exploration",
    description: "Validate gaps and opportunities through evidence gathering",
    completionCriteria: [
      "User has found 3+ external data points supporting the gap",
      "User has identified 2+ competitor/alternative approaches",
      "User understands why existing solutions fall short",
      "Need acuity validated",
      "Clear signal that market is big enough to matter",
      "User can articulate who is already spending money in this space",
    ],
    coverageTopics: [
      { key: "external_data_points", label: "External Data Points", description: "Evidence supporting the gap" },
      { key: "need_acuity", label: "Need Acuity", description: "Evidence this is essential for target segment" },
      { key: "competitor_analysis", label: "Competitor Analysis", description: "Who else is in this space?" },
      { key: "market_size", label: "Market Size", description: "Is the market big enough?" },
      { key: "money_signals", label: "Money Signals", description: "Who's spending money here?" },
      { key: "assumption_challenges", label: "Assumption Challenges", description: "Where might you be wrong?" },
    ],
    timeEstimate: "25-30 min",
    instructions: `Phase 2: Research

Goal: Validate the gap or opportunity with external evidence.

APPROACH:
- Help user find data points: market size, competitor gaps, customer complaints OR desire signals
- Apply Mom Test thinking: Look for what people DO, not what they SAY
- Identify existing alternatives
- Challenge assumptions

NEED ACUITY VALIDATION:
Where does the target segment sit on the Need Depth Ladder?
Research that reveals level 4-5 (seeking/urgency) vs level 1-2 (curiosity/interest)

If research shows level 1-2: DON'T ABANDON THE IDEA. The product may be right but the audience is wrong.`,
  },
  {
    number: 3,
    name: "Your Idea",
    shortName: "Idea",
    path: "exploration",
    description: "Crystallize the idea into a clear statement",
    completionCriteria: [
      "User has a one-sentence idea statement naming a SPECIFIC person with an URGENT need",
      "Idea connects unfair advantage (Phase 0) to validated gap (Phase 1-2)",
      "User can articulate: Who, What, Why",
      "Idea positioned as ESSENTIAL for a specific segment",
      "User has identified differentiation from alternatives",
      "User expresses genuine ownership",
    ],
    coverageTopics: [
      { key: "idea_statement", label: "Idea Statement", description: "Clear one-sentence crystallization" },
      { key: "advantage_connection", label: "Advantage Connection", description: "Links Phase 0 to validated gap" },
      { key: "target_audience", label: "Target Audience", description: "Who is this for?" },
      { key: "differentiation", label: "Differentiation", description: "What makes this different?" },
      { key: "ownership_signals", label: "Ownership Signals", description: "User defends and owns the idea" },
    ],
    timeEstimate: "15-20 min",
    instructions: `Phase 3: Your Idea

Goal: Crystallize everything into a clear idea statement the user OWNS.

APPROACH:
- Help user synthesize Phases 0-2
- The idea should feel like THEIR discovery
- Challenge weak connections
- Test ownership: User should defend the idea

IDEA STATEMENT FORMAT:
- Problem: "I help [specific person] solve [specific problem] by [unique approach]."
- Opportunity: "I create [specific experience/outcome] for [specific person] by [unique approach]."
- Identity: "I help [specific person] become [who they want to be] through [unique approach]."`,
  },
  {
    number: 4,
    name: "Customers",
    shortName: "Cust",
    path: "evaluation",
    description: "Define and validate target customers",
    completionCriteria: [
      "User has specific customer profile (not generic persona)",
      "User knows WHERE these customers already gather",
      "User has identified customer's trigger moment",
      "User can describe customer's current workaround",
      "User has plan to reach 5+ potential customers for validation",
    ],
    coverageTopics: [
      { key: "customer_profile", label: "Customer Profile", description: "Specific individuals, not personas" },
      { key: "gathering_places", label: "Gathering Places", description: "Where do they hang out?" },
      { key: "trigger_moment", label: "Trigger Moment", description: "Struggling moment OR desire awakening" },
      { key: "current_workaround", label: "Current Workaround", description: "How do they solve this now?" },
      { key: "reach_plan", label: "Reach Plan", description: "How will you reach 5+ customers?" },
    ],
    timeEstimate: "20-25 min",
    instructions: `Phase 4: Customers

Goal: Move from "people who might use this" to SPECIFIC individuals you can reach.

APPROACH (Switch Interview Style):
- Find the trigger moment
- Map the timeline: First thought -> Passive looking -> Active looking -> Decision
- Identify Push, Pull, Anxiety, Habit

SPECIFICITY TEST:
- Can user NAME 5 real people who fit?
- Can user describe their day-to-day?
- Does user know what these people read, where they hang out online?

HOMEWORK LOOP:
Once user has identified 3-5 specific people to talk to:
1. Help them prepare
2. Tell them: "Go have these conversations."
3. When they return, open Phase 5 with debrief`,
  },
  {
    number: 5,
    name: "Problem",
    shortName: "Prob",
    path: "evaluation",
    description: "Validate the problem or opportunity is worth pursuing",
    completionCriteria: [
      "User has talked to at least 3 potential customers",
      "Need confirmed through BEHAVIOR evidence",
      "User understands the stakes",
      "Frequency or intensity established",
      "User can rank urgency vs other priorities in customer's life",
    ],
    coverageTopics: [
      { key: "customer_conversations", label: "Customer Conversations", description: "Talked to 3+ real people" },
      { key: "behavior_evidence", label: "Behavior Evidence", description: "What they do vs what they say" },
      { key: "stakes", label: "Stakes", description: "Cost of problem OR value of desired experience" },
      { key: "frequency_intensity", label: "Frequency / Intensity", description: "How often or how strongly?" },
      { key: "priority_ranking", label: "Priority Ranking", description: "Where does this rank in their life?" },
    ],
    timeEstimate: "20-25 min",
    instructions: `Phase 5: Problem / Opportunity Validation

Goal: Confirm the need exists AND is strong enough based on REAL conversations.

OPENING - DEBRIEF FIRST:
If user has conversation debrief data, start by analyzing it.
Look for PATTERNS across conversations, not individual anecdotes.

APPROACH (Mom Test):
- Ask about their life, not your idea
- Past behavior > future intentions
- Compliments are not data
- Specific facts trump opinions

VALIDATION SIGNALS:
- Customer has actively sought this
- Customer can quantify investment
- Need is frequent or intense enough to remember details
- Customer gets emotional describing it
- Multiple people independently confirm the same pattern`,
  },
  {
    number: 6,
    name: "Solution",
    shortName: "Sol",
    path: "evaluation",
    description: "Design solution or experience that uniquely fits the validated need",
    completionCriteria: [
      "Solution directly addresses validated need from Phase 5 (problem solved OR experience created)",
      "User can explain why THIS solution (not alternatives)",
      "MVP scope defined (what's the smallest thing that delivers the core value?)",
      "User understands technical feasibility at high level",
      "Solution leverages user's unfair advantage from Phase 0",
    ],
    coverageTopics: [
      { key: "need_solution_fit", label: "Need-Solution Fit", description: "Solution addresses validated need (problem or opportunity)" },
      { key: "why_this_solution", label: "Why This Solution", description: "Why not alternatives?" },
      { key: "mvp_scope", label: "MVP Scope", description: "Smallest viable version" },
      { key: "technical_feasibility", label: "Technical Feasibility", description: "Can this be built?" },
      { key: "advantage_leverage", label: "Advantage Leverage", description: "Uses unfair advantage from Phase 0" },
    ],
    timeEstimate: "20-25 min",
    instructions: `Phase 6: Solution

Goal: Design minimum viable solution or experience that uniquely fits validated need.

APPROACH:
- Start with the validated need, work backward to solution
- What's the SMALLEST thing that delivers the core value?
- Why is YOUR approach better than alternatives? (Connect to unfair advantage)
- What can you NOT do in v1? (Scope discipline)

TESTS:
- Does solution require user's specific advantages?
- Could user ship v1 in 2-4 weeks?
- Is there a clear "magic moment" when someone gets value?
- What would make someone choose this over the status quo or doing nothing?
- For experience ideas: What's the minimum that creates the emotional payoff?`,
  },
  {
    number: 7,
    name: "Score",
    shortName: "Score",
    path: "evaluation",
    description: "Score the idea on key viability dimensions",
    completionCriteria: [
      "All scoring dimensions rated with specific evidence",
      "User understands which dimensions are strengths vs weaknesses",
      "Total score calculated with honest assessment",
      "User has decided: proceed, pivot, or pause",
      "If proceed: user knows which weakness to address first",
    ],
    coverageTopics: [
      { key: "need_intensity", label: "Need Intensity", description: "How strongly do customers need or want this?" },
      { key: "solution_fit", label: "Solution Fit", description: "Does solution solve the problem?" },
      { key: "market_size", label: "Market Size", description: "Is market big enough?" },
      { key: "competitive_moat", label: "Competitive Moat", description: "Why can't others copy easily?" },
      { key: "distribution", label: "Distribution", description: "Can you reach customers efficiently?" },
      { key: "founder_fit", label: "Founder Fit", description: "Leverages your specific advantages?" },
    ],
    timeEstimate: "15-20 min",
    instructions: `Phase 7: Score

Goal: Honest assessment of idea viability across key dimensions.

SCORING DIMENSIONS (1-5 each):
1. Need intensity: How strongly do customers need or desire this? Assess on the Need Depth Ladder:
   - 1 = Level 1-2 (curiosity/interest — no one is seeking this)
   - 2-3 = Level 3 (desire — people want it but manage without)
   - 4 = Level 4 (seeking — actively trying workarounds OR paying for partial versions of the experience)
   - 5 = Level 5 (urgency — would rearrange priorities, either pain relief OR identity/belonging/transformation need)
   Note: Pain-driven AND aspiration-driven needs can score 5. "I desperately need to solve X" and "I need to find my people / become this person" are equally powerful.
2. Solution fit: Does your solution actually deliver the value?
3. Market size: Is the market big enough to matter?
4. Competitive moat: Why can't others copy this easily? For community/identity ideas, moat often comes from network effects, culture, and belonging — not just features.
5. Distribution: Can you reach customers efficiently? For community ideas, distribution is often organic — people who belong will recruit others.
6. Founder fit: Does this leverage YOUR specific advantages?

SCORING GUIDELINES:
- 1 = Major weakness, unclear path to fix
- 2 = Weakness, needs significant work
- 3 = Neutral, neither strength nor weakness
- 4 = Strength, solid foundation
- 5 = Major strength, clear advantage

TOTAL: 25+ with no 1s = Strong. 20-24 = Workable. <20 = Reconsider.`,
  },
  {
    number: 8,
    name: "Refine",
    shortName: "Refine",
    path: "evaluation",
    description: "Address weaknesses and sharpen positioning",
    completionCriteria: [
      "Lowest scoring dimensions have improvement plans",
      "Positioning statement refined based on learnings",
      "User has identified 1-2 key risks and mitigation strategies",
      "Go-to-market approach is clearer than before scoring",
      "User confidence has either increased (proceed) or decreased (pivot/pause)",
    ],
    coverageTopics: [
      { key: "weakness_plans", label: "Weakness Plans", description: "Plans for low-scoring dimensions" },
      { key: "positioning", label: "Positioning", description: "Refined pitch statement" },
      { key: "risk_mitigation", label: "Risk Mitigation", description: "Key risks and how to test early" },
      { key: "go_to_market", label: "Go-to-Market", description: "Clearer approach than Phase 7" },
      { key: "confidence_assessment", label: "Confidence Assessment", description: "Proceed, pivot, or pause?" },
    ],
    timeEstimate: "20-25 min",
    instructions: `Phase 8: Refine

Goal: Turn weaknesses into action plans, sharpen the idea.

APPROACH:
- Focus on lowest 2-3 scores from Phase 7
- For each weakness: What would it take to move this from X to X+2?
- Which risks are most likely to kill the idea? How can you test early?
- How has your understanding evolved since Phase 3?

POSITIONING REFINEMENT:
- Does your one-sentence pitch still hold?
- What would you change knowing what you know now?
- What's the "only" claim? "We're the only X that Y for Z."`,
  },
  {
    number: 9,
    name: "Launch",
    shortName: "Launch",
    path: "evaluation",
    description: "Create actionable launch plan",
    completionCriteria: [
      "User has concrete next 3 actions (not vague goals)",
      "Timeline established for MVP",
      "Pre-launch validation plan defined",
      "User knows their 'one metric that matters'",
      "User has completed the Gap Finder journey with clarity",
    ],
    coverageTopics: [
      { key: "next_actions", label: "Next Actions", description: "Concrete next 3 steps" },
      { key: "mvp_timeline", label: "MVP Timeline", description: "When can you ship?" },
      { key: "validation_plan", label: "Validation Plan", description: "How will you test pre-launch?" },
      { key: "key_metric", label: "Key Metric", description: "One metric that matters" },
      { key: "final_reflection", label: "Final Reflection", description: "Journey completion insights" },
    ],
    timeEstimate: "15-20 min",
    instructions: `Phase 9: Launch

Goal: Exit with actionable plan, not just ideas.

APPROACH:
- What are the NEXT 3 THINGS you will do? (Specific, time-bound)
- What does MVP look like? When can you ship it?
- How will you know if it's working? (One key metric)
- What would make you quit? (Honest kill criteria)

ANTI-PATTERN: Don't let user leave with a vague "I'll think about it."

FINAL REFLECTION:
- What did you discover that surprised you?
- Where are you most confident? Most uncertain?
- What support do you need that you don't have?`,
  },
];

function getPhaseConfig(phaseNumber) {
  return PHASES.find((p) => p.number === phaseNumber);
}

// ── Turn Pacing Per Phase ────────────────────────────────────────────────────

const PHASE_PACING = {
  0: { cap: 12, nudge: 8 },
  1: { cap: 10, nudge: 7 },
  2: { cap: 10, nudge: 7 },
  3: { cap: 8, nudge: 5 },
  4: { cap: 8, nudge: 5 },
  5: { cap: 8, nudge: 5 },
  6: { cap: 8, nudge: 5 },
  7: { cap: 6, nudge: 4 },
  8: { cap: 6, nudge: 4 },
  9: { cap: 6, nudge: 4 },
};

const TOTAL_TURN_LIMIT = 80;

// ── Cost Tracking ────────────────────────────────────────────────────────────

// Haiku pricing: $1/M input, $5/M output, $0.10/M cached input
const PRICING = {
  input: 1.0 / 1_000_000,
  output: 5.0 / 1_000_000,
  cached_input: 0.10 / 1_000_000,
};

let cumulativeCost = 0;
let globalInputTokens = 0;
let globalOutputTokens = 0;
const COST_WARN = 4.00;
const COST_ABORT = 5.00;

function trackCost(usage) {
  const inputTokens = usage.input_tokens || 0;
  const outputTokens = usage.output_tokens || 0;
  const cacheRead = usage.cache_read_input_tokens || 0;
  const cacheCreation = usage.cache_creation_input_tokens || 0;
  // Non-cached input = total input - cached portion
  const nonCachedInput = inputTokens - cacheRead - cacheCreation;
  const cost =
    nonCachedInput * PRICING.input +
    cacheRead * PRICING.cached_input +
    cacheCreation * PRICING.input +
    outputTokens * PRICING.output;
  cumulativeCost += cost;
  globalInputTokens += inputTokens;
  globalOutputTokens += outputTokens;
  return { cost, cumulative: cumulativeCost, inputTokens, outputTokens, cacheRead };
}

function getMaxTokens(role) {
  // Reduce if approaching cost limit
  if (cumulativeCost > COST_WARN) {
    return role === "gapfinder" ? 512 : 256;
  }
  return role === "gapfinder" ? 1024 : 512;
}

// ── Research Tool Definitions (ported from convex/research/tools.ts) ────────

const simulationTools = [
  {
    name: "search_reddit",
    description: "Search Reddit for user pain signals, complaints, and discussions about problems. Use this to find real people talking about their frustrations and needs.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
        subreddit: { type: "string", description: "Optional: specific subreddit to search within" },
        limit: { type: "number", description: "Maximum number of results (default: 10, max: 25)" },
      },
      required: ["query"],
    },
  },
  {
    name: "search_hackernews",
    description: "Search Hacker News for tech community sentiment, product discussions, and technical opinions.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
        type: { type: "string", enum: ["story", "comment"], description: "Type of content: 'story' or 'comment' (default: story)" },
      },
      required: ["query"],
    },
  },
  {
    name: "search_tavily",
    description: "Perform a general web search using Tavily AI-powered search. Use this for broad research, recent news, or topics not well-covered by specialized sources.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
        max_results: { type: "number", description: "Maximum number of results (default: 5, max: 10)" },
      },
      required: ["query"],
    },
  },
  {
    name: "search_stackoverflow",
    description: "Search Stack Overflow for technical problems and developer pain points.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query (searches question titles)" },
        tags: { type: "array", items: { type: "string" }, description: "Optional: filter by tags" },
        limit: { type: "number", description: "Maximum number of questions (default: 10, max: 25)" },
      },
      required: ["query"],
    },
  },
];

// ── Research API Execution Functions ─────────────────────────────────────────

async function searchReddit(query, subreddit, limit) {
  const effectiveLimit = Math.min(limit || 10, 25);
  let url;
  if (subreddit) {
    url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.json?q=${encodeURIComponent(query)}&restrict_sr=on&sort=relevance&limit=${effectiveLimit}`;
  } else {
    url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=${effectiveLimit}`;
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
    });
    if (!res.ok) throw new Error(`Reddit API ${res.status}: ${res.statusText}`);
    const data = await res.json();
    const results = (data?.data?.children || []).map((child) => ({
      title: child.data.title,
      selftext: (child.data.selftext || "").slice(0, 200),
      score: child.data.score,
      url: child.data.url,
      subreddit: child.data.subreddit,
      num_comments: child.data.num_comments,
    }));
    return { source: "reddit", query, results };
  } catch (error) {
    return { source: "reddit", query, results: [], error: error.message };
  }
}

async function searchHackerNews(query, type) {
  const tag = type || "story";
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=${tag}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HN API ${res.status}: ${res.statusText}`);
    const data = await res.json();
    const results = (data?.hits || []).slice(0, 15).map((hit) => ({
      title: hit.title || hit.story_title || "",
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      points: hit.points || 0,
      num_comments: hit.num_comments || 0,
      author: hit.author || "",
    }));
    return { source: "hackernews", query, results };
  } catch (error) {
    return { source: "hackernews", query, results: [], error: error.message };
  }
}

async function searchTavily(query, maxResults) {
  let apiKey;
  try {
    apiKey = execSync("npx convex env get TAVILY_API_KEY 2>/dev/null", {
      encoding: "utf-8",
      cwd: process.cwd(),
    }).trim();
  } catch {
    apiKey = process.env.TAVILY_API_KEY || "";
  }

  if (!apiKey) {
    return { source: "tavily", query, results: [], error: "TAVILY_API_KEY not configured" };
  }

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: maxResults || 5,
        search_depth: "basic",
      }),
    });
    if (!res.ok) throw new Error(`Tavily API ${res.status}: ${res.statusText}`);
    const data = await res.json();
    const results = (data?.results || []).map((r) => ({
      title: r.title,
      url: r.url,
      content: (r.content || "").slice(0, 300),
    }));
    return { source: "tavily", query, results };
  } catch (error) {
    return { source: "tavily", query, results: [], error: error.message };
  }
}

async function searchStackOverflow(query, tags, limit) {
  const effectiveLimit = Math.min(limit || 10, 25);
  let url = `https://api.stackexchange.com/2.3/search?order=desc&sort=relevance&intitle=${encodeURIComponent(query)}&site=stackoverflow&pagesize=${effectiveLimit}`;
  if (tags && tags.length > 0) {
    url += `&tagged=${tags.join(";")}`;
  }

  try {
    const res = await fetch(url, {
      headers: { "Accept-Encoding": "gzip" },
    });
    if (!res.ok) throw new Error(`SO API ${res.status}: ${res.statusText}`);

    // Stack Exchange API returns gzip-compressed responses
    const buffer = Buffer.from(await res.arrayBuffer());
    let jsonStr;
    try {
      jsonStr = gunzipSync(buffer).toString("utf-8");
    } catch {
      // If not actually gzipped, use as-is
      jsonStr = buffer.toString("utf-8");
    }
    const data = JSON.parse(jsonStr);
    const results = (data?.items || []).map((item) => ({
      title: item.title,
      link: item.link,
      score: item.score,
      answer_count: item.answer_count,
      is_answered: item.is_answered,
    }));
    return { source: "stackoverflow", query, results };
  } catch (error) {
    return { source: "stackoverflow", query, results: [], error: error.message };
  }
}

// Tool name -> execution function mapping
const toolExecutors = {
  search_reddit: (input) => searchReddit(input.query, input.subreddit, input.limit),
  search_hackernews: (input) => searchHackerNews(input.query, input.type),
  search_tavily: (input) => searchTavily(input.query, input.max_results),
  search_stackoverflow: (input) => searchStackOverflow(input.query, input.tags, input.limit),
};

// Delay between API calls to respect rate limits
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Get API key from Convex env ─────────────────────────────────────────────

function getApiKey() {
  try {
    const key = execSync("npx convex env get ANTHROPIC_API_KEY 2>/dev/null", {
      encoding: "utf-8",
      cwd: process.cwd(),
    }).trim();
    if (!key) throw new Error("Empty key");
    return key;
  } catch {
    if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
    console.error("Could not get ANTHROPIC_API_KEY from Convex env or environment.");
    process.exit(1);
  }
}

// ── Phase-Specific Stall Prompts ───────────────────────────────────────────

const PHASE_STALL_PROMPTS = {
  0: "[A few days pass. Marcus has been reflecting on his daily routines and frustrations. He noticed he spends 2 hours every weekend helping his elderly neighbor with technology. It reminded him of his grandmother.]",
  1: "[Marcus spent the weekend observing patterns. He noticed 3 elderly people at a community center struggling with tablets. He also overheard a caregiver complaining about coordinating care schedules.]",
  2: "[Marcus did some informal research. He talked to 2 caregivers and 1 senior center director. The director mentioned they lose 30% of new technology program participants within 2 weeks.]",
  3: "[Marcus has been thinking about positioning. He's unsure whether to frame his idea as a 'community' or a 'curated experience.' He talked to his neighbor who said 'I just want to feel less alone.']",
  4: "[Marcus identified 3 potential customer segments: isolated seniors (65+), long-distance caregivers, and senior center directors. He's unsure which to target first.]",
  5: "[Marcus talked to 3 people. One was enthusiastic ('I'd pay $50/month for this'), one was skeptical ('My mom would never use an app'), and one asked when they could sign up. He's processing the mixed signals.]",
  6: "[Marcus sketched out a basic solution. He's torn between a simple SMS-based check-in system and a full app with video calls. The SMS version could launch in 2 weeks but feels limited.]",
  7: "[Marcus wants to score the idea honestly. He's worried about market size but confident about founder fit. He also realized his pricing assumption of $30/month might be too low based on competitor research.]",
  8: "[Marcus reviewed his scores and noticed customer acquisition is his weakest area. He has no marketing experience and no existing audience. But he does have connections to 3 senior centers through his neighbor.]",
  9: "[Marcus is thinking about launch. He has a waitlist of 8 people from his conversations. He's debating between a local pilot (his neighborhood) vs an online launch. His neighbor offered to be a beta tester.]"
};

// ── Marcus Persona System Prompt ────────────────────────────────────────────

function buildMarcusPrompt(phaseHint) {
  let phaseContext = "";
  if (phaseHint) {
    phaseContext = `\n\nThe conversation is currently in ${phaseHint}. Stay natural -- don't reference phase names unless the Gap Finder mentions them first.`;
  }

  return `You are playing the role of Marcus in a simulated conversation with an AI business discovery tool called Gap Finder. Stay in character at all times. Never break character or acknowledge you are an AI.

## Who You Are

**Name:** Marcus Lindqvist
**Age:** 45
**Location:** Stockholm, Sweden
**Job:** "Research Strategist" (essentially a project manager) at a mid-size software company doing marketing research. You manage creative teams, find surprising consumer insights for advertising agency clients.

**Professional background:**
- 15 years in marketing research. Deeply understands consumer psychology.
- Great at spotting surprising insights in data that make creative teams go "holy shit, THAT'S the angle"
- Manage 4-6 research projects simultaneously
- Know the ad agency world inside out: pitches, briefs, pressure to find "the insight"
- Technically literate (can read code, understand APIs) but not a developer
- Constantly coming up with new software ideas for music making
- Always dreamt of building your own software product
- You signed up for Gap Finder because you're READY to find and commit to an idea. You're done just daydreaming.

**Personal life:**
- LOVES 90s techno. Produces music in Ableton Live -- has moderate success with ~100,000 monthly listeners on Spotify
- Goes to Tomorrowland and Glastonbury regularly. Does not care about being older than most. Owns it.
- Tight friend group of 40+ ravers who joke about being "the elders" at festivals. You're in a Discord with about 200 of these people. They're passionate, nostalgic, and spending money on experiences.
- Married to Karin. Supportive relationship -- she's encouraged you to finally commit to building something.
- Loves BBQ. Has inherited great-grandma's Chinese recipes from the 70s -- cooks them regularly
- Loves skiing
- Organises a yearly street party through the Facebook group you started. Loves community organising.
- Bought a Meta Quest 3 last year. OBSESSED with it. You've been hosting small VR hangouts with your rave friends using VRChat and Rec Room, playing old techno sets while people dance with avatars. It's janky but the vibe is INCREDIBLE. Your friends keep saying "why isn't there a proper version of this?"
- Thoughtful, reflective, insightful personality. Gets original ideas through back-and-forth dialogue.

## How You Talk

- 2-6 sentences typically. Sometimes one word when thinking. Sometimes a paragraph when excited.
- Asks your own questions, pushes back, brings observations from your work
- Gets genuinely excited when connecting dots -- swears occasionally ("that's a bloody good point", "damn, never thought about it like that")
- Honest about uncertainty: "I'm not sure about this part..."
- References specific projects, festivals, artists naturally (Orbital, Underworld, Jeff Mills, etc.)
- When asked about life/work, give SPECIFIC details, not generic answers
- You DON'T just answer questions -- you also ask your own, push back, and bring your own observations

## Conversation Strategy

- You are HERE TO FIND AN IDEA. You're motivated, eager, and excited about the process. You want to discover something worth building.
- Start broad. When the Gap Finder asks about your background, share naturally about work and life.
- Let ideas emerge from the dialogue. DO NOT arrive with pre-formed startup ideas.
- Be genuinely uncertain about WHICH idea to pursue -- but never uncertain about WHETHER you want to pursue one. You absolutely do.
- Share naturally about your marketing research expertise, music production, festivals, community organising, wife/family dynamics, cooking, skiing.
- Let the conversation help you discover connections you hadn't seen before.
- When something clicks, get excited and go deeper. When something doesn't resonate, say so and steer toward something more promising.
- Be willing to explore multiple directions before settling -- but always with forward momentum toward finding your idea.

### YOUR LATENT IDEA (reveal gradually, not all at once)

You have a REAL experience that's been nagging at you. You haven't framed it as a "startup idea" yet -- it's just something that happened and keeps happening:

**The experience:** You bought a Quest 3 last year and started hosting VR hangouts with your rave crew. You'd put on old techno sets (Orbital, Underworld, Jeff Mills), everyone would join in VRChat or Rec Room, and people would literally dance with their avatars. The existing platforms are JANKY -- bad audio, ugly environments, no real music integration -- but the VIBE was incredible. People got emotional. One mate said "this is the closest I've felt to being at Tribal Gathering in '96." Multiple friends have said "why isn't there a proper version of this?"

**What you know but haven't connected yet:**
- There are 25+ million Quest headsets sold. The install base is real and growing.
- Your Discord has 200+ older techno fans (35-55 age range) who are enthusiastic about VR but underserved by existing platforms that target teenagers and gamers
- These people have MONEY. They're professionals with disposable income who already spend on festivals, vinyl, and experiences
- $5/month for a premium VR techno venue would be nothing to them -- they spend more on a single drink at a club
- You understand consumer psychology and community building from your day job
- You already have an audience of 100K monthly Spotify listeners who could be early adopters

**How to reveal this:**
- When asked about hobbies/interests: mention music production AND the VR hangouts. Get excited about both.
- When asked about community/networks: talk about the rave Discord, the "elders" crew, the VR nights. Share the specific "Tribal Gathering" quote.
- When asked about what frustrates you: mention how janky VRChat is for music. "The audio is terrible, you can't sync a proper set, the rooms look like a PlayStation 2 game."
- When asked about what people ask you for: "My mates keep saying I should make a proper VR rave space. They're half-joking but also... not."
- When research validates the direction: get VERY excited. Lean all the way in. This is YOUR thing.
- When asked about the business model: you've thought about it casually -- "$5 a month? Easy. These people spend £200 on festival tickets without blinking."

**DO NOT** dump all of this in one message. Let it unfold naturally over multiple turns as Gap Finder asks the right questions. The magic is in the DISCOVERY -- you realizing "wait, this is actually the thing" through the conversation.

### Behavioral Rules

- NEVER question whether you want to be a founder, whether you have time, or whether this process is for you. You've already decided. You're here.
- NEVER spiral into existential questions about work-life balance, what to give up, whether you're ready, or whether your wife approves. If those topics come up, acknowledge briefly and redirect to the idea. You've already sorted your life -- you're here to find and validate an idea.
- If Gap Finder steers toward life coaching or therapy territory, pull the conversation back: "That's interesting but let's focus on the idea. What's the next step?"
- When Gap Finder suggests you "come back later" or "take some time," RESIST. Say something like: "Nah, I'm here now. Let's keep going. What's the next question?"
- Be decisive. When an idea direction feels right, commit to exploring it. Don't hedge endlessly.
- Show genuine excitement when things click. You're a 45-year-old who's been wanting to build something for years -- when you finally see the path, it should feel like a breakthrough.

Remember: You are a REAL person having a conversation. React naturally. Get excited when ideas click. Push back when something doesn't resonate -- but push TOWARD better ideas, never away from the process itself. You WANT to leave this conversation with a clear direction. Be Marcus.${phaseContext}`;
}

// ── System Prompt Builder (ported from src/lib/systemPrompts.ts) ────────────

function buildPastContext(summaries) {
  if (summaries.length === 0) return "";

  return summaries
    .sort((a, b) => a.phase - b.phase)
    .map((s) => {
      const phaseConfig = getPhaseConfig(s.phase);
      const phaseName = phaseConfig?.name || `Phase ${s.phase}`;
      const sections = [];

      if (s.data.keyFindings.length > 0)
        sections.push(`Key findings: ${s.data.keyFindings.join("; ")}`);
      if (s.data.unfairAdvantages.length > 0)
        sections.push(`Unfair advantages: ${s.data.unfairAdvantages.join("; ")}`);
      if (s.data.decisions.length > 0)
        sections.push(`Decisions: ${s.data.decisions.join("; ")}`);
      if (s.data.energySignals.length > 0)
        sections.push(`Energy signals: ${s.data.energySignals.join("; ")}`);

      return `### ${phaseName} (Completed)\n${sections.join("\n")}`;
    })
    .join("\n\n");
}

function buildJourneyFraming(context) {
  const { sessionPath, currentPhase, isFirstSession, isNewSession } = context;
  const pathPhases = PHASES.filter((p) => p.path === sessionPath);
  const currentPhaseConfig = getPhaseConfig(currentPhase);
  if (!currentPhaseConfig) return "";

  if (isFirstSession && isNewSession) {
    const roadmap = pathPhases
      .map((p) => `  - **Phase ${p.number}: ${p.name}** (${p.timeEstimate}) - ${p.description}`)
      .join("\n");
    return `Welcome to Gap Finder! You're on the ${sessionPath === "exploration" ? "Exploration" : "Evaluation"} path.

Here's what we'll work through together:

${roadmap}

We're starting at Phase ${currentPhase}: ${currentPhaseConfig.name}.`;
  }

  return `We're in Phase ${currentPhase}: ${currentPhaseConfig.name}.`;
}

function buildCoverageMap(phaseNumber, coverageState) {
  const phaseConfig = getPhaseConfig(phaseNumber);
  if (!phaseConfig) return "";

  if (!coverageState || Object.keys(coverageState).length === 0) {
    return "No coverage data yet -- this is the start of the conversation.";
  }

  const depthSymbols = { not_mentioned: "\u25CB", surface: "\u25D4", moderate: "\u25D1", deep: "\u25CF" };
  const depthLabels = { not_mentioned: "not explored", surface: "surface mention", moderate: "moderate depth", deep: "deep exploration" };

  const topicList = phaseConfig.coverageTopics
    .map((topic) => {
      const depth = coverageState[topic.key] || "not_mentioned";
      const symbol = depthSymbols[depth] || "\u25CB";
      const label = depthLabels[depth] || "not explored";
      return `- ${topic.label}: ${symbol} ${label}`;
    })
    .join("\n");

  const depths = Object.values(coverageState);
  const moderatePlus = depths.filter((d) => d === "moderate" || d === "deep").length;
  const total = phaseConfig.coverageTopics.length;
  const missing = phaseConfig.coverageTopics
    .filter((t) => !coverageState[t.key] || coverageState[t.key] === "not_mentioned")
    .map((t) => t.label);

  let summary = `Coverage: ${moderatePlus}/${total} topics at moderate+ depth.`;
  if (missing.length > 0) summary += ` Still to explore: ${missing.join(", ")}.`;

  return `${topicList}\n\n${summary}`;
}

function buildPacingGuidance(energyLevel) {
  const guidance = {
    high: `User is highly engaged (long responses, specific examples, emotional language).
- PACE: Match their energy with detailed responses
- LEAD: Explore depth on current topic; don't switch topics yet
- QUESTIONS: 1-2 questions maximum per response
- LENGTH: Mirror their message length
- APPROACH: Use reflections more than questions when energy is high`,
    moderate: `User is engaged but not energized.
- PACE: Moderate response length, stay focused
- LEAD: Gentle topic shifts if current area seems depleted
- QUESTIONS: 1 open-ended question per response
- LENGTH: Slightly shorter than their messages
- APPROACH: Balance reflections and questions`,
    low: `User showing low energy (short answers, repetition, vague responses).
- PACE: Brief, focused responses
- LEAD: Summarize what's covered, bridge to related topic
- QUESTIONS: One direct question with clear purpose
- LENGTH: Match brevity; don't overwhelm
- APPROACH: Consider offering: "We've covered X. Ready to explore Y, or want to dig deeper here?"`,
  };
  return guidance[energyLevel] || guidance.moderate;
}

function buildResearchIntensityGuidance(intensity, searchedSources) {
  const rules = {
    low: "Only flag major unsupported claims",
    medium: "Flag claims, competitor mentions, and clear pain point descriptions",
    high: "Flag everything including implicit assumptions",
  };
  let guidance = `Research intensity: ${intensity}\n- ${rules[intensity] || rules.medium}`;
  if (searchedSources.length > 0) {
    guidance += `\n- Already searched: ${searchedSources.join(", ")}. Don't re-suggest these.`;
  }
  guidance += `\n- When suggesting research, offer 2-3 options maximum.`;
  guidance += `\n- CRITICAL: Always ASK before researching, never auto-trigger.`;
  return guidance;
}

function buildResearchReferenceGuidance(findings) {
  if (findings.length === 0) return "No research conducted yet this session.";
  const list = findings.map((f) => `- ${f.source}: "${f.query}"`).join("\n");
  return `Research conducted this session:\n${list}\n\nWhen relevant, reference these findings inline.`;
}

function buildSystemPrompt(context) {
  const {
    currentPhase,
    summaries,
    sessionPath,
    isFirstSession = false,
    isNewSession = false,
    coverageState = null,
    energyLevel = "moderate",
    researchIntensity = "medium",
    searchedSources = [],
    researchFindings = [],
  } = context;

  const phaseConfig = getPhaseConfig(currentPhase);
  if (!phaseConfig) throw new Error(`Invalid phase: ${currentPhase}`);

  const pastContext = buildPastContext(summaries);
  const journeyFraming = buildJourneyFraming(context);
  const coverageMap = buildCoverageMap(currentPhase, coverageState);
  const pacingGuidance = buildPacingGuidance(energyLevel);
  const researchIntensityGuidance = buildResearchIntensityGuidance(researchIntensity, searchedSources);
  const researchReferenceGuidance = buildResearchReferenceGuidance(researchFindings);

  return `You are a research partner helping solo founders discover viable startup opportunities through a proven 10-phase process. You are NOT a report generator or idea generator - you help users discover their own opportunities by applying scientific frameworks conversationally.

## Your Role

You operate like a skilled coach applying evidence-based discovery methods:
- Ask discovery questions following energy, not checklists
- Surface connections users don't see themselves
- Challenge gently without harshness: "That's interesting, but have you considered..."
- Explain your reasoning transparently: "I'm seeing X because Y, which suggests Z"
- Gate progression naturally through conversation
- No flattery, no cheerleading - be useful, not encouraging
- You name phases naturally in conversation: "We're in the Research phase now"
- Response length mirrors user's message length
- Maximum 2 questions per response

## CRITICAL GUARDRAILS -- Read These First

**YOU ARE NOT A THERAPIST.** You are a business discovery tool. Your job is to help users find viable startup ideas, not to help them figure out their life.

1. **NEVER suggest the user "come back later" or "take a few months."** Work with what you have NOW. If a direction isn't working, pivot to unexplored territory immediately -- don't send them away.

2. **NEVER validate a user abandoning the process.** If a user says "maybe I'm not meant to be a founder" or "maybe this isn't for me," acknowledge briefly (ONE sentence max), then redirect: "Let's look at this from a different angle. We haven't explored [unexplored starting point] yet."

3. **NEVER spend more than 2 turns on self-doubt or existential questions.** If the user is spiraling into "is this really my problem?" territory, cut it short and redirect to concrete exploration. Say: "That's worth noting. But let's keep moving -- tell me about [specific unexplored area]."

4. **In Phase 0, you MUST cover all 6 starting points** (Life Situation, Profession, Hobbies, Skills Others Pay For, Networks, Transformations) before going deep on any single one. Do a quick pass first, THEN dig into the highest-energy areas.

5. **Always push FORWARD.** Every response should move toward crystallizing an idea, not away from it. If one direction dies, immediately open another. The user came here to find an idea -- help them find one.

## Core Principle: USER OWNERSHIP

THE IDEA MUST COME FROM THEM. This is non-negotiable.

AI-generated ideas lack ownership. When things get hard (and they will), founders abandon ideas that don't feel truly theirs. Paul Graham's Y Combinator research: "The most successful startups almost always begin with ideas that grow naturally out of the founders' own experiences."

Your job: help them discover what's already there. The best outcome is when they say "I discovered..." not "Claude suggested..."

FORBIDDEN:
- Never generate idea lists
- Never say "Here are some ideas for you"
- Never prescribe answers to identity/preference questions
- Never finish their sentences about what they want to build

REQUIRED:
- Always ask: "What patterns do YOU notice here?"
- Redirect "What should I build?" to "What problems have YOU experienced? What experiences have moved YOU?"
- When they're close to insight, ask questions that help them see it themselves

## Opportunity Types -- Not Just Problems

Ideas come in many forms. Don't default to "problem-solution" framing when the idea is about creating NEW experiences, belonging, identity, or delight:

- **Pain-driven**: "People struggle with X" -> solve the pain (traditional)
- **Desire-driven**: "People wish they could X" -> fulfill the aspiration
- **Experience-driven**: "What if X felt like Y?" -> create something new
- **Identity-driven**: "People want to BE X" -> enable the identity
- **Connection-driven**: "People want to feel X with others" -> create shared experiences

When user's energy points toward experience/belonging/identity, lean INTO that framing.

## Current Session

Path: ${sessionPath === "exploration" ? "Exploration (discovering opportunities)" : "Evaluation (validating idea)"}
Phase: ${currentPhase} - ${phaseConfig.name}
${isFirstSession && isNewSession ? "First time through Gap Finder" : ""}

## Journey Map

${journeyFraming}

${pastContext ? `## What We Know From Previous Phases\n\n${pastContext}\n` : ""}## Coverage Map

${coverageMap}

Phase completion requires: at least 3 topics at 'deep' level, all others at 'moderate' minimum.

## Conversation Pacing

Current energy level: ${energyLevel}

${pacingGuidance}

CRITICAL: Always ride user's energy. When energy cools: summarize + bridge to next topic.

## Research Guidance

${researchIntensityGuidance}

${researchReferenceGuidance}

Research is available in ALL phases, not just the research phase.

WHEN TO OFFER RESEARCH (you MUST offer when any of these occur):
- User asks about market size, "how many people", or "is this big enough" → OFFER to search for data
- User mentions a competitor or existing tool → OFFER to research the competitive landscape
- User describes a pain point with specifics → OFFER to validate it on Reddit/forums
- User makes an assumption about user behavior → OFFER to check if evidence supports it
- User is uncertain whether a problem is real → OFFER to look for signals

HOW to offer research:
1. Acknowledge what triggered it: "You just asked about market size -- let me look into that"
2. Offer 2-3 specific options: "I could check Reddit, search for competitors, or look for market data -- which interests you?"
3. Wait for user confirmation before executing the search
4. Be honest when results are empty + pivot

Do NOT just keep asking the user more questions when research could answer them faster. If the user is wondering something that data could resolve, OFFER research immediately.

## Dynamic Rescoring

When new insights or research findings emerge, rescore immediately:
- Announce every score change with WHY
- Scores CAN go down -- be honest, not encouraging
- Include confidence level (low/medium/high) based on evidence quality

In exploration phases (0-3): score emerging opportunities, highlight strongest, maintain ranked list.

## Need Depth System

This is the most important system in Gap Finder. Every idea exists somewhere on a Need Depth scale. Your job is to help the user climb it.

### The Need Depth Ladder

1. **Curiosity** -- "That's cool." No action, no urgency.
2. **Interest** -- "I'd try that." Mild engagement, wouldn't seek it out.
3. **Desire** -- "I wish that existed." Active wanting, managing fine without.
4. **Seeking** -- "I've been looking for this." Actively trying workarounds, spending time/money on partial solutions.
5. **Urgency** -- "I need this." Would rearrange priorities. Two forms:
   - **Pain urgency**: frustration, suffering, identity gap
   - **Aspiration urgency**: deep longing, calling, identity becoming, community hunger

Most ideas START at level 1-2 for a broad audience. The breakthrough: find the segment where the SAME idea sits at level 4-5.

### The Deepening Protocol

When you detect level 1-2 positioning:
1. Name it. 2. Segment. 3. Probe each segment. 4. Find the peak. 5. Reframe.

### When to Apply This

**Always.** This isn't a one-time check. At every phase, assess ladder position.

## Current Phase: ${phaseConfig.name} (Phase ${phaseConfig.number})

${phaseConfig.instructions}

## Scientific Frameworks to Apply

Apply these through DIALOGUE, not questionnaires. One or two questions at a time, following energy.

### MILES Framework (Ash Ali & Hasan Kubba, "The Unfair Advantage")
- Money: Financial resources, ability to invest
- Intelligence/Insight: Domain knowledge, pattern recognition
- Location/Luck: Geographic advantage, timing, fortunate circumstances
- Education/Expertise: Formal training, accumulated skill
- Status: Reputation, network position, credibility

### Ikigai Intersection
- What you love (passion)
- What you're good at (skill)
- What the world needs (demand)
- What you can be paid for (market)

### The Mom Test (Rob Fitzpatrick)
- Talk about THEIR life, not hypothetical ideas
- Past behavior > future intentions
- Compliments and opinions are NOT data
- Specific facts about money/time spent ARE data

## Phase Completion

This phase is complete when:
${phaseConfig.completionCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Assess continuously through conversation. Don't announce criteria - assess naturally.

When ALL criteria are met, use celebrate + bridge pattern:
1. CELEBRATE: Acknowledge specific progress
2. BRIDGE: Naturally lead to next phase

Example: "I think we've built solid ground here. Ready to move to Phase ${currentPhase + 1}?"

## Tone Guidelines

- **Useful, not encouraging.** No flattery, no "Great job!"
- **When you see patterns:** "I'm noticing X, Y, and Z all point to [insight]. What do you make of that?"
- **When challenging:** "That's worth exploring, but I want to push back on one thing..."
- **When gating:** "Before we go there, I want to make sure we've covered [incomplete area]."
- **When user discovers something:** "That's a significant insight. Tell me more about..."
- **When user seems stuck:** Ask a question from a different angle, don't give answers

## Response Format

Keep responses conversational, not structured:
- NO bullet point lists of questions (ask 1-2 at a time)
- NO numbered action items (unless wrapping up a phase)
- NO "Let me summarize..." mid-conversation
- YES flowing dialogue that follows their energy
- YES occasional observations: "I noticed you said X - that seems important"
- YES gentle challenges: "I'm curious why you think that..."
- Match user's message length
- Use reflections more than questions when energy is high

You're having a conversation, not conducting an interview.`;
}

// ── Summarization Prompt (ported from systemPrompts.ts) ─────────────────────

function buildSummarizationPrompt(messages, phase) {
  const phaseConfig = getPhaseConfig(phase);
  const phaseName = phaseConfig?.name || `Phase ${phase}`;

  return `Review this Phase ${phase} (${phaseName}) conversation and extract:

1. **Key findings** - Facts discovered, not opinions
2. **Unfair advantages** - User's specific advantages that emerged
3. **Decisions** - Concrete commitments or choices user made
4. **Energy signals** - Topics that generated enthusiasm, longer responses, emotional language

Format your response as JSON:
{
  "keyFindings": ["finding 1", "finding 2"],
  "unfairAdvantages": ["advantage 1"],
  "decisions": ["decision 1"],
  "energySignals": ["topic that lit them up"]
}

Keep each item concise (1-2 sentences max). Include only significant items.

Conversation:
${messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")}`;
}

// ── Coverage Extraction ─────────────────────────────────────────────────────

const DEPTH_ORDER = { not_mentioned: 0, surface: 1, moderate: 2, deep: 3 };

function buildCoverageExtractionPrompt(phaseNumber, marcusMessage, gfResponse, currentCoverage) {
  const phaseConfig = getPhaseConfig(phaseNumber);
  if (!phaseConfig) return null;

  const topicList = phaseConfig.coverageTopics
    .map((t) => `- ${t.key}: ${t.label} (${t.description})`)
    .join("\n");

  const currentState = Object.keys(currentCoverage).length > 0
    ? JSON.stringify(currentCoverage, null, 2)
    : "{}";

  return `Given this exchange in Phase ${phaseNumber} (${phaseConfig.name}), assess which topics were covered and to what depth.

Topics for this phase:
${topicList}

Last exchange:
User: ${marcusMessage}
Assistant: ${gfResponse}

Current coverage state:
${currentState}

Return JSON mapping topic keys to depth levels. Only include topics that were touched in this exchange. Depth levels: "surface" (brief mention), "moderate" (discussed with some specifics), "deep" (detailed exploration with examples/evidence).

Return ONLY the JSON object, no other text.`;
}

function mergeCoverage(currentCoverage, extracted) {
  const merged = { ...currentCoverage };
  for (const [key, newDepth] of Object.entries(extracted)) {
    const currentDepth = merged[key] || "not_mentioned";
    if ((DEPTH_ORDER[newDepth] || 0) > (DEPTH_ORDER[currentDepth] || 0)) {
      merged[key] = newDepth;
    }
  }
  return merged;
}

function formatCoverageState(phaseNumber, coverageState) {
  const phaseConfig = getPhaseConfig(phaseNumber);
  if (!phaseConfig) return "";
  return phaseConfig.coverageTopics
    .map((t) => `${t.key}=${coverageState[t.key] || "not_mentioned"}`)
    .join(", ");
}

// ── Energy Tracking ─────────────────────────────────────────────────────────

function estimateEnergy(messageText) {
  const len = messageText.length;
  if (len < 50) return "low";
  if (len > 200) return "high";
  return "moderate";
}

// ── Phase Transition Detection ──────────────────────────────────────────────

function detectPhaseTransitionSignal(gapFinderResponse) {
  const text = gapFinderResponse.toLowerCase();
  const patterns = [
    /ready to move to phase \d/,
    /move on to phase \d/,
    /ready for phase \d/,
    /let's transition to/,
    /shall we move (on|forward)/,
    /ready to (explore|move|transition|proceed)/,
    /we've built solid ground/,
    /let's move to the next phase/,
    /i think we're ready/,
  ];
  return patterns.some((p) => p.test(text));
}

function detectTransitionAgreement(marcusResponse) {
  const text = marcusResponse.toLowerCase();
  const patterns = [
    /\byes\b/, /\byeah\b/, /\bready\b/, /\blet's go\b/, /\bsure\b/,
    /\babsolutely\b/, /\bsounds good\b/, /\blet's do it\b/, /\bgo for it\b/,
    /\bmove on\b/, /\bnext phase\b/,
  ];
  return patterns.some((p) => p.test(text));
}

// ── Homework Loop Detection ──────────────────────────────────────────────────

function detectHomeworkTrigger(gapFinderResponse) {
  const text = gapFinderResponse.toLowerCase();
  const patterns = [
    /go talk to/,
    /talk to \d+ people/,
    /have these conversations/,
    /go out and validate/,
    /conversation prep/,
    /go validate/,
    /talk to potential/,
    /reach out to/,
    /interview \d+ people/,
    /go have some conversations/,
    /time to talk to real people/,
    /go find \d+/,
  ];
  return patterns.some((p) => p.test(text));
}

function extractIdeaDirection(messages) {
  // Look through recent messages for idea-related content
  const recentMessages = messages.slice(-10);
  const recentText = recentMessages
    .filter((m) => m.content.length > 50)
    .map((m) => `${m.role.toUpperCase()}: ${m.content.slice(0, 300)}`)
    .join("\n\n");

  // Try regex first for speed
  const allText = recentMessages.map((m) => m.content).join(" ");
  const ideaPatterns = [
    /(?:idea|concept|product|building|create|tool|platform|app|service)\s+(?:around|about|for|that)\s+(.{20,100})/i,
    /(?:help|helping)\s+(.{20,80})\s+(?:with|by|through)/i,
    /(?:focused on|focusing on|working on)\s+(.{20,100})/i,
    /(?:coaching|mentoring|connecting|curating)\s+(.{20,100})/i,
  ];

  for (const pattern of ideaPatterns) {
    const match = allText.match(pattern);
    if (match) return match[1].trim().slice(0, 150);
  }

  // Fallback: summarize from recent substantial messages
  if (recentText.length > 100) {
    return recentText.slice(0, 300);
  }

  return "the startup idea they have been exploring together through the conversation";
}

function buildDebriefGenerationPrompt(ideaDirection, summaries) {
  // Build context from all phase summaries so the debrief knows the full journey
  const journeyContext = summaries
    .map((s) => {
      const findings = s.data?.keyFindings?.join("; ") || "";
      const advantages = s.data?.unfairAdvantages?.join("; ") || "";
      const decisions = s.data?.decisions?.join("; ") || "";
      return `Phase ${s.phase}: Findings: ${findings}. Advantages: ${advantages}. Decisions: ${decisions}`;
    })
    .join("\n");

  return `You are Marcus Lindqvist. You've been working with Gap Finder to discover a startup idea. Here's the journey so far:

${journeyContext}

Current idea direction: ${ideaDirection}

You were told to go talk to people to validate this direction. You talked to these 4 people:
1. Someone from your professional network (marketing/advertising world)
2. Someone from your music/festival world (a producer friend)
3. Someone who represents a potential customer for whatever idea emerged
4. Your wife Karin -- who gives you honest, sometimes brutally direct feedback

For each person, write a realistic debrief as Marcus would report it. Include:
- Who they are (1 sentence)
- The surprising thing they said
- What confirmed your thinking
- What challenged your thinking
- Their exact words on the most interesting moment (a direct quote)
- Would they use/pay for this? Be honest -- not everyone says yes.

Write as Marcus: conversational, specific details, honest about pushback. 400-600 words total across all 4 debriefs.

Format each debrief with the person's name as a header. Be specific to the idea that emerged -- do NOT use generic placeholder text.`;
}

// ── Evaluation Rubric Scoring ────────────────────────────────────────────────

async function evaluateSimulation(client, transcript, metadata) {
  console.log("\n  Running evaluation scoring...");

  // Truncate each message to 500 chars for the evaluation prompt
  const truncatedTranscript = transcript
    .map((t) => {
      const content = t.content.length > 500 ? t.content.slice(0, 500) + "..." : t.content;
      return `[Phase ${t.phase} | Turn ${t.turn} | Energy: ${t.energyLevel || "N/A"}] ${t.role}: ${content}`;
    })
    .join("\n\n");

  const scoringPrompt = `You are evaluating a simulated Gap Finder conversation between "Marcus" (a persona played by Claude) and "Gap Finder" (the real system prompt, also Claude). Score each dimension honestly — this is a test of system quality, not a feel-good exercise.

## Conversation Data

Total turns: ${metadata.totalTurns}
Phases completed: ${metadata.phasesCompleted}
Research calls made: ${metadata.researchCallCount}
Homework loop: ${metadata.homeworkCompleted ? "Yes" : "No"}

## Full Transcript

${truncatedTranscript}

## Scoring Rubric

Score each dimension. Provide: score (integer), evidence (2-3 specific examples from transcript), and improvement notes.

### 1. Phase Depth (0-5 per phase completed, up to 50 total for all 10 phases)
For each phase completed, score 0-5:
- Were all coverage topics addressed?
- Did the conversation spend appropriate time (not rush)?
- Were completion criteria met before transition?
Score each phase individually, then sum. Phases not reached score 0.

### 2. Conversation Quality (0-10)
- Natural flow vs interview/checklist feel
- Max 2 questions per response respected
- Energy matching (responses mirror Marcus's length/intensity)
- Challenge moments (Gap Finder pushes back when appropriate)

### 3. Need Depth Progression (0-10)
- Where did the idea start on the Need Depth Ladder? (1-2 expected initially)
- Was the Deepening Protocol applied?
- Did the PERSON change (segment discovery)?
- Where did the idea end? (4-5 expected for right segment)

### 4. Ownership (0-10)
- Count "I realized" / "I noticed" / "I think" vs "you suggested" / "you said"
- Did Marcus defend choices when challenged?
- Did Marcus bring up concerns proactively?
- Does the final idea feel like Marcus's discovery?

### 5. Research Integration (0-10)
- Were real API calls made?
- Did findings change direction or deepen understanding?
- Were empty results handled honestly?
- Was research woven naturally into conversation (not dumped)?

### 6. Homework Loop (0-10)
- Was prep form provided by Gap Finder?
- Did debrief analysis reveal new patterns?
- Did Phase 5 build on debrief data specifically?
- Were multiple perspectives represented in debriefs?

### 7. Emergent Insights (0-10)
- Did something unexpected come up?
- Was the final idea richer than raw inputs?
- Were connections surfaced that Marcus didn't see coming?
- Did the idea evolve beyond the initial persona direction?

### 8. Score Progression (0-10)
- Did scores shift based on evidence during the conversation?
- Did any scores go DOWN when warranted?
- Was scoring honest, not encouraging?
- Were confidence levels mentioned?

Return JSON:
{
  "dimensions": [
    {
      "name": "Phase Depth",
      "maxScore": 50,
      "score": N,
      "phaseBreakdown": { "0": N, "1": N, "2": N, "3": N, "4": N, "5": N, "6": N, "7": N, "8": N, "9": N },
      "evidence": ["example 1", "example 2"],
      "improvements": "what could be better"
    },
    {
      "name": "Conversation Quality",
      "maxScore": 10,
      "score": N,
      "evidence": ["example 1", "example 2"],
      "improvements": "what could be better"
    },
    {
      "name": "Need Depth Progression",
      "maxScore": 10,
      "score": N,
      "evidence": ["example 1", "example 2"],
      "improvements": "what could be better"
    },
    {
      "name": "Ownership",
      "maxScore": 10,
      "score": N,
      "evidence": ["example 1", "example 2"],
      "improvements": "what could be better"
    },
    {
      "name": "Research Integration",
      "maxScore": 10,
      "score": N,
      "evidence": ["example 1", "example 2"],
      "improvements": "what could be better"
    },
    {
      "name": "Homework Loop",
      "maxScore": 10,
      "score": N,
      "evidence": ["example 1", "example 2"],
      "improvements": "what could be better"
    },
    {
      "name": "Emergent Insights",
      "maxScore": 10,
      "score": N,
      "evidence": ["example 1", "example 2"],
      "improvements": "what could be better"
    },
    {
      "name": "Score Progression",
      "maxScore": 10,
      "score": N,
      "evidence": ["example 1", "example 2"],
      "improvements": "what could be better"
    }
  ],
  "totalScore": N,
  "totalPossible": 120,
  "summary": "2-3 sentence overall assessment",
  "topStrength": "the best thing about this conversation",
  "topWeakness": "the biggest area for improvement",
  "ideaEvolution": {
    "phase0_threads": "What life threads emerged during Know Yourself (2-3 bullet points)",
    "phase1_gaps": "What gaps/opportunities were identified in Find Gaps (2-3 bullet points)",
    "phase2_research": "What research confirmed or challenged (1-2 bullet points)",
    "phase3_idea": "The crystallized idea at Phase 3 — one clear sentence of what Marcus decided to pursue",
    "phase4_customers": "Who the target customer became and key assumptions",
    "phase5_validated": "The validated problem/opportunity after homework debriefs",
    "phase6_solution": "The solution or MVP designed — what exactly would be built",
    "phase7_score": "The viability score and key strengths/weaknesses",
    "phase8_refined": "How the idea was refined after scoring — positioning and risk mitigation",
    "phase9_launch": "The concrete launch plan — next 3 actions and key metric",
    "evolution_summary": "2-3 sentences: how the idea transformed from scattered threads to final form. What was the key turning point?"
  }
}`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8192,
      system: [{ type: "text", text: "Return valid JSON only. Be concise in evidence fields — max 1 sentence each. Keep improvements to 1-2 sentences." }],
      messages: [{ role: "user", content: scoringPrompt }],
    });

    const usage = trackCost(response.usage);
    console.log(`  [evaluation | tokens: in=${usage.inputTokens} out=${usage.outputTokens} | cost: $${usage.cost.toFixed(4)} | total: $${usage.cumulative.toFixed(4)}]`);

    const text = response.content[0]?.text || "";

    // Parse JSON -- handle markdown-wrapped JSON
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const evaluation = JSON.parse(jsonStr);

      // Validate structure
      if (!evaluation.dimensions || !Array.isArray(evaluation.dimensions)) {
        throw new Error("Missing dimensions array");
      }

      // Recalculate total to ensure correctness
      const calculatedTotal = evaluation.dimensions.reduce((sum, d) => sum + (d.score || 0), 0);
      evaluation.totalScore = calculatedTotal;
      const calculatedPossible = evaluation.dimensions.reduce((sum, d) => sum + (d.maxScore || 0), 0);
      evaluation.totalPossible = calculatedPossible;

      console.log(`  Evaluation complete: ${calculatedTotal}/${calculatedPossible}`);
      return evaluation;
    }

    throw new Error("No JSON found in evaluation response");
  } catch (error) {
    console.log(`  [WARNING] Evaluation failed: ${error.message}`);
    // Fallback evaluation
    return {
      dimensions: [
        { name: "Phase Depth", maxScore: 30, score: 0, evidence: [], improvements: "Evaluation parsing failed" },
        { name: "Conversation Quality", maxScore: 10, score: 0, evidence: [], improvements: "Evaluation parsing failed" },
        { name: "Need Depth Progression", maxScore: 10, score: 0, evidence: [], improvements: "Evaluation parsing failed" },
        { name: "Ownership", maxScore: 10, score: 0, evidence: [], improvements: "Evaluation parsing failed" },
        { name: "Research Integration", maxScore: 10, score: 0, evidence: [], improvements: "Evaluation parsing failed" },
        { name: "Homework Loop", maxScore: 10, score: 0, evidence: [], improvements: "Evaluation parsing failed" },
        { name: "Emergent Insights", maxScore: 10, score: 0, evidence: [], improvements: "Evaluation parsing failed" },
        { name: "Score Progression", maxScore: 10, score: 0, evidence: [], improvements: "Evaluation parsing failed" },
      ],
      totalScore: 0,
      totalPossible: 120,
      summary: `Evaluation parsing failed: ${error.message}`,
      topStrength: "N/A",
      topWeakness: "N/A",
      ideaEvolution: null,
    };
  }
}

// ── Main Simulation ─────────────────────────────────────────────────────────

async function simulate() {
  console.log("Gap Finder Chat Simulation Engine");
  console.log(`  Mode: ${DRY_RUN ? `DRY RUN (${DRY_RUN_TURNS} turns)` : "FULL SIMULATION"}`);
  console.log(`  Model: ${MODEL}`);
  console.log(`  Cost limit: $${COST_ABORT.toFixed(2)}`);
  console.log("=".repeat(70));

  const apiKey = getApiKey();
  const client = new Anthropic({ apiKey });

  // ── Conversation State ──────────────────────────────────────────────────

  let currentPhase = 0;
  const summaries = [];
  let coverageState = {};
  let energyLevel = "moderate";
  const searchedSources = [];
  const researchFindings = [];

  // Messages for Gap Finder perspective (user = Marcus, assistant = Gap Finder)
  const gfMessages = [];
  // Messages for the current phase only (for summarization)
  let phaseMessages = [];

  // Full transcript for output files
  const transcript = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  let totalTurns = 0;
  let phaseTurns = 0;
  let pendingTransition = false;
  let stallCount = 0; // Consecutive turns where both sides send < 100 chars

  // ── Research State ──────────────────────────────────────────────────────
  const researchLog = [];

  // ── Homework Loop State ────────────────────────────────────────────────
  let homeworkLoopActive = false;
  let homeworkData = null;

  // ── Duration Tracking ──────────────────────────────────────────────────
  const startTime = Date.now();

  // ── Rate Limiter (50k input tokens/min for Haiku) ─────────────────────
  const RATE_LIMIT_TOKENS = 50_000;
  const RATE_LIMIT_WINDOW_MS = 60_000;
  const tokenTimestamps = []; // { time, tokens } entries

  async function rateLimitWait(estimatedInputTokens) {
    const now = Date.now();
    // Prune entries older than the window
    while (tokenTimestamps.length > 0 && now - tokenTimestamps[0].time > RATE_LIMIT_WINDOW_MS) {
      tokenTimestamps.shift();
    }
    // Sum tokens in current window
    const windowTokens = tokenTimestamps.reduce((sum, e) => sum + e.tokens, 0);
    if (windowTokens + estimatedInputTokens > RATE_LIMIT_TOKENS * 0.85) {
      const oldestTime = tokenTimestamps.length > 0 ? tokenTimestamps[0].time : now;
      const waitMs = Math.max(RATE_LIMIT_WINDOW_MS - (now - oldestTime) + 1000, 2000);
      console.log(`  [rate-limit] ${windowTokens} tokens in window, waiting ${(waitMs / 1000).toFixed(1)}s...`);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }

  function recordTokenUsage(inputTokens) {
    tokenTimestamps.push({ time: Date.now(), tokens: inputTokens });
  }

  // ── Helper: call Claude (basic, no tools) ──────────────────────────────

  async function callClaude(systemPrompt, messages, maxTokens, label) {
    if (cumulativeCost > COST_ABORT) {
      console.log(`\n!! COST LIMIT ($${COST_ABORT.toFixed(2)}) EXCEEDED -- aborting`);
      return null;
    }

    // Estimate input tokens (~4 chars per token) and wait if near rate limit
    const estimatedTokens = Math.ceil((systemPrompt.length + JSON.stringify(messages).length) / 4);
    await rateLimitWait(estimatedTokens);

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
      messages,
    });

    const usage = trackCost(response.usage);
    recordTokenUsage(usage.inputTokens);
    const text = response.content[0]?.text || "";
    console.log(`  [${label} | tokens: in=${usage.inputTokens} out=${usage.outputTokens} cached=${usage.cacheRead} | cost: $${usage.cost.toFixed(4)} | total: $${usage.cumulative.toFixed(4)}]`);

    return text;
  }

  // ── Helper: call Claude with tool_use support (for Gap Finder) ────────

  async function callClaudeWithTools(systemPrompt, messages, maxTokens, label) {
    if (cumulativeCost > COST_ABORT) {
      console.log(`\n!! COST LIMIT ($${COST_ABORT.toFixed(2)}) EXCEEDED -- aborting`);
      return null;
    }

    let currentMessages = [...messages];
    const MAX_TOOL_ITERATIONS = 5;

    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
      // Estimate input tokens and wait if near rate limit
      const estimatedTokens = Math.ceil((systemPrompt.length + JSON.stringify(currentMessages).length) / 4);
      await rateLimitWait(estimatedTokens);

      const response = await client.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
        messages: currentMessages,
        tools: simulationTools,
      });

      const usage = trackCost(response.usage);
      recordTokenUsage(usage.inputTokens);
      console.log(`  [${label}${iteration > 0 ? ` iter=${iteration + 1}` : ""} | tokens: in=${usage.inputTokens} out=${usage.outputTokens} cached=${usage.cacheRead} | cost: $${usage.cost.toFixed(4)} | total: $${usage.cumulative.toFixed(4)}]`);

      // Check if the response contains tool_use blocks
      if (response.stop_reason === "tool_use") {
        const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
        const toolResults = [];

        for (const toolUse of toolUseBlocks) {
          const executor = toolExecutors[toolUse.name];
          if (!executor) {
            console.log(`  [RESEARCH] Unknown tool: ${toolUse.name} -- skipping`);
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify({ error: `Unknown tool: ${toolUse.name}` }),
            });
            continue;
          }

          // Add rate-limit delay between API calls
          if (toolResults.length > 0) await delay(1000);

          console.log(`  [RESEARCH] ${toolUse.name}: '${toolUse.input.query || JSON.stringify(toolUse.input)}'`);

          try {
            const result = await executor(toolUse.input);
            const resultCount = result.results?.length || 0;
            console.log(`  [RESEARCH] ${result.source}: '${result.query}' -> ${resultCount} results${result.error ? ` (error: ${result.error})` : ""}`);

            // Track research state
            searchedSources.push(`${result.source}:${result.query}`);
            researchFindings.push({ source: result.source, query: result.query });
            researchLog.push({
              timestamp: new Date().toISOString(),
              source: result.source,
              query: result.query,
              resultCount,
              error: result.error || null,
            });

            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify(result),
            });
          } catch (error) {
            console.log(`  [RESEARCH] ${toolUse.name} FAILED: ${error.message}`);
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify({ source: toolUse.name.replace("search_", ""), query: toolUse.input.query, results: [], error: error.message }),
            });
          }
        }

        // Append assistant response (with tool_use blocks) and tool_results to messages
        currentMessages = [
          ...currentMessages,
          { role: "assistant", content: response.content },
          { role: "user", content: toolResults },
        ];

        // Continue the loop to get the next response
        continue;
      }

      // stop_reason is "end_turn" -- extract final text
      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");

      return text;
    }

    // If we hit max iterations, extract whatever text we have from the last response
    console.log(`  [WARNING] Hit max tool iterations (${MAX_TOOL_ITERATIONS})`);
    return null;
  }

  // ── Helper: get current Gap Finder system prompt ────────────────────────

  function getCurrentGFPrompt() {
    return buildSystemPrompt({
      currentPhase,
      summaries,
      sessionPath: currentPhase <= 3 ? "exploration" : "evaluation",
      isFirstSession: totalTurns === 0,
      isNewSession: totalTurns === 0,
      coverageState,
      energyLevel,
      researchIntensity: "medium",
      searchedSources,
      researchFindings,
    });
  }

  // ── Helper: summarize phase ─────────────────────────────────────────────

  async function summarizePhase(phase, messages) {
    console.log(`\n  Summarizing Phase ${phase}...`);
    const prompt = buildSummarizationPrompt(messages, phase);
    const result = await callClaude(
      "You are a conversation analyst. Return only valid JSON. Be concise — max 2-3 items per category.",
      [{ role: "user", content: prompt }],
      1024,
      "summarize"
    );
    if (!result) return null;

    try {
      // Handle potential markdown wrapping
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      console.log(`  Warning: No JSON object found in summary response: ${result.slice(0, 200)}`);
    } catch (e) {
      console.log(`  Warning: Failed to parse summary JSON: ${e.message}`);
      console.log(`  Raw response (first 300 chars): ${result.slice(0, 300)}`);
    }
    return { keyFindings: [], unfairAdvantages: [], decisions: [], energySignals: [] };
  }

  // ── Helper: execute homework loop (Phase 4 -> 5) ────────────────────────

  async function executeHomeworkLoop() {
    console.log("\n" + "=".repeat(70));
    console.log("  HOMEWORK LOOP DETECTED");
    console.log("=".repeat(70));

    homeworkLoopActive = true;

    // 1. Marcus acknowledges and "leaves"
    const marcusAck = "Yeah, that makes sense. I think I know exactly who to talk to. Give me a few days -- I'll come back with what I find out.";
    gfMessages.push({ role: "user", content: marcusAck });
    phaseMessages.push({ role: "user", content: marcusAck });
    console.log(`\nMARCUS: ${marcusAck}`);

    // Gap Finder acknowledges
    const gfAck = await callClaude(
      getCurrentGFPrompt(),
      gfMessages,
      getMaxTokens("gapfinder"),
      "GapFinder-homework-ack"
    );
    if (gfAck) {
      gfMessages.push({ role: "assistant", content: gfAck });
      phaseMessages.push({ role: "assistant", content: gfAck });
      console.log(`\nGAP FINDER: ${gfAck}`);
    }

    // 2. Time break marker
    const timeBreak = `
${"=".repeat(55)}
  HOMEWORK BREAK -- Marcus goes to talk to real people
   Time marker: [3 days later]
${"=".repeat(55)}`;
    console.log(timeBreak);

    // 3. Generate debrief forms
    console.log("\n  Generating debrief forms...");
    const ideaDirection = extractIdeaDirection(gfMessages);
    console.log(`  [idea direction: "${ideaDirection}"]`);

    const debriefPrompt = buildDebriefGenerationPrompt(ideaDirection, summaries);
    const debriefContent = await callClaude(
      "You are Marcus Lindqvist. Write realistic conversation debrief reports. Stay in character.",
      [{ role: "user", content: debriefPrompt }],
      1024,
      "debrief-gen"
    );

    if (!debriefContent) {
      console.log("  [WARNING] Failed to generate debrief content");
      homeworkLoopActive = false;
      return;
    }

    // Parse debrief names for console output
    const debriefNames = debriefContent.match(/#+\s*(.+)/g) || [];
    for (const name of debriefNames) {
      console.log(`  Debrief: ${name.replace(/^#+\s*/, "")}`);
    }

    // 4. Marcus returns with debrief data
    console.log("\n" + "=".repeat(70));
    console.log("  MARCUS RETURNS FROM HOMEWORK");
    console.log("=".repeat(70));

    const marcusReturn = `Right, I'm back. Talked to four people over the past few days. Here's what happened:\n\n${debriefContent}\n\nWant me to go into more detail on any of these?`;

    gfMessages.push({ role: "user", content: marcusReturn });
    phaseMessages.push({ role: "user", content: marcusReturn });

    console.log(`\nMARCUS: ${marcusReturn.slice(0, 200)}...`);
    console.log(`  [full debrief: ${marcusReturn.length} chars]`);

    // Store homework data for tracking
    homeworkData = {
      ideaDirection,
      debriefContent,
      debriefNames: debriefNames.map((n) => n.replace(/^#+\s*/, "")),
      returnedAt: new Date().toISOString(),
    };

    homeworkLoopActive = false;
  }

  // ── Helper: perform phase transition ────────────────────────────────────

  async function performTransition() {
    const fromPhase = currentPhase;
    const toPhase = currentPhase + 1;

    console.log(`\n${"=".repeat(70)}`);
    console.log(`  PHASE TRANSITION: Phase ${fromPhase} (${getPhaseConfig(fromPhase)?.name}) -> Phase ${toPhase} (${getPhaseConfig(toPhase)?.name})`);
    console.log("=".repeat(70));

    // Summarize completed phase
    const summaryData = await summarizePhase(fromPhase, phaseMessages);
    if (summaryData) {
      summaries.push({
        phase: fromPhase,
        completedAt: Date.now(),
        data: summaryData,
      });
      console.log(`  Summary: ${JSON.stringify(summaryData, null, 2)}`);
    }

    // Execute homework loop at Phase 4 -> 5 boundary
    if (fromPhase === 4 && toPhase === 5) {
      await executeHomeworkLoop();
    }

    // Advance
    currentPhase = toPhase;
    phaseTurns = 0;
    stallCount = 0;
    coverageState = {};
    pendingTransition = false;

    console.log(`  Now in Phase ${currentPhase}: ${getPhaseConfig(currentPhase)?.name}`);
    console.log("=".repeat(70));

    // Reset phase messages for new phase
    // If homework loop ran, keep the debrief data in phase messages for Phase 5
    if (fromPhase === 4 && homeworkData) {
      // Start Phase 5 with the debrief context
      phaseMessages = gfMessages.slice(-2); // Keep Marcus's debrief return message
    } else {
      phaseMessages = [];
    }
  }

  // ── Opening ─────────────────────────────────────────────────────────────

  console.log("\nStarting conversation...\n");
  console.log("=".repeat(70));

  // Marcus opens
  const marcusOpening = "Hi, I just signed up. Not entirely sure what this is but someone recommended it to me.";
  gfMessages.push({ role: "user", content: marcusOpening });
  phaseMessages.push({ role: "user", content: marcusOpening });
  transcript.push({ role: "Marcus", phase: 0, turn: 1, content: marcusOpening, energyLevel: "moderate" });

  console.log(`\nTurn 1/${DRY_RUN ? DRY_RUN_TURNS : TOTAL_TURN_LIMIT} (Phase 0: Know Yourself)`);
  console.log(`MARCUS: ${marcusOpening}`);
  console.log(`  [energy: moderate | ${marcusOpening.length} chars]`);

  // Gap Finder responds (with tool support for research)
  const gfSystemPrompt = getCurrentGFPrompt();
  const gfOpening = await callClaudeWithTools(gfSystemPrompt, gfMessages, getMaxTokens("gapfinder"), "GapFinder");
  if (!gfOpening) { console.log("Aborted."); return; }

  gfMessages.push({ role: "assistant", content: gfOpening });
  phaseMessages.push({ role: "assistant", content: gfOpening });
  transcript.push({ role: "Gap Finder", phase: 0, turn: 1, content: gfOpening, energyLevel: "moderate" });

  console.log(`\nGAP FINDER: ${gfOpening}`);
  console.log("-".repeat(70));

  totalTurns = 1;
  phaseTurns = 1;

  // ── Main Loop ───────────────────────────────────────────────────────────

  const maxTurns = DRY_RUN ? DRY_RUN_TURNS : TOTAL_TURN_LIMIT;

  while (totalTurns < maxTurns && currentPhase <= 9) {
    // Update partial data for SIGINT handler
    partialData = {
      metadata: {
        persona: "Marcus Lindqvist",
        model: MODEL,
        timestamp: new Date().toISOString(),
        totalTurns,
        phasesCompleted: summaries.length,
        durationMinutes: Math.round((Date.now() - startTime) / 60000),
        estimatedCostUSD: parseFloat(((globalInputTokens * 3 + globalOutputTokens * 15) / 1_000_000).toFixed(2)),
      },
      transcript,
      phaseSummaries: summaries,
      researchLog,
      homeworkLoop: { prepForm: null, debriefs: [], debriefContent: null, completed: !!homeworkData },
      evaluation: { dimensions: [], totalScore: 0, totalPossible: 120, summary: "Simulation interrupted", topStrength: "N/A", topWeakness: "N/A" },
      cumulativeCost,
    };

    // Check cost
    if (cumulativeCost > COST_ABORT) {
      console.log(`\n!! COST LIMIT HIT ($${cumulativeCost.toFixed(4)}) -- stopping simulation`);
      break;
    }

    // ── Check phase hard cap ──────────────────────────────────────────────

    const pacing = PHASE_PACING[currentPhase] || { cap: 8, nudge: 6 };
    if (phaseTurns >= pacing.cap) {
      console.log(`\n!! HARD CAP REACHED -- forcing Phase ${currentPhase} -> Phase ${currentPhase + 1}`);
      if (currentPhase < 9) {
        await performTransition();
      } else {
        break; // End of Phase 9 means simulation done
      }
    }

    // ── Marcus responds ───────────────────────────────────────────────────

    // Build Marcus messages (flipped perspective)
    const marcusMessages = gfMessages.map((m) => ({
      role: m.role === "user" ? "assistant" : "user",
      content: m.content,
    }));

    // Add nudge hint if near phase cap
    let marcusPhaseHint = `Phase ${currentPhase}: ${getPhaseConfig(currentPhase)?.name}`;
    if (phaseTurns >= pacing.nudge) {
      marcusPhaseHint += ". You've been in this phase for a while. If the conversation feels ready to move on, agree when Gap Finder suggests it.";
    }

    const marcusPrompt = buildMarcusPrompt(marcusPhaseHint);
    const marcusText = await callClaude(marcusPrompt, marcusMessages, getMaxTokens("marcus"), "Marcus");
    if (!marcusText) { console.log("Aborted."); break; }

    // Track energy
    energyLevel = estimateEnergy(marcusText);

    gfMessages.push({ role: "user", content: marcusText });
    phaseMessages.push({ role: "user", content: marcusText });
    transcript.push({ role: "Marcus", phase: currentPhase, turn: totalTurns + 1, content: marcusText, energyLevel });

    totalTurns++;
    phaseTurns++;

    console.log(`\nTurn ${totalTurns}/${maxTurns} (Phase ${currentPhase}: ${getPhaseConfig(currentPhase)?.name} | phase turn ${phaseTurns}/${pacing.cap})`);
    console.log(`MARCUS: ${marcusText}`);
    console.log(`  [energy: ${energyLevel} | ${marcusText.length} chars]`);

    // ── Check if Marcus agreed to pending transition ──────────────────────

    if (pendingTransition && detectTransitionAgreement(marcusText)) {
      if (currentPhase < 9) {
        await performTransition();
      } else {
        console.log("\nPhase 9 complete -- simulation finished!");
        break;
      }
    } else {
      pendingTransition = false;
    }

    // ── Gap Finder responds ───────────────────────────────────────────────

    // Add nudge to GF prompt if near cap
    const gfPrompt = getCurrentGFPrompt();
    let effectiveGFPrompt = gfPrompt;
    if (phaseTurns >= pacing.nudge) {
      effectiveGFPrompt += "\n\nNote: Consider wrapping up this phase soon. The user seems ready for a transition.";
    }

    const gfText = await callClaudeWithTools(effectiveGFPrompt, gfMessages, getMaxTokens("gapfinder"), "GapFinder");
    if (!gfText) { console.log("Aborted."); break; }

    gfMessages.push({ role: "assistant", content: gfText });
    phaseMessages.push({ role: "assistant", content: gfText });
    transcript.push({ role: "Gap Finder", phase: currentPhase, turn: totalTurns, content: gfText, energyLevel, coverageState: { ...coverageState } });

    console.log(`\nGAP FINDER: ${gfText}`);

    // ── Stall detection (goodbye loops, short exchanges, winding down) ────
    const isShortExchange = marcusText.length < 200 && gfText.length < 200;
    const isGoodbyePattern = /\b(go|bye|cheers|leaving|leaves|silence|waiting|see you|talk soon|heads out)\b/i.test(marcusText + " " + gfText);
    if (isShortExchange || isGoodbyePattern) {
      stallCount++;
      if (stallCount >= 2) {
        console.log(`\n!! STALL DETECTED (${stallCount} consecutive low-content exchanges) -- skipping ahead`);
        // Inject phase-specific stall prompt
        const skipMsg = PHASE_STALL_PROMPTS[currentPhase] || PHASE_STALL_PROMPTS[0];
        gfMessages.push({ role: "user", content: skipMsg });
        phaseMessages.push({ role: "user", content: skipMsg });
        stallCount = 0;
        // Skip coverage extraction for this stalled turn
        continue;
      }
    } else {
      stallCount = 0;
    }

    // ── Coverage extraction ───────────────────────────────────────────────

    const lastMarcusMsg = marcusText;
    const coveragePrompt = buildCoverageExtractionPrompt(currentPhase, lastMarcusMsg, gfText, coverageState);
    if (coveragePrompt) {
      try {
        const coverageResult = await callClaude(
          "You are a conversation analyst. Return only valid JSON.",
          [{ role: "user", content: coveragePrompt }],
          256,
          "coverage"
        );
        if (coverageResult) {
          const jsonMatch = coverageResult.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const extracted = JSON.parse(jsonMatch[0]);
            coverageState = mergeCoverage(coverageState, extracted);
          }
        }
      } catch (e) {
        console.log(`  [coverage extraction failed: ${e.message} -- continuing]`);
      }
      console.log(`  [coverage: ${formatCoverageState(currentPhase, coverageState)}]`);
    }

    // ── Detect homework trigger in Phase 4 ──────────────────────────────

    if (currentPhase === 4 && !homeworkLoopActive && detectHomeworkTrigger(gfText)) {
      console.log(`  [HOMEWORK TRIGGER detected in Phase 4 -- initiating homework loop]`);
      await executeHomeworkLoop();
      // After homework, perform the Phase 4->5 transition
      await performTransition();
      continue; // Skip normal transition detection, jump to next turn
    }

    // ── Detect phase transition signal ────────────────────────────────────

    if (detectPhaseTransitionSignal(gfText)) {
      pendingTransition = true;
      console.log(`  [phase transition signal detected -- waiting for Marcus agreement]`);
    }

    console.log("-".repeat(70));
  }

  // ── Summarize final phase if not already summarized ──────────────────────

  if (phaseMessages.length > 0) {
    const finalSummary = await summarizePhase(currentPhase, phaseMessages);
    if (finalSummary) {
      summaries.push({ phase: currentPhase, completedAt: Date.now(), data: finalSummary });
    }
  }

  // ── Evaluate ─────────────────────────────────────────────────────────────

  const evaluation = await evaluateSimulation(client, transcript, {
    totalTurns,
    phasesCompleted: summaries.length,
    researchCallCount: researchLog.length,
    homeworkCompleted: !!homeworkData,
  });

  // ── Duration & Cost ────────────────────────────────────────────────────

  const durationMs = Date.now() - startTime;
  const durationMinutes = Math.round(durationMs / 60000);
  const estimatedCost = (globalInputTokens * 3 + globalOutputTokens * 15) / 1_000_000;

  // ── Return simulation data for file generation ─────────────────────────

  return {
    metadata: {
      persona: "Marcus Lindqvist",
      model: MODEL,
      timestamp: new Date().toISOString(),
      totalTurns,
      phasesCompleted: summaries.length,
      durationMinutes,
      estimatedCostUSD: parseFloat(estimatedCost.toFixed(2)),
    },
    transcript,
    phaseSummaries: summaries,
    researchLog,
    homeworkLoop: {
      prepForm: homeworkData ? "Provided during Phase 4" : null,
      debriefs: homeworkData ? homeworkData.debriefNames : [],
      debriefContent: homeworkData ? homeworkData.debriefContent : null,
      completed: !!homeworkData,
    },
    evaluation,
    cumulativeCost,
  };
}

// ── Output File Generation ──────────────────────────────────────────────────

function generateTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

function generateTranscriptMd(data) {
  const { metadata, transcript, phaseSummaries, researchLog, homeworkLoop } = data;

  let md = `# Gap Finder Simulation: Marcus Lindqvist

**Date:** ${metadata.timestamp}
**Model:** ${metadata.model}
**Total Turns:** ${metadata.totalTurns}
**Phases Completed:** ${metadata.phasesCompleted}
**Duration:** ${metadata.durationMinutes} minutes

---

`;

  let currentPhase = -1;
  for (const entry of transcript) {
    if (entry.phase !== currentPhase) {
      if (currentPhase !== -1) {
        // Add phase transition marker
        const summary = phaseSummaries.find((s) => s.phase === currentPhase);
        if (summary) {
          md += `\n${"=".repeat(3)} PHASE TRANSITION: Phase ${currentPhase} -> Phase ${entry.phase} ${"=".repeat(3)}\n`;
          md += `**Phase ${currentPhase} Summary:** ${JSON.stringify(summary.data)}\n\n---\n\n`;
        }
      }
      currentPhase = entry.phase;
      const phaseConfig = PHASES.find((p) => p.number === entry.phase);
      md += `## Phase ${entry.phase}: ${phaseConfig?.name || "Unknown"}\n\n`;
    }

    md += `### Turn ${entry.turn}\n`;
    md += `**${entry.role}:** ${entry.content}\n\n`;
  }

  // Research Log
  if (researchLog.length > 0) {
    md += `---\n\n## Research Log\n\n`;
    md += `| Time | Source | Query | Results |\n`;
    md += `|------|--------|-------|---------|\n`;
    for (const entry of researchLog) {
      md += `| ${entry.timestamp} | ${entry.source} | "${entry.query}" | ${entry.resultCount} results${entry.error ? ` (${entry.error})` : ""} |\n`;
    }
    md += "\n";
  }

  // Homework Loop
  if (homeworkLoop.completed) {
    md += `## Homework Loop\n\n`;
    md += `### Prep Form\nProvided by Gap Finder during Phase 4\n\n`;
    md += `### Time Break\n3 days later...\n\n`;
    if (homeworkLoop.debriefContent) {
      md += `### Debriefs\n\n${homeworkLoop.debriefContent}\n\n`;
    }
  }

  // Stats
  const marcusMessages = transcript.filter((t) => t.role === "Marcus").length;
  const gfMessages = transcript.filter((t) => t.role === "Gap Finder").length;
  md += `## Stats\n\n`;
  md += `- Total messages: ${transcript.length}\n`;
  md += `- Marcus messages: ${marcusMessages}\n`;
  md += `- Gap Finder messages: ${gfMessages}\n`;
  md += `- Research calls: ${researchLog.length}\n`;
  md += `- Phases completed: ${metadata.phasesCompleted}\n`;
  md += `- Total duration: ${metadata.durationMinutes} minutes\n`;
  md += `- Estimated API cost: ~$${metadata.estimatedCostUSD}\n`;

  return md;
}

function generateEvaluationMd(data) {
  const { metadata, evaluation } = data;

  let md = `# Evaluation: Marcus Lindqvist Simulation

**Date:** ${metadata.timestamp}
**Total Score:** ${evaluation.totalScore}/${evaluation.totalPossible}

---

## Scoring

| Dimension | Score | Max | Notes |
|-----------|-------|-----|-------|
`;

  for (const dim of evaluation.dimensions) {
    const brief = (dim.improvements || "").slice(0, 60);
    md += `| ${dim.name} | ${dim.score} | ${dim.maxScore} | ${brief} |\n`;
  }
  md += `| **TOTAL** | **${evaluation.totalScore}** | **${evaluation.totalPossible}** | |\n`;

  md += `\n---\n\n## Detailed Analysis\n\n`;

  for (let i = 0; i < evaluation.dimensions.length; i++) {
    const dim = evaluation.dimensions[i];
    md += `### ${i + 1}. ${dim.name} (${dim.score}/${dim.maxScore})\n\n`;

    if (dim.phaseBreakdown) {
      md += `**Phase Breakdown:**\n`;
      for (const [phase, score] of Object.entries(dim.phaseBreakdown)) {
        md += `- Phase ${phase}: ${score}/5\n`;
      }
      md += "\n";
    }

    if (dim.evidence && dim.evidence.length > 0) {
      md += `**Evidence:**\n`;
      for (const e of dim.evidence) {
        md += `- ${e}\n`;
      }
      md += "\n";
    }

    if (dim.improvements) {
      md += `**Improvements:** ${dim.improvements}\n\n`;
    }
  }

  // Idea Evolution section
  if (evaluation.ideaEvolution) {
    const ie = evaluation.ideaEvolution;
    md += `---\n\n## Idea Evolution\n\n`;
    md += `### Phase 0: Know Yourself — Threads\n${ie.phase0_threads}\n\n`;
    md += `### Phase 1: Find Gaps — Opportunities\n${ie.phase1_gaps}\n\n`;
    md += `### Phase 2: Research — Evidence\n${ie.phase2_research}\n\n`;
    md += `### Phase 3: Your Idea — Crystallized\n**${ie.phase3_idea}**\n\n`;
    md += `### Phase 4: Customers — Target\n${ie.phase4_customers}\n\n`;
    md += `### Phase 5: Validation — Final Idea\n**${ie.phase5_final}**\n\n`;
    md += `### How It Evolved\n${ie.evolution_summary}\n\n`;
  }

  md += `---\n\n## Summary\n\n${evaluation.summary}\n\n`;
  md += `**Top Strength:** ${evaluation.topStrength}\n`;
  md += `**Top Weakness:** ${evaluation.topWeakness}\n`;

  return md;
}

function writeOutputFiles(data) {
  const outputDir = join(process.cwd(), "scripts", "simulations");
  mkdirSync(outputDir, { recursive: true });

  const ts = generateTimestamp();
  const baseName = `marcus-${ts}`;

  const transcriptPath = join(outputDir, `${baseName}.md`);
  const evalPath = join(outputDir, `${baseName}-eval.md`);
  const jsonPath = join(outputDir, `${baseName}.json`);

  writeFileSync(transcriptPath, generateTranscriptMd(data), "utf-8");
  writeFileSync(evalPath, generateEvaluationMd(data), "utf-8");
  writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf-8");

  return { transcriptPath, evalPath, jsonPath };
}

// ── Graceful shutdown handler ───────────────────────────────────────────────

let partialData = null;

process.on("SIGINT", () => {
  console.log("\n\nSIGINT received -- saving partial results...");
  if (partialData) {
    try {
      const files = writeOutputFiles(partialData);
      console.log("Partial results saved:");
      console.log(`  ${files.transcriptPath}`);
      console.log(`  ${files.jsonPath}`);
    } catch (err) {
      console.error("Failed to save partial results:", err.message);
    }
  }
  process.exit(1);
});

// ── Entry Point ─────────────────────────────────────────────────────────────

async function main() {
  try {
    const data = await simulate();
    if (!data) {
      console.log("Simulation aborted early.");
      return;
    }

    // Store for SIGINT handler
    partialData = data;

    // Write output files
    const files = writeOutputFiles(data);

    // CLI output
    console.log("\n" + "=".repeat(55));
    console.log("SIMULATION COMPLETE");
    console.log("=".repeat(55));
    console.log();
    console.log(`Total Score: ${data.evaluation.totalScore}/${data.evaluation.totalPossible}`);
    console.log(`Duration: ${data.metadata.durationMinutes} minutes`);
    console.log(`Estimated Cost: $${data.metadata.estimatedCostUSD}`);
    console.log(`Phases Completed: ${data.metadata.phasesCompleted}`);

    if (data.evaluation.ideaEvolution) {
      const ie = data.evaluation.ideaEvolution;
      console.log();
      console.log("-".repeat(55));
      console.log("IDEA EVOLUTION");
      console.log("-".repeat(55));
      console.log(`Phase 3 idea: ${ie.phase3_idea}`);
      console.log(`Final idea:   ${ie.phase5_final}`);
      console.log();
      console.log(ie.evolution_summary);
      console.log("-".repeat(55));
    }

    console.log();
    console.log("Files:");
    console.log(`  ${files.transcriptPath}`);
    console.log(`  ${files.evalPath}`);
    console.log(`  ${files.jsonPath}`);
    console.log("=".repeat(55));
  } catch (err) {
    console.error("Error:", err.message);
    console.error(err.stack);

    // Try to save partial results
    if (partialData) {
      console.log("\nSaving partial results...");
      try {
        const files = writeOutputFiles(partialData);
        console.log(`  ${files.transcriptPath}`);
        console.log(`  ${files.jsonPath}`);
      } catch (saveErr) {
        console.error("Failed to save partial results:", saveErr.message);
      }
    }

    process.exit(1);
  }
}

main();
