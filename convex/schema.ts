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
});
