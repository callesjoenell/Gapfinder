import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./auth";

// Submit manual research findings from checklist
export const submitManualResearch = mutation({
  args: {
    sessionId: v.id("sessions"),
    type: v.string(), // "facebook_groups", "linkedin", "twitter", "amazon_reviews"
    data: v.object({
      // Flexible fields - all optional since different types have different fields
      // Platform research fields
      groupName: v.optional(v.string()),
      groupSize: v.optional(v.string()),
      topPainPosts: v.optional(v.string()),
      commonLanguage: v.optional(v.string()),
      targetRoles: v.optional(v.string()),
      skillsInDemand: v.optional(v.string()),
      painPointsFromPosts: v.optional(v.string()),
      toolsMentioned: v.optional(v.string()),
      hashtags: v.optional(v.string()),
      influencers: v.optional(v.string()),
      commonComplaints: v.optional(v.string()),
      wishlistItems: v.optional(v.string()),
      productCategory: v.optional(v.string()),
      productsReviewed: v.optional(v.string()),
      topComplaints: v.optional(v.string()),
      missingFeatures: v.optional(v.string()),
      // Conversation prep fields
      person1: v.optional(v.string()),
      person2: v.optional(v.string()),
      person3: v.optional(v.string()),
      person4: v.optional(v.string()),
      person5: v.optional(v.string()),
      openingQuestion: v.optional(v.string()),
      keyAssumptions: v.optional(v.string()),
      whatToListenFor: v.optional(v.string()),
      // Conversation debrief fields
      personName: v.optional(v.string()),
      relationship: v.optional(v.string()),
      topInsight: v.optional(v.string()),
      behaviorEvidence: v.optional(v.string()),
      emotionalMoments: v.optional(v.string()),
      moneyTimeSignals: v.optional(v.string()),
      surprises: v.optional(v.string()),
      quotableLines: v.optional(v.string()),
      strengthenedOrWeakened: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verify session belongs to user
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found");
    }

    // Insert into manualResearchFindings table
    const findingId = await ctx.db.insert("manualResearchFindings", {
      sessionId: args.sessionId,
      type: args.type,
      data: args.data,
      submittedAt: Date.now(),
    });

    return findingId;
  },
});

// Get all manual research for a session
export const getManualResearch = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Verify session belongs to user
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      return [];
    }

    const findings = await ctx.db
      .query("manualResearchFindings")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    return findings;
  },
});

// Get manual research formatted for Claude context
export const getManualResearchForContext = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const findings = await ctx.db
      .query("manualResearchFindings")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    if (findings.length === 0) {
      return null;
    }

    // Format findings into readable text for Claude context
    const formatted = findings.map((f) => {
      const typeLabels: Record<string, string> = {
        facebook_groups: "Facebook Groups Research",
        linkedin: "LinkedIn Research",
        twitter: "Twitter/X Research",
        amazon_reviews: "Amazon Reviews Research",
        conversation_prep: "Customer Conversation Prep",
        conversation_debrief: "Customer Conversation Debrief",
      };

      const entries = Object.entries(f.data)
        .filter(([_, v]) => v && v.trim() !== "")
        .map(([k, v]) => `  ${formatFieldName(k)}: ${v}`)
        .join("\n");

      return `### ${typeLabels[f.type] || f.type}\n${entries}`;
    });

    return formatted.join("\n\n");
  },
});

// Helper to convert camelCase to readable format
function formatFieldName(name: string): string {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
