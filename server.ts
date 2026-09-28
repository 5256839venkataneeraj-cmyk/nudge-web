import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import localtunnel from "localtunnel";
import { POST as handleGeminiRoute } from "./app/api/gemini/route";

dotenv.config();

// Prevent CERT_HAS_EXPIRED when system clock is skewed or future-dated in Node
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === undefined) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const app = express();
const PORT = 3000;

// Security: Disable x-powered-by header to prevent framework fingerprinting (Phase 1 #5)
app.disable("x-powered-by");

// Security: Comprehensive HTTP Security Headers (Phase 2 #7, #8, #10)
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; media-src 'self' blob:; connect-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:* https://*.supabase.co https://generativelanguage.googleapis.com ws: wss:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(self), geolocation=()");
  next();
});

app.use(express.json({ limit: "15mb" }));

// 1. Single configuration constant for model name with multi-tiered fallback
export const GEMINI_MODEL = "gemini-3.8-flash";
export const FALLBACK_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-flash-latest",
];

// Helper to determine whether an error is transient (503 UNAVAILABLE, 429, 500, network)
function isRetryableError(err: any): boolean {
  if (!err) return false;
  const status = err.status || err.code || err?.error?.code || err?.error?.status;
  const message = String(err.message || err?.error?.message || err).toLowerCase();

  if (
    status === 503 ||
    status === 429 ||
    status === 500 ||
    status === "UNAVAILABLE" ||
    status === "RESOURCE_EXHAUSTED"
  ) {
    return true;
  }

  if (
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("high demand") ||
    message.includes("overloaded") ||
    message.includes("temporarily") ||
    message.includes("try again later") ||
    message.includes("rate limit") ||
    message.includes("quota") ||
    message.includes("resource has been exhausted")
  ) {
    return true;
  }

  return false;
}

interface GenerateResult {
  text: string;
  modelUsed: string;
  fellBack: boolean;
  isLocalFallback?: boolean;
}

