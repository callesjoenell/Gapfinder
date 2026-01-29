# Skill Adaptation Research

**Date:** 2026-01-29
**Status:** Complete
**Purpose:** Define how to adapt the Gap Finder skill for the Anthropic API while preserving the experience that makes users feel empowered and like they discovered something truly theirs.

---

## Executive Summary

The Gap Finder skill (1883 lines) was designed for Claude.ai's native context persistence. Adapting it for the Anthropic API requires solving three core challenges:

1. **Context Reconstruction** - Rebuilding meaningful context from stateless requests
2. **Ownership Preservation** - Ensuring users feel "I discovered this" not "Claude suggested this"
3. **Handoff Management** - Supporting phases where users leave and return

### Key Recommendations

| Area | Recommendation |
|------|----------------|
| **System Prompt** | Phase-specific loading (~150-300 lines active) + compressed context from past phases |
| **Data Model** | Phase-specific summary schemas instead of generic `keyFindings` arrays |
| **Handoffs** | Explicit "awaiting return" state with structured handoff packages |
| **Ownership** | Preserve skill's FORBIDDEN/REQUIRED patterns in every system prompt |
| **Research Tools** | v1 without MCP is viable; user provides their own research |

### Critical Insight: The Emotional Journey

The skill isn't just a framework - it's a psychological journey. Users should exit feeling:
- **Confident** - "I have clarity about what to build"
- **Capable** - "I CAN do this"
- **Ownership** - "This is MY idea, I discovered it"

Every technical decision should serve this emotional outcome.

---

## Research Area 1: Skill Structure Analysis

### What the Skill Contains (1883 lines)

| Section | Lines | Purpose | When Needed |
|---------|-------|---------|-------------|
| Header/Trigger | 1-42 | Skill identification, triggers | Never in API (handled by app) |
| User Context | 43-56 | Distribution channels, build window, projects | ALWAYS (must capture from user) |
| Ten Phases Overview | 57-102 | Process orientation | Phase 0-1 orientation |
| Phase 0 | 104-303 | Know Yourself - excavation | Phase 0 only |
| Phase 1 | 306-519 | Find Gaps - research | Phase 1 only |
| Phase 2 | 522-617 | Connect the Dots (handoff) | Phase 2 only |
| Phase 3 | 619-663 | Pick Your Person | Phase 3 only |
| Phase 4 | 665-878 | Score & Sharpen | Phase 4 only |
| Phase 4.5 | 881-940 | Moat Check | After Phase 4 |
| Phase 5 | 944-1109 | Discovery Calls (handoff) | Phase 5 only |
| Phase 6 | 1112-1233 | Validation Calls (handoff) | Phase 6 only |
| Phase 7 | 1236-1289 | Design Your Offer | Phase 7 only |
| Phase 8 | 1292-1388 | Sell First (handoff) | Phase 8 only |
| Phase 9 | 1390-1425 | Build & Ship | Phase 9 only |
| Life Alignment | 1428-1455 | Final filter | Phase 9 or any decision point |
| Research Tools | 1459-1636 | MCP servers, APIs, search patterns | Phase 1 primarily |
| Core Framework | 1640-1706 | Three forces, identity lens | ALWAYS |
| AI Philosophy | 1686-1706 | How to use AI | ALWAYS |
| Distribution Check | 1710-1723 | Reality check | ALWAYS |
| Solo Builder Filter | 1726-1737 | Feasibility check | Phase 4+ |
| Devil's Advocate | 1740-1757 | Challenge patterns | ALWAYS |
| Conversational Flow | 1759-1814 | How to conduct dialogue | ALWAYS |
| Critical Reminders | 1835-1883 | Do/don't rules | ALWAYS |

### Decomposition Strategy

**Always in System Prompt (~300 lines):**
```
- Core Philosophy (lines 8-29)
- User Context (captured, not hardcoded)
- Core Framework / Three Forces (lines 1640-1666)
- Identity Lens (lines 1670-1683)
- AI Philosophy (lines 1686-1706)
- Distribution Reality Check (lines 1710-1723)
- Devil's Advocate patterns (lines 1740-1757)
- Conversational Flow rules (lines 1759-1814)
- Ownership rules (FORBIDDEN/REQUIRED)
```

**Phase-Specific (~100-200 lines):**
```
- Current phase detailed instructions
- Phase-specific completion criteria
- Phase-specific question patterns
- If Phase 1: Research tool patterns
- If Phase 4+: Solo Builder Filter
```

**Compressed Context (~50-150 lines):**
```
- Past phase summaries (structured, not prose)
- User's captured context (distribution, build window, projects)
- Key decisions and scores from previous phases
```

### Token Budget Estimate

