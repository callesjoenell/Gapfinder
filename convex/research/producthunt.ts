"use node";

/**
 * ProductHunt GraphQL API wrapper
 *
 * Requires PRODUCTHUNT_API_KEY environment variable (optional).
 * API docs: https://api.producthunt.com/v2/docs
 */

export interface ProductHuntResult {
  name: string;
  tagline: string;
  description: string;
  url: string;
  votesCount: number;
  commentsCount: number;
}

/**
 * Search ProductHunt for products using GraphQL API.
 *
 * Note: If PRODUCTHUNT_API_KEY is not configured, returns empty array with warning.
 * This is an optional integration - ProductHunt requires API approval.
 *
 * @param query - Search query string
 * @param limit - Maximum number of products (default: 10, max: 20)
 * @returns Array of product results, empty array if API key missing
 */
export async function searchProductHunt(
  query: string,
  limit: number = 10
): Promise<ProductHuntResult[]> {
  const apiKey = process.env.PRODUCTHUNT_API_KEY;

  if (!apiKey) {
    console.warn(
      "PRODUCTHUNT_API_KEY not configured - ProductHunt search disabled. This is optional."
    );
    return [];
  }

  try {
    const limitClamped = Math.min(limit, 20);

    const graphqlQuery = `
      query SearchPosts($query: String!, $limit: Int!) {
        posts(first: $limit, order: VOTES, postedAfter: "2020-01-01", search: $query) {
          edges {
            node {
              name
              tagline
              description
              url
              votesCount
              commentsCount
            }
          }
        }
      }
    `;

    const response = await fetch("https://api.producthunt.com/v2/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: {
          query,
          limit: limitClamped,
        },
      }),
    });

    if (!response.ok) {
      console.error(
        `ProductHunt API error: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const data = await response.json();

    if (data.errors) {
      console.error("ProductHunt GraphQL errors:", data.errors);
      return [];
    }

    return (data.data?.posts?.edges || []).map((edge: any) => {
      const node = edge.node;
      return {
        name: node.name || "",
        tagline: node.tagline || "",
        description: node.description || "",
        url: node.url || "",
        votesCount: node.votesCount || 0,
        commentsCount: node.commentsCount || 0,
      };
    });
  } catch (error) {
    console.error("Error fetching ProductHunt data:", error);
    return [];
  }
}
