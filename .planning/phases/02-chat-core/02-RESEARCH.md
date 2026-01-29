# Phase 2: Chat Core - Research

**Researched:** 2026-01-29
**Domain:** Real-time streaming chat with Claude API, message persistence, and UI rendering
**Confidence:** HIGH

## Summary

Phase 2 transforms the basic chat foundation into a Claude.ai-like experience with real-time streaming responses, visible thinking display, and smooth UX. The research confirms that all required capabilities are well-supported by the existing stack (Anthropic SDK 0.71.2, Convex, React).

**Key findings:**
- Anthropic SDK provides native streaming with separate `thinking_delta` and `text_delta` events for extended thinking display
- Convex best practice is to keep streaming in memory-only during generation, then persist complete responses (not streaming SSE infrastructure)
- 50ms batching interval is the standard for smooth streaming text updates (20 updates/sec)
- react-markdown (lightweight, XSS-safe) handles basic formatting without heavy dependencies
- Convex pagination with `usePaginatedQuery` enables efficient lazy-loading of message history

**Primary recommendation:** Use Anthropic SDK's `.stream()` helper with event handlers for thinking/text separation, throttle UI updates at 50ms intervals, and keep Convex persistence simple (complete messages only, not streaming state).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @anthropic-ai/sdk | 0.71.2+ | Claude API streaming | Official SDK with extended thinking support, built-in streaming helpers |
| react-markdown | 9.x | Markdown rendering | Lightweight (safe by default), no XSS, direct React components |
| Convex usePaginatedQuery | Built-in | Message pagination | Native Convex feature, cursor-based, reactive |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| remark-gfm | Latest | GitHub Flavored Markdown | If needing tables, strikethrough, task lists |
| exponential-backoff | 3.x | Retry logic | Only if implementing custom retry (consider built-in SDK retry first) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-markdown | markdown-to-jsx | Slightly smaller but less plugin ecosystem |
| react-markdown | @uiw/react-md-editor | 4.6kb but includes editor (unneeded) |
| In-memory streaming | @convex-dev/persistent-text-streaming | More infrastructure but survives page refresh mid-stream |

**Installation:**
```bash
npm install react-markdown
# Optional: if using GFM features (tables, strikethrough)
npm install remark-gfm
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── hooks/
│   ├── useStreamingChat.ts       # Streaming + persistence orchestration
│   ├── useScrollIntent.ts        # Auto-scroll with user intent detection
│   └── useThrottledState.ts      # 50ms batching for streaming updates
├── components/
│   ├── Chat.tsx                  # Main container
│   ├── MessageList.tsx           # Scrollable message display
│   ├── MessageBubble.tsx         # Individual message rendering
│   ├── ThinkingSection.tsx       # Collapsible thinking display
│   └── MessageInput.tsx          # Existing input component
└── lib/
    └── markdownConfig.ts         # react-markdown configuration
```

### Pattern 1: Streaming with Extended Thinking (Separate Blocks)

**What:** Stream thinking and response content separately, displaying thinking in collapsible section
**When to use:** All Claude responses with extended thinking enabled
**Example:**
```typescript
// Source: https://platform.claude.com/docs/en/api/messages-streaming
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Separate state for thinking vs response text
const [thinkingContent, setThinkingContent] = useState('');
const [responseContent, setResponseContent] = useState('');

const stream = await client.messages.stream({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 16000,
  thinking: {
    type: 'enabled',
    budget_tokens: 10000,
  },
  messages: formattedMessages,
});

// Event handlers separate thinking from text
stream.on('contentBlockStart', (block) => {
  if (block.content_block.type === 'thinking') {
    // Thinking block started
  } else if (block.content_block.type === 'text') {
    // Text block started
  }
});

stream.on('contentBlockDelta', (delta) => {
  if (delta.delta.type === 'thinking_delta') {
    setThinkingContent(prev => prev + delta.delta.thinking);
  } else if (delta.delta.type === 'text_delta') {
    setResponseContent(prev => prev + delta.delta.text);
  }
});

stream.on('messageStop', () => {
  // Stream complete - persist to Convex
  await saveMessage({ role: 'assistant', content: responseContent, thinking: thinkingContent });
});
```

### Pattern 2: Throttled State Updates (50ms Batching)

**What:** Batch streaming updates every 50ms to prevent render jank
**When to use:** All streaming text display
**Example:**
```typescript
// Source: https://medium.com/@hadiyolworld007/from-500ms-to-50ms-react-rendering-performance-case-study-fee7df230a46
// 50ms interval creates ~20 updates/sec, smooth appearance without jank
const useThrottledStreamingText = (streamingText: string) => {
  const [displayText, setDisplayText] = useState('');
  const bufferRef = useRef(streamingText);

  useEffect(() => {
    bufferRef.current = streamingText;

    const intervalId = setInterval(() => {
      setDisplayText(bufferRef.current);
    }, 50); // Batch updates every 50ms

    return () => clearInterval(intervalId);
  }, [streamingText]);

  return displayText;
};
```

