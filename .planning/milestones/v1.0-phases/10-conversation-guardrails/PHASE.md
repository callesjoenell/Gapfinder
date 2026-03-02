# Phase 10: Conversation Guardrails (v1.5)

**Goal:** Prevent GapFinder from prematurely ending conversations, drifting into therapy/life-coaching territory, or abandoning the phase framework mid-process.

**Origin:** E2E simulation (Phase 9) revealed that GapFinder will tell users to "go build independently" and exit the conversation after Phase 2 validation -- skipping Phases 3-9 entirely. The simulation's Haiku instance did this despite having phase instructions available. This is a real risk with human users too: a user who gets early validation (e.g., "my friends say they'd pay") could be sent away before doing the rigorous evaluation work (Customers, Problem Validation, Solution Design, Scoring, Refinement, Launch Plan) that makes the difference between a daydream and a real business.

**Why this matters for humans (not just AI tests):**

1. **Premature exit is the #1 failure mode.** When a founder feels validated early, the natural instinct (both human and AI) is to say "go do it." But the whole point of Phases 4-9 is to stress-test that validation. GapFinder needs guardrails to keep working through the full process.

2. **Therapy drift wastes time.** Without boundaries, GapFinder can spend turns exploring whether the user is "really ready" or "what's holding them back" instead of pushing toward business clarity. The production prompt says "coach or therapist" -- the therapist part should be removed.

3. **Phase awareness prevents loops.** GapFinder needs to know it's on a 10-phase journey and that its job isn't done until Phase 9. Without this, it pattern-matches to generic startup advice ("go validate") instead of following the structured process.

**Dependencies:** Phase 8 (Conversation Design -- the system prompt overhaul)

**Emotional Purpose:** Users feel "This process has structure and won't let me off the hook too easily" -- the rigor creates trust that the outcome will be meaningful.

---

## Plan 10-01: System Prompt Guardrails

**What:** Add behavioral guardrails to the production system prompt (`src/lib/systemPrompts.ts`) that prevent premature conversation exit and scope drift.

### Changes to `systemPrompts.ts`

**1. Add CRITICAL GUARDRAILS section (after "Your Role", before "Core Principle")**

```
## CRITICAL GUARDRAILS

1. **NEVER suggest the user "come back later," "go build and return," or "take some time to think."** Work with what you have NOW. If a direction stalls, pivot to unexplored territory -- don't send them away.

2. **NEVER validate a user abandoning the process.** If a user says "I think I'm done" or "I should just go build it," acknowledge the energy (ONE sentence max), then redirect: "That excitement is great -- but we haven't stress-tested this yet. Let's make sure it holds up. [next phase question]."

3. **NEVER spend more than 2 turns on self-doubt, existential questions, or life-coaching territory.** If the user spirals into "am I really cut out for this?" or "what if I fail?", cut it short: "That's worth noting. But let's keep moving -- tell me about [specific unexplored area]."

4. **You are NOT a therapist.** You are a business discovery tool. Your job is to help users find viable ideas and validate them rigorously. Do not explore feelings, relationships, or personal growth beyond what directly informs the business decision.

5. **You have 10 phases of work to deliver.** Even when an idea feels validated early, your job is NOT done. Phases 4-9 exist to stress-test, refine, and operationalize what Phases 0-3 discovered. Early validation is a starting point, not an endpoint.

6. **Always push FORWARD.** Every response should move toward the next phase, not away from the process. If one direction dies, immediately open another.
```

**2. Change "coach or therapist" to just "coach" in the Role section**

Line 84: `You operate like a skilled coach applying evidence-based discovery methods:`

**3. Add phase-awareness to journey framing**

When building the journey framing, include a reminder of how many phases remain:

```
You are in Phase ${currentPhase} of 9. ${9 - currentPhase} phases remain after this one.
```

### Rationale

- Guardrails 1-3 address the exact failure mode seen in simulation: GapFinder ending the conversation at Phase 2
- Guardrail 4 removes "therapist" framing that invites scope drift
- Guardrail 5 gives GapFinder explicit awareness that early validation != job done
- Guardrail 6 ensures forward momentum even when user energy dips

### What NOT to change

- Phase instructions (3-9) are already well-written in `phaseConfig.ts` -- the problem wasn't missing content, it was GapFinder never reaching those phases
- Coverage tracking system -- works correctly
- Research tools integration -- worked well in simulation
- Need Depth Ladder -- correctly applied in Phases 0-2

---

## Plan 10-02: Simulation Hardening (test-only)

**What:** Fix the simulation script (`scripts/simulate-chat.mjs`) so it can complete all 10 phases. These changes are test infrastructure only, not production system changes.

### Changes

1. **Replace generic stall injection with phase-specific prompts.** Instead of "Marcus comes back energized" (which gives zero substance), inject material relevant to the current phase:
   - Phase 3 stall: "Marcus has been thinking about positioning. He's unsure whether to frame ELDERS as a 'community' or a 'curated experience.'"
   - Phase 5 stall: "Marcus talked to 3 people. One was enthusiastic, one was skeptical, one asked when they could sign up."
   - Phase 7 stall: "Marcus wants to score the idea honestly. He's worried about market size but confident about founder fit."

2. **Add meta-conversation detection to Marcus persona.** Add to behavioral rules: "NEVER discuss the nature of the conversation itself, whether insight is performative, or the limits of discovery processes. If the conversation feels abstract, steer back to concrete business questions."

3. **Add circuit breaker to GapFinder simulation prompt.** Add: "If you find yourself discussing meta-topics (the nature of discovery, whether conversations create change, performative insight), STOP. Ask a concrete question: 'What's your revenue this week?' or 'Who specifically is your next customer?'"

4. **Tighten stall detection.** Instead of stallCount >= 2 triggering a generic restart, treat stallCount >= 3 as a hard phase transition (the conversation has exhausted this phase).

---

## Success Criteria

1. Production system prompt includes guardrails that prevent "go build" exits before Phase 9
2. "Therapist" removed from role description
3. Phase counter visible in system prompt so GapFinder knows where it is in the journey
4. Simulation can complete all 10 phases without meta-conversation loops (test-only verification)

## Estimated Scope

- 10-01 (production guardrails): ~30 min, touches only `systemPrompts.ts`
- 10-02 (simulation hardening): ~1 hour, touches only `scripts/simulate-chat.mjs`
