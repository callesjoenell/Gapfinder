# Project State: Gap Finder Web App

**Purpose:** Project memory that persists across sessions. Update after each significant change.

---

## Project Reference

**Core Value:** Persistent conversations that feel identical to chatting with Claude directly - the skill's magic preserved, with progress that never gets lost.

**Current Focus:** Phase 1 Foundation - System prompt engineering complete, context management next.

**Tech Stack:** Convex (database), Claude API (conversations), React (frontend), Vite (build), Tailwind (styling)

---

## Current Position

**Phase:** 1 - Foundation
**Plan:** 04 of 06 complete
**Status:** In progress

**Progress:**
```
[########            ] 14% (2/14 plans complete)
```

**Phase Breakdown:**
| Phase | Requirements | Status |
|-------|--------------|--------|
| 1 - Foundation | 8 | In Progress (Plans 01, 04 complete) |
| 2 - Chat Core | 4 | Not Started |
| 3 - Sessions | 3 | Not Started |
| 4 - Phase System | 4 | Not Started |
| 5 - Idea Card | 6 | Not Started |
| 6 - Instructor View | 3 | Not Started |

---

## Performance Metrics

**Plans Completed:** 2
**Plans Total:** 6 (Phase 1)
**Success Rate:** 100%
**Blockers Resolved:** 1 (Convex authentication)

---

## Accumulated Context

### Key Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| 6 phases derived from dependencies | Auth -> Data -> Chat -> Sessions -> Phases -> Card/Instructor follows natural dependency chain | 2025-01-22 |
| Phase 5 and 6 sequential (not parallel) | Maintains focus; both depend on Phase 4 but are independent of each other | 2025-01-22 |
| Foundation includes all DATA requirements | Data schema affects everything downstream; get it right early | 2025-01-22 |
| Tailwind v3 over v4 | v4 has different config approach; v3 is more stable/documented | 2026-01-28 |
| Messages as individual rows | Per Convex best practices for real-time updates (not arrays) | 2026-01-28 |
| Soft delete pattern for sessions | isDeleted field rather than actual deletion for data recovery | 2026-01-28 |
| 10 phases split into exploration (0-3) and evaluation (4-9) | Aligns with business model: exploration free, evaluation paid | 2026-01-28 |
| FORBIDDEN section explicitly prevents idea generation | Claude must surface user's ideas, not generate them | 2026-01-28 |
| Tone: useful not encouraging | No flattery, no cheerleading - be a research partner | 2026-01-28 |

### Technical Findings

- Context window effective limit: 60-120K tokens (not 200K advertised)
- Streaming requires throttling: batch updates every 50ms to prevent jank
- Auto-scroll needs user intent tracking: stop auto-scroll when user scrolls up
- Magic links need security: 15-min expiry, single-use tokens
- Convex: queries for reads (reactive), mutations for writes (transactional)
- Animations: use transform/opacity only (GPU-accelerated)
- Phase detection: use Claude semantic understanding, not keyword matching
- Convex deployment: glad-bloodhound-996 (project: gap-finder)
- System prompt: role definition at top is most powerful technique
- Summaries: structured JSON (not narrative) preserves critical data better

### Known Pitfalls (from research)

1. **Context Window Mismanagement** - Implement sliding window + summarization
2. **Silent Streaming Failures** - Explicit error handlers required
3. **Auto-Scroll Fighting** - Track user scroll intent
4. **Convex Query/Mutation Confusion** - Queries for reads, mutations for writes
5. **Layout-Triggering Animations** - Use transform/opacity only
6. **Render-Per-Token Jank** - Throttle streaming updates
7. **AI-Generated Ideas** - Users abandon ideas that don't feel like theirs

### Blockers

None currently.

### TODOs

- [x] Plan Phase 1 (Foundation) via `/gsd:plan-phase 1`
- [x] Execute Plan 01-01 (Project Setup)
- [ ] Execute Plan 01-02 (Magic Link Auth)
- [ ] Execute Plan 01-03 (Basic Chat UI)
- [x] Execute Plan 01-04 (Skill Integration)
- [ ] Execute Plan 01-05 (Context Management)
- [ ] Execute Plan 01-06 (Streaming)

---

## Session Continuity

**Last Session:** 2026-01-28
**Last Action:** Completed Plan 01-04 (System Prompt Engineering)
**Next Action:** Execute Plan 01-02 (Magic Link Auth) or 01-05 (Context Management)

**Files Modified This Session:**
- src/lib/phaseConfig.ts (created)
- src/lib/systemPrompts.ts (created)
- .planning/phases/01-foundation/01-04-SUMMARY.md (created)

---

*State initialized: 2025-01-22*
*Last updated: 2026-01-28*
