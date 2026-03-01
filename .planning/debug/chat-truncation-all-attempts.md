---
status: resolved
trigger: "Chat textarea does not expand when typing multi-line text"
created: 2026-02-26
updated: 2026-03-01T21:20:00Z
resolved: 2026-03-01T21:20:00Z
---

# Chat Truncation Debug — All Attempts

## The Problem
The chat input textarea does not dynamically expand when user types text that wraps to multiple lines. Text gets truncated/clipped.

## Attempt History

### Attempt 1 — break-words on MessageBubble (WRONG COMPONENT)
- **File:** `src/components/MessageBubble.tsx`
- **Change:** Added `break-words` class to user message div
- **Result:** FAILED — fixed message DISPLAY, not the INPUT textarea
- **Commit:** part of earlier work

### Attempt 2 — min-w-0 on MessageBubble (WRONG COMPONENT)
- **File:** `src/components/MessageBubble.tsx`
- **Change:** Added `min-w-0` to message bubble div
- **Result:** FAILED — still wrong component
- **Commit:** f5874fe

### Attempt 3 — w-full on MessageBubble (WRONG COMPONENT)
- **File:** `src/components/MessageBubble.tsx`
- **Change:** Added `w-full` to outer flex wrapper
- **Result:** FAILED — still wrong component
- **Commit:** d166158 area

### Attempt 4 — overflow:hidden in useEffect (RIGHT COMPONENT, WRONG FIX)
- **File:** `src/components/MessageInput.tsx`
- **Change:** Added `textarea.style.overflow = "hidden"` before scrollHeight measurement in useEffect
- **Result:** PARTIAL — textarea briefly shows 2 lines then snaps back to 1
- **Diagnosis:** useEffect runs AFTER paint, visible flash

### Attempt 5 — useLayoutEffect + shrink-0 + height='0'
- **File:** `src/components/MessageInput.tsx`
- **Changes:**
  - Switched useEffect to useLayoutEffect (runs before paint)
  - Used `height = '0'` instead of `'auto'` for measurement
  - Added `shrink-0` to form element
- **Result:** FAILED — still snaps back
- **Commit:** c878881

### Attempt 6 — onInput handler + min-h-0 on MessageList
- **Files:** `src/components/MessageInput.tsx`, `src/components/MessageList.tsx`
- **Changes:**
  - Rewrote resize to use `onInput` handler (synchronous, before React re-render)
  - Added `min-h-0` to MessageList (allows flex to shrink it)
- **Result:** FAILED — still snaps back
- **Commit:** 3de413e

### Attempt 7 — Removed border-t divider (COSMETIC ONLY)
- **File:** `src/components/MessageInput.tsx`
- **Change:** Removed `border-t border-gray-200 bg-white`, replaced with transparent bg
- **Result:** Cosmetic improvement only, did not fix truncation
- **Commit:** 42af3f2

### Attempt 8 — useLayoutEffect + isInternalChange guard
- **File:** `src/components/MessageInput.tsx`
- **Changes:**
  - useLayoutEffect([content]) for height after React DOM commit
  - isInternalChange ref to prevent draftMessage sync loop extra renders
- **Result:** FAILED — still snaps back
- **Diagnosis:** Parent re-render from onDraftChange propagation causes second render that doesn't re-trigger useLayoutEffect

### Attempt 9 — CSS Grid Mirror Technique + IdeaCard transition fix
- **Files:** `src/components/MessageInput.tsx`, `src/components/idea-card/IdeaCard.tsx`
- **Changes:**
  - Replaced ALL JS resize with CSS Grid Mirror (hidden div + textarea in same grid cell)
  - Changed IdeaCard `transition-all` to `transitionProperty: 'height'` only
  - Added `shrink-0` to IdeaCard
- **Result:** PARTIAL — textarea shows 2 lines BUT user can't type or paste
- **Diagnosis:** Mirror div (`invisible`) blocks pointer events on textarea
- **Commit:** d166158

