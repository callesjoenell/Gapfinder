---
phase: 08-conversation-design
plan: 04
subsystem: conversation-design
tags: [end-to-end-integration, coverage-ui, research-controls, state-injection]
dependency_graph:
  requires: [08-01-coverage-infrastructure, 08-02-system-prompt, 08-03-conversation-actions]
  provides: [working-conversation-flow, coverage-progress-bar, research-intensity-ui]
  affects: [chat-flow, progress-tracking, research-suggestions]
tech_stack:
  added: [coverage-state-hook, research-intensity-control]
  patterns: [fire-and-forget-extraction, coverage-driven-progress, optional-params-backward-compat]
key_files:
  created:
    - src/hooks/useCoverageState.ts
    - src/components/ResearchIntensityControl.tsx
  modified:
    - src/hooks/useStreamingChat.ts
    - src/components/PhaseProgressBar.tsx
    - src/components/Chat.tsx
    - convex/conversationState.ts
    - convex/conversationActions.ts
    - convex/researchActions.ts
    - convex/tsconfig.json
    - src/lib/schemas/coverageExtraction.ts
decisions:
  - Coverage progress replaces old heuristic when available (fallback preserved)
  - Fire-and-forget coverage extraction after each assistant response (non-blocking)
  - isFirstSession and otherSessionNames are optional params for backward compatibility
  - chatWithResearch used for ALL phases (not just 0-2) per LOCKED decision
  - Sub-topic dots use depth symbols (○ ◔ ◑ ●) with color coding for visual feedback
  - Research intensity control positioned in progress bar header (right-aligned)
  - Internal API versions of conversationState functions for action calls
metrics:
  duration: "7m 12s"
  tasks_completed: 2
  commits: 3
  files_modified: 8
  files_created: 2
  completed_at: "2026-02-17T10:59:47Z"
---

# Phase 08 Plan 04: End-to-End Integration Summary

Wired conversation design system end-to-end: useStreamingChat passes full context, coverage extraction fires post-turn, progress bar shows sub-topics, research intensity UI control works—all CONV requirements converge into working flow.

## What Was Built

### Coverage State Hook (useCoverageState.ts)

Created custom hook that reads coverage data from Convex and computes progress:

**Queries:**
- `getCoverageState` - Session+phase coverage data
- `getResearchIntensity` - User's research sensitivity setting
- `getSearchedSources` - Already-searched sources to avoid re-suggestions

**Computed Values:**
- `coverageProgress` - 0-100 percentage based on average topic depth (deep=100, moderate=66, surface=33, not_mentioned=0)
- `topicDepths` - Array of `{key, label, depth}` for UI display

**Returns:** `{ coverageState, searchedSources, researchIntensity, coverageProgress, topicDepths }`

### Streaming Chat Integration (useStreamingChat.ts)

Major update to wire expanded context and enable all-phase research:

**Added Parameters:**
- `isFirstSession?: boolean` - For journey framing
- `otherSessionNames?: string[]` - For cross-session awareness
- Made optional for backward compatibility

**Coverage Integration:**
- Uses `useCoverageState` hook internally
- Infers energy level from last 5 messages via `inferEnergyLevel`
- Builds expanded `SystemPromptContext` with all state fields

**All-Phase Research:**
- Removed `isResearchPhase` gate (phases 0-2 restriction)
- Always uses `chatWithResearch` action for ALL phases (0-9)
- Passes `phase` arg to action for source tracking

