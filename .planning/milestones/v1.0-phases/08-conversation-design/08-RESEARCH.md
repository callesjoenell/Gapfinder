# Phase 8: Conversation Design - Research

**Researched:** 2026-02-17
**Domain:** Conversational AI design, coaching methodology, prompt engineering
**Confidence:** HIGH

## Summary

Phase 8 transforms how Claude converses throughout Gap Finder by implementing research-backed conversation pacing, implicit phase progression, proactive research triggers, and clear journey framing. This is NOT a new feature layer—it's a fundamental reshaping of conversation orchestration using proven coaching techniques and modern Claude API capabilities.

The implementation strategy centers on three technical pillars: (1) System prompt engineering using role-based framing with conversation state injection, (2) Claude's structured outputs for implicit topic coverage extraction, and (3) Real-time conversation analysis for energy detection and research trigger identification.

**Primary recommendation:** Build conversation design as prompt engineering + structured extraction, not complex state machines. Claude's semantic understanding (via structured outputs) eliminates need for brittle rule-based phase progression.

## User Constraints

<user_constraints>
### Locked Decisions (from CONTEXT.md)

#### Journey Framing
- Full roadmap shown upfront when user starts a new session — all phases with brief descriptions so they know the path ahead
- Include time estimates per phase so users can plan their session
- Same voice across exploration and evaluation paths — just different content and framing
- Warm welcome for first session (intro to Gap Finder + roadmap), returning sessions get quick recap + pick up where they left off
- Claude names phases naturally in conversation: "We're in the Research phase now"
- Claude acknowledges when user is juggling multiple sessions: "You're also exploring X in another session"
- Framing adapts based on cross-session experience: "Since you've been through Research before, this will feel familiar"

#### Research Triggers
- Claude asks before researching, never auto-triggers: "Want me to check Reddit/HN for that?"
- Results presented as inline summary woven into conversation naturally
- Claude proactively suggests research angles the user hasn't thought of
- When referencing stored research in later phases: quote key points inline AND point to full findings panel for detail
- Four trigger categories: market claims, competitor mentions, pain point descriptions, assumption signals
- Triggers flagged immediately when detected, not batched or delayed
- Suggest 2-3 research options at a time: "I could check Reddit, HN, or look for competitors — which interests you?"
- Track searched sources — don't re-suggest already-searched queries
- Batch related queries when appropriate: "Let me check Reddit and HN for this"
- Be honest when results are empty + pivot: "I didn't find much — could mean it's a new space. Want to try a different angle?"
- Research available in ALL phases, not just the research phase
- Empty results are handled with honesty, not interpretation

#### Research Intensity Control
- Three levels: low (only major claims), medium (clear claims + competitor mentions), high (every assumption)
- Default: medium for new users
- Setting accessible both conversationally (Claude asks at start of research phase) AND via UI control
- User can change intensity at any time

#### Implicit Scoring & Phase Progression
- Phase completion based on BOTH coverage (breadth of topics) AND depth (meaningful exploration of each)
- Coverage map visible to user in the progress bar — shows sub-topics within current phase
- Progress bar updates in real-time as Claude detects coverage
- Claude gates progression — sufficient depth required before advancing, won't let users rush through
- Phase transitions use "celebrate + bridge" pattern: acknowledge progress, then naturally lead to next phase
- Scores inferred from conversation, then at end of scoring phase user confirms/adjusts (hybrid approach)
- When user disagrees with a score: discuss reasoning, adjust based on new information

#### Dynamic Rescoring (Key Experience)
- When new insights, research findings, or pivots emerge, Claude proactively rescores and presents the new score
- Score changes announced every time, not just significant shifts
- Always explain WHY the score changed: "Your market fit just went from 3 to 5 because finding that underserved audience changes everything"
- Scores can go DOWN as well as up — honest scoring, user needs truth not encouragement
- This back-and-forth rescoring loop is a core experience to preserve and enhance

#### Exploration-Phase Scoring
- Even in exploration phases, Claude scores/evaluates emerging opportunities
- Score not just pain points but also experiences that create big emotional responses — any promising gap
- Highlight strongest opportunities in conversation AND maintain a ranked list user can reference
- Guide user toward the most interesting opportunity through scoring feedback

#### Conversation Pacing
- Research-backed approach required: investigate coaching methodology for conversation design best practices
- Always ride the user's energy — stay on a productive thread, don't interrupt flow for phase progress
- When energy cools (short answers, repetition): summarize what was covered + bridge to next topic
- Response length mirrors user's message length — short answer gets short response, detailed gets detailed
- Question pacing to be determined by coaching methodology research (critical decision deferred to research)

