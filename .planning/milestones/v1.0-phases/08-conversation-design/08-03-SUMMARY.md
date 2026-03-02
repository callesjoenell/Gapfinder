---
phase: 08-conversation-design
plan: 03
subsystem: conversation-design
tags: [conversation-actions, coverage-extraction, trigger-detection, research-tracking]
dependency_graph:
  requires: [08-01-coverage-infrastructure]
  provides: [conversation-analysis-actions, all-phase-research]
  affects: [conversation-flow, research-suggestions]
tech_stack:
  added: [claude-structured-outputs, json-schema-validation]
  patterns: [graceful-degradation, intensity-filtering, source-tracking]
key_files:
  created:
    - convex/conversationActions.ts
  modified:
    - convex/researchActions.ts
decisions:
  - Use JSON mode with manual schema enforcement (not zodResponseFormat) for SDK compatibility
  - Track source:query pairs to prevent duplicate research suggestions
  - Both actions use Sonnet model for cost efficiency (not Opus)
  - Graceful error handling - extraction/trigger failures return null/empty array
  - Intensity-based filtering in detectTriggers (low mode shows only high priority)
  - Research works in all phases (0-9), not restricted to exploration
metrics:
  duration: "5m 29s"
  tasks_completed: 2
  commits: 2
  files_modified: 1
  files_created: 1
  completed_at: "2026-02-17T09:48:42Z"
---

# Phase 08 Plan 03: Conversation Analysis Actions Summary

Backend actions for post-turn coverage extraction and research trigger detection using Claude structured outputs—enables implicit phase tracking and proactive research across all phases.

## What Was Built

### Conversation Extraction Actions (conversationActions.ts)

Created new Convex action file with two core analysis functions:

**1. extractCoverage Action**
- Analyzes last 10 messages after every assistant response
- Extracts topic depth levels (not_mentioned/surface/moderate/deep) for phase-specific topics
- Identifies energy peaks (moments of high user engagement)
- Determines current focus and phase completion readiness
- Persists results to coverageState table via `upsertCoverageState` mutation
- Graceful degradation: returns null on failure without breaking conversation flow

Implementation details:
- Uses Claude Sonnet 4 for cost efficiency (background analysis, not main conversation)
- JSON mode with manual schema enforcement (SDK v0.71.2 compatibility)
- Zod validation of parsed results before persistence
- Merge-aware prompting includes current coverage state for continuity

**2. detectTriggers Action**
- Called with each user message to identify research opportunities
- Detects 4 trigger categories: market_claim, competitor_mention, pain_point, assumption
- Returns structured triggers with: quote, suggested sources (max 3), research angle, priority
- Filters based on intensity setting (low/medium/high)
- Prevents re-suggestion by checking searchedSources array
- Graceful degradation: returns empty array on failure

Intensity filtering logic:
- **Low**: Only high-priority triggers (explicit claims with no evidence)
- **Medium**: All high/medium priority (claims + competitors + pain points)
- **High**: All triggers including implicit assumptions

### Research Actions Update

Modified `chatWithResearch` to work across all phases:

**Added:**
- `phase` argument for source tracking per phase
- Source tracking after each successful tool execution
- Calls `addSearchedSource` mutation with `source:query` format
- Tracks which sources were searched to prevent duplicate suggestions

**Preserved:**
- Existing tool execution loop (max 5 iterations)
- Findings persistence to sessions table
- Sequential tool execution (respects API rate limits)
- Graceful error handling for tool failures

**No longer restricted to phases 0-2** - works in any phase (0-9) for research support.

## Deviations from Plan

None - plan executed exactly as written.

## Technical Notes

### SDK Compatibility
- Anthropic SDK v0.71.2 doesn't have `zodResponseFormat` helper
- Used JSON mode with manual schema enforcement instead
- Schema provided in system prompt, response parsed with regex for markdown wrapping
- Zod validation happens after parsing (same safety guarantee)

### Source Tracking Format
- Sources tracked as `source:query` pairs (e.g., "reddit:best project management tools")
- Prevents re-suggesting same search even if user revisits topic
- Stored in coverageState table per session+phase

### Model Selection
- Both actions use `claude-sonnet-4-20250514` (not Opus)
- Cost efficiency: these are background analysis calls, not main conversation
- Sonnet quality sufficient for extraction and detection tasks

### Error Handling Philosophy
- Coverage extraction failure → return null (caller can handle missing data)
- Trigger detection failure → return empty array (no suggestions)
- Neither failure breaks conversation flow
- Errors logged for debugging but don't surface to user

## Integration Points

### Coverage Extraction Flow
1. Frontend sends message → assistant responds
2. Call `extractCoverage` with last 10 messages
3. Action queries current coverage state
4. Claude analyzes with phase-specific schema
5. Results validated and persisted via `upsertCoverageState`
6. Frontend updates progress indicators

### Trigger Detection Flow
1. User sends message
2. Call `detectTriggers` with message + intensity + searched sources
3. Claude analyzes with intensity-specific prompt
4. Triggers filtered based on intensity setting
5. Frontend surfaces research suggestions in UI
6. If user accepts → call `chatWithResearch` with phase arg
7. Research action tracks source:query after execution

### All-Phase Research
- Research tools now available in phases 4-9 (not just 0-3)
- Phase argument ensures source tracking scoped correctly
- UI can show research suggestions contextually in any phase
- Intensity setting controls noise level across all phases

## Verification

All success criteria met:
- ✓ `npx tsc --noEmit` passes with no errors
- ✓ extractCoverage action persists to coverageState table
- ✓ detectTriggers returns filtered triggers based on intensity
- ✓ chatWithResearch accepts phase arg and tracks searched sources
- ✓ Both extraction actions use Sonnet model for cost efficiency
- ✓ Error handling doesn't break conversation flow (graceful degradation)

## Files Changed

### Created
- `convex/conversationActions.ts` (287 lines) - Coverage extraction + trigger detection actions

### Modified
- `convex/researchActions.ts` (+8 lines) - Added phase arg and source tracking

## Next Steps

These actions enable Plan 04 (Dynamic Rescoring):
- Coverage extraction provides evidence of depth increases
- Trigger detection identifies when new information surfaces
- Rescoring can use coverage state + triggers to adjust opportunity scores

Frontend integration (likely Phase 8 Wave 3 or Phase 9):
- Wire extractCoverage after each assistant response
- Wire detectTriggers on user message submission
- Surface research suggestions in chat UI
- Update progress indicators from coverage state

## Commits

- `a770e30`: feat(08-03): add conversation extraction actions (coverage + triggers)
- `64db2aa`: feat(08-03): update researchActions for all-phase support + source tracking

## Self-Check: PASSED

**Created Files:**
- ✓ convex/conversationActions.ts exists (287 lines)

**Modified Files:**
- ✓ convex/researchActions.ts updated with phase arg and source tracking

**Commits:**
- ✓ a770e30 exists (conversation extraction actions)
- ✓ 64db2aa exists (researchActions updates)

**Verification:**
- ✓ TypeScript compiles without errors
- ✓ Both actions export correct types
- ✓ Internal mutations imported correctly
- ✓ Zod schemas imported from src/lib successfully
