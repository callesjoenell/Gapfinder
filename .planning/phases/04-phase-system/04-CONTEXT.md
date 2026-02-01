# Phase 4: Phase System - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Visualize the 12-phase Gap Finder methodology as an interactive progress bar. Users can see their current position, track progress within phases, and review completed phases. Sequential unlocking enforces methodology order.

</domain>

<decisions>
## Implementation Decisions

### Progress Bar Design
- Position: Top of chat area, always visible during conversation
- Layout: Single segmented bar divided into 12 labeled segments
- States: Color-coded segments (completed = green, current = blue/highlighted, locked = gray)
- Labels: Current phase name shown clearly, neighbors abbreviated or hidden, others revealed on hover

### Phase Unlocking UX
- Locked click: Show tooltip explaining what needs to be completed to unlock
- Unlock moment: Animated segment transition + toast notification ("Phase X unlocked")
- Sequential only for v1, no skip option (revisit after seeing usage patterns)
- Detection: Claude detects completion semantically, then user confirms before advancing

### In-Phase Progress
- Partial fill indicator within current segment (percentage-style visual)
- Fill calculated by Claude's semantic estimate of phase progress
- Updates periodically (every 3-5 message exchanges, not every response)
- Progress only moves forward, never regresses even if Claude reassesses

### Phase Review Mode
- Clicking completed phase: Scroll to that phase's messages in conversation
- Phase boundaries: Visual divider with phase label between phases ("── Phase 3: Your Market ──")
- Revisiting allowed: User can ask Claude to discuss a completed phase topic
- Progress impact: Phase stays complete, revisiting is just discussion without resetting

### Claude's Discretion
- Exact colors and visual styling within the color-coded scheme
- Toast notification duration and styling
- Hover behavior implementation details
- Phase divider visual treatment

</decisions>

<specifics>
## Specific Ideas

- Segmented bar should feel like a journey visualization, not a checklist
- The "current + neighbors" label approach keeps focus on the present moment
- User confirmation before phase advancement prevents accidental skipping
- Dividers in message history make the conversation feel structured and progressive

</specifics>

<deferred>
## Deferred Ideas

- Skip/fast-track option for returning users — revisit after v1 usage patterns
- Phase-specific summaries or exports — could be Phase 5+ feature

</deferred>

---

*Phase: 04-phase-system*
*Context gathered: 2026-02-01*
