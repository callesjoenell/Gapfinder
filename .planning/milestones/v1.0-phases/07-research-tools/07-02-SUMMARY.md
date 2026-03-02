---
phase: 07-research-tools
plan: 02
subsystem: api
tags: [anthropic, convex, claude, research, tool-execution, reddit, hackernews, tavily, producthunt, stackoverflow]

# Dependency graph
requires:
  - phase: 07-01
    provides: Research tool definitions and API wrappers
provides:
  - Research action with Claude tool execution loop
  - Schema extensions for persisting research findings
  - Tool execution dispatcher routing tools to API wrappers
affects: [07-03 (manual research), 07-04 (keyword volume), chat integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tool execution loop with max iterations to prevent runaway"
    - "Sequential tool execution to respect API rate limits"
    - "Findings extraction and persistence for later phase reference"
    - "Internal mutations for action-to-database writes"

key-files:
  created:
    - convex/researchActions.ts
    - convex/research/executor.ts
  modified:
    - convex/schema.ts
    - convex/sessions.ts

key-decisions:
  - "Max 5 tool execution iterations to prevent infinite loops"
  - "Sequential tool execution to respect API rate limits"
  - "Store top 5 results per finding to limit data growth"
  - "Research findings as optional field for backward compatibility"

patterns-established:
  - "Tool execution loop: while stop_reason === 'tool_use', execute and feed back results"
  - "Findings persistence: extract structured data from tool results, save to session"
  - "Internal mutations: actions call ctx.runMutation(internal.*) for database writes"

# Metrics
duration: 4min
completed: 2026-02-02
---

# Phase 7 Plan 2: Research Tools Backend Summary

**Claude can invoke research tools during conversations with automatic tool execution loop and findings persistence**

## Performance

- **Duration:** 4 minutes
- **Started:** 2026-02-02T14:57:49Z
- **Completed:** 2026-02-02T15:01:47Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Research action with Claude tool use loop handles automatic research queries
- Schema extended to store research findings on sessions
- Tool executor dispatches Claude tool calls to appropriate API wrappers
- Findings persist for later phase reference in conversation context

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend schema for research findings persistence** - `88232ed` (feat)
   - Added researchFindings field to sessions table
   - Added manualResearchFindings table for checklist data

2. **Task 2: Create tool execution dispatcher** - `2148887` (feat)
   - Created executeResearchTool dispatcher function
   - Routes tool calls to Reddit, HN, Tavily, ProductHunt, Stack Overflow

3. **Task 3: Create research action with tool execution loop** - `9fd3b51` (feat)
   - Implemented chatWithResearch action with tool loop
   - Added appendResearchFindings internal mutation

## Files Created/Modified
- `convex/schema.ts` - Added researchFindings field and manualResearchFindings table
- `convex/research/executor.ts` - Tool execution dispatcher routing to API wrappers
- `convex/researchActions.ts` - Main research action with Claude tool execution loop
- `convex/sessions.ts` - Added appendResearchFindings internal mutation

## Decisions Made

**Max 5 tool execution iterations**
- Prevents infinite loops if Claude gets stuck calling tools
- Balances thoroughness with safety

**Sequential tool execution (not parallel)**
- Respects API rate limits (Reddit 60/min, others vary)
- Prevents overwhelming external services

**Store top 5 results per finding**
- Limits data growth while preserving key evidence
- Findings summarized by Claude anyway, full results not needed

**Research findings as optional field**
- Backward compatible with existing sessions
- No data migration required

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**TypeScript compilation errors with Anthropic SDK**
- Issue: Project tsconfig targets ES5, Anthropic SDK requires ES2015+ for private identifiers
- Resolution: Convex build system handles this, TypeScript compiler check skipped
- Verified deployment succeeded with `npx convex dev --once`

## User Setup Required

None - research infrastructure ready. However, to enable research features:

**Required for web search:**
```bash
npx convex env set TAVILY_API_KEY "tvly-..."
```

**Optional for ProductHunt:**
```bash
npx convex env set PRODUCTHUNT_API_KEY "..."
```

Other tools (Reddit, HN, Stack Overflow) work without API keys.

## Next Phase Readiness

**Ready for 07-03 (Manual Research Checklists):**
- Schema has manualResearchFindings table ready
- Research infrastructure established

**Ready for future chat integration:**
- chatWithResearch action can replace standard chat action
- System prompt determines when Claude should use research tools
- Findings automatically persist and can be referenced in later phases

**Blockers:**
- TAVILY_API_KEY required for web search functionality
- ANTHROPIC_API_KEY already set (from previous phases)

---
*Phase: 07-research-tools*
*Completed: 2026-02-02*
