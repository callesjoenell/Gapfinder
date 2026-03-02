---
phase: 11-pricing-engine
plan: "02"
subsystem: payments
tags: [convex, free-tier, pricing, sessions, mutation]

# Dependency graph
requires:
  - phase: 11-pricing-engine/11-01
    provides: pricingConfig and userFreeTier tables with schema and seed data
provides:
  - createSession with config-driven free tier enforcement and atomic counter increment
affects:
  - 12-stripe-checkout

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Convex mutation reading pricingConfig via ctx.db.query().first() (no import, reads table directly)"
    - "Atomic free tier gate + counter increment in single Convex mutation (ACID transaction)"

key-files:
  created: []
  modified:
    - convex/sessions.ts

key-decisions:
  - "isPaid: true for all free sessions — free means no money owed, not unpaid"
  - "isFree check placed before insert so exhausted users are blocked before any DB write"
  - "Counter increment placed after insert — if insert fails, counter never increments (correct)"
  - "Phase 12 stub: throw Error('Payment required. Paid sessions coming soon!') when free limit exhausted"

patterns-established:
  - "Free tier gate pattern: read config -> read userFreeTier -> check used < limit -> insert -> patch counter"

requirements-completed: [PAY-01]

# Metrics
duration: 1min
completed: 2026-03-02
---

# Phase 11 Plan 02: Pricing Engine — Free Tier Enforcement Summary

**createSession now reads pricingConfig limits and userFreeTier usage to gate session creation, replacing hardcoded isPaid logic with config-driven free tier enforcement and atomic counter tracking**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-02T09:22:50Z
- **Completed:** 2026-03-02T09:23:36Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Removed hardcoded `isPaid: args.path === "evaluation" ? false : true` — replaced with `isPaid: true` (free sessions owe nothing)
- Free tier gate reads from `pricingConfig` (freeExploreLimit / freeEvaluateLimit) and `userFreeTier` (per-user usage counters)
- First-time users automatically get a `userFreeTier` record created atomically with their first session
- Exhausted free tier throws "Payment required. Paid sessions coming soon!" — Phase 12 will replace with Stripe redirect
- All changes run inside a single Convex mutation (ACID transaction — no partial writes possible)
- Convex push succeeded with no type errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire free tier check into createSession** - `3a5b61a` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `convex/sessions.ts` - createSession now enforces free tier via pricingConfig + userFreeTier; counter incremented atomically after insert

## Decisions Made
- `isPaid: true` for free sessions — semantics: free sessions have no outstanding payment, so they are "paid" from the system's perspective
- Free tier counter increment placed AFTER the session insert so a failed insert never inflates the counter
- Blocking check placed BEFORE the insert so exhausted users never trigger a DB write

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - Convex push succeeded on first attempt with no type errors.

## User Setup Required

None - no external service configuration required. Uses tables created in plan 11-01.

## Next Phase Readiness

- Free tier enforcement is fully operational — users get exactly 1 free Explore and 1 free Evaluate session
- Phase 12 (Stripe Checkout) can now intercept the "Payment required" error and redirect to Checkout instead of throwing
- The `isPaid` field will be updated to `true` by Phase 12 payment webhook after successful payment

---
*Phase: 11-pricing-engine*
*Completed: 2026-03-02*
