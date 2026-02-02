import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";

// Query to get idea card data for a session
export const getIdeaCard = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    return {
      phase: session.currentPhase,
      ideaSentence: session.ideaSentence ?? null,
      supportingSentences: session.supportingSentences ?? null,
      ideaKeywords: session.ideaKeywords ?? null,
      ideaCardScore: session.ideaCardScore ?? null,
    };
  },
});

// Internal mutation to update idea keywords
export const updateIdeaKeywords = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    keywords: v.array(
      v.object({
        word: v.string(),
        area: v.number(),
        relevance: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      ideaKeywords: args.keywords,
    });
  },
});

// Internal mutation to set idea sentence (triggers merge animation)
export const setIdeaSentence = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    ideaSentence: v.string(),
    supportingSentences: v.array(
      v.object({
        text: v.string(),
        areaIndex: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      ideaSentence: args.ideaSentence,
      supportingSentences: args.supportingSentences,
    });
  },
});
