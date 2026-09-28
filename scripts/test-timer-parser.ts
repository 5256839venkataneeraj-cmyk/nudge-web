import { parseTimerIntent, formatTimerDuration } from "../src/lib/timerIntentParser";

interface TestCase {
  input: string;
  expectedAction: "SET_TIMER" | null;
  expectedDuration?: number;
  expectedLabel?: string;
}

const testCases: TestCase[] = [
  {
    input: "start timer for 10 minutes",
    expectedAction: "SET_TIMER",
    expectedDuration: 600,
  },
  {
    input: "set a 5 min timer",
    expectedAction: "SET_TIMER",
    expectedDuration: 300,
  },
  {
    input: "timer 30 sec",
    expectedAction: "SET_TIMER",
    expectedDuration: 30,
  },
  {
    input: "start timer for 10 minutes for Calculus homework",
    expectedAction: "SET_TIMER",
    expectedDuration: 600,
    expectedLabel: "Calculus homework",
  },
  {
    input: "set 1 hr 30 min timer: Chemistry lab prep",
    expectedAction: "SET_TIMER",
    expectedDuration: 5400,
    expectedLabel: "Chemistry lab prep",
  },
  {
    input: "countdown 25 minutes called Pomodoro sprint",
    expectedAction: "SET_TIMER",
    expectedDuration: 1500,
    expectedLabel: "Pomodoro sprint",
  },
  {
    input: "timer 45 seconds",
    expectedAction: "SET_TIMER",
    expectedDuration: 45,
  },
  {
    input: "set a 2 hour timer",
    expectedAction: "SET_TIMER",
    expectedDuration: 7200,
  },
  {
    input: "hello how are you today",
    expectedAction: null,
  },
  {
    input: "what is on my schedule for tomorrow?",
    expectedAction: null,
  },
  {
    input: "explain how a timer works in javascript",
    expectedAction: null,
  },
];

console.log("=== RUNNING PHASE 1 TIMER INTENT PARSER TESTS ===\n");
let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const result = parseTimerIntent(tc.input);

  if (tc.expectedAction === null) {
    if (result === null) {
      console.log(`✅ PASS (Ignored non-timer): "${tc.input}"`);
      passed++;
    } else {
      console.error(`❌ FAIL: Expected null for "${tc.input}", got:`, result);
      failed++;
    }
  } else {
    if (!result) {
      console.error(`❌ FAIL: Expected SET_TIMER for "${tc.input}", but got null`);
      failed++;
      continue;
    }

    const durationOk = result.durationSeconds === tc.expectedDuration;
    const labelOk = !tc.expectedLabel || result.label?.toLowerCase() === tc.expectedLabel.toLowerCase();

    if (durationOk && labelOk) {
      console.log(
        `✅ PASS: "${tc.input}" => { action: "${result.action}", durationSeconds: ${result.durationSeconds} (${formatTimerDuration(result.durationSeconds)})${result.label ? `, label: "${result.label}"` : ""} }`
      );
      passed++;
    } else {
      console.error(
        `❌ FAIL: "${tc.input}"\n  Expected duration: ${tc.expectedDuration}, Got: ${result.durationSeconds}\n  Expected label: ${tc.expectedLabel}, Got: ${result.label}`
      );
      failed++;
    }
  }
}

console.log(`\nSummary: ${passed} Passed, ${failed} Failed`);
if (failed > 0) process.exit(1);
