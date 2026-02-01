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
- [ ] 03-06-PLAN.md - Gap closure: Wire session state hooks to UI components (scroll/draft persistence)

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

**Requirements:**
- PROG-01: Progress bar shows all 12 phases
- PROG-02: Current phase highlighted with progress indicator within phase
- PROG-03: Progressive unlocking - must complete phase N before N+1
- PROG-04: Phases are clickable but locked until unlocked

**Success Criteria:**
1. Participant sees all 12 phases in progress bar with clear visual distinction between completed, current, and locked
2. Participant clicks on a locked phase and sees it's not yet accessible
3. Participant completes a phase and sees the next phase unlock
4. Participant can click back to review a completed phase's conversation

**Research Flags:**
- Phase detection (Claude semantic detection, not keyword matching)
- Phase completion criteria per methodology phase
- UI state for current position within a phase (not just phase-level progress)

---

## Phase 5: Idea Card

**Goal:** Participants see their idea crystallize visually as scattered blobs merge into a scored card.

**Emotional Purpose:** Users feel "I can SEE my idea forming" - the abstract becomes tangible. Blobs merging visualizes THEIR journey from confusion to clarity. The card is proof of their work, their discovery - reinforces ownership.

**Dependencies:** Phase 4 (phase tracking drives card evolution)

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

## Phase 6: Instructor View

**Goal:** Instructor can see all participants and read their conversations to prep for sessions.

**Emotional Purpose:** Users feel "Help is there if I need it" - knowing an instructor can see their progress provides safety net. Not alone in the journey. Instructor can offer personalized guidance based on actual conversation context.

**Dependencies:** Phases 1-4 (participant data, conversations, phase tracking must exist)

**Requirements:**
- INST-01: List all participants in a cohort
- INST-02: Show current phase for each participant
- INST-03: Click into any participant to read their full conversation history

**Success Criteria:**
1. Instructor sees list of all participants in their cohort
2. Instructor can see at a glance which phase each participant is currently in
3. Instructor clicks into a participant and can read their full conversation history
4. Instructor can navigate between participants without losing context

**Research Flags:**
- Read-only conversation view (no instructor intervention in v1)
- Cohort filtering (instructor sees only their cohort)
- Performance with ~10 participants per cohort

---

## Progress

| Phase | Status | Requirements | Completion |
|-------|--------|--------------|------------|
| 1 - Foundation | Complete | 8 | 100% |
| 2 - Chat Core | Complete | 4 | 100% |
| 3 - Sessions | Planned | 3 | 0% |
| 4 - Phase System | Not Started | 4 | 0% |
| 5 - Idea Card | Not Started | 6 | 0% |
| 6 - Instructor View | Not Started | 3 | 0% |

**Total:** 28 requirements across 6 phases

---

## Dependency Graph

```
Phase 1: Foundation
    |
    v
Phase 2: Chat Core
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
Phase 6: Instructor View
```

Note: Phases 5 and 6 both depend on Phase 4 but are independent of each other. They could theoretically be parallelized, but sequential execution maintains focus.

---

*Roadmap created: 2025-01-22*
*Last updated: 2026-01-31*