### Attempt 10 — pointer-events-none on mirror div
- **File:** `src/components/MessageInput.tsx`
- **Change:** Added `pointer-events-none` to the invisible mirror div
- **Result:** PARTIAL — textarea expanded ONCE then stopped working. Paste only works for half a sentence.
- **Commit:** 8088028
- **Diagnosis:** The CSS Grid Mirror technique is close but unstable. The mirror div sizing or the textarea interaction within the grid cell is inconsistent. Possible issues:
  - The mirror div and textarea may have mismatched font/padding causing size disagreement
  - `invisible` class uses `visibility: hidden` which still takes up space but the element may interact oddly in grid context
  - The textarea `rows={1}` attribute may fight with the grid cell height
  - Paste events may not trigger React's onChange properly, so mirror content doesn't update

### Attempt 11 — Fix CSS Grid Mirror: remove rows={1}, add w-full + text-base to textarea
- **File:** `src/components/MessageInput.tsx`
- **Changes:**
  - Removed `rows={1}` from textarea — the `rows` attribute sets intrinsic UA-stylesheet height that competes with grid cell stretching
  - Added `w-full` to textarea — without this, textarea width defaults to UA-stylesheet cols=20 chars, causing different text wrapping than the mirror div (which fills the full flex-1 width). Different wrapping = different heights = grid mirrors nothing useful
  - Added `text-base` to textarea — font-size must match mirror div exactly for identical line height calculations
- **Root cause:** The grid mirror technique requires mirror and textarea to have IDENTICAL font-size, width, and padding so text wraps at identical positions. Also requires textarea to have no intrinsic height (`rows` attribute) that fights the grid cell stretching it.
- **Result:** Awaiting user verification

### Attempt 12 — Debug instrumentation + explicit grid-template-columns + explicit grid-area properties
- **File:** `src/components/MessageInput.tsx`
- **Changes:**
  - Added `DEBUG = true` flag that enables visible CSS outlines on every element in the chain:
    - Blue outline: `<form>` — confirms shrink-0 is working
    - Green outline: flex row `<div>` — confirms items-end alignment
    - Red outline: grid container `<div>` — confirms grid display and flex-1 growth
    - Dashed orange outline: mirror div — confirms it exists and overlaps textarea
    - Purple outline: textarea — confirms it overlaps mirror
  - Added inline debug text under the input showing content.length, line count, render count
  - Added `console.log` on every render with content length and value
  - Added `useEffect` after every render logging `window.getComputedStyle()` of grid, mirror, and textarea — shows actual display, gridTemplateRows, gridTemplateColumns, width, height, fontSize, padding for both elements
  - Added `console.log` in `onChange` showing new value length and line count
  - Added `gridTemplateColumns: "1fr"` inline style to grid container — this is the critical missing piece. Without this, CSS grid auto-places items in separate columns instead of the same cell. The `grid` Tailwind class only sets `display: grid`, NOT `grid-template-columns`.
  - Changed `gridArea: "1 / 1"` shorthand to explicit `gridRowStart: 1, gridColumnStart: 1, gridRowEnd: 2, gridColumnEnd: 2` properties for both mirror and textarea — eliminates any React style prop parsing ambiguity
  - Added refs to grid container, mirror div, and textarea for getComputedStyle inspection
- **Result:** Awaiting user verification
- **Hypothesis:** The root cause is `gridTemplateColumns` was never set. Without it, the CSS Grid treats the mirror div and textarea as separate auto-sized columns (side by side, not overlapping). The `grid-area: 1/1` placement ONLY stacks elements in the same cell when there's actually one column. Without `grid-template-columns: 1fr`, the auto-placement algorithm gives each child its own column, and they never overlap.

### Attempt 13 — Full layout hierarchy visual debug instrumentation
- **Files:** `src/components/layout/Layout.tsx`, `src/components/Chat.tsx`, `src/components/MessageList.tsx`, `src/components/idea-card/IdeaCard.tsx`, `src/components/MessageInput.tsx`
- **Changes:**
  - **Layout.tsx:** Added `useDebugLog` hook logging offsetH/clientH/scrollH + overflow/flex/height for LAYOUT-OUTER, LAYOUT-INNER, LAYOUT-MAIN on every render. Added colored outlines (cyan, teal, magenta) and corner labels.
  - **Chat.tsx:** Added `CHAT_DEBUG` flag. `useEffect` logging Chat outer container computed styles every render. Added `DebugPanel` floating component (fixed top-right, z=99999, dark background) polling every 500ms showing real-time H/flex/shrink/grow/overflow/minH/maxH for CHAT-OUTER, MSG-LIST-WRAP, MSG-INPUT. Wrapped MessageList in `flex-1 min-h-0 flex flex-col` div (orange outline) for measurement. Added lime outline + "CHAT-OUTER" label to the main chat div.
  - **MessageList.tsx:** Added MSG_LIST_DEBUG flag. Pink outline + sticky label showing scrollH and clientH.
  - **IdeaCard.tsx:** Added IDEA_DEBUG flag. `useEffect` logging offsetH/clientH/height/flex/overflow/splitRatio every render. Yellow outline + label showing current height value.
  - **MessageInput.tsx:** Added `debugWrapRef` prop exposing the `<form>` element to Chat's DebugPanel. Added `useEffect` logging form's offsetH/flex/flexShrink/flexGrow/height/overflow every render. Blue outline + "MSG-INPUT" label on form.
