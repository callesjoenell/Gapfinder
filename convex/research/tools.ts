/**
 * Claude tool definitions for research sources.
 *
 * These tools enable Claude to query external APIs during conversations
 * to gather pain signals, competitive intelligence, and technical insights.
 *
 * Format follows Anthropic's tool use schema:
 * https://platform.claude.com/docs/en/docs/build-with-claude/tool-use
 */

export interface ClaudeTool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
}

export const researchTools: ClaudeTool[] = [
  {
    name: "search_reddit",
    description: "Search Reddit for user pain signals, complaints, and discussions about problems. Use this to find real people talking about their frustrations and needs. You can search across all of Reddit or within specific subreddits.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query (e.g., 'frustrated with project management tools', 'wish there was a way to')",
        },
        subreddit: {
          type: "string",
          description: "Optional: specific subreddit to search within (e.g., 'startups', 'webdev')",
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return (default: 10, max: 25)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "search_hackernews",
    description: "Search Hacker News for tech community sentiment, product discussions, and technical opinions. Use this to understand how developers and tech enthusiasts view products, technologies, or problems. Search both stories (submissions) and comments.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query (e.g., 'authentication libraries', 'burnout in tech')",
        },
        type: {
          type: "string",
          enum: ["story", "comment"],
          description: "Type of content to search: 'story' for submissions or 'comment' for discussion threads (default: story)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "search_tavily",
    description: "Perform a general web search using Tavily AI-powered search. Use this for broad research, recent news, or topics not well-covered by specialized sources. Returns high-quality, relevant web results.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query",
        },
        max_results: {
          type: "number",
          description: "Maximum number of results to return (default: 5, max: 10)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "search_producthunt",
    description: "Search ProductHunt for competitive products and market validation. Use this to find similar products, understand what's being built in the space, and gauge market interest through votes and comments.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query (e.g., 'AI writing tools', 'project management')",
        },
        limit: {
          type: "number",
          description: "Maximum number of products to return (default: 10, max: 20)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "search_youtube_transcripts",
    description: "Get the transcript from a YouTube video to analyze pain signals mentioned in video content. Use this when users share YouTube links or when you find relevant videos discussing problems in the domain.",
    input_schema: {
      type: "object",
      properties: {
        video_url: {
          type: "string",
          description: "The YouTube video URL (e.g., 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')",
        },
      },
      required: ["video_url"],
    },
  },
  {
    name: "search_stackoverflow",
    description: "Search Stack Overflow for technical problems and developer pain points. Use this to understand common technical challenges, frequently asked questions, and areas where developers struggle.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query (searches question titles)",
        },
        tags: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Optional: filter by Stack Overflow tags (e.g., ['javascript', 'react'])",
        },
        limit: {
          type: "number",
          description: "Maximum number of questions to return (default: 10, max: 25)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_keyword_volume",
    description: "Get search volume, CPC, and competition data for keywords. PAID FEATURE - costs credits. Max 20 keywords per lookup. Always confirm with user before calling.",
    input_schema: {
      type: "object",
      properties: {
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "Keywords to look up (max 20)",
        },
      },
      required: ["keywords"],
    },
  },
];
