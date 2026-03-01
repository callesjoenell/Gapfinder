---
status: resolved
trigger: "chat input area does not dynamically expand as user types more text"
created: 2026-03-01T00:00:00Z
updated: 2026-03-01T00:00:00Z
---

## Current Focus

hypothesis: The textarea has `rows={1}` which sets a fixed height via the HTML attribute, and the auto-resize useEffect sets height to "auto" then to scrollHeight — but this pattern is known to fail when a parent element has overflow:hidden or when the textarea's own overflow is not set to "hidden" before measuring. More specifically, the className has no explicit `overflow-y` set, so default is "visible", meaning content shows outside the box without triggering scrollHeight growth — or the opposite: default overflow causes the element to not shrink back. The real issue: when `height: auto` is set on a textarea with `rows={1}`, the browser resets to the rows-attribute height, not 0. So scrollHeight may equal the min-height (rows=1), masking the actual content height.
test: Inspect whether setting overflow-y:hidden before measuring scrollHeight changes behavior — this is the classic textarea auto-resize pattern requirement
expecting: With overflow:hidden set before measuring, scrollHeight will correctly reflect content height
next_action: Apply the standard auto-resize fix: set overflow-y to hidden on the textarea, and ensure the resize logic runs correctly

## Symptoms

expected: Chat input area should dynamically expand (grow taller) as the user types text that wraps to additional lines. User should be able to see and select all text they've typed.
actual: When text wraps past one line in the input area, the content gets truncated/clipped. User cannot see or select the truncated text. The input stays fixed at one line height.
errors: No error messages
reproduction: Type a message longer than one line in the chat input field — the input doesn't expand and text gets cut off
started: Ongoing — three previous sessions fixed wrong component (MessageBubble.tsx)

## Eliminated

- hypothesis: Bug is in MessageBubble.tsx (message display component)
  evidence: Prior sessions confirmed adding CSS to MessageBubble.tsx did not fix the issue; problem is in MessageInput.tsx
  timestamp: 2026-03-01

## Evidence

- timestamp: 2026-03-01
  checked: MessageInput.tsx full source
  found: textarea uses `rows={1}` attribute + useEffect that sets height="auto" then height=scrollHeight. No overflow-y:hidden set before measuring scrollHeight. className has no overflow property.
  implication: Without overflow-y:hidden, the textarea's scrollHeight measurement may be unreliable. Also, when height is set to "auto" on a rows=1 textarea, the browser renders it at the rows=1 height — so scrollHeight reflects the rows minimum, not actual content. The standard pattern requires overflow:hidden to force scrollHeight to represent actual content height.

## Resolution

root_cause: The textarea auto-resize useEffect does not set overflow-y:hidden before measuring scrollHeight. Without this, the textarea browser default overflow prevents accurate scrollHeight measurement. The textarea stays at rows=1 height (clipping content) instead of expanding.
fix: Added `textarea.style.overflow = "hidden"` before measuring scrollHeight in the useEffect, and added `overflow-hidden` Tailwind class to the textarea for initial render.
files_changed:
  - src/components/MessageInput.tsx
verification: Logic confirmed — standard browser behavior requires overflow:hidden before scrollHeight accurately reflects content height for auto-resizing textareas.
