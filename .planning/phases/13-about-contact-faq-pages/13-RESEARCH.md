# Phase 13: About, Contact & FAQ Pages - Research

**Researched:** 2026-03-02
**Domain:** React Router public pages, static content pages, contact form patterns
**Confidence:** HIGH

## Summary

Phase 13 adds three public informational pages (About, Contact, FAQ) to the Gap Finder web app. These pages must be accessible without authentication — they serve as marketing/trust content for prospective users who land on the site before signing up.

The project currently uses a single catch-all route (`/*` → `AuthenticatedApp`), which means there is no mechanism to render public pages outside the auth gate. The primary architectural change is adding explicit public routes (`/about`, `/contact`, `/faq`) to the BrowserRouter before the catch-all, and each page must render without requiring Clerk auth.

The WelcomePage is the established pattern for public-facing pages in this project: clean gray-50 background, white card sections, primary teal accent color, prose-heavy layout. All three new pages should follow this exact visual language. No new UI libraries are needed — Tailwind CSS already in the stack handles everything required.

For the contact page, the correct scope-minimal approach is a `mailto:` link or a simple Formspree form. Wiring up a Convex action + Resend for email delivery is out of proportion to the problem and introduces a new third-party service dependency. A `mailto:` link is zero infrastructure; Formspree adds a hosted form with zero backend work.

**Primary recommendation:** Add three public routes to App.tsx before the `/*` catch-all, build each page as a standalone React component matching WelcomePage style, use `mailto:` for contact (or Formspree if a real submission form is desired), and add nav links to the WelcomePage footer.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-router-dom | ^7.13.0 (already installed) | Client-side routing for public pages | Already in project; v7 API in use |
| Tailwind CSS | ^3.4.19 (already installed) | Page styling | Entire project uses Tailwind; no new library needed |
| React | ^19.2.0 (already installed) | Component rendering | Project foundation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Formspree | hosted (no install) | Contact form submission | If `mailto:` is too minimal and real form UX is wanted |
| react-hook-form | ^7.71.1 (already installed) | Form state management | Only if building a custom contact form wired to a backend |
| sonner | ^2.0.7 (already installed) | Toast notifications | Use for contact form success/error feedback |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| mailto: link | Resend + Convex action | Resend is correct for transactional email but overkill for a contact form; adds API key management and a new service |
| Formspree | Custom Convex HTTP action | Convex HTTP action works but requires writing email delivery logic; Formspree is zero-backend |
| Tailwind | New UI component library | No component library is used in this project; introducing one now creates inconsistency |

**Installation:**
```bash
# No new packages required — all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── pages/           # New: public page components
│   │   ├── AboutPage.tsx
│   │   ├── ContactPage.tsx
│   │   └── FAQPage.tsx
│   ├── layout/
│   │   └── PublicPageLayout.tsx   # Shared wrapper for About/Contact/FAQ
│   └── WelcomePage.tsx  # Existing — add footer nav links
└── App.tsx              # Add /about, /contact, /faq routes
```

### Pattern 1: Public Routes Before Auth Catch-All

**What:** Add explicit routes before the `/*` catch-all so public pages bypass `AuthenticatedApp` entirely.

**When to use:** Any page that must be accessible without Clerk authentication.

**Example:**
```typescript
// src/App.tsx — updated Routes block
function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/*" element={<AuthenticatedApp />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
```

**Critical:** In react-router-dom v7, more-specific routes match before wildcard routes, so `/about` will resolve before `/*`. No `exact` prop needed (that was removed in v6+).

### Pattern 2: Shared Public Page Layout

**What:** A thin wrapper component that provides consistent chrome (optional nav, back-to-home link) for all three pages without duplicating markup.

**When to use:** All three pages (About, Contact, FAQ).

**Example:**
```typescript
// src/components/layout/PublicPageLayout.tsx
import { Link } from "react-router-dom";

interface PublicPageLayoutProps {
  children: React.ReactNode;
}

export function PublicPageLayout({ children }: PublicPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-semibold text-gray-900 hover:text-primary-600">
          Start Building Now
        </Link>
        <nav className="flex gap-6 text-sm text-gray-500">
          <Link to="/about" className="hover:text-gray-900">About</Link>
          <Link to="/faq" className="hover:text-gray-900">FAQ</Link>
          <Link to="/contact" className="hover:text-gray-900">Contact</Link>
        </nav>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="text-center text-sm text-gray-400 py-8">
        <Link to="/" className="hover:text-gray-600">Back to Start Building Now</Link>
      </footer>
    </div>
  );
}
```

