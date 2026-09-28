import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Palette,
  Bell,
  Clock,
  Shield,
  Trash2,
  Check,
  Sun,
  Moon,
  Sparkles,
  Volume2,
  VolumeX,
  Smartphone,
  Download,
} from "lucide-react";
import { AppTheme } from "../lib/theme";
import { StudentSnapshot } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  snapshot: StudentSnapshot | null;
  onClearChatHistory?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  snapshot,
  onClearChatHistory,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [midtermProtection, setMidtermProtection] = useState(true);
  const [clearedNotice, setClearedNotice] = useState(false);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your local on-device chat vault?")) {
      onClearChatHistory?.();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#2D2522]/50 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", stiffness: 360, damping: 28 }}
          className="relative w-full max-w-lg bg-[#FFF8F6] dark:bg-[#1E1917] rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#F0E6E4] dark:border-[#382F2C] overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F0E6E4] dark:border-[#352D2A]">
            <div className="flex flex-col">
              <span className="font-extrabold text-xl text-[#1F1B1A] dark:text-[#F6ECEA]">
                Settings & Preferences
              </span>
              <span className="text-xs text-[#70645D] dark:text-[#A89E97]">
                Mindful Study Space & Calm Controls
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/80 dark:bg-[#2C2422] text-[#70645D] dark:text-[#A89E97] hover:text-[#2D2522] dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            {/* Student Profile Card (Matching Stitch design) */}
            <div className="w-full bg-white dark:bg-[#251E1C] rounded-2xl p-4 shadow-xs border border-[#EAE0DE] dark:border-[#382F2C] flex items-center gap-3.5">
              <div className="relative shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Maya Lin"
                  className="w-13 h-13 rounded-full object-cover shadow-xs border-2 border-white dark:border-[#1E1917]"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#486551] text-white flex items-center justify-center text-[10px]">
                  🌿
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1F1B1A] dark:text-[#F6ECEA] truncate">
                    {snapshot?.studentName || "Maya Lin"}
                  </h3>
                  <span className="text-[11px] font-semibold text-[#9D3E1A] dark:text-[#FFB59C]">
                    Year 2
                  </span>
                </div>
                <p className="text-xs text-[#70645D] dark:text-[#A89E97] truncate">
                  Bioethics & Pre-Med • Hall B
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#CAEBD1] dark:bg-[#486551]/30 text-[#042011] dark:text-[#CAEBD1] text-[10px] font-bold">
                    🔥 {snapshot?.streaks?.habitDays || 14}-Day Streak
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F6ECEA] dark:bg-[#2D2522] text-[#56423C] dark:text-[#A89E97] text-[10px] font-medium">
                    Focus: Midterms
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 1: Appearance & Display (Stitch 3-way toggle) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#9D3E1A]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F1B1A] dark:text-[#F6ECEA]">
                  Appearance & Display
                </h4>
              </div>
              <div className="grid grid-cols-3 gap-2.5 p-1.5 bg-[#F6ECEA] dark:bg-[#27201E] rounded-2xl">
                {/* Light Theme */}
                <button
                  type="button"
                  onClick={() => onSelectTheme("light")}
                  className={`flex flex-col items-center p-2.5 rounded-xl transition-all ${
                    currentTheme === "light"
                      ? "bg-white dark:bg-[#1E1917] shadow-sm text-[#9D3E1A] ring-1 ring-[#9D3E1A]/30"
                      : "text-[#56423C] dark:text-[#A89E97] hover:bg-white/50"
                  }`}
                >
                  <div className="w-full aspect-[4/3] rounded-lg bg-[#FAF7F2] border border-[#EAE0DE] p-2 flex flex-col justify-between mb-2">
                    <Sun className="w-3.5 h-3.5 text-[#9D3E1A]" />
                    <div className="space-y-1">
                      <div className="h-1.5 w-3/4 rounded-full bg-[#DDBCB1]" />
                      <div className="h-1.5 w-1/2 rounded-full bg-[#DDBCB1]/60" />
                    </div>
                  </div>
                  <span className="text-xs font-bold">Warm Oat</span>
                  <span className="text-[10px] text-[#70645D]">Daytime Calm</span>
                </button>

                {/* Dark Theme */}
                <button
                  type="button"
                  onClick={() => onSelectTheme("dark")}
                  className={`flex flex-col items-center p-2.5 rounded-xl transition-all ${
                    currentTheme === "dark"
                      ? "bg-[#1E1917] text-[#FFB59C] shadow-sm ring-1 ring-[#FFB59C]/40"
                      : "text-[#56423C] dark:text-[#A89E97] hover:bg-white/50"
                  }`}
                >
                  <div className="w-full aspect-[4/3] rounded-lg bg-[#181413] border border-[#382F2C] p-2 flex flex-col justify-between mb-2">
                    <Moon className="w-3.5 h-3.5 text-amber-400" />
                    <div className="space-y-1">
                      <div className="h-1.5 w-3/4 rounded-full bg-[#56423C]" />
                      <div className="h-1.5 w-1/2 rounded-full bg-[#56423C]/60" />
                    </div>
                  </div>
                  <span className="text-xs font-bold">Warm Espresso</span>
                  <span className="text-[10px] text-[#A89E97]">Night Focus</span>
                </button>

                {/* System Auto Option */}
                <button
                  type="button"
                  onClick={() => onSelectTheme("system")}
                  className={`flex flex-col items-center p-2.5 rounded-xl transition-all ${
                    currentTheme === "system"
                      ? "bg-white dark:bg-[#1E1917] shadow-sm text-sky-700 dark:text-sky-300 ring-1 ring-sky-300"
                      : "text-[#56423C] dark:text-[#A89E97] hover:bg-white/50"
                  }`}
                >
                  <div className="w-full aspect-[4/3] rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-2 flex flex-col justify-between mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                    <div className="space-y-1">
                      <div className="h-1.5 w-3/4 rounded-full bg-sky-300 dark:bg-sky-700" />
                      <div className="h-1.5 w-1/2 rounded-full bg-sky-200 dark:bg-sky-800" />
                    </div>
                  </div>
                  <span className="text-xs font-bold">Auto</span>
                  <span className="text-[10px] text-[#70645D] dark:text-[#A89E97]">Device sync</span>
                </button>
              </div>

              {/* Immediate Dark Mode Tactile Switch Row (Stitch Screen d33f0701) */}
              <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#251E1C] rounded-2xl border border-[#EAE0DE] dark:border-[#382F2C]">
                <div className="flex items-start gap-3 pr-2">
                  <div className="w-8 h-8 rounded-full bg-[#FFDBCF] dark:bg-[#9D3E1A]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Moon className="w-4 h-4 text-[#9D3E1A] dark:text-[#FFB59C]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA] block">
                      Warm Dark Mode
                    </span>
                    <p className="text-[11px] text-[#70645D] dark:text-[#A89E97] leading-snug mt-0.5">
                      Uses deep warm espresso tones to soften glare during late-night library study blocks.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={currentTheme === "dark"}
                  onClick={() => onSelectTheme(currentTheme === "dark" ? "light" : "dark")}
                  className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors duration-200 shrink-0 ${
                    currentTheme === "dark" ? "bg-[#9D3E1A]" : "bg-[#DDBCB1] dark:bg-[#483E3B]"
                  }`}
                >
                  <motion.div
                    layout
                    className={`w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform ${
                      currentTheme === "dark" ? "translate-x-5" : "translate-x-0"
                    }`}
                  >
                    <Moon className="w-3 h-3 text-[#9D3E1A]" />
                  </motion.div>
                </button>
              </div>

              {/* Dark Mode Study Schedule Row */}
              <div className="flex items-center justify-between pt-1 px-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#70645D] dark:text-[#A89E97]" />
                  <div>
                    <span className="text-xs font-semibold text-[#1F1B1A] dark:text-[#F6ECEA]">
                      Automatic Schedule
                    </span>
                    <p className="text-[10px] text-[#70645D] dark:text-[#A89E97]">
                      Sunset to Sunrise (Adaptive)
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#F6ECEA] dark:bg-[#2D2522] text-[#1F1B1A] dark:text-[#F6ECEA] text-[11px] font-semibold">
                  7:30 PM – 7:00 AM
                </span>
              </div>
            </div>

            {/* SECTION 2: Mindful Nudges & Pacing */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#486551] dark:text-[#AECEB6]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F1B1A] dark:text-[#F6ECEA]">
                    Mindful Nudges & Pacing
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#CAEBD1] dark:bg-[#486551]/30 text-[#042011] dark:text-[#CAEBD1]">
                  Gentle
                </span>
              </div>

              <div className="bg-white dark:bg-[#251E1C] rounded-2xl p-4 border border-[#EAE0DE] dark:border-[#382F2C] space-y-3.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA] block">
                      Gentle Voice & Chimes
                    </span>
                    <span className="text-[11px] text-[#70645D] dark:text-[#A89E97] block">
                      Soft wooden bells instead of abrupt sirens
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-[#486551] focus:ring-[#486551]"
                  />
                </label>

                <div className="h-[1px] bg-[#F0E6E4] dark:bg-[#342D2A]" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA] block">
                      Daily Morning Alignment
                    </span>
                    <span className="text-[11px] text-[#70645D] dark:text-[#A89E97] block">
                      Energy check-in before classes start
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#F6ECEA] dark:bg-[#2D2522] text-[#9D3E1A] dark:text-[#FFB59C] text-[11px] font-bold">
                    8:30 AM
                  </span>
                </div>

                <div className="h-[1px] bg-[#F0E6E4] dark:bg-[#342D2A]" />

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA] block">
                      Quiet Wind-Down Hours
                    </span>
                    <span className="text-[11px] text-[#70645D] dark:text-[#A89E97] block">
                      Mute non-urgent notifications from 10:00 PM – 8:00 AM
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={quietHoursEnabled}
                    onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-[#9D3E1A] focus:ring-[#9D3E1A]"
                  />
                </label>

                <div className="h-[1px] bg-[#F0E6E4] dark:bg-[#342D2A]" />

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA] block">
                      Sanctuary Study Mode
                    </span>
                    <span className="text-[11px] text-[#70645D] dark:text-[#A89E97] block">
                      Pauses non-critical cohort reminders when reading
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={midtermProtection}
                    onChange={(e) => setMidtermProtection(e.target.checked)}
                    className="w-4 h-4 rounded text-[#9D3E1A] focus:ring-[#9D3E1A]"
                  />
                </label>
              </div>
            </div>

            {/* SECTION 3: Mindful Audio Feedback */}
            <div className="bg-white dark:bg-[#251E1C] rounded-2xl p-4 border border-[#EAE0DE] dark:border-[#382F2C] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#CAEBD1] text-[#042011] flex items-center justify-center">
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA] block">
                    Gentle Audio Chimes
                  </span>
                  <span className="text-[11px] text-[#70645D] dark:text-[#A89E97]">
                    Harmonic chime when break finishes or tasks complete
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-[#486551] focus:ring-[#486551]"
              />
            </div>

            {/* SECTION 4: Install App on Phone / Download APK */}
            <div className="bg-gradient-to-br from-[#EAF2EE] to-[#F4F9F6] dark:from-[#1D3631] dark:to-[#172C27] rounded-2xl p-4 border border-[#C8DCD5] dark:border-[#32574F] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#1E3A34] dark:bg-[#5B8A82] text-white flex items-center justify-center shadow-xs">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1E3A34] dark:text-[#E9F3EF] block">
                      Download Mobile App
                    </span>
                    <span className="text-[11px] text-[#475D57] dark:text-[#BDD4CD]">
                      Native Android APK (7.1 MB) & PWA
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1E3A34]/10 dark:bg-white/10 text-[#1E3A34] dark:text-[#A3C1AD]">
                  v1.0.0
                </span>
              </div>

              <p className="text-[11px] text-[#475D57] dark:text-[#BDD4CD] leading-relaxed">
                Install Nudge directly on your phone with background audio, offline cache, and mindful check-in notifications.
              </p>

              <div className="pt-1 flex items-center gap-2">
                <a
                  href="/nudge.apk"
                  download="nudge.apk"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#1E3A34] hover:bg-[#284C44] dark:bg-[#5B8A82] dark:hover:bg-[#4E7972] text-[#F9F6F0] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Android APK</span>
                </a>
              </div>
            </div>

            {/* SECTION 5: Privacy & Local Storage */}
            <div className="rounded-2xl bg-[#CAEBD1]/25 dark:bg-[#486551]/15 p-4 border border-[#CAEBD1] dark:border-[#486551]/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#042011] dark:text-[#CAEBD1]">
                <Shield className="w-4 h-4 text-[#314D3A] dark:text-[#AECEB6]" />
                <span>Zero-Cloud Student Privacy Architecture</span>
              </div>
              <p className="text-[11px] text-[#314D3A] dark:text-[#AECEB6] leading-relaxed">
                All emotional check-ins, study struggles, and conversation logs are stored 100% on your device vault. We never train public models on your personal data.
              </p>
              {onClearChatHistory && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] font-semibold flex items-center gap-1.5 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Local Chat Vault</span>
                  </button>
                  {clearedNotice && (
                    <span className="text-[10px] text-emerald-600 block mt-1">
                      Local chat vault cleared successfully!
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Action & Brand */}
          <div className="pt-3 border-t border-[#F0E6E4] dark:border-[#352D2A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white dark:bg-[#2C2422] p-0.5 flex items-center justify-center shadow-xs border border-[#F0E6E4] dark:border-[#382F2C]">
                <img
                  src="/logo-mark.png"
                  alt="Nudge"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xs tracking-wider text-[#1F1B1A] dark:text-[#F6ECEA]">
                  NUDGE
                </span>
                <span className="text-[9.5px] text-[#70645D] dark:text-[#A89E97]">
                  Mindful AI Academic & Habit Companion
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="py-2 px-5 rounded-full bg-[#9D3E1A] text-white text-xs font-bold shadow-xs hover:bg-[#BD5630] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
