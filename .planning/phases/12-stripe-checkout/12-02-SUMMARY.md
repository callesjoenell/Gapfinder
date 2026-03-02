---
phase: 12-stripe-checkout
plan: "02"
subsystem: payments
tags: [stripe, react, convex, clerk, paywall, checkout]

# Dependency graph
requires:
  - phase: 12-01
    provides: Stripe createCheckoutSession HTTP action, createPaidSession webhook handler
  - phase: 11-pricing-engine
    provides: getFreeTierStatus, getCurrentPrice, getPricingConfig queries
provides:
  - Paywall UX in NewSessionModal when free tier exhausted
  - Stripe Checkout redirect from modal
  - Payment return URL handling (success + cancel) in App.tsx
  - Spinner + auto-select after webhook creates paid session
affects: [ui, payments, sessions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Paywall state computed from Convex real-time query inside modal
    - Stripe redirect via fetch + window.location.href (no SDK on frontend)
    - Payment return detection via useSearchParams in App.tsx
    - Post-payment session auto-select via Convex real-time subscription diff
    - HTTP actions split from Node.js internalActions (Convex runtime constraint)

key-files:
  created: []
  modified:
    - src/components/NewSessionModal.tsx
    - src/App.tsx
    - convex/stripe.ts
    - convex/http.ts

key-decisions:
  - "Keep name/description fields visible on paywall — user fills them before redirecting to Stripe"
  - "Maybe later button text (not Cancel) — per CONTEXT.md locked decision"
  - "Paywall detected client-side via getFreeTierStatus query — no backend round-trip needed"
  - "30-second timeout on pendingPayment state before showing error toast"
  - "Auto-select newest session by lastActiveAt after webhook-triggered creation"
  - "httpAction cannot run in use-node runtime — HTTP actions live in http.ts (default runtime) and call internalActions in stripe.ts (Node.js runtime) for Stripe SDK calls"
  - "Price countdown copy changed to 'Price doubles in X days' (bold) — more specific and urgent than 'Price increases'"

patterns-established:
  - "Paywall pattern: useQuery-driven modal state transformation, same component handles both free and paid flows"
  - "Payment return pattern: useSearchParams detects ?payment=success|cancelled, clears params immediately"
  - "Convex runtime split: httpAction (default runtime, http.ts) -> internalAction (use node, stripe.ts) for any Stripe SDK usage"

requirements-completed: [PAY-02, PAY-06, PRICE-01, PRICE-02]

# Metrics
duration: ~30min
completed: 2026-03-02
---

# Phase 12 Plan 02: Stripe Checkout Frontend Summary

**Paywall modal with price/countdown display, Stripe Checkout redirect, and post-payment session auto-select via Convex real-time subscriptions — verified end-to-end with Stripe test card**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-03-02T10:02:58Z
- **Completed:** 2026-03-02T11:56:40Z
- **Tasks:** 2/2 (including human-verify checkpoint)
- **Files modified:** 4

## Accomplishments
- NewSessionModal transforms to paywall state when `getFreeTierStatus` returns 0 remaining for selected path
- Paywall shows current price (e.g., "$2.00"), "**Price doubles** in X days" countdown, and remaining free sessions for the other path type
- "Maybe later" / "Pay $X.XX" buttons with redirect to Stripe Checkout via Convex HTTP action
- App.tsx handles `?payment=cancelled` with reassuring toast and `?payment=success` with spinner that auto-resolves when webhook creates session
- 30-second timeout shows error toast if webhook session never arrives
- Full end-to-end payment flow verified in Stripe Sandbox (test card 4242... -> session auto-created)
- Resolved Convex runtime constraint: httpActions restructured into http.ts (default runtime) calling internalActions in stripe.ts (Node.js runtime)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add paywall state to NewSessionModal and payment return handling to App.tsx** - `0ec653e` (feat)
2. **Task 2: Verify complete payment flow end-to-end** - approved by user (checkpoint:human-verify)

**Plan metadata:** `cb07674` (docs: complete paywall UX plan)

## Files Created/Modified
- `src/components/NewSessionModal.tsx` - Paywall state with pricing display, daysUntilDoubling helper, handlePay function, Maybe later / Pay buttons; "Price doubles" copy with bold text
- `src/App.tsx` - useSearchParams for payment return handling, pendingPayment spinner, post-payment session auto-select via real-time subscription diff
- `convex/stripe.ts` - Refactored to "use node" runtime for Stripe SDK; HTTP actions removed, now only internalActions callable from http.ts
- `convex/http.ts` - HTTP actions live here (default runtime); call internalActions in stripe.ts for Stripe SDK operations

## Decisions Made
- Paywall detected purely client-side from `getFreeTierStatus` — no need for backend call just to check
- `daysUntilDoubling` is a pure function above the component (no deps, easy to test)
- Post-payment auto-select finds newest session by `lastActiveAt` (highest value) from the combined session list
- Timeout ref (`pendingPaymentStartRef`) checked during each Convex subscription update rather than via `setInterval` to avoid extra re-renders
- Copy change: "Price increases" -> "**Price doubles**" — more precise and impactful

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Restructured Convex stripe.ts and http.ts due to httpAction runtime constraint**
- **Found during:** Task 1 (deployment)
- **Issue:** `httpAction` cannot run in "use node" runtime. The original plan had HTTP actions and Stripe SDK calls co-located in convex/stripe.ts marked with "use node", which caused a Convex deployment error.
- **Fix:** Moved HTTP actions into convex/http.ts (default runtime). The http.ts handlers call `internalAction` functions in convex/stripe.ts (Node.js runtime) where the Stripe SDK is actually invoked.
- **Files modified:** convex/stripe.ts, convex/http.ts
- **Verification:** Convex deployed successfully; Stripe Checkout flow worked end-to-end in test
- **Committed in:** `0ec653e` (part of Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking — Convex runtime constraint)
**Impact on plan:** Required fix for deployment. No scope creep. Established a pattern for all future Stripe HTTP integrations.

## Issues Encountered
- Convex "use node" runtime does not support httpAction — required splitting HTTP routing and Stripe SDK calls across two files. This is now the established pattern for any Stripe webhook/action in Convex.

## User Setup Required
None — all Stripe env var setup was documented in Phase 12-01.

## Next Phase Readiness
- Full payment flow verified end-to-end in Stripe Sandbox
- Phase 12 (Stripe Checkout) complete — v1.1 Payments milestone is done
- Ready for v1.2 or any next milestone

---
*Phase: 12-stripe-checkout*
*Completed: 2026-03-02*
