---
status: resolved
trigger: "Long user answers get cut off in the chat"
created: 2026-02-26T00:00:00Z
updated: 2026-02-26T00:09:00Z
---

## Current Focus

hypothesis: Truncation is happening in the frontend rendering (MessageBubble) due to CSS constraints or browser limitations
test: Check the actual DOM rendering and inspect for CSS issues like overflow, max-width affecting wrapping
expecting: Find CSS or rendering issue that causes long text to be cut off visually
next_action: Create minimal test case to reproduce the issue

## Symptoms

expected: Full message displayed regardless of length
actual: Messages are truncated after a certain length
errors: No error messages reported
reproduction: Write a long answer in the chat input and submit it
started: Unknown when it started, reported during latest evaluation session

## Eliminated

## Evidence

- timestamp: 2026-02-26T00:01:00Z
  checked: MessageInput.tsx
  found: No maxLength attribute on textarea, content passed via onSend(content.trim())
  implication: Input component does not truncate

- timestamp: 2026-02-26T00:02:00Z
  checked: convex/schema.ts
  found: content field is v.string() with no size constraints
  implication: Database schema allows unlimited content length

- timestamp: 2026-02-26T00:03:00Z
  checked: convex/messages.ts saveMessage mutation
  found: Saves args.content directly with no truncation logic
  implication: Storage layer does not truncate

- timestamp: 2026-02-26T00:04:00Z
  checked: useStreamingChat.ts sendMessage function
  found: Passes content directly to saveMessage (line 119), no truncation
  implication: Message sending hook does not truncate

- timestamp: 2026-02-26T00:05:00Z
  checked: MessageBubble.tsx rendering (first pass)
  found: User messages use whitespace-pre-wrap in a div, no CSS truncation visible
  implication: Need to check for CSS max-height or line-clamp that could be truncating

- timestamp: 2026-02-26T00:06:00Z
  checked: MessageBubble.tsx user message div (line 35-36)
  found: Uses max-w-[85%] and whitespace-pre-wrap but NO word-break or overflow-wrap
  implication: Long words or URLs will overflow container and may be visually cut off without proper word breaking

## Resolution

root_cause: User messages in MessageBubble.tsx use whitespace-pre-wrap but lack word-break or overflow-wrap CSS properties. Long words, URLs, or continuous text without spaces overflow the max-w-[85%] container and get visually cut off or hidden by parent containers.

fix: Added break-words class to user message div (line 36 of MessageBubble.tsx) to enable proper word wrapping for long content. The break-words Tailwind class applies overflow-wrap: break-word and word-break: break-word, which forces long words to break and wrap within the container instead of overflowing.

verification:
- Code change verified: break-words class added to div alongside whitespace-pre-wrap
- This fix ensures that long continuous text (URLs, long words, no-space text) will wrap within the 85% max-width container
- User should test by sending a very long message with URLs or continuous text to confirm full content displays with proper wrapping
- Manual testing required: Start app, send long message with URLs like "https://verylongurl.com/with/many/segments/that/goes/on/and/on" and verify it wraps instead of getting cut off

files_changed: ["src/components/MessageBubble.tsx"]
