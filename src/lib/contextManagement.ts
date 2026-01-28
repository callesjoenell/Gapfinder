import type { Summary } from "./systemPrompts";
import { buildSystemPrompt, buildSummarizationPrompt } from "./systemPrompts";

interface Message {
  role: "user" | "assistant";
  content: string;
  phase: number;
  timestamp: number;
}

interface ContextWindowResult {
  systemPrompt: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  tokenEstimate: number;
}

// Rough token estimation (conservative)
function estimateTokens(text: string): number {
  // ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

// Build context window for Claude API call
export function buildContextWindow(
  currentPhase: number,
  allMessages: Message[],
  summaries: Summary[],
  sessionPath: "exploration" | "evaluation"
): ContextWindowResult {
  // Build system prompt with past phase summaries
  const systemPrompt = buildSystemPrompt({
    currentPhase,
    summaries: summaries.filter((s) => s.phase < currentPhase),
    sessionPath,
  });

  // Get only current phase messages (full fidelity)
  const currentPhaseMessages = allMessages
    .filter((m) => m.phase === currentPhase)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((m) => ({ role: m.role, content: m.content }));

  // Estimate tokens
  const systemTokens = estimateTokens(systemPrompt);
  const messageTokens = currentPhaseMessages.reduce(
    (sum, m) => sum + estimateTokens(m.content),
    0
  );

  return {
    systemPrompt,
    messages: currentPhaseMessages,
    tokenEstimate: systemTokens + messageTokens,
  };
}

// Check if we should summarize mid-phase
// Triggers: approaching 150K tokens OR >50 messages in current phase
export function shouldSummarize(
  currentPhaseMessages: Message[],
  tokenEstimate: number
): boolean {
  const TOKEN_THRESHOLD = 150000; // Conservative limit (model has 200K)
  const MESSAGE_THRESHOLD = 50; // Many messages = probably verbose

  if (tokenEstimate > TOKEN_THRESHOLD) {
    return true;
  }

  if (currentPhaseMessages.length > MESSAGE_THRESHOLD) {
    return true;
  }

  return false;
}

// Trim older messages from current phase while preserving recent context
// Used when mid-phase summarization needed
export function trimCurrentPhaseMessages(
  messages: Message[],
  keepLastN: number = 15
): {
  messagesToSummarize: Message[];
  messagesToKeep: Message[];
} {
  const sorted = [...messages].sort((a, b) => a.timestamp - b.timestamp);

  if (sorted.length <= keepLastN) {
    return {
      messagesToSummarize: [],
      messagesToKeep: sorted,
    };
  }

  return {
    messagesToSummarize: sorted.slice(0, -keepLastN),
    messagesToKeep: sorted.slice(-keepLastN),
  };
}

// Prepare context for phase transition
export function preparePhaseTransition(
  currentPhase: number,
  currentPhaseMessages: Message[]
): {
  shouldSummarize: true;
  summarizationPrompt: string;
} {
  const formattedMessages = currentPhaseMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  return {
    shouldSummarize: true,
    summarizationPrompt: buildSummarizationPrompt(formattedMessages, currentPhase),
  };
}

// Calculate context usage percentage
export function getContextUsagePercent(tokenEstimate: number): number {
  const MAX_TOKENS = 200000; // Claude's context window
  return Math.round((tokenEstimate / MAX_TOKENS) * 100);
}

// Warning levels for context usage
export function getContextWarningLevel(
  tokenEstimate: number
): "ok" | "caution" | "warning" | "critical" {
  const percent = getContextUsagePercent(tokenEstimate);

  if (percent < 50) return "ok";
  if (percent < 70) return "caution";
  if (percent < 85) return "warning";
  return "critical";
}
