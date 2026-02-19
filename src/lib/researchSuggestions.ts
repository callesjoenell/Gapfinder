/**
 * Research suggestion analysis.
 *
 * Analyzes recent conversation to surface contextual research suggestions.
 * Triggers on specific patterns that indicate research would be valuable.
 */

export type SuggestionType =
  | "pain_validation"      // User described a pain point -> validate on Reddit/HN
  | "competitor_check"     // User mentioned competitors -> check ProductHunt
  | "keyword_volume"       // User mentioned search terms -> offer volume lookup
  | "manual_facebook"      // User mentioned community -> Facebook Groups checklist
  | "manual_linkedin"      // User mentioned professionals -> LinkedIn checklist
  | "manual_twitter"       // User mentioned discussions -> Twitter checklist
  | "manual_amazon"        // User mentioned products -> Amazon reviews checklist
  | "general_search";      // Broad topic -> Tavily web search

export interface ResearchSuggestion {
  id: string;
  type: SuggestionType;
  label: string;           // Short chip text, e.g., "Research this pain point"
  description: string;     // Longer description for tooltip/queue
  query: string;           // Pre-filled search query
  source: string;          // Which tool to use
  priority: number;        // 1-3, higher = more relevant
  timestamp: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

/**
 * Analyze recent messages for research-worthy signals.
 * Returns suggestions ordered by priority (highest first).
 */
export function analyzeForSuggestions(
  messages: Message[],
  existingFindings: string[] = []
): ResearchSuggestion[] {
  const suggestions: ResearchSuggestion[] = [];

  // Only analyze last 5 messages for context
  const recentMessages = messages.slice(-5);
  const allRecentText = recentMessages.map(m => m.content.toLowerCase()).join(" ");

  // Pattern 1: Pain validation signals
  const painSignals = [
    "struggle with", "frustrated", "annoying", "pain", "problem",
    "difficult", "hard to", "waste time", "hate", "tedious",
    "others feel the same", "wonder if", "is this a real problem",
    "do people actually", "anyone else"
  ];

  if (painSignals.some(signal => allRecentText.includes(signal))) {
    // Extract the pain topic from context
    const painTopic = extractPainTopic(allRecentText);
    if (painTopic && !existingFindings.includes(`pain:${painTopic}`)) {
      suggestions.push({
        id: `pain-${Date.now()}`,
        type: "pain_validation",
        label: "Research this pain point",
        description: `Search Reddit and HN for others experiencing: "${painTopic}"`,
        query: painTopic,
        source: "reddit,hackernews",
        priority: 3,
        timestamp: Date.now(),
      });
    }
  }

  // Pattern 2: Competitor signals
  const competitorSignals = [
    "competitor", "alternative", "similar to", "like", "other tools",
    "already exists", "out there", "market", "what's available"
  ];

  if (competitorSignals.some(signal => allRecentText.includes(signal))) {
    const productTopic = extractProductTopic(allRecentText);
    if (productTopic && !existingFindings.includes(`competitor:${productTopic}`)) {
      suggestions.push({
        id: `competitor-${Date.now()}`,
        type: "competitor_check",
        label: "Check competitors",
        description: `Search ProductHunt for existing products in: "${productTopic}"`,
        query: productTopic,
        source: "producthunt",
        priority: 2,
        timestamp: Date.now(),
      });
    }
  }

  // Pattern 3: Keyword/search volume signals
  const volumeSignals = [
    "how many people", "search volume", "market size", "demand",
    "popular", "trending", "how big", "opportunity"
  ];

  if (volumeSignals.some(signal => allRecentText.includes(signal))) {
    const keywords = extractKeywords(allRecentText);
    if (keywords.length > 0) {
      suggestions.push({
        id: `volume-${Date.now()}`,
        type: "keyword_volume",
        label: "Check search volume",
        description: `Get monthly search volume for: ${keywords.slice(0, 3).join(", ")}`,
        query: keywords.join(","),
        source: "keywords_everywhere",
        priority: 2,
        timestamp: Date.now(),
      });
    }
  }

  // Pattern 4: Community/group signals -> Manual checklists
  const communitySignals = ["facebook group", "community", "fb group"];
  if (communitySignals.some(signal => allRecentText.includes(signal))) {
    suggestions.push({
      id: `facebook-${Date.now()}`,
      type: "manual_facebook",
      label: "Facebook Groups checklist",
      description: "Get a structured checklist for researching Facebook Groups",
      query: "",
      source: "manual",
      priority: 1,
      timestamp: Date.now(),
    });
  }

  // Pattern 5: Professional/LinkedIn signals
  const linkedinSignals = ["linkedin", "professional", "hiring", "job posting"];
  if (linkedinSignals.some(signal => allRecentText.includes(signal))) {
    suggestions.push({
      id: `linkedin-${Date.now()}`,
      type: "manual_linkedin",
      label: "LinkedIn checklist",
      description: "Get a structured checklist for LinkedIn research",
      query: "",
      source: "manual",
      priority: 1,
      timestamp: Date.now(),
    });
  }

  // Pattern 6: Product/Amazon signals
  const amazonSignals = ["amazon", "product review", "what people buy", "existing product"];
  if (amazonSignals.some(signal => allRecentText.includes(signal))) {
    suggestions.push({
      id: `amazon-${Date.now()}`,
      type: "manual_amazon",
      label: "Amazon Reviews checklist",
      description: "Get a structured checklist for Amazon review research",
      query: "",
      source: "manual",
      priority: 1,
      timestamp: Date.now(),
    });
  }

  // Sort by priority (highest first), then by timestamp (newest first)
  return suggestions
    .sort((a, b) => b.priority - a.priority || b.timestamp - a.timestamp)
    .slice(0, 3); // Max 3 suggestions at once
}

/**
 * Extract the pain topic from conversation text.
 */
function extractPainTopic(text: string): string | null {
  // Look for patterns like "struggle with X", "frustrated by X", etc.
  const patterns = [
    /struggle with (.+?)(?:\.|,|$)/i,
    /frustrated (?:by|with) (.+?)(?:\.|,|$)/i,
    /problem (?:with|of) (.+?)(?:\.|,|$)/i,
    /pain (?:point|of) (.+?)(?:\.|,|$)/i,
    /(?:invoicing|billing|scheduling|tracking|managing) (.+?)(?:\.|,|$)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Clean up and limit length
      return match[1].trim().slice(0, 50);
    }
  }

