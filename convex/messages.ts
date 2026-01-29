import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "./auth";

// Get all messages for a session (DATA-01: with timestamps)
export const getSessionMessages = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify session ownership
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      return [];
    }

    return await ctx.db
      .query("messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});

// Paginated messages query for lazy-loading history
// Returns desc order (most recent first) - client reverses to show oldest at top
export const paginatedMessages = query({
  args: {
    sessionId: v.id("sessions"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { page: [], continueCursor: null, isDone: true };
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      return { page: [], continueCursor: null, isDone: true };
    }

    // Order desc = most recent first for pagination
    // Client reverses to show oldest at top
    return await ctx.db
      .query("messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Get messages for specific phase
export const getPhaseMessages = query({
  args: {
    sessionId: v.id("sessions"),
    phase: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      return [];
    }

    return await ctx.db
      .query("messages")
      .withIndex("by_session_phase", (q) =>
        q.eq("sessionId", args.sessionId).eq("phase", args.phase)
      )
      .order("asc")
      .collect();
  },
});

// Save a message (DATA-01: save every message with timestamp)
export const saveMessage = mutation({
  args: {
    sessionId: v.id("sessions"),
    phase: v.number(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    thinking: v.optional(v.string()), // Extended thinking content from Claude
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify session ownership
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    const messageId = await ctx.db.insert("messages", {
      sessionId: args.sessionId,
      phase: args.phase,
      role: args.role,
      content: args.content,
      thinking: args.thinking,
      timestamp: Date.now(),
    });

    // Touch the session's lastActiveAt
    await ctx.db.patch(args.sessionId, { lastActiveAt: Date.now() });

    return messageId;
  },
});

// Get message count for a session (useful for summaries)
export const getMessageCount = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      return 0;
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    return messages.length;
  },
});
