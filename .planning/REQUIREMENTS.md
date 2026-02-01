# Requirements: Gap Finder Web App

**Defined:** 2025-01-22
**Core Value:** Persistent conversations that feel identical to chatting with Claude directly - the skill's magic preserved, with progress that never gets lost.

## User Outcome Goals

The ultimate measure of success is how users FEEL when they complete the process. Every feature decision should serve these outcomes:

### Primary Outcomes

| Outcome | What It Means | How We Know It's Working |
|---------|---------------|--------------------------|
| **Confident in themselves** | User believes they CAN build something meaningful | They speak in certainties ("I will...") not uncertainties ("Maybe I could...") |
| **Self-discovery** | User found new areas of themselves to explore | They say "I didn't realize I had..." or "I never thought about my experience in X as valuable" |
| **Solid research foundation** | User has evidence, not just intuition | They can cite specific data points, quotes from research, validation signals |
| **Ownership of the idea** | User feels "I discovered this" not "Claude suggested this" | When describing their idea to others, they naturally say "I realized..." not "The app told me..." |

### The Emotional Journey

```
START: "I don't know what to build" / "I have too many ideas"
       (Confusion, overwhelm, self-doubt)
                    ↓
PHASE 0: "I have more to offer than I realized"
         (Discovery of unfair advantages)
                    ↓
PHASE 1: "There are real problems I could solve"
         (Connection to market reality)
                    ↓
PHASE 2: "I see how MY unique combination fits"
         (Synthesis and ownership)
                    ↓
PHASE 3: "I know exactly WHO I'm helping"
         (Clarity of purpose)
                    ↓
PHASE 4: "This is worth pursuing - here's why"
         (Validated confidence with evidence)
                    ↓
PHASES 5-6: "Real people confirmed this matters"
            (External validation)
                    ↓
PHASES 7-8: "People will pay for this"
            (Market validation)
                    ↓
END: "I know exactly what to build and why"
     (Clarity, confidence, capability)
```

### Why This Matters

The idea evaluation and sharpening process is **essential to their future success**. Without it:
- They build something no one wants
- They abandon at first obstacle (no ownership)
- They can't articulate why their idea matters (no clarity)
- They second-guess every decision (no confidence)

With it:
- They build something validated
- They persist through challenges (deep ownership)
- They pitch compellingly (clear articulation)
- They make decisions from conviction (grounded confidence)

### Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | What We Do Instead |
|--------------|--------------|-------------------|
| Generating ideas FOR user | No ownership = no persistence | Surface patterns, let THEM connect dots |
| Cheerleading/false encouragement | Undermines trust, doesn't prepare for reality | Honest feedback, challenge assumptions |
| Rushing through phases | Shallow work = weak foundation | Gate progression, require evidence |
| Generic frameworks | Feels impersonal, doesn't stick | Personalized to THEIR context |
| Complexity/overwhelm | Anxiety prevents clear thinking | Progressive disclosure, one thing at a time |

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication & Sessions

- [ ] **AUTH-01**: Participant receives magic link via email tied to their cohort
- [ ] **AUTH-02**: Magic link authenticates and lands them in the chat interface
- [ ] **AUTH-03**: Session persists - return via magic link, continue where left off
- [ ] **AUTH-04**: Multiple idea sessions accessible from sidebar (parallel exploration)
- [ ] **AUTH-05**: Sessions have user-defined names

### Chat Experience

- [ ] **CHAT-01**: Chat feels identical to Claude.ai with the skill loaded
- [ ] **CHAT-02**: Full conversation history persisted and loaded on return
- [ ] **CHAT-03**: Claude naturally wraps up phases with closing questions (skill-driven)
- [ ] **CHAT-04**: Skill loaded as system prompt, conversation history in context
- [ ] **CHAT-05**: Responses streamed to UI

### Progress & Phases

- [ ] **PROG-01**: Progress bar shows all 12 phases
- [ ] **PROG-02**: Current phase highlighted with progress indicator within phase
- [ ] **PROG-03**: Progressive unlocking - must complete phase N before N+1
- [ ] **PROG-04**: Phases are clickable but locked until unlocked

### Idea Card (Visual Centerpiece)

