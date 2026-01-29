# North Star Checklist

**Purpose:** Every plan, feature, and decision must pass through this checklist before implementation. The emotional journey IS the product - features are delivery mechanisms.

---

## The North Star

Users exit feeling **confident**, **capable**, **clear**, and with genuine **ownership** of their idea.

---

## Before Creating a Plan

### 1. Identify Emotional Purpose

Answer: **"Which stage of the emotional journey does this serve?"**

| Journey Stage | User Feels | Example Features |
|--------------|------------|------------------|
| "My progress is safe" | Trust, security | Auth, persistence, data backup |
| "I'm understood" | Heard, valued | Quality responses, thinking visibility |
| "I can explore freely" | Freedom, no commitment anxiety | Multiple sessions, easy switching |
| "I'm making progress" | Momentum, accomplishment | Progress bar, phase completion |
| "I can SEE my idea forming" | Clarity, tangibility | Idea card, visual evolution |
| "Help is there if I need it" | Supported, not alone | Instructor view, guidance |

**If you can't identify which emotional stage a feature serves, reconsider whether it's needed.**

### 2. Write Emotional Purpose Section

Every plan must include an `<emotional_purpose>` section with:

```markdown
<emotional_purpose>
**North Star Alignment:** This plan serves "[emotional stage]"

- **[Feature 1]** [how it creates the feeling]
- **[Feature 2]** [how it creates the feeling]

**Verification question:** [Question that tests whether the implementation achieves the emotional goal]
</emotional_purpose>
```

### 3. Check Against Anti-Patterns

| Anti-Pattern | Why It Fails | Alternative |
|--------------|--------------|-------------|
| Generating ideas FOR user | No ownership = no persistence | Surface patterns, let THEM connect |
| Cheerleading/false encouragement | Undermines trust | Honest, useful feedback |
| Rushing through phases | Shallow work = weak foundation | Gate progression, require evidence |
| Technical jargon in errors | Makes users feel stupid | Human-friendly messages |
| Complexity/overwhelm | Anxiety blocks exploration | Progressive disclosure |
| Flashy features without purpose | Distraction from journey | Only features that serve feelings |

---

## During Implementation

### 4. Implementation Questions

Ask at each decision point:

- [ ] **Does this help users feel capable and clear?**
- [ ] **Does this reinforce or undermine ownership?**
- [ ] **Would this make a user MORE or LESS confident?**
- [ ] **Is this invisible (just works) or does it expose complexity?**
- [ ] **Does this treat users as humans or as "users"?**

### 5. Micro-Decisions Checklist

| Decision Type | North Star Choice |
|--------------|-------------------|
| Error message wording | Human-friendly, not technical |
| Loading states | Calm, not anxious (no spinners everywhere) |
| Empty states | Encouraging, not empty |
| Button labels | Action-oriented, clear outcome |
| Transitions | Smooth, not jarring |
| Color choices | Calm/confident (greens, blues) not aggressive (reds unless error) |

---

## Before Marking Complete

### 6. Emotional Verification

Before marking any plan complete, verify:

- [ ] **Feels test:** Use the feature yourself. Does it feel good?
- [ ] **Language test:** Would a non-technical user understand every message?
- [ ] **Trust test:** Would you feel comfortable using this for something important?
- [ ] **Ownership test:** Does the user feel in control, not the system?

### 7. Phase Completion Emotional Check

When completing a roadmap phase, verify:

| Phase | Emotional Outcome Achieved? |
|-------|---------------------------|
| 1 - Foundation | "My progress is safe" - User trusts data persists |
| 2 - Chat Core | "I'm understood" - User feels heard in conversation |
| 3 - Sessions | "I can explore freely" - User tries ideas without fear |
| 4 - Phase System | "I'm making progress" - User sees momentum |
| 5 - Idea Card | "I can SEE my idea" - Abstract becomes tangible |
| 6 - Instructor | "Help is there" - User feels supported |

---

## Quick Reference Card

### The Ultimate Test

> "Does this help users feel capable and clear, with genuine ownership of their idea?"

### The Ownership Rule

Claude surfaces dots. USER connects them.

- Never: "Here are some ideas for you"
- Always: "What patterns do YOU notice here?"

### The Feeling Hierarchy

```
1. Confident ("I CAN do this")
2. Capable ("I know HOW")
3. Clear ("I know WHAT and WHO")
4. Ownership ("This is MY idea")
```

### Red Flags

- User asks "Is this a good idea?" repeatedly (seeking validation = no ownership)
- User says "Claude suggested" when describing idea (attribution = no ownership)
- User abandons at first obstacle (no persistence = no ownership)
- User can't explain "why THIS idea" (didn't discover = just accepted)

### Green Flags

- User defends idea when challenged (ownership)
- User says "I noticed" / "I realized" (self-discovery)
- User brings concerns proactively (deep thinking)
- User asks "how do I..." questions (ready to act)

---

## Template for Plan Emotional Purpose

Copy this into every plan:

```markdown
<emotional_purpose>
**North Star Alignment:** This plan serves "[STAGE]"

- **[Feature/Task 1]** [how it creates/reinforces the feeling]
- **[Feature/Task 2]** [how it creates/reinforces the feeling]
- **[Feature/Task 3]** [how it creates/reinforces the feeling]

**Verification question:** [Specific question to test if implementation achieves the emotional goal]
</emotional_purpose>
```

---

*Checklist created: 2026-01-29*
*Reference: PROJECT.md North Star section*
