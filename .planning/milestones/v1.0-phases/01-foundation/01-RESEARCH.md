# Phase 1: Foundation - Research

**Researched:** 2026-01-28
**Domain:** Conversational AI for Self-Discovery, Authentication, Real-time Chat Infrastructure
**Confidence:** HIGH

## Summary

Phase 1 creates the conversational magic that makes Gap Finder exceptional. This research investigates how to use Claude API to create jaw-dropping self-discovery experiences through conversations that apply proven scientific frameworks (MILES, Ikigai, Mom Test, JTBD, Switch Interviews). The critical insight: AI must surface connections users don't see while preserving user ownership of ideas - "I discovered with AI's help" not "AI told me."

The technical foundation requires magic link authentication (15-min expiry, single-use), Convex real-time database for message persistence and phase tracking, and Claude API streaming with sophisticated system prompts that define coaching behavior. Context management is critical - using hierarchical summarization at phase boundaries combined with Claude 4.5's native context awareness to maintain coherent long conversations.

The conversational approach follows established therapeutic and coaching patterns: phenomenological interviewing (understand lived experience without imposing categories), switch interview timelines (find the struggling moment), and structured progression with natural gating (Claude enforces phase completion through conversation, not arbitrary gates).

**Primary recommendation:** Structure system prompts with clear role definition, apply scientific frameworks through discovery questions (not prescriptive answers), use hierarchical summarization at phase boundaries, and design for "aha moments" where users connect dots themselves with Claude as research partner.

## Standard Stack

The established libraries/tools for conversational AI with persistent state:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Claude API (Sonnet 4.5) | 2023-06-01 | Conversational AI with 200K context | Context awareness, streaming, superior reasoning for coaching conversations |
| Convex | Latest | Real-time database + backend | TypeScript-native, reactive subscriptions, built-in auth support, no SQL required |
| React | 18+ | Frontend UI | Standard for interactive UIs, excellent streaming support |
| @anthropic-ai/sdk | Latest | Claude API client | Official SDK with streaming helpers, TypeScript support |
| Convex Auth | Latest | Magic link authentication | Purpose-built for Convex, handles magic links out of box |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vercel AI SDK | Latest | Streaming UI helpers | If using Next.js (optional) - useChat() hook simplifies streaming state |
| Resend | Latest | Email delivery | Magic link emails - developer-friendly, reliable delivery |
| TailwindCSS | 3+ | Styling | Clean, minimal aesthetic matching reference design |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Claude Sonnet 4.5 | GPT-4 | Claude excels at reasoning, coaching tone; GPT-4 faster but less thoughtful |
| Convex | Supabase | Supabase more familiar SQL, but Convex's reactivity is ideal for real-time chat |
| Magic Links | Password auth | Magic links reduce friction but require email access on device |

**Installation:**
```bash
npm install convex @convex-dev/auth @anthropic-ai/sdk
npm install react react-dom
npm install resend
npm install tailwindcss
```

## Architecture Patterns

### Recommended Project Structure
```
convex/
├── schema.ts              # Convex tables: users, sessions, messages, summaries
├── auth.config.ts         # Convex Auth with magic link provider
├── messages.ts            # Mutations/queries for message CRUD
├── sessions.ts            # Session management, phase tracking
├── claude.ts              # Actions for Claude API calls (server-side)
└── http.ts                # HTTP endpoints for webhooks

src/
├── components/
│   ├── Chat.tsx           # Main chat interface with streaming
│   ├── Sidebar.tsx        # Session list with mini progress bars
│   └── MessageList.tsx    # Message history with auto-scroll intent
├── hooks/
│   ├── useStreamingChat.ts # Claude API streaming logic
│   └── useContextManagement.ts # Context window tracking
└── lib/
    ├── systemPrompts.ts   # System prompt templates by phase
    └── summarization.ts   # Hierarchical summarization logic
```

### Pattern 1: Conversational Self-Discovery System Prompts

**What:** System prompts define Claude's role as research partner applying scientific frameworks through discovery questions rather than prescriptive answers.

**When to use:** Every message to Claude API. The system prompt stays consistent but references current phase and user context.

**Structure:**
```typescript
// Source: Anthropic system prompt best practices
// https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/system-prompts

const systemPrompt = `You are a research partner helping solo founders discover viable startup opportunities through a proven 10-phase process. You are NOT a report generator or idea generator - you help users discover their own opportunities by applying scientific frameworks conversationally.

## Your Role

