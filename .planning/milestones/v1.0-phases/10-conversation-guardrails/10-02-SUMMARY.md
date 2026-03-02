---
phase: 10
plan: 2
subsystem: simulation-testing
tags: [simulation, guardrails, testing-infrastructure, conversation-quality]
dependency_graph:
  requires: [10-01-system-prompt-guardrails]
  provides: [hardened-simulation-script]
  affects: [e2e-testing, conversation-quality-validation]
tech_stack:
  added: []
  patterns: [phase-specific-prompts, circuit-breakers, hard-phase-transitions]
key_files:
  created: []
  modified: [scripts/simulate-chat.mjs]
decisions:
  - Phase-specific stall prompts provide contextual substance vs generic recovery
  - Two-tier stall detection: inject prompt at 2, force transition at 3
  - Meta-conversation circuit breakers in both Marcus and GapFinder personas
  - Hard phase transitions prevent infinite loops when conversation exhausted
metrics:
  duration: 2m 18s
  tasks_completed: 2
  files_modified: 1
  commits: 2
  completed_at: 2026-02-18
---

# Phase 10 Plan 2: Simulation Hardening Summary

**One-liner:** Multi-layered stall prevention via phase-specific prompts, meta-conversation circuit breakers, and hard phase transitions

## Objective

Fix the E2E simulation script to complete all 10 phases without devolving into meta-conversation loops or stalling indefinitely. Test infrastructure changes only - no production code.

## Tasks Completed

### Task 1: Phase-Specific Stall Prompts
**Commit:** cd4c3c3

Replaced generic "comes back energized" stall recovery message with `PHASE_STALL_PROMPTS` map containing contextually relevant prompts for all 10 phases. Each prompt provides conversation substance specific to phase goals:

- Phase 0: Reflecting on daily routines, helping neighbor with tech
- Phase 1: Observing patterns at community center
- Phase 2: Informal research with caregivers and directors
- Phase 3: Thinking about positioning and framing
- Phase 4: Identifying customer segments
- Phase 5: Processing mixed signals from conversations
- Phase 6: Solution design tradeoffs (SMS vs app)
- Phase 7: Honest scoring concerns (market size vs founder fit)
- Phase 8: Customer acquisition weaknesses and assets
- Phase 9: Launch strategy debate (local pilot vs online)

**Verification:**
```bash
grep -n "PHASE_STALL_PROMPTS" scripts/simulate-chat.mjs
# 733:const PHASE_STALL_PROMPTS = {
# 2140:        const skipMsg = PHASE_STALL_PROMPTS[currentPhase] || PHASE_STALL_PROMPTS[0];

grep -n "comes back energized" scripts/simulate-chat.mjs
# (no results - generic message removed)
```

### Task 2: Meta-Conversation Detection & Circuit Breakers
**Commit:** cfc60d4

**Change 1: Marcus Persona Meta-Conversation Rules**

Added 4 behavioral rules to prevent meta-discussion:
- NEVER discuss nature of conversation itself or performative insight
- NEVER use phrases like "this process", "our conversation", "what we're doing here"
- If conversation feels abstract/meta, steer to concrete questions (people, numbers, dates)
- Stay in character as Marcus with real business idea

**Change 2: GapFinder Circuit Breaker**

Added guardrail #6 to system prompt:
> **CIRCUIT BREAKER:** If you find yourself discussing meta-topics (the nature of discovery, whether conversations create real change, performative insight, the limits of AI guidance), STOP IMMEDIATELY. Instead, ask a concrete question: "What's your revenue target for month 1?" or "Who specifically is your next customer?" or "What's the one thing you'd build first?"

**Change 3: Hard Phase Transitions**

Tightened stall detection threshold:
- `stallCount >= 2`: Inject phase-specific stall prompt (existing behavior)
- `stallCount >= 3`: Force hard phase transition - conversation has exhausted current phase

Hard transition logic:
```javascript
if (stallCount >= 3) {
  console.log(`[HARD PHASE TRANSITION] Forcing advancement from Phase ${currentPhase} to Phase ${currentPhase + 1} due to stall`);
  await handlePhaseTransition(currentPhase + 1);
  stallCount = 0;
}
```

**Verification:**
```bash
grep "NEVER discuss the nature" scripts/simulate-chat.mjs
# 837:- NEVER discuss the nature of the conversation itself...

grep "CIRCUIT BREAKER" scripts/simulate-chat.mjs
# 1024:6. **CIRCUIT BREAKER:** If you find yourself discussing meta-topics...

grep "HARD PHASE TRANSITION" scripts/simulate-chat.mjs
# 2145:        console.log(`\n!! [HARD PHASE TRANSITION] Forcing advancement...
```

## Deviations from Plan

None - plan executed exactly as written.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Phase-specific prompts vs generic recovery | Generic "energized" message provides no conversation substance; phase-specific prompts give concrete context to work with |
| Two-tier stall detection (2 = prompt, 3 = transition) | Balances recovery attempts vs preventing infinite loops; gives conversation two chances before forcing advancement |
| Circuit breakers in BOTH personas | Defense in depth - both Marcus and GapFinder have explicit instructions to avoid meta-conversation |
| Hard transitions vs ending simulation | Better to advance to next phase than fail entire simulation; phase exhaustion is a legitimate completion signal |

## Testing Notes

Changes are test infrastructure only - no production code modified. Next simulation run will validate:
- Phase-specific prompts provide better stall recovery
- Circuit breakers prevent meta-conversation spirals
- Hard transitions complete all 10 phases without manual intervention

Expected behavior:
- Stall count 1: Continue normally
- Stall count 2: Inject phase-specific prompt, continue same phase
- Stall count 3: Force phase transition (conversation exhausted)

## Files Modified

**scripts/simulate-chat.mjs** (1 file)
- Added `PHASE_STALL_PROMPTS` map (lines 733-746)
- Updated Marcus behavioral rules (lines 837-840)
- Added GapFinder circuit breaker (line 1024)
- Enhanced stall detection logic (lines 2138-2162)

## Self-Check: PASSED

**Commits exist:**
```bash
git log --oneline | grep -q "cd4c3c3" && echo "FOUND: cd4c3c3" || echo "MISSING: cd4c3c3"
# FOUND: cd4c3c3

git log --oneline | grep -q "cfc60d4" && echo "FOUND: cfc60d4" || echo "MISSING: cfc60d4"
# FOUND: cfc60d4
```

**Modified file exists:**
```bash
[ -f "scripts/simulate-chat.mjs" ] && echo "FOUND: scripts/simulate-chat.mjs" || echo "MISSING: scripts/simulate-chat.mjs"
# FOUND: scripts/simulate-chat.mjs
```

**Verification commands all pass:**
- PHASE_STALL_PROMPTS exists and is used
- Generic "comes back energized" message removed
- All three circuit breaker verifications pass
