# Project State: Gap Finder Web App

**Purpose:** Project memory that persists across sessions. Update after each significant change.

---

## Project Reference

**North Star:** Users exit feeling **confident**, **capable**, **clear**, and with genuine **ownership** of their idea. Every technical decision serves this emotional outcome. (See PROJECT.md for full North Star definition)

**Core Value:** Persistent conversations that feel identical to chatting with Claude directly - the skill's magic preserved, with progress that never gets lost.

**Current Focus:** Phase 5 Wave 2 in progress. Blob rendering and backend extraction complete - schema extended with idea fields, Claude-powered extraction ready.

**Tech Stack:** Convex (database), Claude API (conversations), React (frontend), Vite (build), Tailwind (styling), Motion (animations)

---

## Current Position

**Phase:** 5 - Idea Card (Wave 2 Complete)
**Plan:** 02a of 02 complete
**Status:** Backend idea extraction infrastructure complete - schema, queries, and Claude action ready
**Last Activity:** 2026-02-02 - Completed 05-02a-PLAN.md (Backend Idea Extraction Infrastructure)

**Progress:**
```
[████████████████████████████] 100% (20/20 plans complete)
```

**Phase Breakdown:**
| Phase | Plans | Status |
|-------|-------|--------|
| 1 - Foundation | 6 | Complete |
| 2 - Chat Core | 4 | Complete |
| 3 - Sessions | 6 | Complete + Verified |
| 4 - Phase System | 2 | Complete + Verified |
| 5 - Idea Card | 2 | Complete (Wave 1 + Wave 2a) |
| 6 - Instructor View | 0 | Not Started |

---

## Performance Metrics