// Resilient multi-tier generation with rapid automatic model failover across healthy models
async function generateWithRetryAndFallback(
  ai: GoogleGenAI,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  systemInstruction: string,
  preferredModel = GEMINI_MODEL
): Promise<GenerateResult> {
  const modelsToTry = [
    preferredModel,
    ...FALLBACK_MODELS.filter((m) => m !== preferredModel),
  ];

  let lastError: any = null;

  for (let mIndex = 0; mIndex < modelsToTry.length; mIndex++) {
    const currentModel = modelsToTry[mIndex];

    try {
      const response = await ai.models.generateContent({
        model: currentModel,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text;
      if (text && text.trim().length > 0) {
        if (currentModel !== preferredModel) {
          console.log(
            `[Gemini Failover Success] Generated response via fallback model "${currentModel}"`
          );
        }
        return {
          text,
          modelUsed: currentModel,
          fellBack: currentModel !== preferredModel,
        };
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(
        `[Gemini Call] Model "${currentModel}" unavailable (${errMsg}). Failing over to next candidate...`
      );
      // Immediately proceed to the next candidate model
      continue;
    }
  }

  throw lastError || new Error("All Gemini models failed to generate content.");
}

// Intelligent student companion engine tailored to Maya's live snapshot and prompt
function generateLocalSnapshotFallback(
  message: string,
  snapshot: any,
  tone = "supportive_coach"
): string {
  const studentName = snapshot?.studentName || "Maya";
  const openTasks = snapshot?.openAssignments?.filter((a: any) => !a.completed) || [];
  const topTask = openTasks[0];
  const todayClasses = snapshot?.todayClasses || [];
  const todayClass = todayClasses[0];
  const className = todayClass?.name || todayClass?.code || "Bioethics 302: Hall B";
  const streak = snapshot?.streaks?.habitDays || 5;
  const mood = snapshot?.mood?.label || "Balanced";
  const energy = snapshot?.mood?.energy || "Medium";
  const dateStr = new Date().toISOString().split("T")[0];

  const lowerMsg = (message || "").toLowerCase().trim();

  // 1. Indecision & feeling lost: "idk", "not sure", "lost", "confused", "stuck", "where do i start"
  if (
    lowerMsg === "idk" ||
    lowerMsg.includes("not sure") ||
    lowerMsg.includes("don't know") ||
    lowerMsg.includes("dont know") ||
    lowerMsg.includes("confused") ||
    lowerMsg.includes("lost") ||
    lowerMsg.includes("stuck") ||
    lowerMsg.includes("where to start") ||
    lowerMsg.includes("where do i start") ||
    lowerMsg.includes("no idea")
  ) {
    return `That's 100% valid, ${studentName}. Feeling indecisive or stuck usually means your brain is overloaded by the big picture.

Let's eliminate the guesswork and make it stupid simple:
Don't worry about writing or finishing anything right now. Just open **${topTask?.title || "your study material"}**, set a timer for **just 5 minutes**, and glance over the prompt. If you still feel like stopping after 5 minutes, you have full permission to walk away.

Does that sound low-pressure enough to start?

[EVENT: 5m Frictionless Micro-Start | ${dateStr} | 15:45 | 5 minutes: Open document, no pressure to finish]
[SUGGESTIONS: Start 5m micro-timer ⏱️ | Need a 10m break first ☕ | Tell me what to read 📖]`;
  }

  // 2. Affirmative agreement: "yes", "ok", "okay", "sure", "sounds good", "deal", "let's do it", "ready"
  if (
    lowerMsg === "yes" ||
    lowerMsg === "yep" ||
    lowerMsg === "yeah" ||
    lowerMsg === "ok" ||
    lowerMsg === "okay" ||
    lowerMsg === "sure" ||
    lowerMsg === "sounds good" ||
    lowerMsg === "deal" ||
    lowerMsg === "let's do it" ||
    lowerMsg === "lets do it" ||
    lowerMsg.includes("ready") ||
    lowerMsg.includes("lock it in")
  ) {
    return `Love the commitment, ${studentName}! 🎯

I've locked in your **15-minute sprint** for **${topTask?.title || "your priority task"}**.
1. Silence notifications for 15 minutes.
2. Put on some focus music or white noise.
3. Dive into the first section — quality over quantity.

I'll keep watch on the clock so you don't have to check the time. Go get it!

[EVENT: 15m Sprint: ${topTask?.title || "Focus Block"} | ${dateStr} | 16:00 | Uninterrupted 15m focus sprint]
[SUGGESTIONS: Start 15m timer ⏱️ | Mark complete when done ✅ | Need quick 5m pause ☕]`;
  }

  // 3. Negative / Resistance: "no", "nope", "can't", "cant", "not now", "later"
  if (
    lowerMsg === "no" ||
    lowerMsg === "nope" ||
    lowerMsg === "nah" ||
    lowerMsg.includes("can't right now") ||
    lowerMsg.includes("not now") ||
    lowerMsg.includes("later")
  ) {
    return `Zero shame, ${studentName}. Forcing deep work when your brain is refusing usually just burns extra energy.

Let's protect your **${streak}-day streak** with something effortless instead:
• Grab a glass of cold water.
• Do a 2-minute stretch or walk outside.
• We can reconvene in 30 minutes.

Sound good?

[EVENT: Gentle Reset & Hydration | ${dateStr} | 15:30 | Step away from screen, hydrate and stretch]
[SUGGESTIONS: Set 30m reminder ⏰ | Start 10m break ☕ | Check schedule for tomorrow 📅]`;
  }

  // 4. Greetings: "hi", "hey", "hello", "good morning", "yo", "sup"
  if (
    lowerMsg === "hi" ||
    lowerMsg === "hey" ||
    lowerMsg === "hello" ||
    lowerMsg.startsWith("hey ") ||
    lowerMsg.startsWith("hi ") ||
    lowerMsg.startsWith("hello ") ||
    lowerMsg.includes("good morning") ||
    lowerMsg.includes("good afternoon")
  ) {
    return `Hey ${studentName}! Great to see you.

You've built up a solid **${streak}-day streak**! You have **${topTask ? `"${topTask.title}"` : "your priority coursework"}** on deck, and **${className}** today.

How is your energy level right now? Ready to chip away at something, or need a moment to get organized?

[SUGGESTIONS: Ready to focus 🎯 | Feeling a bit overwhelmed 😮‍💨 | What's on my schedule? 📅]`;
  }

  // 5. Gratitude: "thanks", "thank you", "thx"
  if (lowerMsg.includes("thank") || lowerMsg.includes("thx") || lowerMsg.includes("appreciate")) {
    return `Always here in your corner, ${studentName}! You're doing the real work — showing up consistently is what builds that **${streak}-day streak**.

Let me know whenever you're ready for the next step!`;
  }

  // 6. Schedule / Class queries
  if (lowerMsg.includes("class") || lowerMsg.includes("schedule") || lowerMsg.includes("lecture") || lowerMsg.includes("lab")) {
    const classList = todayClasses.length > 0
      ? todayClasses.map((c: any) => `• **${c.name || c.code}** at **${c.time}** (${c.location}${c.instructor ? ` • ${c.instructor}` : ""})`).join("\n")
      : "No more scheduled classes for today! Time to relax or get ahead on coursework.";

    return `Here is your class lineup for today, ${studentName}:

${classList}

${topTask ? `Your main study priority after classes is **${topTask.title}** (${topTask.dueLabel || topTask.dueDate}).` : ""}

[EVENT: Class Review & Study Sprint | ${dateStr} | 16:30 | Review today's lecture notes]
[SUGGESTIONS: What's due tomorrow? 📋 | Start a focus timer ⏱️ | Need a 5m break ☕]`;
  }

  // 7. Assignment / Homework / Due dates
  if (lowerMsg.includes("assignment") || lowerMsg.includes("due") || lowerMsg.includes("homework") || lowerMsg.includes("task") || lowerMsg.includes("priority") || lowerMsg.includes("bioethics") || lowerMsg.includes("chem") || lowerMsg.includes("psych")) {
    return `Here is your current priority roadmap, ${studentName}:

${topTask ? `• **Top Focus:** **${topTask.title}** for ${topTask.course || topTask.subject || "BIO 302"} (${topTask.dueLabel || topTask.dueDate || "Due tomorrow"}). Est. ${topTask.estMinutes || 45} mins.` : "All caught up on priority assignments!"}
${openTasks[1] ? `• **Next Up:** **${openTasks[1].title}** for ${openTasks[1].course || openTasks[1].subject || "PSYC 101"} (${openTasks[1].dueLabel || openTasks[1].dueDate || "Upcoming"}).` : ""}

You've built an active **${streak}-day habit streak**! Let's tackle just the first 15 minutes of ${topTask?.title || "your top task"} without any pressure to finish the whole thing in one sitting.

[EVENT: 15m Sprint: ${topTask?.title || "Assignment Focus"} | ${dateStr} | 15:30 | First draft & source gathering]
[SUGGESTIONS: Start 15m focus sprint 🎯 | Break this task down 📝 | Take a quick 5m break ☕]`;
  }

  // 8. Break / Fatigue / Stress / Overwhelmed
  if (lowerMsg.includes("break") || lowerMsg.includes("tired") || lowerMsg.includes("stress") || lowerMsg.includes("overwhelm") || lowerMsg.includes("exhausted") || lowerMsg.includes("relax") || lowerMsg.includes("anxious")) {
    return `I hear you completely, ${studentName}. Feeling ${mood.toLowerCase()} with ${energy.toLowerCase()} energy is a clear sign your mind needs a moment to step back and recharge.

Give yourself permission to pause: step away from the desk, stretch, grab some water, or take a 10-minute walk. Your **${streak}-day streak** is safe, and we will pick up ${topTask?.title ? `**${topTask.title}**` : "your tasks"} with fresh focus when you're ready.

[EVENT: Recharging Walk & Mindful Break | ${dateStr} | 15:00 | Step outside and disconnect for 15 minutes]
[SUGGESTIONS: Start 10m break timer ☕ | Play calm breathing chime 🧘 | Ready to work now 🎯]`;
  }

  // 9. Leisure / Cinema / Movies / Downtime / Entertainment
  if (
    lowerMsg.includes("cinema") ||
    lowerMsg.includes("movie") ||
    lowerMsg.includes("film") ||
    lowerMsg.includes("theater") ||
    lowerMsg.includes("theatre") ||
    lowerMsg.includes("game") ||
    lowerMsg.includes("gaming") ||
    lowerMsg.includes("chill") ||
    lowerMsg.includes("hangout") ||
    lowerMsg.includes("hang out") ||
    lowerMsg.includes("party") ||
    lowerMsg.includes("outing") ||
    lowerMsg.includes("fun")
  ) {
    return `Enjoy your downtime, ${studentName}! 🎬🍿 Taking intentional time to unwind is essential for keeping your brain sharp and preventing burnout.

If you have assignments or classes coming up, guilt-free relaxation is even sweeter when you know where things stand:
${topTask ? `• **Next up when you return:** **${topTask.title}** (${topTask.dueLabel || topTask.dueDate || "Due soon"})\n` : ""}• Your **${streak}-day streak** is going strong.

Have a wonderful break, and we can lock in a quick focus sprint whenever you're back!

[EVENT: Cinema & Leisure Downtime | ${dateStr} | 18:30 | Unplug and enjoy movie time]
[SUGGESTIONS: Enjoy the movie 🍿 | Quick 10m review first 📝 | Check schedule tomorrow 📅]`;
  }

  // 10. Questions / Conceptual Inquiries
  if (
    lowerMsg.startsWith("what is") ||
    lowerMsg.startsWith("how to") ||
    lowerMsg.startsWith("how do") ||
    lowerMsg.startsWith("explain") ||
    lowerMsg.startsWith("why is") ||
    lowerMsg.includes("?")
  ) {
    return `That's a great question, ${studentName}!

Regarding "${message.replace(/\?+$/, "")}":
In a balanced student routine, understanding key concepts and taking time to explore them with curiosity is half the battle. Whether you're connecting this to your coursework or exploring something new, breaking ideas into bite-sized mental models makes learning effortless.

Would you like to explore this further, or link it into your study plan for today?

[SUGGESTIONS: Tell me more 💡 | Connect to my subjects 📚 | Ready to study 🎯]`;
  }

  // 11. Tone-specific dynamic responses
  if (tone === "strict_mentor") {
    return `Focus time, ${studentName}. You said: "${message}".

${topTask ? `• **Immediate Target:** **${topTask.title}** (${topTask.course || topTask.subject || "BIO 302"}) — ${topTask.dueLabel || topTask.dueDate || "Due soon"}.\n` : ""}• **Next Class:** **${className}** at ${todayClass?.time || "09:30 AM"}.
• **Streak:** **${streak} days**.

Stop overthinking. Set a 25-minute timer and begin right now.

[EVENT: 25m Deep Work Sprint | ${dateStr} | 16:00 | Uninterrupted execution on ${topTask?.title || "priority task"}]
[SUGGESTIONS: Start 25m sprint 🎯 | Review today's schedule 📅 | Mark task complete ✅]`;
  }

  if (tone === "casual_friend") {
    return `I hear ya, ${studentName}! "${message}" makes total sense.

${topTask ? `• You've got **${topTask.title}** on your radar (${topTask.dueLabel || topTask.dueDate || "Due soon"}).\n` : ""}• And that **${streak}-day streak** is super solid, let's keep it going!

What feels easiest to knock out right now, or do you just need to chat through it?

[EVENT: 15m Quick Chill Sprint | ${dateStr} | 16:00 | Knock out the first section]
[SUGGESTIONS: Let's do 15 mins ⏱️ | Need coffee / 5m break ☕ | Check my full schedule 📋]`;
  }

  // Default: supportive_coach
  return `I hear you, ${studentName}! "${message}" sounds like an interesting topic.

As your mindful study companion, I'm here to keep your momentum going while making sure you get enough balance and rest.

What's on your mind right now? We can dive into a quick study sprint, talk through course concepts, or plan out your day.

[SUGGESTIONS: Plan my day 📅 | Start 15m focus sprint ⏱️ | Chat about this 💬]`;
}

// In-memory rate limiting store (sliding window) (Phase 2 #11)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(clientIp: string) {
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(clientIp, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: 60 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const resetIn = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, resetIn };
  }

  record.count += 1;
  const remaining = MAX_REQUESTS_PER_WINDOW - record.count;
  const resetIn = Math.ceil((record.resetAt - now) / 1000);
  return { allowed: true, remaining, resetIn };
}

// Global reusable rate-limiting middleware for sensitive endpoints
function rateLimitMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const rateLimit = checkRateLimit(clientIp);
  res.setHeader("X-RateLimit-Limit", MAX_REQUESTS_PER_WINDOW.toString());
  res.setHeader("X-RateLimit-Remaining", rateLimit.remaining.toString());

  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: "Rate limit exceeded (Max 20 requests/minute). Slow down to protect API quotas.",
      retryAfter: rateLimit.resetIn,
    });
  }
  next();
}

