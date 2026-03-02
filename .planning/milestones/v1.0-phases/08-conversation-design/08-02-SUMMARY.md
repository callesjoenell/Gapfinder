---
phase: 08-conversation-design
plan: 02
subsystem: conversation-design
tags: [system-prompt, journey-framing, pacing, coverage-map, research-intensity]
dependency_graph:
  requires: [08-01-coverage-infrastructure, 07-02-research-backend]
  provides: [dynamic-system-prompt, conversation-state-injection]
  affects: [08-03-trigger-detection, 08-04-rescoring]
tech_stack:
  added: []
  patterns: [state-injection, backward-compatibility, role-prompting]
key_files:
  created:
    - src/lib/conversationState.ts
  modified:
    - src/lib/systemPrompts.ts
decisions:
  - New fields in SystemPromptContext are optional with defaults for backward compatibility
  - Journey framing differs between first session (full roadmap) and returning user (recap)
  - Coverage map uses symbols (○◔◑●) for quick depth scanning
  - Pacing guidance adapts to 3 energy levels (high/moderate/low) based on message patterns
  - Research guidance embedded in ALL phases, not separate addition
  - Max 2 questions per response enforced in role definition
  - Celebrate + bridge pattern documented in phase completion section
  - Dynamic rescoring emphasizes honesty over encouragement
metrics:
  duration: "4m 11s"
  tasks_completed: 2
  commits: 2
  files_modified: 1
  files_created: 1
  completed_at: "2026-02-17T09:47:24Z"
---

# Phase 08 Plan 02: System Prompt Overhaul Summary

Dynamic system prompt with journey framing, conversation pacing, coverage maps, and research intensity control—transforms static prompting into state-aware conversation orchestration.

## What Was Built

### Conversation State Helper Module (conversationState.ts)

Created pure helper functions that build system prompt sections from conversation state:

**1. ConversationContext Interface**
Defines expanded context with 11 fields:
- Session state: `isFirstSession`, `isNewSession`, `otherSessionNames`
- Coverage tracking: `coverageState` (topic → depth mapping)
- Energy detection: `energyLevel` (high/moderate/low)
- Research control: `researchIntensity`, `searchedSources`, `researchFindings`

**2. buildJourneyFraming(context)** - Journey roadmap injection
- **First session + first message**: Full welcome + complete roadmap for path (4 phases exploration, 6 phases evaluation)
- **New session (returning user)**: Quick recap + other sessions context + roadmap
- **Continuing session**: Brief phase reminder + cross-session awareness
- Includes time estimates per phase (e.g., "15-20 min")
- Natural phase naming: "We're starting at Phase 0: Know Yourself"

**3. buildCoverageMap(phaseNumber, coverageState)** - Topic depth visualization
- Lists each phase topic with depth symbol and label:
  - ○ not explored
  - ◔ surface mention
  - ◑ moderate depth
  - ● deep exploration
- Shows coverage summary: "Coverage: 3/6 topics at moderate+ depth"
- Lists missing topics: "Still to explore: Hobbies, Networks"
- Returns "No coverage data yet" if null (conversation start)

**4. buildPacingGuidance(energyLevel)** - Energy-adaptive response rules
- **High energy**: Match their energy, explore depth, 1-2 questions max, mirror message length, use reflections more than questions
- **Moderate**: Moderate responses, gentle topic shifts if depleted, 1 open question
- **Low**: Brief focused responses, summarize + bridge, 1 direct question, match brevity

**5. buildResearchIntensityGuidance(intensity, searchedSources)** - Trigger sensitivity control
- **Low**: Only flag major unsupported claims
- **Medium**: Flag claims + competitor mentions + clear pain points
- **High**: Flag everything including implicit assumptions
- Appends searched sources to avoid re-suggesting
- Enforces "Always ASK first, never auto-trigger"
- Limits suggestions to 2-3 options

**6. buildResearchReferenceGuidance(findings)** - Past research integration
- Lists what's been searched: "Reddit: 'keyword tools', HN: 'SEO startups'"
- Instructs: "Reference inline, quote key points AND point to Research panel"
- Enforces honesty: "Be honest when results are empty. Don't interpret empty results."

**7. inferEnergyLevel(recentMessages)** - Simple heuristic energy detection
- Filters last 5 user messages
- Calculates average message length: <50 chars = low, 50-200 = moderate, >200 = high
- Detects energy dropping: last 2 messages shorter than previous → low
- Returns "moderate" default if no messages

### System Prompt Overhaul (systemPrompts.ts)

**Interface Changes**
- Extended `SystemPromptContext` with 8 optional fields (backward compatible)
- All new fields have sensible defaults: `isFirstSession = false`, `energyLevel = "moderate"`, etc.
- Existing callers work unchanged: `buildSystemPrompt({ currentPhase, summaries, sessionPath })`

**Prompt Structure (12 Sections)**

1. **Role Definition** (enhanced)
   - Added: "You name phases naturally in conversation"
   - Added: "Response length mirrors user's message length"
   - Added: "Maximum 2 questions per response"
   - Kept: Core ownership rules, FORBIDDEN/REQUIRED blocks

2. **Current Session** (NEW)
   - Path with description (exploration vs evaluation)
   - Phase number and name
   - First-time vs returning user context
   - Other active sessions count

3. **Journey Map** (NEW)
   - Calls `buildJourneyFraming(context)` with full ConversationContext
   - Drives CONV-01 journey framing requirement
   - Adapts based on session state

