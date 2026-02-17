# Roadmap: Gap Finder Web App

**Created:** 2025-01-22
**Depth:** Standard (5-8 phases)
**Core Value:** Persistent conversations that feel identical to chatting with Claude directly - the skill's magic preserved, with progress that never gets lost.

---

## North Star: The Emotional Journey

**Every phase in this roadmap serves ONE outcome: how users FEEL when they complete the process.**

Users should exit feeling **confident**, **capable**, **clear**, and with genuine **ownership** of their idea. Features are the delivery mechanism for this emotional transformation.

### Phase-to-Journey Mapping

| Roadmap Phase | Enables Emotional Journey Stage | User Feels |
|---------------|--------------------------------|------------|
| 1 - Foundation | Persistence = trust, can return anytime | "My progress is safe" |
| 2 - Chat Core | Quality conversation = being heard | "I'm understood" |
| 3 - Sessions | Multiple explorations = freedom | "I can explore without losing anything" |
| 4 - Phase System | Visual progress = momentum | "I'm making progress" |
| 5 - Idea Card | Crystallization = clarity | "I can SEE my idea forming" |
| 6 - Instructor | Support available = not alone | "Help is there if I need it" |
| 7 - Research Tools | Real data backs instincts | "I have evidence, not just hunches" |
| 8 - Conversation Design | Guided journey with natural flow | "This conversation knows where it's going" |

### Verification Question

Before marking any phase complete, ask:
> "Does this help users feel capable and clear, with genuine ownership of their idea?"

---

## Overview

Six phases derived from the natural dependency chain: Foundation enables Chat, Chat enables Sessions, Sessions enable Phase tracking, Phase tracking enables Idea Card evolution, and all participant data enables Instructor visibility. Each phase delivers a verifiable capability before the next can begin.

---

## Phase 1: Foundation

**Goal:** Participants can authenticate and their data persists across sessions.

**Emotional Purpose:** Users feel "My progress is safe" - trust that they can leave and return without losing anything. This safety enables vulnerability in the exploration process.

**Dependencies:** None (first phase)

**Plans:** 6 plans

Plans:
- [x] 01-01-PLAN.md - Project setup, Convex initialization, and database schema
- [x] 01-02-PLAN.md - Magic link authentication with Resend (migrated to Clerk)
- [x] 01-03-PLAN.md - Sessions/Messages API and Layout UI scaffold
- [x] 01-04-PLAN.md - System prompt engineering with scientific frameworks
- [x] 01-05-PLAN.md - Context management and hierarchical summarization
- [x] 01-06-PLAN.md - Chat integration and end-to-end wiring

**Requirements:**
- AUTH-01: Participant receives magic link via email tied to their cohort (NOTE: v1 standalone users, no cohorts)
- AUTH-02: Magic link authenticates and lands them in the chat interface
- AUTH-03: Session persists - return via magic link, continue where left off
- DATA-01: Save every message with timestamp
- DATA-02: Track current phase per participant
- DATA-03: Track idea card state (content, color/score)
- DATA-04: Link participants to cohorts (DEFERRED to v2)
- DATA-05: Store named sessions per participant

**Success Criteria:**
1. Participant receives magic link email and clicks through to the app
2. Participant closes browser, returns via magic link, and sees their previous state
3. Message data persists across page refreshes and browser sessions

**Research Flags:**
- Magic link security (15-min expiry, single-use tokens)
- Convex schema design (normalized tables, not nested arrays)
- Token caching structure for Claude API

---

## Phase 2: Chat Core

**Goal:** Participants can have conversations that feel identical to Claude.ai with the skill loaded.

**Emotional Purpose:** Users feel "I'm understood" - conversation quality enables the discovery moments. Claude's responses help them see patterns in their own experience they hadn't noticed. This is where "I have more to offer than I realized" begins.

**Dependencies:** Phase 1 (auth and data persistence)

**Plans:** 4 plans

Plans:
- [x] 02-01-PLAN.md - Paginated messages query and streaming Claude action
- [x] 02-02-PLAN.md - Throttled streaming hook and retry utilities
- [x] 02-03-PLAN.md - Message UI: thinking section, markdown, full-width layout
- [x] 02-04-PLAN.md - End-to-end wiring and verification

