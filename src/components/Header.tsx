import React from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Lock,
  Coffee,
  Bell,
  Sparkles,
  Sun,
  Moon,
  Palette,
  QrCode,
} from "lucide-react";
import { StudentSnapshot } from "../types";
import { formatTime } from "../lib/breakTimer";
import { AppTheme } from "../lib/theme";

interface HeaderProps {
  snapshot: StudentSnapshot | null;
  rateLimitRemaining: number;
  onOpenSecurityModal: () => void;
  activeTab: "home" | "chat" | "schedule" | "summary" | "snapshot" | "milestones";
  setActiveTab: (tab: any) => void;
  breakTimerState?: {
    isActive: boolean;
    remainingSeconds: number;
    hasFinished: boolean;
  };
  onOpenRemindersModal?: () => void;
  activeRemindersCount?: number;
  onOpenGeminiTester?: () => void;
  currentTheme?: AppTheme;
  onToggleTheme?: () => void;
  onOpenThemeModal?: () => void;
  onOpenQrModal?: () => void;
  onOpenSettings?: () => void;
  onOpenMilestones?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  snapshot,
  rateLimitRemaining,
  onOpenSecurityModal,
  activeTab,
  setActiveTab,
  breakTimerState,
  onOpenRemindersModal,
  activeRemindersCount = 0,
  onOpenGeminiTester,
  currentTheme = "light",
  onToggleTheme,
  onOpenThemeModal,
  onOpenQrModal,
  onOpenSettings,
  onOpenMilestones,
}) => {
  const handleBackClick = () => {
    if (activeTab === "snapshot" || activeTab === "schedule" || activeTab === "summary" || activeTab === "milestones") {
      setActiveTab("home");
    } else if (activeTab === "chat") {
      setActiveTab("home");
    } else {
      setActiveTab("chat");
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "snapshot":
        return "Snapshot";
      case "home":
        return "Home";
      case "chat":
        return "Chat";
      case "schedule":
        return "Schedule";
      case "summary":
        return "Summary";
      case "milestones":
        return "Growth";
      default:
        return "Home";
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F9F6F0]/85 dark:bg-[#0F1A18]/85 backdrop-blur-2xl border-b border-[#E8E3D7]/70 dark:border-[#243E38]/60 text-[#1E3A34] dark:text-[#E9F3EF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left: Back Arrow, Brand Logo & Screen Title */}
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleBackClick}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#475D57] dark:text-[#BDD4CD] hover:bg-[#EAF2EE] dark:hover:bg-[#1D3631] transition-colors"
            title="Go to previous screen"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>

          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#1E3A34] to-[#5B8A82] text-[#F9F6F0] flex items-center justify-center text-xs font-bold shadow-xs">
              <span className="font-serif italic text-sm">n</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-serif font-medium text-lg tracking-tight text-[#1E3A34] dark:text-[#E9F3EF]">
                Nudge
              </span>
              <span className="text-xs text-[#7E928C] dark:text-[#85A39A]">•</span>
              <span className="text-xs font-semibold text-[#5B8A82] dark:text-[#A3C1AD] tracking-wide">
                {getTabTitle()}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Break Pill, Security & Profile */}
        <div className="flex items-center space-x-2.5">
          {/* Active / Finished Break Pill */}
          {breakTimerState?.isActive && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab("chat")}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2EE] dark:bg-[#1D3631] border border-[#C8DCD5] dark:border-[#32574F] text-xs font-bold text-[#1E3A34] dark:text-[#A3C1AD] transition-all shadow-xs"
              title="Break in progress - click to view in Chat"
            >
              <Coffee className="w-3.5 h-3.5 text-[#5B8A82]" />
              <span className="font-mono">{formatTime(breakTimerState.remainingSeconds)}</span>
              <span className="hidden sm:inline font-sans text-[11px] font-normal text-[#475D57] dark:text-[#BDD4CD]">• Break</span>
            </motion.button>
          )}

          {breakTimerState?.hasFinished && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("chat")}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E3A34] dark:bg-[#5B8A82] text-white text-xs font-bold transition-all shadow-sm"
              title="Break complete! Click to view in Chat"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Break Over! ⏰</span>
            </motion.button>
          )}

          {/* Architecture / Security Modal Trigger */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenSecurityModal}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/70 dark:bg-[#152522] hover:bg-white text-[11px] font-medium text-[#475D57] dark:text-[#BDD4CD] border border-[#E8E3D7] dark:border-[#243E38] shadow-2xs transition-colors"
            title="Edge Function & Security Architecture"
          >
            <Lock className="w-3 h-3 text-[#5B8A82]" />
            <span>Architecture</span>
          </motion.button>

          {/* Gemini 3.7 Route Wrapper Trigger */}
          {onOpenGeminiTester && (
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={onOpenGeminiTester}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAF2EE] hover:bg-[#D9E9E2] dark:bg-[#1D3631] dark:hover:bg-[#25443E] text-[11px] font-semibold text-[#1E3A34] dark:text-[#A3C1AD] border border-[#C8DCD5]/60 dark:border-[#32574F] shadow-2xs transition-colors"
              title="Test Gemini 3.7 Flash API Wrapper (/api/gemini)"
            >
              <Sparkles className="w-3 h-3 fill-current text-[#5B8A82]" />
              <span className="hidden xs:inline">Gemini 3.7</span>
            </motion.button>
          )}

          {/* Mobile QR Scanner Modal Trigger */}
          {onOpenQrModal && (
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={onOpenQrModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 dark:bg-[#1C302C] hover:bg-white text-[11px] font-bold text-[#1E3A34] dark:text-[#E9F3EF] border border-[#E8E3D7] dark:border-[#2B4943] shadow-2xs transition-colors"
              title="Scan QR Code to open on Mobile Phone"
              aria-label="Open Mobile QR Code"
            >
              <QrCode className="w-3.5 h-3.5 text-[#5B8A82]" />
              <span className="hidden sm:inline">Phone QR</span>
            </motion.button>
          )}

          {/* Stitch Dark Mode Toggle & Theme Options */}
          {onToggleTheme && (
            <div className="flex items-center bg-white/70 dark:bg-[#24201E] border border-[#EAE2DA] dark:border-[#383129] rounded-full p-0.5 shadow-2xs">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={onToggleTheme}
                className="p-1.5 rounded-full text-[#5C5049] dark:text-[#E0D5CE] hover:text-[#A33C1B] dark:hover:text-[#E07A5F] hover:bg-white/80 dark:hover:bg-[#2D2724] transition-colors focus:outline-none"
                title={`Quick toggle: Currently ${currentTheme === "dark" ? "Dark Mode (Warm Obsidian)" : "Light Mode (Warm Oat)"}`}
                aria-label="Toggle dark mode"
              >
                {currentTheme === "dark" ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </motion.button>

              {onOpenThemeModal && (
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={onOpenThemeModal}
                  className="p-1.5 rounded-full text-[#70645D] dark:text-[#A89B95] hover:text-[#A33C1B] dark:hover:text-[#E07A5F] hover:bg-white/80 dark:hover:bg-[#2D2724] transition-colors focus:outline-none"
                  title="Theme & Display Options (Light, Dark, System Auto)"
                  aria-label="Theme Settings & Options"
                >
                  <Palette className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </div>
          )}

          {/* Notifications & Reminders Bell Button */}
          {onOpenRemindersModal && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              id="header-notifications-bell-btn"
              onClick={onOpenRemindersModal}
              className="relative p-2 rounded-full text-[#5C5049] hover:text-[#A33C1B] hover:bg-white/80 transition-colors focus:outline-none"
              title="Notifications & Reminders"
              aria-label={`Notifications and Reminders, ${activeRemindersCount} active`}
            >
              <Bell className="w-4 h-4" />
              {activeRemindersCount > 0 && (
                <span
                  id="header-notification-count-badge"
                  className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#A33C1B] text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white animate-pulse"
                >
                  {activeRemindersCount}
                </span>
              )}
            </motion.button>
          )}

          {/* Growth Journal Quick Button */}
          {onOpenMilestones && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onOpenMilestones}
              className={`p-2 rounded-full transition-colors focus:outline-none ${
                activeTab === "milestones"
                  ? "text-[#486551] dark:text-[#AECEB6] bg-[#CAEBD1]/60 dark:bg-[#486551]/30"
                  : "text-[#5C5049] hover:text-[#486551] hover:bg-white/80"
              }`}
              title="Growth Journal & Milestones"
              aria-label="Growth Journal"
            >
              <Sparkles className="w-4 h-4 text-[#486551] dark:text-[#AECEB6]" />
            </motion.button>
          )}

          {/* Maya Avatar Photo: Tapping opens Settings or toggles Snapshot */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenSettings || (() => setActiveTab(activeTab === "snapshot" ? "home" : "snapshot"))}
            className={`relative rounded-full focus:outline-none focus:ring-2 focus:ring-[#A33C1B] focus:ring-offset-2 focus:ring-offset-[#FAF7F5] transition-all ${
              activeTab === "snapshot" ? "ring-2 ring-[#A33C1B]" : ""
            }`}
            title="Maya Lin • Preferences & Settings"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt="Maya"
              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </motion.button>
        </div>
      </div>
    </header>
  );
};
