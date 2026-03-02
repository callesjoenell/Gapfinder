# Gap Finder Web App

## What This Is

A web application that delivers the Gap Finder methodology via AI-guided conversations. Users work through phases of self-discovery, research, and idea validation, with their progress visualized through an evolving "Idea Card" that transforms from scattered fuzzy blobs into a solid, color-coded card as their idea crystallizes. Claude guides the conversation naturally — no questionnaires, no forms — preserving the methodology's magic while adding persistence, research tools, and visual progress.

## Core Value

Persistent conversations that feel identical to chatting with Claude directly - the skill's magic preserved, with progress that never gets lost.

## Requirements

### Validated

- ✓ Magic link auth via Clerk — v1.0
- ✓ Auth lands user in chat interface — v1.0
- ✓ Session persists across browser sessions — v1.0
- ✓ Multiple idea sessions in sidebar — v1.0
- ✓ Sessions have user-defined names — v1.0
- ✓ Chat feels identical to Claude.ai with skill loaded — v1.0
- ✓ Full conversation history persisted and loaded on return — v1.0
- ✓ Claude naturally wraps up phases with closing questions — v1.0
- ✓ Skill loaded as system prompt with conversation history — v1.0
- ✓ Responses streamed to UI — v1.0
- ✓ Progress bar shows all phases split by path — v1.0
- ✓ Current phase highlighted with progress indicator — v1.0
- ✓ Progressive unlocking (must complete N before N+1) — v1.0
- ✓ Phases clickable but locked until unlocked — v1.0
- ✓ Idea card with scattered fuzzy blobs (early phases) — v1.0
- ✓ Blobs merge into complete card at Phase 6 — v1.0
- ✓ Score-based color transitions (yellow → green) — v1.0
- ✓ Card content updates from conversation — v1.0
- ✓ Save every message with timestamp — v1.0
- ✓ Track current phase per participant — v1.0
- ✓ Track idea card state (content, color/score) — v1.0
- ✓ Store named sessions per participant — v1.0
- ✓ Research tools: Reddit, HN, ProductHunt, Tavily, SO — v1.0
- ✓ Claude queries research sources during conversation — v1.0
- ✓ Manual research checklists (Facebook Groups, LinkedIn, etc.) — v1.0
- ✓ Research findings persist and inform later phases — v1.0
- ✓ Keyword volume as paid add-on — v1.0
- ✓ Journey framing per path (exploration/evaluation) — v1.0
- ✓ Proactive research on conversation cues — v1.0
- ✓ Implicit phase progression tracking — v1.0
- ✓ Conversational pacing (depth over breadth) — v1.0
- ✓ Background coverage tracking — v1.0

### Active

- [ ] Stripe integration for session payments
- [ ] Free tier: 1 Explore + 1 Evaluate session per user
- [ ] $2 per additional session, doubling weekly, capped at $64
- [ ] Paywall at session creation with Stripe Checkout
- [ ] Global weekly price doubling with configurable launch date

### Out of Scope

- Multi-tenant (multiple instructors) — single instructor for now
- Instructor view / cohort features — deferred
- Mobile app — web-first
- Real-time collaboration — async only
- Video/audio integration — separate from this tool
- Voice input/output — text-only for reflection-based methodology
- Points/badges/leaderboards — creates anxiety
- Community/forum features — not needed at scale

## Context

**Current State (v1.0 shipped 2026-03-01):**
- 12,334 LOC TypeScript/TSX across 95 source files
- Tech stack: Next.js, Convex, Clerk auth, Claude API, Tailwind CSS
- Research APIs: Reddit, Hacker News, ProductHunt, Tavily, Stack Overflow, Keywords Everywhere
- E2E simulation testing with 8-dimension evaluation rubrics
- System prompt guardrails for conversation quality

**The Gap Finder Skill**

The skill is a 4000+ line methodology (SKILL.md) that guides founders from "I want to start a business" to validated market opportunities. It works beautifully in Claude.ai but lacks persistence, cohort structure, and instructor visibility.

**The Phases (Two Paths)**

Exploration path (phases 0-5): Know Yourself → Find Gaps → Connect Dots → Pick Your Person → Discovery Calls → Your Idea
Evaluation path (phases 0-9): Adds Score → Sharpen → Validation Calls → Design Offer

**Key Insight:** Discovery Calls happen BEFORE the idea is defined. Talk to real people first, understand their pain, then articulate what you'll build.

## Constraints

- **Tech Stack**: Convex (real-time DB + auth), Claude API, Next.js
- **Skill Dependency**: SKILL.md is the engine - this app wraps it, doesn't replace it
- **Scale**: ~10 concurrent users per cohort - simple > scalable
- **Conversation Feel**: Must feel identical to Claude.ai - no questionnaire, no form flow

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Preserve dynamic conversation (not questionnaire) | The skill's magic comes from natural conversation flow | ✓ Good — feels natural |
| Progressive phase unlocking | Learning context - participants need to complete foundations first | ✓ Good — prevents rushing |
| Discovery Calls before idea definition | Talk to real people first, then define idea | ✓ Good — methodology preserved |
| Single idea card (no other cards) | Keep focus on THE thing being built | ✓ Good — clear visual anchor |
| Clerk over custom magic links | Custom magic link auth proved fragile; Clerk handles edge cases | ✓ Good — zero auth bugs since |
| Claude structured outputs for phase detection | Semantic understanding of conversation progress | ✓ Good — reliable phase advancement |
| Implicit coverage tracking over explicit checklists | Users hate being quizzed; track coverage in background | ✓ Good — natural conversation preserved |
| Research tools as Claude tool_use (not MCP) | Serverless Convex incompatible with MCP | ✓ Good — works reliably |
| Phase 6 (Instructor View) deferred to v2 | v1 is standalone user experience, no cohorts | ✓ Good — reduced scope, shipped faster |
| useLayoutEffect + scrollHeight for textarea resize | CSS Grid mirror approach too fragile | ✓ Good — simple, reliable |
| Separate localStorage keys per concern | react-use useLocalStorage has stale closure bug with shared keys | ✓ Good — fixed draft/scroll persistence |

## Current Milestone: v1.1 Payments

**Goal:** Monetize session creation with Stripe — urgency pricing that doubles weekly from $2 to $64 max.

**Target features:**
- Stripe Checkout integration for session payments
- Free tier (1 Explore + 1 Evaluate)
- Global weekly price doubling ($2 → $4 → $8 → ... → $64)
- Paywall UX at session creation

---
*Last updated: 2026-03-02 after v1.1 milestone start*
