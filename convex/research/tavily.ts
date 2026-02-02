"use node";

/**
 * Tavily AI-powered search API wrapper
 *
 * Requires TAVILY_API_KEY environment variable.
 * API docs: https://docs.tavily.com/
 */

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilySearchOptions {
  max_results?: number;
}

/**
 * Perform AI-powered web search using Tavily API.
 *
 * @param query - Search query string
 * @param options - Search options (max_results)
 * @returns Array of search results
 * @throws Error if TAVILY_API_KEY is not configured
 */
export async function searchTavily(
  query: string,
  options: TavilySearchOptions = {}
): Promise<TavilyResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error(
      "TAVILY_API_KEY environment variable not configured. Set it via: npx convex env set TAVILY_API_KEY your_key_here"
    );
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        max_results: options.max_results || 5,
        search_depth: "basic",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Tavily API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    return (data.results || []).map((result: any) => ({
      title: result.title || "",
      url: result.url || "",
      content: result.content || "",
      score: result.score || 0,
    }));
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Error fetching Tavily data: ${String(error)}`);
  }
}
