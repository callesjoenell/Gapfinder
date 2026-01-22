# Requirements: Gap Finder Web App

**Defined:** 2025-01-22
**Core Value:** Persistent conversations that feel identical to chatting with Claude directly - the skill's magic preserved, with progress that never gets lost.

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
| AUTH-01 | Phase 1 - Foundation | Pending |
| AUTH-02 | Phase 1 - Foundation | Pending |
| AUTH-03 | Phase 1 - Foundation | Pending |
| AUTH-04 | Phase 3 - Sessions | Pending |
| AUTH-05 | Phase 3 - Sessions | Pending |
| CHAT-01 | Phase 2 - Chat Core | Pending |
| CHAT-02 | Phase 2 - Chat Core | Pending |
| CHAT-03 | Phase 3 - Sessions | Pending |
| CHAT-04 | Phase 2 - Chat Core | Pending |
| CHAT-05 | Phase 2 - Chat Core | Pending |
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
| DATA-01 | Phase 1 - Foundation | Pending |
| DATA-02 | Phase 1 - Foundation | Pending |
| DATA-03 | Phase 1 - Foundation | Pending |
| DATA-04 | Phase 1 - Foundation | Pending |
| DATA-05 | Phase 1 - Foundation | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0

---
*Requirements defined: 2025-01-22*
*Last updated: 2025-01-22 after roadmap creation*