4. **Past Context** (kept from existing)
   - `buildPastContext(summaries)` for completed phase summaries

5. **Coverage Map** (NEW)
   - Calls `buildCoverageMap(phase, coverageState)`
   - Shows topic-level depth with symbols
   - States depth requirement: "at least 3 topics at 'deep' level (●), all others at 'moderate' (◑) minimum"

6. **Conversation Pacing** (NEW)
   - Shows current energy level
   - Calls `buildPacingGuidance(energyLevel)`
   - Emphasizes: "Always ride user's energy. When energy cools: summarize + bridge."

7. **Research Guidance** (NEW - replaces separate researchPrompt.ts)
   - Calls `buildResearchIntensityGuidance(intensity, searchedSources)`
   - Calls `buildResearchReferenceGuidance(findings)`
   - States: "Research available in ALL phases, not just the research phase"
   - Four trigger categories: market claim, competitor mention, pain point, assumption
   - Enforces ask-before-research pattern with examples

8. **Dynamic Rescoring** (NEW)
   - Rules for when to rescore: new insights, research findings
   - Format: "Announce every score change with WHY"
   - Honesty emphasis: "Scores CAN go down — be honest, not encouraging"
   - Confidence levels required: low/medium/high
   - Exploration-phase scoring: rank emerging opportunities, maintain list

9. **Current Phase Instructions** (kept from existing)
   - Phase-specific instructions from phaseConfig

10. **Phase Completion** (enhanced)
    - Kept criteria from phaseConfig
    - Added celebrate + bridge pattern:
      - CELEBRATE: Acknowledge specific progress (not generic praise)
      - BRIDGE: Naturally lead to next phase purpose
    - Added: "When user disagrees with a score, discuss reasoning and adjust"

11. **Scientific Frameworks** (kept from existing)
    - MILES, Ikigai, Mom Test, Switch Interview, Phenomenological Interviewing

12. **Tone and Response Format** (enhanced)
    - Added: "Match user's message length"
    - Added: "Use reflections more than questions when energy is high"
    - Added: "Weave research suggestions naturally"

**Backward Compatibility**
- Optional fields with defaults ensure existing callers work
- No breaking changes to function signature
- TypeScript compilation passes cleanly

## Deviations from Plan

None - plan executed exactly as written.

## Technical Notes

### Design Decisions

**State Injection Pattern**
- Helper functions are pure (no side effects)
- All state transformation happens in conversationState.ts
- buildSystemPrompt remains the orchestrator, calls helpers
- Separation enables testing helpers in isolation

**Backward Compatibility Strategy**
- All new fields optional with sensible defaults
- Default values chosen based on common case: moderate energy, medium intensity, no coverage yet
- This allows gradual adoption: callers can add fields as they implement tracking

**Energy Detection Simplicity**
- Heuristic is intentionally simple (message length based)
- Plan 03 will add structured extraction for more accurate assessment
- Simple heuristic good enough for initial pacing guidance

**Coverage Map Symbols**
- Unicode circle symbols (○◔◑●) chosen for:
  - Visual clarity in plain text
  - Works in all contexts (terminal, markdown, UI)
  - Intuitive progression from empty to filled

### Integration Points

- `conversationState.ts` imports from `phaseConfig.ts` for journey framing (phase details, time estimates)
- `systemPrompts.ts` imports helpers from `conversationState.ts`
- Coverage state comes from `conversationState` table (Plan 08-01)
- Research findings come from `researchFindings` field (Plan 07-02)

### Verification

All success criteria met:
- ✓ New exploration session prompt includes 4-phase journey roadmap with time estimates
- ✓ New evaluation session prompt includes 6-phase journey roadmap
- ✓ Returning user sees recap + continuation instead of welcome
- ✓ System prompt includes pacing guidance based on energy level
- ✓ System prompt enforces max 2 questions per response
- ✓ Research intensity setting injected into system prompt
- ✓ Claude names phases naturally in conversation
- ✓ Backward compatible with existing callers

TypeScript compilation: ✓ PASSED

## Files Changed

### Created
- `src/lib/conversationState.ts` (250 lines) - Helper functions for prompt section building

### Modified
- `src/lib/systemPrompts.ts` - Extended interface, overhauled prompt structure with 12 sections

## Next Steps

This prompt overhaul enables Plans 03-04:
- **08-03**: Coverage extraction action (will populate coverageState used by buildCoverageMap)
- **08-04**: Trigger detection action (will populate researchFindings referenced by buildResearchReferenceGuidance)

The system prompt now accepts all state needed for dynamic conversation orchestration. Implementation of extraction/detection actions will bring it to life.

## Commits

- `e3f81c2`: feat(08-02): create conversation state helper module
- `75c2c27`: feat(08-02): overhaul system prompt with state injection

## Self-Check: PASSED

**Created Files:**
- ✓ src/lib/conversationState.ts exists

**Modified Files:**
- ✓ src/lib/systemPrompts.ts modified

**Commits:**
- ✓ e3f81c2 exists (conversation state helpers)
- ✓ 75c2c27 exists (system prompt overhaul)

**TypeScript Validation:**
- ✓ TypeScript compiles without errors
- ✓ Backward compatibility verified (existing signature still works)
- ✓ All helper functions have correct signatures
- ✓ Journey framing differs between first/returning/continuing sessions
- ✓ Pacing has 3 energy levels
- ✓ Research intensity has 3 levels with searched-sources tracking
