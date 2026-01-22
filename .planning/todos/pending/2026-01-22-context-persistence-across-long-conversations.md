---
created: 2026-01-22T09:36
title: Context persistence across long conversations
area: architecture
files:
  - .planning/STATE.md
  - SKILL.md (Gap Finder skill)
---

## Problem

Long AI conversations lose context over time. The Gap Finder methodology spans 12 phases with potentially weeks of conversation per participant. Need a system that:

1. **Tracks methodology progress** - Auto-detect which of the 12 Gap Finder phases the participant is currently in (similar to how GSD tracks phase/plan progress)
2. **Summarizes context** - Maintain running summaries of key decisions, insights, and progress (like GSD's STATE.md pattern)
3. **Preserves continuity** - When conversation exceeds context window or session resets, restore enough context to continue seamlessly

The GSD framework already solves this with:
- STATE.md for session continuity and accumulated context
- Checkpoint files for mid-work resumption
- Structured summaries after each phase

Apply similar patterns to Gap Finder conversations.

## Solution

TBD - Consider:

1. **Phase detection via Claude** - Have Claude output structured JSON with current phase after each response (semantic detection, not keyword matching - per PITFALLS.md)

2. **Conversation summaries** - Store structured summaries in Convex:
   - Per-phase summaries (what was discovered/decided)
   - Running "what we know" context document
   - Key quotes/insights extracted

3. **Context restoration** - On session resume:
   - Load current phase + summary
   - Include recent N messages verbatim
   - Older phases as summaries only

4. **Sliding window approach** - Per PITFALLS.md research:
   - Position critical info in first 20% of context
   - Compress at 60% capacity threshold
   - Keep skill system prompt stable for caching

Research needed: How to trigger summarization without user action, how to extract key moments from conversation.
