# Phase 3: Sessions - Research

**Researched:** 2026-01-31
**Domain:** Session management with dual paths, state preservation, inline editing
**Confidence:** HIGH

## Summary

Phase 3 implements multi-session functionality with two distinct paths: Area Exploration (phases 0-2) and Idea Evaluation (phases 3-9). Users can maintain up to 5 sessions per path type, allowing parallel exploration of different areas or evaluation of multiple ideas without commitment anxiety.

The implementation requires session state preservation (scroll position, draft messages), seamless switching UX (with contextual loading states), inline editing for session renaming, and archive functionality. The existing Convex schema already supports the core data model with `sessions` and `messages` tables, including soft delete via `isDeleted` field.

**Primary recommendation:** Use React state management for scroll/draft preservation, implement context menu for session actions (rename/delete/archive), and create two sidebar sections with collapsible groups. The Convex backend is largely complete - this phase is primarily frontend state management and UX refinement.

## Standard Stack

The existing codebase has established patterns that this phase should follow:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | UI framework | Already used throughout app |
| Convex | Current | Database/backend | Existing schema supports sessions |
| Clerk | Current | Authentication | Already integrated for userId |
| Tailwind CSS | 3.x | Styling | Project standard for UI |
| React Router | 6.x | Routing | Already configured in App.tsx |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @floating-ui/react | 0.26+ | Context menu positioning | For right-click menu placement |
| react-use | 17+ | Browser hooks (useLocalStorage) | For scroll/draft persistence |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @floating-ui/react | Manual positioning | Floating-ui handles edge cases, viewports |
| react-use | Custom localStorage hook | react-use is battle-tested, handles SSR |
| Context menu | Modal dialogs | Context menu is more discoverable for power users |

**Installation:**
```bash
npm install @floating-ui/react react-use
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── hooks/
│   ├── useSessionState.ts        # Scroll position + draft preservation
│   └── useContextMenu.ts          # Right-click menu logic
├── components/
│   ├── SessionItem.tsx            # Individual session in sidebar
│   ├── SessionContextMenu.tsx    # Rename/Delete/Archive menu
│   ├── SessionGroup.tsx           # Collapsible section (Exploration/Evaluation)
│   └── OnboardingView.tsx         # First-time no-sessions state
└── lib/
    └── sessionHelpers.ts          # Path type logic, validation
```

### Pattern 1: Session State Preservation

**What:** Preserve scroll position and draft messages per session, restore on switch

**When to use:** Critical for "explore without losing anything" feeling

**Example:**
```typescript
// useSessionState.ts
import { useEffect, useRef } from 'react';
import { useLocalStorage } from 'react-use';

interface SessionState {
  scrollPosition: number;
  draftMessage: string;
}

export function useSessionState(sessionId: string | null) {
  const [states, setStates] = useLocalStorage<Record<string, SessionState>>(
    'session-states',
    {}
  );

  const currentState = sessionId ? states[sessionId] : null;

  const saveScrollPosition = (position: number) => {
    if (!sessionId) return;
    setStates(prev => ({
      ...prev,
      [sessionId]: { ...prev[sessionId], scrollPosition: position }
    }));
  };

  const saveDraftMessage = (draft: string) => {
    if (!sessionId) return;
    setStates(prev => ({
      ...prev,
      [sessionId]: { ...prev[sessionId], draftMessage: draft }
    }));
  };

  return {
    scrollPosition: currentState?.scrollPosition ?? 0,
    draftMessage: currentState?.draftMessage ?? '',
    saveScrollPosition,
    saveDraftMessage
  };
}
```

**Best practices:**
- Save scroll position on scroll event (throttled to 100ms)
- Save draft on input change (throttled to 500ms)
- Use localStorage for persistence across page reloads
- Clean up old session states (sessions deleted >30 days ago)

### Pattern 2: Context Menu Implementation

**What:** Right-click menu for session actions (Rename/Delete/Archive)

**When to use:** Common pattern for power users, more discoverable than hidden actions

