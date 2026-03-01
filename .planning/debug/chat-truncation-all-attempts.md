---
status: in_progress
trigger: "Chat textarea does not expand when typing multi-line text"
created: 2026-02-26
updated: 2026-03-01
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

## Current State (2026-03-01)
- **Approach:** CSS Grid Mirror technique (attempt 9-10)
- **Status:** Unstable — works sometimes, fails on paste, inconsistent expansion
- **Latest commit:** 8088028
- **Deployed:** https://start-building-now.vercel.app

## Root Causes Identified
1. **Parent re-render race (primary):** onChange → setContent + onDraftChange → parent re-renders → second React render re-applies rows=1 but doesn't re-trigger effects
2. **IdeaCard transition-all (secondary, FIXED):** Changed to `transitionProperty: 'height'` only in attempt 9
3. **Container constraints:** overflow-hidden on Layout main, h-full on Chat, percentage height on IdeaCard — rigid flex layout

## What Has Been Fixed (keep these)
- IdeaCard: `transition-all` → `transitionProperty: 'height'` + `shrink-0` (commit d166158)
- MessageList: added `min-h-0` to allow flex shrinking (commit 3fdc6ef)
- MessageInput form: `shrink-0` to prevent flex compression
- MessageInput form: removed border-t divider for cleaner look
- isInternalChange ref guard to prevent draftMessage sync loop

## What Still Needs Fixing
- The textarea auto-resize: CSS Grid Mirror is close but unstable
- Paste support: paste events may not trigger state update → mirror doesn't sync
- Consider alternatives:
  - `contentEditable` div instead of textarea (native auto-sizing)
  - `field-sizing: content` CSS (Chrome 123+, Firefox 131+, no Safari)
  - Fix the grid mirror: ensure font/padding match exactly, remove `rows={1}`, add onPaste handler

## Key Files
- `src/components/MessageInput.tsx` — the textarea (CSS grid mirror approach)
- `src/components/Chat.tsx` — flex column layout parent
- `src/components/MessageList.tsx` — flex-1 sibling (has min-h-0)
- `src/components/idea-card/IdeaCard.tsx` — percentage height sibling (transition fixed)
- `src/components/layout/Layout.tsx` — overflow-hidden grandparent

## To Resume
Run `/gsd:debug the chat truncation` — read this file first for full context of all 10 attempts.
