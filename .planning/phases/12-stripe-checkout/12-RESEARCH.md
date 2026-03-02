# Phase 12: Stripe Checkout - Research

**Researched:** 2026-03-02
**Domain:** Stripe Checkout (hosted redirect mode) + Convex HTTP actions + React post-payment UX
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Paywall UX
- Upgrade existing NewSessionModal — when user hits free tier limit, modal transforms to show pricing + pay button instead of the create form
- Show: current price, "price doubles in X days" countdown, free sessions remaining for other path type
- Encouraging, value-forward tone: "Ready for your next discovery? $2.00 — price increases in 4 days"
- Explicit "Maybe later" secondary button (not just X close) — makes it clear there's no pressure
- User can still browse existing sessions and use remaining free sessions on other paths

#### Payment Flow
- Hosted Stripe Checkout (redirect mode) — user leaves app, pays on Stripe's page, redirects back
- Session created AFTER payment confirmed via webhook — no orphan sessions, safest approach
- Stripe Checkout session created via Convex HTTP action (not Next.js API route) — keeps all backend logic in Convex
- Webhook also handled by Convex HTTP action — single backend surface
- No intermediate waiting state needed while user is on Stripe's page — just handle success/cancel redirects

#### Post-Payment Landing
- User lands directly in the new session after payment — fastest path to value
- If webhook hasn't fired yet when user returns, show "Setting up your session..." with spinner — Convex real-time subscription resolves automatically when session appears
- Session name/description captured in the paywall modal BEFORE redirecting to Stripe — one smooth flow
- Stripe handles receipt emails — no custom email infrastructure needed for v1

#### Failure & Edge Cases
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PAY-02 | After free tier, creating a session triggers Stripe Checkout with current price | Stripe Checkout Session creation via Convex HTTP action; `createCheckoutSession` action calls `stripe.checkout.sessions.create()` with `price_data.unit_amount` from `getCurrentPrice` query |
| PAY-05 | Successful Stripe payment creates the session automatically | Webhook handler on `checkout.session.completed` calls `internal.sessions.createSession` via `ctx.runMutation`; real-time `useQuery` on session list notifies client when session appears |
| PAY-06 | Failed/cancelled payment returns user to app without creating session | `cancel_url` includes `?cancelled=1` query param; App.tsx `useEffect` reads param, fires sonner toast, cleans URL |
| PRICE-01 | User sees current price and "doubles in X days" messaging at paywall | `api.pricing.getCurrentPrice` + `api.pricing.getPricingConfig` provide `priceCents` and `launchDate`; days-until-doubling computed client-side from `launchDate` |
| PRICE-02 | Paywall shows how many free sessions remain (if any) | `api.pricing.getFreeTierStatus` returns `exploreRemaining` and `evaluateRemaining`; displayed in paywall state of NewSessionModal |
</phase_requirements>

---

## Summary

Phase 12 adds Stripe Checkout in hosted redirect mode to the existing NewSessionModal. When a user's free tier for the requested path is exhausted, the modal switches to a "paywall state" that shows the current price, a days-until-doubling countdown, and remaining free sessions for the other path type. On pay, the frontend calls a new Convex HTTP action to create a Stripe Checkout Session and receives a URL, then does `window.location.href = url` to redirect the user to Stripe's hosted page.

The session is NOT created optimistically. It is created only after Stripe fires `checkout.session.completed` to the Convex webhook HTTP action. The webhook handler verifies the signature, extracts session name/description from Stripe metadata, calls `ctx.runMutation(internal.sessions.createPaidSession, ...)` to insert the session and update the payment record atomically, then returns 200. When the user returns via the success URL, a `useEffect` in App.tsx detects the `?session_id=` query param, polls `useQuery(api.sessions.listSessions)` reactively until the new session appears (Convex real-time pushes it within ~1s), then auto-selects it. Cancel URL returns with `?cancelled=1` which triggers a sonner toast.

