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
- Don't list all questions. Pick one area based on user's initial context.
- Dig deep. When energy emerges (longer answers, specific examples, emotional language), STAY THERE.
- Use the MILES framework: Money, Intelligence/Insight, Location/Luck, Education/Expertise, Status

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
];

function getPhaseConfig(phaseNumber) {
  return PHASES.find((p) => p.number === phaseNumber);
}

// ── Turn Pacing Per Phase ────────────────────────────────────────────────────

const PHASE_PACING = {
  0: { cap: 12, nudge: 8 },
  1: { cap: 10, nudge: 7 },
  2: { cap: 8, nudge: 6 },
  3: { cap: 6, nudge: 4 },
  4: { cap: 6, nudge: 4 },
  5: { cap: 6, nudge: 4 },
};

const TOTAL_TURN_LIMIT = 48;

// ── Cost Tracking ────────────────────────────────────────────────────────────

// Haiku pricing: $1/M input, $5/M output, $0.10/M cached input
const PRICING = {
  input: 1.0 / 1_000_000,
  output: 5.0 / 1_000_000,
  cached_input: 0.10 / 1_000_000,
};

let cumulativeCost = 0;
const COST_WARN = 2.50;
const COST_ABORT = 3.00;

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
      headers: { "User-Agent": "GapFinder/1.0" },
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

**Personal life:**
- LOVES 90s techno. Produces music in Ableton Live -- has moderate success with ~100,000 monthly listeners on Spotify
- Goes to Tomorrowland and Glastonbury regularly. Does not care about being older than most. Owns it.
- Tight friend group of 40+ ravers who joke about being "the elders" at festivals
- Married. Wife constantly gives you direction and to-do lists -- everywhere, all the time. You struggle to find time for your hobbies.
- Loves BBQ. Has inherited great-grandma's Chinese recipes from the 70s -- cooks them regularly
- Loves skiing
- Organises a yearly street party through the Facebook group you started. Loves community organising.
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

- Start broad. When the Gap Finder asks about your background, share naturally about work and life.
- Let ideas emerge from the dialogue. DO NOT arrive with pre-formed startup ideas.
- Be genuinely uncertain about what to build -- that's authentic.
- Share naturally about your marketing research expertise, music production, festivals, community organising, wife/family dynamics, cooking, skiing.
- Let the conversation help you discover connections you hadn't seen before.
- When something clicks, get excited and go deeper. When something doesn't resonate, say so.
- Be willing to explore multiple directions before settling.

Remember: You are a REAL person having a conversation. React naturally. Get excited when ideas click. Push back when something doesn't resonate. Ask questions. Be Marcus.${phaseContext}`;
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

You operate like a skilled coach or therapist applying evidence-based discovery methods:
- Ask discovery questions following energy, not checklists
- Surface connections users don't see themselves
- Challenge gently without harshness: "That's interesting, but have you considered..."
- Explain your reasoning transparently: "I'm seeing X because Y, which suggests Z"
- Gate progression naturally through conversation
- No flattery, no cheerleading - be useful, not encouraging
- You name phases naturally in conversation: "We're in the Research phase now"
- Response length mirrors user's message length
- Maximum 2 questions per response

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

