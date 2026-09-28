import React from "react";
import { motion } from "motion/react";
import {
  Home,
  MessageSquare,
  Mic,
  Database,
  Calendar,
  BarChart2
} from "lucide-react";

export type AppTab = "home" | "chat" | "snapshot" | "schedule" | "summary" | "milestones";

interface BottomNavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenVoiceModal: () => void;
}

interface NavItem {
  id: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasLiveBadge?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "snapshot", label: "Snapshot", icon: Database, hasLiveBadge: true },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "summary", label: "Summary", icon: BarChart2 },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenVoiceModal,
}) => {
  return (
    <div className="fixed bottom-5 left-0 right-0 z-40 flex items-center justify-center px-4 pointer-events-none select-none">
      <nav
        className="pointer-events-auto bg-white/90 dark:bg-[#152522]/90 backdrop-blur-2xl border border-[#E8E3D7] dark:border-[#243E38] shadow-[0_16px_40px_-8px_rgba(30,58,52,0.12)] rounded-full px-2.5 py-1.5 flex items-center gap-1 sm:gap-2 transition-all"
        aria-label="Wellora Organic Dock"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileHover={{ y: -2, scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 450, damping: 25 }}
              className={`relative px-3.5 py-2 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-colors duration-200 outline-none ${
                isActive
                  ? "text-[#1E3A34] dark:text-[#E9F3EF] font-bold"
                  : "text-[#7E928C] dark:text-[#85A39A] hover:text-[#1E3A34] dark:hover:text-[#E9F3EF]"
              }`}
            >
              {/* Luminous Motion Active Background Pill */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-[#EAF2EE] dark:bg-[#1D3631] rounded-full -z-10 shadow-xs border border-[#C8DCD5] dark:border-[#32574F]"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}

              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? "text-[#1E3A34] dark:text-[#A3C1AD]" : "text-[#7E928C] dark:text-[#85A39A]"}`} />
                {item.hasLiveBadge && (
                  <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-[#5B8A82] dark:bg-[#75A69D] animate-pulse ring-2 ring-white dark:ring-[#152522]" />
                )}
              </div>

              <span className={`text-[11px] tracking-tight ${isActive ? "inline" : "hidden sm:inline"}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}

        {/* Divider */}
        <div className="w-[1px] h-5 bg-[#E8E3D7] dark:bg-[#243E38] mx-0.5 shrink-0" />

        {/* Luminous Voice Companion Mic Action */}
        <motion.button
          onClick={onOpenVoiceModal}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 450, damping: 25 }}
          className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E3A34] to-[#5B8A82] text-[#F9F6F0] flex items-center justify-center shadow-md shadow-[#1E3A34]/25 group shrink-0"
          title="Voice Nudge Mode"
          aria-label="Voice Nudge Mode"
        >
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-1 rounded-full bg-[#5B8A82] -z-10"
          />
          <Mic className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        </motion.button>
      </nav>
    </div>
  );
};
