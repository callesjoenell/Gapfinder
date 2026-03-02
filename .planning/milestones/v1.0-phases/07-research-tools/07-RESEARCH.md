# Phase 7: Research Tools - Research

**Researched:** 2026-02-02
**Domain:** MCP Integration, External APIs, Usage Tracking, Chat UI Components
**Confidence:** MEDIUM (MCP ecosystem still evolving, many servers are community-maintained)

## Summary

Phase 7 adds research capabilities to Gap Finder through two mechanisms: (1) MCP-powered auto-research for sources with accessible APIs (Reddit, Hacker News, ProductHunt, Google Trends, Tavily, YouTube transcripts, GitHub), and (2) structured manual research checklists for sources without APIs (Facebook Groups, LinkedIn, Twitter/X, Amazon Reviews). The phase also includes a paid add-on for keyword search volume via Keywords Everywhere API with usage tracking for billing.

The critical architectural decision is whether to use MCP client-side (via `use-mcp` React hook) or implement tool use directly in Convex actions. Given the app's serverless architecture on Convex, **the recommended approach is Claude tool use in Convex actions** rather than MCP client integration. This avoids the statelessness challenges of serverless MCP, keeps API keys server-side, and leverages existing patterns in claude.ts and ideasActions.ts.

**Primary recommendation:** Implement research as Claude tool use in Convex actions, wrapping external APIs as tools that Claude can invoke during chat. For keyword volume, use Keywords Everywhere API directly with Autumn for usage tracking.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @anthropic-ai/sdk | Latest | Claude tool use | Already in use; supports tool definitions natively |
| @useautumn/convex | 0.1.24+ | Usage tracking & billing | Convex-native billing solution, credit-based metering |
| autumn-js | 0.1.24+ | Frontend billing hooks | Companion to Autumn backend |

### Research APIs (Direct Integration)
| Source | Method | Rate Limit | Auth |
|--------|--------|------------|------|
| Tavily | REST API | 1000/mo free tier | API key |
| Reddit | redditwarp/direct API | 60 req/min (OAuth), 10 req/min (anon) | OAuth optional |
| Hacker News | Algolia Search API | No strict limit | None needed |
| ProductHunt | GraphQL API v2 | Standard limits | OAuth/API key |
| Google Trends | pytrends-like scraping | Unreliable, may break | None (scraping) |
| YouTube Transcripts | youtube-transcript-api | Standard limits | None needed |
| Stack Overflow | Stack Exchange API | 50 req/2s burst, 5000/day | API key optional |
| Keywords Everywhere | REST API | Credit-based ($10/100K) | API key |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form | 7.x | Form state management | Manual research checklists |
| zod | 3.x | Form validation | Checklist input validation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Direct API calls | MCP servers via use-mcp | MCP adds complexity for serverless; direct APIs simpler for Convex |
| Autumn | Manual Stripe integration | Autumn abstracts billing complexity, native Convex support |
| Google Trends direct | @andrewlwn77/google-trends-mcp | MCP server requires API key, unreliable pytrends underneath |

**Installation:**
```bash
npm install @useautumn/convex autumn-js react-hook-form zod
```

## Architecture Patterns

### Recommended Project Structure
```
convex/
  research/              # Research-specific actions
    tools.ts             # Tool definitions for Claude
    reddit.ts            # Reddit API wrapper
    hackernews.ts        # HN API wrapper
    tavily.ts            # Tavily API wrapper
    producthunt.ts       # ProductHunt API wrapper
    youtube.ts           # YouTube transcript API
    keywords.ts          # Keywords Everywhere API
    stackoverflow.ts     # Stack Overflow API
  researchActions.ts     # Main research action (orchestrates tools)
  billing.ts             # Usage tracking with Autumn

src/
  components/
    research/
      ResearchChecklist.tsx    # Manual research form
      ResearchResults.tsx      # Display auto-research results
      KeywordLookup.tsx        # Paid keyword volume UI
```

### Pattern 1: Claude Tool Use for Research
**What:** Define research sources as Claude tools, let Claude decide when to invoke them
**When to use:** When Claude is having a conversation and research context would help
**Example:**
```typescript
// Source: https://platform.claude.com/docs/en/docs/build-with-claude/tool-use
// convex/research/tools.ts
export const researchTools = [
  {
    name: "search_reddit",
    description: "Search Reddit for pain signals, complaints, and frustrations about a topic",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        subreddit: { type: "string", description: "Optional subreddit to search" },
        limit: { type: "number", description: "Max results (default 10)" }
      },
      required: ["query"]
    }
  },
  {
    name: "search_hackernews",
    description: "Search Hacker News for tech builder sentiment and discussions",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        type: { type: "string", enum: ["story", "comment"], description: "Content type" }
      },
      required: ["query"]
    }
  },
  {
    name: "get_keyword_volume",
    description: "Get search volume and competition data for keywords. PAID FEATURE - costs credits.",
    input_schema: {
      type: "object",
      properties: {
        keywords: { type: "array", items: { type: "string" }, description: "Keywords to look up" }
      },
      required: ["keywords"]
    }
  }
];
```

