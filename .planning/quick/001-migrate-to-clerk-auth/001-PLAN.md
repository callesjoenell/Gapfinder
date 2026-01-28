---
phase: quick
plan: 001
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - convex/schema.ts
  - convex/auth.ts
  - convex/auth.config.ts
  - convex/http.ts
  - convex/sessions.ts
  - convex/messages.ts
  - convex/summaries.ts
  - src/main.tsx
  - src/App.tsx
  - src/components/auth/SignIn.tsx
  - src/components/auth/AuthCallback.tsx
autonomous: false
user_setup:
  - service: clerk
    why: "Authentication provider"
    account_setup:
      - task: "Create Clerk account"
        url: "https://clerk.com"
      - task: "Create Clerk application"
        location: "Dashboard -> Create application"
    env_vars:
      - name: CLERK_PUBLISHABLE_KEY
        source: "Clerk Dashboard -> API Keys -> Publishable key"
        target: ".env.local (VITE_CLERK_PUBLISHABLE_KEY)"
      - name: CLERK_SECRET_KEY
        source: "Clerk Dashboard -> API Keys -> Secret key"
        target: "Convex env var"
      - name: CLERK_JWT_ISSUER_DOMAIN
        source: "Clerk Dashboard -> JWT Templates -> convex template -> Issuer"
        target: "convex/auth.config.ts"
    dashboard_config:
      - task: "Create JWT Template for Convex"
        location: "Clerk Dashboard -> JWT Templates -> New template -> Convex"
        note: "Copy the Issuer URL for auth.config.ts"
---

<objective>
Replace @convex-dev/auth magic link authentication with Clerk authentication.

Purpose: Magic link auth via Resend is unreliable. Clerk provides a production-ready auth solution with built-in UI components, social login support, and official Convex integration.

Output: Working Clerk authentication with email/password and Google login options.
</objective>

<execution_context>
@/Users/callesjoenell/.claude/get-shit-done/workflows/execute-plan.md
@/Users/callesjoenell/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@convex/schema.ts
@convex/auth.ts
@convex/sessions.ts
@convex/messages.ts
@src/main.tsx
@src/App.tsx
@src/components/auth/SignIn.tsx
</context>

<tasks>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 1: Set up Clerk account and application</name>
  <action>
User must complete these steps manually before Claude can continue:

