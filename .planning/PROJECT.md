# Gap Finder Web App

## What This Is

A web application that delivers the Gap Finder methodology to webinar participants via AI-guided conversations. Participants work through 12 phases between live classes, with their progress visualized through an evolving "Idea Card" that transforms from scattered fuzzy blobs into a solid, color-coded card as their idea crystallizes and validates. The instructor can see all participants' progress and read their conversations to prep for sessions.

## Core Value

Persistent conversations that feel identical to chatting with Claude directly - the skill's magic preserved, with progress that never gets lost.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Auth & Sessions**
- [ ] Participant receives magic link via email tied to their cohort
- [ ] Magic link authenticates and lands them in the chat interface
- [ ] Session persists - return via magic link, continue where left off
- [ ] Multiple idea sessions accessible from sidebar (parallel exploration)
- [ ] Sessions have user-defined names

**Chat Experience**
- [ ] Chat feels identical to Claude.ai with the skill loaded
- [ ] Full conversation history persisted and loaded on return
- [ ] Claude naturally wraps up phases with closing questions (skill-driven)
- [ ] Skill loaded as system prompt, conversation history in context
- [ ] Responses streamed to UI

**Progress & Phases**
- [ ] Progress bar shows all 12 phases
- [ ] Current phase highlighted with progress indicator within phase
- [ ] Progressive unlocking - must complete phase N before N+1
- [ ] Phases are clickable but locked until unlocked

**The Idea Card (Visual Centerpiece)**
- [ ] Takes up top 25% of screen
- [ ] Phases 1-5: Scattered fuzzy yellow blobs, slowly drifting together
- [ ] Phase 6 (Your Idea): Blobs merge into complete card, yellow
- [ ] Low scores: Card stays milky yellow
- [ ] High scores: Card transitions to dark green with white text
- [ ] Card content updates as idea gets refined through conversation

**Instructor View**
- [ ] List all participants in a cohort
- [ ] Show current phase for each participant
- [ ] Click into any participant to read their full conversation history

**Data Persistence (Convex)**
- [ ] Save every message with timestamp
- [ ] Track current phase per participant
- [ ] Track idea card state (content, color/score)
- [ ] Link participants to cohorts
- [ ] Store named sessions per participant

### Out of Scope

- Multi-tenant (multiple instructors) — single instructor for v1
- Payment/billing — handled outside the app
- Mobile app — web-first
- Real-time collaboration — async only
- Video/audio integration — separate from this tool
- Dashboard summaries/patterns — v2, instructor reads raw conversations for now
- Auto-generated class prep — v2
- Research APIs and MCP integrations — v2
- Analytics and insights — v2
- Export/reporting features — v2

## Context

**The Gap Finder Skill**

The skill is a 4000+ line methodology (SKILL.md) that guides founders from "I want to start a business" to validated market opportunities. It works beautifully in Claude.ai but lacks persistence, cohort structure, and instructor visibility.

**The 12 Phases**

| # | Phase | Purpose |
|---|-------|---------|
| 1 | Know Yourself | Personal context, unfair advantages, MILES framework |
| 2 | Find Gaps | Research, spot opportunities |
| 3 | Connect the Dots | Synthesize findings, patterns emerge |
| 4 | Pick Your Person | Define specific target customer |
| 5 | Discovery Calls | Talk to real people, explore pain (before idea) |
| 6 | Your Idea | Define the idea (informed by real conversations) |
| 7 | Score | Four Scores Gate (Pain, Simplicity, Shareability, Timing) |
| 8 | Sharpen | Refine based on scores |
| 9 | Validation Calls | Confirm patterns, test price |
| 10 | Design Your Offer | Create the actual offer |
| 11 | Sell First | Pre-sell before building |
| 12 | Prep to Build | Ready to execute |

**Key Insight:** Discovery Calls happen BEFORE the idea is defined. Talk to real people first, understand their pain, then articulate what you'll build.

**The Four Scores Gate (Phase 7)**

| Score | Range | Minimum | Measures |
|-------|-------|---------|----------|
| Pain | 1-10 | ≥7 | Emotional frustration, spending on failed solutions |
| Simplicity | Pass/Fail | Pass | Can explain in 3 words |
| Shareability | 1-10 | ≥5 | Built-in distribution, network effects |
| Timing | 1-10 | ≥6 | Tech readiness, behavior change, catalyst |

**Decision Gate:** Total ≥25 with Pass → dark green card | <18 → milky yellow card

**Webinar Context**

- 8-week cohort program
- ~10 participants per cohort
- Weekly live sessions
- Between classes: participants work through phases with AI
- Instructor preps by reading participant conversations

**UI Layout**

```
┌─────────────────────────────────────────────────────┐
│ ┌─ Sidebar ─┐                                       │
│ │ Session 1 │     ○  ○    ○                        │
│ │ Session 2 │        ○  ○   ← IDEA CARD (25%)      │
│ │ + New     │          ○                           │
│ ├───────────┤───────────────────────────────────────│
│ │           │  [Phase 1 → 2 → 3 → ... → 12]        │
│ │           │───────────────────────────────────────│
│ │           │                                       │
│ │           │         Chat Area                     │
│ │           │                                       │
│ │           │  [Type your message...]               │
│ └───────────┴───────────────────────────────────────┘
```

## Constraints

- **Tech Stack**: Convex for database (real-time, handles auth well), Claude API for conversations
- **Skill Dependency**: The existing SKILL.md is the engine - this app wraps it, doesn't replace it
- **Scale**: ~10 concurrent users per cohort - simple > scalable for v1
- **Conversation Feel**: Must feel identical to Claude.ai - no questionnaire, no form flow

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Preserve dynamic conversation (not questionnaire) | The skill's magic comes from natural conversation flow | — Pending |
| Progressive phase unlocking | Learning context - participants need to complete foundations first | — Pending |
| Discovery Calls before idea definition | Talk to real people first, then define idea | — Pending |
| Single idea card (no other cards) | Keep focus on THE thing being built | — Pending |
| Instructor reads raw conversations (v1) | Manual prep is fine for 10 participants, automation is v2 | — Pending |
| 12 phases (restructured from original 10) | Split Score/Sharpen, add explicit Idea phase, reorder for better flow | — Pending |
| Phase-based context chunking (if needed) | Summarize completed phases to manage context window | — Pending |

---
*Last updated: 2025-01-20 after initialization*
