"use node";

/**
 * Hacker News Algolia API wrapper
 *
 * Free public API, no authentication required.
 * API docs: https://hn.algolia.com/api
 */

export interface HNResult {
  title: string;
  url: string | null;
  points: number;
  comments: number;
  author: string;
  created: string;
}

/**
 * Search Hacker News stories or comments using Algolia search API.
 *
 * @param query - Search query string
 * @param type - Type of content: "story" for submissions, "comment" for discussions
 * @returns Array of up to 10 results, empty array on error
 */
export async function searchHackerNews(
  query: string,
  type: "story" | "comment" = "story"
): Promise<HNResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://hn.algolia.com/api/v1/search?query=${encodedQuery}&tags=${type}&hitsPerPage=10`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "GapFinder/1.0",
      },
    });

    if (!response.ok) {
      console.error(
        `Hacker News API error: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const data = await response.json();

    return data.hits.map((hit: any) => ({
      title: hit.title || hit.comment_text?.substring(0, 100) || "",
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      points: hit.points || 0,
      comments: hit.num_comments || 0,
      author: hit.author || "unknown",
      created: hit.created_at || "",
    }));
  } catch (error) {
    console.error("Error fetching Hacker News data:", error);
    return [];
  }
}
