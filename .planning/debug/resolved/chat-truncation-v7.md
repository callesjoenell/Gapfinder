---
status: resolved
trigger: "chat textarea does not expand on multi-line text, snaps back to 1 line after 7 failed JS attempts"
created: 2026-03-01T00:00:00Z
updated: 2026-03-01T00:00:00Z
---

## Current Focus

hypothesis: Multiple interacting causes: (1) React re-renders from parent (draftMessage state) re-apply style={{overflow:"hidden"}} without re-triggering useLayoutEffect, (2) IdeaCard has transition-all duration-300 which animates flex recalculations causing measurement instability, (3) rows={1} constrains intrinsic size. The JS approach is fundamentally fragile in this layout. CSS-only solution needed.
test: Replace JS-based resize with CSS grid mirror technique (zero JS for sizing)
expecting: Textarea auto-sizes purely via CSS, immune to React re-renders and flex recalculations
next_action: Implement CSS grid mirror technique in MessageInput

## Symptoms

expected: Chat textarea grows taller as user types text that wraps to multiple lines. Message list above shrinks to accommodate.
actual: Textarea briefly expands to 2 lines then SNAPS BACK to 1 line. Text gets truncated.
errors: None
reproduction: Type a message longer than one line in chat input
started: 7 fix attempts, all failed. JS-based resize approaches do not work.

## Eliminated

- hypothesis: JS timing issue (useEffect vs useLayoutEffect vs onInput)
  evidence: 7 separate attempts with different JS timing approaches all failed
  timestamp: pre-session

## Evidence

- timestamp: 2026-03-01T00:01:00Z
  checked: Full layout hierarchy from Layout.tsx -> Chat.tsx -> MessageInput.tsx
  found: |
    Layout: flex h-screen > flex-1 flex-col overflow-hidden > main flex-1 overflow-hidden
    Chat: flex flex-col h-full bg-gray-50 relative
    IdeaCard: height set via inline style `(splitRatio * 100)%` with `transition-all duration-300`
    ResizeDivider: h-2 shrink-0
    PhaseProgressBar: auto height
    MessageList: flex-1 min-h-0 overflow-y-auto
    SuggestionChips: conditional
    MessageInput form: shrink-0
      textarea: flex-1 resize-none, rows=1, style={{overflow:"hidden"}}
  implication: The IdeaCard uses PERCENTAGE height inside a flex container. When textarea tries to grow, it changes the flex container's content size, which triggers recalculation of the percentage height, which with transition-all causes an animation loop that snaps back.

- timestamp: 2026-03-01T00:02:00Z
  checked: IdeaCard component
  found: |
    className="transition-all duration-300"
    style={{ height: isCollapsed ? '4rem' : `${(splitRatio ?? 0.5) * 100}%` }}
  implication: transition-all on IdeaCard means ANY layout change triggers a 300ms animated transition. When textarea grows, the container recalculates, IdeaCard animates to its new percentage height, and this animation causes the flex layout to continuously recalculate during the 300ms, snapping the textarea back.

- timestamp: 2026-03-01T00:03:00Z
  checked: MessageInput.tsx resizeTextarea function
  found: |
    Uses useLayoutEffect to set height on content change.
    Sets textarea.style.height = "auto" then reads scrollHeight then sets pixel height.
    Also has style={{ overflow: "hidden" }} as React prop on textarea.
    The React prop re-applies overflow:hidden on every render, but useLayoutEffect should override.
  implication: The JS resize logic itself is sound. The problem must be in the container.

## Resolution

root_cause: |
  Two interacting issues made JS-based textarea auto-resize impossible:
  1. Parent re-renders (from draftMessage state propagation through useSessionState -> App -> Chat -> MessageInput) re-applied `style={{ overflow: "hidden" }}` and `rows={1}` on the textarea DOM without re-triggering the `useLayoutEffect` (because `content` value hadn't changed between render cycles). This caused the textarea to snap back to 1-row height.
  2. IdeaCard's `transition-all duration-300` animated ALL CSS property changes including flex-driven height recalculations, causing layout instability during the 300ms transition window that interfered with scrollHeight measurements.

fix: |
  1. Replaced JS-based resize (useLayoutEffect + scrollHeight measurement) with CSS Grid Mirror Technique:
     - Grid container with a hidden mirror div and textarea overlapping in the same grid cell (grid-area: 1/1)
     - Mirror div contains identical text with trailing newline, auto-sizes based on content
     - Textarea follows the mirror's size via CSS grid, zero JavaScript needed
     - Both elements capped at maxHeight: 200px, textarea gets overflow-y: auto for scrolling
  2. Scoped IdeaCard's transition from `transition-all` to `transitionProperty: 'height'` only
  3. Added `shrink-0` to IdeaCard to prevent flex from shrinking it when textarea grows

verification: TypeScript compiles with zero errors. Visual verification needed by user.
files_changed:
  - src/components/MessageInput.tsx
  - src/components/idea-card/IdeaCard.tsx
