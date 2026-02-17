import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Depth level ordering for merging coverage updates
const DEPTH_ORDER = {
  not_mentioned: 0,
  surface: 1,
  moderate: 2,
  deep: 3,
} as const;

/**
 * Get coverage state for a specific session and phase
 */
export const getCoverageState = query({
  args: {
    sessionId: v.id("sessions"),
    phase: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("coverageState")
      .withIndex("by_session_phase", (q) =>
        q.eq("sessionId", args.sessionId).eq("phase", args.phase)
      )
      .first();
  },
});

/**
 * Upsert coverage state for a session/phase.
 * Merges topics (keeping highest depth), deduplicates energyPeaks,
 * and updates currentFocus/readyForCompletion/whatsMissing/lastUpdated.
 */
export const upsertCoverageState = mutation({
  args: {
    sessionId: v.id("sessions"),
    phase: v.number(),
    topics: v.optional(v.any()),
    energyPeaks: v.optional(v.array(v.string())),
    currentFocus: v.optional(v.string()),
    readyForCompletion: v.optional(v.boolean()),
    whatsMissing: v.optional(v.array(v.string())),
    researchIntensity: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    searchedSources: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("coverageState")
      .withIndex("by_session_phase", (q) =>
        q.eq("sessionId", args.sessionId).eq("phase", args.phase)
      )
      .first();

    const now = Date.now();

    if (existing) {
      // Merge topics: keep highest depth level
      let mergedTopics = existing.topics || {};
      if (args.topics) {
        const newTopics = args.topics as Record<string, keyof typeof DEPTH_ORDER>;
        for (const [key, newDepth] of Object.entries(newTopics)) {
          const existingDepth = mergedTopics[key] as keyof typeof DEPTH_ORDER | undefined;
          if (!existingDepth || DEPTH_ORDER[newDepth] > DEPTH_ORDER[existingDepth]) {
            mergedTopics[key] = newDepth;
          }
        }
      }

      // Merge and deduplicate energyPeaks
      let mergedPeaks = [...existing.energyPeaks];
      if (args.energyPeaks) {
        for (const peak of args.energyPeaks) {
          if (!mergedPeaks.includes(peak)) {
            mergedPeaks.push(peak);
          }
        }
      }

      // Merge searchedSources
      let mergedSources = existing.searchedSources || [];
      if (args.searchedSources) {
        for (const source of args.searchedSources) {
          if (!mergedSources.includes(source)) {
            mergedSources.push(source);
          }
        }
      }

      await ctx.db.patch(existing._id, {
        topics: mergedTopics,
        energyPeaks: mergedPeaks,
        currentFocus: args.currentFocus ?? existing.currentFocus,
        readyForCompletion: args.readyForCompletion ?? existing.readyForCompletion,
        whatsMissing: args.whatsMissing ?? existing.whatsMissing,
        researchIntensity: args.researchIntensity ?? existing.researchIntensity,
        searchedSources: mergedSources,
        lastUpdated: now,
      });

      return existing._id;
    } else {
      // Create new coverage state
      return await ctx.db.insert("coverageState", {
        sessionId: args.sessionId,
        phase: args.phase,
        topics: args.topics || {},
        energyPeaks: args.energyPeaks || [],
        currentFocus: args.currentFocus,
        readyForCompletion: args.readyForCompletion ?? false,
        whatsMissing: args.whatsMissing,
        researchIntensity: args.researchIntensity,
        searchedSources: args.searchedSources || [],
        lastUpdated: now,
      });
    }
  },
});

/**
 * Get searched sources for a session/phase
 */
export const getSearchedSources = query({
  args: {
    sessionId: v.id("sessions"),
    phase: v.number(),
  },
  handler: async (ctx, args) => {
    const coverage = await ctx.db
      .query("coverageState")
      .withIndex("by_session_phase", (q) =>
        q.eq("sessionId", args.sessionId).eq("phase", args.phase)
      )
      .first();

    return coverage?.searchedSources || [];
  },
});

/**
 * Add a searched source to the coverage state
 */
export const addSearchedSource = mutation({
  args: {
    sessionId: v.id("sessions"),
    phase: v.number(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("coverageState")
      .withIndex("by_session_phase", (q) =>
        q.eq("sessionId", args.sessionId).eq("phase", args.phase)
      )
      .first();

    const now = Date.now();

    if (existing) {
      const currentSources = existing.searchedSources || [];
      if (!currentSources.includes(args.source)) {
        await ctx.db.patch(existing._id, {
          searchedSources: [...currentSources, args.source],
          lastUpdated: now,
        });
      }
    } else {
      // Create coverage state if it doesn't exist
      await ctx.db.insert("coverageState", {
        sessionId: args.sessionId,
        phase: args.phase,
        topics: {},
        energyPeaks: [],
        readyForCompletion: false,
        searchedSources: [args.source],
        lastUpdated: now,
      });
    }
  },
});

/**
 * Get research intensity setting for a session (from sessions table)
 */
export const getResearchIntensity = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    return session?.researchIntensity || "medium";
  },
});

/**
 * Set research intensity setting for a session
 */
export const setResearchIntensity = mutation({
  args: {
    sessionId: v.id("sessions"),
    intensity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      researchIntensity: args.intensity,
    });
  },
});
