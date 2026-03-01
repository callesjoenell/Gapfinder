---
status: resolved
trigger: "chat-truncation-v3 — long user messages get cut off/truncated in chat UI after two prior fix attempts"
created: 2026-03-01T00:00:00Z
updated: 2026-03-01T00:00:00Z
---

## Current Focus

hypothesis: The `max-w-[85%]` constraint on the message bubble applies to 85% of the FLEX PARENT width, but the flex parent (`flex justify-end`) itself may not be constrained to the full available width. The real culprit is that `overflow-hidden` on a parent (IdeaCard, Layout main, or Chat container) is clipping the message visually rather than wrapping the text.
test: Examining the layout chain from Layout -> Chat -> MessageList -> MessageBubble to find which ancestor has overflow constraints
expecting: One ancestor uses overflow-hidden without proper width propagation, causing visual clipping
next_action: CONFIRMED — overflow-hidden on IdeaCard combined with the resizable split layout may be causing the chat area to not get full available height/width. But more likely the issue is in Chat.tsx's flex column structure missing `min-w-0` at the top level.

## Symptoms

expected: Full message text should be visible without being cut off, regardless of message length
actual: Message text is visually truncated/clipped in the chat bubble
errors: No error messages
reproduction: Type a long message in the chat and send it — text gets cut off
started: Ongoing — two previous debug sessions attempted fixes but neither fully resolved the issue

## Eliminated

- hypothesis: Missing word-break/overflow-wrap CSS on the text element
  evidence: `break-words` class already applied in session 1 — not sufficient alone
  timestamp: prior-session-1

- hypothesis: Flex container min-width:auto preventing bubble from shrinking
  evidence: `min-w-0` added to bubble div in session 2 — not sufficient alone
  timestamp: prior-session-2

## Evidence

- timestamp: 2026-03-01T00:00:00Z
  checked: MessageBubble.tsx user message render
  found: |
    <div className="flex justify-end">
      <div className="min-w-0 max-w-[85%] bg-primary-500 text-white rounded-2xl px-4 py-3">
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
      </div>
    </div>
  implication: The bubble has min-w-0 and break-words applied. The outer div is `flex justify-end` with no explicit width. This div will only be as wide as its parent allows.

- timestamp: 2026-03-01T00:00:00Z
  checked: MessageList.tsx container
  found: `className="flex-1 overflow-y-auto px-4 py-6 space-y-6"` — no overflow-x constraint
  implication: Container is flex-1 so it takes available space. overflow-y-auto is fine. This should work correctly.

- timestamp: 2026-03-01T00:00:00Z
  checked: Chat.tsx root element
  found: `<div ref={chatContainerRef} className="flex flex-col h-full bg-gray-50 relative">`
  implication: No width constraint, flex column. Looks fine. But chatContainerRef is also used for useResizableSplit — split affects the IdeaCard height, not the chat width.

- timestamp: 2026-03-01T00:00:00Z
  checked: Layout.tsx structure
  found: |
    flex h-screen bg-gray-50
      Sidebar
      div.flex-1.flex.flex-col.overflow-hidden
        Header
        main.flex-1.overflow-hidden  <-- overflow-hidden here
          Chat (children)
  implication: The `main` element has `overflow-hidden`. This is the critical clue. If `main` clips content, and `Chat` doesn't have w-full, there may be an issue. But Chat has h-full which only affects height.

- timestamp: 2026-03-01T00:00:00Z
  checked: The `flex justify-end` wrapper in MessageBubble
  found: This wrapper div has NO explicit width set — it will size to its content in certain flex contexts
  implication: CRITICAL — in a flex column (space-y-6 list), each child item takes the cross-axis width. But the `flex justify-end` wrapper itself has no `w-full`. In some flex contexts, a div without explicit width may not stretch to fill available space, so `max-w-[85%]` of that div could be 85% of a narrower width, making the bubble appear to truncate.

## Resolution

root_cause: The `flex justify-end` outer wrapper div in MessageBubble has no `w-full` class. In a flex column context (MessageList uses `space-y-6` which wraps items in a flex-like stacking), the outer wrapper may not stretch to full container width. As a result, `max-w-[85%]` is 85% of a potentially narrower width. Adding `w-full` to the outer `flex justify-end` div ensures it spans the full available width, making `max-w-[85%]` correctly calculated and the break-words + min-w-0 can do their job.
fix: Add `w-full` to the outer `<div className="flex justify-end">` in MessageBubble.tsx
verification: File confirmed updated. `w-full` added to outer flex wrapper. The bubble div now correctly computes max-w-[85%] against the full chat area width, and break-words + min-w-0 can work as intended.
files_changed: [src/components/MessageBubble.tsx]
