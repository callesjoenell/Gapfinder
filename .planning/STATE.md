# Project State: Gap Finder Web App

**Purpose:** Project memory that persists across sessions. Update after each significant change.

---

## Project Reference

**North Star:** Users exit feeling **confident**, **capable**, **clear**, and with genuine **ownership** of their idea. Every technical decision serves this emotional outcome. (See PROJECT.md for full North Star definition)

**Core Value:** Persistent conversations that feel identical to chatting with Claude directly - the skill's magic preserved, with progress that never gets lost.

**Current Focus:** Phase 10 (Conversation Guardrails) IN PROGRESS. Plan 1/2 complete.

**Tech Stack:** Convex (database), Claude API (conversations), React (frontend), Vite (build), Tailwind (styling), Motion (animations), d3-cloud (word layouts)

---

## Current Position

**Milestone:** v1 COMPLETE
**Phase:** 10 - Conversation Guardrails (COMPLETE)
**Status:** All phases complete
**Last Activity:** 2026-02-18

**Progress:**
[██████████] 100%

**Phase Breakdown:**
| Phase | Plans | Status |
|-------|-------|--------|
| 1 - Foundation | 6 | Complete |
| 2 - Chat Core | 4 | Complete |
| 3 - Sessions | 6 | Complete + Verified |
| 4 - Phase System | 2 | Complete + Verified |
| 5 - Idea Card | 3 | Complete + Verified |
| 6 - Instructor View | -- | Deferred to v2 |
| 7 - Research Tools | 6 | Complete (07-01 through 07-06) |
| 8 - Conversation Design | 4 | Complete (08-01 through 08-04) |
| 9 - E2E Conversation Simulation | 3 | Complete (09-01 through 09-03) |
| 10 - Conversation Guardrails | 2 | Complete (10-01 through 10-02) |

---

## Performance Metrics

