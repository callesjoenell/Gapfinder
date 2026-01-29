# Research Brief: Skill Adaptation for API Environment

**Created:** 2026-01-29
**Status:** Ready to execute
**Priority:** HIGH - Blocks Phase 2 technical decisions

## Research Question

How do we adapt the Gap Finder skill (designed for Claude.ai) to work through the Anthropic API in a web app, while preserving the experience that makes users feel **empowered** and like they **discovered something truly theirs**?

---

## Context

### The Product Vision

Gap Finder helps solo founders discover viable startup opportunities through a 10-phase process. The core experience is:

- **Ownership** — The idea must come from THEM, not Claude
- **Empowerment** — They feel capable of building something meaningful
- **Sharpening** — Their fuzzy intuitions become clear, validated opportunities
- **Persistence** — Their progress is never lost, they can return anytime

### The Technical Challenge

The skill was written for Claude.ai which has:
- Native project memory
- Persistent user context
- Automatic skill loading
- Session continuity built-in

We're building for the Anthropic API which has:
- Stateless requests
- Must rebuild context each call
- Explicit system prompt management
- No native persistence

### Files to Study

- `SKILL-final.md` — The complete 1883-line skill
- `src/lib/systemPrompts.ts` — Current system prompt building
- `src/lib/phaseConfig.ts` — Phase-specific instructions
- `src/lib/contextManagement.ts` — Current context handling
- `convex/schema.ts` — Current data model

---

## Research Areas

### 1. Skill Structure Analysis

**Questions:**
- What parts of the skill are phase-independent (should always be in system prompt)?
- What parts are phase-specific (only needed for that phase)?
- What's the minimum context needed for each phase to work well?
- How does the skill handle phase transitions?

**Output:** Skill decomposition showing what to load when

### 2. User Context Persistence

**Questions:**
- What does Phase 0 produce that ALL future phases need?
- What structured data (not just conversation) needs to persist?
- How should "User Context" (distribution channels, build window, existing projects) be captured and stored?
- What's the schema for skill-aligned data (not generic messages)?

**Output:** Data model recommendations for user context

### 3. Phase-Specific Summarization

**Questions:**
- What does each phase actually produce? (Not generic "keyFindings")
- Phase 0: Excavation scores, unfair advantages, intersection zones
- Phase 1: Pain signals, underserved audiences, timing windows
- Phase 2: User's synthesized idea (they bring this back)
- Phase 3: Person canvas, identity transformation
- Phase 4: Evaluation scorecard
- etc.

**Output:** Phase-specific summary schemas

### 4. Handoff Phases (User Leaves and Returns)

**Questions:**
- Which phases have explicit handoffs? (2, 5, 6, 8)
- What context does the user need when they leave?
- What should Claude ask when they return?
- How do we track "awaiting return" state?

**Output:** Handoff handling patterns

### 5. Research Tool Requirements

**Questions:**
- The skill references MCP servers and web search
- What research capabilities does Phase 1 actually need?
- Can we provide useful research without MCP?
- What's the degraded experience without research tools?

**Output:** Research capability requirements and alternatives

### 6. System Prompt Strategy

**Questions:**
- Full skill (1883 lines) vs phase-specific extracts?
- Token budget for system prompt vs conversation history?
- How does Claude.ai load the skill? Can we replicate that?
- What's the minimum for the experience to feel "like Claude.ai with the skill"?

**Output:** System prompt architecture recommendation

### 7. The Ownership Experience

**Questions:**
- How does the skill prevent Claude from generating ideas FOR the user?
- What conversational patterns preserve user ownership?
- How do we measure if users feel "I discovered this" vs "Claude suggested this"?
- What's the difference between Claude.ai skill experience and generic chatbot?

**Output:** UX principles for ownership preservation

---

## Success Criteria

Research is complete when we can answer:

1. [ ] What data model changes are needed for Phase 2?
2. [ ] How should system prompt be structured for each phase?
3. [ ] What's the handoff pattern for phases where users leave?
4. [ ] What summarization schema does each phase need?
5. [ ] What research capabilities do we need (or can skip for v1)?
6. [ ] How do we preserve the "ownership" feeling through the API?

---

## Output Location

Write findings to: `.planning/research/SKILL-ADAPTATION-RESEARCH.md`

Format: Follow GSD research template with:
- Executive Summary
- Findings per research area
- Recommendations
- Schema proposals (TypeScript interfaces)
- Open questions for user decision

---

## How to Run

After `/clear`:

```
Research the Gap Finder skill adaptation following .planning/research/SKILL-ADAPTATION-BRIEF.md

Focus on how to make users feel empowered and like they discovered something truly theirs - not that Claude gave them an idea.

Key files to read:
- SKILL-final.md (the complete skill)
- src/lib/systemPrompts.ts (current implementation)
- src/lib/phaseConfig.ts (phase instructions)
- convex/schema.ts (current data model)
```

---

*Research brief created: 2026-01-29*
