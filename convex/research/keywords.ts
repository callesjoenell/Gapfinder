"use node";

export interface KeywordData {
  keyword: string;
  volume: number;       // Monthly search volume
  cpc: number;          // Cost per click ($)
  competition: number;  // 0-1 scale
}

export interface KeywordLookupResult {
  success: boolean;
  data?: KeywordData[];
  error?: string;
  creditsUsed?: number;
}

const MAX_KEYWORDS_PER_LOOKUP = 20;

export async function getKeywordVolume(
  keywords: string[]
): Promise<KeywordLookupResult> {
  const apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "Keywords Everywhere API key not configured",
    };
  }

  // Enforce max limit to prevent runaway costs
  const limitedKeywords = keywords.slice(0, MAX_KEYWORDS_PER_LOOKUP);

  try {
    const response = await fetch(
      "https://api.keywordseverywhere.com/v1/get_keyword_data",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          dataSource: "gkp", // Google Keyword Planner
          country: "us",
          currency: "USD",
          kw: JSON.stringify(limitedKeywords),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Keywords Everywhere API error:", errorText);
      return {
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const result = await response.json();

    if (!result.data || !Array.isArray(result.data)) {
      return {
        success: false,
        error: "Invalid response format from API",
      };
    }

    const data: KeywordData[] = result.data.map((kw: any) => ({
      keyword: kw.keyword,
      volume: kw.vol || 0,
      cpc: kw.cpc?.value || 0,
      competition: kw.competition || 0,
    }));

    return {
      success: true,
      data,
      creditsUsed: limitedKeywords.length,
    };
  } catch (error) {
    console.error("Keywords Everywhere fetch error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Export the max limit for UI to reference
export const KEYWORD_LOOKUP_LIMIT = MAX_KEYWORDS_PER_LOOKUP;
