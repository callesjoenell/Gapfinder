---
phase: 10
plan: 1
subsystem: conversation-design
tags: [system-prompt, guardrails, behavioral-constraints]
requires: [phase-08-conversation-design]
provides: [guardrail-enforcement, phase-awareness]
affects: [systemPrompts.ts]
tech-stack:
  added: []
  patterns: [behavioral-guardrails, journey-awareness]
key-files:
  created: []
  modified: [src/lib/systemPrompts.ts]
decisions:
  - 6-guardrail framework covers premature exit, abandonment validation, therapy drift
  - Phase counter shows remaining phases to reinforce journey commitment
  - Remove therapist framing to clarify tool role vs coaching role
metrics:
  duration: 65s
  tasks: 1
  files: 1
  completed: 2026-02-18
---

# Phase 10 Plan 1: System Prompt Guardrails Summary

**One-liner:** Added 6 critical behavioral guardrails to prevent premature conversation exit, therapy drift, and phase abandonment, plus phase counter for journey awareness.

## Objective

Add behavioral guardrails to production system prompt that prevent GapFinder from prematurely ending conversations, drifting into therapy territory, or abandoning the phase framework.

## Tasks Completed

### Task 1: Add guardrails and fix role description
- **Status:** Complete
- **Commit:** bccce7a
- **Files modified:** src/lib/systemPrompts.ts

**Changes made:**

1. **Added CRITICAL GUARDRAILS section** with 6 rules:
   - Rule 1: Never suggest user "come back later" - work with what you have NOW
   - Rule 2: Never validate process abandonment - redirect excitement into next phase
   - Rule 3: Never spend more than 2 turns on self-doubt/existential questions
   - Rule 4: Explicitly state "You are NOT a therapist" - business discovery tool only
   - Rule 5: Remind of 10-phase commitment - early validation is starting point
   - Rule 6: Always push FORWARD - every response moves toward next phase

2. **Removed "therapist" from role description**
   - Changed "skilled coach or therapist" to "skilled coach"
   - Maintains coaching framing while avoiding therapy role confusion

3. **Added phase counter to Current Session**
   - Shows "You are in Phase X of 9. Y phases remain after this one."
   - Reinforces journey commitment and progress awareness
   - Makes explicit there's work remaining even when early validation feels complete

## Deviations from Plan

None - plan executed exactly as written.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| 6-guardrail framework | Covers three failure modes: premature exit, therapy drift, phase abandonment |
| Explicit "NOT a therapist" statement | Guardrail 4 directly contradicts previous role description - needed strong clarity |
| Phase counter in Current Session | Makes journey length explicit every turn, counteracts "I'm done" impulses |
| Remove therapist from role description | Consistency - can't say "not a therapist" while describing role as therapist-like |

## Technical Implementation

**System Prompt Structure:**
- CRITICAL GUARDRAILS section added after "Your Role" block
- Positioned before "Core Principle: USER OWNERSHIP" for high visibility
- Phase counter dynamically calculates remaining phases (9 - currentPhase)

**Verification:**
- All grep checks passed (CRITICAL GUARDRAILS exists, "therapist" removed, phase counter present)
- TypeScript compilation successful (only pre-existing unrelated errors)

## Impact

**Behavioral Changes:**
- GapFinder will actively resist conversation exit patterns
- Self-doubt spirals limited to 2 turns maximum
- Every response must push forward, not away from process
- Phases 4-9 framed as stress-testing, not optional extras

**User Experience:**
- Clearer role boundaries (coach vs therapist)
- Explicit journey progress tracking
- Reduced risk of abandoning process prematurely
- Stronger forward momentum in conversations

## Success Criteria Met

- [x] CRITICAL GUARDRAILS section added with all 6 rules
- [x] "therapist" removed from role description
- [x] Phase counter added to Current Session section
- [x] TypeScript compiles successfully
- [x] All verification greps passed
- [x] Changes committed atomically

## Self-Check

Verifying claimed changes exist:

**Files:**
- src/lib/systemPrompts.ts - Modified (verified in commit)

**Commits:**
- bccce7a - feat(10-01): add system prompt guardrails and phase counter

**Content verification:**
- FOUND: src/lib/systemPrompts.ts
- FOUND: commit bccce7a
- VERIFIED: CRITICAL GUARDRAILS section
- VERIFIED: therapist removed
- VERIFIED: phase counter

## Self-Check: PASSED

All claimed files, commits, and content changes verified successfully.