| Component | Est. Tokens | Notes |
|-----------|-------------|-------|
| Always-loaded core | ~2,000-3,000 | Philosophy, patterns, rules |
| Current phase | ~800-1,500 | Detailed instructions |
| Past context | ~500-1,000 | Compressed summaries |
| **System Prompt Total** | ~3,500-5,500 | ~2-3% of 200K context |
| Conversation history | Variable | Current phase only |

This is well within budget and leaves room for long conversations.

---

## Research Area 2: User Context Persistence

### What Phase 0 Produces

The skill's Phase 0 produces specific outputs that ALL future phases need:

```typescript
interface Phase0Output {
  // Excavation scores for all 6 starting points
  startingPoints: {
    lifeSituation: ExcavationScore;
    profession: ExcavationScore;
    hobbies: ExcavationScore;
    skillsOthersPay: ExcavationScore;
    networks: ExcavationScore;
    transformations: ExcavationScore;
  };

  // Identified advantages (from scoring 12+ areas)
  unfairAdvantages: UnfairAdvantage[];

  // Where 2+ areas overlap
  intersectionZones: IntersectionZone[];

  // Direction for Phase 1 research
  huntingGrounds: string[];

  // If no area scores well
  frontierPath?: FrontierPathPlan;
}

interface ExcavationScore {
  depth: 1 | 2 | 3 | 4 | 5;      // How much do they really know?
  access: 1 | 2 | 3 | 4 | 5;    // Can they reach people with this problem?
  energy: 1 | 2 | 3 | 4 | 5;    // Does thinking about this energize them?
  total: number;                 // Sum (max 15)
  evidence: string[];           // Specific quotes/examples supporting score
}

interface UnfairAdvantage {
  area: string;
  description: string;
  evidence: string[];
  applicableTo: string[];       // What kinds of problems this advantage helps with
}

interface IntersectionZone {
  areas: string[];              // Which 2+ areas overlap
  description: string;          // "Profession + Life Situation"
  powerLevel: "strong" | "moderate";
  insight: string;              // What this intersection reveals
}
```

### User Context (Captured, Not Hardcoded)

The skill has a "User Context" section that's currently hardcoded. This should be captured during onboarding or early Phase 0:

```typescript
interface UserContext {
  // Distribution capability
  distributionChannels: {
    platform: string;           // "LinkedIn", "Instagram", etc.
    audienceType: string;       // "B2C", "professional", "creator"
    estimatedReach?: number;    // Followers/connections
  }[];

  // Build constraints
  buildWindow: {
    weeksAvailable: number;     // 2-4 typical
    tooling: string;            // "Claude Code", etc.
    technicalLevel: "beginner" | "intermediate" | "advanced";
  };

  // Feedback preferences
  challengeMode: boolean;       // Always honest feedback?

  // Existing projects (for synergy at end)
  existingProjects?: {
    name: string;
    description: string;
    synergies: string[];        // What it could connect to
  }[];
}
```

### Data Model Recommendation

**Current schema (too generic):**
```typescript
data: {
  keyFindings: string[];
  unfairAdvantages: string[];
  decisions: string[];
  energySignals: string[];
}
```

**Recommended: Phase-specific summary types:**
```typescript
// Union type for phase-specific data
type PhaseSummaryData =
  | Phase0Summary
  | Phase1Summary
  | Phase2Summary
  | Phase3Summary
  | Phase4Summary
  | Phase5Summary
  | Phase6Summary
  | Phase7Summary
  | Phase8Summary
  | Phase9Summary;

// Example: Phase 0 specific
interface Phase0Summary {
  type: "phase0";
  startingPoints: Record<string, ExcavationScore>;
  unfairAdvantages: UnfairAdvantage[];
  intersectionZones: IntersectionZone[];
  huntingGrounds: string[];
  energyPeaks: string[];        // Topics that lit them up
}

// Example: Phase 1 specific
interface Phase1Summary {
  type: "phase1";
  painSignals: PainSignal[];
  underservedAudiences: string[];
  timingAssessment: TimingScore;
  identityGaps: string[];       // Who people want to become
  distributionOpportunities: string[];
  researchSources: string[];    // Where they found data
}
```

---

## Research Area 3: Phase-Specific Summarization

### What Each Phase Actually Produces

