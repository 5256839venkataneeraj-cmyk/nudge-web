/* ==========================================================================
   NUDGE+ GROQ AI SERVICE
   Empathetic AI Student Life & Habit Companion Engine
   Powered by Groq Cloud (Llama 3.3 70B & Llama 3.1 8B)
   ========================================================================== */

(function (window) {
  'use strict';

  const STORAGE_KEY_API_KEY = 'nudge_groq_api_key';
  const STORAGE_KEY_MODEL = 'nudge_groq_model';
  const DEFAULT_MODEL = 'llama-3.1-8b-instant';
  const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

  // Core System Prompt embodying Nudge's empathetic, warm, mindful student philosophy
  const NUDGE_SYSTEM_PROMPT = `You are Nudge, an empathetic, mindful, and emotionally intelligent academic and habit companion for students.
Your student user is Maya (a university student balancing academics, health, cycling, and sleep).
Tone guidelines:
- Empathetic, supportive, calm, encouraging, and non-judgmental.
- Focus on small, sustainable momentum ("Gentle focus mode: small intentional steps beat frantic rushing").
- When asked about study stress, procrastination, or heavy workloads, provide realistic, digestible micro-steps.
- Keep responses concise, warm, and structured with clean formatting. Avoid overly corporate or robotic jargon.
- Celebrate small wins (hydration streaks, morning movement, taking breaks).`;

  class GroqService {
    constructor() {
      this.apiKey = localStorage.getItem(STORAGE_KEY_API_KEY) || '';
      let storedModel = localStorage.getItem(STORAGE_KEY_MODEL);
      // Migrate from 70b if it previously failed or was set as old default
      if (!storedModel || storedModel === 'llama-3.3-70b-versatile') {
        storedModel = DEFAULT_MODEL;
        localStorage.setItem(STORAGE_KEY_MODEL, DEFAULT_MODEL);
      }
      this.model = storedModel;
      this.isConfigured = Boolean(this.apiKey && this.apiKey.trim().startsWith('gsk_'));
    }

    setApiKey(key) {
      const trimmed = (key || '').trim();
      this.apiKey = trimmed;
      this.isConfigured = Boolean(trimmed.startsWith('gsk_'));
      if (trimmed) {
        localStorage.setItem(STORAGE_KEY_API_KEY, trimmed);
      } else {
        localStorage.removeItem(STORAGE_KEY_API_KEY);
      }
      return this.isConfigured;
    }

    getApiKey() {
      return this.apiKey;
    }

    setModel(modelName) {
      this.model = modelName || DEFAULT_MODEL;
      localStorage.setItem(STORAGE_KEY_MODEL, this.model);
    }

    getModel() {
      return this.model;
    }

    async testConnection(testKey = null) {
      const keyToUse = (testKey || this.apiKey || '').trim();
      if (!keyToUse) {
        return { success: false, error: 'No Groq API key provided. Please enter your key starting with "gsk_".' };
      }

      try {
        const start = performance.now();
        const response = await fetch(GROQ_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${keyToUse}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant', // Fast model for ping
            messages: [{ role: 'user', content: 'Say "Nudge connected" in two words.' }],
            max_tokens: 10,
            temperature: 0.2
          })
        });

        const latency = Math.round(performance.now() - start);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
          return { success: false, error: errMsg };
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content?.trim() || 'Connected';
        return { success: true, latency, reply };
      } catch (err) {
        return { success: false, error: err.message || 'Network connection failed' };
      }
    }

    /**
     * Empathetic Chat Companion Completion
     */
    async generateChatResponse(chatHistory, userContext = {}) {
      const {
        courses = ['BIO 302: Bioethics', 'CS 101', 'CHEM 201'],
        waterAmount = 2100,
        waterTarget = 3000,
        currentMood = '3 (Balanced)',
        sprintsDone = '3 of 5'
      } = userContext;

      const contextualSystemPrompt = `${NUDGE_SYSTEM_PROMPT}

Maya's Live Student Context for Today:
- Enrolled Courses: ${courses.join(', ')}
- Hydration: ${(waterAmount / 1000).toFixed(1)}L / ${(waterTarget / 1000).toFixed(1)}L
- Energy / Mood: ${currentMood}
- Tasks Completed Today: ${sprintsDone}
- Upcoming deadline: Bioethics Case Study due tomorrow 11:59 PM.

Always address her as Maya or her student companion. Keep answers between 2 to 4 sentences unless she asks for a detailed plan. Always offer one gentle, concrete action.`;

      if (!this.isConfigured) {
        // High quality fallback simulation when key is not yet set
        return this.getSimulatedChatResponse(chatHistory[chatHistory.length - 1]?.content || '');
      }

      try {
        const messagesPayload = [
          { role: 'system', content: contextualSystemPrompt },
          ...chatHistory.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text || m.content
          }))
        ];

        let response = await fetch(GROQ_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages: messagesPayload,
            temperature: 0.7,
            max_tokens: 350
          })
        });

        // If the configured model is unavailable/404, gracefully retry with the universal llama-3.1-8b-instant
        if (!response.ok && (response.status === 404 || response.status === 400) && this.model !== DEFAULT_MODEL) {
          console.warn(`[GroqService] Model "${this.model}" returned status ${response.status}. Automatically retrying with "${DEFAULT_MODEL}"...`);
          this.setModel(DEFAULT_MODEL);
          response = await fetch(GROQ_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              model: DEFAULT_MODEL,
              messages: messagesPayload,
              temperature: 0.7,
              max_tokens: 350
            })
          });
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Groq API error (${response.status})`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || "I'm right here with you, Maya. Let's take it one step at a time.";
      } catch (err) {
        console.warn('[GroqService] API call failed, falling back to gentle companion simulation:', err.message);
        return this.getSimulatedChatResponse(chatHistory[chatHistory.length - 1]?.content || '');
      }
    }

    /**
     * AI Voice Intent Parser using Groq JSON Mode
     * Understands commands like "Move my study session to 4:30 PM and remind me to drink water"
     */
    async parseVoiceIntent(transcript, currentState = {}) {
      const voiceSystemPrompt = `You are the Nudge Voice Intelligence Engine. Parse the student's spoken message into structured actions.
