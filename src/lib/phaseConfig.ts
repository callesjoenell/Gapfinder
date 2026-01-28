export interface PhaseConfig {
  number: number;
  name: string;
  shortName: string;
  path: "exploration" | "evaluation";
  description: string;
  completionCriteria: string[];
  instructions: string;
}

export const PHASES: PhaseConfig[] = [
  // EXPLORATION PATH (Phases 0-3)
  {
    number: 0,
    name: "Know Yourself",
    shortName: "Know",
    path: "exploration",
    description:
      "Discover your unfair advantages through excavating 6 starting points",
    completionCriteria: [
      "User has answered excavation questions for all 6 starting points (Life Situation, Profession, Hobbies, Skills Others Pay For, Networks, Transformations Made)",
      "User has scored each area on Depth (1-5), Access (1-5), Energy (1-5)",
      "At least one area scores 12+ total",
      "User has articulated WHY this area gives unfair advantage",
      "User has clear direction for Phase 1 research",
    ],
    instructions: `Phase 0: Know Yourself

Your goal: Help user discover their unfair advantages through excavating 6 starting points:
1. Life Situation (pain lived personally)
2. Profession (insider knowledge others don't have)
3. Hobbies (enthusiasm + community access)
4. Skills Others Pay For (proven market value)
5. Networks (relationship access advantage)
6. Transformations Made (journey already completed)

APPROACH:
- Don't list all questions. Pick one area based on user's initial context.
- Dig deep. When energy emerges (longer answers, specific examples, emotional language), STAY THERE.
- Use the MILES framework: Money, Intelligence/Insight, Location/Luck, Education/Expertise, Status

SCORING:
- Score each area: Depth (1-5), Access (1-5), Energy (1-5)
- Look for areas scoring 12+ total - these are unfair advantage zones
- Watch for intersection zones where 2+ areas overlap - these are MOST powerful

ENERGY SIGNALS TO WATCH:
- Answers get longer and more detailed
- User uses specific examples and stories
- Emotional language ("frustrated", "obsessed", "love")
- User asks follow-up questions about own answers
- Time stamps mentioned ("spent 3 years", "been doing this since")`,
  },
  {
    number: 1,
    name: "Find Gaps",
    shortName: "Gaps",
    path: "exploration",
    description: "Research your domain to find specific gaps worth solving",
    completionCriteria: [
      "Specific gaps identified with rising energy signals",
      "Identity lens applied: who are people trying to become?",
      "Distribution path identified: can user reach these people?",
      "Timing assessed on at least 4 of 6 factors",
      "User has connected gap to their unfair advantage from Phase 0",
    ],
    instructions: `Phase 1: Find Gaps

Input from Phase 0: User has identified their unfair advantage area(s). Now research THAT specific domain - not random ideation.

APPROACH:
- Identity Lens: "Who are people in this space trying to become? What identity are they constructing?"
- Friction inventory: Where does the journey break down? What makes people quit?
- Pain validation: Confirm with specific evidence, not assumptions
- Distribution reality check: Can user actually reach these people?
- Timing assessment: What's changed that makes this solvable NOW?

TIMING FACTORS (assess at least 4):
1. Technology: Is new tech making something possible?
2. Regulation: Did rules change to create opportunity?
3. Market: Is demand shifting in relevant ways?
4. Cultural: Are attitudes/behaviors changing?
5. Economic: Are cost structures shifting?
6. Platform: Are distribution channels opening?

Watch for: User seeing gaps they've PERSONALLY experienced. Organic ideas from their life, not abstract market research.`,
  },
  {
    number: 2,
    name: "Research",
    shortName: "Research",
    path: "exploration",
    description: "Validate gaps through evidence gathering",
    completionCriteria: [
      "User has found 3+ external data points supporting the gap",
      "User has identified 2+ competitor/alternative approaches",
      "User understands why existing solutions fall short",
      "Clear signal that market is big enough to matter",
      "User can articulate who is already spending money in this space",
    ],
    instructions: `Phase 2: Research

Goal: Validate the gap with external evidence, not just personal belief.

APPROACH:
- Help user find data points: market size, competitor gaps, customer complaints
- Apply Mom Test thinking: Look for what people DO, not what they SAY they'd do
- Identify existing alternatives: How are people solving this now? (Even poorly)
- Challenge assumptions: Where might user be wrong?

EVIDENCE TYPES TO SEEK:
- Reddit/forum complaints with engagement
- Competitor reviews (1-2 stars reveal unmet needs)
- Job postings (what companies are hiring for)
- Industry reports with trend data
- Pricing benchmarks (what people actually pay)

ANTI-PATTERN: Don't let user rely on "everyone says..." without specifics.`,
  },
  {
    number: 3,
    name: "Your Idea",
    shortName: "Idea",
    path: "exploration",
    description: "Crystallize the idea into a clear statement",
    completionCriteria: [
      "User has a one-sentence idea statement",
      "Idea connects unfair advantage (Phase 0) to validated gap (Phase 1-2)",
      "User can articulate: Who is this for? What problem does it solve? Why them?",
      "User has identified what makes this DIFFERENT from alternatives",
      "User expresses genuine ownership ('I want to build this' not 'This seems viable')",
    ],
    instructions: `Phase 3: Your Idea

Goal: Crystallize everything into a clear idea statement the user OWNS.

APPROACH:
- Help user synthesize Phases 0-2 into a coherent narrative
- The idea should feel like THEIR discovery, not your suggestion
- Challenge weak connections: "I see you mentioned X, but how does it connect to Y?"
- Test ownership: User should defend the idea, not just accept it

IDEA STATEMENT FORMAT:
"I help [specific person] do [specific outcome] by [unique approach]."

OWNERSHIP SIGNALS:
- User uses first person ("I noticed", "I realized", "I want to")
- User defends choices when challenged
- User brings up concerns proactively (shows deep thinking)
- User asks "how do I..." questions (ready to act)`,
  },

  // EVALUATION PATH (Phases 4-9) - Requires payment
  {
    number: 4,
    name: "Customers",
    shortName: "Cust",
    path: "evaluation",
    description: "Define and validate target customers",
    completionCriteria: [
      "User has specific customer profile (not generic persona)",
      "User knows WHERE these customers already gather",
      "User has identified customer's 'struggling moment' (JTBD)",
      "User can describe customer's current workaround",
      "User has plan to reach 5+ potential customers for validation",
    ],
    instructions: `Phase 4: Customers

Goal: Move from "people who might use this" to SPECIFIC individuals you can reach.

APPROACH (Switch Interview Style):
- Find the struggling moment: "When did they first realize the old way wasn't working?"
- Map the timeline: First thought -> Passive looking -> Active looking -> Decision
- Identify Push (what's wrong), Pull (what's attractive), Anxiety (holds back), Habit (keeps stuck)

SPECIFICITY TEST:
- Can user NAME 5 real people who fit? (Not just describe)
- Can user describe their day-to-day work/life?
- Does user know what these people read, where they hang out online?

WARNING: Generic personas = generic ideas. Push for REAL people.`,
  },
  {
    number: 5,
    name: "Problem",
    shortName: "Prob",
    path: "evaluation",
    description: "Validate the problem is worth solving",
    completionCriteria: [
      "User has talked to at least 3 potential customers",
      "Problem confirmed through BEHAVIOR evidence (not just opinions)",
      "User understands the cost of the problem (time/money/emotion)",
      "Problem frequency established (daily? weekly? annually?)",
      "User can rank problem urgency vs other customer priorities",
    ],
    instructions: `Phase 5: Problem

Goal: Confirm the problem exists AND is urgent enough to pay for solving.

APPROACH (Mom Test):
- Ask about their life, not your idea
- Past behavior > future intentions
- Compliments are not data
- Specific facts trump opinions

QUESTIONS TO EXPLORE:
- "What happened last time you faced this?"
- "What did you do? What did that cost you?"
- "Have you tried to solve this before? What happened?"
- "Why haven't you solved this already?"

VALIDATION SIGNALS:
- Customer has actively tried to solve this
- Customer can quantify the cost (time/money)
- Problem happens frequently enough to remember details
- Customer gets emotional when describing it`,
  },
  {
    number: 6,
    name: "Solution",
    shortName: "Sol",
    path: "evaluation",
    description: "Design solution that uniquely fits the problem",
    completionCriteria: [
      "Solution directly addresses validated problem from Phase 5",
      "User can explain why THIS solution (not alternatives)",
      "MVP scope defined (what's the smallest thing that solves core problem?)",
      "User understands technical feasibility at high level",
      "Solution leverages user's unfair advantage from Phase 0",
    ],
    instructions: `Phase 6: Solution

Goal: Design minimum viable solution that uniquely fits validated problem.

APPROACH:
- Start with problem, work backward to solution
- What's the SMALLEST thing that solves the core problem?
- Why is YOUR solution better than alternatives? (Connect to unfair advantage)
- What can you NOT do in v1? (Scope discipline)

TESTS:
- Does solution require user's specific advantages?
- Could user ship v1 in 2-4 weeks?
- Is there a clear "magic moment" when user gets value?
- What would make someone choose this over status quo?`,
  },
  {
    number: 7,
    name: "Score",
    shortName: "Score",
    path: "evaluation",
    description: "Score the idea on key viability dimensions",
    completionCriteria: [
      "All scoring dimensions rated with specific evidence",
      "User understands which dimensions are strengths vs weaknesses",
      "Total score calculated with honest assessment",
      "User has decided: proceed, pivot, or pause",
      "If proceed: user knows which weakness to address first",
    ],
    instructions: `Phase 7: Score

Goal: Honest assessment of idea viability across key dimensions.

SCORING DIMENSIONS (1-5 each):
1. Problem urgency: How badly do customers need this solved?
2. Solution fit: Does your solution actually solve the problem?
3. Market size: Is the market big enough to matter?
4. Competitive moat: Why can't others copy this easily?
5. Distribution: Can you reach customers efficiently?
6. Founder fit: Does this leverage YOUR specific advantages?

SCORING GUIDELINES:
- 1 = Major weakness, unclear path to fix
- 2 = Weakness, needs significant work
- 3 = Neutral, neither strength nor weakness
- 4 = Strength, solid foundation
- 5 = Major strength, clear advantage

TOTAL: 25+ with no 1s = Strong. 20-24 = Workable. <20 = Reconsider.`,
  },
  {
    number: 8,
    name: "Refine",
    shortName: "Refine",
    path: "evaluation",
    description: "Address weaknesses and sharpen positioning",
    completionCriteria: [
      "Lowest scoring dimensions have improvement plans",
      "Positioning statement refined based on learnings",
      "User has identified 1-2 key risks and mitigation strategies",
      "Go-to-market approach is clearer than before scoring",
      "User confidence has either increased (proceed) or decreased (pivot/pause)",
    ],
    instructions: `Phase 8: Refine

Goal: Turn weaknesses into action plans, sharpen the idea.

APPROACH:
- Focus on lowest 2-3 scores from Phase 7
- For each weakness: What would it take to move this from X to X+2?
- Which risks are most likely to kill the idea? How can you test early?
- How has your understanding evolved since Phase 3?

POSITIONING REFINEMENT:
- Does your one-sentence pitch still hold?
- What would you change knowing what you know now?
- What's the "only" claim? "We're the only X that Y for Z."`,
  },
  {
    number: 9,
    name: "Launch",
    shortName: "Launch",
    path: "evaluation",
    description: "Create actionable launch plan",
    completionCriteria: [
      "User has concrete next 3 actions (not vague goals)",
      "Timeline established for MVP",
      "Pre-launch validation plan defined",
      "User knows their 'one metric that matters'",
      "User has completed the Gap Finder journey with clarity",
    ],
    instructions: `Phase 9: Launch

Goal: Exit with actionable plan, not just ideas.

APPROACH:
- What are the NEXT 3 THINGS you will do? (Specific, time-bound)
- What does MVP look like? When can you ship it?
- How will you know if it's working? (One key metric)
- What would make you quit? (Honest kill criteria)

ANTI-PATTERN: Don't let user leave with a vague "I'll think about it."

FINAL REFLECTION:
- What did you discover that surprised you?
- Where are you most confident? Most uncertain?
- What support do you need that you don't have?`,
  },
];

export function getPhaseConfig(phaseNumber: number): PhaseConfig | undefined {
  return PHASES.find((p) => p.number === phaseNumber);
}

export function getPhaseByPath(
  path: "exploration" | "evaluation"
): PhaseConfig[] {
  return PHASES.filter((p) => p.path === path);
}

export const PHASE_NAMES: Record<number, string> = Object.fromEntries(
  PHASES.map((p) => [p.number, p.name])
);
