---
phase: 05-idea-card
plan: 02b
type: execute
wave: 3
depends_on: ["05-01", "05-02a"]
files_modified:
  - src/components/idea-card/hooks/useWordCloud.ts
  - src/components/idea-card/BlobWords.tsx
  - src/components/idea-card/IdeaCardContent.tsx
  - src/components/idea-card/hooks/useFitText.ts
  - src/components/idea-card/IdeaCard.tsx
  - src/components/idea-card/BlobBackground.tsx
autonomous: true

must_haves:
  truths:
    - "User sees words appear within blobs during phases 1-2"
    - "Words are positioned like fuzzy word cloud with mixed sizes"
    - "When Claude extracts idea (phase 3), blobs merge and words fade to idea sentence"
    - "Card content shows idea sentence prominently with supporting sentences"
    - "Card content updates when idea is refined in conversation"
  artifacts:
    - path: "src/components/idea-card/BlobWords.tsx"
      provides: "Word cloud overlay positioned within blob bounds"
      min_lines: 60
    - path: "src/components/idea-card/hooks/useWordCloud.ts"
      provides: "d3-cloud integration for word positioning"
      exports: ["useWordCloud"]
    - path: "src/components/idea-card/IdeaCardContent.tsx"
      provides: "Merged card content with dynamic text sizing"
      min_lines: 50
  key_links:
    - from: "src/components/idea-card/IdeaCard.tsx"
      to: "convex/ideas.ts"
      via: "useQuery for reactive card data"
      pattern: "useQuery\\(api\\.ideas"
    - from: "src/components/idea-card/BlobWords.tsx"
      to: "useWordCloud"
      via: "d3-cloud layout hook"
      pattern: "useWordCloud\\("
    - from: "src/components/idea-card/IdeaCard.tsx"
      to: "convex/ideas.ts"
      via: "extractIdeaContent triggered on message count changes"
      pattern: "extractIdeaContent.*messageCount"
---

<objective>
Add word cloud overlays to blobs and implement the merge animation that transforms scattered blobs into a cohesive idea card with content.

Purpose: This creates the "I can SEE my idea forming" moment. Words surface from conversation within blobs, then merge into a crystallized idea sentence when Claude extracts a coherent concept. The visual continuity from exploration to crystallization reinforces ownership.

Output: BlobWords component, merge animation, and IdeaCardContent displaying the crystallized idea.
</objective>

<execution_context>
@/Users/callesjoenell/.claude/get-shit-done/workflows/execute-plan.md
@/Users/callesjoenell/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/05-idea-card/05-CONTEXT.md
@.planning/phases/05-idea-card/05-RESEARCH.md
@.planning/phases/05-idea-card/05-01-SUMMARY.md
@.planning/phases/05-idea-card/05-02a-SUMMARY.md
@convex/ideas.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create word cloud hook and BlobWords component</name>
  <files>
    src/components/idea-card/hooks/useWordCloud.ts
    src/components/idea-card/BlobWords.tsx
  </files>
  <action>
Install d3-cloud: `npm install d3-cloud @types/d3-cloud`

Create `src/components/idea-card/hooks/useWordCloud.ts`:
- Export `useWordCloud(words: { text: string; size: number }[], bounds: { x, y, width, height })`
- Returns `{ layout: { text, x, y, size, rotate }[], isLoading: boolean }`
- Uses d3-cloud with:
  - `spiral('archimedean')` for positioning
  - `padding(5)` between words
  - `fontSize(d => d.size)` - sizes from 10-30 based on relevance
  - Handles empty words array gracefully
  - Cleanup on unmount to prevent memory leaks

Create `src/components/idea-card/BlobWords.tsx`:
- Props: `{ keywords: { word, area, relevance }[]; blobBounds: { x, y, width, height }[]; phase: number }`
- Only renders if phase >= 1 (words appear in phases 1-2)
- Groups keywords by area (0-5)
- For each area's blob bounds, run useWordCloud on that area's keywords
- Render SVG `<text>` elements with:
  - Position from layout
  - Opacity based on relevance (higher = more visible)
  - Color slightly whiter than blob color (from BLOB_COLORS with lightened variant)
  - Font size from layout
  - `<motion.text>` with fade-in animation (duration 2s)
