---
phase: quick-6
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/pages/AboutPage.tsx
  - src/components/pages/TermsPage.tsx
  - src/components/pages/RefundPage.tsx
  - src/App.tsx
  - src/components/layout/PublicPageLayout.tsx
autonomous: true
requirements: [LEGAL-01, LEGAL-02, LEGAL-03]

must_haves:
  truths:
    - "About page shows Skip Intro AB as operating company"
    - "Refund policy page states 14-day money-back guarantee (EU Consumer Rights Directive compliant)"
    - "Terms page covers SaaS usage, IP, liability, termination, governing law (Swedish)"
    - "All new pages accessible via navigation"
  artifacts:
    - path: "src/components/pages/TermsPage.tsx"
      provides: "Terms and conditions page"
    - path: "src/components/pages/RefundPage.tsx"
      provides: "Refund policy page"
    - path: "src/components/pages/AboutPage.tsx"
      provides: "Updated about page with company info section"
  key_links:
    - from: "src/App.tsx"
      to: "TermsPage, RefundPage"
      via: "React Router routes"
      pattern: "Route path=./terms|/refund"
    - from: "src/components/layout/PublicPageLayout.tsx"
      to: "/terms, /refund"
      via: "footer links"
      pattern: "Link to=./terms|/refund"
---

<objective>
Add legal subsections to the public pages: company info on the About page, a standalone Refund Policy page (14-day guarantee for EU compliance), a standalone Terms and Conditions page, and navigation links to reach them.

Purpose: Legal compliance for a Swedish-operated SaaS (Skip Intro AB) serving EU customers.
Output: Updated AboutPage.tsx, new TermsPage.tsx, new RefundPage.tsx, updated routing and navigation.
</objective>

<execution_context>
@/Users/callesjoenell/.claude/get-shit-done/workflows/execute-plan.md
@/Users/callesjoenell/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/pages/AboutPage.tsx
@src/components/layout/PublicPageLayout.tsx
@src/App.tsx

Key patterns:
- Public pages use `PublicPageLayout` wrapper (header nav + footer)
- Pages are in `src/components/pages/`
- Routes defined in App.tsx inside `<Routes>` block
- Styling: white cards with `bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8`
- No Clerk/Convex imports on public pages (key constraint from STATE.md)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add company info to AboutPage and create RefundPage and TermsPage</name>
  <files>src/components/pages/AboutPage.tsx, src/components/pages/RefundPage.tsx, src/components/pages/TermsPage.tsx</files>
  <action>
**AboutPage.tsx** — Add a new card section at the bottom (before closing `</div>`s), after "Why We Built This":

```
Company Information
Start Building Now is operated by Skip Intro AB, a company registered in Sweden.
For questions, visit our Contact page or see our Terms and Conditions and Refund Policy.
```

Link "Contact page" to /contact, "Terms and Conditions" to /terms, "Refund Policy" to /refund using react-router-dom Link. Same card styling as existing sections.

**RefundPage.tsx** — New page using PublicPageLayout. Title: "Refund Policy". Content sections:

1. **14-Day Money-Back Guarantee** — "If you are not satisfied with your purchase, you may request a full refund within 14 days of payment. This applies to all paid sessions. No questions asked." Note: 14 days chosen to comply with EU Consumer Rights Directive (Directive 2011/83/EU) which grants consumers a 14-day withdrawal period for digital services. This exceeds many national minimums and provides safe coverage across all markets.

2. **How to Request a Refund** — "Email us at [use same contact email as ContactPage] with your account email and we will process your refund within 5 business days."

3. **After the 14-Day Period** — "Refunds after 14 days are considered on a case-by-case basis. Contact us and we will do our best to help."

4. **Governing Law** — "This refund policy is governed by Swedish law. Skip Intro AB is registered in Sweden."

Set document.title to "Refund Policy | Start Building Now" via useEffect.

**TermsPage.tsx** — New page using PublicPageLayout. Title: "Terms and Conditions". Sections:

1. **Introduction** — "These terms govern your use of Start Building Now (start-building.now), a SaaS product operated by Skip Intro AB, a company registered in Sweden. By using the service, you agree to these terms."

2. **The Service** — "Start Building Now provides AI-guided methodology for business idea validation. The service includes conversational sessions, research tools, and scoring frameworks delivered through a web application."

