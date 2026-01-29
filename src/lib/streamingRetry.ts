/**
 * Streaming retry utility with exponential backoff and error translation.
 *
 * Retries silently up to maxRetries, shows error only after all retries fail.
 * Translates API errors to user-friendly messages.
 */

// Retry configuration
const DEFAULT_MAX_RETRIES = 3;
const BASE_DELAY_MS = 200;

/**
 * Execute an async function with exponential backoff retry.
 * Retries silently on 5xx errors and network failures.
 * Does NOT retry on 4xx errors (client errors).
 *
 * @param fn - Async function to execute
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @returns Result of the async function
 */
export async function streamWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = DEFAULT_MAX_RETRIES
): Promise<T> {
  let lastError: Error = new Error("Unknown error");

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if it's a client error (4xx) - don't retry
      if (isClientError(error)) {
        throw error;
      }

      // On last attempt, throw
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff with jitter: 200ms, 400ms, 800ms
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      const jitter = Math.random() * 100;
      await sleep(delay + jitter);
    }
  }

  throw lastError;
}

/**
 * Translate API errors to user-friendly messages.
 * Keeps technical details in console, shows simple message to user.
 *
 * @param error - Error from API call
 * @returns Human-friendly error message
 */
export function translateError(error: unknown): string {
  // Log full error for debugging
  console.error("Chat error:", error);

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Rate limiting
    if (message.includes("429") || message.includes("rate limit")) {
      return "Claude is busy right now. Please wait a moment and try again.";
    }

    // Overloaded
    if (message.includes("529") || message.includes("overloaded")) {
      return "Claude is experiencing high demand. Please try again in a few seconds.";
    }

    // Authentication
    if (message.includes("401") || message.includes("unauthorized")) {
      return "Session expired. Please refresh the page.";
    }

    // Network errors
    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("timeout")
    ) {
      return "Connection issue. Please check your internet and try again.";
    }

    // Server errors (5xx)
    if (
      message.includes("500") ||
      message.includes("502") ||
      message.includes("503")
    ) {
      return "Something went wrong on our end. Please try again.";
    }
  }

  // Generic fallback
  return "Failed to send message. Please try again.";
}

// Helpers

/**
 * Check if error is a client error (4xx status code).
 * Client errors should not be retried.
 */
function isClientError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message;
    // 4xx errors are client errors - don't retry
    return /\b4\d{2}\b/.test(message);
  }
  return false;
}

/**
 * Sleep for specified milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
