# Phase 11: Pricing Engine - Research

**Researched:** 2026-03-02
**Domain:** Convex backend — schema design, pure business logic, query/mutation patterns
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Free Tier Tracking
- Free sessions are one-time only — deleting a free session does NOT restore the free credit
- Track free tier usage in a user-level record (new table), not derived from scanning sessions
- Free tier limits are configurable (stored in config table alongside launch date), not hardcoded
- No UI indication that a session was free — Phase 12 handles all paywall UX

#### Price Computation
- Pure function: `$2 × 2^(floor(daysSinceLaunch / 7))`, capped at $64
- Price computed at payment time — no lock-in, no stale prices
- Doubling happens on exact 7-day intervals from launch date (not fixed day of week)
- No discount/coupon layer — dead simple for v1.1
- Exposed as Convex query only (no HTTP endpoint for now)

#### Payment Records Schema
- Stripe-aware from the start: include optional stripeSessionId, stripePaymentIntentId fields
- Four statuses: pending, completed, failed, refunded
- Store price snapshot (exact amount paid) — essential for accounting and refunds
- Keep `isPaid` boolean on sessions table as denormalized cache; payment records table is source of truth

#### Launch Date Configuration
- Single-row settings table in Convex DB (pricingConfig or similar)
- Fields: launchDate, freeExploreLimit, freeEvaluateLimit
- Internal mutation only — changeable from Convex dashboard, no user-facing admin UI
- If no config row exists (fresh deploy), block paid sessions — requires explicit configuration before going live

### Claude's Discretion
- Exact table naming and field naming conventions
- How to seed the initial config row (migration script, dashboard, or init function)
- Error messages for edge cases
- Whether to combine free tier tracking and pricing config into one table or keep separate

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PAY-01 | User gets 1 free Explore session and 1 free Evaluate session | Free tier tracking table + `checkFreeTier` query pattern |
| PAY-03 | Base price is $2, doubling globally every week from launch date | Pure price computation function, `getCurrentPrice` query |
| PAY-04 | Price caps at $64 maximum | Cap logic in pure price function (`Math.min`) |
| PAY-07 | Payment records stored per user with session linkage | `payments` table schema with userId + sessionId |
| PAY-08 | Launch date configurable (controls when doubling starts) | `pricingConfig` table with `launchDate` field, internal mutation to upsert |
</phase_requirements>

---

## Summary

Phase 11 is a pure Convex backend phase — no UI, no Stripe integration yet. The work is entirely schema additions, pure TypeScript business logic for price calculation, and Convex query/mutation functions. No new npm packages are required.

The project already has a fully established Convex pattern: `defineTable` in `convex/schema.ts`, string userId (Clerk ID) across all tables, `getAuthUserId` for auth checks, `internalMutation` for privileged writes. Phase 11 follows this exact pattern for three new tables: `pricingConfig`, `userFreeTier`, and `payments`.

The critical design constraint is that `createSession` in `convex/sessions.ts` currently sets `isPaid` based on a hardcoded heuristic (`path === "evaluation" ? false : true`). Phase 11 replaces this with a real free tier check. The integration point is `createSession` — it must query `userFreeTier` before inserting the session row.

**Primary recommendation:** Create `convex/pricing.ts` as the single module containing all three new tables' queries/mutations and the pure price computation function. Wire it into `createSession` with a pre-creation free tier check.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| convex | Already installed | Database, queries, mutations | Project's established backend |
| convex/values `v` | Already installed | Runtime type validation for schema | All tables use this |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | — | — | No new packages needed |

**Installation:**
```bash
# No new packages — all Convex primitives are already installed
```

---

## Architecture Patterns

### Recommended File Structure
```
convex/
├── pricing.ts           # NEW: all pricing engine logic
├── schema.ts            # MODIFY: add 3 new tables
├── sessions.ts          # MODIFY: wire free tier check into createSession
└── billing.ts           # UNCHANGED: keyword credits system (unrelated)
```

