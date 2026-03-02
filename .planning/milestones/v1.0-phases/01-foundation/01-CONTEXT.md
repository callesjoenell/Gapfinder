# Phase 1: Foundation - Context

**Gathered:** 2025-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Authentication via magic links, data persistence in Convex, and basic UI scaffold. Users can sign up, receive magic links, authenticate, and have their data persist across sessions. This is the infrastructure layer that all other features build upon.

**Scope clarification from discussion:**
- v1 is standalone users only (no cohorts — that's v2)
- Two product paths: Exploration (phases 0-3, free) and Evaluation (phases 4-9, $10)
- Multiple sessions per user supported from the start

</domain>

<decisions>
## Implementation Decisions

### Magic Link Flow
- Landing page explains the service, email input to sign up
- First-time users: intro screen explaining What-To-Build guidance
- Intro explains: Exploration (phases 0-3) is free, Evaluation/Sharpener (phases 4-9) costs $10
- Returning users: intro screen with options to continue existing sessions (either path) or start new
- Expired link: auto-send new link to stored email (no re-entry needed)

### Auth Session Behavior
- Multiple devices allowed (unlimited concurrent sessions)
- Session expires after 30 days of inactivity
- No cohort system in v1 — standalone users only

### Data Schema
- Each session tracks its own phase progress independently
- Users can have multiple exploration sessions (0-3) and multiple evaluation sessions (4-9)
- Messages stored (Claude decides: one row per message vs array — follow Convex best practices)
- Session state includes summaries (GSD-style pattern for context management)
- Summarization triggers: phase completion AND approaching context limit (combination)
- Research data needs summarization too — lots of data gathered in early phases
- User-defined session names
- Soft delete for sessions (hidden but recoverable)

### Paywall
- Paywall at Phase 4 entry
- Inline paywall in chat flow (Claude explains paid tier, payment form appears inline)
- Users can have paid and free sessions simultaneously

### UI Scaffold
- Sidebar + main layout
- Sidebar always visible (desktop-first, mobile responsive is v2)
- Sidebar contains: session list with mini progress bar under each started session
- Account/settings at sidebar bottom
- Header above chat shows: session name + current phase name
- New session creation: asks "Exploration (free) or Evaluation ($10)?" first
- Clean and minimal aesthetic
- Primary color: green from https://say-it-with-a-song.vercel.app/ start button
- Progress bar in sidebar only (not duplicated in main area)

### Claude's Discretion
- Message storage format (one row per vs array — Convex best practices)
- Exact summarization implementation details
- Loading states and error handling
- Spacing and typography details
- How context limit is detected and handled

</decisions>

<specifics>
## Specific Ideas

- "Use the green color from the start button on https://say-it-with-a-song.vercel.app/ as the primary color"
- "Borrow the GSD state and summary framework to keep progress between context windows"
- Sessions can get long and need context management — especially research phase gathers lots of data
- Chat should feel like Claude.ai (natural conversation, not questionnaire)

</specifics>

<deferred>
## Deferred Ideas

- Cohort system — v2 (users belong to instructor cohorts)
- Instructor view — separate phase in roadmap
- Mobile responsive design — v2
- Idea Card visual — separate phase in roadmap

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2025-01-28*