### Claude's Discretion
- Exact wording of phase introductions and transitions
- How to frame the ranked opportunity list in exploration
- Technical implementation of coverage map detection
- Specific coaching methodology patterns to apply (after research provides options)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

## Phase Requirements

<phase_requirements>
| ID | Description | Research Support |
|----|-------------|-----------------|
| CONV-01 | Each path (exploration/evaluation) opens with clear journey framing — what to expect, what "done" looks like | System prompt architecture + session state injection enables path-specific framing at conversation start |
| CONV-02 | Claude proactively triggers research when user mentions claims, markets, competitors, or trends (not just phases 0-2) | Structured outputs extract trigger signals from conversation; research tools integration from Phase 7 provides execution |
| CONV-03 | Phase completion tracked through implicit conversation extraction, not explicit checklist questioning | Structured outputs assess coverage/depth against phase criteria without exposing checklist to user |
| CONV-04 | Conversational pacing prevents question bombardment — follow energy, depth over breadth | NLP pacing/leading techniques + motivational interviewing principles guide response rhythm |
| CONV-05 | Background coverage tracking tells Claude what's been covered vs what's thin, without exposing checklist to user | Coverage map maintained via structured extraction, injected into system prompt as conversation state |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Claude API | Opus 4.6 | Conversation engine | Only API with role prompting + structured outputs + semantic understanding |
| TypeScript | 5.x | Type-safe schemas | Structured output schemas need compile-time validation |
| Zod | Latest | Schema definition | Official Claude SDK integration via `zodOutputFormat` |
| React | 18.x | UI updates | Real-time progress bar, coverage visualization |
| Convex | Latest | Conversation state | Already in use; stores coverage maps, research history |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @anthropic-ai/sdk | Latest | Claude SDK helpers | Structured outputs, Zod integration |
| framer-motion | Latest | Smooth transitions | Phase celebration animations |
| react-markdown | Latest | Research result formatting | Inline summaries with preserved formatting |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Structured outputs | Prompt-only extraction | 90% accuracy vs 99%+; structured outputs guarantee schema compliance |
| Role prompting (system param) | User message framing | 30-50% performance drop without role in system param (per Anthropic docs) |
| Zod schemas | Raw JSON Schema | SDK helpers auto-transform unsupported features; Zod more maintainable |

**Installation:**
```bash
npm install @anthropic-ai/sdk zod
# Other packages already installed from Phase 7
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── systemPrompts.ts           # Existing - expand
│   ├── phaseConfig.ts              # Existing - add coverage criteria
│   ├── conversationState.ts        # NEW - coverage/energy tracking
│   └── schemas/
│       ├── coverageExtraction.ts   # Structured output schemas
│       ├── researchTriggers.ts     # Trigger detection schemas
│       └── scoreUpdates.ts         # Dynamic rescoring schemas
├── components/
│   ├── ProgressBar.tsx             # Existing - add coverage sub-topics
│   └── ResearchPanel.tsx           # Existing - inline summary integration
└── convex/
    ├── conversationState.ts        # NEW - coverage map storage
    └── researchHistory.ts          # NEW - searched sources tracking
```

### Pattern 1: System Prompt State Injection
**What:** Inject conversation state (coverage map, research history, session context) into system prompt for each turn
**When to use:** Every API call; Claude needs current state to make pacing/gating decisions
**Example:**
```typescript
// Source: Anthropic system prompt best practices + SKILL-ADAPTATION-RESEARCH.md
function buildSystemPrompt(context: ConversationContext): string {
  return `You are a research partner helping solo founders discover viable startup opportunities.

## Current Session Context
Path: ${context.path} (${context.path === "exploration" ? "discovering opportunities" : "validating idea"})
Phase: ${context.currentPhase} - ${getPhaseConfig(context.currentPhase).name}
Time in phase: ${formatDuration(context.timeInCurrentPhase)}

## Journey Progress
${buildJourneyFraming(context)}

## Coverage Map for Current Phase
${buildCoverageMap(context.coverageState)}

## Research History (This Session)
${buildResearchHistory(context.searchedSources)}

## Your Conversational Approach
${buildPacingGuidance(context.energyLevel)}

[... rest of system prompt with phase instructions ...]
`;
}

function buildCoverageMap(coverage: CoverageState): string {
  // Example for Phase 0
  const topics = {
    lifeSituation: coverage.lifeSituation || "not explored",
    profession: coverage.profession || "not explored",
    // ... etc
  };

  return `Topics covered:
- Life Situation: ${topics.lifeSituation}
- Profession: ${topics.profession}
[... continue for all phase topics ...]

Coverage level: ${calculateCoveragePercent(coverage)}%
Depth assessment: ${assessDepth(coverage)}`;
}
```

### Pattern 2: Structured Coverage Extraction
**What:** After each assistant response, extract what topics were covered using structured outputs
**When to use:** Post-response processing; updates coverage map for next turn
**Example:**
```typescript
// Source: https://platform.claude.com/docs/en/build-with-claude/structured-outputs
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const Phase0CoverageSchema = z.object({
  topicsExplored: z.array(z.enum([
    "life_situation",
    "profession",
    "hobbies",
    "skills_others_pay_for",
    "networks",
    "transformations"
  ])),
  depthLevel: z.enum(["surface", "moderate", "deep"]),
  energySignals: z.array(z.string()).describe("Specific phrases showing high energy"),
  readyToProgress: z.boolean(),
  reasonIfNotReady: z.string().optional()
});

async function extractCoverage(messages: Message[]): Promise<Coverage> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: "Extract coverage information from this conversation segment.",
    messages: messages,
    output_config: {
      format: zodOutputFormat(Phase0CoverageSchema)
    }
  });

  return JSON.parse(response.content[0].text);
}
```

### Pattern 3: Research Trigger Detection
**What:** Scan user messages for trigger categories; suggest research without auto-executing
**When to use:** Every user message in ALL phases (not just research phase)
**Example:**
```typescript
// Source: Conversation design best practices + trigger extraction research
const TriggerDetectionSchema = z.object({
  triggersDetected: z.array(z.object({
    type: z.enum(["market_claim", "competitor_mention", "pain_point", "assumption"]),
    text: z.string().describe("The specific claim/statement"),
    suggestedResearch: z.array(z.enum(["reddit", "hn", "producthunt", "tavily", "stackoverflow"])),
    priority: z.enum(["high", "medium", "low"])
  })),
  intensityLevel: z.enum(["low", "medium", "high"]).describe("Current research intensity setting")
});

async function detectTriggers(
  userMessage: string,
  intensityLevel: "low" | "medium" | "high"
): Promise<Trigger[]> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 512,
    system: `Detect research triggers in user message. Intensity: ${intensityLevel}

    - LOW: Only explicit claims with no supporting evidence
    - MEDIUM: Claims + competitor mentions + clear pain points
    - HIGH: Everything including implicit assumptions`,
    messages: [{ role: "user", content: userMessage }],
    output_config: { format: zodOutputFormat(TriggerDetectionSchema) }
  });

  const result = JSON.parse(response.content[0].text);
  return result.triggersDetected;
}
```

### Pattern 4: Dynamic Rescoring with Explanation
**What:** When new information emerges, rescore AND generate natural language explanation of WHY
**When to use:** After research results, new insights, or user revelations during exploration/evaluation
**Example:**
```typescript
// Source: User requirement + real-time feedback optimization patterns
const RescoringSchema = z.object({
  opportunityId: z.string(),
  newScore: z.number().min(1).max(10),
  previousScore: z.number().min(1).max(10),
  changed: z.boolean(),
  changeReason: z.string().describe("Natural explanation of why score changed"),
  affectedDimensions: z.array(z.enum(["market_fit", "pain_urgency", "timing", "distribution", "founder_fit"]))
});

async function rescoreWithExplanation(
  conversationContext: string,
  newInformation: string,
  currentScores: Scores
): Promise<RescoringResult> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: `You assess opportunity viability. Rescore based on NEW information only.

    CRITICAL: Scores can go DOWN. Be honest, not encouraging.
    Explain changes clearly: "Your X went from Y to Z because [specific reason]"`,
    messages: [{
      role: "user",
      content: `Context: ${conversationContext}

      Current scores: ${JSON.stringify(currentScores)}

      New information: ${newInformation}

      Rescore if this information changes the assessment.`
    }],
    output_config: { format: zodOutputFormat(RescoringSchema) }
  });

  return JSON.parse(response.content[0].text);
}
```

