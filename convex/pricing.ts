import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "./auth";

// ─── Constants ───────────────────────────────────────────────────────────────

const BASE_CENTS = 200;          // $2.00
const MAX_CENTS = 6400;          // $64.00
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

// ─── Pure price function (plain TypeScript — not a Convex function) ───────────

/**
 * Compute the current price in cents given a launch date.
 * Formula: $2 * 2^(floor(weeksElapsed)), capped at $64.
 *
 * @param launchDateMs - Unix ms timestamp when the price doubling schedule starts
 * @param nowMs        - Current time in Unix ms (defaults to Date.now())
 * @returns Price in cents (200, 400, 800, 1600, 3200, or 6400)
 */
export function computeCurrentPriceCents(launchDateMs: number, nowMs?: number): number {
  const now = nowMs ?? Date.now();
  if (now < launchDateMs) {
    return BASE_CENTS;
  }
  const weeksElapsed = Math.floor((now - launchDateMs) / MS_PER_WEEK);
  const priceCents = BASE_CENTS * Math.pow(2, weeksElapsed);
  return Math.min(priceCents, MAX_CENTS);
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Get the current price. Returns { configured: false, priceCents: null } when
 * no pricing config row exists, or the computed price when configured.
 */
export const getCurrentPrice = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db.query("pricingConfig").first();
    if (!config) {
      return { configured: false as const, priceCents: null };
    }
    const priceCents = computeCurrentPriceCents(config.launchDate);
    return {
      configured: true as const,
      priceCents,
      priceUsd: priceCents / 100,
    };
  },
});

/**
 * Get the raw pricing config row, or null if not yet configured.
 * No auth required — this is public info.
 */
export const getPricingConfig = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pricingConfig").first();
  },
});

/**
 * Get the free-tier status for the currently authenticated user.
 * Returns remaining free sessions for each path type, or null if not
 * authenticated or pricing is not configured.
 */
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

    const freeExploreUsed = freeTier?.freeExploreUsed ?? 0;
    const freeEvaluateUsed = freeTier?.freeEvaluateUsed ?? 0;

    return {
      exploreRemaining: Math.max(0, config.freeExploreLimit - freeExploreUsed),
      evaluateRemaining: Math.max(0, config.freeEvaluateLimit - freeEvaluateUsed),
      exploreFreeLimit: config.freeExploreLimit,
      evaluateFreeLimit: config.freeEvaluateLimit,
    };
  },
});

// ─── Internal Mutations ───────────────────────────────────────────────────────

/**
 * Create or update the single pricing config row (upsert).
 * Called from admin tooling / setup scripts — not exposed to end users.
 */
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

/**
 * Insert a payment record with status "pending".
 * Called when initiating a Stripe Checkout session.
 */
export const createPayment = internalMutation({
  args: {
    userId: v.string(),
    sessionId: v.id("sessions"),
    amountCents: v.number(),
    stripeSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("payments", {
      userId: args.userId,
      sessionId: args.sessionId,
      amountCents: args.amountCents,
      status: "pending",
      stripeSessionId: args.stripeSessionId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update the status of an existing payment record.
 * Called from Stripe webhook handler when payment state changes.
 */
export const updatePaymentStatus = internalMutation({
  args: {
    paymentId: v.id("payments"),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, {
      status: args.status,
      stripePaymentIntentId: args.stripePaymentIntentId,
      updatedAt: Date.now(),
    });
  },
});