- [ ] **CARD-01**: Idea card takes up top 25% of screen
- [ ] **CARD-02**: Phases 1-5: Scattered fuzzy yellow blobs, slowly drifting together
- [ ] **CARD-03**: Phase 6 (Your Idea): Blobs merge into complete card, yellow
- [ ] **CARD-04**: Low scores: Card stays milky yellow
- [ ] **CARD-05**: High scores: Card transitions to dark green with white text
- [ ] **CARD-06**: Card content updates as idea gets refined through conversation

### Instructor View

- [ ] **INST-01**: List all participants in a cohort
- [ ] **INST-02**: Show current phase for each participant
- [ ] **INST-03**: Click into any participant to read their full conversation history

### Data Persistence (Convex)

- [ ] **DATA-01**: Save every message with timestamp
- [ ] **DATA-02**: Track current phase per participant
- [ ] **DATA-03**: Track idea card state (content, color/score)
- [ ] **DATA-04**: Link participants to cohorts
- [ ] **DATA-05**: Store named sessions per participant

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Analytics & Insights

- **ANLYT-01**: Dashboard summaries showing patterns across participants
- **ANLYT-02**: Auto-generated class prep documents for instructor
- **ANLYT-03**: Export/reporting features

### Integrations

- **INTEG-01**: Research APIs and MCP integrations
- **INTEG-02**: Multi-tenant support (multiple instructors)

### Enhanced Experience

- **ENHC-01**: Conversation search within sessions
- **ENHC-02**: Conversation bookmarking
- **ENHC-03**: Phase completion summaries (AI-generated)
- **ENHC-04**: Cross-session insight synthesis

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multi-tenant (multiple instructors) | Single instructor for v1 |
| Payment/billing | Handled outside the app |
| Mobile app | Web-first |
| Real-time collaboration | Async only |
| Video/audio integration | Separate from this tool |
| Voice input/output | Text-only for reflection-based methodology |
| Points/badges/leaderboards | Creates anxiety; inappropriate for methodology work |
| Time pressure/countdowns | Methodology needs reflection, not rushing |
| Public progress comparisons | Only instructor sees all progress |
| Community/forum features | 10 participants don't need forums |
| Assessment/quiz system | Progress shown through conversation, not tests |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 - Foundation | Complete |
| AUTH-02 | Phase 1 - Foundation | Complete |
| AUTH-03 | Phase 1 - Foundation | Complete |
| AUTH-04 | Phase 3 - Sessions | Complete |
| AUTH-05 | Phase 3 - Sessions | Complete |
| CHAT-01 | Phase 2 - Chat Core | Complete |
| CHAT-02 | Phase 2 - Chat Core | Complete |
| CHAT-03 | Phase 3 - Sessions | Complete |
| CHAT-04 | Phase 2 - Chat Core | Complete |
| CHAT-05 | Phase 2 - Chat Core | Complete |
| PROG-01 | Phase 4 - Phase System | Pending |
| PROG-02 | Phase 4 - Phase System | Pending |
| PROG-03 | Phase 4 - Phase System | Pending |
| PROG-04 | Phase 4 - Phase System | Pending |
| CARD-01 | Phase 5 - Idea Card | Pending |
| CARD-02 | Phase 5 - Idea Card | Pending |
| CARD-03 | Phase 5 - Idea Card | Pending |
| CARD-04 | Phase 5 - Idea Card | Pending |
| CARD-05 | Phase 5 - Idea Card | Pending |
| CARD-06 | Phase 5 - Idea Card | Pending |
| INST-01 | Phase 6 - Instructor View | Pending |
| INST-02 | Phase 6 - Instructor View | Pending |
| INST-03 | Phase 6 - Instructor View | Pending |
| DATA-01 | Phase 1 - Foundation | Complete |
| DATA-02 | Phase 1 - Foundation | Complete |
| DATA-03 | Phase 1 - Foundation | Complete |
| DATA-04 | Phase 1 - Foundation | Deferred |
| DATA-05 | Phase 1 - Foundation | Complete |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0

---
*Requirements defined: 2025-01-22*
*Last updated: 2026-01-29 - Added User Outcome Goals section*