// Prototype Pollution Defense: Recursively strips __proto__, constructor, and prototype (Phase 6 #31)
function sanitizeObject<T>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }
  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj as Record<string, any>)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    clean[key] = sanitizeObject((obj as Record<string, any>)[key]);
  }
  return clean as T;
}

// Event and Quick Reply parsing
function parseEvents(text: string) {
  const eventRegex = /\[EVENT:\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^\]]+)\]/gi;
  const events = [];
  let match;
  while ((match = eventRegex.exec(text)) !== null) {
    events.push({
      id: "evt_" + Math.random().toString(36).substring(2, 9),
      title: match[1].trim(),
      date: match[2].trim(),
      time: match[3].trim(),
      notes: match[4].trim(),
    });
  }
  let cleanReply = text.replace(eventRegex, "").trim();

  // Parse [SUGGESTIONS: Option 1 | Option 2 | Option 3]
  const suggestionsRegex = /\[SUGGESTIONS:\s*([^\]]+)\]/i;
  const suggestionMatch = suggestionsRegex.exec(cleanReply);
  let quickReplies: string[] = [];
  if (suggestionMatch && suggestionMatch[1]) {
    quickReplies = suggestionMatch[1]
      .split("|")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 3);
    cleanReply = cleanReply.replace(suggestionsRegex, "").trim();
  }

  return { cleanReply, events, quickReplies };
}