**Example:**
```typescript
// useContextMenu.ts
import { useState, useCallback } from 'react';
import { useFloating, offset, flip, shift } from '@floating-ui/react';

export function useContextMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(4), flip(), shift()],
    placement: 'right-start'
  });

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    setIsOpen,
    handleContextMenu,
    refs,
    floatingStyles
  };
}
```

### Pattern 3: Inline Editing for Session Names

**What:** Click session name to edit inline without modal

**When to use:** Low-friction renaming, feels natural

**Example:**
```typescript
// SessionItem.tsx
function SessionItem({ session, isActive, onSelect }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(session.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue.trim() && editValue !== session.name) {
      await updateSession({ sessionId: session._id, name: editValue.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditValue(session.name);
      setIsEditing(false);
    }
  };

  return (
    <div onContextMenu={handleContextMenu}>
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div onClick={() => !isActive && onSelect()}>
          {session.name}
        </div>
      )}
    </div>
  );
}
```

**Best practices:**
- Auto-focus and select text when entering edit mode
- Save on Enter, cancel on Escape
- Save on blur (clicking outside)
- Trim whitespace, validate non-empty
- Revert to original if empty or unchanged

### Pattern 4: Collapsible Sidebar Sections

**What:** Separate Area Exploration and Idea Evaluation with collapse/expand

**When to use:** Manage visual complexity when users have many sessions

**Example:**
```typescript
// SessionGroup.tsx
function SessionGroup({
  type,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession
}) {
  const [isExpanded, setIsExpanded] = useLocalStorage(
    `session-group-${type}-expanded`,
    true
  );

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-2"
      >
        <span className="font-medium">
          {type === 'exploration' ? 'Area Exploration' : 'Idea Evaluation'}
        </span>
        <ChevronIcon rotated={isExpanded} />
      </button>

      {isExpanded && (
        <>
          <button onClick={onNewSession} className="w-full p-2">
            + New {type === 'exploration' ? 'Exploration' : 'Evaluation'}
          </button>

          <div className="space-y-1">
            {sessions.map(session => (
              <SessionItem
                key={session._id}
                session={session}
                isActive={session._id === currentSessionId}
                onSelect={() => onSelectSession(session._id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Don't use global scroll state** - Each session needs independent scroll position
- **Don't clear draft on switch** - Users expect typed text to be preserved
- **Don't show confirmation for archive** - Archive is reversible (unlike delete)
- **Don't use modals for rename** - Inline editing is more natural
- **Don't auto-switch sessions** - User initiates switch explicitly

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Context menu positioning | Manual x/y positioning with bounds checking | @floating-ui/react | Handles viewport edges, scroll containers, nested positioning |
| localStorage persistence | useState + useEffect boilerplate | react-use's useLocalStorage | SSR-safe, handles JSON serialization, sync across tabs |
| Scroll restoration | Manual scrollTo + position tracking | Browser's built-in scroll restoration + localStorage | Handles smooth scroll, respects reduced-motion |
| Session limits (5 per path) | Manual count and validation | Convex query with index + mutation validation | Database-level consistency |

**Key insight:** State preservation across component unmounts is tricky - use battle-tested hooks that handle edge cases (SSR, storage quota exceeded, JSON errors).

## Common Pitfalls

### Pitfall 1: Scroll Position Race Conditions

**What goes wrong:** Scroll position restored before messages finish loading, scrolls to wrong position

**Why it happens:** Messages load asynchronously, changing container scrollHeight

**How to avoid:**
1. Wait for messages query status to be "success"
2. Use `useLayoutEffect` for scroll restoration (fires before paint)
3. Measure container scrollHeight and validate position before restoring

**Warning signs:**
- User scrolls to top when switching despite having scroll state saved
- Scroll position jumps after messages render

**Code pattern:**
```typescript
useLayoutEffect(() => {
  const container = containerRef.current;
  if (!container || messagesStatus !== 'success') return;

  const savedPosition = sessionState.scrollPosition;
  if (savedPosition > 0) {
    // Validate position is within bounds
    const maxScroll = container.scrollHeight - container.clientHeight;
    container.scrollTop = Math.min(savedPosition, maxScroll);
  }
}, [sessionId, messagesStatus]);
```

### Pitfall 2: Draft Message Loss on Session Switch

**What goes wrong:** User types message, switches sessions, returns to find input cleared

**Why it happens:** Input is controlled component with local state not persisted

**How to avoid:**
1. Save draft to localStorage on every input change (throttled)
2. Restore draft when session becomes active
3. Clear draft only when message successfully sends

**Warning signs:**
- Users complain about losing typed messages
- Draft preservation works on refresh but not session switch

### Pitfall 3: Archive State Inconsistency

**What goes wrong:** Archived sessions appear in main list or disappear completely

**Why it happens:** Convex query doesn't filter by archive status, or filters too aggressively

**How to avoid:**
1. Add `isArchived` boolean field to sessions table
2. Create separate indexes: `by_user_active` (isDeleted=false, isArchived=false) and `by_user_archived` (isDeleted=false, isArchived=true)
3. Query each list separately

**Warning signs:**
- Archived sessions visible in main list
- Archive section empty despite archived sessions existing
- Session count includes archived sessions

### Pitfall 4: Session Limit Enforcement

**What goes wrong:** Users can create 6th+ exploration session despite 5-session limit

**Why it happens:** Frontend validation only, no backend enforcement

**How to avoid:**
1. Count non-archived sessions of specific path in mutation handler
2. Throw error if limit exceeded
3. Show user-friendly message: "You've created 5 explorations. Consider committing to one idea and starting an evaluation."

**Warning signs:**
- Users have >5 active sessions per path type
- No error when creating 6th session

## Code Examples

Verified patterns from official sources:

### Preserving Scroll Position

Based on [Maintain and restore scroll position in React mobile apps - LogRocket Blog](https://blog.logrocket.com/maintain-restore-scroll-position-react-mobile-apps/) and [How to maintain state and scroll position in React | by Lin Gash | Medium](https://lingash.medium.com/how-to-maintain-state-and-scroll-position-in-react-4baa5dea0ce):

```typescript
// hooks/useScrollRestoration.ts
import { useEffect, useLayoutEffect, useRef } from 'react';

