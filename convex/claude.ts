"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client (uses ANTHROPIC_API_KEY env var)
const anthropic = new Anthropic();

// Main chat action - handles streaming internally, returns complete response
export const chat = action({
  args: {
    sessionId: v.id("sessions"),
    systemPrompt: v.string(),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
  },
  handler: async (_ctx, args): Promise<string> => {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 4096,
      system: args.systemPrompt,
      messages: args.messages,
    });

    // Extract text from response
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text in response");
    }

    return textContent.text;
  },
});

// Summarize a phase conversation
export const summarizePhase = action({
  args: {
    sessionId: v.id("sessions"),
    phase: v.number(),
    messages: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
      })
    ),
    summarizationPrompt: v.string(),
  },
  handler: async (ctx, args) => {
    // Call Claude to extract summary
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: args.summarizationPrompt,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text in response");
    }

    // Parse JSON response
    let summaryData;
    try {
      // Extract JSON from response (Claude sometimes wraps in markdown)
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      summaryData = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("Failed to parse summary JSON:", textContent.text);
      // Return empty summary rather than failing
      summaryData = {
        keyFindings: [],
        unfairAdvantages: [],
        decisions: [],
        energySignals: [],
      };
    }

    // Validate structure
    const validatedData = {
      keyFindings: Array.isArray(summaryData.keyFindings)
        ? summaryData.keyFindings
        : [],
      unfairAdvantages: Array.isArray(summaryData.unfairAdvantages)
        ? summaryData.unfairAdvantages
        : [],
      decisions: Array.isArray(summaryData.decisions)
        ? summaryData.decisions
        : [],
      energySignals: Array.isArray(summaryData.energySignals)
        ? summaryData.energySignals
        : [],
    };

    // Save summary via mutation (actions can't write directly)
    await ctx.runMutation(api.summaries.saveSummary, {
      sessionId: args.sessionId,
      phase: args.phase,
      data: validatedData,
    });

    return validatedData;
  },
});

// Assess phase completion
export const assessCompletion = action({
  args: {
    messages: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
      })
    ),
    assessmentPrompt: v.string(),
  },
  handler: async (_ctx, args) => {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: args.assessmentPrompt,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text in response");
    }

    try {
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { complete: false, missing: ["Could not parse assessment"] };
      }
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      return { complete: false, missing: ["Could not parse assessment"] };
    }
  },
});