  // Fallback: look for domain + pain keywords
  const domainMatch = text.match(/(?:healthcare|freelancer|contractor|developer|designer|writer) (.+?)(?:\.|,|$)/i);
  if (domainMatch) {
    return domainMatch[1].trim().slice(0, 50);
  }

  return null;
}

/**
 * Extract product/market topic from conversation text.
 */
function extractProductTopic(text: string): string | null {
  const patterns = [
    /tools? for (.+?)(?:\.|,|$)/i,
    /software for (.+?)(?:\.|,|$)/i,
    /app for (.+?)(?:\.|,|$)/i,
    /similar to (.+?)(?:\.|,|$)/i,
    /like (.+?) but/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().slice(0, 50);
    }
  }

  return null;
}

/**
 * Extract potential keywords from conversation text.
 */
function extractKeywords(text: string): string[] {
  // Remove common words and extract potential search terms
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "shall", "can", "to", "of", "in",
    "for", "on", "with", "at", "by", "from", "as", "into", "through",
    "during", "before", "after", "above", "below", "between", "under",
    "again", "further", "then", "once", "here", "there", "when", "where",
    "why", "how", "all", "each", "few", "more", "most", "other", "some",
    "such", "no", "nor", "not", "only", "own", "same", "so", "than",
    "too", "very", "just", "i", "me", "my", "myself", "we", "our", "you",
    "your", "he", "him", "she", "her", "it", "they", "them", "this", "that"
  ]);

  // Extract 2-3 word phrases that might be search terms
  const words = text
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()));

  // Find multi-word terms (bigrams)
  const keywords: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (!stopWords.has(words[i].toLowerCase()) && !stopWords.has(words[i + 1].toLowerCase())) {
      keywords.push(bigram.toLowerCase());
    }
  }

  // Also include individual significant words
  const significantWords = words
    .filter(w => w.length > 4)
    .map(w => w.toLowerCase());

  const combined = [...keywords.slice(0, 3), ...significantWords.slice(0, 2)];
  return Array.from(new Set(combined));
}

/**
 * Check if a suggestion is actionable (can be triggered immediately).
 */
export function isImmediateSuggestion(type: SuggestionType): boolean {
  return !type.startsWith("manual_") && type !== "keyword_volume";
}

/**
 * Get the checklist type for manual suggestions.
 */
export function getChecklistType(type: SuggestionType): string | null {
  const mapping: Record<string, string> = {
    manual_facebook: "facebook_groups",
    manual_linkedin: "linkedin",
    manual_twitter: "twitter",
    manual_amazon: "amazon_reviews",
  };
  return mapping[type] || null;
}
