import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "./auth";

// Summary data structure matches what we extract
const summaryDataValidator = v.object({
  keyFindings: v.array(v.string()),
  unfairAdvantages: v.array(v.string()),
  decisions: v.array(v.string()),
  energySignals: v.array(v.string()),
});

// Get all summaries for a session (ordered by phase)
export const getSessionSummaries = query({
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
      .query("summaries")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

// Get summaries up to a specific phase (for context building)
export const getSummariesUpToPhase = query({
  args: {
    sessionId: v.id("sessions"),
    beforePhase: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      return [];
    }

    const summaries = await ctx.db
      .query("summaries")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    return summaries.filter((s) => s.phase < args.beforePhase);
  },
});

// Get latest summary for a session
export const getLatestSummary = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      return null;
    }

    const summaries = await ctx.db
      .query("summaries")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    if (summaries.length === 0) return null;

    // Return highest phase summary
    return summaries.reduce((latest, current) =>
      current.phase > latest.phase ? current : latest
    );
  },
});

// Save or update a phase summary
export const saveSummary = mutation({
  args: {
    sessionId: v.id("sessions"),
    phase: v.number(),
    data: summaryDataValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    // Check if summary exists for this phase
    const existing = await ctx.db
      .query("summaries")
      .withIndex("by_session", (q) =>
        q.eq("sessionId", args.sessionId).eq("phase", args.phase)
      )
      .first();

    if (existing) {
      // Update existing summary
      await ctx.db.patch(existing._id, {
        data: args.data,
        completedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Create new summary
      return await ctx.db.insert("summaries", {
        sessionId: args.sessionId,
        phase: args.phase,
        completedAt: Date.now(),
        data: args.data,
      });
    }
  },
});

// Delete summary (rarely needed, for testing)
export const deleteSummary = mutation({
  args: { summaryId: v.id("summaries") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const summary = await ctx.db.get(args.summaryId);
    if (!summary) throw new Error("Summary not found");

    // Verify ownership via session
    const session = await ctx.db.get(summary.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.summaryId);
  },
});