### Pattern 1: Convex Schema Addition

The project defines all tables in a single `convex/schema.ts`. New tables go there following the established pattern.

**What:** Add `pricingConfig`, `userFreeTier`, `payments` tables
**When to use:** Any time persistent state is needed in this project

```typescript
// Source: existing convex/schema.ts pattern
pricingConfig: defineTable({
  launchDate: v.number(),          // Unix ms — controls doubling start
  freeExploreLimit: v.number(),    // Default 1
  freeEvaluateLimit: v.number(),   // Default 1
  updatedAt: v.number(),
}),
// No index needed — always queried as single row

userFreeTier: defineTable({
  userId: v.string(),              // Clerk user ID, consistent with all other tables
  freeExploreUsed: v.number(),     // Count consumed (0 or 1 in v1.1, but numeric for future)
  freeEvaluateUsed: v.number(),
  createdAt: v.number(),
  lastUpdatedAt: v.number(),
}).index("by_user", ["userId"]),

payments: defineTable({
  userId: v.string(),
  sessionId: v.id("sessions"),
  amountCents: v.number(),         // Price snapshot in cents (200, 400, ..., 6400)
  status: v.union(
    v.literal("pending"),
    v.literal("completed"),
    v.literal("failed"),
    v.literal("refunded")
  ),
  stripeSessionId: v.optional(v.string()),
  stripePaymentIntentId: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_session", ["sessionId"])
  .index("by_user_status", ["userId", "status"]),
```

### Pattern 2: Pure Price Computation Function

**What:** A plain TypeScript function (no Convex context needed) that computes current price
**When to use:** Called inside Convex queries; testable in isolation

```typescript
// convex/pricing.ts — pure function, no side effects
export function computeCurrentPriceCents(
  launchDateMs: number,
  nowMs: number = Date.now()
): number {
  const BASE_CENTS = 200;      // $2.00
  const CAP_CENTS = 6400;      // $64.00
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

  if (nowMs < launchDateMs) {
    // Before launch: use base price
    return BASE_CENTS;
  }

  const daysSinceLaunch = (nowMs - launchDateMs) / MS_PER_WEEK;
  const doublings = Math.floor(daysSinceLaunch); // floor(weeks elapsed)
  const priceCents = BASE_CENTS * Math.pow(2, doublings);
  return Math.min(priceCents, CAP_CENTS);
}
```

Note: The formula from CONTEXT.md is `$2 × 2^(floor(daysSinceLaunch / 7))`. The division by 7 converts days to weeks. Since `daysSinceLaunch` is already in weeks in this implementation (dividing ms by `MS_PER_WEEK`), `floor(daysSinceLaunch)` gives the floor of weeks elapsed — matching the spec exactly.

### Pattern 3: Single-Row Config Table Query

**What:** `pricingConfig` is always a single row; queries fetch `.first()` and throw if absent (no live session can proceed without config).

```typescript
// Source: convex/billing.ts pattern adapted
export const getPricingConfig = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db.query("pricingConfig").first();
    return config ?? null; // null signals "not configured"
  },
});

export const getCurrentPrice = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db.query("pricingConfig").first();
    if (!config) {
      return { configured: false, priceCents: null };
    }
    const priceCents = computeCurrentPriceCents(config.launchDate);
    return { configured: true, priceCents, priceUsd: priceCents / 100 };
  },
});
```

### Pattern 4: Free Tier Check Before Session Creation

**What:** `createSession` must consult free tier before inserting. Free tier record is created lazily on first check.

```typescript
// Inside createSession mutation handler, before ctx.db.insert("sessions", ...)
const config = await ctx.db.query("pricingConfig").first();
if (!config) {
  throw new Error("Service not yet configured. Please try again later.");
}

const freeTier = await ctx.db
  .query("userFreeTier")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .first();

const pathKey = args.path === "exploration" ? "freeExploreUsed" : "freeEvaluateUsed";
const pathLimit = args.path === "exploration" ? config.freeExploreLimit : config.freeEvaluateLimit;
const used = freeTier ? freeTier[pathKey] : 0;
const isFree = used < pathLimit;

// Determine isPaid value for the new session
const isPaid = isFree ? true : false; // free sessions treated as "paid" (no payment needed)
```