### Pattern 2: Tool Execution Loop
**What:** When Claude returns tool_use, execute the tool and return results
**When to use:** Every chat message when research tools are enabled
**Example:**
```typescript
// Source: https://platform.claude.com/docs/en/docs/build-with-claude/tool-use
// convex/researchActions.ts
export const chatWithResearch = action({
  args: { sessionId: v.id("sessions"), messages: v.array(...), systemPrompt: v.string() },
  handler: async (ctx, args) => {
    let response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      tools: researchTools,
      system: args.systemPrompt,
      messages: args.messages
    });

    // Loop while Claude wants to use tools
    while (response.stop_reason === "tool_use") {
      const toolUse = response.content.find(c => c.type === "tool_use");
      const toolResult = await executeResearchTool(ctx, toolUse.name, toolUse.input);

      // Add tool use and result to messages
      const updatedMessages = [
        ...args.messages,
        { role: "assistant", content: response.content },
        { role: "user", content: [{ type: "tool_result", tool_use_id: toolUse.id, content: toolResult }] }
      ];

      response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        tools: researchTools,
        messages: updatedMessages
      });
    }

    return response;
  }
});
```

### Pattern 3: Autumn Usage Tracking
**What:** Track keyword lookups for billing
**When to use:** Before executing paid features (keyword volume)
**Example:**
```typescript
// Source: https://www.convex.dev/components/autumn
// convex/billing.ts
import { Autumn } from "@useautumn/convex";
const autumn = new Autumn();

export const checkKeywordAccess = mutation({
  args: { keywordCount: v.number() },
  handler: async (ctx, args) => {
    const result = await autumn.check(ctx, { featureId: "keyword_lookups" });
    if (!result.data.allowed) {
      return { allowed: false, reason: "No credits remaining" };
    }
    return { allowed: true };
  }
});

export const trackKeywordUsage = mutation({
  args: { keywordCount: v.number() },
  handler: async (ctx, args) => {
    // Track usage with 50% markup built into credit cost
    await autumn.track(ctx, { featureId: "keyword_lookups", value: args.keywordCount });
  }
});
```

### Pattern 4: Inline Research Checklist
**What:** Form-based input within chat for manual research findings
**When to use:** When user needs to report findings from Facebook Groups, LinkedIn, etc.
**Example:**
```typescript
// src/components/research/ResearchChecklist.tsx
interface ChecklistField {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea" | "array";
}

const FACEBOOK_CHECKLIST: ChecklistField[] = [
  { id: "groupName", label: "Group Name", placeholder: "e.g., Shopify Entrepreneurs", type: "text" },
  { id: "groupSize", label: "Group Size", placeholder: "e.g., 45,000 members", type: "text" },
  { id: "topPainPosts", label: "Top Pain-Related Posts", placeholder: "Copy 3 posts showing frustration...", type: "textarea" },
  { id: "commonLanguage", label: "Common Language Used", placeholder: "What words do they use for their problems?", type: "textarea" }
];

export function ResearchChecklist({ type, onSubmit }: { type: ChecklistType; onSubmit: (data: Record<string, string>) => void }) {
  const { register, handleSubmit } = useForm();
  const fields = type === "facebook" ? FACEBOOK_CHECKLIST : /* other types */;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-gray-50 rounded-lg">
      {fields.map(field => (
        <div key={field.id}>
          <label className="block text-sm font-medium">{field.label}</label>
          {field.type === "textarea" ? (
            <textarea {...register(field.id)} placeholder={field.placeholder} className="w-full p-2 border rounded" />
          ) : (
            <input {...register(field.id)} placeholder={field.placeholder} className="w-full p-2 border rounded" />
          )}
        </div>
      ))}
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Submit Findings</button>
    </form>
  );
}
```

### Anti-Patterns to Avoid
- **MCP servers in Convex runtime:** MCP servers are designed for persistent connections; Convex actions are stateless. Use direct API calls instead.
- **Client-side API keys:** Never expose Tavily, Keywords Everywhere, or other API keys in frontend code.
- **Unbounded API calls:** Always enforce rate limits and credit checks before executing paid lookups.
- **Storing raw API responses:** Summarize and extract relevant data; don't store entire Reddit threads.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Usage tracking | Custom credit system | Autumn component | Handles Stripe, metering, access checks natively |
| Reddit API auth | OAuth flow from scratch | redditwarp / anonymous API | Anonymous is sufficient for read-only, simpler |
| HN search | Custom scraper | Algolia HN Search API | Official search API, no scraping needed |
| Form validation | Manual validation | react-hook-form + zod | Type-safe, handles arrays, good DX |
| Billing checkout | Stripe integration | Autumn.checkout() | Abstracts subscription/credit complexity |

