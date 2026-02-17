---
phase: 08-conversation-design
plan: 01
subsystem: conversation-design
tags: [coverage-tracking, structured-outputs, convex-schema, zod-schemas]
dependency_graph:
  requires: [07-02-research-backend]
  provides: [coverage-infrastructure, extraction-schemas]
  affects: [08-02-coverage-extraction, 08-03-trigger-detection]
tech_stack:
  added: [zod-schemas, coverage-state-table]
  patterns: [depth-merging, structured-outputs, dynamic-schema-generation]
key_files:
  created:
    - convex/conversationState.ts
    - src/lib/schemas/coverageExtraction.ts
    - src/lib/schemas/researchTriggers.ts
    - src/lib/schemas/scoreUpdates.ts
  modified:
    - convex/schema.ts
    - src/lib/phaseConfig.ts
decisions:
  - Use v.any() for coverageState topics field since each phase has different topic keys
  - Depth merge logic uses ordering (deep > moderate > surface > not_mentioned)
  - Research intensity stored both on sessions table and coverageState for flexibility
  - Dynamic schema generation via createCoverageSchema based on phase coverageTopics
  - Intensity-based trigger detection (low/medium/high) filters noise
  - Rescoring schema enforces honest assessment with confidence levels
metrics:
  duration: "8m 8s"
  tasks_completed: 2
  commits: 2
  files_modified: 2
  files_created: 4
  completed_at: "2026-02-17T09:37:53Z"
---

# Phase 08 Plan 01: Coverage Tracking Infrastructure Summary

Coverage tracking data layer and structured output schemas for conversation analysis—enables implicit tracking of depth, energy signals, and research triggers.

## What Was Built

### Coverage State Schema (Convex)
Created `coverageState` table with session+phase indexing for persistent tracking of:
- Topic depth levels (not_mentioned/surface/moderate/deep) as flexible JSON
- Energy peaks array (deduplicated strings)
- Current focus tracking
- Completion readiness flag
- Missing topics array
- Research intensity preference
- Searched sources array

Added `researchIntensity` field to sessions table for user preference storage.

### CRUD Operations (conversationState.ts)
Implemented 6 functions for coverage state management:
- `getCoverageState`: Query by sessionId + phase
- `upsertCoverageState`: Merge-aware upsert with depth ordering
- `getSearchedSources`: Retrieve searched sources array
- `addSearchedSource`: Deduplicated source tracking
- `getResearchIntensity`: Get user's intensity preference from session
- `setResearchIntensity`: Update intensity setting

Depth merge logic ensures highest depth always wins (deep=3 > moderate=2 > surface=1 > not_mentioned=0).

### Phase Configuration Enrichment
Extended `PhaseConfig` interface with:
- `coverageTopics`: Array of {key, label, description} per phase
- `timeEstimate`: Journey framing per locked decision

Added 5-6 coverage topics to all 10 phases:
- **Phase 0**: life_situation, profession, hobbies, skills_others_pay_for, networks, transformations
- **Phase 1**: gap_identification, identity_lens, distribution_path, timing_factors, advantage_connection
- **Phase 2**: external_data_points, competitor_analysis, market_size, money_signals, assumption_challenges
- **Phase 3**: idea_statement, advantage_connection, target_audience, differentiation, ownership_signals
- **Phase 4**: customer_profile, gathering_places, struggling_moment, current_workaround, reach_plan
- **Phase 5**: customer_conversations, behavior_evidence, problem_cost, problem_frequency, urgency_ranking
- **Phase 6**: problem_solution_fit, why_this_solution, mvp_scope, technical_feasibility, advantage_leverage
- **Phase 7**: problem_urgency, solution_fit, market_size, competitive_moat, distribution, founder_fit
- **Phase 8**: weakness_plans, positioning, risk_mitigation, go_to_market, confidence_assessment
- **Phase 9**: next_actions, mvp_timeline, validation_plan, key_metric, final_reflection

Exported `getTopicKeys(phaseNumber)` helper for dynamic schema generation.

### Structured Output Schemas (Zod)

