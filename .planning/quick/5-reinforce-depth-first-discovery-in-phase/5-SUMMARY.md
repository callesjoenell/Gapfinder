---
phase: quick-5
plan: 01
type: summary
completed: 2026-02-22
duration: 89s
tasks_completed: 1
tasks_total: 2
subsystem: Conversation Design
tags: [phase-instructions, depth-first-discovery, anti-patterns]
dependency_graph:
  requires: [system-prompt-depth-first-rules]
  provides: [phase-specific-depth-first-reinforcement]
  affects: [phase-3-idea, phase-4-customers, phase-5-problem, phase-7-score]
tech_stack:
  added: []
  patterns: [depth-first-discovery, socratic-probing, sequential-assessment]
key_files:
  created: []
  modified: [src/lib/phaseConfig.ts]
decisions:
  - Added depth-first blocks BEFORE the content they guard against (not at the end)
  - Phase-specific anti-patterns identified from real usage patterns
  - Sequential scoring in Phase 7 prevents checklist rushing
commits:
  - hash: a807a46
    message: "feat(quick-5): add depth-first reinforcement to phases 3, 4, 5, 7"
    files: [src/lib/phaseConfig.ts]
---

# Quick Task 5: Reinforce Depth-First Discovery in Phases 3, 4, 5, 7

**One-liner:** Added explicit DEPTH-FIRST reinforcement blocks to four phase instructions to prevent rushing, listing, premature pattern-finding, and checklist scoring.

## What Was Built

Enhanced phase-specific instructions in `phaseConfig.ts` with depth-first discovery reinforcement for phases 3, 4, 5, and 7. Each phase now has a clearly labeled DEPTH-FIRST block positioned strategically BEFORE the content it guards against.

### Changes Made

**Phase 3 (Your Idea) - EXCAVATE BEFORE FORMALIZING:**
- Probe what user ACTUALLY means with Socratic questions
- Drill into emotional connection: "Why does THIS matter to you personally?"
- Challenge vague language: "help people" → "which people, in what moment, feeling what?"
- Only formalize AFTER Socratic probing reaches specificity
- **Prevents:** Rushing to idea statement format before understanding the raw idea

**Phase 4 (Customers) - ONE CUSTOMER TYPE AT A TIME:**
- When user mentions multiple types, pick first one and explore to emotional depth
- Probe: day-to-day, trigger moments, what they've tried, real person examples
- Move to next type only after first is fully explored
- Frameworks are for going DEEPER on one type, not checklists across all types
- **Prevents:** Listing multiple customer types without depth on any

**Phase 5 (Problem) - EACH CONVERSATION BEFORE PATTERNS:**
- Debrief each conversation individually first: "Let's start with [Person 1]"
- Probe each to emotional depth: surprises, body language, exact words
- Only AFTER all conversations are unpacked: "Now looking across all of these..."
- Pattern-finding happens later in DEBRIEF ANALYSIS QUESTIONS
- **Prevents:** Jumping to cross-conversation patterns before individual depth

**Phase 7 (Score) - ONE DIMENSION AT A TIME:**
- Present one dimension, get score, CHALLENGE reasoning before accepting
- "You said 4 on need intensity — what evidence supports that? Could it be a 3?"
- Reveal next dimension only after current one is settled
- **Prevents:** Presenting all 6 dimensions at once, checklist rushing

## Deviations from Plan

None - plan executed exactly as written.

## Technical Implementation

### File Modified
- `src/lib/phaseConfig.ts` (33 insertions, 3 deletions)
  - Phase 3 instructions: Added DEPTH-FIRST block after APPROACH, before IDEA STATEMENT FORMAT
  - Phase 4 instructions: Added DEPTH-FIRST block after goal statement, before APPROACH section
  - Phase 5 instructions: Restructured OPENING section with DEPTH-FIRST block replacing premature pattern line
  - Phase 7 instructions: Added DEPTH-FIRST block after goal statement, before SCORING DIMENSIONS

### Verification Results
- TypeScript compilation: ✅ No errors (`npx tsc --noEmit`)
- DEPTH-FIRST count: ✅ 4 blocks present (one per phase: 3, 4, 5, 7)
- Line positions: 259 (Phase 3), 317 (Phase 4), 383 (Phase 5), 512 (Phase 7)

## Task 2 Status

**SKIPPED per orchestrator instructions.** Task 2 (Deploy to Vercel production) will be handled separately by the orchestrator after execution completes.

## Key Decisions

1. **Placement strategy:** Inserted DEPTH-FIRST blocks BEFORE the content they guard against, not at the end where they might be ignored or forgotten during the flow of conversation.

2. **Anti-pattern identification:** Each block addresses a specific observed anti-pattern from the system prompt's Depth-First Discovery rules:
   - Phase 3: Formalizing before excavating
   - Phase 4: Jumping between customer types
   - Phase 5: Pattern-seeking before individual depth
   - Phase 7: Checklist mentality in scoring

3. **Sequential scoring in Phase 7:** Explicitly instructed to reveal one dimension at a time and challenge reasoning before moving to the next, preventing users from quickly rating all dimensions without honest reflection.

## Impact

### User Experience
- **Slower, deeper conversations:** Users will be held longer on individual topics, customer types, conversations, and scoring dimensions
- **Better insight quality:** Socratic probing uncovers specificity that generic questions miss
- **Reduced premature optimization:** Users can't rush to patterns, comparisons, or formal structures before doing the depth work

### System Behavior
- **Reinforces system prompt:** Phase-specific instructions now explicitly echo and reinforce the 5 Depth-First Discovery rules from the main system prompt
- **Prevents Claude from defaulting to efficiency:** The depth-first blocks act as circuit breakers against Claude's natural tendency to categorize, summarize, and move on

### Coverage Tracking
- These changes improve the quality of coverage extraction by ensuring conversations reach emotional depth before topic transitions
- Better depth = more accurate "deep" coverage marks vs "surface" marks

## Self-Check

### Created Files
None (this was a modification-only task)

### Modified Files
✅ FOUND: /Users/callesjoenell/Documents/GapFinder/src/lib/phaseConfig.ts
- Contains 4 DEPTH-FIRST blocks at expected line positions
- TypeScript compiles without errors
- All planned changes implemented

### Commits
✅ FOUND: a807a46 - "feat(quick-5): add depth-first reinforcement to phases 3, 4, 5, 7"

## Self-Check: PASSED

All modified files exist, TypeScript compiles cleanly, commit created successfully, and all 4 DEPTH-FIRST reinforcement blocks are present in the correct phases.

## Metrics

- **Duration:** 89 seconds (1m 29s)
- **Tasks Completed:** 1 of 2 (Task 2 skipped per orchestrator)
- **Files Modified:** 1 (src/lib/phaseConfig.ts)
- **Lines Changed:** +33/-3
- **DEPTH-FIRST Blocks Added:** 4 (phases 3, 4, 5, 7)
- **Commits:** 1 (a807a46)

## Next Steps

The orchestrator will handle deployment to Vercel production separately. The depth-first reinforcement is ready to ship once deployed.
