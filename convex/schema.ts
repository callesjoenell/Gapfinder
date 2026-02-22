import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    userId: v.string(), // Clerk user ID (string, not Id<"users">)
    name: v.string(),
    currentPhase: v.number(), // 0-9
    path: v.union(v.literal("exploration"), v.literal("evaluation")),
    isPaid: v.boolean(),
    isDeleted: v.boolean(), // Soft delete
    isArchived: v.optional(v.boolean()), // Soft archive (separate from delete), defaults to false
    description: v.optional(v.string()), // User-provided description
    linkedExplorationId: v.optional(v.id("sessions")), // For Evaluation -> Exploration reference
    // Idea card state (DATA-03)
    ideaCardContent: v.optional(v.string()),
    ideaCardScore: v.optional(v.number()), // Total score from Phase 7
    // Idea extraction fields (05-02a)
    ideaKeywords: v.optional(v.array(v.object({
      word: v.string(),
      area: v.number(),
      relevance: v.number()
    }))),
    ideaSentence: v.optional(v.string()), // Crystallized idea sentence
    supportingSentences: v.optional(v.array(v.object({
      text: v.string(),
      areaIndex: v.number()
    }))),
    // Research findings from automated tools (07-02)
    researchFindings: v.optional(v.array(v.object({
      source: v.string(),        // "reddit", "hackernews", "tavily", etc.
      query: v.string(),         // What was searched
      results: v.array(v.object({
        title: v.string(),
        url: v.optional(v.string()),
        snippet: v.string(),
        score: v.optional(v.number()),
      })),
      timestamp: v.number(),
    }))),
    // Research intensity preference (08-01)
    researchIntensity: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isDeleted", "lastActiveAt"])
    .index("by_user_path", ["userId", "isDeleted", "isArchived", "path", "lastActiveAt"])
    .index("by_user_archived", ["userId", "isDeleted", "isArchived", "lastActiveAt"]),

  messages: defineTable({
    sessionId: v.id("sessions"),
    phase: v.number(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    thinking: v.optional(v.string()), // Extended thinking content from Claude
    timestamp: v.number(), // DATA-01: timestamp
  })
    .index("by_session", ["sessionId", "timestamp"])
    .index("by_session_phase", ["sessionId", "phase", "timestamp"]),

  summaries: defineTable({
    sessionId: v.id("sessions"),
    phase: v.number(),
    completedAt: v.number(),
    data: v.object({
      keyFindings: v.array(v.string()),
      unfairAdvantages: v.array(v.string()),
      decisions: v.array(v.string()),
      energySignals: v.array(v.string()),
    }),
  }).index("by_session", ["sessionId", "phase"]),

  // Manual research findings from checklists (07-03)
  manualResearchFindings: defineTable({
    sessionId: v.id("sessions"),
    type: v.string(),  // "facebook_groups", "linkedin", "twitter", "amazon_reviews"
    data: v.object({
      // Facebook Groups fields
      groupName: v.optional(v.string()),
      groupSize: v.optional(v.string()),
      topPainPosts: v.optional(v.string()),
      commonLanguage: v.optional(v.string()),
      // LinkedIn fields
      targetRoles: v.optional(v.string()),
      skillsInDemand: v.optional(v.string()),
      painPointsFromPosts: v.optional(v.string()),
      toolsMentioned: v.optional(v.string()),
      // Twitter fields
      hashtags: v.optional(v.string()),
      influencers: v.optional(v.string()),
      commonComplaints: v.optional(v.string()),
      wishlistItems: v.optional(v.string()),
      // Amazon Reviews fields
      productCategory: v.optional(v.string()),
      productsReviewed: v.optional(v.string()),
      topComplaints: v.optional(v.string()),
      missingFeatures: v.optional(v.string()),
    }),
    submittedAt: v.number(),
  }).index("by_session", ["sessionId"]),

  // Keyword lookup credits (07-04)
  keywordCredits: defineTable({
    userId: v.string(),
    creditsRemaining: v.number(),
    creditsUsed: v.number(),
    lastUpdated: v.number(),
  }).index("by_user", ["userId"]),

  // Coverage state for conversation tracking (08-01)
  coverageState: defineTable({
    sessionId: v.id("sessions"),
    phase: v.number(),
    topics: v.any(), // JSON object: { topicKey: "not_mentioned"|"surface"|"moderate"|"deep" }
    energyPeaks: v.array(v.string()),
    currentFocus: v.optional(v.string()),
    readyForCompletion: v.boolean(),
    whatsMissing: v.optional(v.array(v.string())),
    researchIntensity: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    searchedSources: v.optional(v.array(v.string())),
    lastUpdated: v.number(),
  }).index("by_session_phase", ["sessionId", "phase"]),

  // Transient activity status for real-time UI updates
  activityStatus: defineTable({
    sessionId: v.id("sessions"),
    status: v.string(), // e.g. "Thinking...", "Searching Reddit...", "Analyzing results..."
    updatedAt: v.number(),
  }).index("by_session", ["sessionId"]),

  // Research queue for saved suggestions (07-06)
  researchQueue: defineTable({
    sessionId: v.id("sessions"),
    type: v.string(),
    label: v.string(),
    description: v.string(),
    query: v.string(),
    source: v.string(),
    priority: v.number(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("dismissed")),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_session", ["sessionId"])
    .index("by_session_status", ["sessionId", "status"]),
});