The two key Convex files to create are: `convex/stripe.ts` (Node.js runtime action for session creation + internal action for webhook fulfillment) and routes added to the existing `convex/http.ts`. The existing `payments` table schema and `createPayment`/`updatePaymentStatus` internal mutations are already wired and ready to use.

**Primary recommendation:** Keep all Stripe SDK logic in a single `convex/stripe.ts` file with `"use node"` pragma; expose two HTTP routes — POST `/api/stripe/create-checkout` (authenticated) and POST `/api/stripe/webhook` (public, signature-verified).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `stripe` (server) | 20.4.0 | Stripe Node.js SDK — creates sessions, verifies webhook signatures | Official Stripe SDK; required for `webhooks.constructEvent` raw-body signature check |
| Convex HTTP actions | built-in (convex ^1.31.6) | Backend HTTP endpoints for session creation + webhook handling | Keeps all backend logic in Convex per locked decision; already in use |
| `sonner` | ^2.0.7 | Toast notifications for cancel/error feedback | Already installed in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-router-dom` | ^7.13.0 | Reading/cleaning URL query params on redirect return | Already installed; use `useSearchParams` hook |

### Not Needed
The project does NOT use `@stripe/stripe-js` (client-side Stripe.js). Hosted Checkout redirect mode needs no client-side Stripe library — the browser is simply redirected to `session.url`.

**Installation:**
```bash
npm install stripe
```
(Only the server-side `stripe` package. No client-side package needed.)

---

## Architecture Patterns

### Recommended File Structure
```
convex/
├── stripe.ts          # "use node" — createCheckoutSession action + fulfillWebhook internalAction
├── http.ts            # Add 2 routes: POST /api/stripe/create-checkout, POST /api/stripe/webhook
├── pricing.ts         # Already exists — getCurrentPrice, getFreeTierStatus, createPayment, updatePaymentStatus
└── sessions.ts        # Add createPaidSession internalMutation (or extend createSession)

src/components/
└── NewSessionModal.tsx  # Add paywall state — transform modal when isFree === false
```

### Pattern 1: Convex Node.js Action for Checkout Session Creation

The Stripe SDK requires Node.js APIs, so `convex/stripe.ts` MUST have `"use node"` at the top. This file cannot contain queries or mutations — only actions. Database access happens via `ctx.runMutation(internal.pricing.createPayment, ...)`.

```typescript
// convex/stripe.ts
"use node";
import Stripe from "stripe";
import { action, httpAction, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "./auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// Called from the React modal via HTTP action
export const createCheckoutSession = httpAction(async (ctx, request) => {
  // Auth: verify Clerk JWT from Authorization header
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { path, name, description, amountCents } = body;

  // Create a pending payment record BEFORE Stripe redirect
  // (payments table exists from Phase 11, but we need a placeholder session)
  // NOTE: Session is NOT created yet — payment record links to a pending entry
  const pendingPaymentId = await ctx.runMutation(
    internal.stripe.createPendingPayment,
    { userId: identity.subject, amountCents, path, name, description }
  );

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        unit_amount: amountCents,
        product_data: { name: "Gap Finder Session" },
      },
      quantity: 1,
    }],
    metadata: {
      pendingPaymentId,
      path,
      name: name.substring(0, 40),       // Stripe metadata key: 40 char limit
      description: description?.substring(0, 500) || "",
    },
    success_url: `${process.env.APP_URL}?payment=success&pending=${pendingPaymentId}`,
    cancel_url: `${process.env.APP_URL}?payment=cancelled`,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
```

**Key constraint:** The `"use node"` file cannot export Convex queries or mutations. Create a separate `convex/stripeInternal.ts` (without `"use node"`) for any mutations called by the webhook.

### Pattern 2: Webhook Handler

```typescript
// In convex/stripe.ts (same file, still "use node")
export const stripeWebhook = httpAction(async (ctx, request) => {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const payload = await request.text(); // Raw body required for signature verification

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await ctx.runAction(internal.stripe.fulfillCheckout, {
      stripeSessionId: session.id,
      metadata: session.metadata ?? {},
      paymentIntentId: session.payment_intent as string,
    });
  }

  return new Response(null, { status: 200 });
});
```

### Pattern 3: HTTP Router Registration

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { createCheckoutSession, stripeWebhook } from "./stripe";

const http = httpRouter();

http.route({
  path: "/api/stripe/create-checkout",
  method: "POST",
  handler: createCheckoutSession,
});

http.route({
  path: "/api/stripe/webhook",
  method: "POST",
  handler: stripeWebhook,
});

export default http;
```