Output STRICT JSON with NO markdown fences and this schema:
{
  "spoken_reply": "A warm, natural 1-2 sentence spoken reply to speak aloud to Maya",
  "actions": [
    {
      "type": "reschedule_study" | "log_water" | "add_task" | "log_energy" | "mindful_note",
      "label": "Short badge title (e.g. '⏰ Move Study: 4:30 PM')",
      "detail": "Description of action taken",
      "data": {
        "time": "4:30 PM (if applicable)",
        "amount": 250 (if water ml, number only),
        "task_title": "Title if adding task",
        "course": "Course code if detected"
      }
    }
  ]
}

Example inputs:
- "I finished chemistry lab. Move my study session to 4:30 PM and remind me to drink water"
  -> spoken_reply: "All set Maya! I've shifted your study block to 4:30 PM and logged a 250ml glass of water for you. Take a breath and relax."
  -> actions: [{"type":"reschedule_study","label":"⏰ Move Study: 4:30 PM","detail":"Shifted Chemistry focus block to 4:30 PM","data":{"time":"4:30 PM"}}, {"type":"log_water","label":"💧 Habit: +250ml Water","detail":"Logged 250ml hydration","data":{"amount":250}}]
- "I'm feeling really drained right now"
  -> spoken_reply: "I hear you, Maya. Let's switch to gentle recovery mode. How about a 10-minute stretch away from screens?"
  -> actions: [{"type":"mindful_note","label":"🌿 Mindful Rest: 10m","detail":"Scheduled gentle rest period","data":{}}]`;

      if (!this.isConfigured) {
        return this.getSimulatedVoiceIntent(transcript);
      }

      try {
        const response = await fetch(GROQ_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: 'system', content: voiceSystemPrompt },
              { role: 'user', content: transcript }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 450
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim() || '{}';
        return JSON.parse(content);
      } catch (err) {
        console.warn('Groq Voice parse failed, using fallback:', err);
        return this.getSimulatedVoiceIntent(transcript);
      }
    }

    /**
     * AI Smart Assignment Breakdown
     * Splits an assignment into realistic 2-4 study sprints
     */
    async generateTaskBreakdown(title, course, effort) {
      const breakdownPrompt = `You are an academic productivity coach for university students.
The student has an assignment:
- Title: "${title}"
- Course: "${course}"
- Effort Level: "${effort}" (quick: <1hr, medium: 2-3hrs, deep: >4hrs)

