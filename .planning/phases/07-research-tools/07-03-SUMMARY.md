---
phase: 07
plan: 03
subsystem: research-tools
tags: [manual-research, checklist, forms, react-hook-form, convex]

requires:
  - "07-01: Research tool definitions and API wrappers"
provides:
  - "Manual research checklist UI for non-API sources"
  - "Backend persistence for manual findings"
  - "Claude context formatting for manual research"
affects:
  - "Future plans that integrate manual research into chat flow"

tech-stack:
  added:
    - "react-hook-form@^7.x for form validation"
  patterns:
    - "Config-driven form generation from field definitions"
    - "Flexible schema with optional fields per research type"
    - "Context formatting for Claude consumption"

key-files:
  created:
    - "src/components/research/checklistConfig.ts"
    - "src/components/research/ResearchChecklist.tsx"
    - "src/components/research/index.ts"
    - "convex/manualResearch.ts"
  modified:
    - "convex/schema.ts"
    - "package.json"

decisions:
  - id: "config-driven-checklist"
    choice: "CHECKLIST_CONFIGS with field definitions per type"
    rationale: "Enables adding new research types without component changes"
  - id: "flexible-schema"
    choice: "All checklist fields optional in schema data object"
    rationale: "Different research types have different fields; flexible object avoids union complexity"
  - id: "context-formatting"
    choice: "getManualResearchForContext formats for Claude"
    rationale: "Separates query logic from presentation; Claude gets clean formatted text"
  - id: "react-hook-form"
    choice: "Use react-hook-form for validation"
    rationale: "Industry standard, lightweight, built-in validation"

duration: 5 minutes
completed: 2026-02-02
---

# Phase 07 Plan 03: Manual Research Checklist Summary

**One-liner:** Form-based manual research capture for Facebook Groups, LinkedIn, Twitter/X, Amazon Reviews with Convex persistence and Claude context formatting

## What Was Built

Created structured checklist UI and backend for manual research on platforms without programmatic APIs.

### 1. Checklist Configuration System

**File:** `src/components/research/checklistConfig.ts`

Defined 4 checklist types with field specifications:
- **facebook_groups:** Group name, size, pain posts, common language
- **linkedin:** Target roles, skills in demand, pain points, tools mentioned
- **twitter:** Hashtags, influencers, common complaints, wishlist items
- **amazon_reviews:** Product category, products reviewed, complaints, missing features

Each config includes:
- Type-safe ChecklistType union
- Field definitions (label, placeholder, type, required, helpText)
- Instructions for conducting research
- Description of purpose

**Pattern:** Config-driven form generation enables adding research types without component changes.

### 2. ResearchChecklist Component

**File:** `src/components/research/ResearchChecklist.tsx`

React component with:
- react-hook-form for validation and state management
- Dynamic field rendering based on ChecklistConfig
- Instructions panel with step-by-step guidance
- Help text tooltips for field context
- Required field validation with error messages
- Submit to `api.manualResearch.submitManualResearch`
- Loading states during submission

**Props:**
- `sessionId`: Links findings to session
- `type`: Determines which checklist config to use
- `onComplete`: Callback after successful submission
- `onCancel`: Callback to exit without saving

**UI Features:**
- Blue instruction box with numbered steps
- Required fields marked with red asterisk
- Textarea fields for long-form input (4 rows)
- Text fields for short answers
- Disabled submit button during save
- Cancel/Submit action buttons

### 3. Backend Persistence

**File:** `convex/manualResearch.ts`

Three exports:

**submitManualResearch (mutation):**
- Validates user ownership of session
- Inserts findings into manualResearchFindings table
- Records submission timestamp
- Returns finding ID

**getManualResearch (query):**
- Retrieves all findings for a session
- Verifies user ownership
- Returns array of findings with full data

**getManualResearchForContext (query):**
- Formats findings into readable text for Claude
- Groups by research type with labels
- Converts camelCase fields to readable names
- Filters out empty fields
- Returns formatted string or null if no findings

**Example formatted output:**
```
### Facebook Groups Research
  Group Name: Shopify Entrepreneurs
  Group Size: 45,000 members
  Top Pain Posts: [user's research]
  Common Language: [user's research]

### LinkedIn Research
  Target Roles: Marketing Manager, Growth Lead
  Skills In Demand: [user's research]
```

### 4. Schema Updates

**File:** `convex/schema.ts`

Expanded `manualResearchFindings` table data object with all fields:
- Facebook Groups: groupName, groupSize, topPainPosts, commonLanguage
- LinkedIn: targetRoles, skillsInDemand, painPointsFromPosts, toolsMentioned
- Twitter: hashtags, influencers, commonComplaints, wishlistItems
- Amazon Reviews: productCategory, productsReviewed, topComplaints, missingFeatures

All fields optional since different types use different subsets.

### 5. Dependencies

Added `react-hook-form@^7.x` for form handling with built-in validation.

## Technical Decisions

### Config-Driven Architecture

**Decision:** CHECKLIST_CONFIGS as source of truth for field definitions

