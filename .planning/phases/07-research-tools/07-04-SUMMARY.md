---
phase: 07-research-tools
plan: 04
subsystem: api
tags: [keywords-everywhere, billing, credits, monetization, search-volume]

# Dependency graph
requires:
  - phase: 07-01
    provides: Research tools foundation with tool definitions
provides:
  - Keyword volume lookup API wrapper with Keywords Everywhere integration
  - Credit-based billing system for paid research features
  - UI component for keyword lookup with confirmation flow
  - Convex action orchestrating credit checks and API calls
affects: [07-05, monetization, billing-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [credit-based-billing, paid-api-wrapper, confirmation-before-charge]

key-files:
  created:
    - convex/research/keywords.ts
    - convex/research/keywordAction.ts
    - convex/billing.ts
    - src/components/research/KeywordLookup.tsx
  modified:
    - convex/research/tools.ts
    - convex/schema.ts
    - src/components/research/index.ts
    - convex/manualResearch.ts

key-decisions:
  - "Credit check before API execution prevents charging for failed lookups"
  - "20-keyword limit enforced server-side prevents runaway API costs"
  - "Trial credits (50 lookups) enable testing without payment setup"
  - "UI tracking separate from backend charge ensures only successful lookups deduct credits"
  - "Auth import pattern uses ./auth not @convex-dev/auth/server for project consistency"

patterns-established:
  - "Paid feature pattern: check credits → confirm with user → execute action → track usage"
  - "Credit balance displayed in UI before user commits to spending"
  - "Graceful API key missing handling with clear error messages"

# Metrics
duration: 5min
completed: 2026-02-02
---

# Phase 07 Plan 04: Keyword Volume Lookup Summary

**Keyword volume lookup with credit-based billing, confirmation UI, and Keywords Everywhere API integration for market validation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-02T16:00:25Z
- **Completed:** 2026-02-02T16:04:57Z
- **Tasks:** 4
- **Files modified:** 7

## Accomplishments
- Keywords Everywhere API wrapper with 20-keyword limit and structured response
- Credit billing system with check/track/grant functions and schema table
- KeywordLookup UI component with 4-step confirmation flow (input → confirm → loading → results)
- Convex action orchestrating credit verification and API execution

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Keywords Everywhere API wrapper** - `0f3c3ab` (feat)
2. **Task 2: Create billing/usage tracking module** - `2e85151` (feat)
3. **Task 3: Create KeywordLookup UI component** - `039464a` (feat)
4. **Task 4: Create Convex action for keyword lookup API endpoint** - `d8ecae2` (feat)

## Files Created/Modified
- `convex/research/keywords.ts` - Keywords Everywhere API wrapper with getKeywordVolume function
- `convex/research/keywordAction.ts` - Convex action for keyword lookup with credit checks
- `convex/billing.ts` - Credit management (getCredits, checkKeywordAccess, trackKeywordUsage, grantTrialCredits)
- `convex/schema.ts` - Added keywordCredits table with by_user index
- `convex/research/tools.ts` - Added get_keyword_volume tool for Claude
- `src/components/research/KeywordLookup.tsx` - Multi-step UI with credit confirmation
- `src/components/research/index.ts` - Export KeywordLookup component
- `convex/manualResearch.ts` - Fixed auth import to match project pattern

## Decisions Made

**Credit check before API execution** - Prevents charging users for failed lookups by verifying credits before calling Keywords Everywhere API

**20-keyword max limit enforced** - Server-side enforcement in both API wrapper and action prevents runaway costs from malicious or accidental overuse

**Trial credits implementation** - 50 free keyword lookups via grantTrialCredits mutation enables testing without payment setup (v2 will integrate real billing)

**UI-side usage tracking** - Component calls trackKeywordUsage after successful lookup rather than in action, ensuring only successful API calls deduct credits

**Auth import consistency** - Fixed manualResearch.ts to use `./auth` pattern matching rest of project (not `@convex-dev/auth/server`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed auth import in manualResearch.ts**
- **Found during:** Task 2 (Schema deployment)
- **Issue:** manualResearch.ts used `@convex-dev/auth/server` import causing Convex deployment failure
- **Fix:** Changed to `./auth` import pattern matching sessions.ts, messages.ts, summaries.ts
- **Files modified:** convex/manualResearch.ts
- **Verification:** `npx convex dev --once` deployed successfully
- **Committed in:** 2e85151 (Task 2 commit)

**2. [Rule 3 - Blocking] Added explicit TypeScript return types**
- **Found during:** Task 4 (Convex deployment)
- **Issue:** TypeScript strict mode errors for implicit 'any' types in action handler
- **Fix:** Added LookupResult interface and Promise<LookupResult> return type annotation
- **Files modified:** convex/research/keywordAction.ts
- **Verification:** Convex deployment succeeded with typecheck
- **Committed in:** d8ecae2 (Task 4 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both auto-fixes required for deployment. No scope changes.

## Issues Encountered

**Pre-existing TypeScript errors** - Anthropic SDK private identifier errors from ES2015 target mismatch. Not introduced by this plan. Project builds despite `tsc --noEmit` warnings.

## User Setup Required

**Keywords Everywhere API key required for keyword lookups:**

```bash
npx convex env set KEYWORDS_EVERYWHERE_API_KEY "your-api-key-here"
```

**Setup steps:**
1. Create account at https://keywordseverywhere.com
2. Purchase credits ($10 for 100K keywords recommended)
3. Get API key from Dashboard → API Key
4. Set env var in Convex deployment

**Testing without API key:**
- Use `grantTrialCredits` mutation to test UI flow
- Actual keyword lookups will fail gracefully with clear error message

## Next Phase Readiness

**Ready:**
- Keyword lookup infrastructure complete
- Credit system ready for integration with payment provider
- UI pattern established for paid features
- Tool definition added to Claude's research toolkit

**Notes:**
- Keyword lookup currently requires manual credit grants via grantTrialCredits
- v2 integration with payment provider (Autumn/Stripe) will enable real purchases
- Component can be wired into research phase UI when research tool orchestration is implemented

---
*Phase: 07-research-tools*
*Completed: 2026-02-02*
