"use node";

import { gunzipSync } from "node:zlib";

/**
 * Stack Exchange API wrapper for Stack Overflow
 *
 * Free public API, no authentication required (300 requests/day limit).
 * API docs: https://api.stackexchange.com/docs
 */

export interface SOResult {
  title: string;
  link: string;
  score: number;
  answer_count: number;
  is_answered: boolean;
  tags: string[];
  creation_date: string;
}

/**
 * Search Stack Overflow questions using Stack Exchange API.
 *
 * Note: API returns gzip-compressed responses by default.
 * Rate limit: 300 requests per day per IP without authentication.
 *
 * @param query - Search query (searches question titles)
 * @param tags - Optional: filter by Stack Overflow tags
 * @param limit - Maximum number of questions (default: 10, max: 25)
 * @returns Array of question results, empty array on error
 */
export async function searchStackOverflow(
  query: string,
  tags?: string[],
  limit: number = 10
): Promise<SOResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const limitClamped = Math.min(limit, 25);

    let url = `https://api.stackexchange.com/2.3/search?order=desc&sort=relevance&intitle=${encodedQuery}&site=stackoverflow&pagesize=${limitClamped}`;

    if (tags && tags.length > 0) {
      const tagString = tags.join(";");
      url += `&tagged=${encodeURIComponent(tagString)}`;
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "GapFinder/1.0",
      },
    });

    if (!response.ok) {
      console.error(
        `Stack Overflow API error: ${response.status} ${response.statusText}`
      );
      return [];
    }

    // Stack Exchange API returns gzip-compressed responses
    const buffer = await response.arrayBuffer();
    const decompressed = gunzipSync(Buffer.from(buffer));
    const data = JSON.parse(decompressed.toString("utf-8"));

    if (data.error_message) {
      console.error("Stack Overflow API error:", data.error_message);
      return [];
    }

    return (data.items || []).map((item: any) => ({
      title: item.title || "",
      link: item.link || "",
      score: item.score || 0,
      answer_count: item.answer_count || 0,
      is_answered: item.is_answered || false,
      tags: item.tags || [],
      creation_date: new Date(item.creation_date * 1000).toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching Stack Overflow data:", error);
    return [];
  }
}