**Plans Completed:** 36
**Plans Total:** 37 (Phases 1-5, 7-10)
**Success Rate:** 100%
**Blockers Resolved:** 13 (Convex auth, auth config format, @auth/core version, Resend SDK deps, TypeScript build, Anthropic model name, pre-existing TS errors, framer-motion dependency, auth import pattern, TypeScript strict mode types, internal API functions, Convex tsconfig includes, Zod enum type)

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
| d3-cloud archimedean spiral for word positioning | Natural word cloud layout within blob bounds without excessive overlap | 2026-02-02 |
| Binary search for dynamic text sizing (12-48px) | Faster than linear search, ensures readability on all screen sizes | 2026-02-02 |
| Message count tracking for extraction triggers | Re-extract idea on new messages for real-time refinement during conversation | 2026-02-02 |
| Edge case: merge only when ideaSentence exists | Prevents premature merge when phase >= 3 but conversation lacks depth | 2026-02-02 |
| Score threshold 20/30 for color transitions | Average 3.33 per area provides flexibility vs strict 4.0; clear visual feedback | 2026-02-02 |
| Binary color transition (not gradual) | Orange until threshold, then smooth 2.5s shift to dark green; clear "you made it" signal | 2026-02-02 |
| Testing mode via URL parameter | ?testMode=true activates mock data and keyboard controls for all 10 phases | 2026-02-02 |
| Collapse state in localStorage | 'ideaCard-collapsed' key persists across refreshes and session switches | 2026-02-02 |
| Blobs expanded to 75% of card area | Prominence and visual impact over small shapes; 1.8x aspect ratio for text containment | 2026-02-02 |
| Multi-color blob gradients | Green, yellow, orange spectrum blends for visual richness; 3 blobs with green tints | 2026-02-02 |
| Claude tool use format with input_schema | Follows Anthropic spec: name, description, input_schema with JSON Schema validation | 2026-02-02 |
| API keys server-side only in Convex actions | All wrappers use process.env with "use node" directive, never exposed to browser | 2026-02-02 |
| Graceful degradation for optional APIs | ProductHunt returns empty arrays with warnings vs throwing errors, allows conversation continuation | 2026-02-02 |
| Free-first research approach | HN and Stack Overflow work without keys, Reddit anonymous, only Tavily requires key | 2026-02-02 |
| Stack Overflow gzip decompression | Stack Exchange API returns gzip by default, use node:zlib gunzipSync | 2026-02-02 |
| Edge fuzziness progression 90% to 50% | Phase 0 at 90% fuzzy (barely visible) to phase 3 at 50% fuzzy (more defined) | 2026-02-02 |
| Word text: 7% grey with blob color tints | Subtle appearance balancing readability with aesthetic integration | 2026-02-02 |
| Responsive heights: 25vh desktop, 40vh mobile | Desktop maximizes chat space, mobile maintains blob visibility on smaller screens | 2026-02-02 |
| Max 5 tool execution iterations | Prevents infinite loops while allowing thorough research | 2026-02-02 |
| Config-driven checklist forms | CHECKLIST_CONFIGS defines fields, component renders dynamically | 2026-02-02 |
| Flexible schema with optional fields | All checklist fields optional in data object since types use different subsets | 2026-02-02 |
| Context formatting for manual research | getManualResearchForContext converts camelCase to readable, filters empties | 2026-02-02 |
| react-hook-form for validation | 6KB bundle, uncontrolled inputs prevent re-renders, built-in validation | 2026-02-02 |
| Sequential tool execution (not parallel) | Respects API rate limits for Reddit (60/min), others | 2026-02-02 |
| Store top 5 results per finding | Limits data growth while preserving key evidence | 2026-02-02 |
| Research findings as optional field | Backward compatible, no data migration required | 2026-02-02 |
| Credit check before API execution | Prevents charging for failed lookups by verifying credits before API call | 2026-02-02 |
| 20-keyword max limit enforced | Server-side enforcement prevents runaway costs from malicious/accidental overuse | 2026-02-02 |
| Trial credits implementation | 50 free lookups via grantTrialCredits enables testing without payment setup | 2026-02-02 |
| UI-side usage tracking | trackKeywordUsage called after success ensures only successful API calls deduct credits | 2026-02-02 |
| Auth import pattern uses ./auth | Project convention: import from ./auth not @convex-dev/auth/server | 2026-02-02 |
| v.any() for coverage topics field | Each phase has different topic keys; Zod enforces structure at extraction | 2026-02-17 |
| Depth merge logic with ordering | deep=3 > moderate=2 > surface=1 > not_mentioned=0; always keep max | 2026-02-17 |
| Dynamic schema generation via createCoverageSchema | Phase-specific Zod schemas built from coverageTopics config | 2026-02-17 |
| Intensity-based trigger filtering | Low/medium/high modes balance noise vs research opportunity detection | 2026-02-17 |
| Rescoring enforces honest assessment | Scores CAN go down, confidence levels required, explanations for all changes | 2026-02-17 |
| Coverage progress replaces old heuristic when available | Fallback preserved for backward compatibility | 2026-02-17 |
| Fire-and-forget coverage extraction | After each assistant response (non-blocking) | 2026-02-17 |
| Internal API versions for conversationState | Actions call internal mutations/queries | 2026-02-17 |
| Client-side pattern matching for suggestions | Immediate responsiveness without AI analysis; predictable, cost-free suggestion generation | 2026-02-17 |
| Max 5 tool_use iterations in simulation | Prevents infinite research loops while allowing thorough multi-tool research | 2026-02-17 |
| Dynamic idea extraction for homework debriefs | Debrief content adapts to actual conversation direction, not hardcoded | 2026-02-17 |
| Homework trigger via regex pattern matching | Detects "go talk to people" patterns in Gap Finder responses at Phase 4 | 2026-02-17 |
| Max 3 suggestions at once | Prevents UI overwhelm; prioritizes most relevant by priority then timestamp | 2026-02-17 |
| Phase 0-2 gating for suggestions | Research phases are exploration (0-2); evaluation phases (3-9) have different needs | 2026-02-17 |
| Queue status tracking (pending/completed/dismissed) | Enables filtering and badge count calculation for lifecycle management | 2026-02-17 |
| Trigger via message sending | Leverages existing Claude flow; auto-research sends prompts, checklists trigger via messages | 2026-02-17 |
| 6-guardrail framework prevents premature exit, therapy drift, and phase abandonment | Addresses three failure modes seen in testing: users wanting to "come back later", self-doubt spirals, therapy territory | 2026-02-18 |
| Phase counter shows remaining phases to reinforce journey commitment | Makes explicit there's work remaining even when early validation feels complete | 2026-02-18 |
| Remove therapist framing to clarify tool role vs coaching role | Consistency - can't say "not a therapist" while describing role as therapist-like | 2026-02-18 |
| Phase-specific stall prompts provide contextual substance vs generic recovery | Generic "energized" message lacks conversation substance; phase-specific prompts give concrete context for all 10 phases | 2026-02-18 |
| Two-tier stall detection: inject prompt at 2, force transition at 3 | Balances recovery attempts vs preventing infinite loops; gives conversation two chances before forcing advancement | 2026-02-18 |
| Meta-conversation circuit breakers in both Marcus and GapFinder personas | Defense in depth - both sides have explicit instructions to avoid meta-conversation spirals | 2026-02-18 |
| Hard phase transitions vs ending simulation | Better to advance to next phase than fail entire simulation; phase exhaustion is a legitimate completion signal | 2026-02-18 |
| Phase 08 P02 | 251 | 2 tasks | 2 files |
| Phase 08 P03 | 5m 29s | 2 tasks | 2 files |
| Phase 08 P04 | 7m 12s | 2 tasks | 10 files |
| Phase 07 P06 | 1h 41m | 6 tasks | 9 files |
| Phase 09 P01 | 5m 37s | 2 tasks | 1 files |
| Phase 09 P02 | 3m 54s | 2 tasks | 1 files |
| Phase 09 P03 | 5m 3s | 2 tasks | 2 files |
| Phase 10 P01 | 65 | 1 tasks | 1 files |
| Phase 10 P2 | 2m 18s | 2 tasks | 1 files |

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
- d3-cloud layout: returns positioned words with x, y, rotate properties added to input objects
- useFitText pattern: binary search with temporary DOM element for measurement before paint
- Message-based reactive triggers: useEffect with ref tracking previous value to detect changes
- useAction for Convex actions: useMutation only works for mutations, actions need useAction hook
- Visual design requires iterative refinement: blob appearance, text visibility, color balance hard to predict without rendered output
- Testing mode pattern: URL parameter + fixture data + keyboard controls enables rapid visual verification
- Score-based color transitions: query threshold check, pass colorScheme to children, GPU-accelerate via motion.linearGradient
- localStorage persistence: react-use useLocalStorage provides SSR-safe state with automatic JSON serialization
- Responsive viewport heights: Tailwind breakpoints (h-[40vh] md:h-[25vh]) for mobile vs desktop layouts