| Phase | Name | Key Output | NOT Generic "keyFindings" |
|-------|------|------------|---------------------------|
| 0 | Know Yourself | Excavation scores, unfair advantages, intersection zones | Structured scores with evidence |
| 1 | Find Gaps | Pain signals, timing assessment, distribution reality | Validated signals with sources |
| 2 | Connect Dots | USER'S synthesized idea (handoff phase) | User brings their own idea back |
| 3 | Pick Person | Person Canvas, identity transformation | WHO they serve, not WHAT they build |
| 4 | Score & Sharpen | Evaluation scorecard (Pain/Simplicity/Shareability/Timing/Distribution) | Numeric scores with rationale |
| 4.5 | Moat Check | Defensibility assessment (7 Powers) | Moat rating: Strong/Moderate/Weak |
| 5 | Discovery Calls | Conversation patterns, surprises, language bank | User's research, not Claude's |
| 6 | Validation Calls | Pattern confirmation, price evidence, early adopters | Evidence of willingness to pay |
| 7 | Design Offer | Offer structure, 3-word simplicity test | Concrete offer, not abstract idea |
| 8 | Sell First | Pre-sell results, conversion data | Real commitment evidence |
| 9 | Build & Ship | Launch plan, one metric, kill criteria | Actionable next steps |

### Phase Summary Schemas (TypeScript)

```typescript
// Phase 3: Pick Your Person
interface Phase3Summary {
  type: "phase3";
  personCanvas: {
    whoExactly: string;         // Job, situation, life stage
    currentIdentity: string;    // How they see themselves now
    desiredIdentity: string;    // Who they're trying to become
    transformationBlock: string;// What's blocking the change
    whereTheyHangOut: string[]; // Specific platforms, communities
    whatTheyTried: string[];    // Failed solutions, workarounds
    hiddenPain: string;         // What they're embarrassed to admit
    reachable: boolean;         // Can user reach via their channels?
  };
  identityTransformation: {
    surfaceProblem: string;
    identityGap: string;
    example: string;
  };
  checklistPassed: boolean;     // All 5 boxes checked?
}

// Phase 4: Score & Sharpen
interface Phase4Summary {
  type: "phase4";
  scores: {
    pain: number;               // 1-10
    simplicityPassed: boolean;  // Pass/Fail
    threeWords?: string;        // The 3-word description
    shareability: number;       // 1-10
    timing: number;             // 1-10
    timingSubFactors?: Record<string, number>;
    distributionFitPassed: boolean;
  };
  totalScore: number;           // /30
  decision: "proceed" | "sharpen" | "pivot";
  sharpeningNeeded?: string[];  // Which dimensions need work
  moatAssessment?: {
    rating: "strong" | "moderate" | "weak";
    sources: string[];          // Which moat sources apply
    evidence: string;
  };
}

// Phase 5: Discovery Calls
interface Phase5Summary {
  type: "phase5";
  conversationCount: number;
  patterns: {
    strong: string[];           // 7+ people said
    moderate: string[];         // 4-6 people said
    surprising: string[];       // Contradicted assumptions
  };
  languageBank: string[];       // Exact phrases people used
  strugglingMoments: string[];  // Specific triggers
  emotionalPeaks: string[];     // Where voice changed, strong reactions
  readyForValidation: boolean;
}

// Phase 6: Validation Calls
interface Phase6Summary {
  type: "phase6";
  conversationCount: number;
  patternConfirmation: {
    confirmed: string[];
    contradicted: string[];
  };
  priceEvidence: {
    whatTheySpent: string[];    // Actual past spending
    pricePointsMentioned: string[];
    offeredToPayNow: number;    // How many
  };
  earlyAdopters: {
    count: number;
    signals: string[];          // Using workaround, actively searching, etc.
  };
  decision: "proceed" | "reframe" | "pivot";
}
```

---

## Research Area 4: Handoff Phase Handling

### Which Phases Have Handoffs

| Phase | Handoff Type | User Leaves To... | Returns With... |
|-------|--------------|-------------------|-----------------|
| 2 | Synthesis | Connect dots alone, with partner, or with other AI | THEIR idea (ownership critical) |
| 5 | Discovery | Talk to 10+ real humans | Conversation findings, patterns |
| 6 | Validation | Talk to 10+ more humans | Price evidence, early adopters |
| 8 | Pre-Sell | Pitch to people from validation | Conversion data, objections |

### Handoff Context Package

When user leaves for a handoff phase, they need context to work with:

```typescript
interface HandoffPackage {
  phase: number;
  handoffType: "synthesis" | "discovery" | "validation" | "presell";

  // What they're taking away
  context: {
    // Summary of what led here
    journeySoFar: string;

    // Phase-specific content
    phase0Context?: Phase0Summary;  // Their unfair advantages
    phase1Context?: Phase1Summary;  // Gaps and signals
    personCanvas?: Phase3Summary;   // Who they're serving
    scores?: Phase4Summary;         // If validated
  };

  // What they should do
  assignment: {
    goal: string;                   // "Synthesize YOUR idea"
    guidance: string[];             // Key points to remember
    templateIfAny?: string;         // Capture template for calls
    minimumActions?: string;        // "Talk to 10+ people"
  };

  // What to bring back
  returnExpectations: {
    requiredData: string[];         // What they must have
    captureFormat?: string;         // Template for recording
    questions: string[];            // What Claude will ask on return
  };
}
```

