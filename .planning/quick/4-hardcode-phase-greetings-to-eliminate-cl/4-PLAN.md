---
phase: quick-4
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/phaseConfig.ts
  - src/components/Chat.tsx
autonomous: true
must_haves:
  truths:
    - "New session shows a deterministic greeting without any Claude API call"
    - "Greeting text matches the current phase name and context"
    - "No 'Let's get started!' user message appears in chat"
    - "Phase 3 evaluation-path sessions greet with correct phase identity"
  artifacts:
    - path: "src/lib/phaseConfig.ts"
      provides: "greeting field on PhaseConfig with per-phase text"
      contains: "greeting"
    - path: "src/components/Chat.tsx"
      provides: "Direct saveMessage call instead of sendMessage for auto-greeting"
      pattern: "saveMessage"
  key_links:
    - from: "src/components/Chat.tsx"
      to: "src/lib/phaseConfig.ts"
      via: "getPhaseConfig(currentPhase).greeting"
      pattern: "getPhaseConfig.*greeting"
    - from: "src/components/Chat.tsx"
      to: "convex/messages.ts saveMessage mutation"
      via: "useMutation(api.messages.saveMessage)"
      pattern: "saveMessage.*assistant.*greeting"
---

<objective>
Replace the auto-greeting Claude API call with hardcoded phase-specific greeting messages to eliminate hallucination risk.

Purpose: The current flow sends "Let's get started!" to Claude, which can hallucinate the wrong phase. Hardcoded greetings are deterministic and instant.
Output: Phase-specific greetings saved directly as assistant messages with zero API calls.
</objective>

<execution_context>
@/Users/callesjoenell/.claude/get-shit-done/workflows/execute-plan.md
@/Users/callesjoenell/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/phaseConfig.ts
@src/components/Chat.tsx
@src/hooks/useStreamingChat.ts
@convex/messages.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add greeting field to PhaseConfig and populate all 10 phases</name>
  <files>src/lib/phaseConfig.ts</files>
  <action>
Add `greeting: string` to the `PhaseConfig` interface.

Add a `greeting` field to each of the 10 phase entries in the PHASES array. Greetings should be conversational, 2-3 sentences, and clearly reference the phase name and purpose. They must NOT reference previous phases the user may not have completed (especially for Phase 3, which is the evaluation-path entry point).

Greeting content:

- Phase 0 (Know Yourself): "Welcome to Start Building Now! I'm here to help you discover your unfair advantages. Let's start by exploring your background -- your experiences, skills, and networks -- to find where your real edge lies."
- Phase 1 (Find Gaps): "Now that you know your strengths, let's put them to work. In this phase, we'll research your domain to find gaps worth filling -- problems to solve or experiences to create that connect to your unfair advantage."
- Phase 2 (Research): "Time to validate with evidence. We'll look for real data points -- market signals, competitor gaps, and customer behavior -- to confirm your gap is worth pursuing."
- Phase 3 (Your Idea): "Welcome! Let's crystallize your idea into something clear and compelling. We'll work together to define exactly who this is for, what it solves or makes possible, and why you're the right person to build it."
- Phase 4 (Customers): "Let's get specific about who your customers are. We'll move from broad descriptions to real individuals you can actually reach and talk to."
- Phase 5 (Problem): "Time to validate with real conversations. Let's debrief what you learned from talking to potential customers and confirm the need is strong enough to build for."
- Phase 6 (Solution): "Now let's design the solution. We'll figure out the smallest thing you can build that delivers the core value -- your MVP."
- Phase 7 (Score): "Let's honestly assess your idea across key dimensions. We'll score each area and identify your biggest strengths and weaknesses."
- Phase 8 (Refine): "Let's sharpen your idea. We'll focus on your lowest scores and turn weaknesses into action plans."
- Phase 9 (Launch): "This is it -- let's create your launch plan. We'll define your next concrete actions, timeline, and the one metric that matters."

These are guidelines -- adjust wording slightly for natural flow, but preserve the phase name reference and core framing in each.
  </action>
  <verify>Run `npx tsc --noEmit` from project root -- no type errors. Grep for `greeting:` in phaseConfig.ts to confirm all 10 entries have the field.</verify>
  <done>PhaseConfig interface has `greeting: string` field, all 10 PHASES entries have phase-specific greeting text.</done>
</task>

<task type="auto">
  <name>Task 2: Replace sendMessage auto-greeting with direct saveMessage call in Chat.tsx</name>
  <files>src/components/Chat.tsx</files>
  <action>
Modify Chat.tsx to:

1. Add import: `import { useMutation } from "convex/react"` and `import { api } from "../../convex/_generated/api"` (api may already be available transitively -- check). Also import `getPhaseConfig` from `../lib/phaseConfig`.

2. Inside the Chat component, add: `const saveMessage = useMutation(api.messages.saveMessage);`

3. Replace the auto-greeting useEffect (lines 84-95) with:

```tsx
useEffect(() => {
  if (
    messages !== undefined &&
    messages.length === 0 &&
    !isStreaming &&
    !hasAutoGreeted.current
  ) {
    hasAutoGreeted.current = true;
    const phaseConfig = getPhaseConfig(currentPhase);
    if (phaseConfig) {
      saveMessage({
        sessionId,
        phase: currentPhase,
        role: "assistant",
        content: phaseConfig.greeting,
      });
    }
  }
}, [messages, isStreaming, saveMessage, sessionId, currentPhase]);
```

Key changes:
- No more `sendMessage("Let's get started!")` -- no user message, no Claude API call
- Directly saves an assistant message with the hardcoded greeting
- Uses `saveMessage` mutation (same one useStreamingChat uses internally)
- The `sendMessage` dependency is removed from this useEffect

Do NOT modify useStreamingChat.ts -- we import useMutation + api directly in Chat.tsx to keep the hook's API unchanged.
  </action>
  <verify>
1. `npx tsc --noEmit` passes with no errors.
2. Start dev server (`npx convex dev` + `npm run dev`), create a new session. Verify:
   - No "Let's get started!" user message appears
   - An assistant greeting appears immediately matching the phase
   - No Claude API call is made (check network tab or Convex dashboard logs)
  </verify>
  <done>New sessions show a deterministic phase-specific greeting as an assistant message. No user message is created. No Claude API call is triggered. Phase 3 evaluation-path sessions correctly show "Your Idea" greeting.</done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes
- New exploration-path session (Phase 0) shows Phase 0 greeting immediately
- New evaluation-path session (Phase 3) shows Phase 3 greeting with correct "Your Idea" framing
- No network request to Claude API on session creation
- Existing sessions with messages are unaffected (useEffect only fires when messages.length === 0)
</verification>

<success_criteria>
- Zero Claude API calls for greeting generation
- Greeting text is deterministic and phase-specific
- No "Let's get started!" user message in new sessions
- Phase 3 correctly identifies itself (no hallucination possible)
</success_criteria>

<output>
After completion, create `.planning/quick/4-hardcode-phase-greetings-to-eliminate-cl/4-SUMMARY.md`
</output>