**Benefits:**
- Single place to add new research types
- Type-safe field IDs (TypeScript string literals)
- Component automatically renders new configs
- Instructions and help text co-located with fields

**Implementation:**
```typescript
export const CHECKLIST_CONFIGS: Record<ChecklistType, ChecklistConfig> = {
  facebook_groups: { /* config */ },
  linkedin: { /* config */ },
  // Add new type here, component handles it automatically
}
```

### Flexible Schema

**Decision:** All fields optional in data object (not union of type-specific objects)

**Rationale:**
- Simpler schema definition
- No runtime type discrimination needed
- Easy to add fields without schema migration
- Frontend validates required fields per type

**Trade-off:** Less type safety at database level, but ChecklistConfig enforces structure at UI level.

### Context Formatting

**Decision:** Separate query for Claude-formatted output

**Benefits:**
- UI and Claude get data in optimal formats
- Can change formatting without affecting UI queries
- Filters empty fields to reduce Claude token usage
- camelCase → Readable Names transformation

**Example:**
```typescript
formatFieldName("topPainPosts") // "Top Pain Posts"
formatFieldName("skillsInDemand") // "Skills In Demand"
```

### react-hook-form

**Decision:** Use react-hook-form over controlled state

**Benefits:**
- 6KB bundle (vs 50KB for Formik)
- No re-renders on keystroke (uncontrolled inputs)
- Built-in validation (`{ required: true }`)
- Clean error handling (`formState.errors`)
- `handleSubmit` wrapper handles validation automatically

**Pattern:**
```typescript
const { register, handleSubmit, formState: { errors } } = useForm();
<input {...register("fieldId", { required: true })} />
```

## Integration Points

### Frontend Integration
```typescript
import { ResearchChecklist } from "@/components/research";

<ResearchChecklist
  sessionId={currentSession._id}
  type="facebook_groups"
  onComplete={() => { /* refresh UI */ }}
  onCancel={() => { /* close modal */ }}
/>
```

### Backend Integration
```typescript
// In chat flow, include manual research in context
const manualContext = await ctx.runQuery(
  api.manualResearch.getManualResearchForContext,
  { sessionId }
);

if (manualContext) {
  systemPrompt += `\n\n## User's Manual Research\n${manualContext}`;
}
```

## Verification Results

✅ All files compile without TypeScript errors (new code)
✅ ResearchChecklist renders with correct fields per type (4 configs)
✅ Form validation works for required fields (react-hook-form)
✅ Submission saves to manualResearchFindings table (Convex deployed)
✅ getManualResearchForContext returns formatted string for Claude

**Note:** Pre-existing TypeScript errors in idea-card components unrelated to this work.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed import path for auth helper**
- **Found during:** Task 3 - Creating manualResearch.ts
- **Issue:** Plan specified `import { getAuthUserId } from "@convex-dev/auth/server"` but project uses local auth helper
- **Fix:** Changed import to `from "./auth"` matching pattern in sessions.ts and billing.ts
- **Files modified:** convex/manualResearch.ts (auto-corrected by linter)
- **Commit:** a3d209c

**2. [Rule 2 - Missing Critical] Added react-hook-form dependency**
- **Found during:** Task 2 verification
- **Issue:** ResearchChecklist uses react-hook-form but package not installed
- **Fix:** `npm install react-hook-form` and committed dependency
- **Files modified:** package.json, package-lock.json
- **Commit:** 3077211
- **Rationale:** Required for form validation and submission - critical for component operation

## Success Metrics

- **4 checklist types** defined with field configurations
- **1 reusable component** handles all research types
- **3 backend functions** (submit, query, format)
- **20+ fields** supported across all checklists
- **100% ownership verification** (all mutations check userId)

## Next Phase Readiness

**For Integration (future plans):**
- Modal/drawer UI needed to invoke ResearchChecklist
- Research menu/button to select checklist type
- Include manual research context in Claude chat flow
- Display submitted research findings in UI (history/view)

**Blockers:** None

**Dependencies Satisfied:**
- ✅ 07-01 provides session and schema foundation
- ✅ Convex deployment working (functions ready)

## Files Changed

**Created (5 files):**
```
src/components/research/checklistConfig.ts    88 lines
src/components/research/ResearchChecklist.tsx 121 lines
src/components/research/index.ts               2 lines
convex/manualResearch.ts                     118 lines
```

**Modified (3 files):**
```
convex/schema.ts                  +22 lines (expanded data fields)
package.json                       +1 dependency
package-lock.json                  +18 lines
```

**Total:** 351 lines added, 23 modified

## Commits

| Commit | Message | Files |
|--------|---------|-------|
| 590d160 | feat(07-03): add checklist configuration definitions | checklistConfig.ts |
| 1893a2e | feat(07-03): create ResearchChecklist component | ResearchChecklist.tsx, index.ts |
| a3d209c | feat(07-03): create manual research mutations | manualResearch.ts, schema.ts, api.d.ts |
| 3077211 | chore(07-03): add react-hook-form dependency | package.json, package-lock.json |

**Total Commits:** 4 (3 feature, 1 chore)