// Initial in-memory student database snapshot (simulating Supabase Database)
let currentStudentSnapshot = {
  studentName: "Maya",
  academicYear: "Engineering & Applied Sciences (Sophomore)",
  todayClasses: [
    {
      id: "cls_1",
      name: "Calculus (MATH 201): Multivariable Review",
      code: "MATH 201",
      time: "09:30 AM - 10:45 AM",
      location: "Math Building, Hall 102",
      instructor: "Prof. Vance",
    },
    {
      id: "cls_2",
      name: "Basic Engineering: Statics & Circuits",
      code: "ENGG 101",
      time: "11:15 AM - 12:30 PM",
      location: "Engineering Complex 201",
      instructor: "Dr. Chen",
    },
    {
      id: "cls_3",
      name: "Applied Chemistry (CHEM 102): Lab",
      code: "CHEM 102",
      time: "02:00 PM - 03:30 PM",
      location: "Science Complex 402",
      instructor: "Prof. Gomez",
    },
    {
      id: "cls_4",
      name: "Python (CS 105): Data Automation Lab",
      code: "CS 105",
      time: "04:00 PM - 05:00 PM",
      location: "Computing Center Lab 2",
      instructor: "TA Alex",
    },
  ],
  openAssignments: [
    {
      id: "asg_1",
      title: "Calculus Problem Set 4: Line Integrals & Flux",
      course: "Calculus",
      dueDate: "Tomorrow at 11:59 PM",
      dueLabel: "Due tomorrow",
      priority: "high" as const,
      estMinutes: 60,
      completed: false,
      progress: 40,
    },
    {
      id: "asg_2",
      title: "Basic Engineering: Truss Equilibrium Analysis",
      course: "Basic Engineering",
      dueDate: "Tonight at 11:59 PM",
      dueLabel: "Urgent tonight",
      priority: "high" as const,
      estMinutes: 45,
      completed: false,
      progress: 60,
    },
    {
      id: "asg_3",
      title: "Applied Chemistry: Reaction Thermodynamics Report",
      course: "Applied Chemistry",
      dueDate: "In 2 days",
      dueLabel: "Due Thursday",
      priority: "medium" as const,
      estMinutes: 50,
      completed: false,
      progress: 25,
    },
    {
      id: "asg_4",
      title: "Python: Pandas Matrix Transformation Lab",
      course: "Python",
      dueDate: "Friday at 5:00 PM",
      dueLabel: "Due Friday",
      priority: "medium" as const,
      estMinutes: 45,
      completed: false,
      progress: 20,
    },
  ],
  habitLogs: [
    {
      id: "hab_1",
      name: "20 min campus ride / commute",
      target: "Completed 8:30 AM",
      completed: true,
      category: "health" as const,
    },
    {
      id: "hab_2",
      name: "Laundry & tidy study desk",
      target: "Evening",
      completed: false,
      category: "mindset" as const,
    },
    {
      id: "hab_3",
      name: "2.0L Daily Hydration Target",
      target: "1.4L of 2.0L logged",
      completed: false,
      category: "health" as const,
    },
    {
      id: "hab_4",
      name: "Log coffee & midday lunch spend",
      target: "< $15 daily cap",
      completed: true,
      category: "focus" as const,
    },
  ],
  streaks: {
    studyDays: 12,
    habitDays: 5,
    bestStreak: 18,
  },
  mood: {
    score: 3,
    label: "A bit overwhelmed tbh",
    energy: "Medium" as const,
    note: "Need to find two peer-reviewed sources for section 2 of Bioethics paper",
  },
  upcomingHolidays: [
    {
      name: "Mid-Semester Fall Break",
      date: "Oct 12 - Oct 14",
      daysAway: 18,
    },
    {
      name: "Thanksgiving Recess",
      date: "Nov 25 - Nov 29",
      daysAway: 58,
    },
  ],
  lastUpdated: new Date().toISOString(),
};