**Requirements:**
- CHAT-01: Chat feels identical to Claude.ai with the skill loaded
- CHAT-02: Full conversation history persisted and loaded on return
- CHAT-04: Skill loaded as system prompt, conversation history in context
- CHAT-05: Responses streamed to UI

**Success Criteria:**
1. Participant types a message and sees response stream in real-time (not appear all at once)
2. Participant can scroll through full conversation history from previous sessions
3. Claude's responses reflect the Gap Finder methodology (not generic chat behavior)
4. Participant can read streaming response without auto-scroll fighting them

**Research Flags:**
- Auto-scroll intent tracking (user scrolled up = stop auto-scroll)
- Streaming render throttling (batch updates every 50ms)
- Context window management (sliding window + summarization for long sessions)
- Silent streaming failure handling

---

## Phase 3: Sessions

**Goal:** Participants can explore multiple ideas in parallel through named sessions.

**Emotional Purpose:** Users feel "I can explore without losing anything" - freedom to pursue multiple directions without commitment anxiety. Reduces fear of "picking wrong" which blocks exploration.

**Dependencies:** Phase 2 (working chat)

**Plans:** 6 plans

Plans:
- [x] 03-01-PLAN.md - Backend infrastructure: schema extensions, path-based queries, archive mutations, limit enforcement
- [x] 03-02-PLAN.md - Session state persistence: scroll position and draft message hooks
- [x] 03-03-PLAN.md - Sidebar restructure: SessionGroup, SessionItem, ArchivedSection components
- [x] 03-04-PLAN.md - Session actions: context menu, inline edit, delete confirmation modal
- [x] 03-05-PLAN.md - Full integration: onboarding view, updated creation modal, wiring all components
- [x] 03-06-PLAN.md - Gap closure: Wire session state hooks to UI components (scroll/draft persistence)

**Requirements:**
- AUTH-04: Multiple idea sessions accessible from sidebar (parallel exploration)
- AUTH-05: Sessions have user-defined names
- CHAT-03: Claude naturally wraps up phases with closing questions (skill-driven)

**Success Criteria:**
1. Participant creates a new session and gives it a custom name
2. Participant switches between sessions via sidebar and each has independent conversation history
3. Participant renames an existing session
4. Claude provides natural phase transitions with closing questions (skill behavior preserved)

**Research Flags:**
- Session switching UX (preserve scroll position, loading states)
- Skill prompt engineering for phase wrap-up behavior

---

## Phase 4: Phase System

**Goal:** Participants can see their progress and unlock phases sequentially as they complete the methodology.

**Emotional Purpose:** Users feel "I'm making progress" - visual momentum builds confidence. Seeing phases complete creates sense of accomplishment and forward motion. Gates prevent rushing (which undermines depth).

**Dependencies:** Phase 3 (sessions with skill-driven behavior)

**Plans:** 2 plans

Plans:
- [x] 04-01-PLAN.md - Progress bar UI components (PhaseProgressBar, PhaseSegment) + Toast setup
- [x] 04-02-PLAN.md - Phase detection backend (structured outputs) + phase advancement + phase boundary markers

**Requirements:**
- PROG-01: Progress bar shows all 10 phases (0-9, split by path)
- PROG-02: Current phase highlighted with progress indicator within phase
- PROG-03: Progressive unlocking - must complete phase N before N+1
- PROG-04: Phases are clickable but locked until unlocked

**Success Criteria:**
1. Participant sees all phases for their path in progress bar with clear visual distinction between completed, current, and locked
2. Participant clicks on a locked phase and sees it's not yet accessible (toast notification)
3. Participant completes a phase and sees the next phase unlock (confirmation dialog + toast)
4. Participant can click back to review a completed phase's conversation (scroll to phase boundary)

**Research Flags:**
- Phase detection (Claude semantic detection via structured outputs)
- Phase completion criteria per methodology phase (in phaseConfig.ts)
- UI state for current position within a phase (usePhaseProgress hook)

---

## Phase 5: Idea Card

**Goal:** Participants see their idea crystallize visually as scattered blobs merge into a scored card.

**Emotional Purpose:** Users feel "I can SEE my idea forming" - the abstract becomes tangible. Blobs merging visualizes THEIR journey from confusion to clarity. The card is proof of their work, their discovery - reinforces ownership.

