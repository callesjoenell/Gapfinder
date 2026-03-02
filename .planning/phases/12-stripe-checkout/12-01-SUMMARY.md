---
phase: 12-stripe-checkout
plan: "01"
subsystem: payments
tags: [stripe, convex, webhook, checkout, payments]

# Dependency graph
requires:
  - phase: 11-pricing-engine
    provides: payments table schema, createPayment/updatePaymentStatus internalMutations, computeCurrentPriceCents
provides:
  - Stripe Checkout session creation httpAction at /api/stripe/create-checkout
  - Stripe webhook handler at /api/stripe/webhook with signature verification
  - createPaidSession internalMutation in sessions.ts with idempotency check
  - fulfillCheckout internalAction in stripeHelpers.ts bridging webhook to mutation
  - by_stripe_session index on payments table for idempotency lookup
affects: [13-checkout-frontend, payments, sessions]

# Tech tracking
tech-stack:
  added: [stripe@20.4.0]
  patterns:
    - "use node pragma in Convex for Node.js-only actions (Stripe SDK)"
    - "httpAction in stripe.ts, internalAction in stripeHelpers.ts — separate runtimes to allow webhook->mutation chain"
    - "Webhook-first: session created only after Stripe confirms payment (checkout.session.completed)"
    - "Idempotency via by_stripe_session index — duplicate webhooks return early without duplicating data"

key-files:
  created:
    - convex/stripe.ts
    - convex/stripeHelpers.ts
  modified:
    - convex/sessions.ts
    - convex/schema.ts
    - convex/http.ts
    - package.json

key-decisions:
  - "stripe.ts uses 'use node' — required for Stripe SDK which uses Node.js APIs"
  - "stripeHelpers.ts has NO 'use node' — must be default runtime to call internalMutation ctx.runMutation"
  - "Idempotency stored on payments table (by_stripe_session index) not sessions — payments table already has stripeSessionId field from Phase 11 schema"
  - "createPaidSession handles both session insert and payment record insert atomically in one mutation"
  - "CORS headers use process.env.APP_URL for origin — not wildcard, since this endpoint handles real money"

patterns-established:
  - "Convex 'use node' isolation: Node-runtime files only export httpActions, never mutations/queries"
  - "Webhook signature verification: always request.text() before Stripe constructEvent"
  - "Internal action bridge pattern: httpAction (node) -> internalAction (default) -> internalMutation — crosses runtime boundary cleanly"

requirements-completed: [PAY-02, PAY-05, PAY-06]

# Metrics
duration: 12min
completed: 2026-03-02
---

# Phase 12 Plan 01: Stripe Checkout Backend Summary

**Stripe Checkout backend with webhook-first session creation, signature verification, and idempotent createPaidSession mutation using by_stripe_session index**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-02T09:59:16Z
- **Completed:** 2026-03-02T10:11:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Created `convex/stripe.ts` (Node.js runtime) with `createCheckoutSession` and `stripeWebhook` httpActions
- Created `convex/stripeHelpers.ts` (default runtime) with `fulfillCheckout` internalAction that bridges webhook to mutation
- Added `createPaidSession` internalMutation to `convex/sessions.ts` with idempotency check — atomically inserts session + payment record
- Added `by_stripe_session` index to payments table for O(1) idempotency lookups
- Wired three HTTP routes in `convex/http.ts` (POST + OPTIONS create-checkout, POST webhook)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install stripe SDK and add createPaidSession mutation** - `c4f19e8` (feat)
2. **Task 2: Create Stripe HTTP actions and wire routes** - `6eb4359` (feat)

## Files Created/Modified
- `convex/stripe.ts` - HTTP actions for checkout creation and webhook handling ("use node" runtime)
- `convex/stripeHelpers.ts` - fulfillCheckout internalAction (default runtime, bridges to mutation)
- `convex/sessions.ts` - Added createPaidSession internalMutation with idempotency check
- `convex/schema.ts` - Added by_stripe_session index to payments table
- `convex/http.ts` - Added 3 routes: POST/OPTIONS /api/stripe/create-checkout, POST /api/stripe/webhook
- `package.json` - Added stripe@20.4.0 dependency

## Decisions Made
- Used two separate Convex files for Stripe logic: `stripe.ts` ("use node", httpActions only) and `stripeHelpers.ts` (default runtime, can call mutations). This is required by Convex's runtime separation — "use node" files cannot call mutations directly.
- Idempotency check placed in `createPaidSession` mutation (not the action), so it's atomic with the insert.
- CORS origin restricted to `process.env.APP_URL` rather than wildcard `*` — appropriate for payment endpoints.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

Before the Stripe integration goes live, the following environment variables must be set in the Convex dashboard (glad-bloodhound-996):

- `STRIPE_SECRET_KEY` — Stripe Dashboard -> Developers -> API keys -> Secret key
- `STRIPE_WEBHOOK_SECRET` — Stripe Dashboard -> Developers -> Webhooks -> Signing secret
  - Create endpoint: `https://glad-bloodhound-996.convex.site/api/stripe/webhook`
  - Events to listen to: `checkout.session.completed`
- `APP_URL` — Set to `https://start-building-now.vercel.app` (prod) or `http://localhost:5173` (dev)

## Next Phase Readiness
- Stripe backend is complete and TypeScript-clean — ready to deploy to Convex
- Phase 12 Plan 02 (frontend checkout flow) can now call `/api/stripe/create-checkout` and handle `?payment=success` / `?payment=cancelled` URL params
- Requires Stripe env vars to be set in Convex dashboard before testing end-to-end

## Self-Check: PASSED

- convex/stripe.ts: FOUND
- convex/stripeHelpers.ts: FOUND
- 12-01-SUMMARY.md: FOUND
- Commit c4f19e8 (Task 1): FOUND
- Commit 6eb4359 (Task 2): FOUND

---
*Phase: 12-stripe-checkout*
*Completed: 2026-03-02*
