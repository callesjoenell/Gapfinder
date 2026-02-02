# Phase 5: Idea Card - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Visual representation showing the user's idea crystallizing from scattered area blobs into a coherent card. Evolves through phases 0-3 based on conversation content. The emotional purpose is "I can SEE my idea forming" — abstract becomes tangible, blobs merging visualizes THEIR journey from confusion to clarity.

</domain>

<decisions>
## Implementation Decisions

### Blob behavior
- **6 blobs representing 6 exploration areas** — each area is a blob
- **Initial state (phase 0 start):** Blobs very faint, edges almost completely smeared out (~1% edge clarity = pure gradient)
- **Phase 0 end state:** 6 irregular-shaped blobs with ~50% gradient edges, can intersect, random scatter positioning
- **Colors:** All between yellow and orange, faint
- **Overlap behavior:** Blobs blend colors where they intersect (overlapping regions mix hues)
- **Ambient motion:** Subtle glacial drift — blobs stay in their placed area, don't move across each other
- **Words appear in phases 1-2:** Barely noticeable at first, slightly whiter than blob color
- **Word content:** Keywords or 2-3 word summaries from conversation in each area
- **Word density:** 6-14 words per blob based on conversation depth (minimum 6, maximum 14)
- **Word sizing:** Mixed font sizes like fuzzy word cloud, can overlap
- **Word entrance:** Fade in slowly
- **Word prominence:** Words ranked by conversation relevance — less discussed words slowly fade to make room for more prominent ones
- **Phase 3 merge:** Triggered when Claude extracts a coherent idea sentence (not on phase entry)
- **Merge animation:** Blobs meld together, words fade out, replaced by idea sentence

### Card content
- **Main content:** Idea sentence (crystallized statement of the idea)
- **Supporting content:** 3-4 sentences from phases 0-2 most connected to the idea
- **Visual hierarchy:**
  - Idea sentence: bold, larger font, top position, high contrast (dark grey)
  - Supporting sentences: smaller, lighter grey, less prominent
- **Source attribution:** Supporting sentences color-coded with their area's blob color
- **Content updates:** Crossfade transition (old fades out, new fades in)

### Color transitions
- **Color scheme:** Orange to green (not yellow to green)
- **Color intensity:** Dark but distinctive colors
- **Threshold for green:** Average score ≥ 4 (of 5 per area)
- **Transition type:** Binary — orange until threshold, then green
- **Transition animation:** Smooth gradient shift over 2-3 seconds
- **Background:** Settled blob gradient artwork (light colors from merged blobs), not solid color
- **Text on background:** Dark fonts on light gradient background
- **Color meaning:** Claude explains in conversation what colors signify

### Card placement
- **Desktop:** Top 25% of screen, collapsible
- **Mobile:** Top 40% of screen, can expand to fullscreen
- **Collapsed state:** Thin strip showing current phase indicator, click to expand
- **Content overflow:** Content always fits — font sizes adjust to available space
- **Navigation buttons:** Forward/back arrows in bottom corners (left arrow bottom-left, right arrow bottom-right)
- **Testing mode:** Include mock text to step through phases 0-9 without full experience

### Claude's Discretion
- Exact blob shapes and random positioning algorithm
- Specific gradient/blur implementations for blob edges
- Word extraction algorithm from conversation
- Timing of subtle drift animation
- Exact font sizes and spacing within card
- Accessibility considerations for color choices

</decisions>

<specifics>
## Specific Ideas

- "It should feel like an art experience, not as simple word cloud with some circles"
- Blobs are irregular shapes, not circles — organic feel
- Words emerge from within the blobs like they're surfacing from the conversation
- The settled blob gradient becomes the card background — visual continuity from exploration to crystallization
- Forward/back navigation allows testing visual states with mock data

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-idea-card*
*Context gathered: 2026-02-02*
