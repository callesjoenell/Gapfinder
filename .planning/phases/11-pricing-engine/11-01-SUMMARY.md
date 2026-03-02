---
phase: 11-pricing-engine
plan: 01
subsystem: payments
tags: [convex, stripe, pricing, schema, tdd, vitest]

# Dependency graph
requires: []
provides:
  - "pricingConfig Convex table: single-row global config (launchDate, freeExploreLimit, freeEvaluateLimit)"
  - "userFreeTier Convex table: per-user free session usage tracking with by_user index"
  - "payments Convex table: payment records with Stripe fields and 3 indexes"
  - "computeCurrentPriceCents: pure function, weekly doubling $2→$64, capped at $64"
  - "getCurrentPrice: public query returning configured state and computed price"
  - "getPricingConfig: public query returning raw config row"
  - "getFreeTierStatus: authenticated query returning remaining free session counts"
  - "setPricingConfig: internalMutation with upsert for admin config"
  - "createPayment: internalMutation inserting pending payment record"
  - "updatePaymentStatus: internalMutation for Stripe webhook updates"
affects: [12-stripe-checkout, createSession]

# Tech tracking
tech-stack:
  added: [vitest]
  patterns:
    - "Pure function separated from Convex functions for unit testability"
    - "internalMutation for privileged writes not exposed to end users"
    - "Upsert pattern: if (existing) ctx.db.patch else ctx.db.insert"
    - "Single-row config table queried with .first() (no index needed)"

key-files:
  created:
    - convex/pricing.ts
    - convex/pricing.test.ts
  modified:
    - convex/schema.ts
    - package.json

key-decisions:
  - "computeCurrentPriceCents is a plain TypeScript function (not a Convex query) — enables unit testing without Convex runtime"
  - "payments table pre-wires stripeSessionId and stripePaymentIntentId as optional fields — Phase 12 fills them in"
  - "vitest added as test runner — first unit tests in project, isolated to pure functions"
  - "setPricingConfig and createPayment are internalMutation — not callable from client, only from trusted server actions"

patterns-established:
  - "Pure price logic in exported function, Convex query wraps it — separation of concerns"
  - "getFreeTierStatus uses Math.max(0, limit - used) to ensure no negative remainders"

requirements-completed: [PAY-03, PAY-04, PAY-07, PAY-08]

# Metrics
duration: 3min
completed: 2026-03-02
---

# Phase 11 Plan 01: Pricing Engine Foundation Summary

**Convex pricing engine with weekly-doubling price function ($2→$64 cap), 3 new tables (pricingConfig, userFreeTier, payments), and 7 exports tested with vitest**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-02T09:17:24Z
- **Completed:** 2026-03-02T09:20:29Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Added pricingConfig, userFreeTier, and payments tables to Convex schema with correct types and indexes
- Implemented computeCurrentPriceCents pure function with pre-launch guard, weekly doubling formula, and $64 cap
- Created full pricing module with public queries (getCurrentPrice, getPricingConfig, getFreeTierStatus) and internalMutations (setPricingConfig, createPayment, updatePaymentStatus)
- Added vitest as first unit test framework; 11 tests covering all price schedule cases

## Task Commits

Each task was committed atomically:

1. **Task 1: Add pricing tables to schema** - `58333a9` (feat)
2. **Task 2: RED — failing tests for computeCurrentPriceCents** - `171134b` (test)
3. **Task 2: GREEN — implement pricing engine module** - `9a35828` (feat)

_Note: TDD task has two commits (test → feat)_

## Files Created/Modified
- `convex/schema.ts` - Added pricingConfig, userFreeTier, payments table definitions
- `convex/pricing.ts` - All pricing engine logic: pure function + 3 queries + 3 internalMutations
- `convex/pricing.test.ts` - 11 vitest tests covering computeCurrentPriceCents schedule and edge cases
- `package.json` - Added vitest devDependency and test script

## Decisions Made
- computeCurrentPriceCents is a plain TypeScript export (not a Convex query) so it can be unit-tested without mocking the Convex runtime
- Stripe fields (stripeSessionId, stripePaymentIntentId) pre-wired as optional in payments table — Phase 12 fills them in at checkout time
- setPricingConfig and createPayment are internalMutation — cannot be called from client code, only from trusted server actions

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Rebuilt esbuild for native platform**
- **Found during:** Task 2 (TDD RED phase — running vitest)
- **Issue:** esbuild binary was built for wrong platform (darwin-arm64 conflict), causing vitest startup to fail
- **Fix:** Ran `npm rebuild esbuild` to rebuild native binary for current platform
- **Files modified:** node_modules only (no source files)
- **Verification:** vitest ran successfully after rebuild
- **Committed in:** Absorbed into test infrastructure setup (not a separate commit — no source files changed)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Esbuild rebuild was a one-command fix for a platform artifact. No scope creep.

## Issues Encountered
None beyond the esbuild platform rebuild noted above.

## User Setup Required
None - no external service configuration required. Pricing config must be seeded via setPricingConfig (internalMutation) before getCurrentPrice returns a configured state.

## Next Phase Readiness
- All pricing tables ready for Phase 12 (Stripe Checkout) to write payment records via createPayment
- computeCurrentPriceCents available for import in any server-side code that needs to show the current price
- getFreeTierStatus ready for createSession to check if user owes payment before creating a session
- No blockers for Phase 12

---
*Phase: 11-pricing-engine*
*Completed: 2026-03-02*