After session creation, increment the free tier counter atomically:

```typescript
if (isFree) {
  if (freeTier) {
    await ctx.db.patch(freeTier._id, {
      [pathKey]: used + 1,
      lastUpdatedAt: Date.now(),
    });
  } else {
    await ctx.db.insert("userFreeTier", {
      userId,
      freeExploreUsed: args.path === "exploration" ? 1 : 0,
      freeEvaluateUsed: args.path === "evaluation" ? 1 : 0,
      createdAt: Date.now(),
      lastUpdatedAt: Date.now(),
    });
  }
}
```

### Pattern 5: Internal Mutation for Config Seeding

**What:** `internalMutation` that upserts `pricingConfig` — runs from Convex dashboard, never exposed to users.

```typescript
// Source: convex/billing.ts addCredits pattern
export const setPricingConfig = internalMutation({
  args: {
    launchDate: v.number(),
    freeExploreLimit: v.optional(v.number()),
    freeEvaluateLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("pricingConfig").first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        launchDate: args.launchDate,
        freeExploreLimit: args.freeExploreLimit ?? existing.freeExploreLimit,
        freeEvaluateLimit: args.freeEvaluateLimit ?? existing.freeEvaluateLimit,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("pricingConfig", {
        launchDate: args.launchDate,
        freeExploreLimit: args.freeExploreLimit ?? 1,
        freeEvaluateLimit: args.freeEvaluateLimit ?? 1,
        updatedAt: now,
      });
    }
  },
});
```

### Pattern 6: Public Query for "Free Sessions Remaining"

Required by success criterion #5 — third-party developer queryable.

```typescript
export const getFreeTierStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const config = await ctx.db.query("pricingConfig").first();
    if (!config) return null;

    const freeTier = await ctx.db
      .query("userFreeTier")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return {
      exploreRemaining: config.freeExploreLimit - (freeTier?.freeExploreUsed ?? 0),
      evaluateRemaining: config.freeEvaluateLimit - (freeTier?.freeEvaluateUsed ?? 0),
      exploreFreeLimit: config.freeExploreLimit,
      evaluateFreeLimit: config.freeEvaluateLimit,
    };
  },
});
```

### Anti-Patterns to Avoid

- **Deriving free tier from session count queries:** The decisions locked table-based tracking. Never use `count sessions where isFree` — that's fragile and doesn't survive deletes.
- **Hardcoding limits:** The existing `createSession` hardcodes `isPaid: args.path === "evaluation" ? false : true`. Replace entirely with config-driven logic.
- **Floating-point price in dollars:** Store and compute in cents (integers) to avoid rounding errors. Only convert to USD string at display time.
- **Not storing price snapshot:** Always write `amountCents` to the payment record at creation time. Price changes weekly; the snapshot is the accounting record.
- **Blocking on missing config in queries (not mutations):** Queries that return current price should return `{ configured: false }` gracefully, not throw. Mutations that create paid sessions should throw with a human-readable error.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Atomic multi-table writes | Manual transaction simulation | Convex mutation (single transaction by default) | Every Convex mutation runs in a single serializable transaction automatically |
| User identity | Custom JWT parsing | `getAuthUserId(ctx)` from `convex/auth.ts` | Already handles Clerk JWT, used consistently everywhere |
| Schema validation | Manual type checks | `v.*` validators in `defineTable` | Convex enforces at write time; no runtime surprises |

**Key insight:** Convex mutations are fully ACID by default. The free tier increment + session insert can happen in one mutation with no risk of partial writes. This is the reason for doing the free tier check AND the insert in `createSession` rather than splitting into two mutations.

---

## Common Pitfalls

