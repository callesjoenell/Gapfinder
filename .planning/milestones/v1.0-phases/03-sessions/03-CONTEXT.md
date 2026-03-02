# Phase 3: Sessions - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Participants can explore multiple ideas in parallel through named sessions. Two distinct session types exist: Area Exploration (phases 0-2) and Idea Evaluation (phases 3-9). Each type has its own limit of 5 sessions. Sessions support creation, switching, renaming, and archiving.

</domain>

<decisions>
## Implementation Decisions

### Two Session Types

- **Area Exploration** - covers phases 0-2, max 5 sessions
- **Idea Evaluation** - covers phases 3-9, max 5 sessions
- Two separate buttons in sidebar: "Area Exploration" and "Idea Evaluation"
- If user tries to create 6th exploration: nudge message about committing to an idea
- Sessions do NOT convert between types - permanently separate

### Session Creation Flow

- Button at top of each sidebar section (not bottom, not FAB)
- Modal prompts for **name (required)** and **description (optional)**
- Cancel button and click-outside dismisses modal (no confirmation needed)
- For Evaluation sessions: optional reference to an Exploration session
  - If referenced: Claude has access to both summary AND full history
  - Summary in system prompt, full history on-demand for specifics

### Exploration Completion Handoff

- After phase 2 completes: present research/insights summary
- Encourage user to generate ideas based on gaps found
- Offer optional deadline for returning with an idea
- If deadline set: email reminder sent when deadline arrives

### First-Time User Onboarding

- When no sessions exist: main area shows onboarding view
- **Area Exploration** section at top with big button, 3-4 sentence explanation, time estimates per phase
- **Idea Evaluation** section below with same structure
- Returns whenever no sessions exist (not just first login)

### Sidebar Structure

- Two collapsible sections: "Area Exploration" and "Idea Evaluation"
- Default expand: section containing most recently used session
- Within sections: ordered by most recent activity first
- Active session: background highlight
- Metadata shown: current phase indicator (no timestamp)
- Sidebar always visible (not collapsible)
- **Archived section**: appears at bottom (above account) only after first archive, collapsed by default

### Session Switching

- Scroll position preserved per session, restored when returning
- Draft messages preserved per session (no warning, just keeps typed text)
- Loading: 10-20 clever contextual messages that rotate
  - Different message pools for Exploration vs Evaluation (themed)
- Can switch while Claude is streaming (no restriction, stream continues in background)

### Context Menu (Right-Click)

- **Rename** - opens inline edit
- **Delete** - requires confirmation dialog
- **Archive** - moves to archived section (no confirmation)

### Description Storage

- Description stored but only visible in session settings (not in sidebar)

### Claude's Discretion

- Exact loading message copy and rotation logic
- Modal styling and animation
- Inline edit behavior for rename
- Phase indicator visual treatment

</decisions>

<specifics>
## Specific Ideas

- Loading messages should feel clever and contextual, matching the exploration/evaluation tone
- Nudge message for 6th exploration should encourage commitment without shaming
- Exploration handoff should feel like a natural pause, not a dead end

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-sessions*
*Context gathered: 2026-01-31*
