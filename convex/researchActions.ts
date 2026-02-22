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

// Human-readable labels for tool names
const TOOL_LABELS: Record<string, string> = {
  search_reddit: "Searching Reddit",
  search_hackernews: "Searching Hacker News",
  search_tavily: "Searching the web",
  search_producthunt: "Searching ProductHunt",
  search_stackoverflow: "Searching Stack Overflow",
  get_keyword_volume: "Looking up keyword data",
};

/**
 * Chat action with research tool execution loop.
 */
export const chatWithResearch = action({
  args: {
    sessionId: v.id("sessions"),
    phase: v.number(),
    systemPrompt: v.string(),
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const findings: Array<{
      source: string;
      query: string;
      results: Array<{ title: string; url?: string; snippet: string; score?: number }>;
      timestamp: number;
    }> = [];

    // Report initial status
    await ctx.runMutation(internal.activityStatus.set, {
      sessionId: args.sessionId,
      status: "Thinking...",
    });

    let conversationMessages: Anthropic.MessageParam[] = args.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    let response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
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

      const toolUseBlocks = response.content.filter(
        (c): c is Anthropic.ToolUseBlock => c.type === "tool_use"
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        // Report which tool is being used
        const toolLabel = TOOL_LABELS[toolUse.name] || `Using ${toolUse.name}`;
        const query = (toolUse.input as Record<string, unknown>).query as string || "";
        const statusText = query ? `${toolLabel} for "${query}"` : toolLabel;
        await ctx.runMutation(internal.activityStatus.set, {
          sessionId: args.sessionId,
          status: statusText,
        });

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

            await ctx.runMutation(internal.conversationState.addSearchedSourceInternal, {
              sessionId: args.sessionId,
              phase: args.phase,
              source: `${parsed.source}:${(toolUse.input as Record<string, unknown>).query as string || ""}`,
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

      // Report analyzing status before next Claude call
      await ctx.runMutation(internal.activityStatus.set, {
        sessionId: args.sessionId,
        status: "Analyzing research results...",
      });

      conversationMessages = [
        ...conversationMessages,
        { role: "assistant" as const, content: response.content },
        { role: "user" as const, content: toolResults },
      ];

      response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
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

    // Clear activity status
    await ctx.runMutation(internal.activityStatus.clear, {
      sessionId: args.sessionId,
    });

    const textContent = response.content.find(c => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text in final response");
    }

    return { thinking: "", text: textContent.text };
  },
});
