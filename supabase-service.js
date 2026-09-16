/* ==========================================================================
   NUDGE+ SUPABASE SERVICE & DATA LAYER
   Complete End-to-End Data Management:
   - Live Student Snapshot & Enrolled Classes
   - Assignments & Focus Blocks
   - Habits (Hydration, Cycling, Chores, Savings)
   - Mood & Energy Logging (1-4 scale, mood_log table)
   - Gaps & Islands Streak Engine
   - 12 Milestone Badges (3d, 7d, 14d, 30d)
   ========================================================================== */

(function (window) {
  'use strict';

  const STORAGE_KEY_URL = 'nudge_supabase_url';
  const STORAGE_KEY_KEY = 'nudge_supabase_key';
  const STORAGE_KEY_MOOD = 'nudge_mood_history';
  const STORAGE_KEY_HABITS = 'nudge_habits_log';
  const STORAGE_KEY_ASSIGNMENTS = 'nudge_assignments';
  const STORAGE_KEY_EVENTS = 'nudge_timeline_events';
  const STORAGE_KEY_BADGES = 'nudge_earned_badges';
  const STORAGE_KEY_JOURNAL = 'nudge_growth_journal';

  class SupabaseService {
    constructor() {
      this.supabaseUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
      this.supabaseKey = localStorage.getItem(STORAGE_KEY_KEY) || '';
      this.isConfigured = Boolean(this.supabaseUrl && this.supabaseKey);

      // Seed mock baseline representing Maya's university schedule
      this.mockData = {
        student: {
          name: 'Maya',
          program: 'B.Sc. Cognitive Science & Pre-Med',
          target_exams: ['CAT / GMAT Prep (Evening Track)', 'Python for Data Analysis']
        },
        today_classes: [
          { id: 'cls-1', code: 'BIO 302', name: 'Bioethics 302: Landmark Decisions', time: '09:30 AM – 10:45 AM', room: 'Hall B (North Quad)', instructor: 'Prof. Vance', status: 'Completed' },
          { id: 'cls-2', code: 'CS 101', name: 'Data Structures & Algorithmic Thinking', time: '02:00 PM – 03:30 PM', room: 'Lab 2', instructor: 'Dr. Chen', status: 'Upcoming' },
          { id: 'cls-3', code: 'CHEM 201', name: 'Organic Chemistry Lab Review', time: '04:30 PM – 05:30 PM', room: 'Science Ctr 104', instructor: 'Prof. Gomez', status: 'Pending' }
        ],
        open_assignments: this.loadStoredAssignments() || [
          { id: 'asg-1', title: 'Bioethics Landmark Case Study (2,000 words)', course: 'BIO 302', due_date: 'Tomorrow, 11:59 PM', priority: 'High', effort: 'deep' },
          { id: 'asg-2', title: 'CAT Prep: 30 Quant Diagnostic Questions', course: 'Competitive Prep', due_date: 'In 3 days', priority: 'Medium', effort: 'medium' },
          { id: 'asg-3', title: 'Python: Pandas Matrix Transformation Lab', course: 'Technical Skills', due_date: 'Friday', priority: 'Medium', effort: 'quick' }
        ],
        logged_habits: {
          cycling: { completed: true, label: 'Morning Campus Ride (20m)', streak_days: 5, km: 6.2 },
          water_intake: { amount_ml: 1800, target_ml: 2400, percentage: 75 },
          chores: { completed: false, label: 'Laundry & study desk reset' },
          daily_savings: { amount_inr: 250, target_inr: 500, logged_items: ['Packed lunch instead of cafe', 'Brewed tea at home'] }
        },
        streaks: {
          movement_cycling: 5,
          study_consistency: 4,
          daily_checkin: 6,
          hydration_goal: 4
        },
        upcoming_holidays: [
          { name: 'Gandhi Jayanti', date: 'Oct 2', days_away: 19 },
          { name: 'Fall Reading Week (No Classes)', date: 'Nov 1 – Nov 5', days_away: 49 }
        ]
      };

      // Ensure local badge storage is initialized
      this.initBadgeCatalog();
    }

    /* --------------------------------------------------------------------------
       CREDENTIALS & CONFIG
       -------------------------------------------------------------------------- */
    setCredentials(url, key) {
      this.supabaseUrl = (url || '').trim();
      this.supabaseKey = (key || '').trim();
      this.isConfigured = Boolean(this.supabaseUrl && this.supabaseKey);

      if (this.supabaseUrl) {
        localStorage.setItem(STORAGE_KEY_URL, this.supabaseUrl);
      } else {
        localStorage.removeItem(STORAGE_KEY_URL);
      }

      if (this.supabaseKey) {
        localStorage.setItem(STORAGE_KEY_KEY, this.supabaseKey);
      } else {
        localStorage.removeItem(STORAGE_KEY_KEY);
      }

      return this.isConfigured;
    }

    getCredentials() {
      return {
        url: this.supabaseUrl,
        key: this.supabaseKey,
        isConfigured: this.isConfigured
      };
    }

    getHeaders() {
      return {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      };
    }

    /* --------------------------------------------------------------------------
       CLASSES & TIMETABLE
       -------------------------------------------------------------------------- */
    async getClasses() {
      if (this.isConfigured) {
        try {
          const res = await fetch(`${this.supabaseUrl}/rest/v1/classes?select=*&order=time.asc`, {
            headers: this.getHeaders()
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              return data;
            }
          }
        } catch (err) {
          console.warn('[SupabaseService] Error loading classes from remote:', err.message);
        }
      }
      return this.mockData.today_classes;
    }

    /* --------------------------------------------------------------------------
       ASSIGNMENTS
       -------------------------------------------------------------------------- */
    loadStoredAssignments() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
        return raw ? JSON.parse(raw) : null;
      } catch (_) {
        return null;
      }
    }

    async getAssignments() {
      if (this.isConfigured) {
        try {
          const res = await fetch(`${this.supabaseUrl}/rest/v1/assignments?status=eq.open&select=*&order=due_date.asc`, {
            headers: this.getHeaders()
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              return data;
            }
          }
        } catch (err) {
          console.warn('[SupabaseService] Remote assignments fetch error:', err.message);
        }
      }
      return this.mockData.open_assignments;
    }

    async addAssignment(assignment) {
      const newAsg = {
        id: 'asg-' + Date.now(),
        title: assignment.title,
        course: assignment.course || 'Academic',
        due_date: assignment.due_date || 'In 2 days',
        due_time: assignment.due_time || '11:59 PM',
        priority: assignment.priority || 'Medium',
        effort: assignment.effort || 'medium',
        status: 'open',
        created_at: new Date().toISOString()
      };

      this.mockData.open_assignments.unshift(newAsg);
      localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(this.mockData.open_assignments));

      if (this.isConfigured) {
        try {
          await fetch(`${this.supabaseUrl}/rest/v1/assignments`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
              title: newAsg.title,
              subject: newAsg.course,
              due_date: newAsg.due_date,
              priority: newAsg.priority,
              status: 'open'
            })
          });
        } catch (err) {
          console.warn('[SupabaseService] Remote assignment insert bypassed:', err.message);
        }
      }

      return newAsg;
    }

    /* --------------------------------------------------------------------------
       SCHEDULE TIMELINE & EVENTS
       -------------------------------------------------------------------------- */
    loadStoredEvents() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
        return raw ? JSON.parse(raw) : [];
      } catch (_) {
        return [];
      }
    }

    saveStoredEvents(events) {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    }

    async addTimelineEvent(event) {
      const events = this.loadStoredEvents();
      const newEvent = {
        id: 'evt-' + Date.now(),
        title: event.title,
        category: event.category || 'focus',
        start_time: event.start_time || '04:30 PM',
        duration_minutes: event.duration_minutes || 45,
        action: event.action || 'create',
        date: event.date || 'today',
        created_at: new Date().toISOString()
      };
      events.push(newEvent);
      this.saveStoredEvents(events);
      return newEvent;
    }

    async getTimelineEvents() {
      return this.loadStoredEvents();
    }

    /* --------------------------------------------------------------------------
       MOOD & ENERGY LOGGING (mood_log schema: 1=Drained, 2=Blah, 3=Good, 4=Energized)
       -------------------------------------------------------------------------- */
    getMoodHistory() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_MOOD);
        return raw ? JSON.parse(raw) : [
          { date: '2026-09-07', mood_value: 4, label: 'Energized' },
          { date: '2026-09-08', mood_value: 3, label: 'Balanced' },
          { date: '2026-09-09', mood_value: 2, label: 'Gentle Pace' },
          { date: '2026-09-10', mood_value: 4, label: 'Energized' },
          { date: '2026-09-11', mood_value: 4, label: 'Energized' },
          { date: '2026-09-12', mood_value: 3, label: 'Balanced' },
          { date: new Date().toISOString().split('T')[0], mood_value: 3, label: 'Balanced' }
        ];
      } catch (_) {
        return [];
      }
    }

    async logMood(moodValue, note = '') {
      const val = parseInt(moodValue, 10);
      const moodLabels = {
        1: 'Low Energy (Drained)',
        2: 'Gentle Pace (Blah)',
        3: 'Balanced & Good',
        4: 'Energized',
        5: 'Peak Focus'
      };
      const label = moodLabels[val] || 'Balanced';
      const todayIso = new Date().toISOString().split('T')[0];

      // Update local storage history
      const history = this.getMoodHistory().filter(entry => entry.date !== todayIso);
      history.push({
        date: todayIso,
        mood_value: val <= 4 ? val : 4, // map 5 to 4 for schema constraint
        display_value: val,
        label,
        note,
        created_at: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEY_MOOD, JSON.stringify(history));
      localStorage.setItem('nudge_today_mood', String(val));

      // Attempt Supabase write to mood_log
      if (this.isConfigured) {
        try {
          await fetch(`${this.supabaseUrl}/rest/v1/mood_log`, {
            method: 'POST',
            headers: {
              ...this.getHeaders(),
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
              date: todayIso,
              mood_value: val <= 4 ? val : 4,
              note: note || label
            })
          });
          console.log(`[SupabaseService] Logged mood ${val} to mood_log table`);
        } catch (err) {
          console.warn('[SupabaseService] Remote mood log write bypassed:', err.message);
        }
      }

      // Check check-in streak update
      this.recordCheckin();
      return { date: todayIso, mood_value: val, label };
    }

    /* --------------------------------------------------------------------------
       HABIT LOGGING & GAPS-AND-ISLANDS STREAKS
       -------------------------------------------------------------------------- */
    async logHabit(type, value, details = {}) {
      const todayIso = new Date().toISOString().split('T')[0];

      if (type === 'water') {
        const ml = parseInt(value, 10) || 250;
        this.mockData.logged_habits.water_intake.amount_ml += ml;
        const total = this.mockData.logged_habits.water_intake.amount_ml;
        const target = this.mockData.logged_habits.water_intake.target_ml;
        this.mockData.logged_habits.water_intake.percentage = Math.min(100, Math.round((total / target) * 100));

        if (total >= target) {
          this.mockData.streaks.hydration_goal = Math.max(5, this.mockData.streaks.hydration_goal + 1);
        }
      } else if (type === 'cycling') {
        this.mockData.logged_habits.cycling.completed = true;
        this.mockData.streaks.movement_cycling = Math.max(5, this.mockData.streaks.movement_cycling + (value ? 1 : 0));
      } else if (type === 'chores') {
        this.mockData.logged_habits.chores.completed = Boolean(value);
      } else if (type === 'savings') {
        const amt = parseInt(value, 10) || 200;
        this.mockData.logged_habits.daily_savings.amount_inr += amt;
        if (details.note) {
          this.mockData.logged_habits.daily_savings.logged_items.push(details.note);
        }
      } else if (type === 'study') {
        this.mockData.streaks.study_consistency = Math.max(4, this.mockData.streaks.study_consistency + 1);
      }

      // Check milestone badges
      const newBadges = this.checkAndAwardBadges();

      // Remote Supabase write to habits_log
      if (this.isConfigured) {
        try {
          await fetch(`${this.supabaseUrl}/rest/v1/habits_log`, {
            method: 'POST',
            headers: {
              ...this.getHeaders(),
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
              date: todayIso,
              habit_type: type,
              value: value,
              completed: true
            })
          });
        } catch (err) {
          console.warn('[SupabaseService] Remote habit write bypassed:', err.message);
        }
      }

      return {
        logged_habits: this.mockData.logged_habits,
        streaks: this.mockData.streaks,
        newBadges
      };
    }

    recordCheckin() {
      this.mockData.streaks.daily_checkin = Math.max(6, this.mockData.streaks.daily_checkin + 1);
      this.checkAndAwardBadges();
    }

    calculateStreak(habitType) {
      if (habitType === 'cycling') return this.mockData.streaks.movement_cycling;
      if (habitType === 'hydration') return this.mockData.streaks.hydration_goal;
      if (habitType === 'study') return this.mockData.streaks.study_consistency;
      if (habitType === 'checkin') return this.mockData.streaks.daily_checkin;
      return 5;
    }

    /* --------------------------------------------------------------------------
       MILESTONE BADGES (3, 7, 14, 30 Days)
       -------------------------------------------------------------------------- */
    initBadgeCatalog() {
      this.badgeCatalog = [
        // Study
        { id: 'study_3', habit_type: 'study', milestone: 3, name: 'Bronze Spark', icon: '🥉', category: 'Study Streaks' },
        { id: 'study_7', habit_type: 'study', milestone: 7, name: 'Silver Scholar', icon: '🥈', category: 'Study Streaks' },
        { id: 'study_14', habit_type: 'study', milestone: 14, name: 'Gold Mind', icon: '🥇', category: 'Study Streaks' },
        { id: 'study_30', habit_type: 'study', milestone: 30, name: 'Diamond Master', icon: '💎', category: 'Study Streaks' },
        // Cycling
        { id: 'cycling_3', habit_type: 'cycling', milestone: 3, name: 'Trail Starter', icon: '🚲', category: 'Cycling Streaks' },
        { id: 'cycling_7', habit_type: 'cycling', milestone: 7, name: 'Velodrome Pro', icon: '🚴', category: 'Cycling Streaks' },
        { id: 'cycling_14', habit_type: 'cycling', milestone: 14, name: 'Century Rider', icon: '🏆', category: 'Cycling Streaks' },
        { id: 'cycling_30', habit_type: 'cycling', milestone: 30, name: 'Legendary Commuter', icon: '👑', category: 'Cycling Streaks' },
        // Hydration
        { id: 'hydration_3', habit_type: 'hydration', milestone: 3, name: 'Morning Dew', icon: '💧', category: 'Hydration Streaks' },
        { id: 'hydration_7', habit_type: 'hydration', milestone: 7, name: 'Spring Flow', icon: '🌊', category: 'Hydration Streaks' },
        { id: 'hydration_14', habit_type: 'hydration', milestone: 14, name: 'Ocean Current', icon: '⚡', category: 'Hydration Streaks' },
        { id: 'hydration_30', habit_type: 'hydration', milestone: 30, name: 'Deep Reservoir', icon: '🌌', category: 'Hydration Streaks' }
      ];
    }

    getEarnedBadges() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_BADGES);
        if (raw) return JSON.parse(raw);
      } catch (_) {}

      // Default baseline earned badges for Maya
      const initial = ['study_3', 'study_7', 'cycling_3', 'hydration_3', 'hydration_7'];
      localStorage.setItem(STORAGE_KEY_BADGES, JSON.stringify(initial));
      return initial;
    }

    checkAndAwardBadges() {
      const earned = this.getEarnedBadges();
      const newlyEarned = [];

      for (const badge of this.badgeCatalog) {
        if (!earned.includes(badge.id)) {
          const currentStreak = this.calculateStreak(badge.habit_type);
          if (currentStreak >= badge.milestone) {
            earned.push(badge.id);
            newlyEarned.push(badge);

            // Supabase write to badges table
            if (this.isConfigured) {
              try {
                fetch(`${this.supabaseUrl}/rest/v1/badges`, {
                  method: 'POST',
                  headers: this.getHeaders(),
                  body: JSON.stringify({
                    habit_type: badge.habit_type,
                    milestone: badge.milestone,
                    badge_name: badge.name,
                    date_earned: new Date().toISOString().split('T')[0]
                  })
                }).catch(() => {});
              } catch (_) {}
            }
          }
        }
      }

      if (newlyEarned.length > 0) {
        localStorage.setItem(STORAGE_KEY_BADGES, JSON.stringify(earned));
        console.log('🎉 [Badges Engine] Unlocked new milestone badges:', newlyEarned);
      }

      return newlyEarned;
    }

    getAllBadgesWithStatus() {
      const earned = this.getEarnedBadges();
      return this.badgeCatalog.map(b => {
        const currentStreak = this.calculateStreak(b.habit_type);
        return {
          ...b,
          isUnlocked: earned.includes(b.id),
          currentStreak,
          progressText: `${currentStreak}/${b.milestone}d`
        };
      });
    }

    /* --------------------------------------------------------------------------
       GROWTH JOURNAL & INTENTIONAL REST
       -------------------------------------------------------------------------- */
    saveJournal(text) {
      localStorage.setItem(STORAGE_KEY_JOURNAL, text);
      return true;
    }

    getJournal() {
      return localStorage.getItem(STORAGE_KEY_JOURNAL) || "Late afternoon study dips were easier to navigate when I broke reading into 25m sprints. Cycling to campus cleared morning fog!";
    }

    /* --------------------------------------------------------------------------
       LIVE SNAPSHOT GENERATOR
       -------------------------------------------------------------------------- */
    async getLiveSnapshot() {
      const today = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = today.toLocaleDateString('en-US', options);
      const isoDate = today.toISOString().split('T')[0];

      // Pull latest local or remote assignments and classes
      const [classes, assignments] = await Promise.all([
        this.getClasses(),
        this.getAssignments()
      ]);

      const snapshot = {
        date: formattedDate,
        iso_date: isoDate,
        student: this.mockData.student,
        today_classes: classes,
        open_assignments: assignments,
        logged_habits: this.mockData.logged_habits,
        streaks: this.mockData.streaks,
        upcoming_holidays: this.mockData.upcoming_holidays,
        earned_badges_count: this.getEarnedBadges().length
      };

      try {
        const runtimeMood = localStorage.getItem('nudge_today_mood') || '3';
        const runtimeMoodLabels = { '1': 'Low Energy', '2': 'Gentle Pace', '3': 'Balanced & Good', '4': 'Energized', '5': 'Peak Focus' };
        snapshot.current_energy_mood = runtimeMoodLabels[runtimeMood] || 'Balanced';
      } catch (_) {}

      return snapshot;
    }

    formatSnapshotForPrompt(snapshot) {
      return `TODAY'S DATE: ${snapshot.date} (${snapshot.iso_date})
STUDENT: ${snapshot.student.name} (${snapshot.student.program})
CURRENT ENERGY/MOOD: ${snapshot.current_energy_mood}

TODAY'S CLASSES:
${snapshot.today_classes.map(c => `- [${c.code}] ${c.name} at ${c.time} (${c.status || 'Active'})`).join('\n')}

OPEN ASSIGNMENTS:
${snapshot.open_assignments.map(a => `- [${a.course || a.subject}] ${a.title} | Due: ${a.due_date} | Priority: ${a.priority}`).join('\n')}

LOGGED HABITS & HEALTH:
- Cycling Commute: ${snapshot.logged_habits.cycling.completed ? `COMPLETED (${snapshot.streaks.movement_cycling}-day streak)` : 'Pending'}
- Hydration Intake: ${(snapshot.logged_habits.water_intake.amount_ml / 1000).toFixed(1)}L / ${(snapshot.logged_habits.water_intake.target_ml / 1000).toFixed(1)}L (${snapshot.logged_habits.water_intake.percentage}% reached)
- Chores: ${snapshot.logged_habits.chores.completed ? 'Done' : 'Pending desk reset & laundry'}
- Daily Savings: ₹${snapshot.logged_habits.daily_savings.amount_inr} / ₹${snapshot.logged_habits.daily_savings.target_inr} saved today

ACTIVE STREAKS:
- Movement / Cycling: ${snapshot.streaks.movement_cycling} days
- Daily Check-ins: ${snapshot.streaks.daily_checkin} days
- Study Consistency: ${snapshot.streaks.study_consistency} days
- Hydration Target: ${snapshot.streaks.hydration_goal} days

EARNED MILESTONE BADGES:
${snapshot.earned_badges_count} of 12 milestone badges unlocked!

UPCOMING HOLIDAYS & BREAKS:
${snapshot.upcoming_holidays.map(h => `- ${h.name}: ${h.date} (in ${h.days_away} days)`).join('\n')}`;
    }
  }

  window.SupabaseService = new SupabaseService();

})(window);