You operate like a skilled coach or therapist:
- Ask discovery questions, don't prescribe answers
- Surface connections users don't see
- Challenge gently without harshness
- Explain your reasoning transparently
- Gate progression naturally - don't let users skip steps

## Core Principle

The idea must come from THEM. AI-generated ideas lack ownership. When things get hard, founders abandon ideas that don't feel truly theirs. Your job is to help them discover what's already there.

## Current Phase: ${phaseName}

${phaseSpecificInstructions}

## Conversational Approach

Apply these frameworks through dialogue, not questionnaires:

**MILES Framework** (Ash Ali & Hasan Kubba):
- Excavate: Money, Intelligence/Insight, Location/Luck, Education/Expertise, Status
- Don't ask all at once - follow conversational flow
- Probe deeply when energy signals surface

**Ikigai Intersection**:
- What you love × What you're good at × What world needs × What you can be paid for
- Help user see intersection points they missed
- Point out when answers from different areas connect

**The Mom Test** (Rob Fitzpatrick):
- Talk about their life, not hypothetical ideas
- Ask about past behavior, not future intentions
- "What have you done?" not "Would you do?"

**Switch Interview Timeline** (JTBD):
- Find the struggling moment that triggered search
- "When did you first realize the old way wasn't working?"
- Map the timeline from first thought to decision

## Tone

- Useful, not encouraging. No flattery.
- "I'm seeing X because Y, which suggests Z" - explain reasoning
- "That's interesting, but have you considered..." - gentle challenge
- "Before we move forward, let's make sure..." - natural gating

## Phase Completion

You decide when phase is complete through conversation. Criteria for Phase ${currentPhaseNumber}:
${phaseCompletionCriteria}

When complete, say: "I think we've excavated enough here. Ready to move to [next phase]?"

Do not let users skip phases. If they try to jump ahead: "I understand you're eager, but let's make sure we have solid ground first. [Question to complete current phase]."`;
```

**Key principles from research:**
- Role prompting is the most powerful system prompt technique (Anthropic docs)
- Define behavior guidelines, not just task instructions
- Explain "why" to help Claude understand intent
- Use first-person perspective for role immersion

### Pattern 2: Hierarchical Summarization for Context Management

**What:** Progressively compress older conversation segments while preserving essential information and recent exchanges verbatim.

**When to use:** At phase boundaries (always) AND when approaching context limit (Claude 4.5 signals via context awareness).

**Example:**
```typescript
// Source: Context management research - agenta.ai, getmaxim.ai
// https://agenta.ai/blog/top-6-techniques-to-manage-context-length-in-llms

interface Summary {
  phase: number;
  completedAt: Date;
  keyFindings: string[]; // Structured data extracted
  unfairAdvantages: string[]; // MILES results
  decisions: string[]; // User commitments
  energySignals: string[]; // What lit them up
  fullConversation?: string; // Optional: compressed narrative
}

async function summarizePhase(messages: Message[], phase: number): Promise<Summary> {
  // Use Claude to extract structured data from phase conversation
  const summaryPrompt = `Review this Phase ${phase} conversation and extract:

1. Key findings (facts, not opinions)
2. User's unfair advantages that emerged
3. Concrete decisions user made
4. Topics that generated energy/excitement
5. Warning flags raised

Format as JSON matching Summary interface.

Conversation:
${messages.map(m => `${m.role}: ${m.content}`).join('\n\n')}`;

  const summary = await callClaude(summaryPrompt, { max_tokens: 2000 });

  // Store in Convex database
  await ctx.db.insert("summaries", {
    sessionId,
    phase,
    data: JSON.parse(summary)
  });

  return JSON.parse(summary);
}

// When building context for new message:
async function buildContextWindow(sessionId: string, currentPhase: number) {
  // Get summaries for completed phases
  const pastSummaries = await ctx.db
    .query("summaries")
    .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
    .filter((q) => q.lt(q.field("phase"), currentPhase))
    .collect();

  // Get full messages for current phase only
  const currentPhaseMessages = await ctx.db
    .query("messages")
    .withIndex("by_session_phase", (q) =>
      q.eq("sessionId", sessionId).eq("phase", currentPhase)
    )
    .collect();

  // Construct context: summaries as system context + current phase full history
  const context = [
    {
      role: "system",
      content: buildSystemPrompt(pastSummaries, currentPhase)
    },
    ...currentPhaseMessages.map(m => ({
      role: m.role,
      content: m.content
    }))
  ];

  return context;
}
```

