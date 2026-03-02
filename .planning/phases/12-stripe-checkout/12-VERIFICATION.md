---
phase: 12-stripe-checkout
verified: 2026-03-02T12:00:00Z
status: human_needed
score: 9/9 must-haves verified
re_verification: false
human_verification:
  - test: "Paywall shows at correct threshold"
    expected: "When user has 0 remaining free sessions for selected path, modal shows pricing panel (price, doubling countdown, other-path free remaining) instead of plain create form"
    why_human: "Requires exhausted free tier state in a real account to observe"
  - test: "Pay button redirects to Stripe Checkout"
    expected: "Clicking Pay with a session name entered redirects browser to Stripe-hosted checkout page showing correct price and product name (Gap Finder — Explore/Evaluate Session)"
    why_human: "Requires Stripe env vars set in Convex dashboard and live network call"
  - test: "Stripe cancel returns with no session and toast"
    expected: "Clicking Back on Stripe checkout returns to app at ?payment=cancelled, toast says 'No charge — you can try again anytime', no session created"
    why_human: "Requires live Stripe test environment"
  - test: "Stripe success creates session and auto-selects it"
    expected: "After completing payment with test card 4242..., app shows 'Setting up your session...' spinner, then navigates into the new session automatically within a few seconds"
    why_human: "Requires live webhook delivery from Stripe to Convex deployment"
---

# Phase 12: Stripe Checkout Verification Report

**Phase Goal:** Users who hit the paywall can pay and land in their new session; those who don't stay safely in the app
**Verified:** 2026-03-02
**Status:** human_needed — all automated checks passed, 4 items require live Stripe environment testing
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | When free tier exhausted, creating a session redirects to Stripe Checkout with current price | VERIFIED | `NewSessionModal.tsx:50` — `isPaywalled` computed from `getFreeTierStatus`; `handlePay` at line 88 POSTs to convex.site endpoint and does `window.location.href = data.url` |
| 2 | Paywall screen shows current price, "price doubles in X days", how many free sessions remain | VERIFIED | `NewSessionModal.tsx:181-198` — pricing panel renders price (`priceDisplay`), `daysUntilDoubling` countdown, `otherRemaining` free sessions for other path |
| 3 | After successful payment, new session created automatically and user lands in it | VERIFIED | `App.tsx:127-161` — `pendingPayment` effect monitors session count diff via real-time Convex subscriptions; auto-selects newest session by `lastActiveAt` |
| 4 | Cancelling/failing Stripe payment returns user to app with no session and no charge | VERIFIED | `App.tsx:113-116` — `?payment=cancelled` detected, toast shown ("No charge — you can try again anytime"), params cleared; webhook-only session creation means no session without confirmed payment |
| 5 | Webhook creates session + payment atomically on checkout.session.completed | VERIFIED | `convex/sessions.ts:408-482` — `createPaidSession` internalMutation inserts session then payment in one mutation; idempotency check via `by_stripe_session` index at line 422 |
| 6 | Webhook signature verified before processing | VERIFIED | `convex/http.ts:109-118` — `verifyWebhookAction` called; 400 returned on signature failure before any state mutation |
| 7 | Webhook idempotent — replayed events do not create duplicate sessions | VERIFIED | `convex/sessions.ts:419-428` — checks `payments.by_stripe_session` index; if found, returns existing sessionId without re-inserting |
| 8 | Cancelled/failed payments create no session and no payment record | VERIFIED | Only `checkout.session.completed` events trigger `fulfillCheckout`; `stripe.ts:76` — event type gate; unhandled events return `{ handled: false }` and webhook returns 200 without calling fulfillCheckout |
| 9 | CORS headers present on checkout creation endpoint | VERIFIED | `convex/http.ts:22,47,68,83` — `Access-Control-Allow-Origin: appUrl` on all responses; OPTIONS preflight route at line 76-88 |

