# Project State: Gap Finder Web App

**Purpose:** Project memory that persists across sessions. Update after each significant change.

---

## Project Reference

**North Star:** Users exit feeling **confident**, **capable**, **clear**, and with genuine **ownership** of their idea. Every technical decision serves this emotional outcome. (See PROJECT.md for full North Star definition)

**Core Value:** Persistent conversations that feel identical to chatting with Claude directly - the skill's magic preserved, with progress that never gets lost.

**Current Focus:** Skill adaptation research complete. Ready to revise Phase 2 plans with North Star alignment.

**Tech Stack:** Convex (database), Claude API (conversations), React (frontend), Vite (build), Tailwind (styling)

---

## Current Position

**Phase:** 2 - Chat Core
**Plan:** 03 of 04 complete
**Status:** In progress
**Last Activity:** 2026-01-29 - Completed 02-03-PLAN.md (Message UI Components)

**Progress:**
```
[#################   ] 56% (9/16 plans complete)
```

**Phase Breakdown:**
| Phase | Plans | Status |
|-------|-------|--------|
| 1 - Foundation | 6 | Complete |
| 2 - Chat Core | 4 | In Progress (3/4) |
| 3 - Sessions | 2 | Not Started |
| 4 - Phase System | 2 | Not Started |
| 5 - Idea Card | 2 | Not Started |
| 6 - Instructor View | 0 | Not Started |

---

## Performance Metrics

**Plans Completed:** 6
**Plans Total:** 6 (Phase 1)
**Success Rate:** 100%
**Blockers Resolved:** 6 (Convex auth, auth config format, @auth/core version, Resend SDK deps, TypeScript build, Anthropic model name)

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
| auth.getUserId() pattern for ownership | All session/message APIs verify userId before operations | 2026-01-28 |
| Email provider in auth.ts not auth.config.ts | Convex cloud only accepts OAuth providers in auth.config.ts | 2026-01-28 |
| Fetch API over Resend SDK | Resend SDK uses Node.js APIs not available in Convex runtime | 2026-01-28 |
| 15-minute magic link expiry | Industry standard for security per research | 2026-01-28 |
| Node types in tsconfig.app.json | Required for convex env vars accessed transitively | 2026-01-28 |
| 150K token threshold for mid-phase summarization | Conservative limit (model has 200K) leaves room for response | 2026-01-28 |
| 50 message backup trigger for summarization | Catches verbose conversations that might not hit token limit | 2026-01-28 |
| Keep last 15 messages when trimming mid-phase | Preserves recent context continuity | 2026-01-28 |
| JSON extraction via regex for Claude responses | Handles markdown-wrapped JSON responses defensively | 2026-01-28 |

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
- Convex auth.config.ts: only OAuth providers accepted, Email/credentials go in auth.ts
- TypeScript verbatimModuleSyntax: requires `import type { }` for type-only imports
- Resend SDK uses Node.js stream/crypto - use fetch API directly instead
- Convex actions use "use node" directive for Node.js runtime (needed for @anthropic-ai/sdk)
- Actions call mutations via ctx.runMutation for database writes

### Known Pitfalls (from research)

1. **Context Window Mismanagement** - Implement sliding window + summarization
2. **Silent Streaming Failures** - Explicit error handlers required
3. **Auto-Scroll Fighting** - Track user scroll intent
4. **Convex Query/Mutation Confusion** - Queries for reads, mutations for writes
5. **Layout-Triggering Animations** - Use transform/opacity only
6. **Render-Per-Token Jank** - Throttle streaming updates
7. **AI-Generated Ideas** - Users abandon ideas that don't feel like theirs

### Blockers

**AUTH_RESEND_KEY** - User needs to set real Resend API key:
```bash
npx convex env set AUTH_RESEND_KEY "re_actual_key_here"
```

**ANTHROPIC_API_KEY** - User needs to set Anthropic API key:
```bash
npx convex env set ANTHROPIC_API_KEY "sk-ant-api03-..."
```
Get key from: https://console.anthropic.com -> API Keys

### TODOs

- [x] Plan Phase 1 (Foundation) via `/gsd:plan-phase 1`
- [x] Execute Plan 01-01 (Project Setup)
- [x] Execute Plan 01-02 (Magic Link Auth)
- [x] Execute Plan 01-03 (Sessions/Messages API + Layout UI)
- [x] Execute Plan 01-04 (Skill Integration)
- [x] Execute Plan 01-05 (Context Management)
- [x] Execute Plan 01-06 (Chat Integration)
- [x] Plan Phase 2 (Chat Core) via `/gsd:plan-phase 2` — plans created, 4 plans in 2 waves
- [x] **Skill Adaptation Research** — complete, see `.planning/research/SKILL-ADAPTATION-RESEARCH.md`
- [x] **North Star Alignment** — PROJECT.md, ROADMAP.md, REQUIREMENTS.md, all Phase 2 plans updated
- [x] **Create North Star Checklist** — `.planning/NORTH-STAR-CHECKLIST.md` for future plans
- [ ] Execute Phase 2 (Chat Core) — plans ready, aligned with North Star

---

## Session Continuity

**Last Session:** 2026-01-29
**Last Action:** Completed 02-03-PLAN.md (Message UI Components)
**Next Action:** Execute 02-04-PLAN.md (End-to-end wiring)

**Phase 2 Progress:**
- [x] 02-01-PLAN.md - Pagination, streaming backend
- [x] 02-02-PLAN.md - Throttling, retry utilities
- [x] 02-03-PLAN.md - Thinking section, markdown, messages UI
- [ ] 02-04-PLAN.md - End-to-end wiring

**Key Research Findings:**
- Phase-specific summaries needed (not generic keyFindings)
- Handoff state for phases 2, 5, 6, 8
- Ownership rules must be in EVERY system prompt
- v1 without MCP is viable (user provides research)

---

*State initialized: 2025-01-22*
*Last updated: 2026-01-29 (02-03 complete)*
