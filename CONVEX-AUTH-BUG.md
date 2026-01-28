# Convex Auth Magic Link Bug Report

**Date:** 2026-01-28
**Package:** @convex-dev/auth (latest)
**Issue:** Magic link verification fails with "Connection lost while action was in flight"

---

## Environment

- **Convex Deployment:** glad-bloodhound-996
- **Frontend:** Vite + React + TypeScript
- **Port:** localhost:5175
- **Package versions:** @convex-dev/auth, @auth/core@0.37.0

## The Problem

When clicking a magic link email, the verification fails with:
```
[CONVEX A(auth:signIn)]
Connection lost while action was in flight
Called by client
```

The magic link URL format: `http://localhost:5175/?code=L0hRoAtRUYYpSOQAjaAaemF3bCJRJ00j`

## What We Tried

### 1. Schema Fix - Users table
**Issue:** Schema had `createdAt: v.number()` as required field, but @convex-dev/auth creates users without it.

**Fix:** Removed custom users table override, using plain `...authTables`:
```typescript
// convex/schema.ts
export default defineSchema({
  ...authTables,
  // other tables...
});
```
**Result:** Schema deployed successfully, user creation no longer fails.

### 2. Environment Variables - Wrong Port
**Issue:** Auth URLs pointed to port 5173 but app runs on 5175.

**Fix:**
```bash
npx convex env set SITE_URL "http://localhost:5175"
npx convex env set AUTH_URL "http://localhost:5175"
npx convex env set AUTH_REDIRECT_PROXY_URL "http://localhost:5175"
npx convex env set AUTH_RESEND_ISSUER "http://localhost:5175"
```
**Result:** Magic links now point to correct URL.

### 3. Duplicate Provider Wrapper
**Issue:** Had both ConvexAuthProvider AND ConvexProvider wrapping App.

**Fix:** Removed ConvexProvider, keeping only ConvexAuthProvider:
```typescript
// src/main.tsx
createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <App />
  </ConvexAuthProvider>
);
```
**Result:** No change in behavior.

### 4. Manual Code Handling
**Issue:** Tried manually handling the `?code=` parameter.

**Tried:**
```typescript
// In AuthenticatedApp component
useEffect(() => {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  if (code) {
    signIn("resend", { code })
      .then(() => { /* success */ })
      .catch((err) => { /* error */ });
  }
}, []);
```
**Result:** Same "Connection lost while action was in flight" error.

### 5. Prevent Double Execution
**Issue:** Suspected React double-rendering causing the action to be cancelled.

**Tried:**
- Module-level flag to prevent double calls
- Clearing URL immediately before calling signIn
- Empty dependency array in useEffect

**Result:** Same error persists.

### 6. Disable React StrictMode
**Issue:** StrictMode causes double-mounting which could cancel actions.

**Fix:** Removed StrictMode wrapper from main.tsx.

**Result:** Same error persists.

### 7. Let ConvexAuthProvider Handle Code Automatically
**Issue:** According to docs, ConvexAuthProvider should auto-handle `?code=` param.

**Fix:** Removed all custom code handling, relying on ConvexAuthProvider default behavior.

**Result:** Same error - "Connection lost while action was in flight"

---

## Current File States

### convex/schema.ts
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // sessions, messages, summaries tables...
});
```

### convex/auth.ts
```typescript
import { convexAuth } from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/Email";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Email({
      id: "resend",
      authorize: undefined, // Magic link behavior
      maxAge: 15 * 60,
      async sendVerificationRequest({ identifier: email, url }) {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Gap Finder <onboarding@resend.dev>",
            to: email,
            subject: "Sign in to Gap Finder",
            html: `<a href="${url}">Sign In</a>`,
          }),
        });
        if (!response.ok) throw new Error("Failed to send email");
      },
    }),
  ],
});
```

### convex/http.ts
```typescript
import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();
auth.addHttpRoutes(http);

export default http;
```

### src/main.tsx
```typescript
import { createRoot } from "react-dom/client";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import "./index.css";
import App from "./App.tsx";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <App />
  </ConvexAuthProvider>
);
```

---

## Convex Environment Variables Set

```
ANTHROPIC_API_KEY=sk-ant-...
AUTH_RESEND_KEY=re_5aCq8jiu_2bVbCkRWnzdim8ydeEudRaC1
AUTH_URL=http://localhost:5175
SITE_URL=http://localhost:5175
AUTH_REDIRECT_PROXY_URL=http://localhost:5175
AUTH_RESEND_ISSUER=http://localhost:5175
AUTH_SECRET=... (auto-generated)
JWKS=... (auto-generated)
JWT_PRIVATE_KEY=... (auto-generated)
```

---

## Steps to Reproduce

1. Go to http://localhost:5175/
2. Enter email address
3. Click "Send magic link"
4. Check email, click the magic link
5. Page shows "Loading..." then immediately shows sign-in form again
6. Browser console shows: "Connection lost while action was in flight"

---

## Expected Behavior

Clicking magic link should:
1. ConvexAuthProvider detects `?code=` parameter
2. Calls auth:signIn action to verify code
3. Session created, user authenticated
4. App shows authenticated state

## Actual Behavior

1. ConvexAuthProvider detects `?code=` parameter
2. Starts calling auth:signIn action
3. Action fails with "Connection lost while action was in flight"
4. User remains unauthenticated

---

## Possible Causes to Investigate

1. **Action timeout:** The signIn action might be taking too long
2. **WebSocket reconnection:** Something causing the Convex WebSocket to disconnect during verification
3. **Client-side routing conflict:** BrowserRouter might be interfering
4. **Race condition in ConvexAuthProvider:** The code handling might have a bug

---

## References

- [Convex Auth Docs](https://labs.convex.dev/auth)
- [Magic Links Setup](https://labs.convex.dev/auth/config/email)
- [ConvexAuthProvider API](https://labs.convex.dev/auth/api_reference/react)
