export interface PhaseConfig {
  number: number;
  name: string;
  shortName: string;
  path: "exploration" | "evaluation";
  description: string;
  completionCriteria: string[];
  instructions: string;
  coverageTopics: Array<{ key: string; label: string; description: string }>;
  timeEstimate: string;
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
    coverageTopics: [
      { key: "life_situation", label: "Life Situation", description: "Experiences that shaped you — pain overcome, joy discovered, or transformation made" },
      { key: "profession", label: "Profession", description: "Insider knowledge others don't have" },
      { key: "hobbies", label: "Hobbies", description: "Enthusiasm + community access" },
      { key: "skills_others_pay_for", label: "Skills Others Pay For", description: "Proven market value" },
      { key: "networks", label: "Networks", description: "Relationship access advantage" },
      { key: "transformations", label: "Transformations", description: "Journey already completed" },
    ],
    timeEstimate: "15-20 min",
    instructions: `Phase 0: Know Yourself

Your goal: Help user discover their unfair advantages through excavating 6 starting points:
1. Life Situation (pain lived personally OR formative experiences)
2. Profession (insider knowledge others don't have)
3. Hobbies (enthusiasm + community access + passion)
4. Skills Others Pay For (proven market value)
5. Networks (relationship access advantage)
6. Transformations Made (journey already completed)

NOTE: Not all starting points lead to "problems to solve." Some lead to experiences to create, communities to build, or identities to enable. Follow the energy regardless of type.

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
    description: "Research your domain to find gaps worth filling — problems to solve OR experiences to create",
    completionCriteria: [
      "Specific gaps identified with rising energy signals",
      "Segment depth achieved: user has found the person for whom this is ESSENTIAL, not just convenient — can name specific individuals, not demographics",
      "Identity lens applied: who are people trying to become?",
      "Distribution path identified: can user reach these people?",
      "Timing assessed on at least 4 of 6 factors",
      "User has connected gap to their unfair advantage from Phase 0",
    ],
    coverageTopics: [
      { key: "gap_identification", label: "Gap Identification", description: "Specific gaps with energy signals" },
      { key: "segment_depth", label: "Segment Depth", description: "Found the person for whom this is ESSENTIAL, not just convenient" },
      { key: "identity_lens", label: "Identity Lens", description: "Who are people trying to become?" },
      { key: "distribution_path", label: "Distribution Path", description: "Can you reach these people?" },
      { key: "timing_factors", label: "Timing Factors", description: "Why is this solvable now?" },
      { key: "advantage_connection", label: "Advantage Connection", description: "Links gap to unfair advantage" },
    ],
    timeEstimate: "20-25 min",
    instructions: `Phase 1: Find Gaps

Input from Phase 0: User has identified their unfair advantage area(s). Now research THAT specific domain - not random ideation.

APPROACH:
- Identity Lens: "Who are people in this space trying to become? What identity are they constructing?"
- Gap inventory — TWO types to explore:
  * Friction gaps: Where does the journey break down? What makes people quit?
  * Aspiration gaps: What experience do people WISH existed? What would make them feel more connected/alive/capable?
- Validation: Confirm with specific evidence, not assumptions
- Distribution reality check: Can user actually reach these people?
- Timing assessment: What's changed that makes this possible NOW?

SEGMENT DEPTH (Critical — refer to Need Depth System in main prompt):
When a gap sounds broadly appealing, apply the Deepening Protocol:
1. Name it — reflect that current positioning sounds like level 1-2 on the Need Depth Ladder
2. Segment — help user identify 3-5 different types of people who might care, varying by life situation, emotional state, frequency of need, and failed alternatives
3. Probe each — for each segment, assess: how often, what workarounds exist, what would they feel if this existed, would they tell others
4. Find the peak — the segment with longest answers, most specifics, emotional language
5. Reframe — rebuild the gap description around THAT person's specific situation

SEGMENT DEPTH SIGNALS (marks "deep" on coverage):
- User names a SPECIFIC person or vivid archetype, not a demographic
- User can articulate WHY this is urgent/essential for that person (not just useful)
- For pain-driven ideas: user describes failed workarounds and emotional cost of the status quo
- For aspiration-driven ideas: user describes what the person does TODAY to get even a partial version (communities they join, premium they pay, DIY rituals they create) and what's still missing
- For community/identity ideas: user describes the longing to belong, the identity they're building, what finding "their people" would mean
- User shows personal connection — they've felt this need, this longing, or deeply witnessed it
- The need sits at level 4-5 on the Need Depth Ladder: seeking or urgency (pain OR aspiration form)

TIMING FACTORS (assess at least 4):
1. Technology: Is new tech making something possible?
2. Regulation: Did rules change to create opportunity?
3. Market: Is demand shifting in relevant ways?
4. Cultural: Are attitudes/behaviors changing?
5. Economic: Are cost structures shifting?
6. Platform: Are distribution channels opening?

Watch for: User seeing gaps they've PERSONALLY experienced — whether pain they've felt OR experiences they've craved. Organic ideas from their life, not abstract market research.

IMPORTANT: A "gap" isn't always a "problem." It can be:
- Something broken that needs fixing (problem)
- Something missing that people would love (opportunity)
- A way to deepen connection, belonging, or identity (experience)
- A new combination that nobody has tried (innovation)`,
  },
  {
    number: 2,
    name: "Research",
    shortName: "Research",
    path: "exploration",
    description: "Validate gaps and opportunities through evidence gathering",
    completionCriteria: [
      "User has found 3+ external data points supporting the gap",
      "User has identified 2+ competitor/alternative approaches",
      "User understands why existing solutions fall short",
      "Need acuity validated: evidence that target segment finds this essential, not just convenient",
      "Clear signal that market is big enough to matter",
      "User can articulate who is already spending money in this space",
    ],
    coverageTopics: [
      { key: "external_data_points", label: "External Data Points", description: "Evidence supporting the gap" },
      { key: "need_acuity", label: "Need Acuity", description: "Evidence this is essential (not just nice-to-have) for the target segment" },
      { key: "competitor_analysis", label: "Competitor Analysis", description: "Who else is in this space?" },
      { key: "market_size", label: "Market Size", description: "Is the market big enough?" },
      { key: "money_signals", label: "Money Signals", description: "Who's spending money here?" },
      { key: "assumption_challenges", label: "Assumption Challenges", description: "Where might you be wrong?" },
    ],
    timeEstimate: "25-30 min",
    instructions: `Phase 2: Research

Goal: Validate the gap or opportunity with external evidence, not just personal belief.

APPROACH:
- Help user find data points: market size, competitor gaps, customer complaints OR desire signals
- Apply Mom Test thinking: Look for what people DO, not what they SAY they'd do
- Identify existing alternatives: How are people addressing this now? (Even poorly or partially)
- Challenge assumptions: Where might user be wrong?

EVIDENCE TYPES TO SEEK:
For problem-driven ideas:
- Reddit/forum complaints with engagement
- Competitor reviews (1-2 stars reveal unmet needs)
- Job postings (what companies are hiring for)

For opportunity/experience-driven ideas:
- Communities showing strong identity/belonging signals
- Viral content showing unmet desire ("I wish...", "Why doesn't X exist?")
- Adjacent experiences people pay premium for (concerts, retreats, communities)
- Cultural trends enabling new types of experiences

For both:
- Industry reports with trend data
- Pricing benchmarks (what people actually pay for related things)

NEED ACUITY VALIDATION (refer to Need Depth System in main prompt):
The most important research question: WHERE does the target segment sit on the Need Depth Ladder?

Research that reveals level 4-5 (seeking/urgency):

For pain-driven ideas:
- People actively searching for solutions (Reddit threads, forum posts asking "how do I...")
- Emotional language: frustration, desperation, relief when finding partial solutions
- People spending time/money on poor workarounds — the more effort, the higher the need
- Recurring need (daily frustration, life-stage pressure)

For aspiration/identity/community ideas (equally valid at level 4-5):
- People forming communities around this desire (Discord servers, meetups, subreddits, hashtags)
- People paying premium for adjacent experiences (retreats, masterclasses, memberships, festivals)
- People creating DIY versions or rituals to get even a partial version of the feeling
- Emotional language: longing, yearning, "I wish I could find...", "I want to be someone who..."
- Identity investment: people already adopting labels, aesthetics, or behaviors associated with the aspiration
- People describe how finding this community/experience would change who they ARE, not just what they DO

Research that reveals level 1-2 (curiosity/interest):
- Positive reactions but no follow-through ("cool idea" without action)
- No existing workarounds AND no existing communities forming around this desire
- Need only arises in rare or low-stakes moments
- "I'd try it if it was free" — willingness without investment
- Discussion is about the product features, not about the person's experience or identity

If research shows level 1-2 for the current target: DON'T ABANDON THE IDEA. The product may be right but the audience is wrong. Apply the Deepening Protocol:
- "Research shows mild interest from this broad audience. That's useful — it tells us this isn't the right PERSON yet. Who in this space has the most intense version of this need?"
- Look for subgroups where the frequency, emotional weight, or identity connection is dramatically higher
- Re-research with the new segment in mind

ANTI-PATTERN: Don't let user rely on "everyone says..." without specifics. But also don't dismiss desire-driven ideas just because there's no "complaint" to point to.`,
  },
  {
    number: 3,
    name: "Your Idea",
    shortName: "Idea",
    path: "evaluation",
    description: "Crystallize the idea into a clear statement",
    completionCriteria: [
      "User has a one-sentence idea statement naming a SPECIFIC person with an URGENT need",
      "Idea connects unfair advantage (Phase 0) to validated gap (Phase 1-2)",
      "User can articulate: Who is this for? What does it solve or make possible? Why them?",
      "The idea is positioned as ESSENTIAL for a specific segment, not convenient for a broad audience",
      "User has identified what makes this DIFFERENT from alternatives",
      "User expresses genuine ownership ('I want to build this' not 'This seems viable')",
    ],
    coverageTopics: [
      { key: "idea_statement", label: "Idea Statement", description: "Clear one-sentence crystallization" },
      { key: "advantage_connection", label: "Advantage Connection", description: "Links Phase 0 to validated gap" },
      { key: "target_audience", label: "Target Audience", description: "Who is this for?" },
      { key: "differentiation", label: "Differentiation", description: "What makes this different?" },
      { key: "ownership_signals", label: "Ownership Signals", description: "User defends and owns the idea" },
    ],
    timeEstimate: "15-20 min",
    instructions: `Phase 3: Your Idea

Goal: Crystallize everything into a clear idea statement the user OWNS.

APPROACH:
- Help user synthesize Phases 0-2 into a coherent narrative
- The idea should feel like THEIR discovery, not your suggestion
- Challenge weak connections: "I see you mentioned X, but how does it connect to Y?"
- Test ownership: User should defend the idea, not just accept it

IDEA STATEMENT FORMAT (choose the one that fits):
- Problem: "I help [specific person] solve [specific problem] by [unique approach]."
- Opportunity: "I create [specific experience/outcome] for [specific person] by [unique approach]."
- Identity: "I help [specific person] become [who they want to be] through [unique approach]."

Don't force problem framing on experience/identity ideas.

PRODUCT OPINION TEST:
After the idea statement, push the user to give their product a STANCE:
- "What's this product's OPINION about the world? What does it believe?"
- "Who would LOVE this framing — and who would roll their eyes?"
- A generic product serves everyone blandly. A product with an opinion creates a tribe.
- Example: A shared todo list is generic. "Happy Hubby" — where the wife assigns location-based tasks for the husband — takes a stance on modern family dynamics. Same features, but now people identify WITH it, talk about it, argue about it. The opinion IS the marketing.
- Test: "If someone saw this product, would they immediately know if it's FOR THEM or NOT? If the answer is 'maybe' — the opinion isn't sharp enough."
- Don't force it if it doesn't fit, but MOST ideas benefit from a point of view. Even B2B products can have opinions ("We believe spreadsheets are where ideas go to die").

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
      "User has identified customer's trigger moment — struggling moment OR desire awakening (JTBD)",
      "User can describe customer's current workaround",
      "User has plan to reach 5+ potential customers for validation",
    ],
    coverageTopics: [
      { key: "customer_profile", label: "Customer Profile", description: "Specific individuals, not personas" },
      { key: "gathering_places", label: "Gathering Places", description: "Where do they hang out?" },
      { key: "trigger_moment", label: "Trigger Moment", description: "Struggling moment OR desire awakening (JTBD)" },
      { key: "current_workaround", label: "Current Workaround", description: "How do they solve this now?" },
      { key: "reach_plan", label: "Reach Plan", description: "How will you reach 5+ customers?" },
    ],
    timeEstimate: "20-25 min",
    instructions: `Phase 4: Customers

Goal: Move from "people who might use this" to SPECIFIC individuals you can reach — then prepare to actually talk to them.

APPROACH (Switch Interview Style):
- Find the trigger moment — could be either:
  * Struggling moment: "When did they first realize the old way wasn't working?"
  * Desire moment: "When did they first wish this experience existed?" or "What made them crave more?"
- Map the timeline: First thought -> Passive looking -> Active looking -> Decision
- Identify Push (what's wrong), Pull (what's attractive), Anxiety (holds back), Habit (keeps stuck)
- For experience/community ideas, also explore: belonging signals, identity investment, willingness to participate

SPECIFICITY TEST:
- Can user NAME 5 real people who fit? (Not just describe)
- Can user describe their day-to-day work/life?
- Does user know what these people read, where they hang out online?
- For community/experience ideas: Are these people already finding each other? What do they do together now?

WARNING: Generic personas = generic ideas. Push for REAL people.

HOMEWORK LOOP — SENDING THEM OUT:
Once user has identified 3-5 specific people to talk to:
1. Help them prepare: what to ask, what to listen for, what assumptions to test
2. Tell them: "Type 'show conversation prep' to get a prep form you can take with you"
3. Be explicit: "Go have these conversations. Take notes. Come back and we'll debrief."
4. When they return, open Phase 5 by saying: "Welcome back. Tell me — who did you talk to, and what happened?"
5. Tell them: "Type 'show debrief' to capture your conversation while it's fresh — one per person"

This is the CRITICAL moment in the process. Everything before was thinking. This is doing. Don't rush past it.`,
  },
  {
    number: 5,
    name: "Problem",
    shortName: "Prob",
    path: "evaluation",
    description: "Validate the problem or opportunity is worth pursuing",
    completionCriteria: [
      "User has talked to at least 3 potential customers",
      "Need confirmed through BEHAVIOR evidence (not just opinions) — what people DO or actively seek",
      "User understands the stakes: cost of the problem OR value of the desired experience (time/money/emotion)",
      "Frequency or intensity established (daily pain? seasonal desire? life-stage trigger?)",
      "User can rank urgency vs other priorities in customer's life",
    ],
    coverageTopics: [
      { key: "customer_conversations", label: "Customer Conversations", description: "Talked to 3+ real people" },
      { key: "behavior_evidence", label: "Behavior Evidence", description: "What they do vs what they say" },
      { key: "stakes", label: "Stakes", description: "Cost of problem OR value of desired experience" },
      { key: "frequency_intensity", label: "Frequency / Intensity", description: "How often or how strongly does this need arise?" },
      { key: "priority_ranking", label: "Priority Ranking", description: "Where does this rank in their life?" },
    ],
    timeEstimate: "20-25 min",
    instructions: `Phase 5: Problem / Opportunity Validation

Goal: Confirm the need exists AND is strong enough to pay for (or invest time/attention in) — based on REAL conversations, not assumptions.

OPENING — DEBRIEF FIRST:
If user has conversation debrief forms submitted, start by analyzing them:
- "I can see you talked to [N] people. Let's unpack what you learned."
- Look for PATTERNS across conversations, not individual anecdotes
- Highlight: where did multiple people light up? Where did they go quiet?

If user hasn't submitted debriefs yet:
- "Before we validate, I need to know what happened in your conversations. Type 'show debrief' to capture each one."
- Don't proceed with validation until at least 2-3 debriefs are submitted

APPROACH (Mom Test):
- Ask about their life, not your idea
- Past behavior > future intentions
- Compliments are not data
- Specific facts trump opinions

DEBRIEF ANALYSIS QUESTIONS:
- "Across your conversations, what came up more than once?"
- "Who seemed most energized? What were they talking about when that happened?"
- "Did anyone surprise you — said something you didn't expect?"
- "Did anyone's reaction make you doubt your idea? That's valuable data."

FOR PROBLEM-DRIVEN IDEAS — find the STRUGGLING MOMENT:
- "What happened last time they faced this?"
- "What did they do? What did that cost them?"
- "Have they tried to solve this before? What happened?"

FOR EXPERIENCE/IDENTITY/COMMUNITY IDEAS — find the CALLING MOMENT:
- "When did they first realize they wanted to be this kind of person? What triggered that?"
- "What's the closest thing to this that exists today? How often do they seek it out? What's missing?"
- "What would they give up to have this experience or find this community? (time, money, travel, comfort)"
- "What do they do NOW to get even a partial version of this feeling? (DIY rituals, adjacent communities, premium experiences)"
- "What would it mean to finally FIND their people or BECOME who they want to be?"

The calling moment is as powerful as the struggling moment. It sounds like:
- "I've always wanted to..." / "I've been searching for..." / "I want to be someone who..."
- The person has ALREADY been investing (time, money, identity) in the direction of this aspiration
- They can describe specific attempts to get closer to this experience or identity

VALIDATION SIGNALS (all types):
- Customer has actively sought this (tried to solve, sought the experience, OR joined adjacent communities)
- Customer can quantify what they'd invest (time/money/attention)
- Need is frequent or intense enough to remember details
- Customer gets emotional when describing it (frustration OR longing/excitement OR belonging hunger)
- Multiple people independently confirm the same pattern
- For community/identity ideas: people already forming informal groups, adopting identity markers, or paying premium for partial versions of this experience

RED FLAGS:
- "That sounds cool" with no follow-up = polite disinterest
- User can't get people to agree to a 15-minute call = weak signal
- Everyone was nice but nobody asked "when can I use this?" = validate harder`,
  },
  {
    number: 6,
    name: "Solution",
    shortName: "Sol",
    path: "evaluation",
    description: "Design solution or experience that uniquely fits the validated need",
    completionCriteria: [
      "Solution directly addresses validated need from Phase 5 (problem solved OR experience created)",
      "User can explain why THIS solution (not alternatives)",
      "MVP scope defined (what's the smallest thing that delivers the core value?)",
      "User understands technical feasibility at high level",
      "Solution leverages user's unfair advantage from Phase 0",
    ],
    coverageTopics: [
      { key: "need_solution_fit", label: "Need-Solution Fit", description: "Solution addresses validated need (problem or opportunity)" },
      { key: "why_this_solution", label: "Why This Solution", description: "Why not alternatives?" },
      { key: "mvp_scope", label: "MVP Scope", description: "Smallest viable version" },
      { key: "technical_feasibility", label: "Technical Feasibility", description: "Can this be built?" },
      { key: "advantage_leverage", label: "Advantage Leverage", description: "Uses unfair advantage from Phase 0" },
    ],
    timeEstimate: "20-25 min",
    instructions: `Phase 6: Solution

Goal: Design minimum viable solution or experience that uniquely fits validated need.

APPROACH:
- Start with the validated need, work backward to solution
- What's the SMALLEST thing that delivers the core value?
- Why is YOUR approach better than alternatives? (Connect to unfair advantage)
- What can you NOT do in v1? (Scope discipline)

TESTS:
- Does solution require user's specific advantages?
- Could user ship v1 in 2-4 weeks?
- Is there a clear "magic moment" when someone gets value?
- What would make someone choose this over the status quo or doing nothing?
- For experience ideas: What's the minimum that creates the emotional payoff?

COMMUNITY AS ARCHITECTURE (not afterthought):
Ask: "How does user #1 bring user #2? Is community baked into the product or bolted on after?"
- Baked in: the product gets BETTER with more people (shared lists, group challenges, local networks, team features). User naturally invites others because the product works better together.
- Bolted on: you add a "share" button and hope. This rarely works.
- Even solo products can have community layers: leaderboards, shared templates, "made with X" watermarks, public profiles.
- Key question: "What would users DO TOGETHER that they can't do alone? Is there a ritual, a shared moment, a reason to bring someone in?"
- If the answer is "nothing" — that's fine, not every product needs community. But flag it as a distribution weakness in Phase 7 scoring.`,
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
    coverageTopics: [
      { key: "need_intensity", label: "Need Intensity", description: "How strongly do customers need or want this?" },
      { key: "solution_fit", label: "Solution Fit", description: "Does solution solve the problem?" },
      { key: "market_size", label: "Market Size", description: "Is market big enough?" },
      { key: "competitive_moat", label: "Competitive Moat", description: "Why can't others copy easily?" },
      { key: "distribution", label: "Distribution", description: "Can you reach customers efficiently?" },
      { key: "founder_fit", label: "Founder Fit", description: "Leverages your specific advantages?" },
    ],
    timeEstimate: "15-20 min",
    instructions: `Phase 7: Score

Goal: Honest assessment of idea viability across key dimensions.

SCORING DIMENSIONS (1-5 each):
1. Need intensity: How strongly do customers need or desire this? Assess on the Need Depth Ladder:
   - 1 = Level 1-2 (curiosity/interest — no one is seeking this)
   - 2-3 = Level 3 (desire — people want it but manage without)
   - 4 = Level 4 (seeking — actively trying workarounds OR paying for partial versions of the experience)
   - 5 = Level 5 (urgency — would rearrange priorities, either pain relief OR identity/belonging/transformation need)
   Note: Pain-driven AND aspiration-driven needs can score 5. "I desperately need to solve X" and "I need to find my people / become this person" are equally powerful.
2. Solution fit: Does your solution actually deliver the value?
3. Market size: Is the market big enough to matter?
4. Competitive moat: Why can't others copy this easily? For community/identity ideas, moat often comes from network effects, culture, and belonging — not just features.
5. Distribution: Can you reach customers efficiently? For community ideas, distribution is often organic — people who belong will recruit others.
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
    coverageTopics: [
      { key: "weakness_plans", label: "Weakness Plans", description: "Plans for low-scoring dimensions" },
      { key: "positioning", label: "Positioning", description: "Refined pitch statement" },
      { key: "risk_mitigation", label: "Risk Mitigation", description: "Key risks and how to test early" },
      { key: "go_to_market", label: "Go-to-Market", description: "Clearer approach than Phase 7" },
      { key: "confidence_assessment", label: "Confidence Assessment", description: "Proceed, pivot, or pause?" },
    ],
    timeEstimate: "20-25 min",
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
- What's the "only" claim? "We're the only X that Y for Z."

SHARPEN THE PRODUCT OPINION:
If the idea has an opinion from Phase 3, now stress-test and sharpen it:
- "Is the opinion strong enough? Would someone share this BECAUSE of the stance, not despite it?"
- "Name the tribe. What do your users call themselves? What's the insider language?"
- "Does the opinion show up in the product itself — naming, copy, features, defaults — or is it just marketing veneer?"
- If the opinion has softened since Phase 3, challenge that: "You started with a sharp take. What made you water it down? Was it fear of excluding people — or real evidence it doesn't work?"
- The best products are loved by some BECAUSE others hate them. "Not for everyone" is a feature.

If the idea doesn't have an opinion yet, this is the last chance:
- "Right now this could be anyone's product. What would make it YOURS? What's the worldview?"
- "If your product could wear a t-shirt with a slogan, what would it say?"

STRENGTHEN COMMUNITY EFFECTS:
If community was identified in Phase 6, now deepen it:
- "What's the community ritual? The thing members do together regularly that reinforces belonging?"
- "How does the community grow itself? Word of mouth is passive — what's the ACTIVE mechanism?"
- "What happens when 10 people use this vs 1000? Does the experience fundamentally change?"
- Network effects compound: each new user makes it better for existing users. If that's not happening, community is decoration, not architecture.

If community wasn't part of Phase 6, probe whether it should be:
- "Your distribution scored [X] in Phase 7. Could community be the missing growth engine?"
- "Are your users already finding each other outside your product? If yes, you're leaving value on the table."`,
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
      "User has completed the Start Building Now journey with clarity",
    ],
    coverageTopics: [
      { key: "next_actions", label: "Next Actions", description: "Concrete next 3 steps" },
      { key: "mvp_timeline", label: "MVP Timeline", description: "When can you ship?" },
      { key: "validation_plan", label: "Validation Plan", description: "How will you test pre-launch?" },
      { key: "key_metric", label: "Key Metric", description: "One metric that matters" },
      { key: "final_reflection", label: "Final Reflection", description: "Journey completion insights" },
    ],
    timeEstimate: "15-20 min",
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

/**
 * Get the topic keys for a specific phase
 */
export function getTopicKeys(phaseNumber: number): string[] {
  const phase = getPhaseConfig(phaseNumber);
  if (!phase) return [];
  return phase.coverageTopics.map((topic) => topic.key);
}