### Phase 2 Handoff (Critical - Ownership)

This is the MOST important handoff because it's where ownership is established:

**What Claude Presents Before User Leaves:**
```
YOUR CONTEXT (from Phase 0)
- Strongest starting points: [top 2-3 areas, scored]
- Your unfair advantages: [specific edges]
- Access you have: [networks, communities]
- Transformations you've made: [journeys completed]

WHAT THE RESEARCH FOUND (from Phase 1)
- Pain signals: [top 3 validated pains with evidence]
- Underserved audiences: [who's being ignored]
- Timing windows: [what's newly possible]
- Identity gaps: [who people want to become]
- Distribution opportunities: [underpriced channels]

POTENTIAL CONNECTIONS (Claude's observations)
- "Your [advantage] + [pain signal] = possible angle"
- "Your access to [group] + their [need] = reach"
- "Your transformation [X->Y] + [audience] = credibility"
```

**What Claude Does NOT Do:**
- Generate ideas for user to pick from
- Suggest "what about X?"
- Provide lists of opportunities
- Tell user what to build
- Score or evaluate ideas (that's Phase 4)

**What User Returns With:**
```
I help [SPECIFIC PERSON]
who struggles with [SPECIFIC PROBLEM]
achieve [IDENTITY TRANSFORMATION]
by [YOUR APPROACH/EDGE]
```

### Awaiting Return State

```typescript
interface SessionState {
  currentPhase: number;
  status: "active" | "awaiting_return" | "completed";

  // If awaiting return
  handoffInfo?: {
    handoffPhase: number;
    handoffAt: number;
    handoffPackage: HandoffPackage;
    expectedReturn: string;       // "When you have your idea"
  };
}
```

### Return Flow

When user returns after a handoff:

1. **Detect return** - User sends message after `awaiting_return` status
2. **Ask about experience** - "You're back! Tell me what emerged from your synthesis/conversations"
3. **Listen first** - Don't immediately evaluate
4. **Gently check** - Does what they brought back connect to Phase 0 context?
5. **Help sharpen** - If needed, help them articulate more clearly
6. **Gate progression** - Ensure they have what's needed before moving on

---

## Research Area 5: Research Tool Requirements

### What Phase 1 Needs (Skill's Research Tools Section)

The skill references extensive research capabilities:

**MCP Servers (Tier 1):**
- google-news-trends-mcp (No API key!)
- tavily-mcp (web search, 1000 free queries/month)
- mcp-server-reddit
- @devabdultech/hn-mcp
- product-hunt-mcp
- github-mcp-server

**Web Search Patterns:**
- Pain signals: `site:reddit.com "[topic]" frustrated OR struggling`
- Competition: `site:producthunt.com "[topic]"`
- Graveyard: `site:failory.com "[topic]"`
- Pricing: `"[competitor] pricing"`

### v1 Without MCP: Viable?

**Yes, with degraded experience.** Here's how:

| With MCP | Without MCP (v1) |
|----------|------------------|
| Claude searches Reddit | User shares Reddit links/quotes |
| Claude checks Google Trends | User describes what they searched |
| Claude scans ProductHunt | User reports competitors they found |
| Claude validates pain | User brings evidence from their research |

**The Reframe:** Phase 1 becomes more collaborative:
- Claude guides WHAT to research and WHERE to look
- User does the actual searching
- User brings back findings
- Claude helps interpret and synthesize

**System prompt adjustment for v1:**
```
You don't have direct research tools. Instead:
1. Tell user EXACTLY what to search and where
2. Ask them to share what they find (quotes, links, data)
3. Help them interpret the signals
4. Challenge weak evidence
```

**What's Lost:**
- Speed of research
- Depth of coverage
- Serendipitous discovery

**What's Preserved:**
- User learns the research process
- User owns the findings
- Framework still applies
- Evidence still required before proceeding

### Future Enhancement: Research Agent

For v2, consider a background research agent that:
- User provides topic/area
- Agent does parallel searches
- Returns structured findings
- User reviews and selects relevant signals

---

## Research Area 6: System Prompt Strategy

### Current Implementation

`systemPrompts.ts` builds a ~137-line system prompt with:
- Role description (coach/therapist approach)
- Ownership rules (FORBIDDEN/REQUIRED)
- Scientific frameworks (MILES, Ikigai, Mom Test, JTBD)
- Phase completion criteria
- Tone guidelines
- Response format rules

`phaseConfig.ts` provides phase-specific instructions (~30-50 lines per phase).

**Gap:** Current implementation doesn't include:
- Distribution Reality Check
- Solo Builder Filter
- Devil's Advocate patterns
- Three Forces framework
- Identity Lens details
- Research tool patterns

### Recommended Architecture

```
SYSTEM PROMPT STRUCTURE
========================

1. CORE IDENTITY (~50 lines)
   - Who you are
   - Ownership rules (FORBIDDEN/REQUIRED)
   - Tone guidelines

2. USER CONTEXT (~30 lines)
   - Captured distribution channels
   - Build window
   - Existing projects (if any)
   - Challenge mode preference

3. PAST PHASE CONTEXT (~50-150 lines, dynamic)
   - Phase 0 summary (if completed)
   - Phase 1 summary (if completed)
   - etc.
   - Key decisions and scores

4. CURRENT PHASE (~100-200 lines)
   - Detailed instructions for THIS phase
   - Completion criteria
   - Phase-specific patterns
   - If handoff phase: handoff handling

5. ALWAYS-ON FRAMEWORKS (~100 lines)
   - Three Forces
   - Identity Lens
   - Devil's Advocate patterns
   - Distribution Reality Check
   - Conversational flow rules

TOTAL: ~350-550 lines (~3,000-5,000 tokens)
```

### Phase-Specific Loading Examples

**Phase 0 System Prompt includes:**
- Excavation questions framework
- MILES framework details
- Scoring guide (Depth/Access/Energy)
- Energy signals to watch
- Intersection zone patterns

**Phase 1 System Prompt includes:**
- Research patterns (what to search)
- Timing assessment (6 factors)
- Distribution-first research approach
- Underpriced channels by demographic
- Anti-patterns to reject

**Phase 4 System Prompt includes:**
- All 5 scoring dimensions with criteria
- Sharpening process for each dimension
- Decision gates
- Moat check (7 Powers)

### Token Budget Validation

```
Component                    Estimated Tokens
-------------------------------------------------
Core identity                ~400
User context                 ~200
Past phase context           ~800 (varies)
Current phase instructions   ~1,200
Always-on frameworks         ~800
-------------------------------------------------
TOTAL                        ~3,400 tokens

Context window               200,000 tokens
System prompt %              ~1.7%

Leaves 98.3% for conversation history.
```

This is well within budget even for long conversations.

---

## Research Area 7: The Ownership Experience

### How the Skill Prevents Idea Generation

The skill has explicit rules (lines 571-581):

**What Claude Does NOT Do:**
- Generate ideas for user to pick from
- Suggest "what about X?"
- Provide lists of "opportunities in your space"
- Tell user what they should build
- Score or evaluate ideas (Phase 4)

**Claude's Role:** Surface, organize, and prepare the ingredients. USER cooks.

### Conversational Patterns That Preserve Ownership

**Redirect Pattern:**
```
User: "What should I build?"
Claude: "Let me turn that back to you. What problems have YOU struggled with that
        made you think 'why hasn't someone fixed this?'"
```

**Discovery Pattern:**
```
User: [describes their experience]
Claude: "I'm noticing a pattern here - [observation]. What do YOU make of that?"
```

**Connection Pattern:**
```
Claude: "Your expertise in [X] combined with your access to [Y] creates an
        interesting intersection. What possibilities does that open up for you?"
```

**Validation Pattern:**
```
User: "I think I should build..."
Claude: "Tell me more about why THIS idea. What about it feels like yours?"
```

### System Prompt Rules (Must Include)

```
## Ownership Rules (Non-Negotiable)

FORBIDDEN:
- Never generate idea lists
- Never say "Here are some ideas for you"
- Never prescribe answers to identity/preference questions
- Never finish their sentences about what they want to build
- Never tell them what's "best" for them to pursue

REQUIRED:
- Always ask: "What patterns do YOU notice here?"
- Redirect "What should I build?" to "What problems have YOU struggled with?"
- When they're close to insight, ask questions that help them see it themselves
- Use phrases like "What do you make of that?" not "This means..."
- When presenting research, say "Here's what the data shows. What stands out to you?"

THE GOAL:
User should feel "I discovered this" not "Claude suggested this."
When they tell others about their idea, they should naturally say
"I realized..." not "Claude told me..."
```

### Measuring Ownership

Signals that ownership is working:

| Signal | What It Means |
|--------|---------------|
| User defends their idea when challenged | They own it |
| User says "I noticed" / "I realized" | Self-discovery language |
| User brings concerns proactively | Deep thinking, not passive acceptance |
| User asks "how do I..." questions | Ready to act |
| User returns from Phase 2 with clear conviction | Synthesis worked |

Signals that ownership is failing:

| Signal | What It Means |
|--------|---------------|
| User asks "Is this a good idea?" repeatedly | Seeking validation, not owning |
| User says "Claude suggested" when describing idea | Attribution to Claude |
| User abandons idea at first obstacle | No ownership = no persistence |
| User can't explain why THIS idea | Didn't discover, just accepted |

### The Emotional Journey

Beyond the framework, the skill creates an emotional arc:

```
Phase 0: "I have more to offer than I realized"
         (Discovery of unfair advantages)

Phase 1: "There are real problems I could solve"
         (Connection to market reality)

Phase 2: "I see how my unique combination fits"
         (Synthesis and ownership)

Phase 3: "I know exactly who I'm helping"
         (Clarity of purpose)

Phase 4: "This is worth pursuing"
         (Validated confidence)

Phases 5-6: "Real people confirmed this matters"
            (External validation)

Phase 7-8: "People will pay for this"
           (Market validation)

Phase 9: "I know exactly what to do next"
         (Action confidence)
```

The goal is that users exit feeling CAPABLE and CLEAR, not just informed.

---

## Schema Proposals

### Updated Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    userId: v.string(),
    name: v.string(),
    currentPhase: v.number(),
    path: v.union(v.literal("exploration"), v.literal("evaluation")),
    status: v.union(
      v.literal("active"),
      v.literal("awaiting_return"),
      v.literal("completed")
    ),
    isPaid: v.boolean(),
    isDeleted: v.boolean(),

    // User context (captured during onboarding/Phase 0)
    userContext: v.optional(v.object({
      distributionChannels: v.array(v.object({
        platform: v.string(),
        audienceType: v.string(),
        estimatedReach: v.optional(v.number()),
      })),
      buildWindow: v.object({
        weeksAvailable: v.number(),
        tooling: v.string(),
        technicalLevel: v.union(
          v.literal("beginner"),
          v.literal("intermediate"),
          v.literal("advanced")
        ),
      }),
      challengeMode: v.boolean(),
      existingProjects: v.optional(v.array(v.object({
        name: v.string(),
        description: v.string(),
      }))),
    })),

    // Handoff tracking
    handoffInfo: v.optional(v.object({
      handoffPhase: v.number(),
      handoffAt: v.number(),
      expectedReturn: v.string(),
      handoffPackageSummary: v.string(), // Compressed for storage
    })),

    // Idea card (evolved from current)
    ideaStatement: v.optional(v.string()),   // "I help [X] do [Y] by [Z]"
    ideaScore: v.optional(v.number()),       // Total from Phase 4
    moatRating: v.optional(v.union(
      v.literal("strong"),
      v.literal("moderate"),
      v.literal("weak")
    )),

    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isDeleted", "lastActiveAt"]),

  messages: defineTable({
    sessionId: v.id("sessions"),
    phase: v.number(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.number(),
  })
    .index("by_session", ["sessionId", "timestamp"])
    .index("by_session_phase", ["sessionId", "phase", "timestamp"]),

  // Phase-specific summaries with typed data
  phaseSummaries: defineTable({
    sessionId: v.id("sessions"),
    phase: v.number(),
    completedAt: v.number(),

    // Type discriminator
    summaryType: v.string(), // "phase0", "phase1", etc.

    // Flexible data field - validated in application code
    data: v.any(),

    // Common fields across all summaries
    energyPeaks: v.array(v.string()),  // Topics that lit them up
    keyDecisions: v.array(v.string()), // Concrete commitments
  }).index("by_session", ["sessionId", "phase"]),
});
```

### TypeScript Types for Phase Summaries

```typescript
// src/lib/types/phaseSummaries.ts