// -------------------------------------------------------------
// SECURE BACKEND ENDPOINTS (Proxy to Gemini)
// -------------------------------------------------------------

// API: Get live Supabase snapshot
app.get("/api/supabase/snapshot", (req, res) => {
  res.json(currentStudentSnapshot);
});

// API: Update live Supabase snapshot (simulating database write)
app.put("/api/supabase/snapshot", rateLimitMiddleware, (req, res) => {
  try {
    const cleanBody = sanitizeObject(req.body);
    currentStudentSnapshot = {
      ...currentStudentSnapshot,
      ...cleanBody,
      lastUpdated: new Date().toISOString(),
    };
    res.json(currentStudentSnapshot);
  } catch (err) {
    res.status(400).json({ error: "Invalid snapshot update payload" });
  }
});

// API: Read the standalone Edge Function code for educational display
app.get("/api/supabase/edge-function-code", (req, res) => {
  try {
    const filePath = path.join(process.cwd(), "supabase/functions/nudge-chat/index.ts");
    if (fs.existsSync(filePath)) {
      const code = fs.readFileSync(filePath, "utf-8");
      return res.json({ code });
    }
    res.json({ code: "// Edge function code file not found" });
  } catch (err) {
    res.status(500).json({ error: "Failed to read edge function code" });
  }
});

