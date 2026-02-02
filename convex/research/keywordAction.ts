"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import type { KeywordData } from "./keywords";
import { getKeywordVolume, KEYWORD_LOOKUP_LIMIT } from "./keywords";
import { api } from "../_generated/api";

interface LookupResult {
  success: boolean;
  data?: KeywordData[];
  error?: string;
  creditsUsed?: number;
  creditsNeeded?: number;
  creditsAvailable?: number;
}

export const lookupKeywords = action({
  args: {
    keywords: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<LookupResult> => {
    // Enforce limit
    const limitedKeywords = args.keywords.slice(0, KEYWORD_LOOKUP_LIMIT);
    if (limitedKeywords.length === 0) {
      return { success: false, error: "No keywords provided" };
    }

    // Check if user has enough credits
    const accessCheck = await ctx.runMutation(api.billing.checkKeywordAccess, {
      keywordCount: limitedKeywords.length,
    });

    if (!accessCheck.allowed) {
      return {
        success: false,
        error: accessCheck.reason || "Insufficient credits",
        creditsNeeded: limitedKeywords.length,
        creditsAvailable: accessCheck.creditsAvailable || 0,
      };
    }

    // Call the Keywords Everywhere API
    const result = await getKeywordVolume(limitedKeywords);

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Keyword lookup failed",
      };
    }

    // Note: credit tracking is done in the UI after success to avoid
    // charging for failed lookups

    return {
      success: true,
      data: result.data,
      creditsUsed: result.creditsUsed || limitedKeywords.length,
    };
  },
});
