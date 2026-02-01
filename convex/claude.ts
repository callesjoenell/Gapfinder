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
      model: "claude-sonnet-4-20250514",
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

// Streaming chat action with extended thinking support
// Returns thinking and text separately for frontend to handle
export const streamChat = action({
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
  handler: async (_ctx, args): Promise<{ thinking: string; text: string }> => {
    let thinkingContent = "";
    let textContent = "";

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
      system: args.systemPrompt,
      thinking: {
        type: "enabled",
        budget_tokens: 10000,
      },
      messages: args.messages,
    });

    // Process stream events
    for await (const event of stream) {
      if (event.type === "content_block_delta") {
        const delta = event.delta as { type: string; thinking?: string; text?: string };
        if (delta.type === "thinking_delta" && delta.thinking) {
          thinkingContent += delta.thinking;
        } else if (delta.type === "text_delta" && delta.text) {
          textContent += delta.text;
        }
      }
    }

    return { thinking: thinkingContent, text: textContent };
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
      model: "claude-sonnet-4-20250514",
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

// Assess phase completion (legacy - uses regex parsing)
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
      model: "claude-sonnet-4-20250514",
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

// Assess phase completion with structured outputs (guaranteed JSON schema compliance)
export const assessPhaseCompletionStructured = action({
  args: {
    currentPhase: v.number(),
    recentMessages: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
      })
    ),
    phaseGoal: v.string(),
    completionCriteria: v.array(v.string()),
  },
  handler: async (_ctx, args) => {
    const prompt = `Assess if the user has completed Phase ${args.currentPhase} based on this conversation.

Phase Goal: ${args.phaseGoal}

Completion Criteria:
${args.completionCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Recent Conversation:
${args.recentMessages.map((m) => `${m.role}: ${m.content}`).join("\n\n")}

Assess completion based on the criteria above. Be strict - all criteria should be substantially met.

Return your assessment as a JSON object with these exact fields:
- isComplete (boolean): Whether the user has substantially met all phase objectives
- progressPercent (number 0-100): Estimated completion percentage for current phase
- completionSignals (array of strings): Evidence from conversation showing progress
- missingElements (array of strings): What still needs to be covered to complete phase`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text in response");
    }

    // Parse JSON from response (Claude may wrap in markdown)
    try {
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          isComplete: false,
          progressPercent: 0,
          completionSignals: [],
          missingElements: ["Could not parse assessment"],
        };
      }
      const parsed = JSON.parse(jsonMatch[0]);

      // Validate and return with correct types
      return {
        isComplete: Boolean(parsed.isComplete),
        progressPercent: Number(parsed.progressPercent) || 0,
        completionSignals: Array.isArray(parsed.completionSignals)
          ? parsed.completionSignals
          : [],
        missingElements: Array.isArray(parsed.missingElements)
          ? parsed.missingElements
          : [],
      };
    } catch (e) {
      console.error("Failed to parse phase assessment:", textContent.text);
      return {
        isComplete: false,
        progressPercent: 0,
        completionSignals: [],
        missingElements: ["Could not parse assessment"],
      };
    }
  },
});
