import { getPhaseConfig, getPhaseByPath } from "./phaseConfig";
import type { Summary } from "./systemPrompts";

export interface ConversationContext {
  currentPhase: number;
  sessionPath: "exploration" | "evaluation";
  summaries: Summary[];
  isFirstSession: boolean; // first session ever for this user
  isNewSession: boolean; // first message in this session (no messages yet)
  otherSessionNames?: string[]; // names of user's other active sessions
  coverageState: Record<string, string> | null; // topic -> depth level
  energyLevel: "high" | "moderate" | "low";
  researchIntensity: "low" | "medium" | "high";
  searchedSources: string[];
  researchFindings: Array<{ source: string; query: string }>;
}

/**
 * Build journey framing section for system prompt.
 * Differs based on session state: first session gets full roadmap, returning users get recap.
 */
export function buildJourneyFraming(context: ConversationContext): string {
  const { sessionPath, currentPhase, isFirstSession, isNewSession, otherSessionNames } = context;

  const pathPhases = getPhaseByPath(sessionPath);
  const currentPhaseConfig = getPhaseConfig(currentPhase);

  if (!currentPhaseConfig) {
    return "";
  }

  // First session ever - full welcome + roadmap
  if (isFirstSession && isNewSession) {
    const roadmap = pathPhases
      .map((p) => `  - **Phase ${p.number}: ${p.name}** (${p.timeEstimate}) - ${p.description}`)
      .join("\n");

    return `Welcome to Start Building Now! You're on the ${sessionPath === "exploration" ? "Exploration" : "Evaluation"} path.

Here's what we'll work through together:

${roadmap}

We're starting at Phase ${currentPhase}: ${currentPhaseConfig.name}.`;
  }

  // New session but not first - returning user
  if (isNewSession) {
    const sessionCount = otherSessionNames ? otherSessionNames.length : 0;
    const sessionContext = sessionCount > 0
      ? `Welcome back! You have ${sessionCount} other session${sessionCount === 1 ? "" : "s"} going. Let's pick up something new.`
      : "Welcome back! Let's start fresh.";

    const roadmap = pathPhases
      .map((p) => `  - **Phase ${p.number}: ${p.name}** (${p.timeEstimate}) - ${p.description}`)
      .join("\n");

    return `${sessionContext}

Here's the ${sessionPath === "exploration" ? "Exploration" : "Evaluation"} journey ahead:

${roadmap}

We're starting at Phase ${currentPhase}: ${currentPhaseConfig.name}.`;
  }

  // Continuing session - brief context
  const otherSessionContext = otherSessionNames && otherSessionNames.length > 0
    ? ` You're also working on ${otherSessionNames.join(", ")} in other sessions.`
    : "";

  return `We're in Phase ${currentPhase}: ${currentPhaseConfig.name}.${otherSessionContext}`;
}

/**
 * Build coverage map showing what topics have been covered and to what depth.
 */
export function buildCoverageMap(
  phaseNumber: number,
  coverageState: Record<string, string> | null
): string {
  const phaseConfig = getPhaseConfig(phaseNumber);

  if (!phaseConfig) {
    return "";
  }

  if (!coverageState) {
    return "No coverage data yet — this is the start of the conversation.";
  }

  const depthSymbols = {
    not_mentioned: "○",
    surface: "◔",
    moderate: "◑",
    deep: "●"
  };

  const depthLabels = {
    not_mentioned: "not explored",
    surface: "surface mention",
    moderate: "moderate depth",
    deep: "deep exploration"
  };

  // Build topic list
  const topicList = phaseConfig.coverageTopics
    .map((topic) => {
      const depth = coverageState[topic.key] || "not_mentioned";
      const symbol = depthSymbols[depth as keyof typeof depthSymbols] || "○";
      const label = depthLabels[depth as keyof typeof depthLabels] || "not explored";

      return `- ${topic.label}: ${symbol} ${label}`;
    })
    .join("\n");

  // Calculate coverage summary
  const depths = Object.values(coverageState);
  const moderatePlus = depths.filter((d) => d === "moderate" || d === "deep").length;
  const total = phaseConfig.coverageTopics.length;
  const missing = phaseConfig.coverageTopics
    .filter((t) => !coverageState[t.key] || coverageState[t.key] === "not_mentioned")
    .map((t) => t.label);

  let summary = `Coverage: ${moderatePlus}/${total} topics at moderate+ depth.`;
  if (missing.length > 0) {
    summary += ` Still to explore: ${missing.join(", ")}.`;
  }

  return `${topicList}\n\n${summary}`;
}

