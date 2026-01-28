import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

// List all sessions for current user (non-deleted, sorted by lastActiveAt)
export const listSessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("sessions")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("isDeleted", false)
      )
      .order("desc")
      .collect();
  },
});

// Get single session by ID
export const getSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId || session.isDeleted) {
      return null;
    }
    return session;
  },
});

// Create new session
export const createSession = mutation({
  args: {
    name: v.string(),
    path: v.union(v.literal("exploration"), v.literal("evaluation")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();

    const sessionId = await ctx.db.insert("sessions", {
      userId,
      name: args.name,
      currentPhase: args.path === "exploration" ? 0 : 4, // Start at phase 0 or 4
      path: args.path,
      isPaid: args.path === "evaluation" ? false : true, // Exploration is "paid" (free), Evaluation needs payment
      isDeleted: false,
      createdAt: now,
      lastActiveAt: now,
    });

    return sessionId;
  },
});

// Update session (name, phase, idea card state)
export const updateSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    name: v.optional(v.string()),
    currentPhase: v.optional(v.number()),
    ideaCardContent: v.optional(v.string()),
    ideaCardScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    const updates: Record<string, unknown> = {
      lastActiveAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.currentPhase !== undefined) updates.currentPhase = args.currentPhase;
    if (args.ideaCardContent !== undefined) updates.ideaCardContent = args.ideaCardContent;
    if (args.ideaCardScore !== undefined) updates.ideaCardScore = args.ideaCardScore;

    await ctx.db.patch(args.sessionId, updates);
  },
});

// Soft delete session
export const deleteSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, { isDeleted: true });
  },
});

// Touch session (update lastActiveAt)
export const touchSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.sessionId, { lastActiveAt: Date.now() });
  },
});
