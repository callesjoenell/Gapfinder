# Phase 7: Research Tools - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Enhance the methodology's Phase 1-2 (Find Gaps, Research) with actual research capabilities. Two modes:
1. **MCP-powered auto-research** — Claude queries external APIs and shows results
2. **Structured checklists** — Guide manual research where APIs don't exist, capture findings

This phase replaces the current vague "Research" phase with concrete tooling. It does NOT change the methodology phases themselves — it augments them with real data.

</domain>

<decisions>
## Implementation Decisions

### MCP Auto-Research Sources

Full research stack from skill document:

**Tier 1 (MCP Servers to integrate — FREE):**
- Reddit (mcp-server-reddit) — pain signals, complaints, frustrations
- Hacker News (@devabdultech/hn-mcp) — tech builder sentiment, what's being discussed
- ProductHunt (product-hunt-mcp) — competition, what's launching
- Google Trends (google-news-trends-mcp) — timing signals, trend direction (NO API KEY NEEDED)
- Tavily (tavily-mcp) — general web search, news, content extraction (free tier: 1000 queries/month)
- YouTube transcripts (mcp-server-youtube-transcript) — video pain signals
- GitHub (github-mcp-server) — what developers are building

**Tier 1.5 (Keyword Volume — PAID ADD-ON):**
- Keywords Everywhere — $10 for 100K credits, search volume + CPC + competition
- **Monetization:** Charge users 50% markup on API costs (pass-through + margin)
- Presented as optional paid feature in chat flow during Phase 1-2
- Alternative: SearchVolume.io (web tool for manual lookups, free but no API)

**Tier 2 (Direct API calls — FREE):**
- Indie Hackers API — founder discussions, revenue numbers
- DEV.to API — developer community pain
- Stack Overflow — technical problems, unanswered questions
- Government data (BLS, Census) — employment trends, demographics

### Manual Research Checklists

Structured checklists (not instructions) for sources without APIs:

**Facebook Groups:**
- User searches FB for relevant groups
- Reports back: group name, size, 3 top pain-related posts found, common language used
- Checklist captures: what keywords worked, what didn't

**LinkedIn:**
- User searches for relevant job postings or discussions
- Reports back: role titles hiring, skills demanded, pain points mentioned

**Twitter/X:**
- User searches for complaints, discussions
- Reports back: hashtags used, influencers in space, common complaints

**Amazon Reviews:**
- User finds related products, reads 1-2 star reviews
- Reports back: what's missing, what frustrates people

### Research Results Display

- Results appear inline in conversation (not separate panel)
- Claude summarizes findings with source links
- User can ask follow-up questions about specific results

### Checklist UI

- Form-based input within chat (not modal)
- Pre-filled prompts for what to look for
- Submitted findings become part of conversation context
- Findings persist to session for later reference

### Monetization

- **Free tier:** All MCP research (Reddit, HN, ProductHunt, Google Trends, Tavily, etc.)
- **Paid add-on:** Keyword search volume lookups via Keywords Everywhere
- **Pricing:** 50% markup on API costs (e.g., if API costs $0.0001/keyword, charge $0.00015)
- **UX:** Claude offers keyword lookup as optional upgrade during Phase 1-2 research
- **Tracking:** Need to track usage per user for billing

### Claude's Discretion

- Specific API query formatting
- How to batch/throttle requests
- Error handling when APIs fail
- Which sources to query based on user's domain

</decisions>

<specifics>
## Specific Ideas

- "Give me a checklist" — user expects structured form, not instructions
- Research findings should feel like evidence backing their instincts
- Full research stack from SKILL-final.md (lines 1457-1630)
- Pattern: Reddit pain + Google Trends timing + ProductHunt competition = triangulated validation

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-research-tools*
*Context gathered: 2026-02-02*
