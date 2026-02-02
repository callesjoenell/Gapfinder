"use node";

/**
 * Tool execution dispatcher for research actions.
 *
 * Receives tool name and input parameters from Claude's tool_use blocks,
 * dispatches to appropriate API wrapper, and returns JSON string results.
 *
 * All tools return JSON strings to be fed back to Claude for summarization.
 */

import { searchHackerNews } from "./hackernews";
import { searchTavily } from "./tavily";
import { searchReddit } from "./reddit";
import { searchProductHunt } from "./producthunt";
import { searchStackOverflow } from "./stackoverflow";

/**
 * Execute a research tool and return JSON string results.
 *
 * @param toolName - Tool identifier from Claude (e.g., "search_reddit")
 * @param input - Tool parameters from Claude's tool_use input field
 * @returns JSON string with results or error
 */
export async function executeResearchTool(
  toolName: string,
  input: Record<string, unknown>
): Promise<string> {
  try {
    switch (toolName) {
      case "search_reddit":
        const redditResults = await searchReddit(
          input.query as string,
          input.subreddit as string | undefined,
          input.limit as number | undefined
        );
        return JSON.stringify({ source: "reddit", results: redditResults });

      case "search_hackernews":
        const hnResults = await searchHackerNews(
          input.query as string,
          input.type as "story" | "comment" | undefined
        );
        return JSON.stringify({ source: "hackernews", results: hnResults });

      case "search_tavily":
        const tavilyResults = await searchTavily(
          input.query as string,
          { max_results: input.max_results as number | undefined }
        );
        return JSON.stringify({ source: "tavily", results: tavilyResults });

      case "search_producthunt":
        const phResults = await searchProductHunt(
          input.query as string,
          input.limit as number | undefined
        );
        return JSON.stringify({ source: "producthunt", results: phResults });

      case "search_stackoverflow":
        const soResults = await searchStackOverflow(
          input.query as string,
          input.tags as string[] | undefined,
          input.limit as number | undefined
        );
        return JSON.stringify({ source: "stackoverflow", results: soResults });

      case "search_youtube_transcripts":
        // TODO: Implement YouTube transcript fetching
        return JSON.stringify({ source: "youtube", error: "Not yet implemented" });

      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  } catch (error) {
    console.error(`Tool execution error (${toolName}):`, error);
    return JSON.stringify({
      source: toolName.replace("search_", ""),
      error: error instanceof Error ? error.message : "Unknown error",
      results: []
    });
  }
}
