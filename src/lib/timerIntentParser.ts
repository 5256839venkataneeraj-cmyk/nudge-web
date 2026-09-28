/**
 * Phase 1: Command Parsing - Timer Intent Parser
 * 
 * Detects timer commands in chatbox inputs (text or transcribed voice) such as:
 * - "start timer for 10 minutes"
 * - "set a 5 min timer"
 * - "timer 30 sec"
 * - "set 1 hr 30 min timer for Physics review"
 * - "countdown 25 minutes: Pomodoro"
 * 
 * Returns structured object: { action: "SET_TIMER", durationSeconds, label }
 */

export interface TimerIntentResult {
  action: "SET_TIMER";
  durationSeconds: number;
  label?: string;
  originalText?: string;
}

/**
 * Checks if the given text matches a timer intent, and extracts duration in seconds and optional label.
 * Returns null if the text is not a timer command.
 */
export function parseTimerIntent(text: string): TimerIntentResult | null {
  if (!text || typeof text !== "string") {
    return null;
  }

  const raw = text.trim();
  const clean = raw.toLowerCase();

  // 1. Check for primary timer keyword triggers
  const timerTriggers = [
    "timer",
    "countdown",
    "stopwatch", // common colloquial variation
  ];

  const hasTrigger = timerTriggers.some((t) => {
    // Word boundary check for timer/countdown
    const regex = new RegExp(`\\b${t}\\b`, "i");
    return regex.test(clean);
  });

  if (!hasTrigger) {
    return null;
  }

  // Avoid matching non-timer queries like "how does a timer work", "what is a timer", "cancel timer", etc.
  if (
    clean.startsWith("what is") ||
    clean.startsWith("how does") ||
    clean.startsWith("explain") ||
    clean.startsWith("why is")
  ) {
    return null;
  }

  // 2. Extract compound or single durations:
  // Examples: "1 hr 30 min", "1 hour and 30 minutes", "10 minutes", "30 sec", "5m 20s"
  let totalSeconds = 0;
  let durationMatched = false;

  // Patterns for Hours, Minutes, Seconds
  const hoursRegex = /(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/i;
  const minutesRegex = /(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes|minut|minu|m)\b/i;
  const secondsRegex = /(\d+(?:\.\d+)?)\s*(?:s|sec|secs|second|seconds)\b/i;

  const hoursMatch = clean.match(hoursRegex);
  const minutesMatch = clean.match(minutesRegex);
  const secondsMatch = clean.match(secondsRegex);

  if (hoursMatch) {
    const hours = parseFloat(hoursMatch[1]);
    if (!isNaN(hours) && hours > 0) {
      totalSeconds += Math.round(hours * 3600);
      durationMatched = true;
    }
  }

  if (minutesMatch) {
    const mins = parseFloat(minutesMatch[1]);
    if (!isNaN(mins) && mins > 0) {
      totalSeconds += Math.round(mins * 60);
      durationMatched = true;
    }
  }

  if (secondsMatch) {
    const secs = parseFloat(secondsMatch[1]);
    if (!isNaN(secs) && secs > 0) {
      totalSeconds += Math.round(secs);
      durationMatched = true;
    }
  }

  // Also support bare numbers after trigger, e.g., "timer 10", "start timer for 10" (defaulting to minutes)
  if (!durationMatched) {
    const bareNumMatch = clean.match(/(?:timer|countdown|stopwatch)\s+(?:for\s+)?(\d+)/i);
    if (bareNumMatch) {
      const num = parseInt(bareNumMatch[1], 10);
      if (!isNaN(num) && num > 0) {
        // Default bare numbers to minutes (e.g., "timer 10" -> 10 minutes)
        totalSeconds = num * 60;
        durationMatched = true;
      }
    }
  }

  // If no duration could be parsed, it's not an actionable timer command
  if (!durationMatched || totalSeconds <= 0) {
    return null;
  }

  // 3. Extract optional Label / Title
  // Look for separators like "for <label>", "called <label>", "titled <label>", ": <label>", "- <label>"
  let label: string | undefined = undefined;

  // Check for colon or dash labels: "timer 10 min: study math", "set timer 15 min - reading"
  const colonOrDashMatch = raw.match(/[:\-–—]\s*([^.!?,;]+)/i);
  if (colonOrDashMatch && colonOrDashMatch[1]) {
    label = colonOrDashMatch[1].trim();
  }

  if (!label) {
    // Check for "called <label>" or "named <label>"
    const namedMatch = raw.match(/(?:called|named|titled)\s+([^.!?,;]+)/i);
    if (namedMatch && namedMatch[1]) {
      label = namedMatch[1].trim();
    }
  }

  if (!label) {
    // Check for trailing "for <topic>" after the time expression
    // e.g., "start timer for 10 minutes for calculus homework"
    // or "timer 15 min for chemistry"
    const trailingForMatch = raw.match(
      /(?:hours?|hrs?|minutes?|mins?|seconds?|secs?|h|m|s)\s+(?:for|to|on)\s+([^.!?,;]+)/i
    );
    if (trailingForMatch && trailingForMatch[1]) {
      label = trailingForMatch[1].trim();
    }
  }

  // Clean label if it starts with filler words like "a", "my"
  if (label) {
    label = label.replace(/^(a|an|the|my)\s+/i, "").trim();
    // Capitalize first letter
    if (label.length > 0) {
      label = label.charAt(0).toUpperCase() + label.slice(1);
    } else {
      label = undefined;
    }
  }

  return {
    action: "SET_TIMER",
    durationSeconds: totalSeconds,
    label: label || undefined,
    originalText: raw,
  };
}

/**
 * Human-friendly duration formatter for confirmation messages (Phase 3 helper)
 * e.g., 600 -> "10 minutes", 5400 -> "1 hour 30 minutes", 30 -> "30 seconds"
 */
export function formatTimerDuration(durationSeconds: number): string {
  if (durationSeconds <= 0) return "0 seconds";

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  }
  if (seconds > 0 && hours === 0) {
    parts.push(`${seconds} ${seconds === 1 ? "second" : "seconds"}`);
  }

  return parts.join(" ") || `${durationSeconds} seconds`;
}
