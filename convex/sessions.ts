import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "./auth";

// List all sessions for current user (non-deleted, sorted by lastActiveAt)
export const listSessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
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
    const userId = await getAuthUserId(ctx);
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
    description: v.optional(v.string()),
    linkedExplorationId: v.optional(v.id("sessions")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check 5-session limit per path
    const allSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId)
          .eq("isDeleted", false)
      )
      .collect();

    const activeSessionsForPath = allSessions.filter(session =>
      session.path === args.path && !session.isArchived
    );

    if (activeSessionsForPath.length >= 5) {
      if (args.path === "exploration") {
        throw new Error("You've explored 5 different areas! Consider committing to one and starting an evaluation to dive deeper.");
      } else {
        throw new Error("You have 5 evaluations in progress. Archive or complete some before starting new ones.");
      }
    }

    const now = Date.now();

    const sessionId = await ctx.db.insert("sessions", {
      userId,
      name: args.name,
      currentPhase: args.path === "exploration" ? 0 : 4, // Start at phase 0 or 4
      path: args.path,
      isPaid: args.path === "evaluation" ? false : true, // Exploration is "paid" (free), Evaluation needs payment
      isDeleted: false,
      isArchived: false,
      description: args.description,
      linkedExplorationId: args.linkedExplorationId,
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
    const userId = await getAuthUserId(ctx);
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
    const userId = await getAuthUserId(ctx);
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.sessionId, { lastActiveAt: Date.now() });
  },
});

// List sessions by path type (non-deleted, non-archived)
export const listSessionsByPath = query({
  args: { path: v.union(v.literal("exploration"), v.literal("evaluation")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const allSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId)
          .eq("isDeleted", false)
      )
      .order("desc")
      .collect();

    // Filter by path and exclude archived sessions (treating undefined as false)
    return allSessions.filter(session =>
      session.path === args.path && !session.isArchived
    );
  },
});

// List archived sessions (regardless of path)
export const listArchivedSessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const allSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_archived", (q) =>
        q.eq("userId", userId)
          .eq("isDeleted", false)
      )
      .order("desc")
      .collect();

    // Only return sessions where isArchived is explicitly true
    return allSessions.filter(session => session.isArchived === true);
  },
});

// Count active sessions per path (for limit checking)
export const countSessionsByPath = query({
  args: { path: v.union(v.literal("exploration"), v.literal("evaluation")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const allSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId)
          .eq("isDeleted", false)
      )
      .collect();

    // Count only non-archived sessions for the specific path (treating undefined as false)
    return allSessions.filter(session =>
      session.path === args.path && !session.isArchived
    ).length;
  },
});

// Archive a session
export const archiveSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, { isArchived: true });
  },
});

// Unarchive a session
export const unarchiveSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, { isArchived: false });
  },
});

// Advance to next phase (after user confirmation)
export const advancePhase = mutation({
  args: {
    sessionId: v.id("sessions"),
    toPhase: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    // Validate phase progression (must be next phase)
    if (args.toPhase !== session.currentPhase + 1) {
      throw new Error(
        `Cannot advance to phase ${args.toPhase} from phase ${session.currentPhase}`
      );
    }

    // Validate phase boundaries per path
    const maxPhase = session.path === "exploration" ? 3 : 9;
    if (args.toPhase > maxPhase) {
      throw new Error(`Phase ${args.toPhase} is beyond ${session.path} path`);
    }

    await ctx.db.patch(args.sessionId, {
      currentPhase: args.toPhase,
      lastActiveAt: Date.now(),
    });

    return { newPhase: args.toPhase };
  },
});

// Get session score for color transition threshold
export const getSessionScore = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { score: null, passesThreshold: false };

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId || session.isDeleted) {
      return { score: null, passesThreshold: false };
    }

    const score = session.ideaCardScore ?? null;
    // Threshold: 20 out of 30 max (6 areas × 5 points = 30)
    // This gives some flexibility: avg 3.33/5 per area triggers green
    const passesThreshold = score !== null && score >= 20;

    return { score, passesThreshold };
  },
});

// Clear all sessions for current user (dev/testing only)
export const clearAllSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const allSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const session of allSessions) {
      await ctx.db.patch(session._id, { isDeleted: true });
    }

    return { deleted: allSessions.length };
  },
});