### Pitfall 1: Free Tier Race Condition (Not a Real Risk in Convex)
**What goes wrong:** Two simultaneous `createSession` calls both see `freeExploreUsed = 0` and both consume the free credit, giving user two free sessions instead of one.
**Why it happens:** Race condition in non-transactional systems.
**How to avoid:** Not a concern — Convex mutations are serialized per user by the OCC (optimistic concurrency control) runtime. Both mutations will run sequentially. However, be aware that Convex uses OCC — if the mutation is retried (due to conflict), the free tier check runs again on the fresh state. This is correct behavior; no special handling needed.
**Warning signs:** N/A — architecture prevents this.

### Pitfall 2: `pricingConfig` Table Has No Index
**What goes wrong:** Querying `.first()` on a table with no index falls back to full table scan. With one row, this is fine. But Convex may warn about missing index in production.
**Why it happens:** Single-row config tables feel like they need no index.
**How to avoid:** Accept the full scan — it's one row. Alternatively add a sentinel index field `_singleton: v.literal("config")` with a unique index if Convex produces warnings. For v1.1 with one row, no index is fine.
**Warning signs:** Convex dashboard warnings about full table scans.

### Pitfall 3: `isPaid` Semantic Confusion
**What goes wrong:** Current `createSession` sets `isPaid: true` for exploration sessions unconditionally. After Phase 11, `isPaid` means "user does not owe money for this session" — which is true for free sessions AND paid sessions, false only for sessions created before payment completes.
**Why it happens:** The field semantics need to shift from "exploration is always free" to "payment resolved."
**How to avoid:** For Phase 11 (no Stripe yet), free sessions get `isPaid: true`. Paid sessions that are created without Stripe (not possible in Phase 11) would get `isPaid: false`. The payment records table is the source of truth; `isPaid` on sessions is the denormalized cache.
**Warning signs:** Sessions where `isPaid: false` and no matching payment record with `status: "pending"` — that would be a data inconsistency.

### Pitfall 4: Price Computed Before Launch Date
**What goes wrong:** If `nowMs < launchDateMs`, the formula `(nowMs - launchDateMs)` is negative, and `Math.floor(negative / 7)` produces a large negative number, which makes `2^negative` approach 0 — returning a price near $0.
**Why it happens:** Math.pow handles negative exponents as fractions.
**How to avoid:** Guard explicitly: `if (nowMs < launchDateMs) return BASE_CENTS;`. Pre-launch always returns $2.
**Warning signs:** `getCurrentPrice` returning a value less than $2.

### Pitfall 5: `internalMutation` Not Visible from Frontend
**What goes wrong:** Developer tries to call `setPricingConfig` from the app or a test script and gets "function not found" error.
**Why it happens:** `internalMutation` functions are only callable from other Convex functions (actions, mutations, scheduled jobs) or from the Convex dashboard Run panel — not from `useMutation` in React.
**How to avoid:** Document clearly that `setPricingConfig` runs from the Convex dashboard. For testing from Next.js app, create a temporary `mutation` wrapper (non-internal) that can be removed post-launch.
**Warning signs:** TypeScript error: "internalMutation is not assignable to MutationBuilder."

---

## Code Examples

Verified patterns from existing codebase:

### Auth Check Pattern (from convex/billing.ts)
```typescript
// Source: convex/billing.ts — used consistently across ALL mutations
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("Not authenticated");
```

### Index Query Pattern (from convex/billing.ts)
```typescript
// Source: convex/billing.ts getCredits
const record = await ctx.db
  .query("tableName")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .first();
```

### Upsert Pattern (from convex/billing.ts addCredits)
```typescript
// Source: convex/billing.ts — insert if missing, patch if exists
if (existing) {
  await ctx.db.patch(existing._id, { /* updates */ });
} else {
  await ctx.db.insert("tableName", { /* full record */ });
}
```

### internalMutation Pattern (from convex/billing.ts addCredits)
```typescript
// Source: convex/billing.ts
export const setPricingConfig = internalMutation({
  args: { ... },
  handler: async (ctx, args) => { ... },
});
```

