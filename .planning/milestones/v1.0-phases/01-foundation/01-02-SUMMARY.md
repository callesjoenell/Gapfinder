---
phase: 01-foundation
plan: 02
subsystem: auth
tags: [convex-auth, magic-link, resend, react-router]

# Dependency graph
requires:
  - phase: 01-01
    provides: Convex backend with schema, ConvexAuthProvider setup
provides:
  - Magic link authentication via Resend email
  - Sign-in and sign-out UI components
  - Auth routing with protected routes
  - Auth callback handling
affects: [01-03, 01-04, 01-05, 01-06]

# Tech tracking
tech-stack:
  added: [@auth/core, resend, react-router-dom]
  patterns: [Email provider with fetch API, useConvexAuth hook, BrowserRouter routing]

key-files:
  created:
    - convex/auth.ts
    - convex/auth.config.ts
    - convex/http.ts
    - src/components/auth/SignIn.tsx
    - src/components/auth/AuthCallback.tsx
  modified:
    - src/App.tsx
    - package.json
    - tsconfig.app.json
    - convex/tsconfig.json

key-decisions:
  - "Use fetch API instead of Resend SDK to avoid Node.js runtime dependencies in Convex"
  - "15-minute token expiry per security best practices"
  - "Magic link authorize: undefined for link-only authentication (no email resubmission)"
  - "Node types added to tsconfig.app.json for convex env var support"

patterns-established:
  - "Email provider with custom sendVerificationRequest using fetch"
  - "Auth state check pattern: isLoading -> loading spinner, !isAuthenticated -> SignIn, else -> MainApp"
  - "SignOut button fixed position in bottom right"

# Metrics
duration: 12min
completed: 2026-01-28
---

# Phase 1 Plan 02: Magic Link Authentication Summary

**Magic link auth via Convex Auth + Resend API with 15-min expiry, sign-in/sign-out UI, and protected route pattern**

## Performance

- **Duration:** 12 min
- **Started:** 2026-01-28T16:56:16Z
- **Completed:** 2026-01-28T17:08:03Z
- **Tasks:** 3/3
- **Files modified:** 10

## Accomplishments
- Configured Convex Auth with custom Email provider using Resend API
- Created SignIn component with email input, loading states, success confirmation
- Wired authentication routing with protected routes pattern
- Fixed TypeScript build to handle convex env vars correctly

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure Convex Auth with Resend** - `70aca05` (feat)
2. **Task 2: Create Sign-In UI Component** - `86ff2d1` (feat)
3. **Task 3: Wire Auth into App with Routing** - `71dcb4a` (feat)

Note: Auth configuration files (convex/auth.ts, convex/auth.config.ts, convex/http.ts) were partially committed in an earlier session as part of f89085f. This execution added remaining pieces.

## Files Created/Modified
- `convex/auth.ts` - Email provider config with Resend fetch API, currentUser query
- `convex/auth.config.ts` - Empty OAuth config (email handled in auth.ts)
- `convex/http.ts` - HTTP router with auth routes
- `src/components/auth/SignIn.tsx` - Email input form with status states
- `src/components/auth/AuthCallback.tsx` - Post-magic-link redirect handler
- `src/App.tsx` - BrowserRouter, auth callback route, protected routes
- `package.json` - Added @auth/core, resend, build script fixes
- `tsconfig.app.json` - Added node types for env var support
- `convex/tsconfig.json` - Added composite and node types

## Decisions Made
- **Fetch API over Resend SDK:** Resend SDK uses Node.js APIs (stream, crypto) not available in Convex default runtime. Used fetch API directly to call Resend endpoints.
- **15-minute token expiry:** Industry standard for magic link security per research.
- **authorize: undefined:** Enables pure magic-link flow where only the link is needed (no email re-entry on callback).
- **Node types in app tsconfig:** Required because src imports convex/_generated which transitively imports convex/auth.ts with process.env.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] @auth/core version mismatch**
- **Found during:** Task 1 (Convex deployment)
- **Issue:** @auth/core 0.34.3 installed but @convex-dev/auth requires ^0.37.0, causing customFetch export error
- **Fix:** Installed @auth/core@0.37.4
- **Files modified:** package.json, package-lock.json
- **Committed in:** 70aca05

**2. [Rule 3 - Blocking] Resend SDK Node.js dependencies**
- **Found during:** Task 1 (Convex deployment)
- **Issue:** Resend SDK imports stream, crypto, buffer which aren't available in Convex runtime
- **Fix:** Replaced SDK usage with direct fetch API calls to Resend endpoints
- **Files modified:** convex/auth.ts
- **Committed in:** f89085f (prior session)

**3. [Rule 3 - Blocking] TypeScript build failing on process.env**
- **Found during:** Task 3 (Build verification)
- **Issue:** tsconfig.app.json lacked node types, causing TS2591 on process.env in convex/auth.ts
- **Fix:** Added "node" to types array in tsconfig.app.json, updated build script
- **Files modified:** tsconfig.app.json, package.json
- **Committed in:** 71dcb4a

---

**Total deviations:** 3 auto-fixed (all Rule 3 - Blocking)
**Impact on plan:** All fixes necessary for deployment and build. No scope creep.

## Issues Encountered
- Environment variables (AUTH_SECRET, SITE_URL, JWT keys) configured via `npx @convex-dev/auth` CLI tool
- AUTH_RESEND_KEY set to placeholder - requires user's actual Resend API key

## User Setup Required

**External services require manual configuration.** Before auth will work:

### Resend API Key
1. Create Resend account at https://resend.com/signup
2. Go to Dashboard -> API Keys -> Create API Key
3. Run: `npx convex env set AUTH_RESEND_KEY "re_your_actual_key"`

### Domain Verification (optional, for production)
1. Go to Resend Dashboard -> Domains
2. Add and verify your domain
3. Update `from` email in convex/auth.ts from `onboarding@resend.dev` to your domain

### Testing with Default Sender
The current config uses `onboarding@resend.dev` which Resend allows for testing. Emails will work but may land in spam.

## Next Phase Readiness
- Authentication infrastructure complete
- Sign-in flow ready for testing once AUTH_RESEND_KEY is configured
- Protected routes pattern established for future views
- Ready for Plan 03: Basic Chat UI

---
*Phase: 01-foundation*
*Completed: 2026-01-28*