1. **Create Clerk account** (if you don't have one):
   - Go to https://clerk.com
   - Sign up for free account

2. **Create Clerk application**:
   - In Clerk Dashboard, click "Create application"
   - Name it "Gap Finder" (or similar)
   - Enable authentication methods: Email, Google (recommended)
   - Click Create

3. **Get API keys**:
   - Go to API Keys in sidebar
   - Copy **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - Copy **Secret key** (starts with `sk_test_` or `sk_live_`)

4. **Create JWT Template for Convex**:
   - Go to JWT Templates in sidebar
   - Click "New template"
   - Select "Convex" from the list
   - Copy the **Issuer** URL (looks like `https://your-app.clerk.accounts.dev`)
   - Click Apply Changes

5. **Set environment variables**:

   Create `.env.local` in project root with:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

   Set Convex environment variable:
   ```bash
   npx convex env set CLERK_SECRET_KEY sk_test_your_key_here
   ```

6. **Tell Claude the Issuer URL** when prompted so it can configure auth.config.ts
  </action>
  <verify>User confirms they have completed setup and provides the Clerk Issuer URL</verify>
  <done>Clerk application exists with JWT Template configured, API keys set in environment</done>
  <resume-signal>Reply with "done" and your Clerk Issuer URL (e.g., https://your-app.clerk.accounts.dev)</resume-signal>
</task>

<task type="auto">
  <name>Task 2: Remove @convex-dev/auth and install Clerk packages</name>
  <files>package.json</files>
  <action>
1. Remove @convex-dev/auth packages:
   ```bash
   npm uninstall @convex-dev/auth @auth/core resend
   ```

2. Install Clerk packages:
   ```bash
   npm install @clerk/clerk-react @clerk/backend
   ```

3. Verify package.json no longer contains @convex-dev/auth, @auth/core, or resend
  </action>
  <verify>npm install completes without errors; package.json shows @clerk/clerk-react and @clerk/backend</verify>
  <done>Old auth packages removed, Clerk packages installed</done>
</task>

<task type="auto">
  <name>Task 3: Update Convex backend for Clerk auth</name>
  <files>
    convex/auth.config.ts
    convex/auth.ts
    convex/http.ts
    convex/schema.ts
    convex/sessions.ts
    convex/messages.ts
    convex/summaries.ts
  </files>
  <action>
**convex/auth.config.ts** - Configure Clerk JWT validation:
```typescript
export default {
  providers: [
    {
      domain: "USER_PROVIDED_ISSUER_URL", // e.g., https://your-app.clerk.accounts.dev
      applicationID: "convex",
    },
  ],
};
```

**convex/auth.ts** - Replace with Clerk auth helper:
```typescript
import { query, QueryCtx, MutationCtx } from "./_generated/server";

// Helper to get authenticated user ID from Clerk JWT
export async function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  // Clerk provides subject as the user ID
  return identity.subject;
}

// Get current user info (from Clerk token)
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return {
      id: identity.subject,
      email: identity.email,
      name: identity.name,
    };
  },
});
```

**convex/http.ts** - Remove auth routes (Clerk handles auth externally):
```typescript
import { httpRouter } from "convex/server";

const http = httpRouter();

// No auth routes needed - Clerk handles authentication externally

export default http;
```

**convex/schema.ts** - Remove authTables, add simple users table:
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Simple users table - stores Clerk user ID reference
  users: defineTable({
    clerkId: v.string(), // Clerk user ID (subject from JWT)
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  sessions: defineTable({
    userId: v.string(), // Now stores Clerk user ID (string, not Id<"users">)
    name: v.string(),
    currentPhase: v.number(),
    path: v.union(v.literal("exploration"), v.literal("evaluation")),
    isPaid: v.boolean(),
    isDeleted: v.boolean(),
    ideaCardContent: v.optional(v.string()),
    ideaCardScore: v.optional(v.number()),
    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isDeleted", "lastActiveAt"]),

  messages: defineTable({
    sessionId: v.id("sessions"),
    phase: v.number(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.number(),
  })
    .index("by_session", ["sessionId", "timestamp"])
    .index("by_session_phase", ["sessionId", "phase", "timestamp"]),

  summaries: defineTable({
    sessionId: v.id("sessions"),
    phase: v.number(),
    completedAt: v.number(),
    data: v.object({
      keyFindings: v.array(v.string()),
      unfairAdvantages: v.array(v.string()),
      decisions: v.array(v.string()),
      energySignals: v.array(v.string()),
    }),
  }).index("by_session", ["sessionId", "phase"]),
});
```

**convex/sessions.ts** - Update to use getAuthUserId:
- Replace `import { auth } from "./auth"` with `import { getAuthUserId } from "./auth"`
- Replace all `await auth.getUserId(ctx)` with `await getAuthUserId(ctx)`
- Change `userId: v.id("users")` validation to `userId: v.string()` (Clerk IDs are strings)

**convex/messages.ts** - Update to use getAuthUserId:
- Replace `import { auth } from "./auth"` with `import { getAuthUserId } from "./auth"`
- Replace all `await auth.getUserId(ctx)` with `await getAuthUserId(ctx)`

**convex/summaries.ts** - Update if it uses auth:
- Check if file imports from auth.ts and update similarly
  </action>
  <verify>npx convex dev shows no TypeScript errors; Convex deployment succeeds</verify>
  <done>Convex backend configured for Clerk JWT validation</done>
</task>

<task type="auto">
  <name>Task 4: Update React frontend for Clerk</name>
  <files>
    src/main.tsx
    src/App.tsx
    src/components/auth/SignIn.tsx
    src/components/auth/AuthCallback.tsx
  </files>
  <action>
**src/main.tsx** - Replace ConvexAuthProvider with ClerkProvider:
```typescript
import { createRoot } from "react-dom/client";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App.tsx";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string}>
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <App />
    </ConvexProviderWithClerk>
  </ClerkProvider>
);
```

**src/App.tsx** - Replace useConvexAuth with Clerk hooks:
```typescript
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth, SignIn, SignOutButton, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { Layout } from "./components/layout/Layout";
import { Chat } from "./components/Chat";
import { NewSessionModal } from "./components/NewSessionModal";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<AuthenticatedApp />} />
      </Routes>
    </BrowserRouter>
  );
}

function AuthenticatedApp() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Sign in to Gap Finder
          </h2>
          <SignIn routing="hash" />
        </div>
      </div>
    );
  }

  return <MainApp />;
}

