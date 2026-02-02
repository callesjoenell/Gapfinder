"use node";

/**
 * Research actions with Claude tool execution loop.
 *
 * Enables Claude to automatically query external research APIs during conversations
 * to gather real-world evidence for idea validation. Research findings persist in
 * session for later phase reference.
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";
import { researchTools } from "./research/tools";
import { executeResearchTool } from "./research/executor";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Chat action with research tool execution loop.
 *
 * This action:
 * 1. Sends messages to Claude with tool definitions
 * 2. When Claude responds with tool_use, executes the tools
 * 3. Feeds tool results back to Claude for summarization
 * 4. Repeats until Claude provides a text response
 * 5. Saves research findings to session for persistence
 *
 * @param sessionId - Current session
 * @param systemPrompt - System instructions for Claude
 * @param messages - Conversation history
 * @returns Claude's final text response with research incorporated
 */
export const chatWithResearch = action({
  args: {
    sessionId: v.id("sessions"),
    systemPrompt: v.string(),
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Track research findings for persistence
    const findings: Array<{
      source: string;
      query: string;
      results: Array<{ title: string; url?: string; snippet: string; score?: number }>;
      timestamp: number;
    }> = [];

    // Convert to Anthropic message format
    let conversationMessages: Anthropic.MessageParam[] = args.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    let response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      tools: researchTools,
      system: args.systemPrompt,
      messages: conversationMessages,
    });

    // Tool execution loop - max 5 iterations to prevent infinite loops
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (response.stop_reason === "tool_use" && iterations < MAX_ITERATIONS) {
      iterations++;

      // Find all tool use blocks
      const toolUseBlocks = response.content.filter(
        (c): c is Anthropic.ToolUseBlock => c.type === "tool_use"
      );

      // Execute each tool (sequentially to respect rate limits)
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        const result = await executeResearchTool(
          toolUse.name,
          toolUse.input as Record<string, unknown>
        );

        // Parse result to extract findings for persistence
        try {
          const parsed = JSON.parse(result);
          if (parsed.results && parsed.results.length > 0) {
            findings.push({
              source: parsed.source,
              query: (toolUse.input as Record<string, unknown>).query as string || "",
              results: parsed.results.slice(0, 5).map((r: any) => ({
                title: r.title || r.name || "",
                url: r.url || r.link || "",
                snippet: r.selftext || r.content || r.tagline || r.description || "",
                score: r.score || r.points || r.votesCount || undefined,
              })),
              timestamp: Date.now(),
            });
          }
        } catch (e) {
          console.error("Failed to parse tool result for persistence:", e);
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: result,
        });
      }

      // Add assistant response and tool results to conversation
      conversationMessages = [
        ...conversationMessages,
        { role: "assistant" as const, content: response.content },
        { role: "user" as const, content: toolResults },
      ];

      // Get next response
      response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        tools: researchTools,
        system: args.systemPrompt,
        messages: conversationMessages,
      });
    }

    // Save findings to session if any were collected
    if (findings.length > 0) {
      await ctx.runMutation(internal.sessions.appendResearchFindings, {
        sessionId: args.sessionId,
        findings,
      });
    }

    // Extract final text response
    const textContent = response.content.find(c => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text in final response");
    }

    return textContent.text;
  },
});
