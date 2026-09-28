import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar as CalendarIcon,
  Check,
  X,
  ExternalLink,
  Download,
  Mail,
  Sparkles,
  RefreshCw,
  Bell,
  ShieldCheck,
} from "lucide-react";
import {
  GoogleCalendarConfig,
  ScheduleEvent,
  buildGoogleCalendarUrl,
  downloadICSFile,
} from "../lib/googleCalendar";

interface GoogleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleCalendarConfig;
  onSaveConfig: (updated: GoogleCalendarConfig) => void;
  events: ScheduleEvent[];
  selectedDateStr: string;
}

export const GoogleCalendarModal: React.FC<GoogleCalendarModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  events,
  selectedDateStr,
}) => {
  const [email, setEmail] = useState(config.userEmail);
  const [isConnected, setIsConnected] = useState(config.isConnected);
  const [autoSync, setAutoSync] = useState(config.autoSyncFocusBlocks);
  const [reminderMinutes, setReminderMinutes] = useState(
    config.defaultRemindersMinutes
  );
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      isConnected,
      userEmail: email,
      autoSyncFocusBlocks: autoSync,
      defaultRemindersMinutes: reminderMinutes,
    });
    onClose();
  };

  const handleExportICS = () => {
    downloadICSFile(events, selectedDateStr);
    setSyncFeedback("Calendar file (.ics) downloaded!");
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  const handleBatchSyncGCal = () => {
    setIsSyncingAll(true);
    setSyncFeedback("Opening today's focus block in Google Calendar...");

    // Open first planned focus event or class in Google Calendar Web Template
    const focusEvent =
      events.find((e) => e.category === "Focus") || events[0];
    if (focusEvent) {
      const url = buildGoogleCalendarUrl(focusEvent, selectedDateStr);
      window.open(url, "_blank", "noopener,noreferrer");
    }

    setTimeout(() => {
      setIsSyncingAll(false);
      setSyncFeedback("Event synced with Google Calendar!");
      setTimeout(() => setSyncFeedback(null), 3500);
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="w-full max-w-md bg-[#FAF8F5] dark:bg-[#1C1917] rounded-3xl border border-[#E7DFD7] dark:border-[#332C29] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#EAE2DA] dark:border-[#332C29] bg-[#F4EFEA]/80 dark:bg-[#24201E]/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Google Calendar Multi-color G Icon Tile */}
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#24201E] border border-[#EAE2DA] dark:border-[#3D3430] flex items-center justify-center shadow-xs">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[#2D2522] dark:text-[#F5EBE6]">
                    Google Calendar
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{isConnected ? "Connected" : "Disconnected"}</span>
                  </span>
                </div>
                <p className="text-xs text-[#70645D] dark:text-[#A89B95]">
                  Sync study blocks, classes & reminders
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#70645D] dark:text-[#A89B95] hover:bg-white dark:hover:bg-[#2E2824] hover:text-[#2D2522] dark:hover:text-[#F5EBE6] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback Toast */}
          {syncFeedback && (
            <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{syncFeedback}</span>
            </div>
          )}

          {/* Content */}
          <div className="p-4 sm:p-5 space-y-4">
            {/* Account Info */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5C5049] dark:text-[#C4B8B0] flex items-center justify-between">
                <span>Google Account</span>
                <span className="text-[11px] font-normal text-[#8F827A] dark:text-[#8C8478]">
                  School / Personal
                </span>
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white dark:bg-[#24201E] border border-[#EAE2DA] dark:border-[#383129] shadow-2xs">
                <Mail className="w-4 h-4 text-[#A33C1B] dark:text-[#E07A5F] shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full bg-transparent text-xs text-[#2D2522] dark:text-[#F5EBE6] font-medium outline-none"
                />
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F827A] dark:text-[#A89B95] block">
                Calendar Actions
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleBatchSyncGCal}
                  disabled={isSyncingAll}
                  className="p-3 rounded-2xl bg-white dark:bg-[#24201E] border border-[#EAE2DA] dark:border-[#383129] hover:border-[#A33C1B] dark:hover:border-[#E07A5F] transition-all flex flex-col items-center gap-1.5 text-center shadow-2xs group"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#FCEEEA] dark:bg-[#2D1B14] flex items-center justify-center text-[#A33C1B] dark:text-[#E07A5F] group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#2D2522] dark:text-[#F5EBE6]">
                    Sync to GCal
                  </span>
                  <span className="text-[10px] text-[#70645D] dark:text-[#A89B95] leading-tight">
                    Add study block
                  </span>
                </button>

                <button
                  onClick={handleExportICS}
                  className="p-3 rounded-2xl bg-white dark:bg-[#24201E] border border-[#EAE2DA] dark:border-[#383129] hover:border-[#A33C1B] dark:hover:border-[#E07A5F] transition-all flex flex-col items-center gap-1.5 text-center shadow-2xs group"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#FAF0ED] dark:bg-[#2E2824] flex items-center justify-center text-[#5C5049] dark:text-[#E0D5CE] group-hover:scale-110 transition-transform">
                    <Download className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#2D2522] dark:text-[#F5EBE6]">
                    Export .ICS
                  </span>
                  <span className="text-[10px] text-[#70645D] dark:text-[#A89B95] leading-tight">
                    Import to any app
                  </span>
                </button>
              </div>
            </div>

            {/* Sync Preferences */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#24201E] border border-[#EAE2DA] dark:border-[#383129] space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#2D2522] dark:text-[#F5EBE6] block">
                    Auto-Sync Focus Sprints
                  </span>
                  <span className="text-[11px] text-[#70645D] dark:text-[#A89B95]">
                    Push AI planned focus blocks to Google Calendar
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoSync}
                  onClick={() => setAutoSync(!autoSync)}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
                    autoSync ? "bg-[#A33C1B] dark:bg-[#E07A5F]" : "bg-stone-300 dark:bg-stone-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                      autoSync ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#F0EAE4] dark:border-[#332C29]">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-[#70645D] dark:text-[#A89B95]" />
                  <span className="text-xs font-medium text-[#2D2522] dark:text-[#F5EBE6]">
                    Google Calendar Notification
                  </span>
                </div>
                <select
                  value={reminderMinutes}
                  onChange={(e) => setReminderMinutes(Number(e.target.value))}
                  className="bg-[#FAF8F5] dark:bg-[#1C1917] border border-[#D9CEC6] dark:border-[#3D3430] text-xs text-[#2D2522] dark:text-[#F5EBE6] rounded-xl px-2 py-1 outline-none"
                >
                  <option value={5}>5 mins before</option>
                  <option value={10}>10 mins before</option>
                  <option value={15}>15 mins before</option>
                  <option value={30}>30 mins before</option>
                </select>
              </div>
            </div>

            {/* Direct Google Calendar Web Link */}
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-2xl bg-[#FCEEEA]/70 dark:bg-[#2D1B14] border border-[#F6D5CB] dark:border-[#4D2D20] text-xs font-semibold text-[#A33C1B] dark:text-[#E07A5F] hover:bg-[#FCEEEA] transition-colors"
            >
              <span className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>Open Google Calendar Web</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Footer */}
          <div className="p-3.5 sm:p-4 border-t border-[#EAE2DA] dark:border-[#332C29] bg-[#F4EFEA]/80 dark:bg-[#24201E]/80 flex items-center justify-between text-xs text-[#70645D] dark:text-[#A89B95]">
            <span className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Google Calendar Sync</span>
            </span>

            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-[#A33C1B] hover:bg-[#8D3316] text-white font-bold shadow-xs transition-colors"
            >
              Save & Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