### Price Computation (new — verified against spec)
```typescript
// Pure function — no Convex context needed
export function computeCurrentPriceCents(
  launchDateMs: number,
  nowMs: number = Date.now()
): number {
  const BASE_CENTS = 200;
  const CAP_CENTS = 6400;
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

  if (nowMs < launchDateMs) return BASE_CENTS;

  const weeksElapsed = (nowMs - launchDateMs) / MS_PER_WEEK;
  const doublings = Math.floor(weeksElapsed);
  return Math.min(BASE_CENTS * Math.pow(2, doublings), CAP_CENTS);
}

// Price schedule verification:
// Week 0: $2 × 2^0 = $2    ✓
// Week 1: $2 × 2^1 = $4    ✓
// Week 2: $2 × 2^2 = $8    ✓
// Week 3: $2 × 2^3 = $16   ✓
// Week 4: $2 × 2^4 = $32   ✓
// Week 5: $2 × 2^5 = $64   (cap applies) ✓
// Week 6+: capped at $64   ✓
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `isPaid: true` hardcoded for exploration | Config-driven free tier check | Enables configurable free limits |
| No payment table | `payments` table with Stripe fields pre-wired | Phase 12 can write to it immediately |
| No pricing config | `pricingConfig` single-row table | Launch date changeable without code deploy |

**Deprecated/outdated:**
- `isPaid: args.path === "evaluation" ? false : true` in `createSession`: Remove this logic. Replace with free tier check against `pricingConfig` limits.

---

## Open Questions

1. **Table naming: separate vs combined config**
   - What we know: CONTEXT.md says "Claude's Discretion" on whether to combine free tier tracking and pricing config into one table
   - What's unclear: Whether `userFreeTier` (per-user) and `pricingConfig` (global) should be separate
   - Recommendation: Keep separate. They have different cardinalities (one global config row vs one row per user). Combining would require a confusing schema.

2. **Seeding the initial `pricingConfig` row**
   - What we know: CONTEXT.md says Claude's Discretion on how to seed
   - What's unclear: Whether to create an `internalMutation` callable from dashboard, or a separate seed script
   - Recommendation: `internalMutation` (`setPricingConfig`) callable from Convex dashboard's "Run" panel. This is the simplest approach — no separate tooling, works in production and development.

3. **How `createSession` handles paid sessions in Phase 11 (no Stripe yet)**
   - What we know: Phase 12 adds Stripe. Phase 11 only adds pricing engine.
   - What's unclear: Should users be allowed to create paid sessions in Phase 11 (pre-Stripe)?
   - Recommendation: When free tier is exhausted and Stripe isn't wired yet, throw an error like "Payment required — coming soon." This prevents data inconsistency (sessions with `isPaid: false` and no matching payment record). Phase 12 replaces this error with the Stripe redirect.

---

## Sources

### Primary (HIGH confidence)
- Existing `convex/schema.ts` — all table patterns verified from source
- Existing `convex/billing.ts` — internalMutation, upsert, auth check patterns
- Existing `convex/sessions.ts` — createSession mutation structure, integration point
- Existing `convex/auth.ts` — `getAuthUserId` helper signature
- `.planning/phases/11-pricing-engine/11-CONTEXT.md` — locked decisions

### Secondary (MEDIUM confidence)
- Convex documentation (from training, verified against existing project code) — mutation transaction semantics, internalMutation restrictions

### Tertiary (LOW confidence)
- None — all critical claims verified against project source code

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all Convex primitives already in use
- Architecture: HIGH — patterns derived directly from existing `convex/billing.ts` and `convex/sessions.ts`
- Pitfalls: HIGH for race condition + isPaid semantics (verified against Convex docs behavior); MEDIUM for dashboard-only internalMutation (verified against Convex pattern in project)

**Research date:** 2026-03-02
**Valid until:** 2026-04-02 (Convex API is stable; price formula is internal logic)