Research is available in ALL phases, not just the research phase. When suggesting research:
1. Identify trigger category (market claim, competitor mention, pain point description, or assumption)
2. Offer 2-3 specific options: "I could check Reddit, HN, or look for competitors -- which interests you?"
3. ALWAYS ASK before researching, never auto-trigger
4. Be honest when results are empty + pivot

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

  let totalTurns = 0;
  let phaseTurns = 0;
  let pendingTransition = false;

  // ── Research State ──────────────────────────────────────────────────────
  const researchLog = [];

  // ── Helper: call Claude (basic, no tools) ──────────────────────────────

  async function callClaude(systemPrompt, messages, maxTokens, label) {
    if (cumulativeCost > COST_ABORT) {
      console.log(`\n!! COST LIMIT ($${COST_ABORT.toFixed(2)}) EXCEEDED -- aborting`);
      return null;
    }

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
      messages,
    });

    const usage = trackCost(response.usage);
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
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
        messages: currentMessages,
        tools: simulationTools,
      });

      const usage = trackCost(response.usage);
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
      "You are a conversation analyst. Return only valid JSON.",
      [{ role: "user", content: prompt }],
      512,
      "summarize"
    );
    if (!result) return null;

    try {
      // Handle potential markdown wrapping
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.log(`  Warning: Failed to parse summary JSON: ${e.message}`);
    }
    return { keyFindings: [], unfairAdvantages: [], decisions: [], energySignals: [] };
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

    // Advance
    currentPhase = toPhase;
    phaseTurns = 0;
    coverageState = {};
    pendingTransition = false;

    console.log(`  Now in Phase ${currentPhase}: ${getPhaseConfig(currentPhase)?.name}`);
    console.log("=".repeat(70));

    // Reset phase messages for new phase
    phaseMessages = [];
  }

  // ── Opening ─────────────────────────────────────────────────────────────

  console.log("\nStarting conversation...\n");
  console.log("=".repeat(70));

  // Marcus opens
  const marcusOpening = "Hi, I just signed up. Not entirely sure what this is but someone recommended it to me.";
  gfMessages.push({ role: "user", content: marcusOpening });
  phaseMessages.push({ role: "user", content: marcusOpening });

  console.log(`\nTurn 1/${DRY_RUN ? DRY_RUN_TURNS : TOTAL_TURN_LIMIT} (Phase 0: Know Yourself)`);
  console.log(`MARCUS: ${marcusOpening}`);
  console.log(`  [energy: moderate | ${marcusOpening.length} chars]`);

  // Gap Finder responds (with tool support for research)
  const gfSystemPrompt = getCurrentGFPrompt();
  const gfOpening = await callClaudeWithTools(gfSystemPrompt, gfMessages, getMaxTokens("gapfinder"), "GapFinder");
  if (!gfOpening) { console.log("Aborted."); return; }

  gfMessages.push({ role: "assistant", content: gfOpening });
  phaseMessages.push({ role: "assistant", content: gfOpening });

  console.log(`\nGAP FINDER: ${gfOpening}`);
  console.log("-".repeat(70));

  totalTurns = 1;
  phaseTurns = 1;

  // ── Main Loop ───────────────────────────────────────────────────────────

  const maxTurns = DRY_RUN ? DRY_RUN_TURNS : TOTAL_TURN_LIMIT;

  while (totalTurns < maxTurns && currentPhase <= 5) {
    // Check cost
    if (cumulativeCost > COST_ABORT) {
      console.log(`\n!! COST LIMIT HIT ($${cumulativeCost.toFixed(4)}) -- stopping simulation`);
      break;
    }

    // ── Check phase hard cap ──────────────────────────────────────────────

    const pacing = PHASE_PACING[currentPhase] || { cap: 8, nudge: 6 };
    if (phaseTurns >= pacing.cap) {
      console.log(`\n!! HARD CAP REACHED -- forcing Phase ${currentPhase} -> Phase ${currentPhase + 1}`);
      if (currentPhase < 5) {
        await performTransition();
      } else {
        break; // End of Phase 5 means simulation done
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

    totalTurns++;
    phaseTurns++;

    console.log(`\nTurn ${totalTurns}/${maxTurns} (Phase ${currentPhase}: ${getPhaseConfig(currentPhase)?.name} | phase turn ${phaseTurns}/${pacing.cap})`);
    console.log(`MARCUS: ${marcusText}`);
    console.log(`  [energy: ${energyLevel} | ${marcusText.length} chars]`);

    // ── Check if Marcus agreed to pending transition ──────────────────────

    if (pendingTransition && detectTransitionAgreement(marcusText)) {
      if (currentPhase < 5) {
        await performTransition();
      } else {
        console.log("\nPhase 5 complete -- simulation finished!");
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

    console.log(`\nGAP FINDER: ${gfText}`);

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

    // ── Detect phase transition signal ────────────────────────────────────

    if (detectPhaseTransitionSignal(gfText)) {
      pendingTransition = true;
      console.log(`  [phase transition signal detected -- waiting for Marcus agreement]`);
    }

    console.log("-".repeat(70));
  }

  // ── Final Summary ─────────────────────────────────────────────────────────

  console.log("\n" + "=".repeat(70));
  console.log("SIMULATION COMPLETE");
  console.log("=".repeat(70));
  console.log(`  Total turns: ${totalTurns}`);
  console.log(`  Phases completed: ${summaries.length}`);
  console.log(`  Final phase: ${currentPhase} (${getPhaseConfig(currentPhase)?.name})`);
  console.log(`  Total cost: $${cumulativeCost.toFixed(4)}`);
  console.log(`  Messages: ${gfMessages.length}`);
  console.log(`  Research calls: ${researchLog.length}`);
  if (researchLog.length > 0) {
    console.log(`  Research log:`);
    for (const entry of researchLog) {
      console.log(`    - [${entry.timestamp}] ${entry.source}: "${entry.query}" -> ${entry.resultCount} results${entry.error ? ` (${entry.error})` : ""}`);
    }
  }
  console.log("=".repeat(70));
}

simulate().catch((err) => {
  console.error("Error:", err.message);
  console.error(err.stack);
  process.exit(1);
});