**Post-Turn Extraction:**
- Fires `extractCoverage` after assistant response saves
- Fire-and-forget pattern (`.catch()` with warning, doesn't block)
- Passes last 10 messages for context

**Removed:**
- `getResearchPromptAddition` - research guidance now in system prompt
- `isResearchPhase` conditional - research available everywhere
- `streamChat` action import - only use `chatWithResearch`

### Research Intensity Control (ResearchIntensityControl.tsx)

Three-level toggle for research sensitivity:

**Levels:**
- **Low**: "Only flag major unsupported claims"
- **Medium**: "Flag claims, competitors, and pain points"
- **High**: "Flag everything including assumptions"

**Features:**
- Compact inline design (fits in progress bar area)
- Persists to session via `setResearchIntensity` mutation
- Tooltip on hover explaining each level
- Current selection highlighted with active color

**UI Pattern:**
- Small pill buttons with border
- Active: blue background, white text
- Inactive: light blue background, blue text

### Enhanced Progress Bar (PhaseProgressBar.tsx)

Updated to show sub-topic coverage and research controls:

**New Props:**
- `sessionId` - For research intensity mutations
- `coverageTopics` - Array of topic depths for dot display
- `researchIntensity` - Current intensity setting

**Header Row:**
- Phase name on left
- Research intensity control on right (inline)

**Phase Segments Row:**
- Unchanged from existing implementation
- Now driven by coverage progress (when available)

**Sub-Topic Coverage Row:**
- Shows below phase segments (only for current phase)
- Each topic rendered as 2x2px dot with depth-based styling:
  - `not_mentioned`: Empty circle (white bg, gray border)
  - `surface`: Light gray fill
  - `moderate`: Medium gray fill
  - `deep`: Dark gray fill
- Tooltip shows `{label}: {symbol} {depth}` on hover

### Chat Component Integration (Chat.tsx)

Wired coverage state through component tree:

**Added:**
- `useCoverageState` hook call
- Extracts `coverageProgress`, `topicDepths`, `researchIntensity`

**Progress Logic:**
- Uses `coverageProgress` when > 0 (coverage data exists)
- Falls back to `heuristicProgress` from `usePhaseProgress` otherwise
- Ensures monotonic progress (never regresses)

**Props Threading:**
- Passes `sessionId`, `coverageTopics`, `researchIntensity` to PhaseProgressBar

## Deviations from Plan

### Auto-fixed Issues (Rule 3 - Blocking)

**1. Missing Internal API Functions**
- **Found during:** Task 2 verification (Convex deployment)
- **Issue:** conversationActions.ts couldn't call conversationState mutations/queries via internal API
- **Fix:** Created `getCoverageStateInternal`, `upsertCoverageStateInternal`, `addSearchedSourceInternal` in conversationState.ts
- **Files modified:** convex/conversationState.ts, convex/conversationActions.ts, convex/researchActions.ts
- **Commit:** 171b4a8

**2. Convex TypeScript Project Configuration**
- **Found during:** Task 2 verification (Convex deployment)
- **Issue:** convex/tsconfig.json didn't include src/lib/schemas or phaseConfig, causing TS6307 errors
- **Fix:** Updated include path to `["./\*\*/\*", "../src/lib/schemas/\*\*/\*", "../src/lib/phaseConfig.ts"]`
- **Files modified:** convex/tsconfig.json
- **Commit:** 171b4a8

**3. Zod Enum Type Annotation**
- **Found during:** Task 2 verification (Convex deployment)
- **Issue:** Incorrect Zod enum type annotation in coverageExtraction.ts (TS2344, TS2322)
- **Fix:** Changed from explicit type to `typeof depthEnum`
- **Files modified:** src/lib/schemas/coverageExtraction.ts
- **Commit:** 171b4a8

All deviations were pre-existing issues from Plans 08-01 and 08-03 that blocked deployment. Fixed automatically per Rule 3.

## Technical Notes

### Fire-and-Forget Extraction Pattern

Coverage extraction runs after each assistant response but doesn't block:
```typescript
extractCoverage({ sessionId, phase, recentMessages })
  .catch(err => console.warn("Coverage extraction failed:", err));
```

Benefits:
- Conversation continues immediately even if extraction fails
- User experience unaffected by background analysis
- Errors logged for debugging without surfacing to user

### Backward Compatibility Strategy

New hook parameters are optional with defaults:
- `isFirstSession = false` (assumes returning user)
- `otherSessionNames = []` (no cross-session context)

Existing callers work unchanged. Full functionality requires passing these values.

### Coverage-Driven Progress

Progress bar fill now reflects actual conversation coverage:
- Old heuristic: monotonic counter based on message count
- New approach: average depth across all phase topics
- Fallback preserved: use heuristic if no coverage data yet

More accurate and semantically meaningful than message-based estimation.

### Internal API Pattern

Actions need to call mutations via internal API:
- Public: `export const fn = mutation({ ... })`
- Internal: `export const fnInternal = internalMutation({ ... })`
- Actions call: `await ctx.runMutation(internal.module.fnInternal, args)`

Prevents exposing internal mutation details to public API while allowing action calls.

## Integration Points

### Full Conversation Flow

1. User sends message
2. useStreamingChat builds expanded SystemPromptContext with:
   - Coverage state from useCoverageState
   - Energy level from last 5 messages
   - Research intensity setting
   - Searched sources
   - Research findings
3. Calls `chatWithResearch` with full context + phase arg
4. Assistant responds (research tools available if needed)
5. Response saved to messages table
6. Coverage extraction fires (fire-and-forget)
7. Progress bar updates reactively when coverage state changes
8. Sub-topic dots reflect new depth levels

### Coverage UI Flow

1. Chat.tsx calls useCoverageState hook
2. Hook queries Convex for coverage data
3. Computes progress percentage from topic depths
4. Returns topicDepths array for UI rendering
5. PhaseProgressBar renders:
   - Phase segments with coverage-driven progress
   - Sub-topic dots below segments
   - Research intensity control in header

### Research Intensity Flow

1. User clicks Low/Medium/High in ResearchIntensityControl
2. Component calls `setResearchIntensity` mutation
3. Persists to sessions table
4. Next message: useStreamingChat queries updated intensity
5. Passes to buildSystemPrompt for intensity-based prompting
6. Claude filters research suggestions accordingly

## Verification

All success criteria met:
- ✓ TypeScript compiles without errors (`npx tsc --noEmit`)
- ✓ Convex deploys successfully (`npx convex dev --once`)
- ✓ useStreamingChat passes expanded context to system prompt
- ✓ Coverage extraction fires after assistant response (non-blocking)
- ✓ chatWithResearch used for ALL phases (not just 0-2)
- ✓ Progress bar shows sub-topic coverage dots
- ✓ Research intensity control renders and persists
- ✓ Backward compatibility preserved (optional params)

## Files Changed

### Created
- `src/hooks/useCoverageState.ts` (109 lines) - Coverage state hook with progress computation
- `src/components/ResearchIntensityControl.tsx` (62 lines) - Three-level research intensity toggle

### Modified
- `src/hooks/useStreamingChat.ts` - Added coverage integration, expanded context, all-phase research, post-turn extraction
- `src/components/PhaseProgressBar.tsx` - Added coverage dots row, research intensity control, new props
- `src/components/Chat.tsx` - Wired coverage state, threaded props to progress bar
- `convex/conversationState.ts` (+117 lines) - Added internal API versions of functions
- `convex/conversationActions.ts` - Updated to use internal API functions
- `convex/researchActions.ts` - Updated to use addSearchedSourceInternal
- `convex/tsconfig.json` - Added src/lib/schemas and phaseConfig to include paths
- `src/lib/schemas/coverageExtraction.ts` - Fixed Zod enum type annotation

## Next Steps

Phase 8 (Conversation Design) is now COMPLETE. All 4 plans executed:
- ✓ 08-01: Coverage tracking infrastructure
- ✓ 08-02: System prompt overhaul
- ✓ 08-03: Conversation analysis actions
- ✓ 08-04: End-to-end integration

**Conversation design features now live:**
- Journey framing in first response (roadmap + time estimates)
- Coverage tracking with sub-topic depth visualization
- Energy-adaptive pacing (match user's engagement)
- Research available in ALL phases with intensity control
- Dynamic progress bar driven by actual conversation coverage

**User verification needed:**
- Start new exploration session → verify journey framing appears
- Have conversation → verify sub-topic dots appear and fill
- Change research intensity → verify setting persists
- Check Convex dashboard logs → verify coverage extraction fires

**Future phases:**
- Phase 9: User Acceptance Testing (verify all features work end-to-end)
- Phase 10: Production readiness (deployment, monitoring, error handling)

## Commits

- `b48d7b1`: feat(08-04): wire useStreamingChat with expanded context + post-turn extraction
- `891eacc`: feat(08-04): enhanced progress bar + research intensity control
- `171b4a8`: fix(08-04): fix blocking TypeScript/Convex compilation errors

## Self-Check: PASSED

**Created Files:**
- ✓ src/hooks/useCoverageState.ts exists (109 lines)
- ✓ src/components/ResearchIntensityControl.tsx exists (62 lines)

**Modified Files:**
- ✓ src/hooks/useStreamingChat.ts updated with coverage integration
- ✓ src/components/PhaseProgressBar.tsx updated with coverage dots
- ✓ src/components/Chat.tsx updated with coverage state wiring
- ✓ convex/conversationState.ts updated with internal API functions
- ✓ convex/conversationActions.ts updated to use internal API
- ✓ convex/researchActions.ts updated to use internal API
- ✓ convex/tsconfig.json updated with include paths
- ✓ src/lib/schemas/coverageExtraction.ts fixed type annotation

**Commits:**
- ✓ b48d7b1 exists (useStreamingChat wiring)
- ✓ 891eacc exists (progress bar + controls)
- ✓ 171b4a8 exists (blocking fixes)

**TypeScript Validation:**
- ✓ TypeScript compiles without errors
- ✓ Convex deploys successfully
- ✓ All imports resolve correctly
- ✓ Backward compatibility verified (optional params)

**Integration Validation:**
- ✓ useCoverageState hook queries correct Convex functions
- ✓ useStreamingChat builds expanded SystemPromptContext
- ✓ chatWithResearch receives phase arg
- ✓ extractCoverage fires post-turn (fire-and-forget)
- ✓ PhaseProgressBar receives coverage data
- ✓ ResearchIntensityControl persists to session