3. **Accounts and Access** — "You must create an account to use the service. You are responsible for maintaining the confidentiality of your account. We reserve the right to suspend or terminate accounts that violate these terms."

4. **Payments and Refunds** — "Paid sessions are charged at the price displayed at checkout. Prices may change over time. All payments are processed through Stripe. For refund terms, see our Refund Policy." Link to /refund.

5. **Intellectual Property** — "The service, including its methodology, design, and code, is the intellectual property of Skip Intro AB. Content you create during sessions (your ideas, notes, and conversation history) belongs to you. We do not claim ownership of your content."

6. **AI-Generated Content** — "The service uses AI to facilitate conversations. AI responses are guides, not professional advice. We do not guarantee the accuracy, completeness, or suitability of AI-generated content for any particular purpose. You are responsible for your own business decisions."

7. **Limitation of Liability** — "To the maximum extent permitted by law, Skip Intro AB shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly. Our total liability for any claim arising from the service shall not exceed the amount you paid us in the 12 months preceding the claim."

8. **Termination** — "You may stop using the service at any time. We may suspend or terminate your access if you violate these terms or engage in abusive behavior. Upon termination, your right to use the service ceases. Your conversation data may be retained for a reasonable period per our data practices."

9. **Changes to Terms** — "We may update these terms from time to time. Continued use of the service after changes constitutes acceptance. We will notify users of material changes."

10. **Governing Law and Disputes** — "These terms are governed by the laws of Sweden. Any disputes shall be resolved in the courts of Sweden."

11. **Contact** — "Questions about these terms? Contact us at [link to /contact]."

Set document.title to "Terms and Conditions | Start Building Now" via useEffect. Use same card styling and layout patterns as AboutPage (max-w-3xl, white cards, consistent typography).
  </action>
  <verify>
    <automated>cd /Users/callesjoenell/Documents/GapFinder && npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>AboutPage has company info section with Skip Intro AB. TermsPage.tsx and RefundPage.tsx exist with full legal content, matching existing page styling, zero Clerk/Convex imports.</done>
</task>

<task type="auto">
  <name>Task 2: Add routes and navigation links for Terms and Refund pages</name>
  <files>src/App.tsx, src/components/layout/PublicPageLayout.tsx</files>
  <action>
**App.tsx:**
- Import TermsPage and RefundPage from `./components/pages/TermsPage` and `./components/pages/RefundPage`
- Add two Route entries alongside the existing /about, /contact, /faq routes:
  - `<Route path="/terms" element={<TermsPage />} />`
  - `<Route path="/refund" element={<RefundPage />} />`

**PublicPageLayout.tsx:**
- Add "Terms" and "Refund Policy" links to the footer (not the header nav — keep header clean with About/FAQ/Contact only)
- Footer should become: "Back to Start Building Now" on one line, then a second line with links: "Terms" (/terms) and "Refund Policy" (/refund) separated by a dot or pipe, styled `text-sm text-gray-400`
- Use react-router-dom Link component (already imported)
  </action>
  <verify>
    <automated>cd /Users/callesjoenell/Documents/GapFinder && npx tsc --noEmit 2>&1 | head -20 && grep -c "Route.*terms\|Route.*refund" src/App.tsx && grep -c "terms\|refund" src/components/layout/PublicPageLayout.tsx</automated>
  </verify>
  <done>Routes /terms and /refund work. Footer on all public pages shows links to Terms and Refund Policy. TypeScript compiles without errors.</done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes (no type errors)
- `npm run build` succeeds
- Manual check: /about shows "Skip Intro AB" company section at bottom
- Manual check: /terms shows full terms and conditions
- Manual check: /refund shows 14-day refund policy
- Manual check: Footer on any public page links to /terms and /refund
- No Clerk or Convex imports in any of the new/modified public page files
</verification>

<success_criteria>
- AboutPage shows Skip Intro AB as the operating company
- TermsPage covers all required sections (SaaS usage, IP, liability, termination, Swedish governing law)
- RefundPage states 14-day money-back guarantee with EU compliance rationale
- All pages accessible via routes and footer navigation
- Build compiles without errors
</success_criteria>

<output>
After completion, create `.planning/quick/6-add-about-page-legal-subsections/6-SUMMARY.md`
</output>