- If phase >= 3, words fade out (opacity 0, duration 1.5s)
  </action>
  <verify>
`npm install` succeeds with d3-cloud
TypeScript compilation: `npx tsc --noEmit`
`grep -l "useWordCloud" src/components/idea-card/hooks/useWordCloud.ts`
  </verify>
  <done>
- d3-cloud installed and typed
- useWordCloud hook returns positioned words within blob bounds
- BlobWords renders words within each blob area
- Words fade in during phases 1-2, fade out at phase 3
  </done>
</task>

<task type="auto">
  <name>Task 2: Create IdeaCardContent and useFitText hook</name>
  <files>
    src/components/idea-card/IdeaCardContent.tsx
    src/components/idea-card/hooks/useFitText.ts
  </files>
  <action>
Create `src/components/idea-card/hooks/useFitText.ts`:
- Export `useFitText(containerRef: RefObject<HTMLElement>, content: string): number`
- Uses binary search to find largest font size that fits
- Min 12px, max 48px, precision 1px
- Uses useLayoutEffect to measure before paint
- Returns optimal fontSize

Create `src/components/idea-card/IdeaCardContent.tsx`:
- Props: `{ ideaSentence: string; supportingSentences: { text, areaIndex }[]; isVisible: boolean }`
- Only renders when isVisible (phase >= 3 and ideaSentence exists)
- Uses useFitText for idea sentence sizing
- Layout:
  - Idea sentence: bold, larger (from useFitText), dark gray, top position
  - Supporting sentences: smaller (14px), lighter gray, below
  - Each supporting sentence has subtle left border colored by area's blob color
- `<AnimatePresence>` wrapper for mount/unmount
- `<motion.div>` with fade-in (opacity 0->1, delay 1s after merge starts, duration 2s)
- Crossfade on content change (key={ideaSentence} triggers remount)
  </action>
  <verify>
TypeScript compilation: `npx tsc --noEmit`
`grep -l "useFitText" src/components/idea-card/hooks/useFitText.ts`
`grep -l "IdeaCardContent" src/components/idea-card/IdeaCardContent.tsx`
  </verify>
  <done>
- useFitText hook finds optimal font size via binary search
- IdeaCardContent displays idea sentence and supporting sentences
- AnimatePresence handles enter/exit animations
- Content crossfades when idea is refined
  </done>
</task>

<task type="auto">
  <name>Task 3: Wire merge animation and message-based extraction trigger into IdeaCard</name>
  <files>
    src/components/idea-card/BlobBackground.tsx
    src/components/idea-card/IdeaCard.tsx
  </files>
  <action>
Update `BlobBackground.tsx`:
- Add prop: `isMerging: boolean`
- When isMerging:
  - All blobs animate to center position
  - Blobs scale down slightly (0.7)
  - All blobs transition to same d path (merged shape)
  - Filter blur decreases (edges become crisp)
  - Transition duration 2.5s with easeInOut
- Use `<AnimatePresence mode="wait">` to sequence with content fade-in

Update `IdeaCard.tsx`:
- Add import: `import { useQuery, useMutation } from 'convex/react'`
- Add import: `import { api } from '../../convex/_generated/api'`
- Add import: `import { IdeaCardContent } from './IdeaCardContent'`
- Add import: `import { BlobWords } from './BlobWords'`

- Add query: `const ideaData = useQuery(api.ideas.getIdeaCard, { sessionId })`
- **Add message count query for CARD-06 (idea updates during refinement):**
  ```tsx
  const messages = useQuery(api.messages.list, { sessionId });
  const messageCount = messages?.length ?? 0;
  ```
- Pass keywords to BlobWords: `<BlobWords keywords={ideaData?.ideaKeywords ?? []} ... />`
- Compute merge state with edge case handling:
  ```tsx
  // Only merge if both phase >= 3 AND we have an actual idea sentence
  // This handles the case where extractIdeaContent runs but returns ideaReady=false
  const isMerging = currentPhase >= 3 && !!ideaData?.ideaSentence;
  ```