**Key insight:** The research sources already have APIs or MCP servers; the work is integration, not building scrapers. Focus on orchestration (Claude tool use) rather than data fetching logic.

## Common Pitfalls

### Pitfall 1: Treating MCP Servers as Drop-in Solutions
**What goes wrong:** Developers assume MCP servers "just work" in any environment
**Why it happens:** MCP is designed for persistent connections (stdio, SSE); serverless functions are stateless
**How to avoid:** Use direct API calls in Convex actions; convert MCP tool definitions to Claude tool use format
**Warning signs:** "Connection reset" errors, timeouts, state not persisting between requests

### Pitfall 2: Google Trends API Instability
**What goes wrong:** Pytrends-based solutions break frequently when Google changes their backend
**Why it happens:** Google Trends has no official API; all access is unofficial scraping
**How to avoid:** Make Google Trends optional/best-effort; don't rely on it for critical features; have fallback
**Warning signs:** Empty results, 429 errors, changed response formats

### Pitfall 3: Exposing API Keys in Tool Responses
**What goes wrong:** Claude's response includes the actual API data with potential metadata showing keys
**Why it happens:** Tool results are passed back to Claude who may echo them
**How to avoid:** Sanitize tool results; strip any metadata before returning to Claude
**Warning signs:** API keys appearing in conversation, usage spikes from leaked keys

### Pitfall 4: Unbounded Keyword Lookups
**What goes wrong:** User requests "all keywords for [broad topic]" and burns through credits
**Why it happens:** Keywords Everywhere charges per keyword; no natural limit
**How to avoid:** Set max keywords per lookup (e.g., 20); show credit cost before execution; require confirmation
**Warning signs:** Users complaining about unexpected charges, rapid credit depletion

### Pitfall 5: Rate Limiting Across Multiple Sources
**What goes wrong:** Research queries hit rate limits on multiple APIs simultaneously
**Why it happens:** Claude may request parallel tool calls; each API has different limits
**How to avoid:** Implement sequential tool execution for research; add delays between different API calls
**Warning signs:** 429 errors, blocked IPs, degraded service

### Pitfall 6: Checklist Data Not Persisting
**What goes wrong:** User submits checklist, data doesn't appear in later phases
**Why it happens:** Checklist submissions not properly saved to session context
**How to avoid:** Store checklist data as structured messages; include in session summaries
**Warning signs:** Claude doesn't reference manual research findings in later phases

## Code Examples

Verified patterns from official sources:

### Claude Tool Use Definition
```typescript
// Source: https://platform.claude.com/docs/en/docs/build-with-claude/tool-use
const tools = [
  {
    name: "search_reddit",
    description: "Search Reddit for discussions about a topic",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query"
        },
        subreddit: {
          type: "string",
          description: "Optional: limit to specific subreddit"
        }
      },
      required: ["query"]
    }
  }
];
```

### Tool Execution Handler
```typescript
// Source: https://platform.claude.com/docs/en/docs/build-with-claude/tool-use
async function executeResearchTool(toolName: string, input: Record<string, unknown>): Promise<string> {
  switch (toolName) {
    case "search_reddit":
      const results = await searchReddit(input.query as string, input.subreddit as string);
      return JSON.stringify(results);
    case "search_hackernews":
      const hnResults = await searchHackerNews(input.query as string, input.type as string);
      return JSON.stringify(hnResults);
    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}
```

### Hacker News Algolia Search
```typescript
// Source: https://hn.algolia.com/api
// HN Search API is free, no auth required
async function searchHackerNews(query: string, type: "story" | "comment" = "story"): Promise<HNResult[]> {
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=${type}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.hits.slice(0, 10).map((hit: any) => ({
    title: hit.title || hit.story_title,
    url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
    points: hit.points,
    comments: hit.num_comments,
    author: hit.author,
    created: hit.created_at
  }));
}
```