Generate a smart study sprint breakdown. Output STRICT JSON with this schema:
{
  "sprints": [
    {
      "session_num": 1,
      "title": "Short title e.g. Outline & Primary Sources",
      "duration": "45m",
      "tip": "Micro-focus advice for this session"
    }
  ],
  "reasoning": "1 sentence explaining why this pacing prevents burnout"
}`;

      if (!this.isConfigured) {
        return this.getSimulatedTaskBreakdown(title, course, effort);
      }

      try {
        let response = await fetch(GROQ_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: 'system', content: 'You are an academic coach. Return strict JSON only.' },
              { role: 'user', content: breakdownPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
            max_tokens: 500
          })
        });

        if (!response.ok && (response.status === 404 || response.status === 400) && this.model !== DEFAULT_MODEL) {
          this.setModel(DEFAULT_MODEL);
          response = await fetch(GROQ_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              model: DEFAULT_MODEL,
              messages: [
                { role: 'system', content: 'You are an academic coach. Return strict JSON only.' },
                { role: 'user', content: breakdownPrompt }
              ],
              response_format: { type: 'json_object' },
              temperature: 0.4,
              max_tokens: 500
            })
          });
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return JSON.parse(data.choices?.[0]?.message?.content?.trim() || '{}');
      } catch (err) {
        console.warn('Groq Breakdown error, using smart fallback:', err);
        return this.getSimulatedTaskBreakdown(title, course, effort);
      }
    }

    /**
     * AI Growth Journal & Calendar Optimization
     */
    async generateWeeklySummary(metrics = {}) {
      const {
        hoursStudied = 18.5,
        sleepAvg = 6.4,
        habitStreak = 5,
        slippedHabits = 'Evening screen-free wind down',
        energyTrend = 'Higher in morning, dips at 3 PM'
      } = metrics;

      const summaryPrompt = `Generate Maya's weekly student reflection and smart calendar optimization recommendations.
Data:
- Study Time: ${hoursStudied} hrs
- Average Sleep: ${sleepAvg} hrs
- Movement & Habit Streak: ${habitStreak} days
- Slipped Habit: ${slippedHabits}
- Energy Trend: ${energyTrend}

