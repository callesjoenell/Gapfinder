import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";

/**
 * Set the current activity status for a session.
 * Called from actions (server-side) to report what's happening.
 */
export const set = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("activityStatus")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("activityStatus", {
        sessionId: args.sessionId,
        status: args.status,
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Clear the activity status when done.
 */
export const clear = internalMutation({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("activityStatus")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

/**
 * Get current activity status for a session.
 * Reactive query — UI updates in real-time.
 */
export const get = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const status = await ctx.db
      .query("activityStatus")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    return status?.status ?? null;
  },
});
