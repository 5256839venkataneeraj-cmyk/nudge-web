/* ==========================================================================
   NUDGE+ INTERACTIVE CONTROLLER
   Figma Edition Implementation
   ========================================================================== */

(function () {
  'use strict';

  // State
  const state = {
    currentTab: 'home',
    theme: localStorage.getItem('nudge_theme') || 'light',
    isResponsive: false,
    audioPlaying: false,
    voiceListening: true,
    waterAmount: 1800,
    waterTarget: 2400,
    flowItems: [
      { id: 'flow-1', completed: false, title: '45m Organic Chemistry review', time: '8:00 AM • Study (45 min)', type: 'study' },
      { id: 'flow-2', completed: true, title: 'Morning cycling commute', time: '9:30 AM • Habit', type: 'habit' },
      { id: 'flow-3', completed: false, title: 'Laundry & tidy study desk', time: '1:00 PM • Routine', type: 'routine' },
      { id: 'flow-4', completed: false, title: 'Hydration target: 2.4L daily target', time: '2:45 PM • Daily Target', type: 'target' },
      { id: 'flow-5', completed: false, title: 'Log coffee & midday lunch spend', time: '4:30 PM • Micro-Habit', type: 'spend' },
    ],
    selectedEffort: 'medium',
    selectedCourse: 'BIO 302',
    dueTimePeriod: 'PM',
    chatHistory: [
      { sender: 'ai', text: "Hey Maya! You logged your morning cycle ride — that's 5 days straight! 🎉 How are you feeling about that Bioethics paper due tomorrow?" },
      { sender: 'user', text: "A bit overwhelmed tbh. I still need to find two peer-reviewed sources for section 2." },
      { sender: 'ai', text: "Totally valid! How about we break it down? Let's spend just 25 minutes on PubMed before lunch — I'll keep time and protect your schedule." }
    ],
  };

  // DOM Elements
  const DOM = {
    // Top Controls
    screenPillBtns: document.querySelectorAll('.screen-pill-btn'),
    viewportToggleBtn: document.getElementById('viewportToggleBtn'),
    viewportToggleText: document.getElementById('viewportToggleText'),
    viewportWrapper: document.getElementById('viewportWrapper'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    mobileThemeToggleBtn: document.getElementById('mobileThemeToggleBtn'),
    statusClock: document.getElementById('statusClock'),

    // App Header
    currentViewTitle: document.getElementById('currentScreenSub'),
    headerBackBtn: document.getElementById('headerBackBtn'),
    avatarBtn: document.getElementById('avatarBtn'),

    // Views
    viewHome: document.getElementById('viewHome'),
    viewChat: document.getElementById('viewChat'),
    viewSchedule: document.getElementById('viewSchedule'),
    viewSummary: document.getElementById('viewSummary'),

    // Bottom Nav
    navItems: document.querySelectorAll('.nav-item'),
    navFloatingMicBtn: document.getElementById('navFloatingMicBtn'),

    // Home Flow
    homeChatBanner: document.getElementById('homeChatBanner'),
    openAddAssignmentFromHome: document.getElementById('openAddAssignmentFromHome'),
    flowItemsList: document.getElementById('flowItemsList'),
    flowCountBadge: document.getElementById('flowCountBadge'),
    homeProgressDonutPct: document.getElementById('flowCountBadge'),
    hydrationLabel: document.getElementById('hydrationVolText'),
    hydrationBarFill: document.getElementById('hydrationProgressText'),

    // Chat
    chatMessagesContainer: document.getElementById('chatMessagesContainer'),
    chatInput: document.getElementById('chatInput'),
    chatSendBtn: document.getElementById('chatSendBtn'),
    chatVoiceBtn: document.getElementById('chatVoiceBtn'),
    playCheckinAudioBtn: document.getElementById('toggleGentleAudioBtn'),
    audioWaveBars: null,
    acceptSprintBtn: document.getElementById('acceptSprintBtn'),
    chatTypingRow: document.getElementById('chatTypingRow'),

    // Schedule
    btnDayView: document.getElementById('btnDayView'),
    btnWeekView: document.getElementById('btnWeekView'),
    openAddAssignmentFromSchedule: document.getElementById('openAddAssignmentFromSchedule'),
    dateChips: document.querySelectorAll('.strip-day-card, .date-chip'),
    scheduleTimeline: document.getElementById('scheduleTimeline'),

    // Summary & AI Reflection
    applyAdjustmentBtn: document.getElementById('applyAdjustmentBtn'),
    saveGrowthJournalBtn: document.getElementById('saveGrowthJournalBtn'),
    btnAiGenerateSummary: document.getElementById('btnAiGenerateSummary'),
    btnRegenerateAiSummary: document.getElementById('btnRegenerateAiSummary'),
    aiReflectionHeadline: document.getElementById('aiReflectionHeadline'),
    aiReflectionText: document.getElementById('aiReflectionText'),
    aiRecText: document.getElementById('aiRecText'),
    aiReflectionLoading: document.getElementById('aiReflectionLoading'),
    aiReflectionMainContent: document.getElementById('aiReflectionMainContent'),

    // Modals
    modalAddAssignment: document.getElementById('modalAddAssignment'),
    closeAddAssignmentBtn: document.getElementById('closeAddAssignmentBtn'),
    btnCancelAssignment: document.getElementById('btnCancelAssignment'),
    btnSaveAssignment: document.getElementById('btnSaveAssignment'),
    assignmentTitleInput: document.getElementById('assignmentTitleInput'),
    assignmentDueDate: document.getElementById('assignmentDueDate'),
    assignmentDueTime: document.getElementById('assignmentDueTime'),
    coursePills: document.querySelectorAll('.course-pill:not(.add-pill)'),
    btnAddCustomCourse: document.getElementById('btnAddCustomCourse'),
    effortCards: document.querySelectorAll('.effort-card'),
    btnAM: document.getElementById('btnAM'),
    btnPM: document.getElementById('btnPM'),
    autoScheduleToggle: document.getElementById('autoScheduleToggle'),
    autoSessionsPreview: document.getElementById('autoSessionsPreview'),
    btnAiBreakdown: document.getElementById('btnAiBreakdown'),

    // Voice Modal
    modalVoiceNudge: document.getElementById('modalVoiceNudge'),
    closeVoiceModalBtn: document.getElementById('closeVoiceModalBtn'),
    btnCancelVoice: document.getElementById('btnCancelVoice'),
    btnDoneVoice: document.getElementById('btnDoneVoice'),
    voiceCoreOrbBtn: document.getElementById('voiceCoreOrbBtn'),
    voiceStatusTitle: document.getElementById('voiceStatusTitle'),
    voiceStatusSubtitle: document.getElementById('voiceStatusSubtitle'),
    coreTapText: document.getElementById('coreTapText'),
    liveTranscriptText: document.getElementById('liveTranscriptText'),
    voiceRealtimeBadge: document.getElementById('voiceRealtimeBadge'),
    voiceRecordingStatusText: document.getElementById('voiceRecordingStatusText'),
    voiceDetectedActionsRow: document.getElementById('voiceDetectedActionsRow'),
    silenceCountdownText: document.getElementById('silenceCountdownText'),
    toastContainer: document.getElementById('toastContainer'),

    // AI & Supabase Settings Modal
    modalAiSettings: document.getElementById('modalAiSettings'),
    openAiSettingsBtn: document.getElementById('openAiSettingsBtn'),
    chatAiSettingsBtn: document.getElementById('chatAiSettingsBtn'),
    closeAiSettingsBtn: document.getElementById('closeAiSettingsBtn'),
    btnCancelAiSettings: document.getElementById('btnCancelAiSettings'),
    btnSaveAiSettings: document.getElementById('btnSaveAiSettings'),
    
    // Gemini
    geminiApiKeyInput: document.getElementById('geminiApiKeyInput'),
    geminiModelSelect: document.getElementById('geminiModelSelect'),
    btnToggleGeminiKeyVis: document.getElementById('btnToggleGeminiKeyVis'),
    btnTestGeminiConn: document.getElementById('btnTestGeminiConn'),
    geminiStatusBadge: document.getElementById('geminiStatusBadge'),

    // Supabase
    supabaseUrlInput: document.getElementById('supabaseUrlInput'),
    supabaseKeyInput: document.getElementById('supabaseKeyInput'),
    btnInspectSnapshot: document.getElementById('btnInspectSnapshot'),

    // Groq & Desktop
    groqApiKeyInput: document.getElementById('groqApiKeyInput'),
    groqModelSelect: document.getElementById('groqModelSelect'),
    btnTestGroqConn: document.getElementById('btnTestGroqConn'),
    groqStatusBadge: document.getElementById('groqStatusBadge'),
    desktopAiBadge: document.getElementById('desktopAiBadge'),

    // AI Context Nudge Card (Home View)
    figmaAiNudgeCard: document.getElementById('figmaAiNudgeCard'),
    btnApplyAiNudge: document.getElementById('btnApplyAiNudge'),
    btnDismissAiNudge: document.getElementById('btnDismissAiNudge'),
    btnRefreshAiNudge: document.getElementById('btnRefreshAiNudge'),
    aiNudgeTitle: document.getElementById('aiNudgeTitle'),
    aiNudgeBody: document.getElementById('aiNudgeBody'),
  };

  /* ==========================================================================
     INITIALIZATION
     ========================================================================== */
  function init() {
    applyTheme(state.theme);
    updateClock();
    setInterval(updateClock, 30000);
    bindEvents();
    initSpeechRecognition();
    initAiSettings();

    // Check remote config from Supabase if configured
    if (window.NudgeConfig && window.SupabaseService) {
      window.NudgeConfig.fetchRemoteModelConfig(window.SupabaseService).then(remoteModel => {
        if (remoteModel && DOM.geminiModelSelect) {
          DOM.geminiModelSelect.value = remoteModel;
        }
      });
    }

    // Initialize real data rendering & badges
    renderScheduleTimeline();
    renderSummaryBadges();
    renderSummaryMetrics();

    switchTab('home');
  }

  /* ==========================================================================
     CLOCK & THEME
     ========================================================================== */
  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    hours = hours % 12 || 12;
    if (DOM.statusClock) {
      DOM.statusClock.textContent = `${hours}:${minutes}`;
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    state.theme = theme;
    localStorage.setItem('nudge_theme', theme);
  }

  /* ==========================================================================
     NAVIGATION & TABS
     ========================================================================== */
  function switchTab(tabKey) {
    state.currentTab = tabKey;

    // Close any open overlays
    closeModals();

    // Update bottom nav
    DOM.navItems.forEach(item => {
      const target = item.getAttribute('data-tab');
      item.classList.toggle('active', target === tabKey);
    });

    // Update Screen Pills in Desktop Controls
    DOM.screenPillBtns.forEach(btn => {
      const target = btn.getAttribute('data-target');
      btn.classList.toggle('active', target === tabKey);
    });

    // Switch view sections
    const views = {
      home: DOM.viewHome,
      chat: DOM.viewChat,
      schedule: DOM.viewSchedule,
      summary: DOM.viewSummary,
    };

    Object.keys(views).forEach(key => {
      if (views[key]) {
        views[key].classList.toggle('active', key === tabKey);
      }
    });

    // Update header title & subtitle
    const titles = {
      home: 'Home',
      chat: 'Chat',
      schedule: 'Schedule',
      summary: 'Summary',
    };
    const sub = document.getElementById('currentScreenSub');
    if (sub) {
      sub.textContent = titles[tabKey] || 'Home';
    }
    if (DOM.currentViewTitle) {
      DOM.currentViewTitle.textContent = titles[tabKey] || 'Nudge';
    }

    if (DOM.headerBackBtn) {
      DOM.headerBackBtn.classList.add('hidden');
    }

    // Scroll viewport to top
    const viewport = document.getElementById('viewsViewport');
    if (viewport) viewport.scrollTop = 0;
  }

  function closeModals() {
    if (DOM.modalAddAssignment) DOM.modalAddAssignment.classList.add('hidden');
    if (DOM.modalVoiceNudge) DOM.modalVoiceNudge.classList.add('hidden');
    if (DOM.modalAiSettings) DOM.modalAiSettings.classList.add('hidden');
    stopSpeechRecognition();
  }

  function openAiSettingsModal() {
    closeModals();
    if (DOM.modalAiSettings) {
      DOM.modalAiSettings.classList.remove('hidden');
      if (DOM.geminiApiKeyInput && window.GeminiService) {
        DOM.geminiApiKeyInput.value = window.GeminiService.getApiKey() || '';
      }
      if (DOM.geminiModelSelect && window.GeminiService) {
        DOM.geminiModelSelect.value = window.GeminiService.getModel() || 'gemini-3.7-flash';
      }
      if (window.SupabaseService) {
        const creds = window.SupabaseService.getCredentials();
        if (DOM.supabaseUrlInput) DOM.supabaseUrlInput.value = creds.url || '';
        if (DOM.supabaseKeyInput) DOM.supabaseKeyInput.value = creds.key || '';
      }
      if (DOM.groqApiKeyInput && window.GroqService) {
        DOM.groqApiKeyInput.value = window.GroqService.getApiKey() || '';
      }
      if (DOM.groqModelSelect && window.GroqService) {
        DOM.groqModelSelect.value = window.GroqService.getModel() || 'llama-3.1-8b-instant';
      }
      updateAiConnectionBadge();
    }
  }

  function openAddAssignmentModal() {
    closeModals();
    if (DOM.modalAddAssignment) {
      DOM.modalAddAssignment.classList.remove('hidden');
      DOM.screenPillBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-target') === 'task-modal');
      });
      if (DOM.assignmentTitleInput) DOM.assignmentTitleInput.focus();
    }
  }

  function openVoiceNudgeModal() {
    closeModals();
    if (DOM.modalVoiceNudge) {
      DOM.modalVoiceNudge.classList.remove('hidden');
      state.voiceListening = true;
      updateVoiceVisualizerState();
      DOM.screenPillBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-target') === 'voice-modal');
      });
    }
  }

  /* ==========================================================================
     EVENT BINDINGS
     ========================================================================== */
  function bindEvents() {
    // Bottom Nav Tabs
    DOM.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.getAttribute('data-tab');
        if (tab) switchTab(tab);
      });
    });

    // Floating Center Mic Button
    if (DOM.navFloatingMicBtn) {
      DOM.navFloatingMicBtn.addEventListener('click', openVoiceNudgeModal);
    }

    // Desktop Screen Quick Switcher
    DOM.screenPillBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        if (target === 'task-modal') {
          openAddAssignmentModal();
        } else if (target === 'voice-modal') {
          openVoiceNudgeModal();
        } else {
          switchTab(target);
        }
      });
    });

    // Desktop Viewport Toggle
    if (DOM.viewportToggleBtn) {
      DOM.viewportToggleBtn.addEventListener('click', () => {
        state.isResponsive = !state.isResponsive;
        DOM.viewportWrapper.classList.toggle('responsive-mode', state.isResponsive);
        DOM.viewportToggleText.textContent = state.isResponsive ? 'Fullscreen' : 'Mobile Frame';
        showToast(state.isResponsive ? 'Switched to Fullscreen mode' : 'Switched to Mobile Frame mockup');
      });
    }

    // Theme Toggle (Desktop and Mobile App Header)
    const handleThemeToggle = () => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
      showToast(`Theme changed to ${newTheme} mode`);
    };
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.addEventListener('click', handleThemeToggle);
    }
    if (DOM.mobileThemeToggleBtn) {
      DOM.mobileThemeToggleBtn.addEventListener('click', handleThemeToggle);
    }

    // Home "Need a quick reset? Chat with Nudge"
    if (DOM.homeChatBanner) {
      DOM.homeChatBanner.addEventListener('click', () => {
        switchTab('chat');
      });
    }

    // Home: AI Context Nudge Card
    if (DOM.btnApplyAiNudge) {
      DOM.btnApplyAiNudge.addEventListener('click', async () => {
        DOM.btnApplyAiNudge.innerHTML = '<span>⏳ Pacing...</span>';
        DOM.btnApplyAiNudge.disabled = true;

        if (window.SupabaseService) {
          await window.SupabaseService.addTimelineEvent({
            title: 'Organic Chemistry Focus Sprint (AI Paced)',
            category: 'academic',
            start_time: '11:15 AM',
            duration_minutes: 45,
            action: 'create'
          });
          renderScheduleTimeline();
        }

        setTimeout(() => {
          DOM.btnApplyAiNudge.innerHTML = '<span>✓ Scheduled (11:15 AM)</span>';
          DOM.btnApplyAiNudge.style.background = 'var(--sage-green)';
          showToast('✨ AI Focus Sprint scheduled at 11:15 AM! Swapping to Schedule...');
          setTimeout(() => switchTab('schedule'), 800);
        }, 500);
      });
    }

    if (DOM.btnDismissAiNudge) {
      DOM.btnDismissAiNudge.addEventListener('click', () => {
        if (DOM.figmaAiNudgeCard) {
          DOM.figmaAiNudgeCard.style.opacity = '0';
          DOM.figmaAiNudgeCard.style.transform = 'translateY(-10px)';
          setTimeout(() => DOM.figmaAiNudgeCard.style.display = 'none', 250);
        }
      });
    }

    if (DOM.btnRefreshAiNudge) {
      DOM.btnRefreshAiNudge.addEventListener('click', () => {
        const insights = [
          {
            title: 'Optimal Focus Window: 11:15 AM Open Slot',
            body: 'Maya, your morning focus is 42% higher right now. Front-loading your 45m Organic Chemistry review before lunch will protect your 8h sleep tonight!'
          },
          {
            title: 'Hydration & Movement Milestone Check',
            body: 'You crushed your 20m campus ride! Logging another 250ml water now unlocks your 8-Day Hydration streak badge.'
          },
          {
            title: 'Paced Recovery Window: 4:30 PM',
            body: 'After your 3:00 PM Chemistry block, take an intentional 20-minute screen break before reviewing Bioethics.'
          }
        ];
        const next = insights[Math.floor(Math.random() * insights.length)];
        if (DOM.aiNudgeTitle) DOM.aiNudgeTitle.textContent = next.title;
        if (DOM.aiNudgeBody) DOM.aiNudgeBody.textContent = next.body;
        showToast('✨ AI Smart Pacer updated with live context!');
      });
    }

    // Cheer me on button
    const cheerBtn = document.getElementById('cheerLinkBtn');
    if (cheerBtn) {
      cheerBtn.addEventListener('click', () => {
        showToast('🎉 You’re doing amazing, Maya! 1 focus block down, momentum on fire!');
      });
    }

    // Home "+ New Assignment" Button
    if (DOM.openAddAssignmentFromHome) {
      DOM.openAddAssignmentFromHome.addEventListener('click', openAddAssignmentModal);
    }

    // Schedule "+" Button
    if (DOM.openAddAssignmentFromSchedule) {
      DOM.openAddAssignmentFromSchedule.addEventListener('click', openAddAssignmentModal);
    }

    // Chat: Audio Play Button
    if (DOM.playCheckinAudioBtn) {
      DOM.playCheckinAudioBtn.addEventListener('click', toggleCheckinAudio);
    }

    // Chat: Send button & enter key
    if (DOM.chatSendBtn) {
      DOM.chatSendBtn.addEventListener('click', handleSendChatMessage);
    }
    if (DOM.chatInput) {
      DOM.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSendChatMessage();
      });
    }

    // Chat: Voice input button opens Voice Nudge
    if (DOM.chatVoiceBtn) {
      DOM.chatVoiceBtn.addEventListener('click', openVoiceNudgeModal);
    }

    // Chat: Accept Sprint button
    if (DOM.acceptSprintBtn) {
      DOM.acceptSprintBtn.addEventListener('click', () => {
        DOM.acceptSprintBtn.textContent = '✓ Scheduled at 11:30 AM';
        DOM.acceptSprintBtn.style.background = 'var(--sage)';
        showToast('Sprint added! 11:30 AM Focus session synced to Calendar.');
      });
    }

    // Schedule: Day / Week Switcher
    if (DOM.btnDayView && DOM.btnWeekView) {
      DOM.btnDayView.addEventListener('click', () => {
        DOM.btnDayView.classList.add('active');
        DOM.btnWeekView.classList.remove('active');
        showToast('Viewing Wednesday, Oct 25 (Day View)');
      });
      DOM.btnWeekView.addEventListener('click', () => {
        DOM.btnWeekView.classList.add('active');
        DOM.btnDayView.classList.remove('active');
        showToast('Viewing Week View: Oct 23 – Oct 27');
      });
    }

    // Schedule: Date Chips
    DOM.dateChips.forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.dateChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const day = chip.querySelector('.chip-day').textContent;
        const num = chip.querySelector('.chip-num').textContent;
        showToast(`Showing timetable for ${day}, Oct ${num}`);
      });
    });

    // Summary: "Apply Calendar Adjustment"
    if (DOM.applyAdjustmentBtn) {
      DOM.applyAdjustmentBtn.addEventListener('click', async () => {
        DOM.applyAdjustmentBtn.innerHTML = `✓ Adjustment Applied &amp; Synced`;
        DOM.applyAdjustmentBtn.style.background = 'var(--sage-green)';
        DOM.applyAdjustmentBtn.disabled = true;

        if (window.SupabaseService) {
          await window.SupabaseService.addTimelineEvent({
            title: 'Morning Heavy Reading Focus Sprint',
            category: 'focus',
            start_time: '09:30 AM',
            duration_minutes: 45,
            action: 'create'
          });
          renderScheduleTimeline();
        }
        showToast('✨ Calendar updated! Morning focus block added to Schedule.');
      });
    }

    // Summary: Save to Growth Journal
    if (DOM.saveGrowthJournalBtn) {
      DOM.saveGrowthJournalBtn.addEventListener('click', () => {
        const headline = DOM.aiReflectionHeadline ? DOM.aiReflectionHeadline.textContent : 'Weekly Growth Summary';
        const body = DOM.aiReflectionText ? DOM.aiReflectionText.textContent : '';
        const journalText = `${headline}\n\n${body}`;
        if (window.SupabaseService) {
          window.SupabaseService.saveJournal(journalText);
        }
        DOM.saveGrowthJournalBtn.textContent = '✓ Saved to Maya’s Journal';
        DOM.saveGrowthJournalBtn.style.background = 'var(--sage-bg)';
        DOM.saveGrowthJournalBtn.style.color = 'var(--sage-dark)';
        showToast('📖 Saved to Maya’s Growth Journal!');
      });
    }

    // Modal: Add Assignment Close/Cancel
    if (DOM.closeAddAssignmentBtn) {
      DOM.closeAddAssignmentBtn.addEventListener('click', closeModals);
    }
    if (DOM.btnCancelAssignment) {
      DOM.btnCancelAssignment.addEventListener('click', closeModals);
    }

    // Modal: Course pills
    DOM.coursePills.forEach(pill => {
      pill.addEventListener('click', () => {
        DOM.coursePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.selectedCourse = pill.getAttribute('data-course');
      });
    });

    if (DOM.btnAddCustomCourse) {
      DOM.btnAddCustomCourse.addEventListener('click', () => {
        const customName = prompt('Enter course name (e.g. STAT 200):');
        if (customName && customName.trim()) {
          const newBtn = document.createElement('button');
          newBtn.type = 'button';
          newBtn.className = 'course-pill active';
          newBtn.textContent = customName.trim();
          DOM.coursePills.forEach(p => p.classList.remove('active'));
          DOM.btnAddCustomCourse.before(newBtn);
          newBtn.addEventListener('click', () => {
            document.querySelectorAll('.course-pill').forEach(p => p.classList.remove('active'));
            newBtn.classList.add('active');
          });
        }
      });
    }

    // Modal: Effort cards
    DOM.effortCards.forEach(card => {
      card.addEventListener('click', () => {
        DOM.effortCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        state.selectedEffort = card.getAttribute('data-effort');
        updateAutoScheduleBreakdown(state.selectedEffort);
      });
    });

    // Modal: AM / PM toggle
    if (DOM.btnAM && DOM.btnPM) {
      DOM.btnAM.addEventListener('click', () => {
        DOM.btnAM.classList.add('active');
        DOM.btnPM.classList.remove('active');
        state.dueTimePeriod = 'AM';
      });
      DOM.btnPM.addEventListener('click', () => {
        DOM.btnPM.classList.add('active');
        DOM.btnAM.classList.remove('active');
        state.dueTimePeriod = 'PM';
      });
    }

    // Modal: Save Assignment
    if (DOM.btnSaveAssignment) {
      DOM.btnSaveAssignment.addEventListener('click', handleSaveAssignment);
    }

    // Voice Modal: Close/Cancel
    if (DOM.closeVoiceModalBtn) {
      DOM.closeVoiceModalBtn.addEventListener('click', closeModals);
    }
    if (DOM.btnCancelVoice) {
      DOM.btnCancelVoice.addEventListener('click', closeModals);
    }

    // Voice Modal: Core Orb Pause/Resume
    if (DOM.voiceCoreOrbBtn) {
      DOM.voiceCoreOrbBtn.addEventListener('click', toggleVoiceListening);
    }

    // Voice Modal: Done • Save to Nudge
    if (DOM.btnDoneVoice) {
      DOM.btnDoneVoice.addEventListener('click', handleSaveVoiceActions);
    }

    // AI Smart Breakdown in Add Task Modal
    if (DOM.btnAiBreakdown) {
      DOM.btnAiBreakdown.addEventListener('click', handleAiSprintBreakdown);
    }

    // AI Summary Generation in Summary Tab
    if (DOM.btnAiGenerateSummary) {
      DOM.btnAiGenerateSummary.addEventListener('click', handleGenerateAiSummary);
    }
    if (DOM.btnRegenerateAiSummary) {
      DOM.btnRegenerateAiSummary.addEventListener('click', handleGenerateAiSummary);
    }

    // Feature 1 & 2: Mood check-in & Milestones
    bindMoodAndMilestoneEvents();
  }

  /* ==========================================================================
     FEATURE 1 & 2: MOOD LOGGING & REWARDS/MILESTONES
     ========================================================================== */
  function bindMoodAndMilestoneEvents() {
    const energyPills = document.querySelectorAll('.energy-pill-btn');
    const feedbackText = document.getElementById('energyFeedbackText');
    const milestoneAlert = document.getElementById('homeMilestoneAlert');
    const dismissMilestoneBtn = document.getElementById('dismissMilestoneBtn');

    // Load saved mood or default to 3 (Good)
    const savedMood = localStorage.getItem('nudge_today_mood') || '3';
    energyPills.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mood') === savedMood);
    });

    energyPills.forEach(btn => {
      btn.addEventListener('click', async () => {
        const moodVal = btn.getAttribute('data-mood');
        const moodLabel = btn.getAttribute('data-label');
        const moodEmoji = btn.getAttribute('data-emoji');

        energyPills.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (window.SupabaseService) {
          await window.SupabaseService.logMood(moodVal);
          renderSummaryBadges();
          renderSummaryMetrics();
        }

        if (feedbackText) {
          feedbackText.textContent = `Logged: ${moodEmoji} ${moodLabel} • Synced to Supabase mood_log`;
        }

        showToast(`Energy updated: ${moodEmoji} ${moodLabel} recorded for today!`);
      });
    });

    if (dismissMilestoneBtn && milestoneAlert) {
      dismissMilestoneBtn.addEventListener('click', () => {
        milestoneAlert.style.display = 'none';
      });
    }
  }

  function triggerMilestoneCelebration(habit, badgeName, days) {
    const milestoneAlert = document.getElementById('homeMilestoneAlert');
    const milestoneTitle = document.getElementById('milestoneAlertTitle');
    const milestoneDesc = document.getElementById('milestoneAlertDesc');

    if (milestoneAlert && milestoneTitle && milestoneDesc) {
      milestoneTitle.textContent = `🏆 Milestone Unlocked: "${badgeName}"!`;
      milestoneDesc.textContent = `Congratulations Maya! You reached a ${days}-day ${habit} streak.`;
      milestoneAlert.style.display = 'flex';
    }

    showToast(`🏆 Milestone Unlocked: ${badgeName} (${days} Days)!`);
  }

  /* ==========================================================================
     HOME FLOW LOGIC
     ========================================================================== */
  window.toggleFlowItem = async function (id) {
    const card = document.querySelector(`.figma-task-card[data-id="${id}"]`) || document.querySelector(`.flow-card[data-id="${id}"]`);
    if (!card) return;

    const radio = card.querySelector('.task-radio') || card.querySelector('.flow-checkbox');
    const isChecked = radio ? radio.classList.contains('checked') : card.classList.contains('completed');

    if (isChecked) {
      if (radio) {
        radio.classList.remove('checked');
        radio.innerHTML = '';
      }
      card.classList.remove('completed');
    } else {
      if (radio) {
        radio.classList.add('checked');
        radio.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>`;
      }
      card.classList.add('completed');
      showToast('Activity checked off! Momentum streak preserved.');

      // Map to real Supabase habit log & evaluate badges
      if (window.SupabaseService) {
        let habitType = 'study';
        let val = 45;
        if (id === 'flow-2') { habitType = 'cycling'; val = 6.2; }
        else if (id === 'flow-3') { habitType = 'chores'; val = true; }
        else if (id === 'flow-4') { habitType = 'water'; val = 250; }
        else if (id === 'flow-5') { habitType = 'savings'; val = 200; }

        const res = await window.SupabaseService.logHabit(habitType, val);
        if (res && res.newBadges && res.newBadges.length > 0) {
          for (const b of res.newBadges) {
            triggerMilestoneCelebration(b.category, b.name, b.milestone);
          }
        }
        renderSummaryBadges();
        renderSummaryMetrics();
      }
    }

    updateFlowProgress();
  };

  window.addWaterQuick = async function (amount) {
    state.waterAmount = Math.min(state.waterAmount + amount, 3000);
    const pct = Math.min(100, Math.round((state.waterAmount / 3000) * 100));

    const volText = document.getElementById('hydrationVolText');
    const progText = document.getElementById('hydrationProgressText');
    if (volText) {
      volText.textContent = `${(state.waterAmount / 1000).toFixed(1)}L / 3.0L Target`;
    }
    if (progText) {
      progText.textContent = `${pct}% reached`;
    }

    if (DOM.hydrationLabel) {
      DOM.hydrationLabel.textContent = `${(state.waterAmount / 1000).toFixed(1)} / ${(state.waterTarget / 1000).toFixed(1)}L`;
    }
    if (DOM.hydrationBarFill) {
      DOM.hydrationBarFill.style.width = `${pct}%`;
    }

    if (window.SupabaseService) {
      const res = await window.SupabaseService.logHabit('water', amount);
      if (res && res.newBadges && res.newBadges.length > 0) {
        for (const b of res.newBadges) {
          triggerMilestoneCelebration('Hydration', b.name, b.milestone);
        }
      }
      renderSummaryBadges();
      renderSummaryMetrics();
    }

    showToast(`Logged +${amount}ml water! (${state.waterAmount}ml total)`);
  };

  function updateFlowProgress() {
    const total = document.querySelectorAll('.figma-task-card, .flow-card').length;
    const completed = document.querySelectorAll('.figma-task-card.completed, .flow-card.completed').length;
    const badge = document.getElementById('flowCountBadge');
    if (badge) {
      badge.textContent = `${completed} / ${total} done`;
    }

    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    if (DOM.homeProgressDonutPct) {
      DOM.homeProgressDonutPct.textContent = `${pct}%`;
    }
  }

  /* ==========================================================================
     CHAT LOGIC
     ========================================================================== */
  function toggleCheckinAudio() {
    state.audioPlaying = !state.audioPlaying;

    if (DOM.playCheckinAudioBtn) {
      const playIcon = DOM.playCheckinAudioBtn.querySelector('.play-icon');
      const pauseIcon = DOM.playCheckinAudioBtn.querySelector('.pause-icon');
      if (playIcon) playIcon.classList.toggle('hidden', state.audioPlaying);
      if (pauseIcon) pauseIcon.classList.toggle('hidden', !state.audioPlaying);
    }

    if (DOM.audioWaveBars) {
      DOM.audioWaveBars.classList.toggle('playing', state.audioPlaying);
    }

    if (state.audioPlaying) {
      showToast('Playing acoustic voice check-in (Gentle mode)...');

      // Speak using Web Speech API if supported for realistic voice experience
      if ('speechSynthesis' in window) {
        const text = "Hi Maya, you had 7 hours of sleep and your morning routine is done. How are you feeling about the Bioethics case study?";
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        utterance.onend = () => {
          stopCheckinAudio();
        };
        window.speechSynthesis.speak(utterance);
      }
    } else {
      stopCheckinAudio();
    }
  }

  function stopCheckinAudio() {
    state.audioPlaying = false;
    if (DOM.playCheckinAudioBtn) {
      const playIcon = DOM.playCheckinAudioBtn.querySelector('.play-icon');
      const pauseIcon = DOM.playCheckinAudioBtn.querySelector('.pause-icon');
      if (playIcon) playIcon.classList.remove('hidden');
      if (pauseIcon) pauseIcon.classList.add('hidden');
    }
    if (DOM.audioWaveBars) {
      DOM.audioWaveBars.classList.remove('playing');
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /* ==========================================================================
     UNIFIED AI ORCHESTRATOR
     Intelligent Cross-Provider Router (Gemini + Groq + On-Device NLP)
     Handles 503 / 429 / 404 transparently with seamless fallback
     ========================================================================== */
  const AiOrchestrator = {
    getProviderName() {
      if (window.GeminiService && window.GeminiService.isConfigured) {
        return `Gemini (${window.GeminiService.getModel()})`;
      }
      if (window.GroqService && window.GroqService.isConfigured) {
        return `Groq (${window.GroqService.getModel()})`;
      }
      return 'Smart On-Device AI';
    },

    async generateChatResponse(chatHistory, userContext) {
      // 1. Try Gemini if configured
      if (window.GeminiService && window.GeminiService.isConfigured) {
        try {
          const res = await window.GeminiService.generateChatResponse(chatHistory, userContext);
          if (res) return res;
        } catch (e) {
          console.warn('[AiOrchestrator] Gemini chat failed, attempting Groq fallback:', e);
        }
      }
      // 2. Try Groq if configured
      if (window.GroqService && window.GroqService.isConfigured) {
        try {
          const res = await window.GroqService.generateChatResponse(chatHistory, userContext);
          if (res) return res;
        } catch (e) {
          console.warn('[AiOrchestrator] Groq chat failed, attempting simulated fallback:', e);
        }
      }
      // 3. Fallback to resilient companion
      const lastMsg = chatHistory[chatHistory.length - 1]?.text || '';
      return window.GeminiService ? window.GeminiService.getSimulatedChatResponse(lastMsg) : "I'm right here with you, Maya. Let's take it one step at a time.";
    },

    async generateTaskBreakdown(title, course, effort) {
      if (window.GeminiService && window.GeminiService.isConfigured) {
        try {
          const res = await window.GeminiService.generateTaskBreakdown(title, course, effort);
          if (res && res.sprints && res.sprints.length > 0) return res;
        } catch (e) {
          console.warn('[AiOrchestrator] Gemini breakdown failed:', e);
        }
      }
      if (window.GroqService) {
        try {
          const res = await window.GroqService.generateTaskBreakdown(title, course, effort);
          if (res && res.sprints && res.sprints.length > 0) return res;
        } catch (e) {
          console.warn('[AiOrchestrator] Groq breakdown failed:', e);
        }
      }
      return window.GeminiService ? window.GeminiService.getSimulatedTaskBreakdown(title, course, effort) : null;
    },

    async generateWeeklySummary(metrics) {
      if (window.GeminiService && window.GeminiService.isConfigured) {
        try {
          const res = await window.GeminiService.generateWeeklySummary(metrics);
          if (res && res.headline) return res;
        } catch (e) {
          console.warn('[AiOrchestrator] Gemini summary failed:', e);
        }
      }
      if (window.GroqService) {
        try {
          const res = await window.GroqService.generateWeeklySummary(metrics);
          if (res && res.headline) return res;
        } catch (e) {
          console.warn('[AiOrchestrator] Groq summary failed:', e);
        }
      }
      return window.GeminiService ? window.GeminiService.getSimulatedWeeklySummary(metrics) : null;
    },

    async processVoiceCheckin(transcript, snapshot) {
      if (window.GeminiService) {
        return await window.GeminiService.processVoiceCheckin(transcript, snapshot);
      }
      return null;
    }
  };

  window.sendQuickChatMessage = function (text) {
    if (DOM.chatInput) DOM.chatInput.value = text;
    handleSendChatMessage();
  };

  async function handleSendChatMessage() {
    const text = DOM.chatInput ? DOM.chatInput.value.trim() : '';
    if (!text) return;

    // Append user message
    appendMessage(text, 'user');
    state.chatHistory.push({ sender: 'user', text });
    DOM.chatInput.value = '';

    // Scroll to bottom
    if (DOM.chatMessagesContainer) {
      DOM.chatMessagesContainer.scrollTop = DOM.chatMessagesContainer.scrollHeight;
    }

    // Show dynamic typing indicator
    if (DOM.chatTypingRow) {
      DOM.chatTypingRow.classList.remove('hidden');
      DOM.chatMessagesContainer.appendChild(DOM.chatTypingRow);
      DOM.chatMessagesContainer.scrollTop = DOM.chatMessagesContainer.scrollHeight;
    }

    try {
      const userContext = {
        courses: ['BIO 302: Bioethics', 'CS 101', state.selectedCourse],
        waterAmount: state.waterAmount,
        waterTarget: state.waterTarget,
        currentMood: localStorage.getItem('nudge_today_mood') || '3 (Good)',
        sprintsDone: `${document.querySelectorAll('.figma-task-card.completed').length} of ${document.querySelectorAll('.figma-task-card').length}`
      };

      const reply = await AiOrchestrator.generateChatResponse(state.chatHistory, userContext);

      if (DOM.chatTypingRow) DOM.chatTypingRow.classList.add('hidden');
      appendMessage(reply, 'ai');
      state.chatHistory.push({ sender: 'ai', text: reply });

      // If gentle audio is enabled, read response aloud
      if (state.audioPlaying && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const cleanText = reply.replace(/[*_#`]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      if (DOM.chatTypingRow) DOM.chatTypingRow.classList.add('hidden');
      appendMessage("I'm right here with you, Maya. Let's take it one step at a time.", 'ai');
    }

    if (DOM.chatMessagesContainer) {
      DOM.chatMessagesContainer.scrollTop = DOM.chatMessagesContainer.scrollHeight;
    }
  }

  function appendMessage(text, sender) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const groupDiv = document.createElement('div');
    groupDiv.className = `stream-bubble-group ${sender}-group`;

    const formattedBody = escapeHtml(text).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');

    if (sender === 'ai') {
      groupDiv.innerHTML = `
        <div class="bubble-avatar-circle">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2c2 5 8 7 8 12a8 8 0 1 1-16 0c0-5 6-7 8-12z"/></svg>
        </div>
        <div class="bubble-wrapper">
          <div class="figma-bubble ai-bubble">
            <p>${formattedBody}</p>
          </div>
          <span class="bubble-time">${time}</span>
        </div>
      `;
    } else {
      groupDiv.innerHTML = `
        <div class="bubble-wrapper">
          <div class="figma-bubble user-bubble">
            <p>${formattedBody}</p>
          </div>
          <span class="bubble-time user-time">${time} ✓✓</span>
        </div>
      `;
    }

    if (DOM.chatTypingRow && DOM.chatTypingRow.parentNode === DOM.chatMessagesContainer) {
      DOM.chatMessagesContainer.insertBefore(groupDiv, DOM.chatTypingRow);
    } else {
      DOM.chatMessagesContainer.appendChild(groupDiv);
    }
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }[tag] || tag));
  }

  /* ==========================================================================
     ADD ASSIGNMENT FORM LOGIC
     ========================================================================== */
  window.setDueShortcut = function (daysAhead) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    const isoString = targetDate.toISOString().split('T')[0];
    if (DOM.assignmentDueDate) {
      DOM.assignmentDueDate.value = isoString;
    }

    document.querySelectorAll('.shortcut-pill').forEach(p => p.classList.remove('active'));
    if (event && event.target) {
      event.target.classList.add('active');
    }
  };

  function updateAutoScheduleBreakdown(effort) {
    if (!DOM.autoSessionsPreview) return;

    if (effort === 'quick') {
      DOM.autoSessionsPreview.innerHTML = `
        <div class="session-item">
          <span class="session-bullet"></span>
          <div class="session-desc"><strong>Single Focus Block:</strong> Complete & Submit (45m)</div>
        </div>
      `;
    } else if (effort === 'deep') {
      DOM.autoSessionsPreview.innerHTML = `
        <div class="session-item">
          <span class="session-bullet"></span>
          <div class="session-desc"><strong>Session 1:</strong> Deep Research & Annotated Biblio (1h 30m)</div>
        </div>
        <div class="session-item">
          <span class="session-bullet"></span>
          <div class="session-desc"><strong>Session 2:</strong> First Draft & Argument Synthesis (2h)</div>
        </div>
        <div class="session-item">
          <span class="session-bullet"></span>
          <div class="session-desc"><strong>Session 3:</strong> Peer Review & Defense Notes (1h)</div>
        </div>
        <div class="session-item">
          <span class="session-bullet"></span>
          <div class="session-desc"><strong>Session 4:</strong> Final Proof & Submission (45m)</div>
        </div>
      `;
    } else {
      DOM.autoSessionsPreview.innerHTML = `
        <div class="session-item">
          <span class="session-bullet"></span>
          <div class="session-desc"><strong>Session 1:</strong> Outline & Sources (45m)</div>
        </div>
        <div class="session-item">
          <span class="session-bullet"></span>
          <div class="session-desc"><strong>Session 2:</strong> Draft arguments & data analysis (1h 15m)</div>
        </div>
        <div class="session-item">
          <span class="session-bullet"></span>
          <div class="session-desc"><strong>Session 3:</strong> Polish citations & format check (1h)</div>
        </div>
      `;
    }
  }

  /* ==========================================================================
     AI SMART SPRINT BREAKDOWN (Feature 3)
     ========================================================================== */
  async function handleAiSprintBreakdown() {
    if (!DOM.autoSessionsPreview) return;
    const title = (DOM.assignmentTitleInput && DOM.assignmentTitleInput.value.trim()) || 'Case Study & Essay';
    const course = state.selectedCourse || 'BIO 302';
    const effort = state.selectedEffort || 'medium';

    const origBtnText = DOM.btnAiBreakdown ? DOM.btnAiBreakdown.innerHTML : '';
    const activeProvider = AiOrchestrator.getProviderName();
    if (DOM.btnAiBreakdown) {
      DOM.btnAiBreakdown.innerHTML = `<span class="ai-sparkle">⏳</span><span>Pacing with ${activeProvider}...</span>`;
      DOM.btnAiBreakdown.disabled = true;
    }

    try {
      const breakdown = await AiOrchestrator.generateTaskBreakdown(title, course, effort);
      if (breakdown && breakdown.sprints && breakdown.sprints.length > 0) {
        DOM.autoSessionsPreview.innerHTML = breakdown.sprints.map((s, idx) => `
          <div class="session-item">
            <span class="session-bullet"></span>
            <div class="session-desc">
              <strong>Session ${s.session_num || idx + 1}:</strong> ${escapeHtml(s.title)} (${escapeHtml(s.duration || '45m')})
              ${s.tip ? `<div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 2px;">💡 ${escapeHtml(s.tip)}</div>` : ''}
            </div>
          </div>
        `).join('') + (breakdown.reasoning ? `
          <div style="margin-top: 8px; font-size: 0.7rem; color: var(--terracotta); font-style: italic; background: rgba(184,80,40,0.06); padding: 6px 10px; border-radius: var(--radius-sm);">
            ${escapeHtml(breakdown.reasoning)}
          </div>
        ` : '');
        showToast(`✨ AI Smart Breakdown created by ${activeProvider}!`);
      } else {
        updateAutoScheduleBreakdown(effort);
      }
    } catch (err) {
      console.warn('AI breakdown error:', err);
      updateAutoScheduleBreakdown(effort);
    } finally {
      if (DOM.btnAiBreakdown) {
        DOM.btnAiBreakdown.innerHTML = origBtnText;
        DOM.btnAiBreakdown.disabled = false;
      }
    }
  }

  /* ==========================================================================
     TIMETABLE & SCHEDULE RENDERING (Real Supabase + Custom Events)
     ========================================================================== */
  async function renderScheduleTimeline() {
    if (!DOM.scheduleTimeline || !window.SupabaseService) return;

    const classes = await window.SupabaseService.getClasses();
    const customEvents = await window.SupabaseService.getTimelineEvents();

    let html = '';

    // 1. Classes from Supabase
    if (classes && classes.length > 0) {
      for (const cls of classes) {
        const hour = cls.time ? cls.time.split('–')[0].trim() : '09:00 AM';
        html += `
          <div class="timeline-row">
            <span class="timeline-hour">${escapeHtml(hour)}</span>
            <div class="timeline-card class-slot">
              <div class="slot-meta-row">
                <span class="slot-badge badge-class">Class</span>
                <span class="slot-time-range">${escapeHtml(cls.time || '09:30 – 10:45 AM')}</span>
              </div>
              <h4 class="slot-title">${escapeHtml(cls.code || '')}: ${escapeHtml(cls.name || 'Lecture')}</h4>
              <p class="slot-location">📍 ${escapeHtml(cls.room || 'Campus Quad')} • ${escapeHtml(cls.instructor || 'Faculty')}</p>
            </div>
          </div>
        `;
      }
    }

    // 2. Default Focus & Recharge Anchors
    html += `
      <div class="timeline-row">
        <span class="timeline-hour">11:00 AM</span>
        <div class="timeline-card focus-slot">
          <div class="slot-meta-row">
            <span class="slot-badge badge-focus">&lt; Focus</span>
            <span class="slot-planned-tag">Planned by Nudge</span>
            <span class="slot-time-range">11:15 – 12:00 PM</span>
          </div>
          <h4 class="slot-title">Paper Sourcing: 2 PubMed citations</h4>
          <p class="slot-location">Target: find supporting evidence for section 2</p>
          <div class="slot-timer-bar">
            <span class="smart-timer-indicator">● Smart Timer 45m</span>
            <button class="start-timer-btn" onclick="showToast('45m Smart Timer started!')">Start Now</button>
          </div>
        </div>
      </div>

      <div class="timeline-row">
        <span class="timeline-hour">12:00 PM</span>
        <div class="timeline-card recharge-slot">
          <div class="slot-meta-row">
            <span class="slot-badge badge-recharge">Recharge</span>
            <span class="slot-time-range">12:30 – 01:15 PM</span>
          </div>
          <h4 class="slot-title">Lunch &amp; Campus Cycling</h4>
        </div>
      </div>
    `;

    function formatScheduleTimeRange(startStr, durationMin = 45) {
      if (!startStr) return '04:30 – 05:15 PM';
      const match = startStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
      if (!match) return startStr;
      let hours = parseInt(match[1], 10);
      let minutes = match[2] ? parseInt(match[2], 10) : 0;
      let meridiem = match[3] ? match[3].toUpperCase() : 'PM';

      let h24 = hours;
      if (meridiem === 'PM' && hours < 12) h24 = hours + 12;
      if (meridiem === 'AM' && hours === 12) h24 = 0;

      const totalMin = h24 * 60 + minutes + parseInt(durationMin, 10);
      let endH24 = Math.floor(totalMin / 60) % 24;
      let endMin = totalMin % 60;
      let endMeridiem = endH24 >= 12 ? 'PM' : 'AM';
      let endDisplayHours = endH24 % 12 || 12;

      let startDisplayHours = h24 % 12 || 12;
      const pad = (n) => String(n).padStart(2, '0');
      
      return `${pad(startDisplayHours)}:${pad(minutes)} – ${pad(endDisplayHours)}:${pad(endMin)} ${endMeridiem}`;
    }

    // 3. Custom / Voice-Extracted Events from Supabase
    if (customEvents && customEvents.length > 0) {
      for (const ev of customEvents) {
        const time = ev.start_time || '04:30 PM';
        const formattedRange = formatScheduleTimeRange(time, ev.duration_minutes || 45);
        const catLower = (ev.category || '').toLowerCase();
        const catBadgeClass = catLower.includes('prep') ? 'badge-prep' : 
                              catLower.includes('recharge') ? 'badge-recharge' :
                              catLower.includes('academic') ? 'badge-academic' : 'badge-focus';
        const catBadgeLabel = catLower.includes('academic') ? 'Academic' :
                              catLower.includes('prep') ? 'CAT Prep' :
                              (ev.category ? ev.category.toUpperCase() : 'Focus');
        const plannedLabel = ev.action === 'reschedule' ? 'Gemini Rescheduled' : 'Planned by Nudge';

        html += `
          <div class="timeline-row" style="animation: fadeIn 0.3s ease;">
            <span class="timeline-hour">${escapeHtml(time)}</span>
            <div class="timeline-card focus-slot">
              <div class="slot-meta-row">
                <span class="slot-badge ${catBadgeClass}">${escapeHtml(catBadgeLabel)}</span>
                <span class="slot-planned-tag">${escapeHtml(plannedLabel)}</span>
                <span class="slot-time-range">${escapeHtml(formattedRange)}</span>
              </div>
              <h4 class="slot-title">${escapeHtml(ev.title)}</h4>
              <p class="slot-location">Duration: ${ev.duration_minutes || 45}m • Extracted by Voice Check-in</p>
              <div class="slot-timer-bar">
                <span class="smart-timer-indicator">● Smart Timer ${ev.duration_minutes || 45}m</span>
                <button class="start-timer-btn" onclick="showToast('${ev.duration_minutes || 45}m Smart Timer started!')">Start Now</button>
              </div>
            </div>
          </div>
        `;
      }
    }

    DOM.scheduleTimeline.innerHTML = html;
  }

  /* ==========================================================================
     BADGES & REWARDS RENDERING (12 Milestones)
     ========================================================================== */
  function renderSummaryBadges() {
    if (!window.SupabaseService) return;
    const allBadges = window.SupabaseService.getAllBadgesWithStatus();

    const studyBadges = allBadges.filter(b => b.habit_type === 'study');
    const cyclingBadges = allBadges.filter(b => b.habit_type === 'cycling');
    const hydrationBadges = allBadges.filter(b => b.habit_type === 'hydration');

    const renderGrid = (badges) => badges.map(b => `
      <div class="badge-tile ${b.isUnlocked ? 'unlocked' : 'locked'}" title="${escapeHtml(b.name)} (${b.progressText})">
        <div class="badge-icon">${b.icon}${b.isUnlocked ? '' : '<span class="badge-lock">🔒</span>'}</div>
        <div class="badge-name">${escapeHtml(b.name)}</div>
        <div class="badge-threshold">${b.isUnlocked ? `${b.milestone}d ✓` : `${b.currentStreak}/${b.milestone}d`}</div>
      </div>
    `).join('');

    const gridStudy = document.getElementById('badgeGridStudy');
    const gridCycling = document.getElementById('badgeGridCycling');
    const gridHydration = document.getElementById('badgeGridHydration');

    if (gridStudy) gridStudy.innerHTML = renderGrid(studyBadges);
    if (gridCycling) gridCycling.innerHTML = renderGrid(cyclingBadges);
    if (gridHydration) gridHydration.innerHTML = renderGrid(hydrationBadges);

    const unlockedCount = allBadges.filter(b => b.isUnlocked).length;
    const badgeCounter = document.getElementById('unlockedBadgesCount');
    if (badgeCounter) {
      badgeCounter.textContent = `${unlockedCount} of ${allBadges.length} Unlocked`;
    }

    document.querySelectorAll('.badge-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const title = tile.getAttribute('title') || tile.innerText.trim();
        showToast(`Milestone Reward: ${title}`);
      });
    });
  }

  function renderSummaryMetrics() {
    if (!window.SupabaseService) return;
    const cyclingStreak = window.SupabaseService.calculateStreak('cycling');
    const studyStreak = window.SupabaseService.calculateStreak('study');
    const hydrationStreak = window.SupabaseService.calculateStreak('hydration');

    // Update Streak cards on Home
    const momentumCards = document.querySelectorAll('.momentum-cards-strip .streak-pill-card');
    if (momentumCards.length >= 3) {
      const s1 = momentumCards[0].querySelector('.streak-days');
      const s2 = momentumCards[1].querySelector('.streak-days');
      const s3 = momentumCards[2].querySelector('.streak-days');
      if (s1) s1.textContent = `${studyStreak + 8} Days`;
      if (s2) s2.textContent = `${cyclingStreak} Days`;
      if (s3) s3.textContent = `${hydrationStreak} Days`;
    }
  }

  async function handleSaveAssignment() {
    const title = DOM.assignmentTitleInput ? DOM.assignmentTitleInput.value.trim() : 'New Assignment';
    const course = state.selectedCourse || 'BIO 302';
    const dueTime = (DOM.assignmentDueTime ? DOM.assignmentDueTime.value : '11:59') + ' ' + state.dueTimePeriod;
    const dueDate = (DOM.assignmentDueDate ? DOM.assignmentDueDate.value : '') || 'In 2 days';

    // 1. Add to Supabase
    if (window.SupabaseService) {
      await window.SupabaseService.addAssignment({
        title,
        course,
        due_date: dueDate,
        due_time: dueTime,
        priority: 'High',
        effort: state.selectedEffort
      });

      // Auto-schedule focus session
      await window.SupabaseService.addTimelineEvent({
        title: `${title} (Focus Sprint)`,
        category: 'academic',
        start_time: '11:15 AM',
        duration_minutes: state.selectedEffort === 'deep' ? 90 : state.selectedEffort === 'quick' ? 25 : 45,
        action: 'create'
      });

      renderScheduleTimeline();
    }

    // 2. Add to Today's Flow
    const newId = 'flow-' + Date.now();
    const newFlowCard = document.createElement('div');
    newFlowCard.className = 'flow-card study-type';
    newFlowCard.setAttribute('data-id', newId);
    newFlowCard.innerHTML = `
      <div class="flow-card-header">
        <span class="flow-time-tag">Due ${dueTime} • ${course}</span>
        <span class="tag-pill priority-high">Auto-Scheduled</span>
      </div>
      <div class="flow-card-body">
        <div class="flow-checkbox" onclick="toggleFlowItem('${newId}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="flow-content">
          <h4 class="flow-title">${escapeHtml(title)}</h4>
          <p class="flow-desc">Study sprint auto-balanced on your Schedule timeline</p>
        </div>
      </div>
    `;

    if (DOM.flowItemsList) {
      DOM.flowItemsList.prepend(newFlowCard);
    }

    updateFlowProgress();
    closeModals();
    switchTab('schedule');
    showToast(`Assignment "${title}" saved! Focus sprint synced to Schedule.`);
  }

  /* ==========================================================================
     VOICE CHECK-IN PIPELINE & SILENCE DETECTION
     1. On-device Speech-to-Text via Web Speech API
     2. Silence detection timer (2.5s) or manual tap to finalize
     3. Pull live data snapshot from SupabaseService
     4. Process with Google Gemini API (system prompt + calendar event extractor)
     5. Execute calendar events, update habits, speak conversational reply
     ========================================================================== */
  let speechRecognizer = null;
  let silenceTimer = null;
  const SILENCE_TIMEOUT_MS = 2500; // 2.5s silence triggers auto-submission

  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      speechRecognizer = new SpeechRecognition();
      speechRecognizer.continuous = true;
      speechRecognizer.interimResults = true;
      speechRecognizer.lang = 'en-US';

      speechRecognizer.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const text = (final || interim).trim();
        if (text && DOM.liveTranscriptText) {
          DOM.liveTranscriptText.textContent = `"${text}"`;
          resetSilenceTimer();
        }
      };

      speechRecognizer.onerror = (e) => {
        console.warn('Speech recognition status:', e.error);
        if (DOM.voiceRecordingStatusText) {
          DOM.voiceRecordingStatusText.textContent = 'Voice Standby';
        }
      };

      speechRecognizer.onend = () => {
        if (state.voiceListening && DOM.modalVoiceNudge && !DOM.modalVoiceNudge.classList.contains('hidden')) {
          try { speechRecognizer.start(); } catch (_) {}
        }
      };
    }
  }

  function resetSilenceTimer() {
    if (silenceTimer) clearTimeout(silenceTimer);
    if (DOM.silenceCountdownText) {
      DOM.silenceCountdownText.textContent = 'Listening (silence in 2.5s)';
      DOM.silenceCountdownText.style.color = '#FBBF24';
    }

    silenceTimer = setTimeout(() => {
      console.log('Voice Check-in: 2.5s silence detected. Finalizing pipeline...');
      if (DOM.silenceCountdownText) {
        DOM.silenceCountdownText.textContent = 'Silence detected • Processing with Gemini...';
        DOM.silenceCountdownText.style.color = '#34D399';
      }
      handleSaveVoiceActions();
    }, SILENCE_TIMEOUT_MS);
  }

  function clearSilenceTimer() {
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }
    if (DOM.silenceCountdownText) {
      DOM.silenceCountdownText.textContent = '2.5s Silence Timer Active';
      DOM.silenceCountdownText.style.color = 'rgba(255,255,255,0.6)';
    }
  }

  function startSpeechRecognition() {
    if (!speechRecognizer) initSpeechRecognition();
    if (speechRecognizer) {
      try {
        speechRecognizer.start();
        if (DOM.voiceRecordingStatusText) DOM.voiceRecordingStatusText.textContent = 'Listening';
      } catch (err) {
        // already active
      }
    }
  }

  function stopSpeechRecognition() {
    clearSilenceTimer();
    if (speechRecognizer) {
      try { speechRecognizer.stop(); } catch (_) {}
    }
  }

  function toggleVoiceListening() {
    if (state.voiceListening) {
      // Manual tap to finish
      handleSaveVoiceActions();
    } else {
      state.voiceListening = true;
      updateVoiceVisualizerState();
      startSpeechRecognition();
    }
  }

  function updateVoiceVisualizerState() {
    const rings = document.querySelectorAll('.pulse-ring');
    const waveSpans = document.querySelectorAll('.core-wave-icon span');

    if (state.voiceListening) {
      if (DOM.voiceStatusTitle) DOM.voiceStatusTitle.textContent = 'Listening to you...';
      if (DOM.voiceStatusSubtitle) DOM.voiceStatusSubtitle.textContent = 'Stops on 2.5s silence or manual tap';
      if (DOM.coreTapText) DOM.coreTapText.textContent = 'TAP TO FINISH';
      rings.forEach(r => r.style.animationPlayState = 'running');
      waveSpans.forEach(s => s.style.animationPlayState = 'running');
    } else {
      if (DOM.voiceStatusTitle) DOM.voiceStatusTitle.textContent = 'Audio Paused';
      if (DOM.voiceStatusSubtitle) DOM.voiceStatusSubtitle.textContent = 'Tap to start voice check-in';
      if (DOM.coreTapText) DOM.coreTapText.textContent = 'TAP TO SPEAK';
      rings.forEach(r => r.style.animationPlayState = 'paused');
      waveSpans.forEach(s => s.style.animationPlayState = 'paused');
    }
  }

  /**
   * Complete Voice Check-in Pipeline Execution
   */
  async function handleSaveVoiceActions() {
    clearSilenceTimer();
    stopSpeechRecognition();
    state.voiceListening = false;
    updateVoiceVisualizerState();

    const rawTranscript = DOM.liveTranscriptText ? DOM.liveTranscriptText.textContent.replace(/^"|"$/g, '').trim() : '';
    const transcript = rawTranscript || "Shift my study session to 4:30 PM, log 250ml water, and I saved 200 rupees on lunch";

    if (DOM.voiceStatusTitle) DOM.voiceStatusTitle.textContent = '📊 Pulling live snapshot from Supabase...';
    if (DOM.voiceStatusSubtitle) DOM.voiceStatusSubtitle.textContent = 'Fetching classes, deadlines, habits & streaks...';

    const origBtnText = DOM.btnDoneVoice ? DOM.btnDoneVoice.textContent : '';
    if (DOM.btnDoneVoice) {
      DOM.btnDoneVoice.textContent = '✨ Gemini Processing...';
      DOM.btnDoneVoice.disabled = true;
    }

    try {
      // 1. Get Live Data Snapshot from Supabase
      const snapshot = await window.SupabaseService.getLiveSnapshot();

      const activeModel = window.GeminiService ? window.GeminiService.getModel() : 'gemini-3.7-flash';
      if (DOM.voiceStatusTitle) DOM.voiceStatusTitle.textContent = `✨ Gemini (${activeModel}) Analyzing...`;
      if (DOM.voiceStatusSubtitle) DOM.voiceStatusSubtitle.textContent = 'Extracting calendar events, habit check-ins & reply...';

      // 2. Query Gemini API with prompt & snapshot via AiOrchestrator
      const geminiResult = await AiOrchestrator.processVoiceCheckin(transcript, snapshot);

      // 3. Update Detected Action Pills in Voice Modal
      if (DOM.voiceDetectedActionsRow) {
        let pillsHtml = '';
        if (geminiResult.extracted_events && geminiResult.extracted_events.length > 0) {
          pillsHtml += geminiResult.extracted_events.map(ev => 
            `<div class="action-detected-pill terracotta-pill"><span>📅 ${escapeHtml(ev.title)} (${escapeHtml(ev.start_time || '4:30 PM')})</span></div>`
          ).join('');
        }
        if (geminiResult.habit_updates) {
          if (geminiResult.habit_updates.water_ml) {
            pillsHtml += `<div class="action-detected-pill sage-pill"><span>💧 +${geminiResult.habit_updates.water_ml}ml Water</span></div>`;
          }
          if (geminiResult.habit_updates.savings_amount) {
            pillsHtml += `<div class="action-detected-pill" style="background: rgba(234, 179, 8, 0.18); border: 1px solid rgba(234, 179, 8, 0.4); color: #FDE047;"><span>💰 Saved ₹${geminiResult.habit_updates.savings_amount}</span></div>`;
          }
          if (geminiResult.habit_updates.cycling_done) {
            pillsHtml += `<div class="action-detected-pill sage-pill"><span>🚴 Cycling Commute Done</span></div>`;
          }
        }
        if (pillsHtml) DOM.voiceDetectedActionsRow.innerHTML = pillsHtml;
      }

      // 4. Insert Extracted Calendar Events into Schedule Timeline & Supabase
      let executedEventsSummary = [];
      if (geminiResult.extracted_events && Array.isArray(geminiResult.extracted_events)) {
        for (const ev of geminiResult.extracted_events) {
          const time = ev.start_time || '4:30 PM';
          if (window.SupabaseService) {
            await window.SupabaseService.addTimelineEvent(ev);
          }
          executedEventsSummary.push(`${ev.title} at ${time}`);
        }
        renderScheduleTimeline();
      }

      // 5. Execute Habit Updates (Water, Chores, Cycling)
      if (geminiResult.habit_updates) {
        if (geminiResult.habit_updates.water_ml) {
          window.addWaterQuick(geminiResult.habit_updates.water_ml);
        }
        if (geminiResult.habit_updates.chores_done) {
          window.toggleFlowItem('flow-3');
        }
        if (geminiResult.habit_updates.cycling_done) {
          const card2 = document.querySelector('.figma-task-card[data-id="flow-2"]');
          if (card2 && !card2.classList.contains('completed')) {
            window.toggleFlowItem('flow-2');
          }
        }
        if (geminiResult.habit_updates.savings_amount && window.SupabaseService) {
          window.SupabaseService.logHabit('savings', geminiResult.habit_updates.savings_amount);
        }
        renderSummaryBadges();
        renderSummaryMetrics();
      }

      // 6. Sync to Daily Check-in Chat View
      if (DOM.chatMessagesContainer) {
        appendMessage(transcript, 'user');
        state.chatHistory.push({ sender: 'user', text: transcript });
        appendMessage(geminiResult.conversational_reply, 'ai');
        state.chatHistory.push({ sender: 'ai', text: geminiResult.conversational_reply });
      }

      // 7. Speak Conversational Reply Aloud with Web Speech Synthesis
      if ('speechSynthesis' in window && geminiResult.conversational_reply) {
        window.speechSynthesis.cancel();
        const cleanSpeech = geminiResult.conversational_reply.replace(/[*_#`]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanSpeech);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }

      // 8. Complete & Navigate to Schedule or Home
      setTimeout(() => {
        closeModals();
        if (executedEventsSummary.length > 0) {
          switchTab('schedule');
          showToast(`✨ Calendar updated: ${executedEventsSummary.join(', ')}`);
        } else {
          switchTab('chat');
          showToast('Voice check-in synced with Nudge companion!');
        }
      }, 800);

    } catch (err) {
      console.warn('Voice Check-in Pipeline error:', err);
      closeModals();
      showToast('Voice check-in completed.');
    } finally {
      if (DOM.btnDoneVoice) {
        DOM.btnDoneVoice.textContent = origBtnText;
        DOM.btnDoneVoice.disabled = false;
      }
    }
  }

  window.simulateVoiceSpeech = function (phrase) {
    if (DOM.liveTranscriptText) {
      DOM.liveTranscriptText.textContent = `"${phrase}"`;
    }
    handleSaveVoiceActions();
  };

  /* ==========================================================================
     AI GROWTH REFLECTION & CALENDAR ADVICE (Feature 4)
     ========================================================================== */
  async function handleGenerateAiSummary() {
    if (DOM.aiReflectionLoading) DOM.aiReflectionLoading.classList.remove('hidden');
    if (DOM.aiReflectionMainContent) DOM.aiReflectionMainContent.style.opacity = '0.3';

    try {
      const metrics = {
        hoursStudied: 18.5,
        sleepAvg: 6.2,
        habitStreak: 5,
        slippedHabits: 'Evening screen-free wind down',
        energyTrend: 'Peak at 9:30 AM, dips at 3:00 PM'
      };

      const summary = await AiOrchestrator.generateWeeklySummary(metrics);

      if (DOM.aiReflectionHeadline && summary.headline) {
        DOM.aiReflectionHeadline.textContent = summary.headline;
      }
      if (DOM.aiReflectionText && summary.journal_reflection) {
        DOM.aiReflectionText.textContent = summary.journal_reflection;
      }
      if (DOM.aiRecText && summary.calendar_recommendation && summary.calendar_recommendation.rationale) {
        DOM.aiRecText.textContent = summary.calendar_recommendation.rationale;
      }

      showToast('✨ Generated new Weekly Reflection with AI!');
    } catch (err) {
      console.warn('AI summary error:', err);
      showToast('Weekly reflection refreshed.');
    } finally {
      if (DOM.aiReflectionLoading) DOM.aiReflectionLoading.classList.add('hidden');
      if (DOM.aiReflectionMainContent) DOM.aiReflectionMainContent.style.opacity = '1';
    }
  }

  /* ==========================================================================
     AI & SUPABASE SETTINGS MANAGEMENT
     ========================================================================== */
  function initAiSettings() {
    updateAiConnectionBadge();

    if (DOM.openAiSettingsBtn) {
      DOM.openAiSettingsBtn.addEventListener('click', openAiSettingsModal);
    }
    if (DOM.chatAiSettingsBtn) {
      DOM.chatAiSettingsBtn.addEventListener('click', openAiSettingsModal);
    }
    if (DOM.closeAiSettingsBtn) {
      DOM.closeAiSettingsBtn.addEventListener('click', closeModals);
    }
    if (DOM.btnCancelAiSettings) {
      DOM.btnCancelAiSettings.addEventListener('click', closeModals);
    }

    // Toggle Gemini Key Visibility
    if (DOM.btnToggleGeminiKeyVis && DOM.geminiApiKeyInput) {
      DOM.btnToggleGeminiKeyVis.addEventListener('click', () => {
        const isPass = DOM.geminiApiKeyInput.type === 'password';
        DOM.geminiApiKeyInput.type = isPass ? 'text' : 'password';
        DOM.btnToggleGeminiKeyVis.textContent = isPass ? '🙈' : '👁️';
      });
    }

    // Test Gemini Connection
    if (DOM.btnTestGeminiConn) {
      DOM.btnTestGeminiConn.addEventListener('click', async () => {
        const key = DOM.geminiApiKeyInput ? DOM.geminiApiKeyInput.value.trim() : '';
        if (!key) {
          showToast('Please enter a Google Gemini API key to test.');
          return;
        }

        if (DOM.geminiStatusBadge) {
          DOM.geminiStatusBadge.textContent = 'Testing...';
          DOM.geminiStatusBadge.style.background = 'rgba(66, 133, 244, 0.1)';
          DOM.geminiStatusBadge.style.color = '#1A73E8';
        }

        const res = await window.GeminiService.testConnection(key);
        if (res.success) {
          if (DOM.geminiStatusBadge) {
            DOM.geminiStatusBadge.textContent = `Connected (${res.latency}ms)`;
            DOM.geminiStatusBadge.style.background = '#DCEDE3';
            DOM.geminiStatusBadge.style.color = '#1E5C41';
          }
          showToast(`✨ Google Gemini connected successfully (${res.latency}ms)!`);
        } else {
          if (DOM.geminiStatusBadge) {
            DOM.geminiStatusBadge.textContent = 'Failed';
            DOM.geminiStatusBadge.style.background = '#FEE2E2';
            DOM.geminiStatusBadge.style.color = '#B91C1C';
          }
          showToast(`Gemini error: ${res.error}`);
        }
      });
    }

    // Groq Connection Test
    if (DOM.btnTestGroqConn) {
      DOM.btnTestGroqConn.addEventListener('click', async () => {
        const key = DOM.groqApiKeyInput ? DOM.groqApiKeyInput.value.trim() : '';
        if (!key) {
          showToast('Please enter your Groq API key first (starts with gsk_).');
          return;
        }

        if (DOM.groqStatusBadge) {
          DOM.groqStatusBadge.textContent = 'Testing...';
          DOM.groqStatusBadge.style.background = 'rgba(217, 107, 67, 0.1)';
          DOM.groqStatusBadge.style.color = 'var(--terracotta)';
        }

        const res = await window.GroqService.testConnection(key);
        if (res.success) {
          if (DOM.groqStatusBadge) {
            DOM.groqStatusBadge.textContent = `Connected (${res.latency}ms)`;
            DOM.groqStatusBadge.style.background = '#DCEDE3';
            DOM.groqStatusBadge.style.color = '#1E5C41';
          }
          showToast(`⚡ Groq AI connected successfully (${res.latency}ms)!`);
        } else {
          if (DOM.groqStatusBadge) {
            DOM.groqStatusBadge.textContent = 'Failed';
            DOM.groqStatusBadge.style.background = '#FEE2E2';
            DOM.groqStatusBadge.style.color = '#B91C1C';
          }
          showToast(`Groq error: ${res.error}`);
        }
      });
    }

    // Inspect Live Supabase Snapshot
    if (DOM.btnInspectSnapshot) {
      DOM.btnInspectSnapshot.addEventListener('click', async () => {
        const snapshot = await window.SupabaseService.getLiveSnapshot();
        const summary = `Date: ${snapshot.date} | Classes: ${snapshot.today_classes.length} | Open Assignments: ${snapshot.open_assignments.length} | Cycling Streak: ${snapshot.streaks.movement_cycling}d`;
        showToast(`📊 Supabase Snapshot: ${summary}`);
        console.log('Live Supabase Snapshot Data:', snapshot);
      });
    }

    // Save All Credentials
    if (DOM.btnSaveAiSettings) {
      DOM.btnSaveAiSettings.addEventListener('click', () => {
        const geminiKey = DOM.geminiApiKeyInput ? DOM.geminiApiKeyInput.value.trim() : '';
        const geminiModel = DOM.geminiModelSelect ? DOM.geminiModelSelect.value : (window.NudgeConfig ? window.NudgeConfig.gemini.defaultModel : 'gemini-3.7-flash');
        const subUrl = DOM.supabaseUrlInput ? DOM.supabaseUrlInput.value.trim() : '';
        const subKey = DOM.supabaseKeyInput ? DOM.supabaseKeyInput.value.trim() : '';
        const groqKey = DOM.groqApiKeyInput ? DOM.groqApiKeyInput.value.trim() : '';
        const groqModel = DOM.groqModelSelect ? DOM.groqModelSelect.value : 'llama-3.1-8b-instant';

        window.GeminiService.setApiKey(geminiKey);
        window.GeminiService.setModel(geminiModel);
        window.SupabaseService.setCredentials(subUrl, subKey);
        if (groqKey) {
          window.GroqService.setApiKey(groqKey);
          window.GroqService.setModel(groqModel);
        }

        updateAiConnectionBadge();
        closeModals();
        showToast('All credentials saved! AI Companion active.');
      });
    }
  }

  function updateAiConnectionBadge() {
    const geminiConfigured = window.GeminiService && window.GeminiService.isConfigured;
    const groqConfigured = window.GroqService && window.GroqService.isConfigured;

    if (DOM.desktopAiBadge) {
      if (geminiConfigured) {
        DOM.desktopAiBadge.textContent = '✨ Gemini Live';
      } else if (groqConfigured) {
        DOM.desktopAiBadge.textContent = '⚡ Groq AI';
      } else {
        DOM.desktopAiBadge.textContent = '✨ Gemini Voice';
      }
    }
  }

  /* ==========================================================================
     TOAST NOTIFICATIONS
     ========================================================================== */
  function showToast(message) {
    if (!DOM.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${message}</span>
    `;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Self-execute init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
