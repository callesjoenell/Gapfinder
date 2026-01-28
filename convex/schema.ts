import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Auth tables from @convex-dev/auth
  ...authTables,

  // Override users table with our fields
  users: defineTable({
    // Fields from authTables
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Our custom fields
    createdAt: v.number(),
  }).index("email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    name: v.string(),
    currentPhase: v.number(), // 0-9
    path: v.union(v.literal("exploration"), v.literal("evaluation")),
    isPaid: v.boolean(),
    isDeleted: v.boolean(), // Soft delete
    // Idea card state (DATA-03)
    ideaCardContent: v.optional(v.string()),
    ideaCardScore: v.optional(v.number()), // Total score from Phase 7
    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isDeleted", "lastActiveAt"]),

  messages: defineTable({
    sessionId: v.id("sessions"),
    phase: v.number(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
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