### Tavily Search Integration
```typescript
// Source: https://docs.tavily.com/documentation/mcp
// Tavily provides web search with AI-optimized results
async function searchTavily(query: string, options: { max_results?: number } = {}): Promise<TavilyResult[]> {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.TAVILY_API_KEY}`
    },
    body: JSON.stringify({
      query,
      max_results: options.max_results || 10,
      search_depth: "basic"
    })
  });
  const data = await response.json();
  return data.results;
}
```

### Keywords Everywhere API
```typescript
// Source: Keywords Everywhere API documentation
async function getKeywordVolume(keywords: string[]): Promise<KeywordData[]> {
  const response = await fetch("https://api.keywordseverywhere.com/v1/get_keyword_data", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.KEYWORDS_EVERYWHERE_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      dataSource: "gkp", // Google Keyword Planner
      country: "us",
      currency: "USD",
      kw: JSON.stringify(keywords)
    })
  });
  const data = await response.json();
  return data.data.map((kw: any) => ({
    keyword: kw.keyword,
    volume: kw.vol,
    cpc: kw.cpc,
    competition: kw.competition
  }));
}
```

### Autumn Usage Tracking
```typescript
// Source: https://www.convex.dev/components/autumn
import { Autumn } from "@useautumn/convex";
const autumn = new Autumn();

// Check before allowing paid feature
const canUse = await autumn.check(ctx, { featureId: "keyword_lookups" });
if (!canUse.data.allowed) {
  throw new Error("Insufficient credits for keyword lookup");
}

// Track usage after execution
await autumn.track(ctx, {
  featureId: "keyword_lookups",
  value: keywords.length // 1 credit per keyword
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom MCP client in browser | use-mcp React hook | April 2024 | Simpler client-side MCP, but still has serverless limitations |
| Stripe direct integration | Autumn component for Convex | 2025 | Credit-based billing becomes trivial in Convex apps |
| RAG for research | Claude tool use with live APIs | 2024-2025 | Real-time data instead of stale embeddings |
| pytrends for Google Trends | Multiple MCP servers attempting same | Ongoing | Still unreliable, no official API |

**Deprecated/outdated:**
- **MCP stdio transport in serverless:** Doesn't work; use HTTP transport or direct APIs
- **Reddit API without OAuth for write:** Read-only anonymous access is fine; writing requires full OAuth
- **Keywords Everywhere browser extension:** API is the programmatic way; extension is for manual users

## Open Questions

Things that couldn't be fully resolved:

1. **Google Trends Reliability**
   - What we know: All access is unofficial; pytrends breaks frequently
   - What's unclear: Whether any current solution is production-ready
   - Recommendation: Make Google Trends optional/best-effort; show "unavailable" gracefully

2. **Indie Hackers API**
   - What we know: No official public API found; some scraping solutions exist
   - What's unclear: Whether an unofficial API exists or if it's scraping-only
   - Recommendation: Defer Indie Hackers to future; use HN/Reddit as proxies for founder sentiment

3. **Keywords Everywhere Credit Pricing**
   - What we know: $10 for 100K credits; 1 credit per keyword lookup
   - What's unclear: Exact cost breakdown for volume+CPC+competition vs just volume
   - Recommendation: Assume 1 credit = 1 keyword for all data; verify during implementation

4. **MCP in Convex Actions**
   - What we know: MCP designed for persistent connections; Convex is stateless
   - What's unclear: Whether @anthropic-ai/sdk MCP connector works in Convex Node.js runtime
   - Recommendation: Use direct API calls; simpler and more reliable than MCP in serverless

## Sources

### Primary (HIGH confidence)
- [Claude Tool Use Documentation](https://platform.claude.com/docs/en/docs/build-with-claude/tool-use) - Tool definitions, execution loop
- [Convex Autumn Component](https://www.convex.dev/components/autumn) - Usage tracking, billing
- [Tavily MCP Docs](https://docs.tavily.com/documentation/mcp) - API reference, rate limits
- [HN Algolia Search API](https://hn.algolia.com/api) - Free, no auth, reliable

### Secondary (MEDIUM confidence)
- [use-mcp GitHub](https://github.com/modelcontextprotocol/use-mcp) - React MCP client
- [Cloudflare MCP Blog](https://blog.cloudflare.com/connect-any-react-application-to-an-mcp-server-in-three-lines-of-code/) - use-mcp patterns
- [Reddit MCP Servers](https://github.com/hawstein/mcp-server-reddit) - Multiple implementations available
- [Keywords Everywhere API](https://keywordseverywhere.com/api-documentation.html) - Pricing, endpoints

### Tertiary (LOW confidence)
- Google Trends MCP servers - Multiple implementations, all rely on unreliable pytrends
- Indie Hackers API - No official documentation found
- DEV.to API rate limits - Official docs unclear on exact limits

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - APIs are well-documented but MCP ecosystem is still maturing
- Architecture: HIGH - Claude tool use is well-documented by Anthropic
- Pitfalls: MEDIUM - Based on MCP ecosystem reports and serverless patterns
- External APIs: MEDIUM - Rate limits may change; some unofficial

**Research date:** 2026-02-02
**Valid until:** 2026-03-02 (30 days - MCP ecosystem evolving; APIs may change)
