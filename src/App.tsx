import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "./components/Header";
import { ChatBox } from "./components/ChatBox";
import { LiveSnapshotPanel } from "./components/LiveSnapshotPanel";
import { SecurityExplainerModal } from "./components/SecurityExplainerModal";
import { VoiceNudgeModal } from "./components/VoiceNudgeModal";
import { GeminiTesterModal } from "./components/GeminiTesterModal";
import { ThemeModal } from "./components/ThemeModal";
import { QRCodeModal } from "./components/QRCodeModal";
import { getSavedTheme, applyTheme, AppTheme } from "./lib/theme";
import { BottomNavigation, AppTab } from "./components/BottomNavigation";
import { HomeView } from "./components/HomeView";
import { ScheduleView } from "./components/ScheduleView";
import { SummaryView } from "./components/SummaryView";
import {
  StudentSnapshot,
  ChatMessage,
  EdgeFunctionChatResponse,
  NudgeTone,
} from "./types";
import {
  fetchLiveSnapshot,
  updateLiveSnapshot,
  sendChatMessageToEdgeFunction,
} from "./lib/api";
import {
  getPaginatedLocalHistory,
  appendLocalChatMessage,
  clearLocalChatHistory,
  sanitizeMessageContent,
} from "./lib/storage";
import { useBreakTimer } from "./hooks/useBreakTimer";
import { detectBreakRequest } from "./lib/breakTimer";
import { BreakTimerBanner } from "./components/BreakTimerBanner";
import { useReminders } from "./hooks/useReminders";
import { NotificationRemindersModal } from "./components/NotificationRemindersModal";
import { NotificationAlertBanner } from "./components/NotificationAlertBanner";
import { detectReminderRequest } from "./lib/reminderDetector";
import { getSavedTone, saveTonePreference } from "./lib/tones";
import { parseTimerIntent } from "./lib/timerIntentParser";
import { startPlatformTimer } from "./lib/nativeTimer";
import { ShieldAlert, X } from "lucide-react";
import { MilestonesBadgesView } from "./components/MilestonesBadgesView";
import { AddAssignmentModal } from "./components/AddAssignmentModal";
import { SettingsModal } from "./components/SettingsModal";
import { ReflectionNoteModal } from "./components/ReflectionNoteModal";
import { AssignmentItem, MoodState } from "./types";
import { useSmoothScroll } from "./hooks/useSmoothScroll";