// Phase 0: Know Yourself
export interface Phase0SummaryData {
  startingPoints: {
    lifeSituation: ExcavationScore;
    profession: ExcavationScore;
    hobbies: ExcavationScore;
    skillsOthersPay: ExcavationScore;
    networks: ExcavationScore;
    transformations: ExcavationScore;
  };
  unfairAdvantages: Array<{
    area: string;
    description: string;
    evidence: string[];
  }>;
  intersectionZones: Array<{
    areas: string[];
    insight: string;
    powerLevel: "strong" | "moderate";
  }>;
  huntingGrounds: string[];
  frontierPathChosen?: boolean;
}

interface ExcavationScore {
  depth: 1 | 2 | 3 | 4 | 5;
  access: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
  total: number;
  topEvidence: string[];
}

// Phase 1: Find Gaps
export interface Phase1SummaryData {
  painSignals: Array<{
    pain: string;
    evidence: string[];
    validationStrength: "strong" | "moderate" | "weak";
  }>;
  underservedAudiences: string[];
  timingAssessment: {
    technologyReadiness: number;
    behaviorReadiness: number;
    marketAwareness: number;
    competitionStage: number;
    infrastructure: number;
    catalystPresent: number;
    overallScore: number;
    whyNow: string;
  };
  identityGaps: string[];
  distributionOpportunities: string[];
}

