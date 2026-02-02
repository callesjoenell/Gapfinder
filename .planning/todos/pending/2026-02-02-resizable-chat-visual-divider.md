---
created: 2026-02-02T22:05
title: Resizable divider between chat and visual area
area: ui
files:
  - src/components/Chat.tsx
  - src/components/IdeaCard.tsx
---

## Problem

Currently the chat area and the idea card/visual area have fixed proportions (25vh for idea card, rest for chat). Users should be able to drag a divider between these two sections to resize them according to their preference. Both areas should adapt smoothly when resized.

This improves user control over the layout - some may want more chat space, others may want to see the visual area larger.

## Solution

- Add a draggable divider component between chat and idea card
- Track divider position in state (percentage or pixels)
- Persist position to localStorage so it survives refresh
- Both sections use flex/grid to adapt to the divider position
- Consider min/max constraints (e.g., min 15% for either section)
- Smooth resize with cursor feedback (resize cursor on hover)
