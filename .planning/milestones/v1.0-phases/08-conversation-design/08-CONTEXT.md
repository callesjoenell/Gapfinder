# Phase 8: Conversation Design - Context

**Gathered:** 2026-02-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform how Claude converses throughout the Gap Finder methodology: clear journey framing per path (exploration vs evaluation), proactive research triggers based on conversation cues, implicit phase progression through natural dialogue instead of explicit checklist questioning, and research-backed conversation pacing. Does NOT add new features or tools — reshapes how existing capabilities are orchestrated through conversation.

</domain>

<decisions>
## Implementation Decisions

### Journey Framing
- Full roadmap shown upfront when user starts a new session — all phases with brief descriptions so they know the path ahead
- Include time estimates per phase so users can plan their session
- Same voice across exploration and evaluation paths — just different content and framing
- Warm welcome for first session (intro to Gap Finder + roadmap), returning sessions get quick recap + pick up where they left off
- Claude names phases naturally in conversation: "We're in the Research phase now"
- Claude acknowledges when user is juggling multiple sessions: "You're also exploring X in another session"
- Framing adapts based on cross-session experience: "Since you've been through Research before, this will feel familiar"

### Research Triggers
- Claude asks before researching, never auto-triggers: "Want me to check Reddit/HN for that?"
- Results presented as inline summary woven into conversation naturally
- Claude proactively suggests research angles the user hasn't thought of
- When referencing stored research in later phases: quote key points inline AND point to full findings panel for detail
- Four trigger categories: market claims, competitor mentions, pain point descriptions, assumption signals
- Triggers flagged immediately when detected, not batched or delayed
- Suggest 2-3 research options at a time: "I could check Reddit, HN, or look for competitors — which interests you?"
- Track searched sources — don't re-suggest already-searched queries
- Batch related queries when appropriate: "Let me check Reddit and HN for this"
- Be honest when results are empty + pivot: "I didn't find much — could mean it's a new space. Want to try a different angle?"
- Research available in ALL phases, not just the research phase
- Empty results are handled with honesty, not interpretation

### Research Intensity Control
- Three levels: low (only major claims), medium (clear claims + competitor mentions), high (every assumption)
- Default: medium for new users
- Setting accessible both conversationally (Claude asks at start of research phase) AND via UI control
- User can change intensity at any time

### Implicit Scoring & Phase Progression
- Phase completion based on BOTH coverage (breadth of topics) AND depth (meaningful exploration of each)
- Coverage map visible to user in the progress bar — shows sub-topics within current phase
- Progress bar updates in real-time as Claude detects coverage
- Claude gates progression — sufficient depth required before advancing, won't let users rush through
- Phase transitions use "celebrate + bridge" pattern: acknowledge progress, then naturally lead to next phase
- Scores inferred from conversation, then at end of scoring phase user confirms/adjusts (hybrid approach)
- When user disagrees with a score: discuss reasoning, adjust based on new information

### Dynamic Rescoring (Key Experience)
- When new insights, research findings, or pivots emerge, Claude proactively rescores and presents the new score
- Score changes announced every time, not just significant shifts
- Always explain WHY the score changed: "Your market fit just went from 3 to 5 because finding that underserved audience changes everything"
- Scores can go DOWN as well as up — honest scoring, user needs truth not encouragement
- This back-and-forth rescoring loop is a core experience to preserve and enhance

### Exploration-Phase Scoring
- Even in exploration phases, Claude scores/evaluates emerging opportunities
- Score not just pain points but also experiences that create big emotional responses — any promising gap
- Highlight strongest opportunities in conversation AND maintain a ranked list user can reference
- Guide user toward the most interesting opportunity through scoring feedback

### Conversation Pacing
- Research-backed approach required: investigate coaching methodology for conversation design best practices
- Always ride the user's energy — stay on a productive thread, don't interrupt flow for phase progress
- When energy cools (short answers, repetition): summarize what was covered + bridge to next topic
- Response length mirrors user's message length — short answer gets short response, detailed gets detailed
- Question pacing to be determined by coaching methodology research (critical decision deferred to research)

### Claude's Discretion
- Exact wording of phase introductions and transitions
- How to frame the ranked opportunity list in exploration
- Technical implementation of coverage map detection
- Specific coaching methodology patterns to apply (after research provides options)

</decisions>

<specifics>
## Specific Ideas

- "The dynamic rescoring during evaluation and sharpening was a fantastic experience — new insights or finding a new audience triggered immediate rescoring. We need to capture that way of working."
- "Pain points aren't everything — experiences that create a big emotional response are also valid to search for. Send the user on a quest to find the most interesting opportunity."
- "Conversation pacing should be informed by coaching methodology and learning science, not just intuition. This is crucial to the idea."
- Research intensity control mirrors a "do not disturb" model — user controls how proactive Claude is about suggesting research.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 08-conversation-design*
*Context gathered: 2026-02-17*
