---
phase: 05-idea-card
plan: 02a
subsystem: backend
tags: [convex, anthropic, claude, idea-extraction, structured-output, schema]

# Dependency graph
requires:
  - phase: 05-01
    provides: Blob rendering foundation with 6 organic shapes
  - phase: 01-foundation
    provides: Convex schema and Claude API patterns
provides:
  - Schema with idea extraction fields (ideaKeywords, ideaSentence, supportingSentences)
  - getIdeaCard query for reactive idea data access
  - extractIdeaContent action using Claude structured output
  - Internal mutations for updating idea content
affects: [05-02b, word-cloud-overlay, idea-card-merge]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Split Convex files by runtime: queries/mutations (standard) vs actions (Node.js)
    - Internal mutations accessed via internal API namespace
    - Claude structured JSON output with markdown wrapping handling
    - Edge case prevention for premature idea merge

key-files:
  created:
    - convex/ideas.ts
    - convex/ideasActions.ts
  modified:
    - convex/schema.ts

key-decisions:
  - "Split ideas functionality into two files to separate Node.js actions from standard runtime queries"
  - "Use internal API namespace for calling internal mutations from actions"
  - "Edge case: Only set ideaSentence when ideaReady=true AND phase >= 3 AND sentence exists"
  - "Analyze last 50 messages for idea extraction to balance context vs API cost"

patterns-established:
  - "File split pattern: ideas.ts (queries/mutations) + ideasActions.ts (Node.js actions)"
  - "Internal mutation pattern: export with internalMutation, call via internal.* namespace"
  - "Claude extraction pattern: structured JSON request with markdown wrapping handling"

# Metrics
duration: 4min
completed: 2026-02-02
---

# Phase 5 Plan 2a: Backend Idea Extraction Infrastructure Summary

**Schema extended with idea fields, Claude-powered extraction action with structured JSON output, and reactive queries for idea card data**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-02T05:36:48Z
- **Completed:** 2026-02-02T05:40:37Z
- **Tasks:** 2
- **Files modified:** 3 (1 modified, 2 created)

## Accomplishments
- Schema extended with ideaKeywords, ideaSentence, and supportingSentences fields
- getIdeaCard query returns session's idea data reactively
- extractIdeaContent action uses Claude to analyze conversation with structured JSON output
- Edge case handled: phase >= 3 but ideaReady=false prevents premature merge
- JSON parsing handles markdown wrapping (follows claude.ts pattern)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend schema with idea fields** - `fba3226` (feat)
2. **Task 2: Create Convex ideas queries and extraction action** - `f5fde84` (feat)

## Files Created/Modified
- `convex/schema.ts` - Extended sessions table with ideaKeywords, ideaSentence, supportingSentences fields
- `convex/ideas.ts` - Query (getIdeaCard) and internal mutations (updateIdeaKeywords, setIdeaSentence) for idea data
- `convex/ideasActions.ts` - Action (extractIdeaContent) using Claude structured output to analyze conversation

## Decisions Made

**File split for runtime compatibility:**
- Initial attempt to put queries and actions in same file failed (Convex doesn't allow queries in Node.js runtime files)
- Split into ideas.ts (standard runtime for queries/mutations) and ideasActions.ts (Node.js runtime for Anthropic SDK)
- This is the correct Convex pattern for mixing standard queries with Node.js actions

**Internal API namespace:**
- Internal mutations must be called via `internal.*` namespace from actions (not `api.*`)
- Discovered when TypeScript errors showed mutations not available in api namespace

**Edge case prevention:**
- Added guard: only set ideaSentence when ideaReady=true AND ideaSentence exists AND supportingSentences exist
- Prevents premature merge animation when phase >= 3 but conversation lacks depth

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Split queries and actions into separate files**
- **Found during:** Task 2 (Convex deployment)
- **Issue:** Convex error "Only actions can be defined in Node.js" - queries/mutations can't be in "use node" file
- **Fix:** Created ideas.ts (queries/mutations in standard runtime) and ideasActions.ts (action in Node.js runtime)
- **Files modified:** convex/ideas.ts, convex/ideasActions.ts
- **Verification:** Convex deployment succeeded
- **Committed in:** f5fde84 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed incorrect API function names**
- **Found during:** Task 2 (TypeScript compilation)
- **Issue:** Called api.sessions.getSessionById and api.messages.getMessages but actual names are getSession and getSessionMessages
- **Fix:** Updated to use correct function names from existing API
- **Files modified:** convex/ideasActions.ts
- **Verification:** TypeScript compilation passed
- **Committed in:** f5fde84 (Task 2 commit)

**3. [Rule 1 - Bug] Fixed internal mutation namespace**
- **Found during:** Task 2 (TypeScript compilation)
- **Issue:** Called internal mutations via api.ideas.* but they're not exposed in public API
- **Fix:** Imported `internal` from `./_generated/api` and called via internal.ideas.*
- **Files modified:** convex/ideasActions.ts
- **Verification:** TypeScript compilation and Convex deployment succeeded
- **Committed in:** f5fde84 (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 blocking, 2 bugs)
**Impact on plan:** All fixes necessary for Convex runtime compatibility and correct API usage. File split is the correct Convex pattern. No scope creep.

## Issues Encountered
None - all compilation and deployment issues resolved through standard debugging.

## User Setup Required
None - uses existing ANTHROPIC_API_KEY environment variable already configured in Phase 1.

## Next Phase Readiness

**Ready for Plan 02b (Word Cloud Overlay):**
- Schema has ideaKeywords field for storing extracted keywords
- getIdeaCard query available to read keywords reactively
- extractIdeaContent action can be called manually or automatically
- Blob positions from 05-01 can be mapped to keyword areas

**For testing:**
- Can call extractIdeaContent action via Convex dashboard
- Can query getIdeaCard to see extracted data
- Keywords include area index (0-5) for mapping to blob zones

**No blockers.** Backend infrastructure ready for frontend word cloud rendering.

---
*Phase: 05-idea-card*
*Completed: 2026-02-02*
