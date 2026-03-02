# Phase 12: Stripe Checkout - Context

**Gathered:** 2026-03-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Users who exhaust their free tier sessions see a paywall, pay via Stripe Checkout, and land in their new session automatically. Cancelling or failing payment returns them to the app with no charge and no session created.

</domain>

<decisions>
## Implementation Decisions

### Paywall UX
- Upgrade existing NewSessionModal — when user hits free tier limit, modal transforms to show pricing + pay button instead of the create form
- Show: current price, "price doubles in X days" countdown, free sessions remaining for other path type
- Encouraging, value-forward tone: "Ready for your next discovery? $2.00 — price increases in 4 days"
- Explicit "Maybe later" secondary button (not just X close) — makes it clear there's no pressure
- User can still browse existing sessions and use remaining free sessions on other paths

### Payment Flow
- Hosted Stripe Checkout (redirect mode) — user leaves app, pays on Stripe's page, redirects back
- Session created AFTER payment confirmed via webhook — no orphan sessions, safest approach
- Stripe Checkout session created via Convex HTTP action (not Next.js API route) — keeps all backend logic in Convex
- Webhook also handled by Convex HTTP action — single backend surface
- No intermediate waiting state needed while user is on Stripe's page — just handle success/cancel redirects

### Post-Payment Landing
- User lands directly in the new session after payment — fastest path to value
- If webhook hasn't fired yet when user returns, show "Setting up your session..." with spinner — Convex real-time subscription resolves automatically when session appears
- Session name/description captured in the paywall modal BEFORE redirecting to Stripe — one smooth flow
- Stripe handles receipt emails — no custom email infrastructure needed for v1

### Failure & Edge Cases
- Cancel on Stripe returns user to app with reassuring toast: "No charge — you can try again anytime"
- Cancel URL includes query param to trigger the toast notification
- Stripe retries webhook delivery for up to 3 days; if session not created within 30 seconds, show "Something went wrong" with support contact + retry option
- Stripe Checkout sessions are one-time — handles double-pay protection natively
- Each modal open queries fresh free tier status via Convex real-time — no stale state issues

### Claude's Discretion
- Exact paywall modal layout and spacing
- Loading spinner design for post-payment waiting
- Toast notification styling and duration
- Webhook idempotency implementation details
- Error message copy for edge cases
- How to pass session name/description through Stripe metadata to webhook

</decisions>

<specifics>
## Specific Ideas

- Paywall extends NewSessionModal rather than replacing it — keep the same name/description form, add pricing section when limit is hit
- "Maybe later" button text specifically (not generic "Cancel")
- Toast on cancel return should be reassuring, not guilt-inducing

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `NewSessionModal` (src/components/NewSessionModal.tsx): Already handles session creation form with name, description, path selection — paywall extends this
- `pricing.ts` (convex/pricing.ts): `getCurrentPrice`, `getFreeTierStatus`, `createPayment`, `updatePaymentStatus` — all pricing queries and mutations ready
- `sessions.ts` (convex/sessions.ts): `createSession` mutation with free tier check — currently throws "Payment required" error that Phase 12 replaces with Stripe flow

### Established Patterns
- Convex `useQuery` for real-time data subscriptions — natural fit for polling post-payment session creation
- `useMutation` pattern for triggering server-side actions from React components
- Modal pattern established by NewSessionModal — extends naturally
- `api.sessions.countSessionsByPath` already used for session limits

### Integration Points
- `createSession` mutation line 88-91: Replace `throw new Error("Payment required")` with Stripe Checkout redirect trigger
- NewSessionModal: Add paywall state when `isFree === false`
- New Convex HTTP actions needed: `/api/stripe/checkout` (create session) and `/api/stripe/webhook` (handle events)
- Success/cancel URLs: redirect back to app with appropriate query params
- `payments` table and `createPayment`/`updatePaymentStatus` mutations already exist in pricing.ts

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 12-stripe-checkout*
*Context gathered: 2026-03-02*
