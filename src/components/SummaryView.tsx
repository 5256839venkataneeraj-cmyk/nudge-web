import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sprout,
  Moon,
  Bike,
  Droplets,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";
import { MilestoneBadge, getLocalMilestones } from "../lib/milestones";
import { UnlockedBadgeModal } from "./UnlockedBadgeModal";

gsap.registerPlugin(useGSAP);

interface SummaryViewProps {
  onNavigateToChat: () => void;
  onNavigateToMilestones?: () => void;
  onOpenReflection?: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  onNavigateToChat,
  onNavigateToMilestones,
  onOpenReflection,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeModalBadge, setActiveModalBadge] = useState<MilestoneBadge | null>(null);
  const [adjustedCalendar, setAdjustedCalendar] = useState(false);

  const milestones = getLocalMilestones();
  const unlockedBadges = milestones.filter((m) => m.isUnlocked).slice(0, 2);

  useGSAP(
    () => {
      gsap.from(".gsap-card", {
        opacity: 0,
        y: 30,
        duration: 0.55,
        stagger: 0.08,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  const handleAdjustCalendar = () => {
    setAdjustedCalendar(true);
    setTimeout(() => setAdjustedCalendar(false), 4000);
  };

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto bg-[#FAF7F5] dark:bg-[#181413] px-4 sm:px-6 py-6 text-[#2D2522] dark:text-[#F6ECEA] font-sans max-w-xl mx-auto space-y-6 pb-28"
    >
      {/* Header Block */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-[#CAEBD1] dark:bg-[#486551]/30 text-[#042011] dark:text-[#CAEBD1] text-[11px] font-bold">
            Oct 16 – Oct 22
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[#70645D] dark:text-[#A89E97]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Week 8 Report</span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F1B1A] dark:text-[#F6ECEA] mt-1">
          Weekly Summary
        </h1>
        <p className="text-xs sm:text-sm text-[#70645D] dark:text-[#A89E97]">
          Progress over perfection, Maya Lin.
        </p>
      </div>

      {/* Hero Scorecard Card (Matching Stitch Donut & Metrics) */}
      <div className="gsap-card bg-white dark:bg-[#201B1A] rounded-3xl p-5 sm:p-6 border border-[#E9DFD7] dark:border-[#382F2C] shadow-xs relative overflow-hidden space-y-4">
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#FFDBCF]/40 dark:bg-[#9D3E1A]/15 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 z-10 relative">
          {/* Custom SVG Progress Donut */}
          <div className="relative w-22 h-22 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
              <circle
                className="text-[#F0E6E4] dark:text-[#382F2C]"
                cx="48"
                cy="48"
                fill="transparent"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
              />
              <circle
                className="text-[#9D3E1A] dark:text-[#D96B43]"
                cx="48"
                cy="48"
                fill="transparent"
                r="40"
                stroke="currentColor"
                strokeDasharray="251.2"
                strokeDashoffset="40.2"
                strokeLinecap="round"
                strokeWidth="8"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-[#1F1B1A] dark:text-[#F6ECEA] leading-none">
                84%
              </span>
              <span className="text-[9px] font-bold text-[#8A726A] dark:text-[#9A8B85] uppercase tracking-wider mt-0.5">
                Flow
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#486551] dark:text-[#AECEB6]">
              <span className="w-2 h-2 rounded-full bg-[#486551]" />
              <span>Solid Momentum</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#1F1B1A] dark:text-[#F6ECEA]">
              Steady & Balanced
            </h2>
            <p className="text-xs text-[#70645D] dark:text-[#A89E97] leading-snug">
              You stayed remarkably grounded even with two midterm exams.
            </p>
          </div>
        </div>

        {/* Micro metric ticks */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F0E6E4] dark:border-[#382F2C] text-center">
          <div className="p-2 rounded-2xl bg-[#FAF7F2] dark:bg-[#251E1C]">
            <span className="text-[10px] text-[#70645D] dark:text-[#A89E97] block">Focus Hours</span>
            <span className="text-sm font-extrabold text-[#1F1B1A] dark:text-[#F6ECEA]">18.5h</span>
          </div>
          <div className="p-2 rounded-2xl bg-[#FAF7F2] dark:bg-[#251E1C]">
            <span className="text-[10px] text-[#70645D] dark:text-[#A89E97] block">Nudges Met</span>
            <span className="text-sm font-extrabold text-[#9D3E1A] dark:text-[#FFB59C]">21/25</span>
          </div>
          <div className="p-2 rounded-2xl bg-[#FAF7F2] dark:bg-[#251E1C]">
            <span className="text-[10px] text-[#70645D] dark:text-[#A89E97] block">Rest Score</span>
            <span className="text-sm font-extrabold text-[#486551] dark:text-[#AECEB6]">B+</span>
          </div>
        </div>
      </div>

      {/* Section 1: What Stuck 🌟 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#486551] dark:text-[#AECEB6] uppercase tracking-wider">
            <span>🌟</span>
            <span>What Stuck</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#CAEBD1] dark:bg-[#486551]/30 text-[#042011] dark:text-[#CAEBD1] text-[10px] font-bold">
            3 Micro-wins
          </span>
        </div>

        <div className="space-y-2">
          <div className="gsap-card flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#201B1A] border border-[#E9DFD7] dark:border-[#382F2C]">
            <span className="text-xl">🚴</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA] block">
                Morning cycling commutes
              </span>
              <p className="text-xs text-[#70645D] dark:text-[#A89E97] mt-0.5">
                5 of 5 completed cleanly. You cleared morning brain fog before lectures!
              </p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-[#486551] dark:text-[#AECEB6] shrink-0 mt-0.5" />
          </div>

          <div className="gsap-card flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#201B1A] border border-[#E9DFD7] dark:border-[#382F2C]">
            <span className="text-xl">📚</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA] block">
                Coursework submissions
              </span>
              <p className="text-xs text-[#70645D] dark:text-[#A89E97] mt-0.5">
                4 of 4 assignments uploaded ahead of deadline without late-night panic.
              </p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-[#486551] dark:text-[#AECEB6] shrink-0 mt-0.5" />
          </div>
        </div>
      </div>

      {/* Section 2: What Slipped 🍃 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#9D3E1A] dark:text-[#FFB59C] uppercase tracking-wider">
            <span>🍃</span>
            <span>What Slipped (Zero Judgment)</span>
          </div>
        </div>

        <div className="gsap-card flex items-start gap-3 p-3.5 rounded-2xl bg-[#FCEEEA]/70 dark:bg-[#251E1C] border border-[#F6D5CB] dark:border-[#382F2C]">
          <span className="text-xl">🌙</span>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-[#9D3E1A] dark:text-[#FFB59C] block">
              Bedtime wind-down (6.2h avg)
            </span>
            <p className="text-xs text-[#70645D] dark:text-[#A89E97] mt-0.5">
              Late-night screen time bumped sleep down. Natural during midterms, but we can protect it next week!
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Energy & Habit Rhythm Strip */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#486551] dark:text-[#AECEB6] uppercase tracking-wider">
            <span>🌱</span>
            <span>Energy & Habit Rhythm</span>
          </div>
        </div>

        <div className="gsap-card bg-white dark:bg-[#201B1A] rounded-2xl p-4 border border-[#E9DFD7] dark:border-[#382F2C] space-y-3">
          <p className="text-xs text-[#56423C] dark:text-[#B5A49F] leading-relaxed">
            On <strong>'Good'</strong> and <strong>'Great'</strong> energy days, your habit completion was <strong className="text-[#486551] dark:text-[#AECEB6]">92%</strong>. On lower energy days, you wisely prioritized rest over high-load study blocks.
          </p>

          <div className="grid grid-cols-7 gap-1.5 text-center pt-2 border-t border-[#F0E6E4] dark:border-[#382F2C]">
            {[
              { d: "M", icon: "🌿", pct: "100%" },
              { d: "T", icon: "⚡", pct: "90%" },
              { d: "W", icon: "⛅", pct: "75%" },
              { d: "T", icon: "🌿", pct: "95%" },
              { d: "F", icon: "⚡", pct: "90%" },
              { d: "S", icon: "😴", pct: "60%" },
              { d: "S", icon: "🌿", pct: "85%" },
            ].map((col, idx) => (
              <div key={idx} className="p-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#251E1C]">
                <span className="text-[10px] text-[#8A726A] block font-semibold">{col.d}</span>
                <span className="text-sm select-none my-0.5 block">{col.icon}</span>
                <span className="text-[9px] text-[#486551] font-bold block">{col.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Milestones Unlocked (Stitch Badges Preview) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA] uppercase tracking-wider">
            <span>🪴</span>
            <span>Milestones Rooted This Week</span>
          </div>
          {onNavigateToMilestones && (
            <button
              onClick={onNavigateToMilestones}
              className="text-xs font-bold text-[#9D3E1A] dark:text-[#FFB59C] hover:underline"
            >
              View All ({milestones.length})
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {unlockedBadges.map((badge) => (
            <button
              key={badge.id}
              onClick={() => setActiveModalBadge(badge)}
              className="text-left p-3.5 rounded-2xl bg-white dark:bg-[#201B1A] border border-[#E9DFD7] dark:border-[#382F2C] shadow-2xs hover:border-[#9D3E1A]/40 transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-[10px] font-bold text-[#486551] dark:text-[#AECEB6] bg-[#CAEBD1] dark:bg-[#486551]/30 px-2 py-0.5 rounded-full">
                  Rooted
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA] truncate">
                {badge.title}
              </h4>
              <p className="text-[10px] text-[#70645D] dark:text-[#A89E97] truncate">
                {badge.progressText}
              </p>
            </button>
          ))}
        </div>

        {onNavigateToMilestones && (
          <button
            onClick={onNavigateToMilestones}
            className="w-full py-2.5 px-4 rounded-full bg-white dark:bg-[#201B1A] border border-[#E9DFD7] dark:border-[#382F2C] text-xs font-bold text-[#486551] dark:text-[#AECEB6] hover:bg-[#F6ECEA] flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Open Growth Journal & Badges</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Section 5: One Thing to Adjust Card */}
      <div className="gsap-card bg-gradient-to-r from-[#FCEEEA] to-[#F9E2DB] dark:from-[#2A201E] dark:to-[#251B19] rounded-3xl p-5 border border-[#F4D1C5] dark:border-[#3D302D] shadow-xs space-y-3">
        <div className="flex items-center gap-1 text-[11px] font-bold text-[#9D3E1A] dark:text-[#FFB59C] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Coaching Suggestion</span>
        </div>
        <p className="text-xs text-[#2D2522] dark:text-[#E0D5CE] leading-relaxed">
          Let’s move your heavy reading blocks to <strong className="text-[#9D3E1A] dark:text-[#FFB59C]">10:00 AM</strong> instead of 8:00 PM when your mental energy naturally dips. Nudge can shift next week’s study schedule automatically.
        </p>

        <div className="space-y-2">
          <button
            onClick={handleAdjustCalendar}
            className="w-full py-3 rounded-full bg-[#9D3E1A] hover:bg-[#BD5630] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{adjustedCalendar ? "✓ Calendar Adjusted!" : "Apply Calendar Adjustment"}</span>
          </button>
          <p className="text-center text-[10px] text-[#70645D] dark:text-[#A89E97]">
            Takes effect Monday morning • Undo anytime
          </p>
        </div>
      </div>

      {/* Unlocked Badge Modal */}
      <UnlockedBadgeModal
        badge={activeModalBadge}
        isOpen={Boolean(activeModalBadge)}
        onClose={() => setActiveModalBadge(null)}
        onOpenReflection={onOpenReflection}
      />
    </div>
  );
};