**Dependencies:** Phase 4 (phase tracking drives card evolution)

**Plans:** 4 plans

Plans:
- [x] 05-01-PLAN.md - Blob rendering foundation: SVG blobs with gradient edges, drift animation, 6-blob layout
- [x] 05-02a-PLAN.md - Backend idea extraction infrastructure: schema extensions, Claude action
- [x] 05-02b-PLAN.md - Word cloud + merge animation: d3-cloud layout, IdeaCardContent, message triggers
- [x] 05-03-PLAN.md - Responsive layout + color transitions: Chat integration, score-based colors, testing mode

**Requirements:**
- CARD-01: Idea card takes up top 25% of screen
- CARD-02: Phases 1-5: Scattered fuzzy yellow blobs, slowly drifting together
- CARD-03: Phase 6 (Your Idea): Blobs merge into complete card, yellow
- CARD-04: Low scores: Card stays milky yellow
- CARD-05: High scores: Card transitions to dark green with white text
- CARD-06: Card content updates as idea gets refined through conversation

**Success Criteria:**
1. Participant in Phase 1-5 sees scattered fuzzy blobs drifting in the card area
2. Participant reaching Phase 6 sees blobs merge into a solid card showing their idea
3. Participant completing Phase 7 (Score) with high scores sees card transition to dark green
4. Participant refining their idea in conversation sees card content update to reflect changes
5. Card animations are smooth without stutter or jank

**Research Flags:**
- GPU-accelerated animations only (transform/opacity, not layout properties)
- Card content extraction from conversation (Claude structured output)
- Score threshold for color transitions (total >= 25 with Pass = dark green)

---

## Phase 6: Instructor View (DEFERRED TO V2)

**Status:** Deferred to v2 — webinar/cohort version

**Goal:** Instructor can see all participants and read their conversations to prep for sessions.

**Emotional Purpose:** Users feel "Help is there if I need it" - knowing an instructor can see their progress provides safety net. Not alone in the journey. Instructor can offer personalized guidance based on actual conversation context.

**Dependencies:** Phases 1-4 (participant data, conversations, phase tracking must exist)

**v1 Decision:** The instructor view is for the webinar/cohort version of Gap Finder. v1 is standalone user experience only — no cohorts, no instructors. This phase will be planned and implemented when v2 work begins.

**Requirements (v2):**
- INST-01: List all participants in a cohort
- INST-02: Show current phase for each participant
- INST-03: Click into any participant to read their full conversation history

**Success Criteria (v2):**
1. Instructor sees list of all participants in their cohort
2. Instructor can see at a glance which phase each participant is currently in
3. Instructor clicks into a participant and can read their full conversation history
4. Instructor can navigate between participants without losing context

**Research Flags (v2):**
- Read-only conversation view (no instructor intervention in v1)
- Cohort filtering (instructor sees only their cohort)
- Performance with ~10 participants per cohort

---

## Phase 7: Research Tools

**Goal:** Enhance methodology Phase 2 (Research) with actual research capabilities — Claude tool use for auto-research where APIs exist, structured checklists for manual research elsewhere.

**Emotional Purpose:** Users feel "I have evidence, not just hunches" — real data from Reddit, Hacker News, ProductHunt, Tavily backs their instincts. Manual research checklists ensure they've done the work on Facebook Groups, LinkedIn, etc.

**Dependencies:** Phase 2 (Chat Core — needs Claude conversation working)

**Plans:** 6 plans

Plans:
- [x] 07-01-PLAN.md — Research API infrastructure: tool definitions + HN/Tavily/Reddit/ProductHunt/SO wrappers
- [x] 07-02-PLAN.md — Schema + research action: findings persistence + tool execution loop
- [x] 07-03-PLAN.md — Manual research checklists: Facebook Groups/LinkedIn/Twitter/Amazon forms + mutations
- [x] 07-04-PLAN.md — Paid keyword lookup: Keywords Everywhere API + credit tracking
- [x] 07-05-PLAN.md — System prompt + Chat integration: research orchestration + UI wiring
- [ ] 07-06-PLAN.md — Research suggestions UI: context-aware chips + save-for-later queue