### Pattern 3: Lazy Loading Messages with Convex Pagination

**What:** Load recent messages first, fetch older messages on scroll up
**When to use:** Sessions with > 20 messages
**Example:**
```typescript
// Source: https://docs.convex.dev/database/pagination
// Convex pagination query (convex/messages.ts)
export const paginatedMessages = query({
  args: {
    sessionId: v.id("sessions"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { page: [], continueCursor: null, isDone: true };

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      return { page: [], continueCursor: null, isDone: true };
    }

    return await ctx.db
      .query("messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc") // Most recent first
      .paginate(args.paginationOpts);
  },
});

// React component
const { results, status, loadMore } = usePaginatedQuery(
  api.messages.paginatedMessages,
  { sessionId },
  { initialNumItems: 20 }
);

// Detect scroll to top
useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  const handleScroll = () => {
    if (container.scrollTop === 0 && status === 'CanLoadMore') {
      loadMore(20); // Load 20 more messages
    }
  };

  container.addEventListener('scroll', handleScroll);
  return () => container.removeEventListener('scroll', handleScroll);
}, [status, loadMore]);
```

### Pattern 4: Collapsible Thinking Section

**What:** Thinking displayed in collapsible section, collapsed by default, uses CSS transitions
**When to use:** All assistant messages with thinking content
**Example:**
```typescript
// Source: https://blog.logrocket.com/create-collapsible-react-components-react-collapsed/
const ThinkingSection = ({ thinking }: { thinking: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="thinking-section">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="thinking-toggle"
      >
        <ChevronIcon rotated={isExpanded} />
        Thinking
      </button>
      <div
        ref={contentRef}
        style={{
          height: isExpanded ? `${contentRef.current?.scrollHeight}px` : '0px',
          overflow: 'hidden',
          transition: 'height 300ms ease-in-out',
        }}
      >
        <div className="thinking-content">
          <ReactMarkdown>{thinking}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
```

### Pattern 5: Silent Retry with Exponential Backoff

**What:** Auto-retry streaming failures silently, show error only after retries exhausted
**When to use:** All streaming API calls
**Example:**
```typescript
// Source: https://bpaulino.com/entries/retrying-api-calls-with-exponential-backoff
async function streamWithRetry(
  streamFn: () => Promise<any>,
  maxRetries = 3
) {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await streamFn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on 4xx errors (client errors)
      if (error instanceof Anthropic.APIError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      if (attempt < maxRetries) {
        // Exponential backoff: 200ms, 400ms, 800ms
        const delay = 200 * Math.pow(2, attempt);
        // Add jitter to avoid thundering herd
        const jitter = Math.random() * 100;
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
      }
    }
  }

  throw lastError!;
}
```

### Anti-Patterns to Avoid

- **Rendering on every token:** Don't update React state for each delta event - use 50ms throttling
- **Persisting incomplete streams:** Don't save messages until streaming completes - partial content creates inconsistent state
- **Using dangerouslySetInnerHTML:** react-markdown converts to React components safely, no XSS risk
- **Auto-scroll fighting user:** Always check scroll intent before auto-scrolling during streaming
- **Loading all messages at once:** Use pagination for sessions with many messages

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown rendering | Custom parser with regex | react-markdown | XSS safety, plugin ecosystem, React component output |
| Streaming SSE infrastructure | Custom EventSource + persistence | Anthropic SDK `.stream()` helper | Built-in accumulation, event handlers, error handling |
| Pagination cursors | Manual offset/limit tracking | Convex `usePaginatedQuery` | Reactive updates, cursor management, loading states |
| Exponential backoff | Custom retry loops | exponential-backoff npm package | Jitter, configurable delays, tested edge cases |
| Thinking encryption | Custom crypto | Anthropic API signature field | Official verification, cross-platform compatibility |

**Key insight:** Streaming chat has many subtle edge cases (connection drops, partial responses, race conditions). Use battle-tested libraries that handle these automatically.

## Common Pitfalls

### Pitfall 1: Streaming Without Throttling Causes Jank

**What goes wrong:** Updating React state on every delta event (100+ times/sec) causes layout thrashing and dropped frames
**Why it happens:** Each state update triggers re-render; browsers need 16ms per frame for 60fps
**How to avoid:** Batch streaming updates every 50ms (~20 updates/sec) using interval-based state flush
**Warning signs:** Choppy scrolling during streaming, high CPU usage in React DevTools profiler

