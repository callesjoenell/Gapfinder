# Requirements: Gap Finder Web App

**Defined:** 2026-03-02
**Core Value:** Persistent conversations that feel identical to chatting with Claude directly - the skill's magic preserved, with progress that never gets lost.

## v1.1 Requirements

Requirements for Stripe payments milestone.

### Payments

- [x] **PAY-01**: User gets 1 free Explore session and 1 free Evaluate session
- [ ] **PAY-02**: After free tier, creating a session triggers Stripe Checkout with current price
- [x] **PAY-03**: Base price is $2, doubling globally every week from launch date
- [x] **PAY-04**: Price caps at $64 maximum
- [ ] **PAY-05**: Successful Stripe payment creates the session automatically
- [ ] **PAY-06**: Failed/cancelled payment returns user to app without creating session
- [x] **PAY-07**: Payment records stored per user with session linkage
- [x] **PAY-08**: Launch date configurable (controls when doubling starts)

### Pricing Display

- [ ] **PRICE-01**: User sees current price and "doubles in X days" messaging at paywall
- [ ] **PRICE-02**: Paywall shows how many free sessions remain (if any)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Subscriptions | Per-session pricing, not recurring |
| Refunds UI | Handle manually via Stripe dashboard |
| Coupon codes | Not needed for launch |
| Multiple payment methods | Stripe Checkout handles this natively |
| Invoice/receipt pages | Stripe sends receipts automatically |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PAY-01 | Phase 11 | Complete |
| PAY-03 | Phase 11 | Complete |
| PAY-04 | Phase 11 | Complete |
| PAY-07 | Phase 11 | Complete |
| PAY-08 | Phase 11 | Complete |
| PAY-02 | Phase 12 | Pending |
| PAY-05 | Phase 12 | Pending |
| PAY-06 | Phase 12 | Pending |
| PRICE-01 | Phase 12 | Pending |
| PRICE-02 | Phase 12 | Pending |

**Coverage:**
- v1.1 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0

---

*Requirements defined: 2026-03-02*
*Traceability updated: 2026-03-02 — all 10 requirements mapped to Phases 11-12*
