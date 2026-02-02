"use node";

/**
 * Reddit anonymous search API wrapper
 *
 * Uses Reddit's public JSON API, no authentication required.
 * Note: Rate limited to ~60 requests per minute per IP.
 */

export interface RedditResult {
  title: string;
  selftext: string;
  subreddit: string;
  score: number;
  num_comments: number;
  url: string;
  created: string;
}

/**
 * Search Reddit anonymously using the public JSON API.
 *
 * @param query - Search query string
 * @param subreddit - Optional: specific subreddit to search within
 * @param limit - Maximum number of results (default: 10, max: 25)
 * @returns Array of search results, empty array on error
 */
export async function searchReddit(
  query: string,
  subreddit?: string,
  limit: number = 10
): Promise<RedditResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const limitClamped = Math.min(limit, 25);

    let url: string;
    if (subreddit) {
      url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodedQuery}&restrict_sr=on&limit=${limitClamped}`;
    } else {
      url = `https://www.reddit.com/search.json?q=${encodedQuery}&limit=${limitClamped}`;
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "GapFinder/1.0",
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Reddit rate limit exceeded (60 requests/min)");
        return [];
      }
      console.error(
        `Reddit API error: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const data = await response.json();

    return (data.data?.children || []).map((child: any) => {
      const post = child.data;
      return {
        title: post.title || "",
        selftext: post.selftext || "",
        subreddit: post.subreddit || "",
        score: post.score || 0,
        num_comments: post.num_comments || 0,
        url: `https://www.reddit.com${post.permalink}`,
        created: new Date(post.created_utc * 1000).toISOString(),
      };
    });
  } catch (error) {
    console.error("Error fetching Reddit data:", error);
    return [];
  }
}