- **Color legend:**
  - cyan = LAYOUT-OUTER (h-screen flex)
  - teal = LAYOUT-INNER (flex-1 flex-col overflow-hidden)
  - magenta = LAYOUT-MAIN (flex-1 overflow-hidden)
  - lime = CHAT-OUTER (flex-col h-full)
  - yellow = IDEA-CARD (shrink-0 height:X%)
  - orange = MSG-LIST-WRAP (flex-1 min-h-0 flex-col wrapper)
  - pink = MSG-LIST (flex-1 min-h-0 overflow-y-auto)
  - blue = MSG-INPUT form (shrink-0)
  - red = GRID container
  - dashed orange = mirror div
  - purple = textarea
- **Goal:** User deploys to Vercel, sees the colored boxes + floating panel, and can identify which container is constraining the input from growing.
- **Result:** Awaiting user verification

## Current State (2026-03-01 — Attempt 15)
- **Attempt 14 confirmed FAILED.** Content still vanishes even with split localStorage keys.
- **Render count dropped to #56** from previous screenshots of #134 and #152. This means the component REMOUNTED between sessions — the render counter reset to 1 after an unmount/remount.
- **New root cause diagnosis:** Two independent bugs, both contributing:

### Bug A: Chat unmounts when `session` query returns `undefined`
In `App.tsx`, the conditional `session ? <Chat /> : <div>No session selected</div>` unmounts `Chat` whenever `session` is falsy. `useQuery` returns `undefined` during loading (Convex WebSocket reconnection, page load, etc.). When Convex briefly disconnects and reconnects, `session` goes to `undefined`, `Chat` unmounts, then remounts. The render counter resets (explains render#56 vs render#134/152).

### Bug B: After remount, content initializes to "" because draft localStorage is empty
After Chat remounts, `MessageInput` `useState(draftMessage || "")` initializes from `draftMessage`. If the user had JUST sent a message (which calls `clearDraftMessage` → sets `{sid: ""}` in localStorage), and THEN Convex triggered a brief disconnect/remount, the newly mounted `MessageInput` reads `""` from localStorage. Even without a deliberate submit, the `gapfinder-draft-messages` localStorage key may not have the latest typed text if the stale-closure write was slow.

### Eliminated from Bug A: isInternalChange guard
- The `isInternalChange.current` guard in the `useEffect([draftMessage])` is NOT the primary cause. The guard works correctly when the component stays mounted. The problem is that it's irrelevant after a remount because `useState` reinitializes.

### Attempt 14 — Fix stale closure race condition in useSessionState (DID NOT FIX)

**What was tried:** Split single `gapfinder-session-states` key into two separate keys. This DID fix the stale-closure cross-key overwrite between saveDraftMessage and saveScrollPosition. But the bug persists, proving there is ANOTHER cause.

**Files changed:**
- `src/hooks/useSessionState.ts` — two separate `useLocalStorage` calls

### Attempt 15 — Prevent Chat unmount on transient session undefined + remove fragile draftMessage sync

**Root cause:** `Chat` unmounts when Convex's `useQuery` transiently returns `undefined` (network hiccup, WebSocket reconnect). On remount, `MessageInput` re-initializes from `draftMessage` which may be `""`.

**Fix:**

1. **App.tsx**: Use a "stable session" pattern — remember the last valid session and keep `Chat` mounted even when `session` query briefly returns `undefined`. Only unmount `Chat` when `currentSessionId` explicitly changes.

2. **MessageInput.tsx**: Remove the fragile `useEffect([draftMessage])` + `isInternalChange` pattern entirely. Instead, add `sessionId` as a prop and reset content ONLY when `sessionId` changes (actual session switch). This eliminates the entire class of "draftMessage change unexpectedly clears content" bugs.

3. **Chat.tsx**: Add `key={sessionId.toString()}` to `MessageInput` — ensures clean remount ONLY on session switch, and pass `sessionId` as a prop.

4. **Layout.tsx**: Set `LAYOUT_DEBUG = false` (still true, causing colored outlines — left from attempt 13).

**Files changed:**
- `src/App.tsx` — stable session pattern
- `src/components/MessageInput.tsx` — remove draftMessage sync effect, add sessionId prop
- `src/components/Chat.tsx` — pass sessionId to MessageInput, add key
- `src/components/layout/Layout.tsx` — set LAYOUT_DEBUG = false

## Root Causes Identified
1. **Chat unmounts on Convex transient undefined (PRIMARY, FIXED attempt 15):** `session` from `useQuery` briefly returns `undefined` during WebSocket reconnect. `App.tsx` conditional unmounts `Chat`. Remount resets render count and reinitializes content from localStorage.
2. **Fragile draftMessage sync effect (SECONDARY, FIXED attempt 15):** `useEffect([draftMessage])` with `isInternalChange` ref was a timing-sensitive guard that could fire at wrong times. Replaced with `sessionId`-based reset.
3. **Stale closure race in useLocalStorage (FIXED attempt 14):** react-use's `set` captures stale `state`. With split keys, scroll saves no longer overwrite drafts.
4. **CSS Grid Mirror mismatched sizing:** Mirror div had `text-base` + `w-full` (via flex-1), textarea had neither. Different widths → different text wrapping → mirror grows to wrong height. Also `rows={1}` on textarea set UA-stylesheet height competing with grid cell stretching.
5. **IdeaCard transition-all (FIXED attempt 9):** Changed to `transitionProperty: 'height'` only.
6. **Container constraints:** overflow-hidden on Layout main, h-full on Chat, percentage height on IdeaCard — rigid flex layout.

## What Has Been Fixed (keep these)
- IdeaCard: `transition-all` → `transitionProperty: 'height'` + `shrink-0` (commit d166158)
- MessageList: added `min-h-0` to allow flex shrinking (commit 3fdc6ef)
- MessageInput form: `shrink-0` to prevent flex compression
- MessageInput form: removed border-t divider for cleaner look
- Mirror div: `pointer-events-none` so textarea receives pointer events (commit 8088028)
- useSessionState: split into two localStorage keys (attempt 14)

## Key Files
- `src/components/MessageInput.tsx` — the textarea (CSS grid mirror approach)
- `src/components/Chat.tsx` — flex column layout parent
- `src/components/MessageList.tsx` — flex-1 sibling (has min-h-0)
- `src/components/idea-card/IdeaCard.tsx` — percentage height sibling (transition fixed)
- `src/components/layout/Layout.tsx` — overflow-hidden grandparent

### Attempt 16 — Replace CSS Grid Mirror with useLayoutEffect JS resize

**Root cause analysis:**
After exhaustive static analysis of attempts 14-15, the conclusion is:
1. The content-clearing bug was caused by the old `useEffect([draftMessage])` sync (fixed in attempt 15).
2. The REMAINING symptom is that the textarea doesn't grow — the CSS grid mirror technique has been unreliable across 8 attempts with subtle sizing mismatches between mirror div and textarea.
3. `IDEA_DEBUG = true` was left enabled in IdeaCard.tsx, causing yellow outlines and console spam in production.

**Why CSS grid mirror kept failing:**
- The technique requires pixel-perfect match between mirror div and textarea: same font-size, line-height, padding, width, word-wrap behavior
- React controls the textarea value (controlled component), which means the textarea must receive `height: auto` at just the right time to allow scrollHeight measurement
- The complexity created too many failure modes (pointer-events, invisible vs hidden, grid placement, overflow clipping on the mirror div)

**Why useLayoutEffect JS resize will work now:**
- Attempt 15 removed the `useEffect([draftMessage])` sync that caused parent re-renders to reset textarea height
- `useLayoutEffect([content])` fires ONLY when `content` state changes (user types or submit clears), not on parent re-renders
- Runs synchronously before paint — no visible flash
- Pattern: reset to `height: auto` → measure `scrollHeight` → set explicit height. Shrinks AND grows correctly.

**Files changed:**
- `src/components/MessageInput.tsx` — replaced entire CSS grid mirror approach with `useLayoutEffect` + direct DOM height
  - Removed mirror div, gridContainerRef, mirrorRef, gridContainerRef
  - Added `useLayoutEffect([content])` that sets `textarea.style.height`
  - Added `rows={1}` for initial single-line appearance
  - Moved border/shadow CSS directly onto textarea (was on grid container)
  - Removed all DEBUG code (was already disabled)
- `src/components/idea-card/IdeaCard.tsx` — `IDEA_DEBUG = false` (was accidentally left true)

**Result:** CONFIRMED FIXED by user on 2026-03-01

## Final Resolution

**Status:** RESOLVED after 16 attempts across 4 sessions.

**The actual root causes (3 independent bugs):**

1. **Chat component unmounting on Convex transient `undefined` (attempt 15):** `useQuery` briefly returns `undefined` during WebSocket reconnects. The conditional render in App.tsx unmounted the entire Chat tree. On remount, MessageInput re-initialized from `draftMessage` which was `""`. Fixed with a `stableSessionRef` pattern that keeps Chat mounted through transient query gaps.

2. **Fragile `useEffect([draftMessage])` sync creating feedback loops (attempt 15):** The `isInternalChange` ref guard was timing-sensitive. When `saveDraftMessage` updated parent state, the new `draftMessage` prop triggered the sync effect. If `isInternalChange` had already been consumed by a prior render, it would call `setContent(draftMessage)` with a stale/empty value. Fixed by removing the effect entirely and resetting content only on `sessionId` change.

3. **CSS Grid Mirror technique unreliable for textarea auto-resize (attempt 16):** After fixing the state-clearing bugs, the textarea still didn't grow. The CSS grid mirror required pixel-perfect matching between a hidden div and the textarea (font-size, line-height, padding, width, word-wrap). Any mismatch caused sizing failures. Replaced with simple `useLayoutEffect([content])` that imperatively sets `textarea.style.height`.

**Secondary fixes that were also necessary:**
- `useSessionState`: Split shared localStorage key into separate keys for scroll and draft (attempt 14) — prevents react-use stale closure from letting scroll saves overwrite draft saves
- `IdeaCard`: Changed `transition-all` to `transitionProperty: 'height'` (attempt 9)
- `MessageList`: Added `min-h-0` for flex shrinking
- `MessageInput form`: Added `shrink-0` to prevent flex compression

## Key Learnings

1. **Debug the RIGHT symptom first.** Attempts 1-3 fixed MessageBubble (display), not MessageInput (input). Attempts 4-13 focused on CSS height, but the real bug was React state being cleared (`content.length` going to 0). Always instrument to distinguish "content gone" vs "content hidden."

2. **`useLocalStorage` from react-use has stale closure issues.** The `set` function captures `state` at memoization time, not call time. Two callbacks sharing the same key can overwrite each other. Solution: separate keys, or use a different state management approach.

3. **CSS Grid Mirror is fragile in production.** Requires exact match of font-size, line-height, padding, width, word-wrap, and no `rows` attribute. A simpler `useLayoutEffect` with `scrollHeight` measurement is more robust.

4. **`useEffect([draftMessage])` for external sync is dangerous with controlled inputs.** The effect creates a circular dependency: typing → onDraftChange → parent state → new draftMessage prop → effect fires → setContent. Guard refs are timing-sensitive and fail across remounts. Better pattern: use `key` prop to reset on session switch, ignore external prop changes during typing entirely.

5. **Convex `useQuery` returns `undefined` during reconnects.** Conditional rendering based on query results can unmount component trees unexpectedly. Use a stable ref pattern to bridge transient gaps.

6. **Debug instrumentation can CAUSE the bug.** DebugPanel with `setInterval` + `setState` inside a parent component causes re-renders every 500ms that propagate to children. Always consider whether your debugging tools are altering behavior.

7. **Low render count = component remounted.** If render count drops between observations, the component was unmounted and remounted. This resets all refs and re-runs `useState` initializers — a completely different failure mode than state being cleared within a mounted component.