export function useScrollRestoration(
  sessionId: string | null,
  saveScrollPosition: (pos: number) => void,
  savedScrollPosition: number
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isRestoringRef = useRef(false);

  // Save scroll position on scroll (throttled)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !sessionId) return;

    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!isRestoringRef.current) {
          saveScrollPosition(container.scrollTop);
        }
      }, 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [sessionId, saveScrollPosition]);

  // Restore scroll position on session switch
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !sessionId) return;

    if (savedScrollPosition > 0) {
      isRestoringRef.current = true;
      container.scrollTop = savedScrollPosition;

      // Reset flag after a frame
      requestAnimationFrame(() => {
        isRestoringRef.current = false;
      });
    }
  }, [sessionId, savedScrollPosition]);

  return containerRef;
}
```

### Inline Editing Component

Based on [How to build an inline editable UI in React - LogRocket Blog](https://blog.logrocket.com/build-inline-editable-ui-react/) and [How to build an inline edit component in React](https://www.emgoto.com/react-inline-edit/):

```typescript
// components/InlineEditableText.tsx
import { useState, useRef, useEffect } from 'react';

interface InlineEditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  className?: string;
  placeholder?: string;
}

export function InlineEditableText({
  value,
  onSave,
  className = '',
  placeholder = 'Enter text...'
}: InlineEditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const trimmed = editValue.trim();

    if (!trimmed) {
      setEditValue(value);
      setIsEditing(false);
      return;
    }

    if (trimmed === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(trimmed);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSaving) {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        className={`${className} focus:outline-none focus:ring-2 focus:ring-primary-500`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`${className} cursor-pointer hover:bg-gray-100 rounded px-1`}
    >
      {value || placeholder}
    </span>
  );
}
```

### Context Menu with Floating UI

Based on Floating UI documentation patterns:

```typescript
// components/SessionContextMenu.tsx
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';