**Plans Completed:** 20
**Plans Total:** 20 (Phases 1-5)
**Success Rate:** 100%
**Blockers Resolved:** 8 (Convex auth, auth config format, @auth/core version, Resend SDK deps, TypeScript build, Anthropic model name, pre-existing TS errors, framer-motion dependency)

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
| isArchived as optional boolean | Backward compatibility with existing sessions without data migration | 2026-01-31 |
| In-memory filtering for optional fields | Convex can't efficiently index optional fields; filter post-query for user-scoped data | 2026-01-31 |
| Contextual limit error messages | Exploration vs evaluation have different user journeys; tailor messages accordingly | 2026-01-31 |
| react-use for localStorage | SSR-safe localStorage with automatic JSON serialization | 2026-01-31 |
| 100ms throttle on scroll saves | Prevents excessive localStorage writes during scrolling | 2026-01-31 |
| useLayoutEffect for scroll restoration | Restores before paint to prevent visual jump | 2026-01-31 |
| isLoaded flag for scroll restoration | Prevents race condition where scroll restores before messages load | 2026-01-31 |
| Phase indicator as dot + name | Cleaner visual than progress bar; shows phase at a glance | 2026-01-31 |
| New session button at top of group | Follows natural reading order per CONTEXT.md | 2026-01-31 |
| ArchivedSection renders null when empty | Keeps sidebar clean; appears only after first archive | 2026-01-31 |
| Context menu state lifted to Sidebar | Prepares for 03-04; parent manages position state | 2026-01-31 |
| Group-specific localStorage keys | Each collapsible section persists independently | 2026-01-31 |
| Onboarding when no sessions (not first login) | Shows path choice whenever session lists are empty | 2026-01-31 |
| NewSessionModal receives path as prop | Simplifies modal UI; parent determines which path to create | 2026-01-31 |
| 5-session limit with progressive nudges | Warn at 4th, block at 5th, contextual messages per path | 2026-01-31 |
| MessageList/MessageInput state integration deferred | Infrastructure ready but wiring deferred to Chat Core refactor | 2026-01-31 |
| Convert sessionId to string for useScrollRestoration | Hook expects string key for localStorage, use .toString() on Id type | 2026-02-01 |
| Remove useScrollIntent in favor of useScrollRestoration | useScrollRestoration provides position persistence, local state tracks scroll for UI | 2026-02-01 |
| Draft sync via useEffect watching draftMessage | External prop changes (session switch) update local state to prevent desync | 2026-02-01 |
| Sonner over react-hot-toast | Lighter (2-3KB vs 5KB), shadcn/ui default, modern API | 2026-02-01 |
| Monotonic progress tracking | Progress only increases to prevent confusing UX where bar moves backward | 2026-02-01 |
| Session path filtering for phases | Exploration (0-3) and evaluation (4-9) are separate journeys | 2026-02-01 |
| 5-message assessment threshold | Balances Claude API cost vs user experience responsiveness | 2026-02-01 |
| 85% progress + isComplete for confirmation | Requires both semantic completion AND high progress to avoid premature prompts | 2026-02-01 |
| Callback ref pattern for scroll-to-phase | Decouples MessageList from Chat state for cleaner API | 2026-02-01 |
| Seed-based blob shape generation | Ensures consistent blob shapes across renders with reproducibility | 2026-02-02 |
| Convergence factor 0.15 per phase | Gradual centripetal drift toward center without excessive speed | 2026-02-02 |
| 60-second blob animation cycle | Glacial motion creates ambient movement without distraction | 2026-02-02 |
| mix-blend-mode multiply for blob overlap | GPU-accelerated color blending creates organic color mixing effect | 2026-02-02 |
| Motion animate prop for local drift | Separates static convergence (hook) from animation (component) | 2026-02-02 |
| Split Convex files by runtime | Queries/mutations in standard runtime, actions in Node.js files | 2026-02-02 |
| Internal API namespace for internal mutations | Actions call internal mutations via internal.* not api.* | 2026-02-02 |
| Analyze last 50 messages for extraction | Balances context richness vs API cost | 2026-02-02 |

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
- Optional boolean fields handle additive schema changes without backfills
- In-memory filtering acceptable for user-scoped queries (typically <100 records per user)
- react-use provides SSR-safe hooks including useLocalStorage with JSON serialization
- Scroll restoration requires coordination: throttle saves, wait for content load, use useLayoutEffect
- Props threading pattern: state management in parent, hooks consumed in presentation components
- Session state wiring complete: scroll position and draft message persist across switches and refreshes
- sonner toast library: lightweight (2-3KB), auto-deduplication with id prop
- Phase progress bar: visual momentum creates sense of accomplishment
- Semantic assessment: Claude evaluates completion against phase criteria with structured response
- Callback ref pattern: Child exposes function to parent via useEffect callback prop
- Motion (framer-motion): GPU-accelerated animations via transform/opacity only
- SVG filters: define once in defs, reference with url(#id) for performance
- Centripetal convergence: lerp(start, center, phase * 0.15) for gradual drift
- Blob animations: 60s cycle with staggered starts (i * 0.5s delay) for organic feel
- Convex runtime split: queries/mutations (standard) vs actions (Node.js "use node")
- Internal mutations: accessed via internal API namespace, not public api namespace
- Claude structured JSON: wrap extraction requests in JSON schema, parse with regex for markdown wrapping

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
- [x] Execute Phase 2 (Chat Core) — 4 plans complete, verified, batch mode accepted for v1

---

## Session Continuity

**Last Session:** 2026-02-02
**Last Action:** Completed 05-02a-PLAN.md (Backend Idea Extraction Infrastructure)
**Next Action:** Plan and execute 05-02b (Word Cloud Overlay) via `/gsd:plan-phase` or integrate with frontend

**Phase 5 Complete:**
- [x] 05-01-PLAN.md - Blob Rendering Foundation (6 organic blobs, drift, convergence)
- [x] 05-02a-PLAN.md - Backend Idea Extraction Infrastructure (schema, queries, Claude action)

**Phase 4 Complete:**
- [x] 04-01-PLAN.md - Phase Progress Bar UI (sonner, segments, integration)
- [x] 04-02-PLAN.md - Phase Detection & Advancement

**Phase 3 Complete + Verified:**
- [x] 03-01-PLAN.md - Sessions Backend Infrastructure (archive, linking, limits)
- [x] 03-02-PLAN.md - Session State Persistence Hooks (scroll, draft)
- [x] 03-03-PLAN.md - Sidebar Session Groups (exploration/evaluation/archived)
- [x] 03-04-PLAN.md - Session Context Menu (rename, archive, delete)
- [x] 03-05-PLAN.md - Full Integration (onboarding, creation, complete lifecycle)
- [x] 03-06-PLAN.md - Gap Closure (session state wiring through component tree)

**Phase 2 Complete:**
- [x] 02-01-PLAN.md - Pagination, streaming backend
- [x] 02-02-PLAN.md - Throttling, retry utilities
- [x] 02-03-PLAN.md - Thinking section, markdown, messages UI
- [x] 02-04-PLAN.md - End-to-end wiring

**User Feedback (from 02-04 verification):**
- Responses too wordy - cut 10-15%
- Explain 6-area mapping upfront
- User needs journey context before diving in

**Key Research Findings:**
- Phase-specific summaries needed (not generic keyFindings)
- Handoff state for phases 2, 5, 6, 8
- Ownership rules must be in EVERY system prompt
- v1 without MCP is viable (user provides research)

---

*State initialized: 2025-01-22*
*Last updated: 2026-02-02 (Phase 5 in progress - 19/20 plans done, blob rendering foundation complete)*