**Score:** 9/9 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `convex/stripe.ts` | Stripe SDK actions ("use node") | VERIFIED | Line 1: `"use node"`. Exports `createCheckoutSessionAction` (internalAction) and `verifyWebhookAction` (internalAction). No httpActions — correct per runtime constraint fix. |
| `convex/stripeHelpers.ts` | fulfillCheckout internalAction (default runtime) | VERIFIED | No "use node" pragma. Exports `fulfillCheckout` internalAction. Calls `ctx.runMutation(internal.sessions.createPaidSession, ...)` at line 27. |
| `convex/http.ts` | HTTP routes for /api/stripe/create-checkout and /api/stripe/webhook | VERIFIED | 3 routes: POST /api/stripe/create-checkout (line 9), OPTIONS /api/stripe/create-checkout (line 76), POST /api/stripe/webhook (line 92). |
| `convex/sessions.ts` | createPaidSession internalMutation with idempotency | VERIFIED | Exported at line 408. Idempotency check via `by_stripe_session` index at line 422. Atomically inserts session + payment record. |
| `convex/schema.ts` | by_stripe_session index on payments table | VERIFIED | Line 185: `.index("by_stripe_session", ["stripeSessionId"])` |
| `src/components/NewSessionModal.tsx` | Paywall state with pricing display and Pay button | VERIFIED | `isPaywalled` at line 50. Pricing panel at lines 181-198. `handlePay` at line 88. `daysUntilDoubling` pure function at line 15. |
| `src/App.tsx` | Payment return URL handling (success + cancel) | VERIFIED | `useSearchParams` at line 56. Payment return effect at lines 111-125. Auto-select effect at lines 127-161. Pending payment spinner at lines 195-200. |
| `package.json` | stripe dependency | VERIFIED | `"stripe": "^20.4.0"` present |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `convex/http.ts` (webhook handler) | `convex/stripeHelpers.ts` (fulfillCheckout) | `ctx.runAction(internal.stripeHelpers.fulfillCheckout, ...)` | WIRED | `http.ts:121` — exact call confirmed |
| `convex/stripeHelpers.ts` (fulfillCheckout) | `convex/sessions.ts` (createPaidSession) | `ctx.runMutation(internal.sessions.createPaidSession, ...)` | WIRED | `stripeHelpers.ts:27` — exact call confirmed |
| `convex/http.ts` | `convex/stripe.ts` (createCheckoutSessionAction) | `ctx.runAction(internal.stripe.createCheckoutSessionAction, ...)` | WIRED | `http.ts:56` — deviated from original plan (httpAction split into internalAction) but fully wired |
| `convex/http.ts` | `convex/stripe.ts` (verifyWebhookAction) | `ctx.runAction(internal.stripe.verifyWebhookAction, ...)` | WIRED | `http.ts:109` — webhook signature verification wired |
| `src/components/NewSessionModal.tsx` | `convex/pricing.ts` (getFreeTierStatus, getCurrentPrice, getPricingConfig) | `useQuery` subscriptions | WIRED | Lines 33-35 — all three queries subscribed and consumed in paywall display |
| `src/components/NewSessionModal.tsx` | Convex HTTP endpoint `/api/stripe/create-checkout` | `fetch POST` + `window.location.href` | WIRED | Lines 114-137 — POST with auth header, response URL used for redirect |
| `src/App.tsx` | sonner toast | `useSearchParams` detects `?payment=cancelled` | WIRED | Lines 113-116 — toast.info called on cancel param |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| PAY-02 | 12-01, 12-02 | After free tier, creating a session triggers Stripe Checkout with current price | SATISFIED | `NewSessionModal.tsx` paywall + `handlePay` → Stripe Checkout redirect |
| PAY-05 | 12-01 | Successful Stripe payment creates the session automatically | SATISFIED | `createPaidSession` internalMutation called by `fulfillCheckout` on `checkout.session.completed` |
| PAY-06 | 12-01, 12-02 | Failed/cancelled payment returns user to app without creating session | SATISFIED | Webhook-only creation; cancel URL handling in `App.tsx` |
| PRICE-01 | 12-02 | User sees current price and "doubles in X days" messaging at paywall | SATISFIED | `NewSessionModal.tsx:184-191` — price and `daysUntilDoubling` countdown rendered |
| PRICE-02 | 12-02 | Paywall shows how many free sessions remain (if any) | SATISFIED | `NewSessionModal.tsx:192-197` — renders `otherRemaining` free sessions for alternate path |