**Deployment URL:** `https://glad-bloodhound-996.convex.site/api/stripe/webhook`

### Pattern 4: React — Detect Return from Stripe

```typescript
// In App.tsx, add useEffect after auth check
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

// Inside MainApp component:
const [searchParams, setSearchParams] = useSearchParams();

useEffect(() => {
  const payment = searchParams.get("payment");
  const pendingId = searchParams.get("pending");

  if (payment === "cancelled") {
    toast.info("No charge — you can try again anytime");
    setSearchParams({}, { replace: true }); // Clean URL
  }

  if (payment === "success" && pendingId) {
    // Don't navigate yet — wait for the session to appear via real-time subscription
    // The webhook fires, createSession runs, listSessions updates reactively
    setSearchParams({}, { replace: true });
    // Store pendingId in state to show "Setting up session..." UI
    setPendingPaymentId(pendingId);
  }
}, [searchParams]);
```

### Pattern 5: Post-Payment Session Auto-Select

```typescript
// After success redirect, wait for session to appear
// Convex useQuery(api.sessions.listSessions) auto-updates when webhook creates session
// Match the new session by checking sessions created after redirect timestamp

useEffect(() => {
  if (!pendingPaymentId) return;

  // sessions is already subscribed via useQuery(api.sessions.listSessions)
  // When webhook fires, a new session appears in the list
  // Find it: it's the newest session that wasn't there before
  if (sessions && sessions.length > 0) {
    const newest = sessions[0]; // Already sorted by lastActiveAt desc
    if (newest && newest.isPaid && !newest.isDeleted) {
      setCurrentSessionId(newest._id);
      setPendingPaymentId(null);
    }
  }
}, [sessions, pendingPaymentId]);
```

**More robust alternative:** Pass session ID back via success URL. The `fulfillCheckout` internal action creates the session and returns its ID; store it on the payment record. Success URL becomes `?payment=success&sessionId={SESSION_ID}`. On return, directly set `currentSessionId` to that ID and poll until session is loaded.

### Pattern 6: NewSessionModal Paywall State

The modal already has `useQuery(api.pricing.getFreeTierStatus)` equivalent. Add:

```typescript
// NewSessionModal.tsx additions
const freeTierStatus = useQuery(api.pricing.getFreeTierStatus);
const currentPrice = useQuery(api.pricing.getCurrentPrice);
const pricingConfig = useQuery(api.pricing.getPricingConfig);

// Compute days until next doubling
function daysUntilDoubling(launchDateMs: number): number {
  const now = Date.now();
  if (now < launchDateMs) return Math.ceil((launchDateMs - now) / 86400000);
  const weeksElapsed = Math.floor((now - launchDateMs) / (7 * 86400000));
  const nextDoubling = launchDateMs + (weeksElapsed + 1) * 7 * 86400000;
  return Math.ceil((nextDoubling - now) / 86400000);
}

const pathKey = path === "exploration" ? "exploreRemaining" : "evaluateRemaining";
const isPaywalled = freeTierStatus !== undefined && freeTierStatus !== null
  && freeTierStatus[pathKey] === 0;
```

When `isPaywalled === true`, replace the create form with the pricing display and "Pay" button.

### Anti-Patterns to Avoid