### Pitfall 2: Auto-Scroll Fighting User Intent

**What goes wrong:** Auto-scrolling to bottom interrupts user reading previous messages
**Why it happens:** Scroll logic doesn't distinguish between "user scrolled up" vs "content pushed scroll position"
**How to avoid:** Track scroll intent - pause auto-scroll when user scrolls up, resume when they return to bottom
**Warning signs:** User complaints about "jumping" during streaming, inability to read earlier messages

### Pitfall 3: Persisting Incomplete Streaming State

**What goes wrong:** Network interruption or page refresh leaves partial responses in database
**Why it happens:** Saving messages incrementally during streaming instead of after completion
**How to avoid:** Keep streaming content in React state only; persist to Convex after `messageStop` event
**Warning signs:** Duplicate messages, truncated responses, inconsistent conversation history

### Pitfall 4: Loading All Messages Upfront

**What goes wrong:** Sessions with hundreds of messages cause slow initial load and memory bloat
**Why it happens:** Fetching all messages at once instead of paginating
**How to avoid:** Use Convex `usePaginatedQuery` with `initialNumItems: 20`, load more on scroll
**Warning signs:** Slow page loads, high memory usage, setTimeout warnings in console

### Pitfall 5: Thinking Blocks Not Preserved During Tool Use

**What goes wrong:** API errors or broken reasoning flow when using tools with thinking enabled
**Why it happens:** Not passing thinking blocks back to API with tool results
**How to avoid:** Always include complete unmodified thinking blocks in conversation history when using tools
**Warning signs:** API validation errors, degraded response quality, thinking disabled mid-turn

### Pitfall 6: Rate Limit Errors Not Humanized

**What goes wrong:** Users see technical "529 Overloaded" errors during high-traffic periods
**Why it happens:** Not translating Anthropic API error codes to user-friendly messages
**How to avoid:** Map error types to plain language (429 → "Claude is busy, trying again...", 529 → "High demand, please wait...")
**Warning signs:** User confusion, support tickets about cryptic errors

## Code Examples

Verified patterns from official sources:

### Streaming with Thinking Display

```typescript
// Source: https://github.com/anthropics/anthropic-sdk-typescript
import Anthropic from '@anthropic-ai/sdk';

const streamChatWithThinking = async (
  client: Anthropic,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string,
  onThinkingUpdate: (thinking: string) => void,
  onTextUpdate: (text: string) => void,
  onComplete: (thinking: string, text: string) => void
) => {
  let accumulatedThinking = '';
  let accumulatedText = '';

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16000,
    system: systemPrompt,
    thinking: {
      type: 'enabled',
      budget_tokens: 10000,
    },
    messages,
  });

  stream.on('contentBlockDelta', (delta) => {
    if (delta.delta.type === 'thinking_delta') {
      accumulatedThinking += delta.delta.thinking;
      onThinkingUpdate(accumulatedThinking);
    } else if (delta.delta.type === 'text_delta') {
      accumulatedText += delta.delta.text;
      onTextUpdate(accumulatedText);
    }
  });

  stream.on('messageStop', () => {
    onComplete(accumulatedThinking, accumulatedText);
  });

  stream.on('error', (error) => {
    throw error;
  });
};
```

### Markdown Rendering Configuration

```typescript
// Source: https://github.com/remarkjs/react-markdown
import ReactMarkdown from 'react-markdown';

const markdownComponents = {
  // No h1-h6 (headers) per requirements
  h1: 'p',
  h2: 'p',
  h3: 'p',
  h4: 'p',
  h5: 'p',
  h6: 'p',
  // Style basic formatting
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }: { children: React.ReactNode }) => (
    <em className="italic">{children}</em>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc list-inside space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal list-inside space-y-1">{children}</ol>
  ),
};

// Usage in component
<ReactMarkdown components={markdownComponents}>
  {message.content}
</ReactMarkdown>
```

### Convex Paginated Messages Query

```typescript
// Source: https://docs.convex.dev/database/pagination
// convex/messages.ts
import { paginationOptsValidator } from "convex/server";

export const paginatedMessages = query({
  args: {
    sessionId: v.id("sessions"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { page: [], continueCursor: null, isDone: true };
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      return { page: [], continueCursor: null, isDone: true };
    }

    // Order desc = newest first, but Convex returns page in order
    // Reverse in UI to show oldest at top, newest at bottom
    return await ctx.db
      .query("messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// React usage
const { results, status, loadMore } = usePaginatedQuery(
  api.messages.paginatedMessages,
  { sessionId },
  { initialNumItems: 20 }
);
```