Output STRICT JSON:
{
  "headline": "A warm, inspiring 5-8 word weekly summary title",
  "journal_reflection": "2-3 paragraphs of warm, empathetic reflection celebrating consistency while gently addressing sleep and evening wind-down.",
  "calendar_recommendation": {
    "shift_title": "Morning Focus Shift",
    "rationale": "Move heavy analytical reading from 3:00 PM to 9:30 AM to align with peak cognitive energy.",
    "action_label": "Apply Calendar Adjustment"
  },
  "micro_wins": ["5-day cycling streak", "100% hydration on 4 days", "Bioethics draft completed"]
}`;

      if (!this.isConfigured) {
        return this.getSimulatedWeeklySummary(metrics);
      }

      try {
        let response = await fetch(GROQ_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: 'system', content: 'You are an empathetic student coach. Return strict JSON.' },
              { role: 'user', content: summaryPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.6,
            max_tokens: 650
          })
        });

        if (!response.ok && (response.status === 404 || response.status === 400) && this.model !== DEFAULT_MODEL) {
          this.setModel(DEFAULT_MODEL);
          response = await fetch(GROQ_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              model: DEFAULT_MODEL,
              messages: [
                { role: 'system', content: 'You are an empathetic student coach. Return strict JSON.' },
                { role: 'user', content: summaryPrompt }
              ],
              response_format: { type: 'json_object' },
              temperature: 0.6,
              max_tokens: 650
            })
          });
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return JSON.parse(data.choices?.[0]?.message?.content?.trim() || '{}');
      } catch (err) {
        console.warn('Groq Summary error, using fallback:', err);
        return this.getSimulatedWeeklySummary(metrics);
      }
    }

    // --- FALLBACK SIMULATION ENGINES (Active when API key is missing or offline) ---

    getSimulatedChatResponse(userText) {
      const lower = userText.toLowerCase();
      if (lower.includes('stress') || lower.includes('overwhelm') || lower.includes('tired')) {
        return "Take a slow, deep breath, Maya. You don't have to conquer everything today. Pick just the first 15 minutes of the most urgent task, and let's protect 45 minutes of complete downtime tonight.";
      }
      if (lower.includes('break') || lower.includes('rest') || lower.includes('coffee')) {
        return "That's wonderful timing. Step away from the screen, stretch your shoulders, and drink a tall glass of water. Your brain consolidates memory when resting!";
      }
      if (lower.includes('bioethics') || lower.includes('paper') || lower.includes('essay')) {
        return "For the Bioethics case study, let's keep it bite-sized: outline Section 2's moral argument first, then cite the primary landmark case. You'll be halfway done before dinner!";
      }
      return `I hear you, Maya! Let's protect your focus momentum. How about we schedule a dedicated 30-minute block for this right after your afternoon tea?`;
    }

    getSimulatedVoiceIntent(transcript) {
      const lower = transcript.toLowerCase();
      const actions = [];

      let spoken = "Got it Maya! I've noted that in your Nudge companion.";

      if (lower.includes('move') || lower.includes('session') || lower.includes('4:30') || lower.includes('study')) {
        actions.push({
          type: 'reschedule_study',
          label: '⏰ Move Study: 4:30 PM',
          detail: 'Shifted Chemistry Lab review to 4:30 PM focus block',
          data: { time: '4:30 PM' }
        });
        spoken = "All set! I shifted your Chemistry study sprint to 4:30 PM so you have time to decompress.";
      }

      if (lower.includes('water') || lower.includes('drink') || lower.includes('hydrat')) {
        actions.push({
          type: 'log_water',
          label: '💧 Habit: +250ml Water',
          detail: 'Logged 250ml towards your 3.0L daily goal',
          data: { amount: 250 }
        });
        spoken += " And I logged a fresh glass of water for your daily target.";
      }

      if (actions.length === 0) {
        actions.push({
          type: 'mindful_note',
          label: '📝 Voice Check-in Recorded',
          detail: 'Added mindful note to daily check-in stream',
          data: {}
        });
      }

      return {
        spoken_reply: spoken,
        actions
      };
    }

    getSimulatedTaskBreakdown(title, course, effort) {
      if (effort === 'quick') {
        return {
          sprints: [
            { session_num: 1, title: `Core Synthesis: ${title}`, duration: '45m', tip: 'Single focused sprint with zero notifications' }
          ],
          reasoning: 'A single 45-minute sprint maintains high mental sharpness without fatigue.'
        };
      } else if (effort === 'deep') {
        return {
          sprints: [
            { session_num: 1, title: 'Literature & Secondary Source Mining', duration: '1h 30m', tip: 'Flag 4 key citations and extract quotes' },
            { session_num: 2, title: `Draft Core Thesis & Body (${title})`, duration: '2h', tip: 'Write without editing to maintain momentum' },
            { session_num: 3, title: 'Counter-Arguments & Peer Review Pass', duration: '1h 15m', tip: 'Evaluate logical transitions between paragraphs' },
            { session_num: 4, title: 'Bibliography, Formatting & Final Polish', duration: '45m', tip: 'Read out loud to catch awkward phrasing' }
          ],
          reasoning: 'Spreading deep cognitive work over four staggered sprints ensures rigorous depth without burning out.'
        };
      } else {
        return {
          sprints: [
            { session_num: 1, title: `Outline & Source Extraction (${course})`, duration: '45m', tip: 'Set the structural skeleton first' },
            { session_num: 2, title: `Draft Key Arguments: ${title}`, duration: '1h 15m', tip: 'Tackle the hardest section when your energy is peak' },
            { session_num: 3, title: 'Citation Polish & Proofing', duration: '1h', tip: 'Double check APA/MLA formatting guidelines' }
          ],
          reasoning: 'A three-stage cascade keeps motivation high by turning a daunting paper into clear checkpoints.'
        };
      }
    }

    getSimulatedWeeklySummary(metrics) {
      return {
        headline: "High Academic Velocity, Room for Evening Wind-Down",
        journal_reflection: "Maya, your consistency this week has been remarkable. Maintaining a 5-day cycling streak while logging over 18 hours of dedicated coursework shows immense resilience.\n\nHowever, your average sleep was 6.2 hours, and evening wind-down routines frequently collided with late-night research sprints. Remember: true academic mastery is sustained through intentional recovery.",
        calendar_recommendation: {
          shift_title: "Shift Heavy Reading to 9:30 AM",
          rationale: "Your morning energy logs are 40% higher than post-3:00 PM slots. Front-loading analytical reading will free up your evenings for restorative sleep.",
          action_label: "Apply Calendar Adjustment"
        },
        micro_wins: ["5-day cycling commute streak", "Bioethics Case Study completed 24h early", "Averaged 2.4L daily hydration"]
      };
    }
  }

  // Export singleton instance
  window.GroqService = new GroqService();

})(window);
