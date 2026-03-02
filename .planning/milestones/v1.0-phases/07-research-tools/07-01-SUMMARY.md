---
phase: 07-research-tools
plan: 01
subsystem: api
tags: [claude, anthropic, tool-use, reddit, hackernews, tavily, producthunt, stackoverflow, research, convex]

# Dependency graph
requires:
  - phase: 02-chat-core
    provides: Claude API integration and conversation infrastructure
provides:
  - Claude tool definitions for 6 research sources (Reddit, HN, Tavily, ProductHunt, YouTube, Stack Overflow)
  - API wrapper modules for all free research sources with TypeScript interfaces
  - Server-side API key management (no browser exposure)
affects: [07-02-research-action, 07-03-research-ui, research-tools]

# Tech tracking
tech-stack:
  added: [node:zlib for Stack Overflow gzip decompression]
  patterns: ["use node" directive for Node.js runtime in Convex actions, graceful API degradation]

key-files:
  created:
    - convex/research/tools.ts
    - convex/research/hackernews.ts
    - convex/research/tavily.ts
    - convex/research/reddit.ts
    - convex/research/producthunt.ts
    - convex/research/stackoverflow.ts
  modified: []

key-decisions:
  - "Claude tool use format with name, description, input_schema following Anthropic spec"
  - "All API keys server-side only via process.env (TAVILY_API_KEY, PRODUCTHUNT_API_KEY)"
  - "Graceful degradation: optional integrations return empty arrays vs throwing errors"
  - "Hacker News and Stack Overflow work without API keys (free public APIs)"
  - "Reddit anonymous read-only access (60 req/min rate limit)"
  - "Stack Overflow gzip decompression via node:zlib"

patterns-established:
  - "API wrapper pattern: async function with typed result interface, graceful error handling"
  - "Tool definition pattern: name, description, input_schema with JSON Schema validation"
  - "Error handling: return empty arrays for network/API failures to allow conversation continuation"

# Metrics
duration: 2min
completed: 2026-02-02
---

# Phase 7 Plan 1: Research Tools Foundation Summary

**Claude tool definitions and API wrappers for 6 research sources: Reddit, HN, Tavily, ProductHunt, YouTube transcripts, and Stack Overflow**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-02T14:52:53Z
- **Completed:** 2026-02-02T14:54:55Z
- **Tasks:** 3
- **Files modified:** 6 (all created)

## Accomplishments
- Complete Claude tool definition array with 6 research tools following Anthropic schema
- API wrappers for all free sources: HN (Algolia), Reddit (JSON), Stack Overflow (Stack Exchange)
- Paid/optional source wrappers with graceful degradation: Tavily (AI search), ProductHunt (GraphQL)
- All API keys server-side only (Convex actions with "use node" directive)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Claude tool definitions for all research sources** - `3b54ef9` (feat)
2. **Task 2: Implement Hacker News and Tavily API wrappers** - `3daa7f8` (feat)
3. **Task 3: Implement Reddit, ProductHunt, and Stack Overflow API wrappers** - `061f15d` (feat)

## Files Created/Modified

- `convex/research/tools.ts` - Claude tool definitions array with 6 tools (search_reddit, search_hackernews, search_tavily, search_producthunt, search_youtube_transcripts, search_stackoverflow)
- `convex/research/hackernews.ts` - HN Algolia API wrapper, free public access, returns stories/comments
- `convex/research/tavily.ts` - Tavily AI search wrapper, requires TAVILY_API_KEY env var
- `convex/research/reddit.ts` - Reddit anonymous JSON API wrapper, 60 req/min rate limit
- `convex/research/producthunt.ts` - ProductHunt GraphQL API wrapper, optional PRODUCTHUNT_API_KEY (graceful degradation)
- `convex/research/stackoverflow.ts` - Stack Exchange API wrapper with gzip decompression, 300 req/day free

## Decisions Made

1. **Claude tool use format** - Followed Anthropic's tool use schema exactly: name (snake_case), description (when to use it), input_schema (JSON Schema with properties and required fields)

2. **Server-side API keys only** - All wrappers use process.env for API keys in Convex actions ("use node" directive), never exposed to browser

3. **Graceful degradation pattern** - Optional integrations (ProductHunt) return empty arrays with console warnings rather than throwing errors, allowing conversations to continue

4. **Free-first approach** - HN and Stack Overflow work without API keys (public APIs), Reddit uses anonymous access, only Tavily requires key for core functionality

5. **Stack Overflow gzip handling** - Stack Exchange API returns gzip by default, use node:zlib gunzipSync for decompression

6. **Rate limit awareness** - Reddit 60 req/min, Stack Overflow 300/day documented in code and error messages

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all API wrappers compiled and structured as specified.

## User Setup Required

**External services require configuration.** Environment variables needed:

1. **Required for Tavily web search:**
   ```bash
   npx convex env set TAVILY_API_KEY "tvly-..."
   ```
   Get API key from: https://tavily.com/

2. **Optional for ProductHunt search:**
   ```bash
   npx convex env set PRODUCTHUNT_API_KEY "..."
   ```
   Get API key from: https://api.producthunt.com/v2/docs (requires approval)

**No configuration needed for:** Reddit, Hacker News, YouTube transcripts, Stack Overflow (all use free public APIs)

## Next Phase Readiness

- Tool definitions ready for 07-02 (research action integration)
- API wrappers ready to be called from Convex actions
- TypeScript interfaces exported for type-safe integration
- All sources documented with rate limits and auth requirements
- No blockers - can proceed to action implementation

---
*Phase: 07-research-tools*
*Completed: 2026-02-02*