- **Don't create the session before payment:** Creating a Convex session before Stripe confirms payment leads to orphan sessions if user abandons checkout. Session creation MUST happen only in the webhook handler.
- **Don't use inline `price_data` product name without thought:** The product name appears on the Stripe receipt and the checkout page. Make it descriptive: "Gap Finder — [Explore/Evaluate] Session".
- **Don't put queries/mutations in the "use node" file:** Convex hard-restriction — `"use node"` files can only export actions. Put internal mutations in a separate file (`convex/stripeInternal.ts`).
- **Don't rely only on success URL redirect for fulfillment:** The success URL fires on browser redirect; the user can close the tab after payment but before redirect. Webhook is the authoritative fulfillment signal.
- **Don't read `request.body` as JSON for webhook:** Must use `request.text()` to get raw body string — required for `stripe.webhooks.constructEvent()` signature verification.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Stripe webhook signature verification | Custom HMAC validation | `stripe.webhooks.constructEvent(payload, signature, secret)` | Timing-safe comparison, handles timestamp tolerance, catches malformed headers |
| Payment method UI (card form, Apple Pay, etc.) | Custom payment form | Hosted Stripe Checkout (`mode: "payment"`) | Checkout natively handles SCA/3DS, Apple Pay, Google Pay, 30+ currencies, localization |
| Double-payment prevention | Custom idempotency locks | Stripe Checkout sessions are single-use by design | Each `checkout.sessions.create()` generates a unique one-time session; Stripe prevents replay |
| Receipt emails | Custom email infrastructure | Stripe sends receipt emails automatically on payment | Confirmed in project decisions — no email system needed |

**Key insight:** Hosted Stripe Checkout eliminates the hardest parts of payment UX (SCA compliance, mobile wallets, card input validation) at zero extra implementation cost.

---

## Common Pitfalls

### Pitfall 1: Webhook Signature Failure — Parsed Body
**What goes wrong:** `stripe.webhooks.constructEvent` throws `Stripe signature verification failed` even with correct secrets.
**Why it happens:** Any framework or middleware that parses the request body (e.g., `request.json()` before `request.text()`) corrupts the raw bytes Stripe signed. The signature is over the raw UTF-8 bytes.
**How to avoid:** In the webhook HTTP action, use `await request.text()` exclusively. Never call `request.json()` on a webhook endpoint.
**Warning signs:** `constructEvent` throws on first real webhook but works in local testing (because test payloads are small/clean).

### Pitfall 2: "use node" File Contains Mutations
**What goes wrong:** TypeScript compiles but Convex deployment fails with runtime error about mixing runtimes.
**Why it happens:** Convex enforces that files with `"use node"` can only export actions (httpAction, action, internalAction). Queries and mutations use a different runtime.
**How to avoid:** Keep `convex/stripe.ts` actions-only. Move any mutations needed by the webhook into `convex/stripeInternal.ts` (no `"use node"` directive) and call them via `ctx.runMutation(internal.stripeInternal.createSession, ...)`.
**Warning signs:** Deployment error mentioning "cannot mix runtimes" or "mutation in node file".

### Pitfall 3: Metadata String Length Overflow
**What goes wrong:** Stripe API returns 400 error when creating Checkout Session.
**Why it happens:** Stripe metadata values have a 500-character limit, keys have a 40-character limit.
**How to avoid:** Truncate session name to 40 chars and description to 500 chars before passing to metadata. Use `name.substring(0, 40)`.
**Warning signs:** Stripe API error `metadata[key] is too long` on checkout session creation.

### Pitfall 4: Stale Free Tier Status in Modal
**What goes wrong:** Modal shows free sessions remaining even after user just used them, or shows paywall when sessions should be available.
**Why it happens:** `useQuery(api.pricing.getFreeTierStatus)` is reactive but the component might be in a stale render before Convex pushes the update.
**How to avoid:** The CONTEXT.md already specifies "Each modal open queries fresh free tier status via Convex real-time." Because `useQuery` is a live subscription, reopening the modal will show the latest state automatically. No cache invalidation needed.
**Warning signs:** User sees "0 remaining" but was just able to create a session.