- Pass isMerging to BlobBackground: `<BlobBackground isMerging={isMerging} ... />`
- Render IdeaCardContent when isMerging is true:
  ```tsx
  {isMerging && ideaData?.ideaSentence && (
    <IdeaCardContent
      ideaSentence={ideaData.ideaSentence}
      supportingSentences={ideaData.supportingSentences ?? []}
      isVisible={isMerging}
    />
  )}
  ```
- Render BlobWords when phase 1-2 and not merging:
  ```tsx
  {!isMerging && currentPhase >= 1 && (
    <BlobWords
      keywords={ideaData?.ideaKeywords ?? []}
      blobBounds={blobBounds}
      phase={currentPhase}
    />
  )}
  ```
- **Trigger extractIdeaContent on BOTH phase changes AND message count changes (CARD-06):**
  ```tsx
  const extractIdea = useMutation(api.ideas.extractIdeaContent);

  // Track previous message count to detect new messages
  const prevMessageCountRef = useRef(messageCount);

  useEffect(() => {
    // Trigger extraction when:
    // 1. Phase changes to >= 1 (initial keyword extraction)
    // 2. New messages arrive (idea refinement during conversation)
    const hasNewMessages = messageCount > prevMessageCountRef.current;

    if (currentPhase >= 1 && (hasNewMessages || prevMessageCountRef.current === 0)) {
      extractIdea({ sessionId });
    }

    prevMessageCountRef.current = messageCount;
  }, [currentPhase, messageCount, sessionId, extractIdea]);
  ```
  This ensures the idea card updates when:
  - User enters phase 1+ for the first time
  - User sends a new message that refines the idea
  - AI responds with new insights
  </action>
  <verify>
TypeScript compilation: `npx tsc --noEmit`
`npm run build` succeeds
`grep -l "useQuery.*api.ideas" src/components/idea-card/IdeaCard.tsx` confirms Convex wiring
`grep -l "isMerging" src/components/idea-card/BlobBackground.tsx` confirms merge prop
`grep -l "messageCount" src/components/idea-card/IdeaCard.tsx` confirms message-based trigger
Visual check: Merge animation triggers when ideaSentence is set
Visual check: Send new message in phase 3+, card content should update within a few seconds
  </verify>
  <done>
- BlobBackground merge animation moves blobs to center when isMerging=true
- IdeaCard imports and wires all required components and Convex queries
- Edge case handled: phase >= 3 but no ideaSentence prevents premature merge
- Convex reactive query updates card when idea is extracted
- BlobWords shown in phases 1-2, IdeaCardContent shown when merged
- **Message-based extraction trigger ensures card updates during conversation refinement (CARD-06)**
  </done>
</task>

</tasks>

<verification>
Overall plan verification:
1. `npm run build` completes without errors
2. Words appear in blobs during phases 1-2 (positioned by d3-cloud)
3. Merge animation triggers when Claude extracts idea sentence (not just when phase >= 3)
4. Idea card content displays with proper hierarchy (sentence > supporting)
5. Content updates reactively when conversation refines idea (new messages trigger re-extraction)
</verification>

<success_criteria>
1. Keywords extracted from conversation appear as words within blob bounds
2. Words positioned by d3-cloud algorithm without overlapping excessively
3. Words fade in during phases 1-2 with subtle animation
4. When ideaSentence is set, blobs merge to center with smooth animation
5. Edge case: phase >= 3 but ideaSentence null does NOT trigger merge
6. Words fade out during merge, idea sentence fades in after
7. Idea card content shows sentence prominently with supporting sentences below
8. Content updates via Convex reactive query when idea is refined
9. Dynamic text sizing ensures content always fits container
10. **Message-based trigger: new messages during phases 1+ trigger re-extraction (CARD-06)**
</success_criteria>

<output>
After completion, create `.planning/phases/05-idea-card/05-02b-SUMMARY.md`
</output>