### Scroll Intent Detection

```typescript
// Source: https://docs.convex.dev/database/pagination (scroll pattern)
const useScrollToTopDetection = (
  containerRef: RefObject<HTMLDivElement>,
  onScrollToTop: () => void
) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Near top (within 50px)
      if (container.scrollTop < 50) {
        onScrollToTop();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [onScrollToTop]);
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual SSE parsing | SDK `.stream()` helper | SDK v0.20+ (2024) | Simpler code, built-in accumulation |
| Full thinking output | Summarized thinking | Claude 4 models (2025) | Lower latency, streamable UX |
| Global context window | Thinking excluded from context | Claude 3.7+ (2025) | More effective token usage |
| React 17 batching | Automatic batching | React 18 (2022) | Fewer manual batching needs |
| Offset/limit pagination | Cursor-based pagination | Convex best practice | No page drift with inserts |

**Deprecated/outdated:**
- `anthropic.messages.create({ stream: true })` raw event iteration: Use `.stream()` helper instead
- Manual EventSource for SSE: SDK handles this internally
- Loading all messages at once: Always use pagination for production apps

## Open Questions

**1. Exact retry count before showing error**
   - What we know: 3 retries is common pattern; exponential backoff 200ms -> 400ms -> 800ms
   - What's unclear: Optimal count for Claude API specifically (consider model latency)
   - Recommendation: Start with 3 retries (total 4 attempts), make configurable

**2. Loading indicator before first token**
   - What we know: Thinking can take several seconds before first delta
   - What's unclear: Show "Thinking..." immediately or wait for first delta?
   - Recommendation: Show loading immediately on send, replace with thinking section on first delta

**3. Green shades for user vs Claude backgrounds**
   - What we know: Full-width messages, green palette from app already exists
   - What's unclear: Specific Tailwind green shade values
   - Recommendation: Extract from existing app design (check primary-500, check components for green usage)

**4. Thinking section expand/collapse animation**
   - What we know: CSS transitions using height and scrollHeight, 300ms is standard duration
   - What's unclear: Easing function preference (ease-in-out vs cubic-bezier)
   - Recommendation: Use `ease-in-out` for simplicity, switch to custom cubic-bezier if feels off

## Sources

### Primary (HIGH confidence)
- [Anthropic Messages Streaming API](https://platform.claude.com/docs/en/api/messages-streaming) - Streaming events, thinking deltas, error handling
- [Anthropic Extended Thinking Guide](https://platform.claude.com/docs/en/docs/build-with-claude/extended-thinking) - Thinking budget, summarization, tool use patterns
- [Anthropic SDK TypeScript GitHub](https://github.com/anthropics/anthropic-sdk-typescript) - `.stream()` helper, event handlers, TypeScript examples
- [Convex Pagination Documentation](https://docs.convex.dev/database/pagination) - usePaginatedQuery API, cursor-based pagination
- [react-markdown GitHub](https://github.com/remarkjs/react-markdown) - Component API, XSS safety, basic usage

### Secondary (MEDIUM confidence)
- [React Performance Case Study](https://medium.com/@hadiyolworld007/from-500ms-to-50ms-react-rendering-performance-case-study-fee7df230a46) - 50ms batching interval rationale
- [Streaming Chat with Convex](https://stack.convex.dev/build-streaming-chat-app-with-persistent-text-streaming-component) - Throttling pattern, chunkAppender delays
- [Exponential Backoff Guide](https://bpaulino.com/entries/retrying-api-calls-with-exponential-backoff) - Retry patterns, jitter implementation
- [React Collapsible Best Practices](https://blog.logrocket.com/create-collapsible-react-components-react-collapsed/) - Height animation, scrollHeight usage

### Tertiary (LOW confidence)
- [TanStack Pacer](https://shaxadd.medium.com/tanstack-pacer-solving-debounce-throttle-and-batching-the-right-way-94d699befc8a) - Alternative throttling library (not needed for 50ms pattern)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official SDK and Convex docs confirm all capabilities
- Architecture: HIGH - Patterns verified in official docs and production examples
- Pitfalls: HIGH - Based on documented edge cases and common issues

**Research date:** 2026-01-29
**Valid until:** ~30 days (stable domain, Claude SDK updates infrequent)

**Constraints from CONTEXT.md:**
- ✓ Researched streaming with thinking/text separation (locked decision)
- ✓ Researched lazy loading for history (locked decision)
- ✓ Researched auto-scroll with intent tracking (locked decision)
- ✓ Researched error handling with retry (locked decision)
- ✓ Researched basic markdown rendering (locked decision)
- ✓ Provided recommendations for Claude's discretion items (retry count, loading indicators, green shades, animation timing)
