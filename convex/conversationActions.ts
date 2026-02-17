"use node";

/**
 * Conversation analysis actions for coverage extraction and research trigger detection.
 *
 * These actions run after each conversation turn to:
 * 1. Extract coverage state (topic depths, energy peaks, readiness)
 * 2. Detect research triggers (market claims, competitors, pain points, assumptions)
 *
 * Uses Claude Sonnet for cost efficiency (background analysis, not main conversation).
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createCoverageSchema, buildCoverageExtractionPrompt } from "../src/lib/schemas/coverageExtraction";
import { TriggerDetectionSchema, buildTriggerDetectionPrompt } from "../src/lib/schemas/researchTriggers";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Extract coverage state from recent conversation messages.
 *
 * Called after every assistant response to update coverage tracking:
 * - Topic depth levels (surface/moderate/deep)
 * - Energy peaks (moments of high user engagement)
 * - Current focus
 * - Phase completion readiness
 *
 * Persists results to coverageState table via upsertCoverageState mutation.
 *
 * @param sessionId - Current session
 * @param phase - Current phase number (0-9)
 * @param recentMessages - Last 10 messages as {role, content}[]
 * @returns Parsed coverage result or null if extraction fails
 */
export const extractCoverage = action({
  args: {
    sessionId: v.id("sessions"),
    phase: v.number(),
    recentMessages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    try {
      // Get current coverage state for merge-aware prompting
      const currentCoverage = await ctx.runQuery(internal.conversationState.getCoverageState, {
        sessionId: args.sessionId,
        phase: args.phase,
      });

      const currentTopics = currentCoverage?.topics || {};

      // Build phase-specific Zod schema
      const CoverageSchema = createCoverageSchema(args.phase);

      // Build extraction prompt with current state
      const systemPrompt = buildCoverageExtractionPrompt(args.phase, currentTopics);

      // Call Claude with structured outputs
      // Note: @anthropic-ai/sdk v0.71.2 may not have zodResponseFormat
      // Using JSON mode with manual schema enforcement
      const schemaJson = {
        type: "object",
        properties: {
          topicsDiscussed: {
            type: "object",
            additionalProperties: {
              type: "string",
              enum: ["not_mentioned", "surface", "moderate", "deep"]
            }
          },
          energyPeaks: {
            type: "array",
            items: { type: "string" },
            description: "Specific topics/moments with high user energy"
          },
          currentFocus: {
            type: "string",
            description: "Topic user is most engaged with right now"
          },
          depthSummary: {
            type: "object",
            properties: {
              topicsAtDeep: { type: "number" },
              topicsAtModerate: { type: "number" },
              topicsAtSurface: { type: "number" },
              topicsNotMentioned: { type: "number" }
            },
            required: ["topicsAtDeep", "topicsAtModerate", "topicsAtSurface", "topicsNotMentioned"]
          },
          readyForPhaseCompletion: { type: "boolean" },
          whatsMissing: {
            type: "array",
            items: { type: "string" },
            description: "Topics needing more depth if not ready"
          }
        },
        required: ["topicsDiscussed", "energyPeaks", "currentFocus", "depthSummary", "readyForPhaseCompletion"]
      };

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `${systemPrompt}\n\nIMPORTANT: Return your analysis as valid JSON matching this schema:\n${JSON.stringify(schemaJson, null, 2)}`,
        messages: args.recentMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      // Extract text content
      const textContent = response.content.find(c => c.type === "text");
      if (!textContent || textContent.type !== "text") {
        console.warn("No text in coverage extraction response");
        return null;
      }

      // Parse JSON from response (Claude may wrap in markdown)
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn("No JSON found in coverage extraction response");
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate with Zod
      const validationResult = CoverageSchema.safeParse(parsed);
      if (!validationResult.success) {
        console.warn("Coverage extraction validation failed:", validationResult.error);
        return null;
      }

      const coverageResult = validationResult.data;

      // Persist to Convex
      await ctx.runMutation(internal.conversationState.upsertCoverageState, {
        sessionId: args.sessionId,
        phase: args.phase,
        topics: coverageResult.topicsDiscussed,
        energyPeaks: coverageResult.energyPeaks,
        currentFocus: coverageResult.currentFocus,
        readyForCompletion: coverageResult.readyForPhaseCompletion,
        whatsMissing: coverageResult.whatsMissing,
      });

      // Return result for caller (may need for progress bar updates)
      return coverageResult;
    } catch (error) {
      console.error("Coverage extraction failed:", error);
      // Don't break conversation flow - graceful degradation
      return null;
    }
  },
});

/**
 * Detect research triggers in user message.
 *
 * Called with each user message to identify research opportunities:
 * - Market claims (size, growth, trends)
 * - Competitor mentions
 * - Pain point descriptions
 * - Assumptions about customers/behavior
 *
 * Filters triggers based on intensity setting and searched sources.
 *
 * @param sessionId - Current session
 * @param phase - Current phase number
 * @param userMessage - User's message text
 * @param intensitySetting - "low" | "medium" | "high" filter threshold
 * @param searchedSources - Array of already-searched sources to prevent re-suggestion
 * @returns Filtered array of research triggers
 */
export const detectTriggers = action({
  args: {
    sessionId: v.id("sessions"),
    phase: v.number(),
    userMessage: v.string(),
    intensitySetting: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    searchedSources: v.array(v.string()),
  },
  handler: async (_ctx, args) => {
    try {
      // Build detection prompt with intensity and searched sources
      const systemPrompt = buildTriggerDetectionPrompt(args.intensitySetting, args.searchedSources);

      // Define JSON schema for triggers
      const schemaJson = {
        type: "object",
        properties: {
          triggers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  enum: ["market_claim", "competitor_mention", "pain_point", "assumption"]
                },
                quote: {
                  type: "string",
                  description: "Exact text from user that triggered detection"
                },
                suggestedSources: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: ["reddit", "hn", "producthunt", "tavily", "stackoverflow"]
                  },
                  maxItems: 3
                },
                researchAngle: {
                  type: "string",
                  description: "Specific search query or question to investigate"
                },
                priority: {
                  type: "string",
                  enum: ["high", "medium", "low"]
                }
              },
              required: ["category", "quote", "suggestedSources", "researchAngle", "priority"]
            }
          },
          shouldSuggest: {
            type: "boolean",
            description: "Based on intensity setting and trigger quality, should Claude suggest research now?"
          }
        },
        required: ["triggers", "shouldSuggest"]
      };

      // Call Claude with trigger detection prompt
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `${systemPrompt}\n\nIMPORTANT: Return your analysis as valid JSON matching this schema:\n${JSON.stringify(schemaJson, null, 2)}`,
        messages: [{ role: "user", content: args.userMessage }],
      });

      // Extract text content
      const textContent = response.content.find(c => c.type === "text");
      if (!textContent || textContent.type !== "text") {
        console.warn("No text in trigger detection response");
        return [];
      }

      // Parse JSON from response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn("No JSON found in trigger detection response");
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate with Zod
      const validationResult = TriggerDetectionSchema.safeParse(parsed);
      if (!validationResult.success) {
        console.warn("Trigger detection validation failed:", validationResult.error);
        return [];
      }

      const detectionResult = validationResult.data;

      // Filter triggers based on intensity
      let filteredTriggers = detectionResult.triggers;
      if (args.intensitySetting === "low") {
        // Low intensity: only high priority triggers
        filteredTriggers = filteredTriggers.filter(t => t.priority === "high");
      }

      return filteredTriggers;
    } catch (error) {
      console.error("Trigger detection failed:", error);
      // Don't block conversation - return empty array
      return [];
    }
  },
});