All 5 requirements assigned to Phase 12 are satisfied. No orphaned requirements found.

### Architecture Deviation Noted

The original 12-01-PLAN specified `httpAction` handlers inside `convex/stripe.ts` (with `"use node"`). During execution, this was found to be invalid — Convex does not permit `httpAction` in "use node" runtime files. The actual implementation correctly:

- Keeps HTTP routing in `convex/http.ts` (default runtime, can use `httpAction`)
- Moves Stripe SDK calls to `convex/stripe.ts` (Node.js runtime, exports `internalAction` only)
- Links them via `ctx.runAction(internal.stripe.*)` calls from `http.ts`

This is functionally equivalent and correctly deployed.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `convex/sessions.ts` | 90 | `throw new Error("Payment required. Paid sessions coming soon!")` in `createSession` | INFO | Backend stub message remains in `createSession` (the public mutation for free sessions). This code path is guarded client-side by the paywall — paywalled users call `handlePay`, not `createSession`. The error only fires if someone calls `createSession` directly after free tier is exhausted (e.g., via API). Does NOT block goal — paywall intercepts correctly in UI. |

No blocker anti-patterns found.

### Human Verification Required

#### 1. Paywall Renders at Correct Threshold

**Test:** Sign in as a user who has used their 1 free Explore session. Open "New Exploration" modal.
**Expected:** Modal shows pricing panel (price "$X.XX", "Price doubles in N days", remaining free Evaluate sessions), name/description fields, "Maybe later" and "Pay $X.XX" buttons.
**Why human:** Requires exhausted free tier state in a real account and live Convex query.

#### 2. Pay Button Redirects to Stripe Checkout

**Test:** In the paywalled modal, enter a session name and click "Pay $X.XX".
**Expected:** Browser redirects to Stripe Checkout page. Product shows "Gap Finder — Explore Session" with correct price. CORS headers allow the request.
**Why human:** Requires STRIPE_SECRET_KEY and APP_URL env vars set in Convex dashboard; live Stripe API call.

#### 3. Cancel Returns with Toast, No Session

**Test:** From Stripe Checkout page, click "Back" or "Cancel".
**Expected:** Browser returns to app URL with `?payment=cancelled` param. Toast appears: "No charge — you can try again anytime". No new session in sidebar.
**Why human:** Requires live Stripe sandbox and real redirect flow.

#### 4. Success Creates Session and Auto-Selects

**Test:** Complete payment with Stripe test card 4242 4242 4242 4242.
**Expected:** Browser returns to `?payment=success`. App shows "Setting up your session..." spinner. Within a few seconds (webhook delivery), new session appears in sidebar and is auto-selected. PathOverview shown for new session.
**Why human:** Requires live webhook delivery from Stripe to `https://glad-bloodhound-996.convex.site/api/stripe/webhook`. Confirms STRIPE_WEBHOOK_SECRET is set correctly.

### Gaps Summary

No gaps found. All automated checks passed:

- All 8 required artifacts exist with substantive implementations
- All 7 key links verified (wired, not stubs)
- All 5 phase requirements (PAY-02, PAY-05, PAY-06, PRICE-01, PRICE-02) satisfied
- TypeScript compiles with 0 errors
- No blocker anti-patterns
- All commits documented in git log (c4f19e8, 6eb4359, 0ec653e)

One informational finding: the `createSession` backend still has a placeholder error message ("Payment required. Paid sessions coming soon!") for the paid path. This is unreachable from the frontend paywall flow but could surface if the backend is called directly. It does not block the phase goal.

Phase goal achieved: the complete Stripe Checkout payment flow is implemented end-to-end. Human verification of the live payment flow is required before calling Phase 12 fully shipped.

---

_Verified: 2026-03-02_
_Verifier: Claude (gsd-verifier)_