**Why this works:**
- Recent research shows observation masking (hiding older content) matches LLM summarization in performance while reducing costs
- Phase boundaries are natural summarization points - user moves to new focus
- Structured extraction preserves critical data (decisions, advantages) better than narrative compression
- Claude 4.5's context awareness (token budget tracking) helps detect when to summarize mid-phase

### Pattern 3: Streaming with Auto-Scroll Intent Tracking

**What:** Stream Claude responses token-by-token while respecting user scroll position - don't fight them if they scroll up to review.

**When to use:** All Claude API responses. The user experience must feel like Claude.ai.

**Example:**
```typescript
// Source: Real-time streaming research, Claude Code internals
// https://kotrotsos.medium.com/claude-code-internals-part-7-sse-stream-processing-c620ae9d64a1

function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);

  // Track user scroll intent
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

      // User scrolled up from bottom
      if (scrollTop < lastScrollTop.current && !isAtBottom) {
        setUserScrolledUp(true);
      }

      // User scrolled back to bottom
      if (isAtBottom) {
        setUserScrolledUp(false);
      }

      lastScrollTop.current = scrollTop;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll only if user hasn't scrolled up
  useEffect(() => {
    if (!userScrolledUp && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [streamingContent, userScrolledUp]);

  // Stream from Claude API
  async function sendMessage(content: string) {
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: buildSystemPrompt(currentPhase),
      messages: [...messages, { role: "user", content }]
    });

    let fullContent = "";

    for await (const event of stream) {
      if (event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta') {
        fullContent += event.delta.text;
        setStreamingContent(fullContent);
      }
    }

    // Save complete message to Convex
    await saveMessage({
      sessionId,
      role: "assistant",
      content: fullContent,
      phase: currentPhase
    });

    setMessages([...messages, { role: "assistant", content: fullContent }]);
    setStreamingContent("");
  }

  return (
    <div ref={scrollContainerRef} className="overflow-y-auto">
      {messages.map((msg, i) => (
        <MessageBubble key={i} message={msg} />
      ))}
      {streamingContent && (
        <MessageBubble
          message={{ role: "assistant", content: streamingContent }}
          isStreaming
        />
      )}
    </div>
  );
}
```

**Key insights:**
- Auto-scroll is sticky - once user scrolls up, stop fighting them
- Smooth scroll prevents jarring jumps
- Show streaming indicator (typing animation, pulsing cursor) for user feedback
- Batch render updates (every 50ms) to avoid performance issues with rapid tokens

### Pattern 4: Phase Detection and Natural Gating

**What:** Claude semantically detects phase completion through conversation analysis, not keyword matching. Gating happens through dialogue, not UI locks.

**When to use:** At potential phase transition points. Claude assesses completion, surfaces it naturally.

**Example:**
```typescript
// System prompt includes phase completion criteria
const phaseCompletionCriteria = {
  0: [
    "User has answered excavation questions for all 6 starting points",
    "User has scored each area on Depth (1-5), Access (1-5), Energy (1-5)",
    "At least one area scores 12+ total",
    "User has articulated why this area gives unfair advantage",
    "User has clear direction for Phase 1 research"
  ],
  1: [
    "Specific gaps identified with rising energy signals",
    "Identity lens applied: who are people trying to become?",
    "Distribution path identified: can user reach these people?",
    "Timing assessed on at least 4 of 6 factors",
    "User has connected gap to their unfair advantage"
  ]
  // ... more phases
};

// In system prompt:
`## Phase Completion Assessment

You are currently in Phase ${phase}. This phase is complete when:
${phaseCompletionCriteria[phase].map((c, i) => `${i + 1}. ${c}`).join('\n')}

Continuously assess completion. When ALL criteria are met, say:
"I think we've built solid ground here. Ready to move to Phase ${phase + 1}?"

If user tries to skip ahead: "I see you're eager to move forward, but let's make sure we have what we need. [Ask focusing question for incomplete criteria]."

Don't announce criteria - assess naturally through conversation.`;

