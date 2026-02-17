import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Add a research item to the queue (save for later).
 */
export const addToQueue = mutation({
  args: {
    sessionId: v.id("sessions"),
    type: v.string(),
    label: v.string(),
    description: v.string(),
    query: v.string(),
    source: v.string(),
    priority: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("researchQueue", {
      sessionId: args.sessionId,
      type: args.type,
      label: args.label,
      description: args.description,
      query: args.query,
      source: args.source,
      priority: args.priority,
      status: "pending",
      createdAt: Date.now(),
    });
    return id;
  },
});

/**
 * Get pending research items for a session.
 */
export const getPendingItems = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("researchQueue")
      .withIndex("by_session_status", (q) =>
        q.eq("sessionId", args.sessionId).eq("status", "pending")
      )
      .order("desc")
      .collect();
  },
});

/**
 * Mark a queue item as completed.
 */
export const markCompleted = mutation({
  args: {
    itemId: v.id("researchQueue"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.itemId, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

/**
 * Dismiss a queue item (user decided not to do it).
 */
export const dismissItem = mutation({
  args: {
    itemId: v.id("researchQueue"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.itemId, {
      status: "dismissed",
    });
  },
});

/**
 * Get count of pending items for badge display.
 */
export const getPendingCount = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("researchQueue")
      .withIndex("by_session_status", (q) =>
        q.eq("sessionId", args.sessionId).eq("status", "pending")
      )
      .collect();
    return items.length;
  },
});
