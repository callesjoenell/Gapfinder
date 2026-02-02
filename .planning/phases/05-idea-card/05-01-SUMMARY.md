---
phase: 05-idea-card
plan: 01
subsystem: ui
tags: [svg, animation, framer-motion, react, gpu-acceleration, responsive-design]

# Dependency graph
requires:
  - phase: 04-phase-system
    provides: Phase tracking and currentPhase state management
provides:
  - 6 organic SVG blobs with gradient edges and color blending
  - GPU-accelerated drift animation with centripetal convergence
  - Phase-based edge clarity progression (1% to 80%)
  - Responsive collapsible card container (40vh mobile, 25vh desktop)
  - Blob shape utilities with seed-based reproducibility
affects: [05-02, idea-card-word-overlay, idea-card-merge]

# Tech tracking
tech-stack:
  added: [framer-motion]
  patterns:
    - SVG path generation with seeded randomness for reproducible shapes
    - GPU-accelerated animations via transform/opacity only
    - Motion animate prop for declarative animations
    - useLayoutEffect for DOM measurements before paint
    - Centripetal convergence via linear interpolation toward center point

key-files:
  created:
    - src/components/idea-card/utils/blobShapes.ts
    - src/components/idea-card/hooks/useBlobAnimation.ts
    - src/components/idea-card/BlobBackground.tsx
    - src/components/idea-card/IdeaCard.tsx
    - src/components/idea-card/index.ts
  modified: []

key-decisions:
  - "6 blob seeds for consistent shape generation across renders"
  - "Convergence factor 0.15 per phase for gradual drift toward center"
  - "60-second animation cycle for glacial motion"
  - "Mix-blend-mode multiply for color blending on overlaps"
  - "Dynamic blur stdDeviation based on edge clarity (30 - edgeClarity * 25)"

patterns-established:
  - "Blob animation pattern: static positions from hook, drift via Motion animate prop"
  - "SVG filter pattern: define once in defs, reference with url(#id)"
  - "Responsive card pattern: vh units with Tailwind md: breakpoint"
  - "Accessibility pattern: useReducedMotion hook respects prefers-reduced-motion"

# Metrics
duration: 3min
completed: 2026-02-02
---

# Phase 5 Plan 1: Blob Rendering Foundation Summary

**6 organic SVG blobs with gradient edges, GPU-accelerated drift animation, and centripetal convergence toward center during phases 0-2**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-02T05:30:44Z
- **Completed:** 2026-02-02T05:33:55Z
- **Tasks:** 3
- **Files modified:** 5 created

## Accomplishments
- BlobBackground renders 6 organic blobs with gradient edges that blend on overlap
- Blobs drift subtly in 60-second glacial motion cycle (GPU-accelerated)
- Centripetal convergence: blobs gradually move toward CARD_CENTER as phases progress
- Edge clarity varies by phase (0.3 at phase 0, 0.8 at phase 3+)
- IdeaCard container with responsive height and collapse/expand functionality
- prefers-reduced-motion accessibility support

## Task Commits

Each task was committed atomically:

1. **Task 1: Create blob shape utilities and animation hook with centripetal drift** - `33b0942` (feat)
2. **Task 2: Create BlobBackground SVG component** - `cfd2776` (feat)
3. **Task 3: Create IdeaCard container component** - `214e1a0` (feat)

## Files Created/Modified
- `src/components/idea-card/utils/blobShapes.ts` - Seed-based blob path generation, color definitions, zone positions, center point
- `src/components/idea-card/hooks/useBlobAnimation.ts` - Phase-based edge clarity and centripetal convergence calculations
- `src/components/idea-card/BlobBackground.tsx` - SVG rendering with gradient filters, motion animations, and color blending
- `src/components/idea-card/IdeaCard.tsx` - Container component with responsive sizing, collapse functionality, and dimension measurement
- `src/components/idea-card/index.ts` - Barrel export for idea-card components

## Decisions Made
- **Simplified animation approach:** Hook returns static positions with convergence, Motion handles local drift via animate prop (cleaner separation of concerns)
- **Convergence factor formula:** phase * 0.15 clamped to 0.3 provides gradual movement without excessive speed
- **Staggered animation starts:** Each blob has 0.5s delay offset to create organic feel
- **ViewBox coordinates:** 0 0 800 600 provides good resolution for mobile and desktop with xMidYMid meet scaling

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing framer-motion dependency**
- **Found during:** Task 1 (Animation hook creation)
- **Issue:** framer-motion not in package.json despite STATE.md indicating it should be in project
- **Fix:** Ran `npm install framer-motion`
- **Files modified:** package.json, package-lock.json
- **Verification:** Import succeeds, TypeScript compiles
- **Committed in:** 33b0942 (Task 1 commit)

**2. [Rule 1 - Bug] Simplified useBlobAnimation to fix unused variable warnings**
- **Found during:** Task 3 (Build verification)
- **Issue:** Initial implementation created motion values (localDriftX, localDriftY) that weren't used, causing TS6133 warnings
- **Fix:** Simplified hook to return only static positions with convergence; local drift handled by Motion's animate prop in BlobBackground
- **Files modified:** src/components/idea-card/hooks/useBlobAnimation.ts
- **Verification:** Build completes without warnings
- **Committed in:** 214e1a0 (Task 3 commit)

**3. [Rule 1 - Bug] Fixed unused parameter warnings**
- **Found during:** Task 3 (Build verification)
- **Issue:** TypeScript warnings for unused variables (zone, sessionId)
- **Fix:** Prefixed zone with underscore, removed sessionId parameter (not needed until plan 02)
- **Files modified:** src/components/idea-card/BlobBackground.tsx, src/components/idea-card/IdeaCard.tsx
- **Verification:** Build completes without warnings
- **Committed in:** 214e1a0 (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (1 blocking, 2 bugs)
**Impact on plan:** All auto-fixes necessary for build success and code quality. No scope creep. Dependency was expected to exist but needed explicit installation. Animation approach simplification improved code clarity while maintaining all requirements.

## Issues Encountered
None - all tasks completed as planned.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 02 (Word Cloud Overlay):**
- BlobBackground renders successfully with all 6 blobs
- Blob positions accessible via blobTransforms for word cloud positioning
- Phase-based animations working as designed
- Centripetal convergence visually verified (blobs closer to center as phase increases)

**For testing Plan 02:**
- IdeaCard component can be imported from `src/components/idea-card`
- Pass currentPhase prop to control blob behavior
- Container provides measured dimensions for word cloud bounds

**No blockers.** Foundation is solid for adding word overlays in next plan.

---
*Phase: 05-idea-card*
*Completed: 2026-02-02*