### Pattern 3: FAQ Accordion — Pure CSS/Tailwind (No Library)

**What:** Native HTML `<details>/<summary>` elements styled with Tailwind, or a simple useState-toggled expand/collapse. No headlessui or radix needed given project scope.

**When to use:** FAQ page — avoid installing an accordion library for a single use case.

**Example:**
```typescript
// Simple FAQ item with useState
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left font-medium text-gray-900"
      >
        {question}
        <span className="ml-4 text-gray-400">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p className="mt-3 text-gray-600 leading-relaxed">{answer}</p>
      )}
    </div>
  );
}
```

**Alternative:** Native `<details>/<summary>` requires no JavaScript at all and is semantically correct. Works with CSS animation but animation is harder. Fine for this use case.

### Pattern 4: WelcomePage Footer Navigation

**What:** Add links to About/Contact/FAQ in the existing WelcomePage so authenticated users reaching it (e.g., after sign-out) can access these pages.

**When to use:** Bottom of WelcomePage, below the auth section.

**Example:**
```typescript
// Add to bottom of WelcomePage auth section
<footer className="mt-8 text-center text-sm text-gray-400 space-x-4">
  <Link to="/about" className="hover:text-gray-600">About</Link>
  <Link to="/faq" className="hover:text-gray-600">FAQ</Link>
  <Link to="/contact" className="hover:text-gray-600">Contact</Link>
</footer>
```

### Anti-Patterns to Avoid

- **Nesting public pages inside `AuthenticatedApp`:** Clerk's `isSignedIn` check will redirect users to sign-in before they can read About/FAQ content.
- **Using the main app `Layout` (Sidebar + Header) for public pages:** That layout assumes a session context and Convex auth. Public pages need their own thin layout.
- **Installing a modal/dialog library for FAQ:** A simple useState toggle is sufficient. Don't add radix-ui or headlessui for this.
- **Wiring Convex mutations for contact form storage:** Contacts from a form don't need to live in the Convex DB. A `mailto:` or Formspree handles this without schema changes.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email delivery for contact form | Custom Convex action + SMTP / Resend integration | `mailto:` link or Formspree | New service dependency; overkill for simple contact; `mailto:` is zero infra |
| Accordion/collapse animation | Custom CSS transitions with JS | framer-motion (already installed) or native details/summary | Framer Motion already in project if animation is desired |
| Form validation | Custom validation logic | react-hook-form (already installed) | Already in project; handles validation, error states, submission |

**Key insight:** This phase is content + routing, not infrastructure. Resist adding new dependencies for problems the existing stack already solves.

## Common Pitfalls

### Pitfall 1: Route Order Conflict with `/*` Catch-All

**What goes wrong:** Public route `/about` never matches because `/*` in App.tsx matches everything first.
**Why it happens:** If the developer puts public routes after or inside the `AuthenticatedApp` route.
**How to avoid:** Place `/about`, `/contact`, `/faq` routes as siblings of `/*` in the `<Routes>` block, listed before `/*`. React Router v7 matches routes in definition order (more specific first).
**Warning signs:** Typing `/about` in the browser redirects to sign-in or shows the main app.

### Pitfall 2: Using `<a href>` Instead of `<Link>` for Internal Navigation

**What goes wrong:** Navigation between pages triggers full page reload, losing React state and causing flicker.
**Why it happens:** Copy-pasting plain HTML anchor tags.
**How to avoid:** Always use `<Link to="...">` from react-router-dom for internal routes. Reserve `<a href>` for external URLs.
**Warning signs:** Browser shows full reload animation when clicking between About/FAQ/Contact.

### Pitfall 3: Clerk Auth Components Rendering on Public Pages

**What goes wrong:** `useAuth()` or `useUser()` hooks throw or behave unexpectedly on pages rendered before Clerk is fully loaded.
**Why it happens:** Public pages that accidentally import Clerk hooks.
**How to avoid:** Public page components should have zero Clerk imports. No `useAuth`, `useUser`, `<SignIn>`, or `<SignUp>` on About/Contact/FAQ pages.
**Warning signs:** Console errors mentioning Clerk context or provider on public pages.

### Pitfall 4: No "Back to Home" Path for Authenticated Users

