---
phase: 07-research-tools
plan: 06
subsystem: ui
tags: [convex, react, hooks, context-analysis, research-suggestions]

# Dependency graph
requires:
  - phase: 07-05
    provides: ResearchPanel with checklist and keyword lookup UI
  - phase: 08-04
    provides: Coverage tracking and research intensity in Chat.tsx
provides:
  - Context-aware research suggestion analysis
  - Persistent research queue with Convex backend
  - Proactive suggestion chips in chat UI
  - Queue drawer for saved research items
affects: [future conversation improvements, research discoverability]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Client-side conversation analysis for suggestion generation"
    - "Pattern matching for research-worthy signals"
    - "Priority-based suggestion ranking"
    - "Queue persistence with status tracking"

key-files:
  created:
    - src/lib/researchSuggestions.ts
    - src/hooks/useResearchSuggestions.ts
    - src/components/research/SuggestionChips.tsx
    - src/components/research/ResearchQueue.tsx
    - convex/researchQueue.ts
  modified:
    - convex/schema.ts
    - src/components/Chat.tsx
    - src/components/research/index.ts

key-decisions:
  - "Client-side pattern matching for suggestions (not AI-based) for immediate responsiveness"
  - "Max 3 suggestions at once to avoid overwhelming UI"
  - "Phase 0-2 gating for suggestions aligns with research-heavy exploration phases"
  - "Queue persistence in Convex enables cross-session continuity"
  - "Trigger actions send messages to Claude rather than direct API calls"

patterns-established:
  - "Pattern: Context analysis hooks consume message history and return actionable suggestions"
  - "Pattern: Research triggers as pending state that Chat.tsx resolves via useEffect"
  - "Pattern: Queue items track status (pending/completed/dismissed) for lifecycle management"

requirements-completed: []

# Metrics
duration: 101m
completed: 2026-02-17
---

# Phase 07 Plan 06: Research Suggestions & Queue Summary

**Context-aware suggestion chips surface research opportunities based on conversation patterns, with persistent queue for save-for-later functionality**

## Performance

- **Duration:** 1h 41m
- **Started:** 2026-02-17T12:51:51Z
- **Completed:** 2026-02-17T14:32:50Z
- **Tasks:** 6 + 1 verification checkpoint
- **Files modified:** 9

## Accomplishments

- Pattern-based conversation analysis surfaces 8 suggestion types (pain validation, competitor check, keyword volume, 4 manual checklists, general search)
- Suggestion chips appear contextually above chat input with trigger/save/dismiss actions
- Research queue persists in Convex with pending/completed/dismissed status tracking
- Queue drawer accessible via badge showing saved item count
- Integration with Phase 8's coverage tracking and existing research panel flows

## Task Commits

Each task was committed atomically:

1. **Task 1: Create suggestion analysis logic** - `e0bf8b7` (feat)
2. **Task 2: Add research queue schema and mutations** - `433fedc` (feat)
3. **Task 3: Create useResearchSuggestions hook** - `dd6c89d` (feat)
4. **Task 4: Create SuggestionChips component** - `d64e896` (feat)
5. **Task 5: Create ResearchQueue drawer component** - `62fc1e8` (feat)
6. **Task 6: Integrate suggestions and queue into Chat** - `572fb8e` (feat)

## Files Created/Modified

- `src/lib/researchSuggestions.ts` - Pattern matching for pain signals, competitor mentions, keyword volume, manual checklists
- `src/hooks/useResearchSuggestions.ts` - Hook managing suggestion state, queue operations, trigger handling
- `src/components/research/SuggestionChips.tsx` - Chip UI with hover actions for save/dismiss
- `src/components/research/ResearchQueue.tsx` - Drawer showing saved items with do-now/remove actions
- `convex/researchQueue.ts` - Queue CRUD operations (add, get, mark completed, dismiss, count)
- `convex/schema.ts` - researchQueue table with sessionId, type, status indexes
- `src/components/Chat.tsx` - Integration with useResearchSuggestions, trigger handling, UI rendering
- `src/components/research/index.ts` - Exports for new components

## Decisions Made

**Client-side pattern matching over AI analysis:**
- Immediate responsiveness without API calls
- Predictable behavior based on known signals
- No additional cost for suggestion generation

**Max 3 suggestions at once:**
- Prevents overwhelming the UI
- Prioritizes most relevant suggestions
- Sorted by priority then timestamp

**Phase 0-2 gating:**
- Research phases are exploration (0-2)
- Evaluation phases (3-9) have different needs
- Aligns with session path distinction

**Trigger via message sending:**
- Leverages existing Claude conversation flow
- Auto-research sends "Please research this topic: [query]"
- Checklists send "show checklist for [type]"
- Keywords open KeywordLookup modal

**Queue status tracking:**
- pending: Not yet actioned
- completed: Triggered via do-now
- dismissed: User removed from queue
- Enables filtering and badge count calculation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Set iteration for TypeScript target**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** `Set<string>` iteration requires downlevelIteration flag or ES2015+ target
- **Fix:** Changed `[...new Set(array)]` to `Array.from(new Set(array))`
- **Files modified:** src/lib/researchSuggestions.ts
- **Verification:** TypeScript compilation succeeded
- **Committed in:** e0bf8b7 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** TypeScript compatibility fix required for compilation. No functional changes.

## Issues Encountered

None - plan executed as designed with one minor TypeScript compatibility fix.

## Integration Notes

**Works alongside Phase 8 changes:**
- Phase 8's `detectTriggers` is backend/server-side during Claude responses
- This plan's suggestions are client-side/UI-level based on message history
- Both use `api.sessions.getSessionResearchFindings` to avoid duplicate suggestions
- Phase 8's `useCoverageState` provides research intensity setting
- Chat.tsx already had ResearchPanel integration for checklists/keywords

**Verified integration points:**
- `api.sessions.getSessionResearchFindings` query exists and works
- ChecklistType import from existing checklistConfig.ts
- ResearchPanel handles both detected triggers (Phase 8) and user-triggered (this plan)
- Messages array from useStreamingChat provides conversation context

## User Setup Required

None - no external service configuration required. Research queue uses existing Convex deployment.

## Next Phase Readiness

Research tools phase (07) complete with 6 plans:
- 07-01: Research tools foundation (API wrappers)
- 07-02: Research action backend (chatWithResearch)
- 07-03: Manual research checklists
- 07-04: Keyword volume lookup
- 07-05: Research panel UI integration
- 07-06: Suggestion chips and queue (this plan)

All research functionality now discoverable and accessible:
- Automated research via Claude tool use
- Manual research via checklists
- Keyword volume via paid API
- Proactive suggestions surface opportunities
- Queue enables deferred research

Ready for next phase in v1 roadmap.

## Self-Check: PASSED

All created files verified:
- src/lib/researchSuggestions.ts ✓
- src/hooks/useResearchSuggestions.ts ✓
- src/components/research/SuggestionChips.tsx ✓
- src/components/research/ResearchQueue.tsx ✓
- convex/researchQueue.ts ✓

All commits verified:
- e0bf8b7 ✓
- 433fedc ✓
- dd6c89d ✓
- d64e896 ✓
- 62fc1e8 ✓
- 572fb8e ✓

---
*Phase: 07-research-tools*
*Completed: 2026-02-17*