### Pattern 5: Pacing & Leading (NLP-Inspired)
**What:** Mirror user energy, then guide conversation direction
**When to use:** Continuously; embedded in system prompt as conversational rules
**Example:**
```typescript
// Source: NLP pacing/leading + motivational interviewing research
function buildPacingGuidance(energyLevel: EnergyLevel): string {
  const guidance = {
    high: `User is highly engaged (long responses, questions, excitement).
    - PACE: Match their energy with detailed responses
    - LEAD: Explore depth on current topic; don't switch topics
    - QUESTIONS: 1-2 per response maximum
    - LENGTH: Mirror their message length`,

    moderate: `User is engaged but not energized.
    - PACE: Moderate response length, stay focused
    - LEAD: Gentle topic shifts if current area seems depleted
    - QUESTIONS: 1 open-ended question
    - LENGTH: Slightly shorter than their messages`,

    low: `User showing low energy (short answers, repetition, vague responses).
    - PACE: Brief, focused responses
    - LEAD: Summarize what's covered, bridge to related topic
    - QUESTIONS: One direct question with clear purpose
    - LENGTH: Match brevity; don't overwhelm
    - CONSIDER: "We've covered X. Ready to explore Y, or want to dig deeper here?"`
  };

  return guidance[energyLevel];
}
```

### Pattern 6: Celebrate + Bridge Transitions
**What:** Acknowledge phase completion, celebrate progress, naturally introduce next phase
**When to use:** Phase completion moments; combines closure with forward momentum
**Example:**
```typescript
// Source: Bridges Transition Model + coaching conversation research
const PhaseTransitionSchema = z.object({
  completionAcknowledgment: z.string().describe("Celebrate what was accomplished"),
  keyTakeaways: z.array(z.string()).max(3).describe("Most important discoveries"),
  bridgeToNext: z.string().describe("Natural lead-in to next phase purpose"),
  userReadiness: z.enum(["ready", "needs_recap", "needs_more_time"])
});

async function generateTransition(
  completedPhase: number,
  phaseSummary: PhaseSummary
): Promise<TransitionMessage> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 512,
    system: `Generate a phase transition that:
    1. CELEBRATES progress (specific, not generic praise)
    2. CONNECTS to their personal journey
    3. BRIDGES naturally to next phase purpose (don't lecture about process)`,
    messages: [{
      role: "user",
      content: `Phase ${completedPhase} summary: ${JSON.stringify(phaseSummary)}`
    }],
    output_config: { format: zodOutputFormat(PhaseTransitionSchema) }
  });

  return JSON.parse(response.content[0].text);
}
```

### Anti-Patterns to Avoid
- **Exposing checklists:** Don't say "I need to ask about X, Y, Z" — weave questions naturally following energy
- **Auto-triggering research:** Never search without asking; breaks user agency
- **Question bombardment:** More than 2 questions per response feels like interrogation (coaching research)
- **Generic encouragement:** "Great job!" undermines trust; be specific or stay neutral
- **Rigid topic progression:** If user is energized about topic B, stay there; don't force topic A "completion"
- **Ignoring energy drops:** Short answers = cool energy; summarize + shift, don't persist

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Conversation extraction | Regex/keyword parsing for topic detection | Claude structured outputs | 99%+ accuracy, handles context/nuance; regex misses implicit mentions |
| Energy detection | Sentiment analysis API | Claude semantic analysis via structured outputs | Understands context ("great" can be sarcastic); free with conversation call |
| Schema validation | Manual JSON parsing + validation | Zod + `zodOutputFormat` | SDK auto-transforms unsupported features; compile-time type safety |
| Research trigger rules | If/then trigger conditions | Claude semantic understanding | "I heard X works" vs "Research shows X" — semantic, not keyword-based |
| Phase progression logic | Complex state machine with rules | Claude assessment via structured outputs | Handles edge cases ("covered topic but superficially"); adapts to unique paths |

**Key insight:** Claude's semantic understanding eliminates 90% of traditional NLP/state-machine complexity. Don't build what Claude already does better through prompting + structured outputs.

## Common Pitfalls

### Pitfall 1: Over-Specifying Conversation Flow
**What goes wrong:** Rigid system prompts that script exact question sequences feel robotic and ignore user energy
**Why it happens:** Traditional chatbot thinking — assuming AI needs explicit instructions for every branch
**How to avoid:** Give Claude principles (pacing, energy following, depth over breadth) not scripts
**Warning signs:** Users feel interrogated; conversations feel formulaic; Claude interrupts interesting tangents

### Pitfall 2: Batching State Updates
**What goes wrong:** Updating coverage map only at phase end causes Claude to lose context mid-conversation
**Why it happens:** Trying to optimize API calls by reducing structured output extractions
**How to avoid:** Extract coverage after EVERY assistant response; cost is negligible, context improvement significant
**Warning signs:** Claude asks about topics already covered; progress bar lags behind conversation

### Pitfall 3: Auto-Executing Research
**What goes wrong:** Automatically triggering research when triggers detected removes user agency
**Why it happens:** Trying to be "helpful" by reducing user actions
**How to avoid:** ALWAYS ask before researching: "Want me to check Reddit for that?"
**Warning signs:** Users feel steamrolled; research overwhelms conversation; users stop engaging with research

### Pitfall 4: Low-Confidence Scores as Facts
**What goes wrong:** Presenting early opportunity scores as definitive when data is sparse
**Why it happens:** Dynamic rescoring requirement makes you generate scores before sufficient evidence
**How to avoid:** Include confidence level with every score; "Based on what we know so far (confidence: LOW)"
**Warning signs:** Users anchor on early scores; feel misled when scores change; lose trust in scoring

### Pitfall 5: Generic Celebration Messages
**What goes wrong:** Phase transitions feel hollow when celebration isn't specific to user's journey
**Why it happens:** Template-based transitions instead of generated-from-context
**How to avoid:** Generate transitions via structured output using actual phase summary data
**Warning signs:** Users skip past transition messages; phase changes feel mechanical; no emotional continuity

### Pitfall 6: Ignoring Research Intensity Preference
**What goes wrong:** Suggesting research at wrong frequency for user's preference level
**Why it happens:** Hardcoding trigger thresholds instead of adapting to intensity setting
**How to avoid:** Inject intensity level into trigger detection system prompt; adjust threshold semantically
**Warning signs:** Users ignore research suggestions; explicitly ask to "stop suggesting research"; feel interrupted

### Pitfall 7: Coverage Without Depth Assessment
**What goes wrong:** Progress bar shows 100% but conversation was superficial; user unprepared for next phase
**Why it happens:** Counting topic mentions instead of assessing depth
**How to avoid:** Coverage extraction schema MUST include depth level per topic (surface/moderate/deep)
**Warning signs:** Phase gating fails; users advance without sufficient foundation; struggle in later phases

## Code Examples

Verified patterns from research and official sources:

### System Prompt Role Definition (Most Powerful Technique)
```typescript
// Source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/system-prompts
// "Role prompting is the most powerful way to use system prompts with Claude"