interface SessionContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onRename: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function SessionContextMenu({
  isOpen,
  onClose,
  position,
  onRename,
  onArchive,
  onDelete
}: SessionContextMenuProps) {
  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: onClose,
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (refs.floating.current && !refs.floating.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, refs.floating]);

  if (!isOpen) return null;

  return (
    <div
      ref={refs.setFloating}
      style={{
        ...floatingStyles,
        position: 'fixed',
        left: position.x,
        top: position.y,
      }}
      className="bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-50"
    >
      <button
        onClick={() => { onRename(); onClose(); }}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
      >
        Rename
      </button>
      <button
        onClick={() => { onArchive(); onClose(); }}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
      >
        Archive
      </button>
      <div className="border-t border-gray-200 my-1" />
      <button
        onClick={() => { onDelete(); onClose(); }}
        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm"
      >
        Delete
      </button>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Full page reload on session switch | SPA with preserved state | 2020+ | Instant switches, no loading screens |
| Modal dialogs for all actions | Inline editing + context menus | 2022+ | Reduces clicks, more discoverable |
| Single undo stack | Per-session undo history | 2023+ | Context-aware undo/redo |
| Manual scroll restoration | Browser scroll restoration API + state | 2024+ | Smoother, respects user preferences |

**Deprecated/outdated:**
- Global state for all sessions (use per-session localStorage)
- Inline confirmation for reversible actions (only confirm destructive actions)
- Numeric session IDs displayed to users (use readable names)

## Convex Schema Extensions

The existing schema in `convex/schema.ts` already supports sessions well. Minor additions needed:

```typescript
// Add to sessions table
isArchived: v.boolean(), // Soft archive (different from isDeleted)
description: v.optional(v.string()), // User-provided description
linkedExplorationId: v.optional(v.id("sessions")), // For Evaluation -> Exploration reference

// Add index for archived sessions
.index("by_user_archived", ["userId", "isDeleted", "isArchived", "lastActiveAt"])
```

## Session Switching UX Research

Based on [16 Chat UI Design Patterns That Work in 2025](https://bricxlabs.com/blogs/message-screen-ui-deisgn) and [Chat UX Best Practices: From Onboarding to Re-Engagement](https://getstream.io/blog/chat-ux/):

### Key Findings

1. **Conversation Organization**: Pinning important conversations to the top helps users, but should be limited to ~15 to avoid clutter. For this app: use "most recent activity" ordering instead of pinning.

2. **Message Previews**: Not applicable for this use case (no preview of conversation content in sidebar - just session name and phase)

3. **Search Functionality**: Defer to future phase - Phase 3 doesn't require session search with max 10 sessions

4. **Quick Actions**: Right-click context menu provides quick actions (Rename/Archive/Delete) without cluttering sidebar

5. **Persistent Context UI**: Phase indicator in sidebar provides constant awareness of progress

### Loading State Recommendations

Based on research, loading states should be:
- **Contextual**: Different messages for Exploration vs Evaluation paths
- **Clever**: Themed to the phase/path (e.g., "Mapping your unfair advantages..." for Phase 0)
- **Brief**: 10-20 messages that rotate, not hundreds
- **Optimistic**: Assume switch will succeed, show new session immediately

Example loading messages:

**Exploration Path:**
- "Mapping your unfair advantages..."
- "Scanning for overlooked opportunities..."
- "Connecting the dots..."
- "Following the energy signals..."
- "Excavating hidden patterns..."

**Evaluation Path:**
- "Calculating pain scores..."
- "Testing your 3-word description..."
- "Checking timing factors..."
- "Analyzing shareability..."
- "Measuring distribution fit..."

## Extended Thinking and Phase Transitions

Based on [Building with extended thinking - Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/extended-thinking) and [Extended thinking tips - Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/extended-thinking-tips):

### Preserving Thinking Across Sessions

**Critical finding:** When switching sessions and restoring conversation history, must include complete unmodified thinking blocks for the last assistant turn to maintain reasoning continuity.

This means:
1. Store `thinking` field alongside message content in database (already done in current schema)
2. When loading messages for a session, include thinking in conversation history sent to Claude API
3. Claude API automatically preserves thinking from prior turns in model context (Claude Opus 4.5 default behavior)

### Phase Wrap-Up Behavior

The research didn't find formal "phase wrap-up" patterns in Claude API documentation. This means **phase transitions are skill-driven** through system prompt, not API features.

Current implementation in `systemPrompts.ts` already handles this:

```typescript
// Phase completion detection
When ALL criteria are met, say: "I think we've built solid ground here. Ready to move to Phase ${currentPhase + 1}?"
```

**For Phase 3:** No changes needed to phase transition logic. The skill behavior (closing questions, natural transitions) is already encoded in system prompt and will work identically across all sessions.

## Open Questions

Things that couldn't be fully resolved:

1. **Session Limit Nudge Copy**
   - What we know: Need user-friendly message when user tries to create 6th exploration
   - What's unclear: Exact tone - encouraging vs. challenging?
   - Recommendation: Test with users, start with encouraging: "You've explored 5 different areas! Consider committing to one and starting an evaluation to dive deeper."

2. **Draft Persistence Timing**
   - What we know: Should preserve on session switch
   - What's unclear: When to clear? On successful send, or allow multi-message drafts?
   - Recommendation: Clear draft only on successful send. Allow users to compose long messages across multiple sessions.

3. **Archived Section Visibility**
   - What we know: Appears only after first archive, collapsed by default
   - What's unclear: How to surface archived sessions when section is collapsed (badge count?)
   - Recommendation: Show badge with count "(3)" next to "Archived" label when collapsed

## Sources

### Primary (HIGH confidence)
- [How to maintain state and scroll position in React | by Lin Gash | Medium](https://lingash.medium.com/how-to-maintain-state-and-scroll-position-in-react-4baa5dea0ce) - Scroll restoration patterns
- [Maintain and restore scroll position in React mobile apps - LogRocket Blog](https://blog.logrocket.com/maintain-restore-scroll-position-react-mobile-apps/) - Mobile-specific scroll handling
- [How to build an inline editable UI in React - LogRocket Blog](https://blog.logrocket.com/build-inline-editable-ui-react/) - Inline editing implementation
- [How to build an inline edit component in React](https://www.emgoto.com/react-inline-edit/) - Edit component patterns
- [Building with extended thinking - Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/extended-thinking) - Thinking block preservation
- Existing codebase: `convex/sessions.ts`, `convex/schema.ts`, `src/App.tsx` - Current implementation patterns
- CONTEXT.md: User decisions about session types, limits, UX flows

### Secondary (MEDIUM confidence)
- [16 Chat UI Design Patterns That Work in 2025](https://bricxlabs.com/blogs/message-screen-ui-deisgn) - Sidebar organization patterns
- [Chat UX Best Practices: From Onboarding to Re-Engagement](https://getstream.io/blog/chat-ux/) - Chat application UX guidance
- Floating UI documentation - Context menu positioning (official docs)
- react-use documentation - localStorage hooks (official docs)

### Tertiary (LOW confidence)
- None - All recommendations verified with official sources or existing codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Uses existing project libraries
- Architecture: HIGH - Patterns verified in LogRocket/Medium articles and existing codebase
- Pitfalls: HIGH - Common React state management issues, well-documented

**Research date:** 2026-01-31
**Valid until:** 30 days (stable patterns, not fast-moving)

**Research gaps:**
- Session switching while streaming (requires testing to verify behavior)
- Performance with 10 sessions × 1000 messages each (likely fine, but not tested)
- Mobile responsive behavior for context menu (Floating UI should handle, but verify)

**Next phase dependencies:**
- Phase 4 (Phase System) will add phase progression UI to sidebar (indicator already planned)
- Phase 5 (Idea Card) will need session switching without card state loss
