---
phase: 09-e2e-conversation-simulation
plan: 02
subsystem: testing
tags: [simulation, research, tool-use, homework-loop, api, reddit, hackernews, tavily, stackoverflow]

# Dependency graph
requires:
  - phase: 09-e2e-conversation-simulation
    plan: 01
    provides: "Core simulation engine with multi-phase conversation loop, Marcus persona, system prompt builder"
  - phase: 07-research-tools
    provides: "Tool definitions and API wrapper patterns for Reddit, HN, Tavily, SO"
provides:
  - "Claude tool_use integration with real API calls during simulation"
  - "Research state tracking (searchedSources, researchFindings, researchLog)"
  - "Homework loop simulation at Phase 4->5 with dynamic debrief generation"
  - "Rate-limited API execution with graceful error handling"
affects: [09-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Claude tool_use loop: send tools -> detect tool_use stop_reason -> execute APIs -> return results -> continue"
    - "Homework loop: detect trigger -> acknowledge -> time break -> generate debriefs -> Marcus returns"
    - "Dynamic idea direction extraction from conversation context for debrief generation"
    - "Gzip decompression for Stack Exchange API responses via node:zlib"

key-files:
  created: []
  modified:
    - scripts/simulate-chat.mjs

key-decisions:
  - "Max 5 tool execution iterations to prevent infinite loops"
  - "1-second delay between API calls for rate limiting"
  - "Tavily key fetched from Convex env with process.env fallback"
  - "Idea direction extracted dynamically from conversation (not hardcoded)"
  - "Homework trigger detected via pattern matching on Gap Finder responses"
  - "Debrief generation adapts to whatever idea emerged in conversation"

patterns-established:
  - "Tool_use loop pattern: iterate until end_turn or max iterations, accumulate tool results"
  - "Homework loop pattern: detect -> ack -> time break -> generate debriefs -> return -> transition"

requirements-completed: []

# Metrics
duration: 3m 54s
completed: 2026-02-17
---

# Phase 9 Plan 02: Research Tool Integration and Homework Loop Summary

**Claude tool_use with real Reddit/HN/Tavily/SO API calls during conversation, plus homework loop simulation with dynamic debrief generation at Phase 4->5**

## Performance

- **Duration:** 3m 54s
- **Started:** 2026-02-17T20:31:14Z
- **Completed:** 2026-02-17T20:35:08Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Research tool_use integration: Gap Finder can call search_reddit, search_hackernews, search_tavily, search_stackoverflow during conversation with real API responses
- Tool execution loop follows Anthropic tool_use pattern: detect stop_reason, execute tools, return results, continue until end_turn
- Homework loop simulates Marcus going to talk to real people with 3-4 generated debrief forms based on actual conversation context
- Research state tracked across turns and injected into subsequent system prompts

## Task Commits

Each task was committed atomically:

1. **Task 1: Add research tool_use integration with real API calls** - `62d15ea` (feat)
2. **Task 2: Implement homework loop simulation for Phase 4->5** - `1d42cd5` (feat)

## Files Created/Modified
- `scripts/simulate-chat.mjs` - Added tool definitions, API execution functions, tool_use loop, homework detection/execution, debrief generation, research state tracking (1158 -> 1651 lines)

## Decisions Made
- Max 5 tool execution iterations prevents infinite tool_use loops while allowing thorough multi-tool research
- 1-second delay between API calls respects rate limits (Reddit 60/min, others similar)
- Tavily key fetched from Convex env first, falls back to process.env -- gracefully returns empty results if unavailable
- Idea direction extracted dynamically from conversation context via pattern matching on recent messages
- Homework trigger detected via regex patterns on Gap Finder responses ("go talk to", "talk to N people", etc.)
- Debrief generation prompt instructs Claude to adapt to whatever idea actually emerged, not hardcoded examples
- Stack Overflow gzip decompression with fallback for non-gzipped responses

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - script uses existing ANTHROPIC_API_KEY from Convex env. TAVILY_API_KEY is optional (graceful degradation).

## Next Phase Readiness
- Simulation engine now has full research and homework capabilities
- Plan 03 will add evaluation rubric scoring and file output (transcript, eval, JSON)
- Research calls are logged for transcript inclusion
- Homework data tracked for evaluation scoring

---
*Phase: 09-e2e-conversation-simulation*
*Completed: 2026-02-17*