### Pitfall 5: Webhook Arrives Before User Returns
**What goes wrong:** Race condition — webhook handler tries to find the `pendingPaymentId` record but hasn't been inserted yet.
**Why it happens:** In the flow: (1) create pending payment record → (2) redirect to Stripe → (3) user pays → (4) webhook fires. The webhook always arrives AFTER the pending payment record exists (step 1 happens before redirect). This race does NOT exist.
**What does exist:** The reverse: user returns via success URL BEFORE webhook fires. The session won't exist yet. The "Setting up your session..." spinner handles this — `useQuery(listSessions)` updates reactively when webhook creates the session.
**Warning signs:** User stuck on spinner indefinitely (webhook delivery failed — check Stripe dashboard webhook logs).

### Pitfall 6: CORS on Checkout Session Creation Endpoint
**What goes wrong:** Browser blocks the POST to `https://glad-bloodhound-996.convex.site/api/stripe/create-checkout` from the Vercel frontend origin.
**Why it happens:** Convex HTTP actions require explicit CORS headers for browser cross-origin requests.
**How to avoid:** Add CORS headers to the `createCheckoutSession` HTTP action response AND handle the OPTIONS preflight:
```typescript
// Add to http.ts
http.route({
  path: "/api/stripe/create-checkout",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": process.env.APP_URL!,
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }
  })),
});
```
**Warning signs:** Browser console shows `CORS policy: No 'Access-Control-Allow-Origin' header`.

---

## Code Examples

Verified patterns from official sources:

### Creating a Stripe Checkout Session (Node.js)
```typescript
// Source: https://stack.convex.dev/stripe-with-convex + Stripe API docs
"use node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const session = await stripe.checkout.sessions.create({
  mode: "payment",
  line_items: [{
    price_data: {
      currency: "usd",
      unit_amount: amountCents,   // e.g. 200 for $2.00
      product_data: { name: "Gap Finder Session" },
    },
    quantity: 1,
  }],
  metadata: {
    key: "value",   // Max 50 pairs, keys ≤40 chars, values ≤500 chars
  },
  success_url: `${process.env.APP_URL}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.APP_URL}?payment=cancelled`,
});

return session.url; // Redirect browser to this URL
```

### Verifying Stripe Webhook Signature
```typescript
// Source: https://docs.stripe.com/webhooks + https://stack.convex.dev/stripe-with-convex
const payload = await request.text(); // Raw body — do NOT use request.json()
const signature = request.headers.get("stripe-signature")!;

const event = stripe.webhooks.constructEvent(
  payload,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);
// Throws if signature is invalid
```

### Registering HTTP Routes in Convex
```typescript
// Source: https://docs.convex.dev/functions/http-actions
import { httpRouter } from "convex/server";
const http = httpRouter();

http.route({ path: "/api/stripe/webhook", method: "POST", handler: stripeWebhook });
http.route({ path: "/api/stripe/create-checkout", method: "POST", handler: createCheckoutSession });
http.route({ path: "/api/stripe/create-checkout", method: "OPTIONS", handler: corsPreflightHandler });

export default http; // Must be default export from convex/http.ts
```

### Calling Internal Mutations from Node.js Actions
```typescript
// Source: https://docs.convex.dev/functions/runtimes
// "use node" actions CANNOT define mutations — call them via ctx.runMutation
await ctx.runMutation(internal.stripeInternal.createPaidSession, {
  userId,
  name,
  path,
  amountCents,
  stripeSessionId,
});
```