// Phase 2: Connect the Dots (Handoff - minimal storage)
export interface Phase2SummaryData {
  handoffProvided: boolean;
  userReturned: boolean;
  ideaStatement?: string; // What they brought back
  connectionToPhase0: string; // How it connects to their advantages
  ownershipSignals: string[]; // Evidence they own it
}

// Phase 3: Pick Your Person
export interface Phase3SummaryData {
  personCanvas: {
    whoExactly: string;
    currentIdentity: string;
    desiredIdentity: string;
    transformationBlock: string;
    whereTheyHangOut: string[];
    whatTheyTried: string[];
    hiddenPain: string;
    reachableViaUserChannels: boolean;
  };
  identityTransformation: {
    surfaceProblem: string;
    identityGap: string;
  };
  canFind20Now: boolean;
}

// Phase 4: Score & Sharpen
export interface Phase4SummaryData {
  scores: {
    pain: number;
    simplicityTest: { passed: boolean; threeWords?: string };
    shareability: number;
    timing: number;
    distributionFit: { passed: boolean; path?: string };
  };
  totalScore: number;
  decision: "proceed" | "sharpen" | "pivot";
  sharpeningPlan?: string[];
  moat?: {
    rating: "strong" | "moderate" | "weak";
    primarySource: string;
    evidence: string;
  };
}