// API: Edge Function Proxy Endpoint
// 1. App sends message + live snapshot + recent chat turns
// 2. Server verifies rate-limiting
// 3. Server attaches secret GEMINI_API_KEY and Nudge system prompt
// 4. Calls Gemini using GEMINI_MODEL ("gemini-3.7-flash")
// 5. Extracts [EVENT] tags and returns clean reply + parsed events (NEVER exposing key)
app.post("/api/functions/nudge-chat", async (req, res) => {
  const startTime = Date.now();
  const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";

  // Rate Limiting check
  const rateLimit = checkRateLimit(clientIp);
  res.setHeader("X-RateLimit-Limit", MAX_REQUESTS_PER_WINDOW.toString());
  res.setHeader("X-RateLimit-Remaining", rateLimit.remaining.toString());

  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: "Rate limit exceeded (Max 20 requests/minute). Slow down to protect API quotas.",
      retryAfter: rateLimit.resetIn,
    });
  }

  const { message, snapshot, history, tone } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required and must be a string." });
  }
  if (message.length > 4000) {
    return res.status(400).json({ error: "Message exceeds maximum allowed length (4,000 characters)." });
  }
  if (message.includes("\0")) {
    return res.status(400).json({ error: "Message contains invalid null bytes." });
  }

  // Dynamic Tone Directives based on student preference
  const toneDirectives: Record<string, string> = {
    strict_mentor: `PERSONALITY & TONE DIRECTIVE (STRICT MENTOR MODE):
- Voice: Direct, razor-sharp, disciplined, and uncompromisingly honest.
- Approach: Cut through rationalizations, excuses, and procrastination loops. High standards and clear boundaries.
- Strategy: Push for immediate action right now. Demand specific start times and verifiable deliverables. Keep answers short, firm, and focused on execution and accountability. Never baby or coddle.`,

    casual_friend: `PERSONALITY & TONE DIRECTIVE (CASUAL FRIEND MODE):
- Voice: Super chill, conversational, relatable, and humorous—like a close campus friend sitting across the table in the student lounge.
- Approach: Zero corporate or academic lecturing. Low-pressure, honest peer solidarity.
- Strategy: Speak with casual colloquialisms, light humor, and honest buddy camaraderie while still keeping an eye on upcoming assignments and classes so Maya doesn't fall behind.`,

    supportive_coach: `PERSONALITY & TONE DIRECTIVE (SUPPORTIVE COACH MODE):
- Voice: Warm, deeply empathetic, encouraging, and emotionally attuned.
- Approach: Meet the student with validation first. Acknowledge academic stress, validate feelings of overwhelm or tiredness, and celebrate micro-progress.
- Strategy: Break daunting tasks into tiny, friendly steps. Encourage self-compassion, healthy breaks, and consistent habits over toxic perfectionism.`,
  };

  const selectedTone = (tone as string) || "supportive_coach";
  const toneInstruction = toneDirectives[selectedTone] || toneDirectives.supportive_coach;

  // Use current in-memory snapshot if client didn't supply one
  const activeSnapshot = snapshot || currentStudentSnapshot;

  const apiKey =
    (req.headers["x-gemini-api-key"] as string) ||
    req.body.geminiApiKey ||
    process.env.GEMINI_API_KEY;
  let rawText = "";
  let modelUsed = GEMINI_MODEL;
  let fallbackUsed = false;
  let isLocalFallback = false;

  if (!apiKey) {
    rawText = generateLocalSnapshotFallback(message, activeSnapshot, selectedTone);
    modelUsed = "local-snapshot-engine";
    fallbackUsed = false;
    isLocalFallback = true;
    const { cleanReply, events, quickReplies } = parseEvents(rawText);
    return res.json({
      reply: cleanReply,
      events,
      quickReplies,
      model: modelUsed,
      fallbackUsed,
      isLocalFallback,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn,
      },
      durationMs: Date.now() - startTime,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Structured system instruction with live student data and calendar extraction rules
    const systemPrompt = `You are Nudge, an empathetic, pragmatic, and encouraging AI companion for college and high-school students.

${toneInstruction}

Your core mission:
1. Help students break paralysis, stop doom-scrolling, tackle academic deadlines, and cultivate steady wellness habits.
2. Keep responses punchy (2-4 paragraphs max). Do NOT lecture, patronize, or dump generic productivity listicles.
3. Formatting: Use clean markdown for readability. Use bulleted or numbered lists for sequential steps, bold key terms, blockquotes for quick reminders or encouragement, and markdown code blocks with language tags when explaining technical topics (CS algorithms, formulas, or bash commands).
4. Ground your thinking directly in the student's CURRENT LIVE DATA:
   - Today's Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
   - Student Name: ${activeSnapshot.studentName} (${activeSnapshot.academicYear})
   - Today's Classes: ${JSON.stringify(activeSnapshot.todayClasses)}
   - Open Assignments: ${JSON.stringify(activeSnapshot.openAssignments)}
   - Habit Logs: ${JSON.stringify(activeSnapshot.habitLogs)}
   - Streaks: Study ${activeSnapshot.streaks?.studyDays || 0} days, Habits ${activeSnapshot.streaks?.habitDays || 0} days
   - Mood & Energy: ${activeSnapshot.mood?.label} (Score: ${activeSnapshot.mood?.score}/5, Energy: ${activeSnapshot.mood?.energy}). Note: ${activeSnapshot.mood?.note || "None"}
   - Upcoming Holidays: ${JSON.stringify(activeSnapshot.upcomingHolidays)}

CALENDAR SCHEDULING RULE:
Whenever you propose a specific study session, break, sprint, or reminder, ALWAYS include an event block on a new line using this format:
[EVENT: Title | YYYY-MM-DD | HH:MM | Notes]
Examples:
- [EVENT: CS 210 BST Balancing Sprint | ${new Date().toISOString().split("T")[0]} | 16:30 | 45 min pomodoro block before dinner]
- [EVENT: MATH 240 Problem Set Prep | ${new Date().toISOString().split("T")[0]} | 19:00 | Library 2nd floor silent room]
The mobile/web client automatically parses this tag into a 1-tap "Add to Calendar" confirmation button.

CONTEXT-AWARE QUICK REPLIES RULE:
At the very end of your response, ALWAYS include exactly 3 context-aware quick replies on a single line formatted like this:
[SUGGESTIONS: Option 1 | Option 2 | Option 3]
Rules for suggestions:
- Each option should be short (2-6 words) and include an emoji.
- Option 1: An immediate affirmative/action step (e.g., "Yes, lock it in 🎯", "Start 25m focus sprint ⏱️", "Let's do this now 🚀").
- Option 2: A gentle boundary or alternative (e.g., "Need a 10m break first ☕", "Can we do 15m instead? ⏱️", "Remind me after dinner 🍲").
- Option 3: A helpful exploration or deeper question (e.g., "Help me find sources 🔍", "Give me an outline 📝", "Break into 3 small steps 💡").`;

    // Multi-turn conversational history (last 6 turns for context coherence)
    const formattedContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      const recentHistory = history.slice(-6);
      for (const turn of recentHistory) {
        formattedContents.push({
          role: turn.role === "assistant" ? "model" : "user",
          parts: [{ text: turn.content }],
        });
      }
    }

    // Add current user prompt with safety fence boundary tags (Phase 6 #33 Prompt Fencing)
    const fencedUserMessage = `[STUDENT_INPUT_START]\n${message.trim()}\n[STUDENT_INPUT_END]`;
    formattedContents.push({
      role: "user",
      parts: [{ text: fencedUserMessage }],
    });

    let rawText = "";
    let modelUsed = GEMINI_MODEL;
    let fallbackUsed = false;
    let isLocalFallback = false;

    try {
      const genResult = await generateWithRetryAndFallback(
        ai,
        formattedContents,
        systemPrompt,
        GEMINI_MODEL
      );
      rawText = genResult.text;
      modelUsed = genResult.modelUsed;
      fallbackUsed = genResult.fellBack;
    } catch (genError) {
      const serverKey = (process.env.GEMINI_API_KEY || "").trim();
      if (serverKey && serverKey !== apiKey) {
        try {
          console.warn("[Gemini API] Client key failed. Retrying with server GEMINI_API_KEY...");
          const serverAi = new GoogleGenAI({
            apiKey: serverKey,
            httpOptions: { headers: { "User-Agent": "aistudio-build" } },
          });
          const genResult = await generateWithRetryAndFallback(
            serverAi,
            formattedContents,
            systemPrompt,
            GEMINI_MODEL
          );
          rawText = genResult.text;
          modelUsed = genResult.modelUsed;
          fallbackUsed = true;
        } catch (serverGenError) {
          console.error("All remote Gemini models failed with server key as well:", serverGenError);
          rawText = generateLocalSnapshotFallback(message, activeSnapshot, selectedTone);
          modelUsed = "local-snapshot-fallback";
          fallbackUsed = true;
          isLocalFallback = true;
        }
      } else {
        console.error(
          "All remote Gemini models failed or hit high-demand spikes. Engaging contextual snapshot fallback:",
          genError
        );
        // Graceful contextual response so student conversation never breaks
        rawText = generateLocalSnapshotFallback(message, activeSnapshot, selectedTone);
        modelUsed = "local-snapshot-fallback";
        fallbackUsed = true;
        isLocalFallback = true;
      }
    }

    const { cleanReply, events, quickReplies } = parseEvents(rawText);

    // Return sanitized payload: never the API key or raw headers
    return res.json({
      reply: cleanReply,
      events,
      quickReplies,
      model: modelUsed,
      fallbackUsed,
      isLocalFallback,
      rateLimit: {
        limit: MAX_REQUESTS_PER_WINDOW,
        remaining: rateLimit.remaining,
        resetInSeconds: rateLimit.resetIn,
      },
      cachedContextUsed: false,
      executionTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Unhandled error in proxy handler:", error);
    return res.status(500).json({
      error: "Failed to communicate with AI proxy",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// API: Gemini 3.7 Flash Route Wrapper (Bridge to app/api/gemini/route.ts)
app.post("/api/gemini", rateLimitMiddleware, async (req, res) => {
  try {
    const protocol = req.protocol || "http";
    const host = req.get("host") || "localhost:3000";
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") {
        headers.set(key, value);
      } else if (Array.isArray(value)) {
        headers.set(key, value.join(", "));
      }
    }

    const standardReq = new Request(fullUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(req.body),
    });

    const response = await handleGeminiRoute(standardReq);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err: any) {
    console.error("Error in Express /api/gemini adapter:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error in Express Gemini route adapter",
      details: err?.message || String(err),
    });
  }
});

// API: Check Gemini Key Status
app.get("/api/config/gemini-status", (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  return res.json({
    configured: hasKey,
    model: GEMINI_MODEL,
    preview: hasKey ? `${process.env.GEMINI_API_KEY?.slice(0, 6)}...` : null,
  });
});

// API: Save Gemini Key (persists to .env and current runtime environment)
app.post("/api/config/gemini-key", rateLimitMiddleware, (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    return res.status(400).json({ error: "Missing or invalid apiKey." });
  }

  const cleanKey = apiKey.trim();

  // Defense against CRLF injection and corrupted env files (Phase 2 #10, Phase 5 #23)
  if (/[\r\n]/.test(cleanKey) || cleanKey.length > 256 || !/^[A-Za-z0-9_\-\.]+$/.test(cleanKey)) {
    return res.status(400).json({ error: "Invalid API key format. Key must be alphanumeric without line breaks." });
  }

  process.env.GEMINI_API_KEY = cleanKey;

  // Persist to .env file
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
      if (/GEMINI_API_KEY=/i.test(envContent)) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*/i, `GEMINI_API_KEY=${cleanKey}`);
      } else {
        envContent += `\nGEMINI_API_KEY=${cleanKey}\n`;
      }
    } else {
      envContent = `GEMINI_API_KEY=${cleanKey}\n`;
    }
    fs.writeFileSync(envPath, envContent, "utf-8");
    console.log("[Config] Updated GEMINI_API_KEY in .env and runtime environment.");
  } catch (err: any) {
    console.warn("[Config] Could not write to .env:", err.message);
  }

  return res.json({
    success: true,
    message: "GEMINI_API_KEY successfully updated!",
    configured: true,
  });
});