/**
 * Build pacing guidance based on detected energy level.
 * Guides response length, question count, and topic shifting.
 */
export function buildPacingGuidance(energyLevel: "high" | "moderate" | "low"): string {
  const guidance = {
    high: `User is highly engaged (long responses, specific examples, emotional language).
- PACE: Match their energy with detailed responses
- LEAD: Explore depth on current topic; don't switch topics yet
- QUESTIONS: 1-2 questions maximum per response
- LENGTH: Mirror their message length
- APPROACH: Use reflections more than questions when energy is high`,

    moderate: `User is engaged but not energized.
- PACE: Moderate response length, stay focused
- LEAD: Gentle topic shifts if current area seems depleted
- QUESTIONS: 1 open-ended question per response
- LENGTH: Slightly shorter than their messages
- APPROACH: Balance reflections and questions`,

    low: `User showing low energy (short answers, repetition, vague responses).
- PACE: Brief, focused responses
- LEAD: Summarize what's covered, bridge to related topic
- QUESTIONS: One direct question with clear purpose
- LENGTH: Match brevity; don't overwhelm
- APPROACH: Consider offering: "We've covered X. Ready to explore Y, or want to dig deeper here?"`
  };

  return guidance[energyLevel];
}

/**
 * Build research intensity guidance for system prompt.
 * Controls how aggressively Claude suggests research.
 */
export function buildResearchIntensityGuidance(
  intensity: "low" | "medium" | "high",
  searchedSources: string[]
): string {
  const intensityRules = {
    low: "Only flag major unsupported claims (e.g., 'everyone wants X', 'no one has solved Y')",
    medium: "Flag claims, competitor mentions, and clear pain point descriptions",
    high: "Flag everything including implicit assumptions (e.g., 'users probably', 'I assume')"
  };

  let guidance = `Research intensity: ${intensity}\n- ${intensityRules[intensity]}`;

  if (searchedSources.length > 0) {
    guidance += `\n- Already searched: ${searchedSources.join(", ")}. Don't re-suggest these.`;
  }

  guidance += `\n- When suggesting research, offer 2-3 options maximum.`;
  guidance += `\n- CRITICAL: Always ASK before researching, never auto-trigger.`;

  return guidance;
}

/**
 * Build guidance for referencing past research findings.
 */
export function buildResearchReferenceGuidance(
  findings: Array<{ source: string; query: string }>
): string {
  if (findings.length === 0) {
    return "No research conducted yet this session.";
  }

  const findingsList = findings
    .map((f) => `- ${f.source}: "${f.query}"`)
    .join("\n");

  return `Research conducted this session:
${findingsList}

When relevant, reference these findings inline. Quote key points AND point to Research panel for details.

CRITICAL: Be honest when results are empty. Don't interpret empty results — acknowledge them and pivot.`;
}

/**
 * Infer energy level from recent user messages.
 * Simple heuristic based on message length and trends.
 */
export function inferEnergyLevel(
  recentMessages: Array<{ role: string; content: string }>
): "high" | "moderate" | "low" {
  // Filter to user messages only
  const userMessages = recentMessages
    .filter((m) => m.role === "user")
    .slice(-5); // Last 5 user messages

  if (userMessages.length === 0) {
    return "moderate"; // Default
  }

  // Calculate average message length
  const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;

  // Check if energy is dropping (last 2 messages shorter than previous ones)
  const isDropping = userMessages.length >= 3 &&
    userMessages.slice(-2).every((m, i) => {
      const prevIndex = userMessages.length - 3 + i;
      return m.content.length < userMessages[prevIndex].content.length;
    });

  if (isDropping) {
    return "low"; // Energy cooling
  }

  // Length-based energy levels
  if (avgLength < 50) {
    return "low";
  } else if (avgLength > 200) {
    return "high";
  } else {
    return "moderate";
  }
}
