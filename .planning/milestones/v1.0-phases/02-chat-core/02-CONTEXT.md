# Phase 2: Chat Core - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Conversations that feel identical to Claude.ai with the Gap Finder skill loaded. Users can send messages, see responses stream in real-time with visible thinking, and have full conversation history persisted and loaded on return. Session management and phase tracking are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Streaming behavior
- Tokens appear smoothly one-by-one (like Claude.ai), not in chunks
- Show Claude's thinking/reasoning in a collapsible section (like Claude.ai)
- Thinking streams in real-time as it's generated
- Thinking section collapsed by default — user expands if they want to see reasoning
- Auto-scroll pauses when user scrolls up; resumes when they scroll back to bottom

### History loading
- Load last 20 messages initially when opening a session
- Lazy load older messages as user scrolls up
- Show loading spinner at top while fetching older messages

### Error handling
- Auto-retry silently on streaming failures
- Show error only after retries fail (Claude decides retry count)
- Rate limit errors show plain language message (no technical jargon)
- Discard partial responses on failure — show clean error, let user retry fresh

### Message styling
- Full-width messages like Claude.ai (not chat bubbles)
- Use existing green color palette from the app for user vs Claude distinction
- Basic markdown rendering: bold, italic, lists — skip headers and complex formatting
- No timestamps on messages
- Medium spacing between messages — comfortable breathing room

### Claude's Discretion
- Exact retry count before showing error
- Loading indicator before first token arrives
- Specific green shades for user vs Claude backgrounds
- Thinking section expand/collapse animation

</decisions>

<specifics>
## Specific Ideas

- "I want it to feel identical to Claude.ai" — streaming, thinking display, scroll behavior
- Use the green colors already established in the app (not a new palette)
- Thinking should be collapsible like Claude.ai, not always visible

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-chat-core*
*Context gathered: 2026-01-29*
