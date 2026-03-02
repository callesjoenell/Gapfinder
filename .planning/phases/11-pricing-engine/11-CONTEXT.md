# Phase 11: Pricing Engine - Context

**Gathered:** 2026-03-02
**Status:** Ready for planning

<domain>
## Phase Boundary

The app knows exactly what any user owes (or doesn't) when they try to create a session. Includes free tier tracking, weekly-doubling price logic, payment records, and configurable launch date. No user-facing paywall UI (that's Phase 12). No Stripe integration (Phase 12).

</domain>

<decisions>
## Implementation Decisions

### Free Tier Tracking
- Free sessions are one-time only — deleting a free session does NOT restore the free credit
- Track free tier usage in a user-level record (new table), not derived from scanning sessions
- Free tier limits are configurable (stored in config table alongside launch date), not hardcoded
- No UI indication that a session was free — Phase 12 handles all paywall UX

### Price Computation
- Pure function: `$2 × 2^(floor(daysSinceLaunch / 7))`, capped at $64
- Price computed at payment time — no lock-in, no stale prices
- Doubling happens on exact 7-day intervals from launch date (not fixed day of week)
- No discount/coupon layer — dead simple for v1.1
- Exposed as Convex query only (no HTTP endpoint for now)

### Payment Records Schema
- Stripe-aware from the start: include optional stripeSessionId, stripePaymentIntentId fields
- Four statuses: pending, completed, failed, refunded
- Store price snapshot (exact amount paid) — essential for accounting and refunds
- Keep `isPaid` boolean on sessions table as denormalized cache; payment records table is source of truth

### Launch Date Configuration
- Single-row settings table in Convex DB (pricingConfig or similar)
- Fields: launchDate, freeExploreLimit, freeEvaluateLimit
- Internal mutation only — changeable from Convex dashboard, no user-facing admin UI
- If no config row exists (fresh deploy), block paid sessions — requires explicit configuration before going live

### Claude's Discretion
- Exact table naming and field naming conventions
- How to seed the initial config row (migration script, dashboard, or init function)
- Error messages for edge cases
- Whether to combine free tier tracking and pricing config into one table or keep separate

</decisions>

<specifics>
## Specific Ideas

- Success criteria #5 requires queryable functions: "current price" and "free sessions remaining for user X" — these should be clean, documented Convex queries
- The existing `keywordCredits` table in billing.ts is unrelated to session pricing — don't conflate the two systems
- The existing `isPaid` boolean on sessions was a placeholder — now it becomes meaningful as a denormalized cache

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `convex/billing.ts`: Shows established pattern for credit/billing queries and mutations (getCredits, checkAccess, trackUsage, addCredits)
- `getAuthUserId` from `convex/auth.ts`: Standard auth check used across all mutations/queries
- `convex/http.ts`: HTTP endpoint router exists if HTTP exposure is ever needed

### Established Patterns
- Schema defined in `convex/schema.ts` with defineTable + indexes
- All tables use string userId (Clerk ID), not Convex Id<"users">
- Mutations check auth first, throw "Not authenticated" on failure
- Internal mutations (`internalMutation`) for privileged operations
- Soft delete pattern on sessions (`isDeleted: boolean`)

### Integration Points
- `convex/sessions.ts` `createSession` mutation — needs to check free tier / pricing before allowing creation
- `sessions` table `isPaid` field — already exists, needs to be kept in sync with payment records
- Phase 12 will call pricing engine functions to display prices and create Stripe sessions

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-pricing-engine*
*Context gathered: 2026-03-02*