**What goes wrong:** A signed-in user navigates to `/about` and has no way back to the app except the browser back button.
**Why it happens:** Public page layout doesn't account for signed-in users.
**How to avoid:** The PublicPageLayout header link to `/` will route `AuthenticatedApp` which handles signed-in users correctly. Optionally, use `useAuth()` in the public layout to show "Go to app" button for signed-in users.

### Pitfall 5: Missing SEO/Meta Tags

**What goes wrong:** About/FAQ pages have no `<title>` or meta description, hurting SEO.
**Why it happens:** React SPA doesn't update `<title>` by default.
**How to avoid:** Directly set `document.title` in a `useEffect` in each page component. This project uses Vite (not Next.js), so there's no built-in `<Head>` component. Simple `useEffect(() => { document.title = "About | Start Building Now"; }, [])` is sufficient.

## Code Examples

Verified patterns from project codebase:

### Contact Page with Mailto Link
```typescript
// src/components/pages/ContactPage.tsx
import { PublicPageLayout } from "../layout/PublicPageLayout";

export function ContactPage() {
  useEffect(() => {
    document.title = "Contact | Start Building Now";
  }, []);

  return (
    <PublicPageLayout>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h1>
        <p className="text-gray-600 leading-relaxed mb-8">
          Questions, feedback, or just want to say hello?
        </p>
        <a
          href="mailto:hello@start-building-now.com"
          className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
        >
          Send us an email
        </a>
      </div>
    </PublicPageLayout>
  );
}
```

### Tailwind Color Reference (from tailwind.config.js)
The project's primary color is teal. Use these classes:
- `text-primary-600` — body link color
- `bg-primary-500` — CTA button background
- `hover:bg-primary-600` — button hover
- `bg-primary-50`, `text-primary-600` — icon backgrounds (see WelcomePage)

### Page Card Pattern (from WelcomePage)
```typescript
// Matching WelcomePage card style
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
  {/* content */}
</div>
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Separate static HTML pages | React SPA routes with react-router-dom v7 | Seamless navigation, shared JS bundle |
| `exact` prop on Route | No `exact` needed (removed in v6+) | Simpler route definitions |
| Hash routing for SPAs | BrowserRouter (already used) | Clean URLs, proper browser history |

**Deprecated/outdated:**
- `<Switch>` component: Replaced by `<Routes>` in react-router-dom v6+. Project already uses `<Routes>`.
- `exact` prop: Not a valid prop in v6+. Not needed because `<Routes>` picks the most specific match.

## Open Questions

1. **Contact email address**
   - What we know: No email is currently configured in the project
   - What's unclear: What email address should the contact page direct to?
   - Recommendation: Planner should leave a `TODO: replace with actual email` comment in the mailto link, or ask the user before planning

2. **Content for About and FAQ**
   - What we know: No copy exists yet for these pages
   - What's unclear: Should planner draft placeholder content or leave blanks for user to fill?
   - Recommendation: Plan tasks should include placeholder content based on what the app does (Gap Finder methodology, AI-guided conversations, pricing) so pages are functional at merge; user can edit copy post-merge

3. **Navigation link placement in main authenticated app**
   - What we know: The main app Layout (Header + Sidebar) has no links to About/FAQ/Contact
   - What's unclear: Should these links appear in the Sidebar or only on WelcomePage?
   - Recommendation: Add to WelcomePage footer only; authenticated users rarely need these pages during active use

## Sources

### Primary (HIGH confidence)
- Project source files (App.tsx, WelcomePage.tsx, Layout.tsx, tailwind.config.js, package.json) — read directly; routing, styling, and component patterns verified from codebase
- react-router-dom official docs (react-router.com) — Route ordering, no `exact` needed in v7 confirmed by v6+ migration guides

### Secondary (MEDIUM confidence)
- Formspree (formspree.io) — established free-tier HTML form handler, commonly used with static/SPA sites; no backend required
- Native `<details>/<summary>` MDN Web Docs — semantic HTML accordion alternative

### Tertiary (LOW confidence)
- Resend.com pricing/limits for contact form use case — not investigated; listed as alternative for reference only

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project; routing pattern verified from existing code
- Architecture: HIGH — patterns derived directly from existing WelcomePage and Layout components
- Pitfalls: HIGH — route ordering and Link vs anchor are documented react-router behaviors; Clerk pitfall verified from existing auth pattern

**Research date:** 2026-03-02
**Valid until:** 2026-04-02 (stable domain — react-router-dom v7, Tailwind v3 APIs are stable)
