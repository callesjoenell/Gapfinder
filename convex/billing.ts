import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "./auth";

// Get user's credit balance
export const getCredits = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { creditsRemaining: 0, creditsUsed: 0 };
    }

    const credits = await ctx.db
      .query("keywordCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!credits) {
      // New users start with 0 credits (need to purchase)
      return { creditsRemaining: 0, creditsUsed: 0 };
    }

    return {
      creditsRemaining: credits.creditsRemaining,
      creditsUsed: credits.creditsUsed,
    };
  },
});

// Check if user can perform keyword lookup
export const checkKeywordAccess = mutation({
  args: {
    keywordCount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { allowed: false, reason: "Not authenticated" };
    }

    const credits = await ctx.db
      .query("keywordCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!credits || credits.creditsRemaining < args.keywordCount) {
      return {
        allowed: false,
        reason: "Insufficient credits",
        creditsNeeded: args.keywordCount,
        creditsAvailable: credits?.creditsRemaining || 0,
      };
    }

    return { allowed: true, creditsAvailable: credits.creditsRemaining };
  },
});

// Track usage after successful keyword lookup
export const trackKeywordUsage = mutation({
  args: {
    creditsUsed: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const credits = await ctx.db
      .query("keywordCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!credits) {
      throw new Error("No credit record found");
    }

    if (credits.creditsRemaining < args.creditsUsed) {
      throw new Error("Insufficient credits");
    }

    await ctx.db.patch(credits._id, {
      creditsRemaining: credits.creditsRemaining - args.creditsUsed,
      creditsUsed: credits.creditsUsed + args.creditsUsed,
      lastUpdated: Date.now(),
    });
  },
});

// Internal mutation to add credits (called after purchase - v2)
export const addCredits = internalMutation({
  args: {
    userId: v.string(),
    credits: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("keywordCredits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        creditsRemaining: existing.creditsRemaining + args.credits,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("keywordCredits", {
        userId: args.userId,
        creditsRemaining: args.credits,
        creditsUsed: 0,
        lastUpdated: Date.now(),
      });
    }
  },
});

// For testing: Grant free trial credits
export const grantTrialCredits = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("keywordCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      // Only grant if never had credits before
      if (existing.creditsUsed === 0 && existing.creditsRemaining === 0) {
        await ctx.db.patch(existing._id, {
          creditsRemaining: 50, // Trial: 50 free keyword lookups
          lastUpdated: Date.now(),
        });
      }
    } else {
      await ctx.db.insert("keywordCredits", {
        userId,
        creditsRemaining: 50,
        creditsUsed: 0,
        lastUpdated: Date.now(),
      });
    }
  },
});