function buildConversationSystemPrompt(context: ConversationContext): string {
  const phaseConfig = getPhaseConfig(context.currentPhase);

  return `You are a skilled research coach helping solo founders discover viable opportunities through a 10-phase process. You operate like an expert executive coach applying evidence-based discovery methods.

## Your Role & Approach

Core principle: The idea must come from THEM. When things get hard, founders abandon ideas that don't feel truly theirs.

FORBIDDEN:
- Never generate idea lists
- Never say "Here are some ideas for you"
- Never finish their sentences about what they want to build
- Never auto-trigger research without asking first

REQUIRED:
- Always ask: "What patterns do YOU notice here?"
- Redirect "What should I build?" to "What problems have YOU struggled with?"
- Follow user energy — if they're energized about a topic, stay there
- Ask before researching: "Want me to check Reddit/HN for that?"

## Current Session

Path: ${context.path === "exploration" ? "Exploring opportunities from your experience" : "Evaluating and sharpening your idea"}
Phase: ${context.currentPhase} - ${phaseConfig.name}
${context.isReturningUser ? `Note: User has been through ${context.completedPhasesCount} phases before in other sessions` : "First time through Gap Finder"}

## Journey Map (What to Expect)

${buildJourneyFraming(context)}

## Coverage Map

${buildCoverageMap(context.coverageState)}

Depth requirement for phase completion: At least 3 topics at "deep" level, all others at "moderate" minimum.

## Conversation Pacing

Current energy level: ${context.energyLevel}
${buildPacingGuidance(context.energyLevel)}

## Research Trigger Sensitivity

Setting: ${context.researchIntensity} (user can change conversationally or via UI)
${buildResearchIntensityGuidance(context.researchIntensity)}

Already searched this session: ${context.searchedSources.join(", ") || "none yet"}
Don't suggest already-searched sources.

## Current Phase: ${phaseConfig.name}

${phaseConfig.instructions}

## Phase Completion

This phase is complete when:
${phaseConfig.completionCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

When ALL criteria met at SUFFICIENT DEPTH, use celebrate + bridge pattern to transition.

## Response Format

- Match user's message length (short -> short, detailed -> detailed)
- Maximum 2 questions per response
- Use reflections more than questions when energy is high
- Weave research suggestions into conversation naturally
- Reference past research inline: "When we checked Reddit earlier, you found X..."`;
}
```

### Coverage Extraction After Each Turn
```typescript
// Source: Structured outputs documentation + conversation state tracking pattern
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const Phase0CoverageSchema = z.object({
  topicsDiscussed: z.object({
    life_situation: z.enum(["not_mentioned", "surface", "moderate", "deep"]),
    profession: z.enum(["not_mentioned", "surface", "moderate", "deep"]),
    hobbies: z.enum(["not_mentioned", "surface", "moderate", "deep"]),
    skills_others_pay_for: z.enum(["not_mentioned", "surface", "moderate", "deep"]),
    networks: z.enum(["not_mentioned", "surface", "moderate", "deep"]),
    transformations: z.enum(["not_mentioned", "surface", "moderate", "deep"])
  }),
  energyPeaks: z.array(z.string()).describe("Specific topics/moments with high energy"),
  currentFocus: z.string().describe("What topic user is most engaged with right now"),
  depthAssessment: z.object({
    topicsAtDeepLevel: z.number(),
    topicsAtModerateLevel: z.number(),
    topicsAtSurfaceLevel: z.number()
  }),
  readyForPhaseCompletion: z.boolean(),
  whatsMissing: z.array(z.string()).optional().describe("Topics needing more depth if not ready")
});