### Days Until Doubling Calculation (client-side)
```typescript
// Pure TypeScript — no library needed
function daysUntilDoubling(launchDateMs: number, nowMs = Date.now()): number {
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
  if (nowMs < launchDateMs) {
    return Math.ceil((launchDateMs - nowMs) / 86400000);
  }
  const weeksElapsed = Math.floor((nowMs - launchDateMs) / MS_PER_WEEK);
  const nextDoubling = launchDateMs + (weeksElapsed + 1) * MS_PER_WEEK;
  return Math.ceil((nextDoubling - nowMs) / 86400000);
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom payment form with Elements | Hosted Stripe Checkout | 2019+ (Checkout matured) | Handles SCA, mobile wallets, localization natively |
| Next.js API routes for Stripe | Convex HTTP actions | Project decision | Single backend surface, no separate server |
| Session created on redirect back | Session created on webhook | Best practice always | Prevents orphan sessions on abandoned checkout |

**Deprecated/outdated:**
- `stripe.redirectToCheckout()` (client-side): Old Stripe.js method that required loading stripe-js. Current approach is server-creates-session, client does `window.location.href = url`. No Stripe.js client library needed.

---

## Open Questions

1. **How to pass the session ID back on success URL**
   - What we know: Stripe supports `{CHECKOUT_SESSION_ID}` template variable in success URL: `success_url: "...?session_id={CHECKOUT_SESSION_ID}"`
   - What's unclear: The session ID in the success URL is the Stripe Checkout Session ID, not the Convex session ID. To get the Convex session ID, we need either: (a) store it on a payment record that the client queries by Stripe session ID, or (b) use the pendingPaymentId to look up the created Convex session.
   - Recommendation: In `fulfillCheckout` internalAction, after creating the Convex session, update the payment record with `sessionId`. On success return, client queries `api.payments.getByPendingId(pendingPaymentId)` to get the Convex session ID and navigate directly. This is cleaner than waiting for the session to appear in listSessions. However, if simplicity is preferred, just waiting for listSessions to update and selecting the newest session also works.

2. **Convex HTTP action auth for checkout creation endpoint**
   - What we know: `ctx.auth.getUserIdentity()` works in HTTP actions with Clerk Bearer tokens. The client needs to pass the Clerk session token as `Authorization: Bearer <token>`.
   - What's unclear: Whether `useAuth()` from Clerk React easily provides the raw JWT for this. In Convex React, the `ConvexProviderWithClerk` wrapper handles auth automatically for `useMutation`/`useAction`. For a raw `fetch()` to the HTTP action, the client must manually get and send the token.
   - Recommendation: Use `useConvexAuth` or `useAuth` with `getToken()` from Clerk. Alternative: expose `createCheckoutSession` as a regular Convex `action` (not HTTP action) and call it via `useAction` — this handles auth automatically. Then redirect to the returned URL. This is simpler than a raw HTTP action for authenticated operations.

3. **Idempotency for webhook replays**
   - What we know: Stripe retries webhooks for up to 3 days. Same `checkout.session.completed` event can arrive multiple times.
   - What's unclear: Specific implementation chosen for idempotency check.
   - Recommendation: In `fulfillCheckout`, before creating the session, check if `payments` record already has `status: "completed"`. If so, return early. The `stripeSessionId` field on the payment record is the unique idempotency key.

---

## Sources

### Primary (HIGH confidence)
- https://stack.convex.dev/stripe-with-convex — Official Convex blog post on Stripe integration; source for action patterns, HTTP routing, webhook verification flow
- https://docs.convex.dev/functions/http-actions — Convex HTTP actions official docs; source for httpAction, httpRouter, request.text(), CORS pattern
- https://docs.convex.dev/functions/runtimes — Convex runtimes official docs; source for "use node" constraints, runMutation from node actions
- https://docs.stripe.com/api/checkout/sessions/create — Stripe API reference; source for checkout session creation parameters
- https://docs.stripe.com/webhooks — Stripe webhook docs; source for signature verification, idempotency guidance
- https://docs.stripe.com/metadata — Stripe metadata docs; source for 40/500 char limits

### Secondary (MEDIUM confidence)
- https://www.npmjs.com/package/stripe — stripe npm package; confirmed latest version 20.4.0

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Stripe SDK + Convex HTTP actions is the verified official pattern for this project's architecture
- Architecture: HIGH — Pattern from official Convex blog post on Stripe; cross-referenced with Convex docs
- Pitfalls: HIGH — Webhook raw body requirement and "use node" file constraints are verified in official docs

**Research date:** 2026-03-02
**Valid until:** 2026-04-01 (Convex API is stable; Stripe API versioned, won't break before this date)
