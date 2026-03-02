# Roadmap: Gap Finder Web App

**Created:** 2025-01-22
**Core Value:** Persistent conversations that feel identical to chatting with Claude directly - the skill's magic preserved, with progress that never gets lost.

---

## Milestones

- ✅ **v1.0 MVP** — Phases 1-10 (shipped 2026-03-01)
- **v1.1 Payments** — Phases 11-12 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-10) — SHIPPED 2026-03-01</summary>

- [x] Phase 1: Foundation (6/6 plans) — Auth, data persistence, Convex schema
- [x] Phase 2: Chat Core (4/4 plans) — Streaming chat, Claude API, message UI
- [x] Phase 3: Sessions (6/6 plans) — Multi-session sidebar, archive, rename
- [x] Phase 4: Phase System (2/2 plans) — Progress bar, phase detection, gating
- [x] Phase 5: Idea Card (4/4 plans) — Blob animation, merge, score colors
- [x] Phase 6: Instructor View — DEFERRED TO V2
- [x] Phase 7: Research Tools (6/6 plans) — Reddit, HN, Tavily, manual checklists
- [x] Phase 8: Conversation Design (4/4 plans) — Coverage tracking, journey framing
- [x] Phase 9: E2E Conversation Simulation (3/3 plans) — Simulation engine, rubrics
- [x] Phase 10: Conversation Guardrails (2/2 plans) — System prompt guardrails

**Total:** 9 active phases, 37 plans, 12,334 LOC

</details>

### v1.1 Payments

- [ ] **Phase 11: Pricing Engine** - Free tier tracking, weekly doubling price logic, payment records
- [ ] **Phase 12: Stripe Checkout** - Paywall UX, Stripe Checkout flow, session creation on payment

## Phase Details

### Phase 11: Pricing Engine
**Goal**: The app knows exactly what any user owes (or doesn't) when they try to create a session
**Depends on**: Phase 1-10 (v1.0 complete)
**Requirements**: PAY-01, PAY-03, PAY-04, PAY-07, PAY-08
**Success Criteria** (what must be TRUE):
  1. A new user's first Explore session and first Evaluate session are free — no payment prompt appears
  2. The current session price is $2 on launch day, doubles each week, and never exceeds $64
  3. A configurable launch date controls when doubling starts; changing it immediately affects the computed price
  4. Payment records exist in the database linked to both user and session
  5. A third-party developer can query "current price" and "free sessions remaining for user X" from Convex functions
**Plans:** 1/2 plans executed
Plans:
- [ ] 11-01-PLAN.md — Schema additions + pricing module (tables, price logic, queries, mutations)
- [ ] 11-02-PLAN.md — Wire free tier check into createSession

### Phase 12: Stripe Checkout
**Goal**: Users who hit the paywall can pay and land in their new session; those who don't stay safely in the app
**Depends on**: Phase 11
**Requirements**: PAY-02, PAY-05, PAY-06, PRICE-01, PRICE-02
**Success Criteria** (what must be TRUE):
  1. When a user has exhausted their free tier, creating a new session redirects to Stripe Checkout showing the current price
  2. The paywall screen shows the current price, "price doubles in X days", and how many free sessions remain
  3. After successful payment, the new session is created automatically and the user lands in it without manual steps
  4. Cancelling or failing the Stripe payment returns the user to the app with no session created and no charge
**Plans**: TBD

## Progress

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 1. Foundation | v1.0 | 6/6 | Complete | 2026-01 |
| 2. Chat Core | v1.0 | 4/4 | Complete | 2026-01 |
| 3. Sessions | v1.0 | 6/6 | Complete | 2026-01 |
| 4. Phase System | v1.0 | 2/2 | Complete | 2026-01 |
| 5. Idea Card | v1.0 | 4/4 | Complete | 2026-02 |
| 6. Instructor View | v2 | — | Deferred | — |
| 7. Research Tools | v1.0 | 6/6 | Complete | 2026-02 |
| 8. Conversation Design | v1.0 | 4/4 | Complete | 2026-02 |
| 9. E2E Simulation | v1.0 | 3/3 | Complete | 2026-02 |
| 10. Guardrails | v1.0 | 2/2 | Complete | 2026-02 |
| 11. Pricing Engine | 1/2 | In Progress|  | — |
| 12. Stripe Checkout | v1.1 | 0/TBD | Not started | — |

---

*Roadmap created: 2025-01-22*
*Last updated: 2026-03-02 — Phase 11 planned (2 plans)*