function MainApp() {
  const { user } = useUser();
  const [currentSessionId, setCurrentSessionId] = useState<Id<"sessions"> | null>(null);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);

  const session = useQuery(
    api.sessions.getSession,
    currentSessionId ? { sessionId: currentSessionId } : "skip"
  );

  const sessions = useQuery(api.sessions.listSessions);

  useEffect(() => {
    if (!currentSessionId && sessions && sessions.length > 0) {
      setCurrentSessionId(sessions[0]._id);
    }
  }, [currentSessionId, sessions]);

  return (
    <>
      <Layout
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewSession={() => setShowNewSessionModal(true)}
      >
        {session ? (
          <Chat
            sessionId={session._id}
            currentPhase={session.currentPhase}
            sessionPath={session.path}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-lg">No session selected</p>
              <button
                onClick={() => setShowNewSessionModal(true)}
                className="mt-4 text-primary-600 hover:text-primary-700"
              >
                Create your first session
              </button>
            </div>
          </div>
        )}
      </Layout>

      <NewSessionModal
        isOpen={showNewSessionModal}
        onClose={() => setShowNewSessionModal(false)}
        onCreated={(sessionId) => {
          setCurrentSessionId(sessionId as Id<"sessions">);
        }}
      />

      <div className="fixed bottom-4 right-4">
        <SignOutButton>
          <button className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200">
            Sign out
          </button>
        </SignOutButton>
      </div>
    </>
  );
}

export default App;
```

**Delete or empty these files** (no longer needed):
- `src/components/auth/SignIn.tsx` - Delete (Clerk provides SignIn component)
- `src/components/auth/AuthCallback.tsx` - Delete (Clerk handles callbacks)
  </action>
  <verify>npm run dev starts without errors; visiting localhost shows Clerk sign-in UI</verify>
  <done>Frontend uses Clerk for authentication</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 5: Verify Clerk authentication works</name>
  <what-built>Complete Clerk authentication replacing magic link auth</what-built>
  <how-to-verify>
1. Open http://localhost:5173 in browser
2. You should see Clerk's sign-in UI (not the old magic link form)
3. Sign in with email/password or Google
4. After sign in, you should see the main app with session list
5. Create a new session - it should save to your Clerk user ID
6. Sign out and sign back in - your session should still be there
7. Check Convex dashboard - sessions should have string userId (Clerk ID)
  </how-to-verify>
  <resume-signal>Type "approved" or describe any issues</resume-signal>
</task>

</tasks>

<verification>
- [ ] No @convex-dev/auth, @auth/core, or resend in package.json
- [ ] @clerk/clerk-react and @clerk/backend in package.json
- [ ] Convex auth.config.ts has Clerk domain configured
- [ ] Frontend shows Clerk sign-in UI
- [ ] Sign in flow completes successfully
- [ ] Sessions are associated with Clerk user ID
- [ ] Sign out works
</verification>

<success_criteria>
- Users can sign in via Clerk (email/password or social login)
- Authenticated users can create and view sessions
- Sessions persist across sign-out/sign-in
- No magic link code remains in codebase
</success_criteria>

<output>
After completion, create `.planning/quick/001-migrate-to-clerk-auth/001-SUMMARY.md`
</output>