**Requirements:**
- RESEARCH-01: Claude tool use for Reddit, Hacker News, ProductHunt, Tavily, Stack Overflow
- RESEARCH-02: Claude can query these sources during Phase 0-2 conversations and display results
- RESEARCH-03: Structured checklists for manual research (Facebook Groups, LinkedIn, Twitter/X, Amazon reviews)
- RESEARCH-04: User can report back findings from manual research in structured format
- RESEARCH-05: Research findings persist and inform later phases
- RESEARCH-06: System prompt updated to orchestrate both auto and manual research
- RESEARCH-07: Keyword volume as paid add-on (50% markup on Keywords Everywhere API costs)
- RESEARCH-08: Usage tracking for paid features per user

**Success Criteria:**
1. User in Phase 0-2 sees Claude query Reddit/HN for pain signals
2. User receives structured checklist for Facebook Groups research with clear instructions
3. User can fill in findings from manual research and see them reflected in conversation
4. Research evidence carries forward to later phase summaries
5. Keyword lookup requires credit confirmation before execution

**Research Flags:**
- Claude tool use in Convex actions (not MCP — serverless incompatibility)
- Rate limiting across multiple API sources
- Credit-based billing for keyword lookups

---

## Phase 8: Conversation Design

**Goal:** Users get clear journey framing per path, Claude proactively researches when conversation cues arise, and phase progression tracks implicitly through natural conversation rather than explicit checklist questioning.

**Emotional Purpose:** Users feel "This conversation knows where it's going" — not lost in endless questions, but guided through a clear journey where research happens naturally and progress emerges from genuine dialogue.

**Dependencies:** Phase 7 (Research Tools — needs research infrastructure), Phase 2 (Chat Core — modifies system prompts and streaming)

**Plans:** 4 plans

Plans:
- [ ] 08-01-PLAN.md — Coverage tracking infrastructure: schema, Convex CRUD, phaseConfig topics, Zod schemas
- [ ] 08-02-PLAN.md — System prompt overhaul: journey framing, pacing, coverage injection, research intensity
- [ ] 08-03-PLAN.md — Conversation actions: post-turn coverage extraction, trigger detection, all-phase research
- [ ] 08-04-PLAN.md — UI integration: useStreamingChat wiring, coverage progress bar, intensity control

**Requirements:** [CONV-01, CONV-02, CONV-03, CONV-04, CONV-05]

**Success Criteria:**
1. New user in exploration path sees clear framing of the 4-phase journey in first response
2. New user in evaluation path sees clear framing of the 6-phase journey in first response
3. Claude proactively searches when user mentions a market claim or competitor without being asked
4. User completes a phase without ever being asked to "rate something 1-5" — scores inferred from conversation
5. Claude stays on one thread when energy is high, moves on naturally when it drops

**Research Flags:**
- Prompt engineering for implicit extraction vs explicit questioning
- Research trigger patterns (what conversation cues should activate tools)
- Background assessment redesign (coverage map vs boolean completion)

---

## Progress

| Phase | Status | Requirements | Completion |
|-------|--------|--------------|------------|
| 1 - Foundation | Complete | 8 | 100% |
| 2 - Chat Core | Complete | 4 | 100% |
| 3 - Sessions | Complete | 3 | 100% |
| 4 - Phase System | Complete | 4 | 100% |
| 5 - Idea Card | Complete | 6 | 100% |
| 6 - Instructor View | Deferred to v2 | 3 | — |
| 7 - Research Tools | In Progress | 8 | 83% (5/6 plans) |
| 8 - Conversation Design | Planned | 5 | 0% |

**v1 Total:** 33 requirements across 6 phases
**v1 Complete:** 25/31 (81%)
**v2 Total:** 3 requirements (Phase 6)

---

## Dependency Graph

```
Phase 1: Foundation
    |
    v
Phase 2: Chat Core -----> Phase 7: Research Tools -----> Phase 8: Conversation Design
    |
    v
Phase 3: Sessions
    |
    v
Phase 4: Phase System
    |
    +---> Phase 5: Idea Card
    |
    v
Phase 6: Instructor View (v2)
```

Note: Phase 7 (Research Tools) depends on Phase 2 (Chat Core) and can be built independently of Phases 3-5. It enhances the methodology's Phase 1-2 (Find Gaps, Research) with actual research capabilities.

---

*Roadmap created: 2025-01-22*
*Last updated: 2026-02-17*