### Roadmap Evolution

- Phase 9 added: E2E Conversation Simulation

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

**TAVILY_API_KEY** - Required for web search research tool:
```bash
npx convex env set TAVILY_API_KEY "tvly-..."
```
Get key from: https://tavily.com/

**PRODUCTHUNT_API_KEY** - Optional for ProductHunt competitive research:
```bash
npx convex env set PRODUCTHUNT_API_KEY "..."
```
Get key from: https://api.producthunt.com/v2/docs (requires approval)

**KEYWORDS_EVERYWHERE_API_KEY** - Required for keyword volume lookups (paid feature):
```bash
npx convex env set KEYWORDS_EVERYWHERE_API_KEY "..."
```
Get key from: https://keywordseverywhere.com -> Dashboard -> API Key
Create account and purchase credits ($10 for 100K keywords)

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

**Last Session:** 2026-02-18T07:58:03Z
**Last Action:** Completed 10-02-PLAN.md (Simulation Hardening)
**Next Action:** Phase 10 complete. All v1 development phases finished.

**Phase 8 Complete:**
- [x] 08-01-PLAN.md - Coverage Tracking Infrastructure (coverageState table, CRUD operations, Zod schemas for extraction/triggers/rescoring)
- [x] 08-02-PLAN.md - System Prompt Overhaul (journey framing, pacing, coverage maps, research intensity)
- [x] 08-03-PLAN.md - Conversation Analysis Actions (extractCoverage + detectTriggers actions, all-phase research with source tracking)
- [x] 08-04-PLAN.md - End-to-End Integration (useStreamingChat wiring, coverage UI, research intensity control)

**Phase 7 Complete:**
- [x] 07-01-PLAN.md - Research Tools Foundation (Claude tool definitions, API wrappers for Reddit/HN/Tavily/ProductHunt/SO)
- [x] 07-02-PLAN.md - Research Action Backend (chatWithResearch action with tool loop, schema extensions, findings persistence)
- [x] 07-03-PLAN.md - Manual Research Checklist (forms for Facebook Groups, LinkedIn, Twitter, Amazon Reviews)
- [x] 07-04-PLAN.md - Keyword Volume Lookup (Keywords Everywhere API, credit billing, confirmation UI, Convex action)
- [x] 07-05-PLAN.md - Research Panel UI Integration (ResearchPanel component, checklist/keyword routing)
- [x] 07-06-PLAN.md - Research Suggestions & Queue (context analysis, suggestion chips, persistent queue drawer)

**Phase 5 Complete + Verified:**
- [x] 05-01-PLAN.md - Blob Rendering Foundation (6 organic blobs, drift, convergence)
- [x] 05-02a-PLAN.md - Backend Idea Extraction Infrastructure (schema, queries, Claude action)
- [x] 05-02b-PLAN.md - Word Cloud Overlay and Merge Animation (d3-cloud, IdeaCardContent, message-based triggers)
- [x] 05-03-PLAN.md - Responsive Layout + Color Transitions + Testing Mode (integration, score-based colors, visual refinements)

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
*Last updated: 2026-02-17 (Phase 7 complete - all 6 plans executed, research suggestions and queue system live)*
