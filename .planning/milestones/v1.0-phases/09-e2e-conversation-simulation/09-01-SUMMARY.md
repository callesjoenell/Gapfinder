---
phase: 09-e2e-conversation-simulation
plan: 01
subsystem: testing
tags: [simulation, claude-api, conversation, e2e, haiku]

# Dependency graph
requires:
  - phase: 08-conversation-design
    provides: "System prompt builder, coverage tracking, pacing guidance, phase config"
provides:
  - "Core simulation engine (scripts/simulate-chat.mjs) with multi-phase conversation loop"
  - "Marcus persona without pre-loaded ideas (organic idea emergence)"
  - "Dynamic system prompt builder ported from TypeScript to JavaScript"
  - "Phase transition detection and prompt rebuild with summarization"
  - "Energy and coverage state tracking between turns"
  - "Cost tracking with prompt caching support"
affects: [09-02, 09-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dual-Claude simulation (Marcus + Gap Finder both played by Haiku)"
    - "Prompt caching via cache_control ephemeral on system prompts"
    - "Phase-aware turn pacing with nudge points and hard caps"
    - "Coverage extraction via lightweight Claude call after each turn"

key-files:
  created:
    - scripts/simulate-chat.mjs
  modified: []

key-decisions:
  - "Marcus persona has NO pre-loaded ideas -- ideas emerge organically from life context"
  - "Ported full system prompt from TS to JS (not simplified version) for simulation fidelity"
  - "Coverage extraction as separate Claude call per turn for depth tracking"
  - "Cost tracking with $2.50 warn / $3.00 abort thresholds"
  - "Prompt caching on system prompts for 90% input cost reduction on cached tokens"

patterns-established:
  - "Dual-agent simulation pattern: two Claude instances with role-flipped message arrays"
  - "Phase transition: regex detect signal -> wait for agreement -> summarize -> rebuild prompt"
  - "Coverage merge: upgrade-only depth ordering (not_mentioned < surface < moderate < deep)"

requirements-completed: []

# Metrics
duration: 5m 37s
completed: 2026-02-17
---

# Phase 9 Plan 01: Core Simulation Engine Summary

**Multi-phase conversation simulation between Marcus (organic idea discovery) and Gap Finder (real system prompt) with dynamic state tracking, phase transitions, energy/coverage tracking, and cost controls**

## Performance

- **Duration:** 5m 37s
- **Started:** 2026-02-17T20:23:44Z
- **Completed:** 2026-02-17T20:29:21Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Complete rewrite of simulation script from basic 20-turn loop to spec-compliant multi-phase engine (1158 lines)
- Marcus persona knows his life (marketing research, techno, BBQ, wife, festivals) but has NO pre-loaded startup ideas
- Full system prompt ported from TypeScript (systemPrompts.ts, conversationState.ts, phaseConfig.ts) to plain JavaScript
- Phase transition detection with summarization, prompt rebuild, and state reset
- Coverage extraction after each Gap Finder response with depth merge logic
- Cost tracking with Haiku pricing, prompt caching, and abort thresholds

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite Marcus persona and core conversation loop** - `febfac1` (feat)
2. **Task 2: Add phase-aware turn pacing and coverage extraction** - `e9028ea` (feat)

## Files Created/Modified
- `scripts/simulate-chat.mjs` - Complete simulation engine: Marcus persona, Gap Finder system prompt builder, phase config (0-5), transition detection, energy tracking, coverage extraction, cost tracking, main conversation loop

## Decisions Made
- Marcus persona has NO pre-loaded ideas (removed therapy chatbot, VR hangout, marketing intelligence references entirely)
- Used claude-haiku-4-5-20251001 for both sides (fast, cheap, capable enough)
- Coverage extraction as separate Claude call (256 max_tokens) per turn rather than inline analysis
- Cost thresholds: $2.50 warn (reduce max_tokens) / $3.00 abort (save partial results)
- Prompt caching via `cache_control: { type: "ephemeral" }` on system prompt content blocks
- Phase-aware pacing: per-phase caps with nudge points at ~70% of cap

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required. Script uses existing ANTHROPIC_API_KEY from Convex env.

## Next Phase Readiness
- Core engine ready for Plan 02 (research tool_use integration, homework loop simulation)
- Plan 03 will add evaluation rubric scoring and file output (transcript, eval, JSON)
- searchedSources and researchFindings arrays are initialized but empty (populated in Plan 02)

---
*Phase: 09-e2e-conversation-simulation*
*Completed: 2026-02-17*
