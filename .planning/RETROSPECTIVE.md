# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-01
**Phases:** 9 | **Plans:** 37 | **Commits:** 273
**Timeline:** 40 days (2026-01-20 → 2026-03-01)
**Codebase:** 12,334 LOC TypeScript/TSX, 95 files

### What Was Built
- Full AI-guided conversation app with Gap Finder methodology loaded as system prompt
- Magic link auth (Clerk) with persistent multi-session support
- Streaming chat that feels like Claude.ai with conversation history
- Progressive phase system with Claude-detected advancement via structured outputs
- Animated idea card: blob-to-card merge with score-based color transitions
- Research tool integration: Reddit, HN, ProductHunt, Tavily, SO, Keywords Everywhere
- Implicit conversation coverage tracking with journey framing per path
- E2E simulation testing infrastructure with 8-dimension evaluation rubrics
- System prompt guardrails for conversation quality

### What Worked
- GSD framework kept momentum high — 37 plans executed across 9 phases in 40 days
- Phase-based architecture made dependencies clear and execution parallel where possible
- Convex as backend simplified real-time data, auth, and deployment
- Separating research tools (Phase 7) from conversation design (Phase 8) prevented conflation
- Simulation testing (Phase 9) caught conversation quality issues before deployment
- Quick tasks (4 completed) handled polish without disrupting phase execution

### What Was Inefficient
- 16-attempt debug session on chat textarea truncation — caused by react-use stale closure bug and CSS Grid mirror fragility
- Magic link auth attempted custom implementation before migrating to Clerk — should have started with Clerk
- Traceability table in REQUIREMENTS.md went stale — manual checkbox updates not maintained
- Phase 6 (Instructor View) deferred after being planned in roadmap — should have been scoped out earlier
- STATE.md grew very large with accumulated context — needed periodic pruning

### Patterns Established
- `const DEBUG = false` flags at top of component files for instrumentation
- Split Convex files by runtime: queries/mutations (standard) vs actions (Node.js "use node")
- Internal API namespace for action-to-mutation calls
- Config-driven components (CHECKLIST_CONFIGS, phaseConfig, coverageTopics)
- URL parameter testing mode (?testMode=true) for visual verification
- Fire-and-forget coverage extraction after each assistant response

### Key Lessons
1. **Start with managed auth** — Custom magic links waste time; Clerk/Auth0/etc handle edge cases
2. **react-use useLocalStorage has stale closures** — Use separate keys per concern, never share
3. **Debug the right symptom** — "Content gone" vs "content hidden by CSS" are different bugs; instrument early
4. **useLayoutEffect + scrollHeight > CSS Grid mirror** for textarea auto-resize
5. **Convex useQuery returns undefined during reconnects** — Use stableRef pattern to bridge gaps
6. **Debug instrumentation can cause the bug** — setInterval + setState in parents triggers re-renders
7. **Implicit tracking > explicit questioning** for conversation apps — users hate being quizzed
8. **Score thresholds need visual testing** — Numbers that look right in code look wrong rendered

### Cost Observations
- Model mix: ~70% sonnet (execution), ~20% opus (planning/review), ~10% haiku (quick tasks)
- GSD parallel execution reduced wall-clock time significantly for independent plans
- Notable: Research API wrappers (Phase 7) were the most code-dense phase; simulation (Phase 9) was fastest to execute

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Commits | Phases | Plans | Key Change |
|-----------|---------|--------|-------|------------|
| v1.0 | 273 | 9 | 37 | Initial build with GSD framework |

### Top Lessons (Verified Across Milestones)

1. Start with managed auth services, not custom implementations
2. Implicit UX tracking preserves natural conversation flow
3. Simulation testing catches conversation quality issues early
