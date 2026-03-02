# Requirements: Gap Finder Web App

**Defined:** 2026-03-02
**Core Value:** Persistent conversations that feel identical to chatting with Claude directly - the skill's magic preserved, with progress that never gets lost.

## v1.1 Requirements

Requirements for Stripe payments milestone.

### Payments

- [x] **PAY-01**: User gets 1 free Explore session and 1 free Evaluate session
- [x] **PAY-02**: After free tier, creating a session triggers Stripe Checkout with current price
- [x] **PAY-03**: Base price is $2, doubling globally every week from launch date
- [x] **PAY-04**: Price caps at $64 maximum
- [x] **PAY-05**: Successful Stripe payment creates the session automatically
- [x] **PAY-06**: Failed/cancelled payment returns user to app without creating session
- [x] **PAY-07**: Payment records stored per user with session linkage
- [x] **PAY-08**: Launch date configurable (controls when doubling starts)

### Pricing Display

- [x] **PRICE-01**: User sees current price and "doubles in X days" messaging at paywall
- [x] **PRICE-02**: Paywall shows how many free sessions remain (if any)

## Phase 13 Requirements

Requirements for public informational pages.

### Public Pages

- [x] **PAGE-01**: About page accessible at /about without authentication, explaining what the app does and why
- [x] **PAGE-02**: Contact page accessible at /contact without authentication, with a way to reach the team
- [x] **PAGE-03**: FAQ page accessible at /faq without authentication, with expandable question/answer items covering pricing, paths, and data privacy
- [x] **PAGE-04**: All public pages share consistent navigation (header with cross-links, footer with home link) and match WelcomePage visual style

## Out of Scope

| Feature | Reason |
|---------|--------|
| Subscriptions | Per-session pricing, not recurring |
| Refunds UI | Handle manually via Stripe dashboard |
| Coupon codes | Not needed for launch |
| Multiple payment methods | Stripe Checkout handles this natively |
| Invoice/receipt pages | Stripe sends receipts automatically |
| Custom contact form backend | mailto: or Formspree sufficient; no Convex/Resend needed |
| SEO meta tags beyond document.title | SPA without SSR; advanced SEO deferred |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PAY-01 | Phase 11 | Complete |
| PAY-03 | Phase 11 | Complete |
| PAY-04 | Phase 11 | Complete |
| PAY-07 | Phase 11 | Complete |
| PAY-08 | Phase 11 | Complete |
| PAY-02 | Phase 12 | Complete |
| PAY-05 | Phase 12 | Complete |
| PAY-06 | Phase 12 | Complete |
| PRICE-01 | Phase 12 | Complete |
| PRICE-02 | Phase 12 | Complete |
| PAGE-01 | Phase 13 | Planned |
| PAGE-02 | Phase 13 | Planned |
| PAGE-03 | Phase 13 | Planned |
| PAGE-04 | Phase 13 | Planned |

**Coverage:**
- v1.1 requirements: 10 total, 10 mapped, 0 unmapped
- Phase 13 requirements: 4 total, 4 mapped, 0 unmapped

---

*Requirements defined: 2026-03-02*
*Traceability updated: 2026-03-02 — Phase 13 requirements added*