async function extractCoverageState(
  recentMessages: Message[],
  currentCoverage: CoverageState
): Promise<CoverageState> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: `Analyze conversation coverage. Be strict on depth:
    - SURFACE: Topic mentioned, no detail
    - MODERATE: Specific examples provided, some detail
    - DEEP: Multiple examples, emotional language, patterns identified

    Current state: ${JSON.stringify(currentCoverage)}`,
    messages: recentMessages,
    output_config: { format: zodOutputFormat(Phase0CoverageSchema) }
  });

  const extracted = JSON.parse(response.content[0].text);

  // Merge with current state (keep highest depth level)
  return mergeCoverageStates(currentCoverage, extracted);
}
```

### Research Trigger Detection (All Phases)
```typescript
// Source: Trigger detection research + semantic analysis patterns
const TriggerDetectionSchema = z.object({
  triggers: z.array(z.object({
    category: z.enum(["market_claim", "competitor_mention", "pain_point", "assumption"]),
    quote: z.string().describe("Exact text that triggered"),
    suggestedSources: z.array(z.enum(["reddit", "hn", "producthunt", "tavily", "stackoverflow"])).max(3),
    researchAngle: z.string().describe("Specific search/question to investigate"),
    priority: z.enum(["high", "medium", "low"])
  })),
  shouldSuggest: z.boolean().describe("Based on intensity setting, suggest research now?")
});

async function detectResearchTriggers(
  userMessage: string,
  intensitySetting: "low" | "medium" | "high",
  searchedSources: string[]
): Promise<ResearchTrigger[]> {
  const intensityGuidance = {
    low: "Only detect EXPLICIT claims with zero supporting evidence (e.g., 'everyone wants X', 'no one has solved Y')",
    medium: "Detect explicit claims + competitor mentions + clear pain point descriptions",
    high: "Detect everything: claims, competitors, pain points, AND implicit assumptions (e.g., 'users probably', 'I assume')"
  };

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 512,
    system: `Detect research opportunities in user message.

    Intensity: ${intensitySetting}
    ${intensityGuidance[intensitySetting]}

    Already searched: ${searchedSources.join(", ")}
    Don't suggest re-searching these unless user asks.

    Suggest 2-3 sources maximum per trigger (not all 5).`,
    messages: [{ role: "user", content: userMessage }],
    output_config: { format: zodOutputFormat(TriggerDetectionSchema) }
  });

  return JSON.parse(response.content[0].text).triggers;
}

// Usage in conversation flow
async function handleUserMessage(message: string, context: ConversationContext) {
  // 1. Detect triggers before responding
  const triggers = await detectResearchTriggers(
    message,
    context.researchIntensity,
    context.searchedSources
  );

  // 2. If triggers found, weave into response
  if (triggers.length > 0 && triggers[0].priority !== "low") {
    const suggestion = formatResearchSuggestion(triggers[0]);
    // Include in Claude's next response via context injection
    context.pendingResearchSuggestion = suggestion;
  }

  // 3. Continue with normal response generation
  return generateResponse(message, context);
}

