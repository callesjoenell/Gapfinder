---
phase: quick-2
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/PathOverview.tsx
  - src/App.tsx
autonomous: true
requirements: []

must_haves:
  truths:
    - After creating a session, user sees path overview in main content area (not chat)
    - Overview shows all phases for the selected path with descriptions
    - User can click Start button to begin conversation
    - After clicking Start, chat loads and blobs start emerging
  artifacts:
    - path: "src/components/PathOverview.tsx"
      provides: "Path overview component with phase breakdown and Start button"
      min_lines: 80
    - path: "src/App.tsx"
      provides: "State management for showing overview vs chat"
      contains: "PathOverview"
  key_links:
    - from: "src/App.tsx"
      to: "src/components/PathOverview.tsx"
      via: "conditional render based on session.hasStarted"
      pattern: "hasStarted.*PathOverview"
    - from: "src/components/PathOverview.tsx"
      to: "convex mutation"
      via: "Start button triggers markSessionStarted"
      pattern: "markSessionStarted"
---

<objective>
Add path overview screen between session creation and chat start. When a user creates a new session, show a comprehensive breakdown of what to expect in each stage with a Start button, then load the chat when they're ready.

Purpose: Give users context about the journey before diving in, making the experience more intentional.
Output: PathOverview component that displays in main content area, updated App.tsx to manage overview/chat state.
</objective>

<execution_context>
@/Users/callesjoenell/.claude/get-shit-done/workflows/execute-plan.md
@/Users/callesjoenell/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@/Users/callesjoenell/Documents/GapFinder/src/App.tsx
@/Users/callesjoenell/Documents/GapFinder/src/components/Chat.tsx
@/Users/callesjoenell/Documents/GapFinder/src/lib/phaseConfig.ts
@/Users/callesjoenell/Documents/GapFinder/src/components/OnboardingView.tsx
</context>

<tasks>

<task type="auto">
  <name>Create PathOverview component with phase breakdown</name>
  <files>src/components/PathOverview.tsx</files>
  <action>
Create PathOverview.tsx component that:
- Accepts props: sessionId, sessionPath ("exploration" | "evaluation"), onStart callback
- Uses getPhaseByPath(sessionPath) from phaseConfig.ts to get phase list
- Displays centered layout matching OnboardingView style (max-w-3xl mx-auto)
- Shows title based on path: "Your Exploration Journey" or "Your Evaluation Journey"
- Lists all phases with: phase number, name, description, timeEstimate (from phaseConfig)
- Uses Tailwind styling consistent with existing components (gray-900 headings, gray-600 body text, primary-500 accent)
- Includes prominent "Start Conversation" button at bottom
- Button calls onStart() when clicked
- Design: Clean, readable, matches the aesthetic of OnboardingView (white cards, rounded corners, proper spacing)
  </action>
  <verify>Component file exists, imports from phaseConfig work, TypeScript compiles without errors</verify>
  <done>PathOverview.tsx created with phase list rendering and Start button</done>
</task>

<task type="auto">
  <name>Add session state and integrate PathOverview into App.tsx</name>
  <files>src/App.tsx</files>
  <action>
Update App.tsx to show PathOverview before Chat:
1. Check if session has a `hasStarted` field in the session query result
2. If session exists but hasStarted is false/undefined, render PathOverview instead of Chat
3. Import PathOverview component
4. Pass sessionId, sessionPath, and onStart callback to PathOverview
5. onStart should call a Convex mutation to mark session as started, then the UI will automatically switch to Chat when session.hasStarted becomes true

Note: The session schema likely doesn't have hasStarted yet. For this quick task, check the session object structure. If hasStarted doesn't exist, we'll use a simpler approach: track in component state whether user clicked Start (useState). When PathOverview mounted for first time (check if messages.length === 0), show it. After Start clicked, set local state and show Chat. This avoids schema changes.

Revised approach:
- Add useState showOverview with default based on messages.length === 0
- When session loads and has 0 messages, show PathOverview
- PathOverview's onStart sets showOverview(false)
- This keeps overview isolated to truly new sessions without backend changes
  </action>
  <verify>npm run dev starts without errors, can create new session and see PathOverview</verify>
  <done>App shows PathOverview for new sessions (0 messages), Chat appears after Start button clicked</done>
</task>

<task type="auto">
  <name>Verify flow end-to-end</name>
  <files>src/App.tsx, src/components/PathOverview.tsx</files>
  <action>
Test complete user flow:
1. Start dev server (npm run dev)
2. Create new exploration session via NewSessionModal
3. Verify PathOverview displays with all exploration phases (Know Yourself, Find Gaps, Research)
4. Verify phase descriptions and time estimates show correctly
5. Click "Start Conversation" button
6. Verify Chat component loads and conversation can begin
7. Repeat for evaluation path to confirm both paths work

Check browser console for errors. Verify styling matches existing design language. Ensure smooth transition from overview to chat.
  </action>
  <verify>Manual testing: create session → see overview → click Start → chat loads. No console errors.</verify>
  <done>Complete flow works for both exploration and evaluation paths</done>
</task>

</tasks>

<verification>
- [ ] PathOverview.tsx component created with all phase info from phaseConfig
- [ ] App.tsx conditionally renders PathOverview for new sessions
- [ ] Start button triggers transition to Chat
- [ ] Both exploration and evaluation paths show correct phases
- [ ] Styling matches existing design patterns
- [ ] No TypeScript or console errors
</verification>

<success_criteria>
User creating a new session sees path overview screen in main content area, reads through phase descriptions, clicks Start, and then Chat loads. The overview acts as the starting point where idea card blobs will eventually emerge from.
</success_criteria>

<output>
After completion, create `.planning/quick/2-show-path-overview-with-stage-descriptio/2-SUMMARY.md`
</output>
