"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client (uses ANTHROPIC_API_KEY env var)
const anthropic = new Anthropic();

// Action to extract idea content using Claude
export const extractIdeaContent = action({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    // Get session to check phase
    const session = await ctx.runQuery(api.sessions.getSession, {
      sessionId: args.sessionId,
    });
    if (!session) {
      throw new Error("Session not found");
    }

    // Get recent messages from session
    const messages = await ctx.runQuery(api.messages.getSessionMessages, {
      sessionId: args.sessionId,
    });

    if (!messages || messages.length === 0) {
      // No messages yet, nothing to extract
      return { success: false, reason: "No messages to analyze" };
    }

    const phase = session.currentPhase;

    // Use last 50 messages for analysis (or all if fewer)
    const recentMessages = messages.slice(-50);

    // Call Claude with structured JSON output request
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Analyze this conversation and extract idea formation data.

Conversation:
${recentMessages
  .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
  .join("\n\n")}

Current phase: ${phase}

Return a JSON object with:
{
  "keywords": [
    { "word": "string (2-4 words max)", "area": 0-5 (exploration area index), "relevance": 0.0-1.0 }
  ],
  "ideaReady": boolean (true if conversation has enough depth for crystallized idea),
  "ideaSentence": "string or null (one clear sentence capturing core idea)",
  "supportingSentences": [
    { "text": "string from conversation", "areaIndex": 0-5 }
  ]
}

Guidelines:
- Extract 6-14 keywords per area (areas 0-5 map to: problem, solution, audience, advantage, vision, execution)
- Keywords should be 2-4 word phrases capturing key insights
- relevance: 1.0 = central to idea, 0.3 = peripheral context
- ideaReady: only true if phase >= 3 AND conversation shows clear problem-solution fit
- If ideaReady false, set ideaSentence and supportingSentences to null
- supportingSentences: 3-4 quotes that evidence the idea`,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text in response from Claude");
    }

    // Parse JSON from response (Claude may wrap in markdown)
    let extractionData;
    try {
      // Extract JSON from response (handles markdown wrapping like claude.ts)
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in Claude response");
      }
      extractionData = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("Failed to parse extraction JSON:", textContent.text);
      return { success: false, reason: "Failed to parse Claude response" };
    }

    // Validate extraction data structure
    const keywords = Array.isArray(extractionData.keywords)
      ? extractionData.keywords
      : [];
    const ideaReady = Boolean(extractionData.ideaReady);
    const ideaSentence =
      typeof extractionData.ideaSentence === "string"
        ? extractionData.ideaSentence
        : null;
    const supportingSentences = Array.isArray(
      extractionData.supportingSentences
    )
      ? extractionData.supportingSentences
      : [];

    // Update keywords if any were extracted
    if (keywords.length > 0) {
      await ctx.runMutation(internal.ideas.updateIdeaKeywords, {
        sessionId: args.sessionId,
        keywords,
      });
    }

    // Edge case: Only set ideaSentence if ideaReady is true AND ideaSentence exists
    // This prevents premature merge even when phase >= 3
    if (
      ideaReady &&
      ideaSentence &&
      ideaSentence.trim() !== "" &&
      supportingSentences.length > 0
    ) {
      await ctx.runMutation(internal.ideas.setIdeaSentence, {
        sessionId: args.sessionId,
        ideaSentence,
        supportingSentences,
      });
    }

    return {
      success: true,
      keywordsExtracted: keywords.length,
      ideaSentenceSet: ideaReady && !!ideaSentence,
    };
  },
});