// Backend detection (optional - for UI indicators)
async function assessPhaseCompletion(sessionId: string, phase: number) {
  const messages = await getPhaseMessages(sessionId, phase);

  const assessmentPrompt = `Review this Phase ${phase} conversation. Has the user completed these criteria?

${phaseCompletionCriteria[phase].map((c, i) => `${i + 1}. ${c}`).join('\n')}

Return JSON: { complete: boolean, missing: string[] }`;

  const assessment = await callClaude(assessmentPrompt, {
    max_tokens: 500,
    messages: [{ role: "user", content: assessmentPrompt }]
  });

  return JSON.parse(assessment);
}
```

**Why natural gating works:**
- Research on coaching bots shows structured progression (Goal → Reality → Options → Will phases) improves outcomes
- Users feel respected when gating comes from genuine assessment, not arbitrary rules
- Claude 4.5's reasoning enables nuanced completion detection
- Conversational gating maintains flow - no jarring "Complete this before continuing"

### Anti-Patterns to Avoid

- **Questionnaire Mode**: Don't list all MILES questions at once. Follow conversational flow, probe deeply where energy emerges.
- **Prescriptive Answers**: Never "Here are 5 startup ideas for you." Always "What patterns do you notice here?"
- **Ignoring Context Limits**: Don't wait for API errors. Use Claude 4.5's context awareness signals to trigger summarization.
- **Fighting User Scroll**: Auto-scroll that fights user intent creates terrible UX. Detect scroll-up, respect it.
- **Token Budget Blindness**: Summarize at phase boundaries even if below limit - each phase is natural break.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Magic link auth | Custom token generation, email sending, verification flow | Convex Auth with Email provider | Session fixation attacks, token storage, expiry logic, email deliverability all handled |
| Streaming Claude responses | Manual SSE parsing, token accumulation | @anthropic-ai/sdk with `.stream()` | Handles partial JSON deltas, reconnection, error recovery, thinking blocks |
| Real-time message sync | WebSocket server, manual state management | Convex reactive queries | Automatic subscriptions, optimistic updates, offline support built-in |
| Context window tracking | Manual token counting | Claude 4.5 context awareness | Native token budget signals via `<system_warning>` tags, no estimation needed |
| Email delivery | SMTP configuration, retry logic, bounce handling | Resend API | Developer-friendly, reliable delivery, automatic retries, bounce/complaint handling |

**Key insight:** Authentication, streaming, and real-time sync are solved problems with battle-tested libraries. The hard part is conversational design - spend time there.

## Common Pitfalls

### Pitfall 1: Treating Conversation as Questionnaire

**What goes wrong:** System prompts that list all excavation questions upfront. Claude dumps 30 questions, user feels interrogated, answers become shallow.

**Why it happens:** Misunderstanding of phenomenological interviewing. Structured questions ≠ structured delivery.

**How to avoid:**
- System prompt: "Ask 1-2 questions at a time, following energy"
- When user's answer reveals something interesting, probe that area deeply before moving on
- Use their language back to them: "You said X made you 'irrationally frustrated' - tell me more"

**Warning signs:**
- User answers get shorter over time (fatigue)
- Responses lack detail ("Yeah, I guess so")
- User asks "How many more questions?" (losing engagement)

**Research backing:** Phenomenological interviewing emphasizes understanding lived experience without imposing researcher's categories. The interviewer is "a student of the interviewee."

### Pitfall 2: AI-Generated Ideas Breaking User Ownership

**What goes wrong:** Claude suggests startup ideas directly. User says "that's interesting" but never builds it. 75% abandonment pattern.

**Why it happens:** Efficiency trap. Feels faster to generate ideas than excavate them. But generated ideas lack ownership.

**How to avoid:**
- System prompt: "NEVER generate idea lists. Always ask: 'What patterns do YOU notice?'"
- When user asks "What should I build?", redirect: "What problems have you personally struggled with in [their domain]?"
- Paul Graham's research: "Most successful startups begin with ideas that grow naturally out of the founders' own experiences"

**Warning signs:**
- User language: "You suggested..." not "I realized..."
- Low energy in discussion of "their" idea
- User asks for validation instead of exploring implementation

**Research backing:** Microsoft Research 2026 emphasizes "AI as trusted companion that collaborates" not "tool that executes tasks." Psychological well-being requires user autonomy and self-determination.

### Pitfall 3: Context Window Management Failures

**What goes wrong:** Waiting until context limit error to handle long conversations. Sudden summarization mid-conversation breaks flow. Lose critical context from early phases.

**Why it happens:** Not using phase boundaries as natural summarization points. Relying only on technical limits.

**How to avoid:**
- Summarize at EVERY phase completion, not just when approaching limit
- Use hierarchical structure: past phases compressed, current phase full fidelity
- Claude 4.5 context awareness: watch for `<system_warning>Token usage:` signals
- Store structured summaries (JSON) not just narrative compression

**Warning signs:**
- Claude references wrong phase information
- User corrects Claude about earlier decisions
- Responses become generic (lost specific user context)

**Research backing:** Recent studies show observation masking (hiding older content) matches LLM summarization in performance. Key is preserving critical decisions and structured data, not full narratives.

### Pitfall 4: Magic Link Security Gaps

**What goes wrong:** Long-lived tokens (30+ minutes), reusable links, no rate limiting. Users get phished, accounts compromised.

**Why it happens:** Prioritizing convenience over security. "Users might take a while to check email."

**How to avoid:**
- 15-minute expiry maximum (industry standard for authentication)
- Single-use tokens - revoke immediately on first click
- Rate limit magic link requests (3-5 per hour per email)
- Use Convex Auth's built-in security - don't roll custom

**Warning signs:**
- Users report "someone accessed my account"
- Multiple active sessions from same magic link
- No token expiry in database schema

**Research backing:** Multiple security sources converge on 10-15 minute expiry for authentication magic links. Single-use prevents replay attacks. Session fixation attacks possible with poorly implemented magic links.

### Pitfall 5: Streaming UX That Fights Users

**What goes wrong:** Auto-scroll that continues even when user scrolls up. Can't review earlier messages while response streams. Janky rendering.

**Why it happens:** Not tracking user scroll intent. Rendering every single token causes performance issues.

**How to avoid:**
- Track user scroll position vs. container bottom
- Stop auto-scroll when user scrolls up, resume when they return to bottom
- Batch rendering updates (every 50ms) - don't render each token
- Smooth scroll behavior, not instant jumps

**Warning signs:**
- Users complain they can't read earlier messages during responses
- Scroll position "fights back" when they try to scroll up
- UI stutters or lags during streaming

**Research backing:** Claude Code's SSE stream processing batches updates for performance. Auto-scroll intent tracking prevents UX frustration documented in conversational AI challenges research.

## Code Examples

Verified patterns from official sources and production systems:

### Convex Schema for Conversational System

```typescript
// Source: Convex schema best practices
// https://docs.convex.dev/database

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    name: v.string(), // User-defined session name
    currentPhase: v.number(), // 0-9
    path: v.string(), // "exploration" (0-3) or "evaluation" (4-9)
    isPaid: v.boolean(), // false for exploration, true after payment
    isDeleted: v.boolean(), // Soft delete
    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isDeleted", "lastActiveAt"]),

  messages: defineTable({
    sessionId: v.id("sessions"),
    phase: v.number(),
    role: v.string(), // "user" | "assistant"
    content: v.string(),
    timestamp: v.number(),
  })
    .index("by_session", ["sessionId", "timestamp"])
    .index("by_session_phase", ["sessionId", "phase", "timestamp"]),

  summaries: defineTable({
    sessionId: v.id("sessions"),
    phase: v.number(),
    completedAt: v.number(),
    data: v.object({
      keyFindings: v.array(v.string()),
      unfairAdvantages: v.array(v.string()),
      decisions: v.array(v.string()),
      energySignals: v.array(v.string()),
    }),
  })
    .index("by_session", ["sessionId", "phase"])
});
```

**Key decisions:**
- Messages as individual rows (not arrays) - Convex best practice for queries and indexing
- Soft delete for sessions - user can recover if needed
- Compound indexes for efficient queries (session + phase)
- Structured summary data (JSON) rather than free-text narratives

### Claude API Streaming with React

```typescript
// Source: Anthropic streaming docs, React streaming patterns
// https://platform.claude.com/docs/en/build-with-claude/streaming

