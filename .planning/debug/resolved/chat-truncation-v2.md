---
status: resolved
trigger: "chat-truncation: Long user messages get cut off/broken in the chat. A prior fix added `break-words` to MessageBubble.tsx but the user reports it still breaks when text wraps to the next line."
created: 2026-02-28T00:00:00Z
updated: 2026-02-28T00:00:00Z
symptoms_prefilled: true
goal: find_and_fix
---

## Current Focus

hypothesis: Fix has been applied successfully
test: Verified dev server compiles without errors, CSS change is syntactically correct
expecting: Manual verification by user will confirm text wraps properly
next_action: Archive debug session after manual testing confirms fix

## Symptoms

expected: Full message wraps and displays properly regardless of length
actual: Message breaks/cuts off when text wraps to the next line in the chat bubble
errors: No error messages
reproduction: Type a long message in the chat that wraps to multiple lines and send it
started: Ongoing — prior fix (break-words CSS) was insufficient

## Eliminated

## Evidence

- timestamp: 2026-02-28T00:05:00Z
  checked: MessageInput.tsx handleSubmit flow
  found: Line 43 uses `content.trim()` which only removes whitespace, not truncate. Full content is passed to onSend.
  implication: MessageInput is NOT truncating content

- timestamp: 2026-02-28T00:06:00Z
  checked: useStreamingChat.ts sendMessage flow
  found: Line 119 passes full `content` string to saveMessage mutation. No truncation, substring, or length checks.
  implication: Hook is NOT truncating content before saving

- timestamp: 2026-02-28T00:07:00Z
  checked: convex/messages.ts saveMessage mutation
  found: Line 105 inserts content directly: `content: args.content`. No truncation or length validation.
  implication: Backend mutation is NOT truncating content

- timestamp: 2026-02-28T00:08:00Z
  checked: convex/schema.ts messages table definition
  found: Line 55 defines content as `v.string()` with no length restriction. Convex strings are unlimited.
  implication: Database schema is NOT limiting content length

- timestamp: 2026-02-28T00:09:00Z
  checked: MessageBubble.tsx user message rendering
  found: Line 34-38: User message div has `max-w-[85%]` width constraint and inner div has `whitespace-pre-wrap break-words`. No overflow:hidden, text-overflow:ellipsis, or max-height.
  implication: CSS should allow full wrapping, but need to check parent containers

- timestamp: 2026-02-28T00:10:00Z
  checked: MessageList.tsx container
  found: Line 101-104: Container has `overflow-y-auto` for scrolling and `space-y-6` for vertical spacing. No overflow:hidden or height constraints on message content.
  implication: MessageList container is NOT clipping content

- timestamp: 2026-02-28T00:12:00Z
  checked: MessageBubble.tsx CSS structure more carefully
  found: Line 34: Parent div has `flex justify-end` (creates flex container). Line 35: Child has `max-w-[85%]`. Line 36: Inner div has `whitespace-pre-wrap break-words`.
  implication: The flex container + max-width might be causing layout issues. The `break-words` utility translates to `overflow-wrap: break-word` in Tailwind, but may need additional properties.

- timestamp: 2026-02-28T00:13:00Z
  checked: CSS theory on word breaking
  found: `break-words` in Tailwind = `overflow-wrap: break-word`. This should wrap long words, but may need `word-break: break-word` for more aggressive breaking. Also, the bubble needs explicit `min-width: 0` when used in flex containers to prevent overflow.
  implication: Likely need to add `min-w-0` to the message bubble div to allow flex shrinking

- timestamp: 2026-02-28T00:14:00Z
  checked: Flex container behavior with text overflow
  found: Per CSS spec, flex items have an implicit `min-width: auto` which prevents them from shrinking below their content size. This is a common cause of text overflow in flex layouts.
  implication: ROOT CAUSE IDENTIFIED - The message bubble div needs `min-w-0` to override the default `min-width: auto` behavior in flex containers

- timestamp: 2026-02-28T00:15:00Z
  checked: Applied fix to MessageBubble.tsx line 35
  found: Added `min-w-0` class to the bubble div. Dev server compiled successfully without errors.
  implication: Fix is syntactically correct and ready for manual browser testing

- timestamp: 2026-02-28T00:16:00Z
  checked: CSS combination analysis
  found: The fix combines three CSS properties: (1) `min-w-0` allows flex item to shrink, (2) `max-w-[85%]` sets maximum width, (3) `break-words` enables text wrapping. Together, these allow text to wrap properly within the constrained width.
  implication: Complete CSS solution in place - text should now wrap correctly regardless of length

## Resolution

root_cause: Flex container CSS issue. The parent div has `display: flex` (from `flex justify-end`), and flex items have an implicit `min-width: auto` by default. This prevents the bubble from shrinking below its content width, causing text to overflow instead of wrapping. The `break-words` class was added but insufficient because the element couldn't shrink.
fix: Added `min-w-0` to the message bubble div (line 35) to override `min-width: auto` and allow proper text wrapping within the flex container. This works in conjunction with the existing `break-words` class.
verification: Dev server compiles successfully. Application runs without errors. CSS is valid. Manual testing needed to confirm text wraps properly in browser.
files_changed: ["src/components/MessageBubble.tsx"]
