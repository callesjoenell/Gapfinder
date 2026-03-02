---
phase: quick-6
plan: "01"
subsystem: public-pages
tags: [legal, compliance, eu, terms, refund, about]
dependency_graph:
  requires: []
  provides: [TermsPage, RefundPage, company-info-on-about]
  affects: [PublicPageLayout, App.tsx, AboutPage]
tech_stack:
  added: []
  patterns: [PublicPageLayout wrapper, react-router-dom Link, useEffect document.title]
key_files:
  created:
    - src/components/pages/TermsPage.tsx
    - src/components/pages/RefundPage.tsx
  modified:
    - src/components/pages/AboutPage.tsx
    - src/components/layout/PublicPageLayout.tsx
    - src/App.tsx
decisions:
  - "14-day refund window chosen for EU Consumer Rights Directive (2011/83/EU) compliance"
  - "Footer-only placement for Terms/Refund links — keeps header nav clean (About/FAQ/Contact only)"
  - "No Clerk/Convex imports in any new or modified public pages — matches existing pattern"
metrics:
  duration: "8 minutes"
  completed: "2026-03-02"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 5
---

# Phase quick-6 Plan 01: Legal Subsections Summary

**One-liner:** EU-compliant Terms and Refund pages for Skip Intro AB SaaS, with company info added to About page and footer links on all public pages.

---

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add company info to AboutPage, create RefundPage and TermsPage | c33c8e1 | AboutPage.tsx, TermsPage.tsx, RefundPage.tsx |
| 2 | Add routes and navigation links for Terms and Refund pages | 5655c1b | App.tsx, PublicPageLayout.tsx |

---

## What Was Built

### TermsPage.tsx
11 sections covering: Introduction, The Service, Accounts and Access, Payments and Refunds (links to /refund), Intellectual Property, AI-Generated Content, Limitation of Liability, Termination, Changes to Terms, Governing Law (Sweden), Contact (/contact link).

### RefundPage.tsx
4 sections: 14-day money-back guarantee with EU Consumer Rights Directive (2011/83/EU) rationale, how to request a refund (hello@startbuildingnow.com), after the 14-day period, and governing law (Sweden / Skip Intro AB).

### AboutPage.tsx updates
Added company info card at the bottom with linked references to /contact, /terms, and /refund. Added `Link` import from react-router-dom.

### App.tsx updates
Imported TermsPage and RefundPage, added `<Route path="/terms">` and `<Route path="/refund">` alongside existing public routes.

### PublicPageLayout.tsx updates
Footer now has two rows: "Back to Start Building Now" and a second row with "Terms · Refund Policy" links in `text-sm text-gray-400` style.

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Verification

- `npx tsc --noEmit` passes (no type errors)
- `npm run build` succeeds (vite build in 2.55s)
- 2 routes confirmed in App.tsx (`grep -c "Route.*terms\|Route.*refund"` = 2)
- 2 link references confirmed in PublicPageLayout.tsx (`grep -c "terms\|refund"` = 2)
- No Clerk or Convex imports in TermsPage.tsx, RefundPage.tsx, or modified AboutPage.tsx

---

## Self-Check: PASSED

Files exist:
- FOUND: src/components/pages/TermsPage.tsx
- FOUND: src/components/pages/RefundPage.tsx
- FOUND: src/components/pages/AboutPage.tsx (modified)

Commits exist:
- FOUND: c33c8e1 — feat(quick-6): add Terms, Refund pages and company info to About
- FOUND: 5655c1b — feat(quick-6): add /terms and /refund routes, footer links on all public pages