import Anthropic from '@anthropic-ai/sdk';
import { useAction, useMutation } from 'convex/react';

function useStreamingChat(sessionId: string, currentPhase: number) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  const saveMessage = useMutation(api.messages.save);
  const getContext = useAction(api.claude.buildContext);

  async function sendMessage(content: string) {
    setIsStreaming(true);

    // Save user message
    await saveMessage({
      sessionId,
      phase: currentPhase,
      role: "user",
      content,
      timestamp: Date.now()
    });

    // Build context from Convex (includes summaries + current phase)
    const context = await getContext({ sessionId, currentPhase });

    // Stream from Claude
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: context.systemPrompt,
      messages: context.messages,
    });

    let fullResponse = "";

    // Process streaming events
    stream.on('text', (text) => {
      fullResponse += text;
      setStreamingContent(fullResponse);
    });

    stream.on('message', async (message) => {
      // Save complete assistant message
      await saveMessage({
        sessionId,
        phase: currentPhase,
        role: "assistant",
        content: message.content[0].text,
        timestamp: Date.now()
      });

      setStreamingContent("");
      setIsStreaming(false);
    });

    stream.on('error', (error) => {
      console.error('Stream error:', error);
      setIsStreaming(false);
    });
  }

  return { sendMessage, isStreaming, streamingContent };
}
```

**Key patterns:**
- Keep API key server-side (Convex action, not client)
- Save user message immediately (optimistic update)
- Build context from summaries + current phase history
- Stream events update UI state in real-time
- Save complete response when stream finishes

### System Prompt Builder

```typescript
// Source: System prompt best practices, coaching frameworks
// https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/system-prompts