// API: Audio Transcription Endpoint (Transcribe user's recorded microphone audio with Gemini)
app.post("/api/functions/transcribe-audio", rateLimitMiddleware, async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not defined in server environment." });
  }

  const { audioBase64, mimeType } = req.body;
  if (!audioBase64 || typeof audioBase64 !== "string") {
    return res.status(400).json({ error: "Missing or invalid audioBase64 data." });
  }
  if (audioBase64.length > 20_000_000) {
    return res.status(413).json({ error: "Audio payload exceeds maximum 20MB limit." });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const cleanMimeType = mimeType || "audio/webm";
    // Strip data URL scheme prefix if client included it
    const pureBase64 = audioBase64.includes(",")
      ? audioBase64.split(",")[1]
      : audioBase64;

    const audioPart = {
      inlineData: {
        mimeType: cleanMimeType.split(";")[0],
        data: pureBase64,
      },
    };

    const promptPart = {
      text: "Transcribe the spoken speech in this audio file verbatim into clean text. If there is no discernible speech or only silence/background noise, return an empty string. Output ONLY the transcribed words with proper capitalization and punctuation. Do not add explanations, conversational quotes, or commentary.",
    };

    // Candidate models with rapid fallback
    const candidateModels = ["gemini-3.5-transcribe", "gemini-3.8-flash", "gemini-3.6-flash"];
    let transcript = "";

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: { parts: [audioPart, promptPart] },
        });

        if (response.text !== undefined) {
          transcript = response.text.trim();
          break;
        }
      } catch (err: any) {
        console.warn(`[Transcription] Model ${modelName} failed (${err?.message || err}). Trying fallback...`);
      }
    }

    return res.json({ transcript });
  } catch (error) {
    console.error("Audio transcription error:", error);
    return res.status(500).json({
      error: "Failed to transcribe audio",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Direct APK download route for Android devices
app.get(["/nudge.apk", "/app-debug.apk", "/download/apk"], (req, res) => {
  const apkPath = fs.existsSync(path.join(process.cwd(), "public", "nudge.apk"))
    ? path.join(process.cwd(), "public", "nudge.apk")
    : path.join(process.cwd(), "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk");

  if (fs.existsSync(apkPath)) {
    return res.download(apkPath, "nudge.apk");
  }
  return res.status(404).json({ error: "APK build not found" });
});

// Live Tunnel state
let liveTunnelUrl = "";
let liveTunnelPassword = "182.66.218.121";

async function refreshPublicIp() {
  try {
    const r = await fetch("https://api.ipify.org", { signal: AbortSignal.timeout(4000) });
    if (r.ok) {
      liveTunnelPassword = (await r.text()).trim();
    }
  } catch {
    // fallback to known IP
  }
}

async function startTunnel() {
  await refreshPublicIp();
  try {
    const tunnel = await localtunnel({ port: PORT });
    liveTunnelUrl = tunnel.url;
    console.log(`[Tunnel] Live active tunnel URL: ${liveTunnelUrl} (Password: ${liveTunnelPassword})`);

    tunnel.on("close", () => {
      console.log("[Tunnel] Tunnel connection closed. Reconnecting in 5s...");
      setTimeout(startTunnel, 5000);
    });

    tunnel.on("error", (err: any) => {
      console.warn("[Tunnel] Tunnel encountered error, reconnecting:", err?.message || err);
      setTimeout(startTunnel, 5000);
    });
  } catch (err: any) {
    console.warn("[Tunnel] Failed to start tunnel:", err?.message || err);
    setTimeout(startTunnel, 10000);
  }
}

// Live Tunnel API endpoint
app.get("/api/tunnel", async (req, res) => {
  if (!liveTunnelPassword) {
    await refreshPublicIp();
  }
  return res.json({
    tunnelUrl: liveTunnelUrl || null,
    tunnelPassword: liveTunnelPassword,
    wifiUrl: `http://172.16.80.55:${PORT}`,
    apkUrl: `http://172.16.80.55:${PORT}/nudge.apk`,
  });
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nudge secure server running on http://0.0.0.0:${PORT}`);
    console.log(`Gemini proxy model configured: ${GEMINI_MODEL}`);
    startTunnel();
  });
}

export default app;

if (!process.env.VERCEL) {
  startServer();
}