function formatResearchSuggestion(trigger: ResearchTrigger): string {
  return `I noticed you mentioned "${trigger.quote}". Want me to ${trigger.researchAngle} on ${trigger.suggestedSources.join(" or ")}?`;
}
```

### Dynamic Rescoring with Explanation
```typescript
// Source: Real-time feedback optimization + user requirement for score change announcements
const OpportunityRescoreSchema = z.object({
  opportunityName: z.string(),
  dimensionScores: z.object({
    market_fit: z.number().min(1).max(10),
    pain_urgency: z.number().min(1).max(10),
    timing: z.number().min(1).max(10),
    distribution: z.number().min(1).max(10),
    founder_fit: z.number().min(1).max(10)
  }),
  changes: z.array(z.object({
    dimension: z.string(),
    oldScore: z.number(),
    newScore: z.number(),
    direction: z.enum(["up", "down", "unchanged"]),
    explanation: z.string().describe("Natural language: why this changed")
  })),
  overallAssessment: z.string().describe("1-2 sentence summary of what this means"),
  confidenceLevel: z.enum(["low", "medium", "high"]).describe("Based on evidence quality")
});

async function rescoreOpportunity(
  opportunityContext: string,
  newInformation: string,
  currentScores: OpportunityScores
): Promise<RescoreResult> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: `You rescore opportunities based on new information.

    CRITICAL RULES:
    - Scores can and SHOULD go down if new info reveals problems
    - Be honest, not encouraging
    - Explain EVERY change with specific reasoning
    - If nothing changes, say so explicitly
    - Include confidence level (low/medium/high) based on evidence quality`,
    messages: [{
      role: "user",
      content: `Opportunity: ${opportunityContext}

      Current scores: ${JSON.stringify(currentScores)}

      New information: ${newInformation}

      Rescore each dimension if this information changes the assessment.`
    }],
    output_config: { format: zodOutputFormat(OpportunityRescoreSchema) }
  });

  const result = JSON.parse(response.content[0].text);

  // Format for presentation
  return {
    ...result,
    announcement: formatScoreChangeAnnouncement(result)
  };
}

function formatScoreChangeAnnouncement(rescore: RescoreResult): string {
  const changes = rescore.changes.filter(c => c.direction !== "unchanged");

  if (changes.length === 0) {
    return ""; // No announcement if nothing changed
  }

  const changeMessages = changes.map(c =>
    `${c.dimension} went from ${c.oldScore} to ${c.newScore} because ${c.explanation}`
  );

  return `📊 Score Update (confidence: ${rescore.confidenceLevel.toUpperCase()})\n\n${changeMessages.join("\n\n")}\n\n${rescore.overallAssessment}`;
}
```

### Celebrate + Bridge Phase Transition
```typescript
// Source: Bridges Transition Model + coaching conversation research
const PhaseTransitionSchema = z.object({
  celebrationMessage: z.string().describe("Acknowledge specific accomplishments, not generic praise"),
  keyDiscoveries: z.array(z.string()).max(3).describe("Most important user insights from this phase"),
  bridgeStatement: z.string().describe("Natural lead-in connecting this phase to next phase purpose"),
  timeEstimate: z.string().describe("How long next phase typically takes"),
  nextPhasePreview: z.string().describe("1-sentence: what they'll do in next phase")
});

async function generatePhaseTransition(
  completedPhase: number,
  summary: PhaseSummary,
  nextPhase: number
): Promise<TransitionMessage> {
  const completedConfig = getPhaseConfig(completedPhase);
  const nextConfig = getPhaseConfig(nextPhase);

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 768,
    system: `Generate phase transition following celebrate + bridge pattern.

    CELEBRATE: Be specific about what THEY discovered (not "great job")
    BRIDGE: Connect naturally — don't lecture about process
    PREVIEW: Make next phase sound interesting, not daunting`,
    messages: [{
      role: "user",
      content: `Completed: ${completedConfig.name}
      Summary: ${JSON.stringify(summary)}

      Next phase: ${nextConfig.name}
      Purpose: ${nextConfig.description}`
    }],
    output_config: { format: zodOutputFormat(PhaseTransitionSchema) }
  });

  return JSON.parse(response.content[0].text);
}

