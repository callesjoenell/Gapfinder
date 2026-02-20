---
phase: quick
plan: 3
type: execute
wave: 1
depends_on: []
files_modified:
  - src/hooks/useResizableSplit.ts
  - src/components/ResizeDivider.tsx
  - src/components/Chat.tsx
  - src/components/idea-card/IdeaCard.tsx
autonomous: true
requirements: []

must_haves:
  truths:
    - "User can drag a divider between IdeaCard and chat to resize the split"
    - "Drag position persists across page reloads via localStorage"
    - "IdeaCard contents (blobs, words, text) scale correctly at any split ratio"
    - "Collapse toggle still works and overrides the split when collapsed"
  artifacts:
    - path: "src/hooks/useResizableSplit.ts"
      provides: "Resizable split hook with drag tracking and localStorage persistence"
    - path: "src/components/ResizeDivider.tsx"
      provides: "Visual draggable divider component"
  key_links:
    - from: "src/components/Chat.tsx"
      to: "src/hooks/useResizableSplit.ts"
      via: "useResizableSplit hook providing splitRatio and drag handlers"
    - from: "src/components/Chat.tsx"
      to: "src/components/idea-card/IdeaCard.tsx"
      via: "height prop replacing fixed h-[50vh]"
---

<objective>
Add a draggable divider between IdeaCard and the chat area, replacing the fixed 50vh split with a user-resizable layout. Persist the split ratio in localStorage.

Purpose: Users need to control how much screen space is devoted to the idea visualization vs the chat conversation.
Output: Working draggable divider with persistence, responsive content.
</objective>

<execution_context>
@/Users/callesjoenell/.claude/get-shit-done/workflows/execute-plan.md
@/Users/callesjoenell/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/Chat.tsx
@src/components/idea-card/IdeaCard.tsx
@src/components/idea-card/BlobBackground.tsx
@src/components/idea-card/BlobWords.tsx
@src/components/idea-card/IdeaCardContent.tsx
@src/components/PhaseProgressBar.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create useResizableSplit hook and ResizeDivider component</name>
  <files>src/hooks/useResizableSplit.ts, src/components/ResizeDivider.tsx</files>
  <action>
Create `src/hooks/useResizableSplit.ts`:
- Accept a containerRef (RefObject<HTMLDivElement>) pointing to the Chat flex-col container
- Store split ratio (0.0-1.0, default 0.5) in localStorage key `ideaCard-splitRatio`
- Track dragging state with pointer events (pointerdown on divider, pointermove/pointerup on document)
- On pointermove: calculate ratio = (clientY - containerRect.top) / containerRect.height, clamp between 0.15 and 0.70
- Return { splitRatio, isDragging, dividerProps: { onPointerDown } }
- Use useCallback for handlers, cleanup listeners on unmount
- Use `useLocalStorage` from `react-use` (already in dependencies) for persistence

Create `src/components/ResizeDivider.tsx`:
- Render a thin horizontal bar (h-1.5 or h-2) with a visible grab handle in the center
- Style: bg-gray-200 hover:bg-gray-300, cursor-row-resize, with a small centered pill shape (w-10 h-1 rounded-full bg-gray-400)
- When dragging (isDragging prop), apply bg-blue-300 to indicate active state
- Accept onPointerDown handler from the hook
- Add touch-action: none CSS to prevent scroll interference on mobile
- Ensure the divider sits between IdeaCard and PhaseProgressBar in the layout
  </action>
  <verify>TypeScript compiles: `npx tsc --noEmit --pretty 2>&1 | head -30`</verify>
  <done>Hook and component exist, type-check passes, hook manages ratio state with localStorage persistence and pointer event tracking</done>
</task>

<task type="auto">
  <name>Task 2: Wire resizable split into Chat layout and update IdeaCard</name>
  <files>src/components/Chat.tsx, src/components/idea-card/IdeaCard.tsx</files>
  <action>
In `src/components/Chat.tsx`:
- Add a ref for the outer flex-col container: `const chatContainerRef = useRef<HTMLDivElement>(null)` and attach to the root div
- Import and call `useResizableSplit(chatContainerRef)`
- Import `ResizeDivider` component
- Pass a `height` prop to IdeaCard computed as: if IdeaCard is collapsed, use undefined (IdeaCard handles its own h-16); otherwise use splitRatio as a fraction
- Insert `<ResizeDivider>` between IdeaCard and PhaseProgressBar, passing dividerProps and isDragging
- Apply height via inline style on IdeaCard's wrapper: `style={{ height: isCollapsed ? undefined : \`${splitRatio * 100}%\` }}`
- Actually, since IdeaCard manages its own collapse state internally, the cleaner approach is: pass `splitRatio` to IdeaCard and let it use that instead of h-[50vh]. Add `splitRatio?: number` prop to IdeaCard.

In `src/components/idea-card/IdeaCard.tsx`:
- Add `splitRatio?: number` and `onCollapseChange?: (collapsed: boolean) => void` props
- Replace `h-[50vh]` class with inline style: `style={{ height: isCollapsed ? '4rem' : \`${(splitRatio ?? 0.5) * 100}%\` }}`
- Keep the transition-all duration-300 class for smooth animation on collapse toggle
- IMPORTANT: In the useLayoutEffect that measures dimensions, add splitRatio to the dependency array so dimensions re-measure when the user drags the divider
- Call `onCollapseChange?.(isCollapsed)` when collapse state changes so Chat.tsx can hide/show the divider appropriately

Back in `src/components/Chat.tsx`:
- Track IdeaCard collapse state: `const [ideaCollapsed, setIdeaCollapsed] = useState(false)`
- Pass `onCollapseChange={setIdeaCollapsed}` to IdeaCard
- Only show ResizeDivider when `!ideaCollapsed`

Note on responsiveness: BlobBackground and BlobWords both use SVG viewBox="0 0 800 600" with preserveAspectRatio="xMidYMid meet", so they scale automatically to any container size. The hardcoded blobBounds in IdeaCard are in viewBox coordinates (not pixel coordinates), so they remain correct at any container size. IdeaCardContent uses useFitText which re-measures on container resize. No changes needed to these child components.
  </action>
  <verify>
1. `npx tsc --noEmit --pretty 2>&1 | head -30` passes
2. `npm run build 2>&1 | tail -20` succeeds
3. Manual: Open app, drag divider up and down, IdeaCard resizes smoothly, blobs scale, reload page and split ratio is restored
  </verify>
  <done>
- Dragging the divider resizes IdeaCard between 15% and 70% of container height
- Split ratio persists in localStorage and restores on reload
- Collapse toggle still works (shrinks to h-16, hides divider)
- BlobBackground, BlobWords, and IdeaCardContent render correctly at any split ratio
  </done>
</task>

</tasks>

<verification>
- App compiles and builds without errors
- Divider is visible between IdeaCard and PhaseProgressBar
- Dragging divider up/down resizes the IdeaCard area smoothly
- Releasing divider saves ratio to localStorage
- Refreshing page restores the saved ratio
- Collapse/expand button still works correctly
- Blob SVGs scale properly at small and large IdeaCard sizes
- Chat MessageList takes remaining space below divider
</verification>

<success_criteria>
Users can drag the divider to customize the IdeaCard/chat split. The split persists across sessions. All IdeaCard visual content (blobs, words, idea text) renders correctly at any size.
</success_criteria>

<output>
After completion, create `.planning/quick/3-implement-movable-divider-between-chat-a/3-SUMMARY.md`
</output>