export default function App() {
  // Initialize Lenis Momentum Smooth Scrolling & GSAP ScrollTrigger Integration
  useSmoothScroll();
  const [snapshot, setSnapshot] = useState<StudentSnapshot | null>(null);
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(20);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [isGeminiTesterOpen, setIsGeminiTesterOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    applyTheme("light");
    return "light";
  });
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    applyTheme("light");
  }, []);

  const handleToggleTheme = () => {
    const next: AppTheme = currentTheme === "dark" ? "light" : "dark";
    setCurrentTheme(next);
    applyTheme(next);
  };

  const handleSelectTheme = (newTheme: AppTheme) => {
    setCurrentTheme(newTheme);
    applyTheme(newTheme);
  };

  // Reminders & Notification System
  const remindersSystem = useReminders();

  // Nudge Tone & Persona setting
  const [currentTone, setCurrentTone] = useState<NudgeTone>(() => getSavedTone());

  const handleToneChange = (newTone: NudgeTone) => {
    setCurrentTone(newTone);
    saveTonePreference(newTone);
  };

  // Focus Mode
  const [isFocusMode, setIsFocusMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("nudge_focus_mode") === "true";
    } catch {
      return false;
    }
  });

  const handleToggleFocusMode = () => {
    setIsFocusMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("nudge_focus_mode", String(next));
      } catch {}
      return next;
    });
  };

  // Proactive notification when break completes
  const handleBreakOver = useCallback(() => {
    const assistantTime = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    const breakDoneMsg: ChatMessage = {
      id: "msg_break_over_" + Date.now(),
      role: "assistant",
      content:
        "☕ **Break is over!** Hope you feel recharged and clear-headed. Ready to dive back in? Let's tackle that next task together.",
      timestamp: assistantTime,
      quickReplies: [
        "Start a 25m focus sprint 🎯",
        "Review open assignments 📋",
        "Need 5 more minutes ☕",
      ],
      snapshotContextSnippet: {
        openTasksCount:
          snapshot?.openAssignments.filter((a) => !a.completed).length || 0,
        classesCount: snapshot?.todayClasses.length || 0,
        mood: snapshot?.mood.label || "Rested",
        habitStreak: snapshot?.streaks.habitDays || 0,
      },
    };

    setMessages((prev) => [...prev, breakDoneMsg]);
    appendLocalChatMessage(breakDoneMsg);
  }, [snapshot]);

  // Dedicated Break Timer
  const breakTimer = useBreakTimer({
    onBreakOver: handleBreakOver,
  });

  // 1. Load on-device local history
  useEffect(() => {
    const { messages: initialMsgs, hasMore } = getPaginatedLocalHistory(15, 0);
    setMessages(initialMsgs);
    setHasMoreHistory(hasMore);
  }, []);

  // 2. Fetch live Supabase student snapshot
  const loadSnapshot = useCallback(async () => {
    try {
      setIsSnapshotLoading(true);
      const data = await fetchLiveSnapshot();
      setSnapshot(data);
      setErrorMessage(null);
    } catch (err) {
      console.error("Snapshot error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load Supabase snapshot"
      );
    } finally {
      setIsSnapshotLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSnapshot();
  }, [loadSnapshot]);

  // Handle pagination
  const handleLoadMoreHistory = () => {
    const nextOffset = historyOffset + 15;
    const { messages: olderMsgs, hasMore } = getPaginatedLocalHistory(15, nextOffset);
    setMessages(olderMsgs);
    setHistoryOffset(nextOffset);
    setHasMoreHistory(hasMore);
  };

  // Clear local device history
  const handleClearHistory = () => {
    if (
      window.confirm(
        "Clear all on-device conversation records? Your habit and assignment data in Supabase will NOT be affected."
      )
    ) {
      clearLocalChatHistory();
      setMessages([]);
      setHistoryOffset(0);
      setHasMoreHistory(false);
    }
  };

  // Update Supabase snapshot
  const handleUpdateSnapshot = async (updated: Partial<StudentSnapshot>) => {
    try {
      const fresh = await updateLiveSnapshot(updated);
      setSnapshot(fresh);
    } catch (err) {
      console.error("Snapshot update error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update Supabase snapshot"
      );
    }
  };

  const handleAddAssignment = async (newAsg: AssignmentItem) => {
    if (!snapshot) return;
    const updatedAssignments = [newAsg, ...snapshot.openAssignments];
    await handleUpdateSnapshot({ openAssignments: updatedAssignments });

    // Automatically schedule a gentle reminder 30 mins before
    remindersSystem.scheduleReminder({
      title: `Focus Sprint: ${newAsg.title}`,
      note: `Due: ${newAsg.dueDate} (${newAsg.course})`,
      delayMinutes: 30,
      category: "assignment",
      relatedId: newAsg.id,
    });
  };

  const handleSaveReflection = async (newMood: MoodState) => {
    if (!snapshot) return;
    await handleUpdateSnapshot({ mood: newMood });
  };

  // Send message via Edge Function Proxy with live snapshot
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isChatLoading) return;

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    const userMsg: ChatMessage = {
      id: "msg_" + Math.random().toString(36).substring(2, 9),
      role: "user",
      content: text,
      timestamp: formattedTime,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    appendLocalChatMessage(userMsg);
    setIsChatLoading(true);
    setErrorMessage(null);

    // Phase 1 & 3: Command parsing & Chatbox wiring
    // Detect timer commands (e.g. "start timer for 10 minutes", "set a 5 min timer", "timer 30 sec")
    // Intercepts immediately, calls platform redirect, avoids calendar writes, and shows confirmation bubble
    const timerIntent = parseTimerIntent(text);
    if (timerIntent && timerIntent.action === "SET_TIMER") {
      try {
        const timerResult = await startPlatformTimer({
          durationSeconds: timerIntent.durationSeconds,
          label: timerIntent.label,
        });

        const assistantTime = new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });

        const confirmationMsg: ChatMessage = {
          id: "msg_" + Math.random().toString(36).substring(2, 9),
          role: "assistant",
          content: timerResult.confirmationMessage,
          timestamp: assistantTime,
          quickReplies: ["Cancel timer ⏱️", "Check schedule 📅", "Ready to focus 🎯"],
        };

        setMessages((prev) => [...prev, confirmationMsg]);
        appendLocalChatMessage(confirmationMsg);
      } catch (err: any) {
        console.error("[Timer] Platform timer error:", err);
        const errorMsg: ChatMessage = {
          id: "msg_" + Math.random().toString(36).substring(2, 9),
          role: "assistant",
          content: `Unable to set timer: ${err?.message || "Platform error"} ⚠️`,
          timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errorMsg]);
        appendLocalChatMessage(errorMsg);
      } finally {
        setIsChatLoading(false);
      }
      return;
    }

    // Cancel timer intent handler
    if (text.toLowerCase().trim() === "cancel timer" || text.toLowerCase().trim() === "cancel timer ⏱️") {
      const assistantTime = new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      const cancelMsg: ChatMessage = {
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        role: "assistant",
        content: "Timer cancelled 🛑",
        timestamp: assistantTime,
        quickReplies: ["Start timer for 15m ⏱️", "Check schedule 📅", "Ready to focus 🎯"],
      };
      setMessages((prev) => [...prev, cancelMsg]);
      appendLocalChatMessage(cancelMsg);
      setIsChatLoading(false);
      return;
    }

    const breakDetection = detectBreakRequest(text);
    if (breakDetection.isBreak) {
      breakTimer.startBreak(breakDetection.durationMinutes);
    }

    const reminderDetection = detectReminderRequest(text);
    if (reminderDetection.isReminder) {
      if (reminderDetection.openModalRequested) {
        setIsRemindersModalOpen(true);
      } else {
        remindersSystem.scheduleReminder({
          title: reminderDetection.title || "Study Sprint Check-in",
          delayMinutes: reminderDetection.delayMinutes || 15,
          category: "study",
          note: `Requested in chat: "${text}"`,
        });
      }
    }

    try {
      let currentSnapshot = snapshot;
      try {
        currentSnapshot = await fetchLiveSnapshot();
        setSnapshot(currentSnapshot);
      } catch (e) {
        console.warn("Using active snapshot fallback", e);
      }

      const recentTurns = updatedMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const requestPayload = {
        message: text,
        snapshot: currentSnapshot!,
        history: recentTurns,
        tone: currentTone,
      };

      const response: EdgeFunctionChatResponse = await sendChatMessageToEdgeFunction(
        requestPayload
      );

      if (response.rateLimit) {
        setRateLimitRemaining(response.rateLimit.remaining);
      }

      const assistantTime = new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });

      const assistantMsg: ChatMessage = {
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        role: "assistant",
        content: sanitizeMessageContent(response.reply),
        timestamp: assistantTime,
        events: response.events,
        quickReplies: response.quickReplies,
        snapshotContextSnippet: {
          openTasksCount:
            currentSnapshot?.openAssignments.filter((a) => !a.completed).length || 0,
          classesCount: currentSnapshot?.todayClasses.length || 0,
          mood: currentSnapshot?.mood.label || "Moderate",
          habitStreak: currentSnapshot?.streaks.habitDays || 0,
        },
      };

      setMessages((prev) => [...prev, assistantMsg]);
      appendLocalChatMessage(assistantMsg);
    } catch (err) {
      console.error("Chat error:", err);
      const errMsg =
        err instanceof Error ? err.message : "Error sending message to Edge Function";
      setErrorMessage(errMsg);

      const errorMsg: ChatMessage = {
        id: "msg_err_" + Date.now(),
        role: "assistant",
        content: `⚠️ [Security & Proxy Notice]: ${errMsg}. Please check Edge Function connection or rate limit.`,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] dark:bg-[#0F1A18] text-[#1E3A34] dark:text-[#E9F3EF] flex flex-col font-sans selection:bg-[#EAF2EE] selection:text-[#1E3A34] relative overflow-x-hidden">
      {/* Top Header - Luminous Glassmorphic Design */}
      <Header
        snapshot={snapshot}
        rateLimitRemaining={rateLimitRemaining}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        breakTimerState={{
          isActive: breakTimer.isActive,
          remainingSeconds: breakTimer.remainingSeconds,
          hasFinished: breakTimer.hasFinished,
        }}
        onOpenRemindersModal={() => setIsRemindersModalOpen(true)}
        activeRemindersCount={remindersSystem.activeReminders.length}
        onOpenGeminiTester={() => setIsGeminiTesterOpen(true)}
        currentTheme={currentTheme}
        onToggleTheme={handleToggleTheme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMilestones={() => setActiveTab("milestones")}
      />

      {/* Floating Interactive Alert Banner for Triggered Reminders */}
      <NotificationAlertBanner
        alert={remindersSystem.activeAlert}
        onDismiss={remindersSystem.dismissAlert}
        onSnooze={remindersSystem.snoozeReminder}
        onOpenRemindersModal={() => setIsRemindersModalOpen(true)}
      />

      {/* Error / Rate Limit Alert Banner */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-2">
          <div className="bg-[#FBEAE9] border border-[#F5CAC7] px-4 py-2 rounded-2xl text-xs text-rose-950 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-700 hover:text-rose-950 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Canvas with Thoughtful Motion Transitions */}
      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col px-3 sm:px-6 pt-2 pb-24 relative overflow-hidden">
        {/* Break Timer Banner */}
        {activeTab !== "chat" && (breakTimer.isActive || breakTimer.hasFinished) && (
          <div className="shrink-0 mb-4">
            <BreakTimerBanner
              initialMinutes={breakTimer.initialMinutes}
              totalSeconds={breakTimer.totalSeconds}
              remainingSeconds={breakTimer.remainingSeconds}
              isActive={breakTimer.isActive}
              isPaused={breakTimer.isPaused}
              onPauseToggle={breakTimer.pauseToggle}
              onAddMinutes={breakTimer.addMinutes}
              onFinishEarly={breakTimer.finishEarly}
              onDismissFinished={breakTimer.dismissFinished}
              hasFinished={breakTimer.hasFinished}
              notificationPermission={breakTimer.notificationPermission}
              onRequestNotification={breakTimer.requestNotification}
            />
          </div>
        )}

        {/* Animated Screen Switcher via AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="flex-1 w-full flex flex-col overflow-hidden"
          >
            {/* Screen 1: Home Dashboard */}
            {activeTab === "home" && (
              <HomeView
                snapshot={snapshot}
                onNavigateToChat={() => setActiveTab("chat")}
                onNavigateToSnapshot={() => setActiveTab("snapshot")}
                onNavigateToSchedule={() => setActiveTab("schedule")}
                onNavigateToMilestones={() => setActiveTab("milestones")}
                onOpenAddAssignment={() => setIsAddAssignmentOpen(true)}
                onOpenReflection={() => setIsReflectionOpen(true)}
              />
            )}

            {/* Screen 2: AI Student Chat Companion */}
            {activeTab === "chat" && (
              <div className="flex-1 w-full max-w-3xl mx-auto h-[calc(100dvh-130px)] flex flex-col min-h-0">
                <ChatBox
                  messages={messages}
                  isLoading={isChatLoading}
                  onSendMessage={handleSendMessage}
                  onLoadMoreHistory={handleLoadMoreHistory}
                  hasMoreHistory={hasMoreHistory}
                  onClearLocalHistory={handleClearHistory}
                  snapshot={snapshot}
                  onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
                  onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                  currentTone={currentTone}
                  onSelectTone={handleToneChange}
                  isFocusMode={isFocusMode}
                  onToggleFocusMode={handleToggleFocusMode}
                  onOpenRemindersModal={() => setIsRemindersModalOpen(true)}
                  activeRemindersCount={remindersSystem.activeReminders.length}
                  breakTimer={{
                    isActive: breakTimer.isActive,
                    isPaused: breakTimer.isPaused,
                    initialMinutes: breakTimer.initialMinutes,
                    totalSeconds: breakTimer.totalSeconds,
                    remainingSeconds: breakTimer.remainingSeconds,
                    hasFinished: breakTimer.hasFinished,
                    notificationPermission: breakTimer.notificationPermission,
                    onPauseToggle: breakTimer.pauseToggle,
                    onAddMinutes: breakTimer.addMinutes,
                    onFinishEarly: breakTimer.finishEarly,
                    onDismissFinished: breakTimer.dismissFinished,
                    onRequestNotification: breakTimer.requestNotification,
                  }}
                />
              </div>
            )}

            {/* Screen 3: Supabase Live Snapshot (User's Image Screen) */}
            {activeTab === "snapshot" && (
              <LiveSnapshotPanel
                snapshot={snapshot}
                isLoading={isSnapshotLoading}
                onRefresh={loadSnapshot}
                onUpdateSnapshot={handleUpdateSnapshot}
                isFocusMode={isFocusMode}
                onToggleFocusMode={handleToggleFocusMode}
                onQuickRemind={(asg) => {
                  remindersSystem.scheduleReminder({
                    title: `Work on ${asg.title}`,
                    note: `Due: ${asg.dueDate} (${asg.course})`,
                    delayMinutes: 20,
                    category: "assignment",
                    relatedId: asg.id,
                  });
                  setIsRemindersModalOpen(true);
                }}
                currentTheme={currentTheme}
                onOpenThemeModal={() => setIsThemeModalOpen(true)}
                onSelectTheme={handleSelectTheme}
              />
            )}

            {/* Screen 4: Schedule */}
            {activeTab === "schedule" && (
              <ScheduleView
                onNavigateToChat={() => setActiveTab("chat")}
                onOpenAddAssignment={() => setIsAddAssignmentOpen(true)}
              />
            )}

            {/* Screen 5: Summary */}
            {activeTab === "summary" && (
              <SummaryView
                onNavigateToChat={() => setActiveTab("chat")}
                onNavigateToMilestones={() => setActiveTab("milestones")}
                onOpenReflection={() => setIsReflectionOpen(true)}
              />
            )}

            {/* Screen 6: Growth Journal & Milestones */}
            {activeTab === "milestones" && (
              <MilestonesBadgesView
                onNavigateBack={() => setActiveTab("home")}
                onOpenReflection={() => setIsReflectionOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Unlumen UI Motion Dock */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
      />

      {/* Modals */}
      <VoiceNudgeModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSendTranscription={(text) => {
          setActiveTab("chat");
          handleSendMessage(text);
        }}
      />

      <SecurityExplainerModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      <NotificationRemindersModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
        reminders={remindersSystem.reminders}
        activeReminders={remindersSystem.activeReminders}
        pastReminders={remindersSystem.pastReminders}
        notificationPermission={remindersSystem.notificationPermission}
        onRequestPermission={remindersSystem.requestPermission}
        onScheduleReminder={remindersSystem.scheduleReminder}
        onCancelReminder={remindersSystem.cancelReminder}
        onSendTestNotification={remindersSystem.sendTestNotification}
        onClearCompleted={remindersSystem.clearCompleted}
        snapshot={snapshot}
      />

      <GeminiTesterModal
        isOpen={isGeminiTesterOpen}
        onClose={() => setIsGeminiTesterOpen(false)}
      />

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />

      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* Newly Imported Stitch Design Modals */}
      <AddAssignmentModal
        isOpen={isAddAssignmentOpen}
        onClose={() => setIsAddAssignmentOpen(false)}
        onAddAssignment={handleAddAssignment}
        snapshot={snapshot}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        snapshot={snapshot}
        onClearChatHistory={handleClearHistory}
      />

      <ReflectionNoteModal
        isOpen={isReflectionOpen}
        onClose={() => setIsReflectionOpen(false)}
        snapshot={snapshot}
        onSaveReflection={handleSaveReflection}
      />
    </div>
  );
}