// Usage in conversation
function formatTransitionForUser(transition: TransitionMessage): string {
  return `${transition.celebrationMessage}

**What emerged:**
${transition.keyDiscoveries.map(d => `• ${d}`).join("\n")}

${transition.bridgeStatement}

**Next: ${transition.nextPhasePreview}** (typically ${transition.timeEstimate})

Ready to continue?`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Keyword-based trigger detection | Semantic trigger detection via structured outputs | Claude structured outputs release (Nov 2025) | 40-60% accuracy → 95%+ accuracy |
| Prompt-only extraction (parse LLM text) | Structured outputs with schema validation | Claude structured outputs GA (Nov 2025) | JSON parsing errors eliminated; guaranteed schema compliance |
| Generic system prompts | Role prompting in system parameter | Documented best practice (2025) | 30-50% performance improvement in complex scenarios |
| Template-based transitions | Context-generated transitions | Modern prompting approach | Generic → personalized; users feel seen |
| Rule-based phase progression | Semantic assessment via Claude | Claude's semantic understanding maturity | Handles edge cases; adapts to unique user paths |

**Deprecated/outdated:**
- `output_format` parameter: Moved to `output_config.format` (Jan 2026, still works temporarily)
- Beta headers for structured outputs: No longer required as of GA release
- Manual schema transformation: SDK helpers (`zodOutputFormat`, `transform_schema`) now handle automatically

## Open Questions

1. **Question pacing specifics — how many questions per response?**
   - What we know: Coaching research says "more reflections than questions"; >2 questions feels like interrogation
   - What's unclear: Optimal ratio for async text conversation vs real-time coaching
   - Recommendation: Start with max 2 questions/response; use structured extraction to test if users engage more with 1 vs 2

2. **Coverage map visualization — how granular?**
   - What we know: Must show sub-topics within phase; updates real-time
   - What's unclear: Show depth levels (surface/moderate/deep) or just binary covered/not-covered?
   - Recommendation: Show depth with visual indicator (e.g., filled circles: ○ surface, ◐ moderate, ● deep)

3. **Research intensity default — why medium?**
   - What we know: Three levels exist; medium is default for new users
   - What's unclear: Data supporting medium vs high for new users
   - Recommendation: Default medium, but A/B test with cohorts; measure research acceptance rate

## Sources

### Primary (HIGH confidence)
- [Anthropic System Prompts - Role Definition](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/system-prompts) - System prompt structure, role prompting best practices
- [Claude Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) - JSON outputs, strict tool use, schema design, SDK integration
- [Claude Prompt Engineering Best Practices](https://promptbuilder.cc/blog/claude-prompt-engineering-best-practices-2026) - Modern prompting techniques, what to avoid
- SKILL-ADAPTATION-RESEARCH.md (internal) - System prompt architecture, ownership patterns, phase-specific requirements

### Secondary (MEDIUM confidence)
- [7 Coaching Prompts Based on Conversation Pacing](https://insight7.io/7-coaching-prompts-based-on-conversation-pacing/) - Mirroring energy, pacing techniques
- [10 Frameworks for Transformative Coaching Conversations](https://medium.com/firstleadas/10-frameworks-for-transformative-coaching-conversations-the-fuel-model-9a8bf2a5d4ab) - FUEL model, coaching structures
- [Motivational Interviewing - Coaching Psychology Practice](https://www.researchgate.net/publication/360580134_Motivational_Interviewing_-_a_model_for_coaching_psychology_practice) - Four processes (engaging, focusing, evoking, planning), reflection ratios
- [NLP Pacing and Leading in Coaching](https://spencerinstitute.com/pacing-and-leading-in-coaching-communication/) - Mirroring techniques, "yes and" approach
- [Bridges Transition Model](https://www.prosci.com/blog/bridges-transition-model) - Celebrate + bridge pattern for phase transitions
- [Phenomenological Interviewing](https://journals.sagepub.com/doi/10.1177/1049732313519710) - Committed listening, avoiding imposed categories, user's language

### Tertiary (LOW confidence - general context)
- [AI Systems That Score Conversational Quality in Real-Time](https://insight7.io/6-ai-systems-that-score-conversational-quality-in-real-time/) - Real-time assessment concepts
- [Conversation Intelligence: Depth vs Breadth](https://www.gtmengine.ai/blog/gong-vs-avoma-depth-vs-breadth-in-conversation-intelligence) - Coverage assessment trade-offs
- [Real-Time Streaming with React](https://medium.com/@akshaychame2/the-complete-guide-to-generative-ui-frameworks-in-2026-fde71c4fa8cc) - UI patterns for real-time updates (already implemented in Phase 7)

## Metadata

**Confidence breakdown:**
- System prompt architecture: HIGH - Official Anthropic docs + proven internal implementation
- Structured outputs for extraction: HIGH - Official API feature with documented patterns
- Coaching methodology principles: MEDIUM - Research-backed but not prescriptive for async text
- Coverage detection implementation: MEDIUM - Structured outputs enable it, but optimal schema needs validation
- Research trigger accuracy: MEDIUM-HIGH - Semantic understanding is proven, trigger categorization needs testing

**Research date:** 2026-02-17
**Valid until:** 30 days (stable domain; coaching principles timeless, API stable)

**Critical dependencies:**
- Claude Opus 4.6 availability (currently available)
- Structured outputs feature (GA, stable)
- Existing research tools from Phase 7 (in progress)
- System prompt framework from Phase 2 (complete)