// Phase 5: Discovery Calls
export interface Phase5SummaryData {
  conversationCount: number;
  strongPatterns: string[];   // 7+ people
  moderatePatterns: string[]; // 4-6 people
  surprises: string[];        // Contradicted assumptions
  languageBank: string[];     // Exact phrases
  strugglingMoments: string[];
  readyForValidation: boolean;
}

// Phase 6: Validation Calls
export interface Phase6SummaryData {
  conversationCount: number;
  patternsConfirmed: string[];
  patternsContradicted: string[];
  priceEvidence: {
    pastSpending: string[];
    pricePointsDiscussed: string[];
    offeredToPayNow: number;
  };
  earlyAdopterCount: number;
  decision: "proceed" | "more_calls" | "reframe" | "pivot";
}

// Phase 7: Design Your Offer
export interface Phase7SummaryData {
  offer: {
    timeframe: string;
    singleOutcome: string;
    method: string;
    price: string;
  };
  threeWordTest: { passed: boolean; words?: string };
  shareabilityArtifact?: string;
}

// Phase 8: Sell First
export interface Phase8SummaryData {
  pitchCount: number;
  yesCount: number;
  noCount: number;
  objections: string[];
  learnings: string[];
  committed: Array<{
    description: string;
    commitment: string;
  }>;
}

// Phase 9: Build & Ship
export interface Phase9SummaryData {
  nextThreeActions: string[];
  mvpDefinition: string;
  timeline: string;
  oneMetric: string;
  killCriteria: string;
  alignmentCheck: {
    enjoyServingDaily: boolean;
    usesWantedSkills: boolean;
    sustainableFor2Years: boolean;
    fitsLifeStructure: boolean;
    genuinelyExcited: boolean;
  };
}

// Union type
export type PhaseSummaryData =
  | { type: "phase0"; data: Phase0SummaryData }
  | { type: "phase1"; data: Phase1SummaryData }
  | { type: "phase2"; data: Phase2SummaryData }
  | { type: "phase3"; data: Phase3SummaryData }
  | { type: "phase4"; data: Phase4SummaryData }
  | { type: "phase5"; data: Phase5SummaryData }
  | { type: "phase6"; data: Phase6SummaryData }
  | { type: "phase7"; data: Phase7SummaryData }
  | { type: "phase8"; data: Phase8SummaryData }
  | { type: "phase9"; data: Phase9SummaryData };