**1. Coverage Extraction (`coverageExtraction.ts`)**
- `createCoverageSchema(phaseNumber)`: Dynamically builds Zod schema from phase coverageTopics
- Returns: topicsDiscussed object, energyPeaks array, currentFocus string, depthSummary counts, readyForPhaseCompletion boolean, whatsMissing array
- `buildCoverageExtractionPrompt()`: Generates system prompt with depth definitions (surface/moderate/deep) and energy signal indicators

**2. Research Triggers (`researchTriggers.ts`)**
- `TriggerDetectionSchema`: Detects 4 trigger categories (market_claim, competitor_mention, pain_point, assumption)
- Each trigger includes: exact quote, suggested sources (max 3), research angle, priority level
- `buildTriggerDetectionPrompt(intensity, searchedSources)`: Intensity-based filtering
  - **Low**: Only explicit claims with no supporting evidence
  - **Medium**: Claims + competitors + clear pain points
  - **High**: Everything including implicit assumptions

**3. Score Updates (`scoreUpdates.ts`)**
- `RescoringSchema`: Updates 5 opportunity dimensions (market_fit, pain_urgency, timing, distribution, founder_fit)
- Enforces change explanations for EVERY dimension (including unchanged)
- Includes confidence level (low/medium/high) based on evidence quality
- `buildRescoringPrompt()`: Critical rules emphasize honesty over encouragement, scores CAN go down

All schemas use standard Zod (already in project via Convex) for Claude structured outputs.

## Deviations from Plan

None - plan executed exactly as written.

## Technical Notes

### Schema Design Decisions
- Used `v.any()` for topics field because each phase has different topic keys (not feasible to union all possibilities)
- Zod schemas at extraction layer enforce structure, Convex schema remains flexible
- Depth merge logic handles incremental updates gracefully (always keeps highest depth)

### Integration Points
- `createCoverageSchema` consumes `phaseConfig.coverageTopics` for dynamic validation
- `conversationState.ts` uses standard Convex runtime (queries/mutations), not actions
- Schemas export TypeScript types for frontend consumption

### Verification
All success criteria met:
- ✓ Coverage state can be stored per session per phase in Convex
- ✓ Each phase defines 5-6 trackable sub-topics with labels
- ✓ Structured output schemas ready for Claude extraction calls
- ✓ Research trigger schema supports 4 categories with intensity filtering
- ✓ Rescoring schema supports dimension-level changes with explanations and confidence

## Files Changed

### Created
- `convex/conversationState.ts` (204 lines) - Coverage CRUD operations
- `src/lib/schemas/coverageExtraction.ts` (85 lines) - Dynamic coverage schema
- `src/lib/schemas/researchTriggers.ts` (97 lines) - Trigger detection schema
- `src/lib/schemas/scoreUpdates.ts` (70 lines) - Rescoring schema

### Modified
- `convex/schema.ts` - Added coverageState table + researchIntensity to sessions
- `src/lib/phaseConfig.ts` - Added coverageTopics + timeEstimate to all phases

## Next Steps

This infrastructure enables Plans 02-04:
- **08-02**: Coverage extraction action (uses createCoverageSchema + upsertCoverageState)
- **08-03**: Trigger detection action (uses TriggerDetectionSchema + addSearchedSource)
- **08-04**: Rescoring action (uses RescoringSchema)

All data layer components ready for consumption.

## Commits

- `94b4d27`: feat(08-01): add coverage tracking infrastructure
- `a801200`: feat(08-01): add structured output Zod schemas for conversation analysis

## Self-Check: PASSED

**Created Files:**
- ✓ convex/conversationState.ts exists
- ✓ src/lib/schemas/coverageExtraction.ts exists
- ✓ src/lib/schemas/researchTriggers.ts exists
- ✓ src/lib/schemas/scoreUpdates.ts exists

**Commits:**
- ✓ 94b4d27 exists (coverage infrastructure)
- ✓ a801200 exists (Zod schemas)

**Schema Validation:**
- ✓ TypeScript compiles without errors
- ✓ coverageState table has by_session_phase index
- ✓ All 10 phases have coverageTopics defined
- ✓ Zod imports resolve correctly