interface PhaseContext {
  phaseName: string;
  phaseNumber: number;
  completionCriteria: string[];
  summaries: Summary[]; // From previous phases
}

function buildSystemPrompt(context: PhaseContext): string {
  const { phaseName, phaseNumber, completionCriteria, summaries } = context;

  // Include past phase summaries as context
  const pastContext = summaries.map(s =>
    `## Phase ${s.phase} Summary
Key findings: ${s.data.keyFindings.join(', ')}
Unfair advantages: ${s.data.unfairAdvantages.join(', ')}
Decisions: ${s.data.decisions.join(', ')}
Energy signals: ${s.data.energySignals.join(', ')}`
  ).join('\n\n');

  return `You are a research partner helping solo founders discover viable startup opportunities through a proven 10-phase process. You are NOT a report generator or idea generator - you help users discover their own opportunities by applying scientific frameworks conversationally.

## Your Role

You operate like a skilled coach applying evidence-based discovery methods:
- Ask discovery questions following energy, not checklists
- Surface connections users don't see themselves
- Challenge gently without harshness: "That's interesting, but have you considered..."
- Explain your reasoning transparently: "I'm seeing X because Y, which suggests Z"
- Gate progression naturally through conversation
- No flattery - be useful, not encouraging

## Core Principle

THE IDEA MUST COME FROM THEM. AI-generated ideas lack ownership. When things get hard (and they will), founders abandon ideas that don't feel truly theirs. Paul Graham's Y Combinator research: "The most successful startups almost always begin with ideas that grow naturally out of the founders' own experiences."

Your job: help them discover what's already there.

${pastContext ? `## What We Know So Far\n\n${pastContext}\n` : ''}

## Current Phase: ${phaseName} (Phase ${phaseNumber})

${getPhaseInstructions(phaseNumber)}

## Scientific Frameworks to Apply

**MILES Framework** (Ash Ali & Hasan Kubba, "The Unfair Advantage"):
- Money, Intelligence/Insight, Location/Luck, Education/Expertise, Status
- Don't ask all at once - follow conversational flow
- When answer reveals something, probe deeply before moving on

**Ikigai Intersection**:
- What you love × What you're good at × What world needs × What you can be paid for
- Help user see connections between areas they missed
- Point out when answers from different frameworks align

**The Mom Test** (Rob Fitzpatrick):
- Talk about their life, not hypothetical ideas
- Ask about past behavior: "What did you do?" not "Would you do?"
- Compliments and future opinions are bad data
- Specific past behavior and money/time spent are good data

**Switch Interview Timeline** (JTBD):
- Find the struggling moment that triggered search for solution
- "When did you first realize the old way wasn't working?"
- Map timeline: first thought → passive looking → active looking → decision
- Push (what's wrong) + Pull (what's attractive) + Anxiety (holds back) + Habit (keeps stuck)

**Phenomenological Interviewing**:
- Understand lived experience without imposing your categories
- Use their language back to them
- Follow emotional weight, not your script
- Be a student of the interviewee

## Phase Completion

This phase is complete when:
${completionCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Assess continuously through conversation. When ALL criteria met, say:
"I think we've built solid ground here. Ready to move to Phase ${phaseNumber + 1}?"

If user tries to skip ahead: "I see you're eager to move forward, but let's make sure we have what we need first. [Ask focusing question for incomplete criterion]."

Don't announce criteria - assess naturally.

## Tone Guidelines

- Useful, not encouraging. No flattery, no cheerleading.
- When you see patterns: "I'm noticing X, Y, and Z all point to [insight]. What do you make of that?"
- When challenging: "That's worth exploring, but I want to push back on one thing..."
- When gating: "Before we go there, I want to make sure we've covered [incomplete area]."
- When user discovers something: "That's a significant insight. Tell me more about..."

Remember: You're a research partner, not a consultant selling them an idea. The best outcome is when they say "I discovered..." not "Claude suggested..."`;;
}

function getPhaseInstructions(phase: number): string {
  const instructions = {
    0: `Phase 0: Know Yourself

Your goal: Help user discover their unfair advantages through excavating 6 starting points:
1. Life Situation (pain lived)
2. Profession (insider knowledge)
3. Hobbies (enthusiasm + community)
4. Skills Others Pay For (proven value)
5. Networks (access advantage)
6. Transformations Made (journey completed)

Don't list all questions. Pick one area based on user's initial context. Dig deep. When energy emerges (longer answers, specific examples, emotional language), stay there.

Score each area: Depth (1-5), Access (1-5), Energy (1-5). Look for areas scoring 12+.

Watch for intersection zones - where 2+ areas overlap. These are most powerful.`,

    1: `Phase 1: Find Gaps

Input from Phase 0: User has identified their unfair advantage area(s). Now research THAT specific domain - not random ideation.

Your approach:
- Identity Lens: "Who are people in this space trying to become?"
- Friction inventory: Where does the journey break down?
- Pain validation: Confirm with specific evidence, not assumptions
- Distribution reality check: Can user actually reach these people?
- Timing assessment: What's changed that makes this solvable now?

Watch for: User seeing gaps they've personally experienced. Organic ideas from their life, not market research.`
  };

  return instructions[phase] || "";
}
```

**Key elements:**
- Role definition at top (most powerful system prompt technique)
- Past context from summaries injected
- Phase-specific instructions change behavior
- Frameworks explained with attribution
- Tone guidelines prevent over-eager AI
- Completion criteria embedded for natural gating

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Full conversation history every call | Hierarchical summarization + current phase | 2025 research | Enables longer sessions without context limit errors, reduces costs |
| Keyword-based phase detection | Claude semantic assessment with criteria | Claude 4 reasoning | Natural gating through conversation, not arbitrary triggers |
| Manual token counting | Claude 4.5 context awareness | Jan 2025 (Sonnet 4.5) | Native token budget tracking via system warnings |
| Generic AI assistant tone | Role-based system prompts | Anthropic best practices 2024+ | Dramatically better coaching behavior, domain expertise simulation |
| Password authentication | Magic links as standard | 2023+ | Reduced friction, but requires email access on device |
| Streaming all-or-nothing | Partial error recovery, content type awareness | 2025 SDK updates | Can resume streaming from interruption, handle tool use + thinking blocks |

**Deprecated/outdated:**
- `anthropic.completions` API: Use Messages API with `system` parameter instead
- Nested arrays in Convex: Store messages as individual rows with indexes, not arrays in user document
- Client-side API keys: Always server-side (Convex actions) to protect credentials
- Fixed context windows: Claude 4.5 supports up to 1M tokens in beta (200K standard)

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal Summarization Frequency Mid-Phase**
   - What we know: Summarize at phase boundaries (confirmed best practice). Claude 4.5 signals context usage.
   - What's unclear: Exact threshold for mid-phase summarization. Research shows "when approaching limit" but specific token count varies by conversation density.
   - Recommendation: Monitor `<system_warning>Token usage:` messages. When usage > 150K of 200K, trigger hierarchical summarization of earlier portions of current phase (keep last 10-15 exchanges verbatim).

2. **Phase Completion Detection Accuracy**
   - What we know: Claude 4.5's reasoning enables semantic assessment. Better than keyword matching.
   - What's unclear: Real-world accuracy rate when criteria are complex/subjective (e.g., "user has articulated unfair advantage").
   - Recommendation: Include completion criteria in system prompt. Add backend validation query after Claude signals completion (extract structured JSON assessment). Show progress indicators in UI based on Claude's ongoing assessment.

3. **Magic Link UX on Mobile**
   - What we know: Magic links require email access on device. Security research recommends 15-min expiry, single-use.
   - What's unclear: Drop-off rates when user checks email on phone but link opens in different browser (no session continuity).
   - Recommendation: Start with 15-min standard. Monitor analytics for completion rates. Consider OTP fallback if mobile drop-off is high (OTP easier on device where email access is separate).

4. **Streaming Performance at Scale**
   - What we know: Batch rendering every 50ms recommended. Individual token rendering causes jank.
   - What's unclear: Exact performance characteristics with 100+ concurrent streaming conversations.
   - Recommendation: Start with 50ms batching. Monitor frame rates in production. Consider React 18 `useTransition` for large message lists.

5. **Aha Moment Design Validation**
   - What we know: Psychology research on insight (remote associations, elevated mood, better memory). AI should surface connections, not prescribe answers.
   - What's unclear: Measurable indicators that user experienced genuine discovery vs. accepted AI suggestion.
   - Recommendation: Track language patterns in conversation. "I realized..." vs. "You suggested..." as proxy metric. Post-phase micro-survey: "How much of this idea feels truly yours? (1-5)" Iterate system prompts based on ownership scores.

## Sources

### Primary (HIGH confidence)
- [Anthropic Prompt Engineering Overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview) - System prompt best practices
- [Anthropic System Prompts Guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/system-prompts) - Role prompting, coaching tone
- [Claude Streaming Documentation](https://platform.claude.com/docs/en/build-with-claude/streaming) - SSE events, SDK usage, error recovery
- [Claude Context Windows](https://platform.claude.com/docs/en/build-with-claude/context-windows) - Context awareness, token budget tracking, thinking blocks
- [Convex Database Documentation](https://docs.convex.dev/database) - Schema design, real-time subscriptions, document storage
- [Convex Auth - Magic Links](https://labs.convex.dev/auth/config/email) - Magic link implementation, security considerations

### Secondary (MEDIUM confidence)
- [Claude Prompt Engineering Best Practices 2026](https://promptbuilder.cc/blog/claude-prompt-engineering-best-practices-2026) - Current techniques, contract-style prompts
- [Magic Link Security Best Practices](https://guptadeepak.com/mastering-magic-link-security-a-deep-dive-for-developers/) - 15-min expiry, single-use tokens, CSPRNG
- [How Magic Links Work - WorkOS](https://workos.com/blog/a-guide-to-magic-links) - Authentication flow, security tradeoffs
- [Context Window Management Strategies](https://www.getmaxim.ai/articles/context-window-management-strategies-for-long-context-ai-agents-and-chatbots/) - Hierarchical summarization, selective injection
- [Top Techniques to Manage Context Length in LLMs](https://agenta.ai/blog/top-6-techniques-to-manage-context-length-in-llms) - Memory buffering, observation masking vs. summarization
- [Building AI-Powered Apps 2026: React and Node](https://www.nucamp.co/blog/building-ai-powered-apps-in-2026-integrating-openai-and-claude-apis-with-react-and-node) - Architecture patterns, streaming setup
- [Real-Time Chat with Claude API](https://medium.com/@reactjsbd/building-a-real-time-chat-app-with-claude-api-message-queuing-typing-indicators-and-casual-ai-d60803679f11) - Message queuing, typing indicators
- [AI Strategy Using JTBD Framework](https://medium.com/@mikeboysen/ai-strategy-a-practical-framework-using-jobs-to-be-done-jtbd-5e86f3fa7528) - Applying JTBD to AI systems
- [JTBD Interview Script - Alan Klement](https://jtbd.info/a-script-to-kickstart-your-jobs-to-be-done-interviews-2768164761d7) - Switch interview techniques, struggling moment
- [Complete Ikigai Discovery Guide](https://www.deltapsychology.com/psychology-ponderings/your-complete-ikigai-discovery-guide) - Multi-month journey, intersection discovery
- [MILES Framework Explanation](https://www.theunfairacademy.com/blog/miles-framework) - Five categories, unfair advantage assessment
- [A Method of Phenomenological Interviewing](https://pubmed.ncbi.nlm.nih.gov/24413767/) - Lived experience understanding, interviewer as student

### Tertiary (LOW confidence - WebSearch only)
- [Conversational AI Analytics 2026](https://www.webmobinfo.com/blog/conversational-ai-analytics-in-2026) - 70-90% FCR rates, semantic detection 90-95% accuracy
- [The Brain Science of Aha Moments](https://www.scientificamerican.com/article/the-elusive-brain-science-of-aha-moments/) - Remote associations, elevated mood, insight psychology
- [AI Coaching Without Harshness 2026](https://www.icaew.com/insights/viewpoints-on-the-news/2026/jan-2026/how-to-practise-difficult-conversations-with-ai) - Non-judgmental space, challenge without blame
- [Microsoft Research: AI in 2026](https://www.microsoft.com/en-us/research/story/whats-next-in-ai/) - Psychological well-being as design principle, trusted companion model

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official docs from Anthropic and Convex, production-proven libraries
- Architecture patterns: HIGH - Verified through official documentation, Claude Code internals analysis, established research
- Scientific frameworks: MEDIUM - Excellent source material (MILES, Ikigai, Mom Test, JTBD books) but conversational application is novel
- Pitfalls: MEDIUM - Based on coaching bot research, therapy AI studies, and known LLM limitations
- Security (magic links): HIGH - Industry convergence on 15-min, single-use patterns across multiple auth providers

**Research date:** 2026-01-28
**Valid until:** 60 days (frameworks stable, but Claude API features evolving rapidly - check for new context management features)