```

---

## Success Criteria Answers

### 1. What data model changes are needed for Phase 2?

**Changes needed:**
- Add `status` field to sessions: `"active" | "awaiting_return" | "completed"`
- Add `handoffInfo` object for tracking handoff state
- Add `userContext` to capture distribution channels, build window, etc.
- Replace generic `summaries` with `phaseSummaries` using phase-specific schemas
- Each phase gets a typed summary structure instead of generic arrays

### 2. How should system prompt be structured for each phase?

**Structure:**
```
1. Core identity + ownership rules (~50 lines) - ALWAYS
2. User context (captured) (~30 lines) - ALWAYS
3. Past phase summaries (compressed) (~50-150 lines) - DYNAMIC
4. Current phase instructions (~100-200 lines) - PHASE-SPECIFIC
5. Always-on frameworks (~100 lines) - ALWAYS
```

Total: ~350-550 lines (~3,000-5,000 tokens, ~2% of context)

### 3. What's the handoff pattern for phases where users leave?

**Pattern:**
1. Before departure: Present structured handoff package with context + assignment
2. Set session status to `awaiting_return`
3. Store handoff metadata (phase, time, expected return)
4. On return: Detect via message after `awaiting_return` status
5. Ask about experience, listen first
6. Help sharpen what they brought back
7. Gate progression until they have what's needed

**Handoff phases:** 2 (synthesis), 5 (discovery), 6 (validation), 8 (pre-sell)

### 4. What summarization schema does each phase need?

See **Phase Summary Schemas** section above. Key insight: each phase produces SPECIFIC outputs, not generic "keyFindings." Examples:
- Phase 0: Excavation scores, unfair advantages, intersection zones
- Phase 1: Pain signals with evidence, timing assessment (6 factors)
- Phase 4: Numeric scores for 5 dimensions, moat rating
- Phase 5-6: Conversation patterns, language bank, price evidence

### 5. What research capabilities do we need (or can skip for v1)?

**v1 without MCP is viable.** Approach:
- Claude guides WHAT to research and WHERE to look
- User does actual searching and brings back findings
- Claude helps interpret and synthesize
- Evidence requirement still enforced

**Trade-off:** Slower, less serendipitous discovery, but preserves framework and ownership. User learns the research process.

**v2 enhancement:** Add background research agent.

### 6. How do we preserve the "ownership" feeling through the API?

**Must include in every system prompt:**
- FORBIDDEN/REQUIRED ownership rules
- Redirect patterns ("What do YOU notice?")
- Never generate idea lists
- Discovery language prompts

**Phase 2 is critical:** Claude presents organized context but does NOT suggest ideas. User synthesizes alone (or with partner/other AI) and returns with THEIR idea.

**Measure via:** User language ("I realized" vs "Claude said"), idea defense when challenged, proactive concerns, "how do I" questions.

---

## Open Questions for User Decision

### 1. User Context Capture Timing

**Options:**
- **A: Dedicated onboarding flow** - Before Phase 0, ask distribution/build window questions
- **B: Early Phase 0 integration** - Weave context capture into Phase 0 conversation
- **C: Lazy capture** - Ask when relevant (e.g., distribution channels when needed in Phase 1)

**Recommendation:** Option B - Natural integration into Phase 0's "Know Yourself" theme.

### 2. Handoff Package Delivery

**Options:**
- **A: In-chat summary** - Claude presents the handoff package in the conversation
- **B: Downloadable document** - Generate a PDF/doc user can take offline
- **C: Email summary** - Send structured summary to user's email
- **D: In-app dedicated view** - Show handoff package in a separate UI panel

**Recommendation:** A + D - Present in chat AND show in dedicated UI for easy reference.

### 3. Research Tools Priority

**Options:**
- **A: v1 without any tools** - Pure collaborative research (user searches)
- **B: Add web search only** - Claude can search, no specialized MCP
- **C: Add 2-3 key MCP servers** - Google Trends, Reddit, ProductHunt

**Recommendation:** Start with A for v1, plan B/C for v2. Validates core experience first.

### 4. Phase Numbering

The skill uses Phases 0-9 plus 4.5. Current implementation uses 0-9.

**Options:**
- **A: Keep 0-9** - Moat Check absorbed into Phase 4
- **B: Add 4.5** - Explicit moat check phase
- **C: Renumber** - 0-10 with Moat Check as Phase 5

**Recommendation:** Option A - Keep 0-9, include moat check as part of Phase 4's sharpening process.

### 5. Summary Generation

**Options:**
- **A: Claude self-summarizes** - At phase end, Claude generates summary
- **B: Parallel summarization call** - Background API call to generate summary
- **C: Hybrid** - Claude proposes, user confirms/edits key findings

**Recommendation:** Option C - User confirmation ensures they agree with what's captured (reinforces ownership).

---

## Implementation Priority

Based on Phase 2 chat core work:

### Must Have (Phase 2)
1. Phase-specific system prompt building
2. User context capture and persistence
3. Phase 0 summary schema
4. Basic handoff state tracking
5. Ownership rules in every system prompt

### Should Have (Phase 2-3)
6. Phase 1-4 summary schemas
7. Handoff package UI
8. Context compression for past phases
9. Phase completion detection

### Nice to Have (Phase 3+)
10. Research tool integration
11. Full Phase 5-9 summary schemas
12. Background summarization
13. Email handoff packages

---

*Research completed: 2026-01-29*
