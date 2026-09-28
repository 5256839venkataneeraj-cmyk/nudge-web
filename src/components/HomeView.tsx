import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  Plus,
  Settings2,
  Check,
  Calendar,
  PartyPopper,
  Brain,
  Droplets,
  Coins,
  Bike,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { StudentSnapshot, SubjectModule } from "../types";
import {
  getStoredSubjects,
  incrementSubjectStreak,
} from "../lib/subjects";
import {
  getLocalMilestones,
  MilestoneBadge,
} from "../lib/milestones";
import { SubjectManagementModal } from "./SubjectManagementModal";
import { UnlockedBadgeModal } from "./UnlockedBadgeModal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface HomeViewProps {
  snapshot: StudentSnapshot | null;
  onNavigateToChat: () => void;
  onNavigateToSnapshot?: () => void;
  onNavigateToSchedule?: () => void;
  onNavigateToMilestones?: () => void;
  onNavigateToSummary?: () => void;
  onOpenAddAssignment?: () => void;
  onOpenReflection?: () => void;
}

interface FlowTask {
  id: string;
  tag: string;
  tagColor: string;
  timeOrMeta: string;
  title: string;
  subtitle: string;
  isCompleted: boolean;
  accentColor: string;
}

const INITIAL_FLOW_TASKS: FlowTask[] = [
  {
    id: "task-1",
    tag: "Study",
    tagColor: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300",
    timeOrMeta: "3:00 PM",
    title: "45m Organic Chemistry review",
    subtitle: "Reaction mechanisms & synthesis cards",
    isCompleted: false,
    accentColor: "bg-sky-400",
  },
  {
    id: "task-2",
    tag: "Movement",
    tagColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    timeOrMeta: "Completed 8:30 AM",
    title: "20 min campus ride / commute",
    subtitle: "Brisk morning fresh air loop",
    isCompleted: true,
    accentColor: "bg-emerald-400",
  },
  {
    id: "task-3",
    tag: "Space",
    tagColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
    timeOrMeta: "Evening",
    title: "Laundry & tidy study desk",
    subtitle: "Clear space = clear mind",
    isCompleted: false,
    accentColor: "bg-indigo-300",
  },
  {
    id: "task-5",
    tag: "Mindful Spend",
    tagColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    timeOrMeta: "< $15 daily cap",
    title: "Log coffee & midday lunch spend",
    subtitle: "Current log: $4.25 (Oat latte)",
    isCompleted: false,
    accentColor: "bg-amber-300",
  },
];

export const HomeView: React.FC<HomeViewProps> = ({
  snapshot,
  onNavigateToChat,
  onNavigateToSnapshot,
  onNavigateToSchedule,
  onNavigateToMilestones,
  onNavigateToSummary,
  onOpenAddAssignment,
  onOpenReflection,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [subjects, setSubjects] = useState<SubjectModule[]>(() => getStoredSubjects());
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [streakJustIncremented, setStreakJustIncremented] = useState<string | null>(null);

  // Daily Pulse Energy State
  const [energyLevel, setEnergyLevel] = useState<"low" | "okay" | "good" | "great">("good");

  // Flow Checklist State
  const [flowTasks, setFlowTasks] = useState<FlowTask[]>(() => {
    try {
      const saved = localStorage.getItem("nudge_flow_tasks_v1");
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_FLOW_TASKS;
  });

  // Interactive Hydration State
  const [waterMl, setWaterMl] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("nudge_water_ml");
      if (saved) return parseInt(saved, 10);
    } catch {}
    return 1400;
  });

  // Toast / Cheer banner
  const [showCheerToast, setShowCheerToast] = useState(false);

  // Badge celebration modal
  const [celebrationBadge, setCelebrationBadge] = useState<MilestoneBadge | null>(null);

  // Freshly unlocked showcase badge (7-Day Campus Commute)
  const [showcaseBadge, setShowcaseBadge] = useState<MilestoneBadge | null>(() => {
    const list = getLocalMilestones();
    return list.find((b) => b.id === "campus_commute") || list[0] || null;
  });

  // Sync subjects if updated
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setSubjects(e.detail);
      } else {
        setSubjects(getStoredSubjects());
      }
    };
    window.addEventListener("nudge_subjects_updated", handleUpdate);
    return () => window.removeEventListener("nudge_subjects_updated", handleUpdate);
  }, []);

  // Save flow tasks
  const handleToggleTask = (id: string) => {
    setFlowTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
      );
      try {
        localStorage.setItem("nudge_flow_tasks_v1", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Add water (+250ml)
  const handleAddWater = () => {
    setWaterMl((prev) => {
      const next = Math.min(2500, prev + 250);
      try {
        localStorage.setItem("nudge_water_ml", String(next));
      } catch {}
      return next;
    });
  };

  // Cheer button
  const handleCheerMeOn = () => {
    setShowCheerToast(true);
    setTimeout(() => setShowCheerToast(false), 3000);
  };

  // GSAP Animations
  useGSAP(
    () => {
      gsap.from(".hero-elem", {
        opacity: 0,
        y: 24,
        duration: 0.75,
        stagger: 0.08,
        ease: "power3.out",
      });

      gsap.from(".subject-card-anim", {
        opacity: 0,
        y: 24,
        duration: 0.65,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.2,
      });

      const widgets = gsap.utils.toArray<HTMLElement>(".scroll-reveal-widget");
      widgets.forEach((widget) => {
        gsap.from(widget, {
          scrollTrigger: {
            trigger: widget,
            start: "top 92%",
            toggleActions: "play none none none",
          },
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: "power2.out",
        });
      });
    },
    { scope: containerRef, dependencies: [subjects.length] }
  );

  const handleIncrementStreak = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = incrementSubjectStreak(id, 20);
    setSubjects(updated);
    setStreakJustIncremented(id);
    setTimeout(() => setStreakJustIncremented(null), 1200);
  };

  const totalStudyMinutes = subjects.reduce((sum, s) => sum + s.studyMinutesToday, 0);
  const totalStreaksCombined = subjects.reduce((sum, s) => sum + s.streakDays, 0);
  const completedTasksCount =
    flowTasks.filter((t) => t.isCompleted).length + (waterMl >= 2000 ? 1 : 0);
  const totalTasksCount = flowTasks.length + 1; // including hydration
  const waterPercent = Math.min(100, Math.round((waterMl / 2000) * 100));

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto font-sans w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28 text-[#0F172A] dark:text-[#F8FAFC]"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {showCheerToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#1E3A34] text-white text-xs font-bold shadow-xl border border-emerald-400/40 flex items-center gap-2"
          >
            <PartyPopper className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>You're doing fantastic, Maya! Keep that steady academic rhythm! 🌟</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. GREETING SECTION (Stitch Airy Sky Theme) */}
      <section className="hero-elem flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] leading-tight">
            Good morning, Maya 👋
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold tracking-wide shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Balanced Day
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
          You have {subjects.length} focus blocks & 5 gentle habits mapped out for today. Logged{" "}
          <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{totalStudyMinutes}m</strong> today.
        </p>

        {/* Action Pills Bar */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] dark:bg-[#38BDF8] dark:hover:bg-[#0284C7] text-white dark:text-[#0F172A] text-xs font-semibold shadow-2xs transition-all"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Manage Subjects</span>
          </button>

          {onOpenAddAssignment && (
            <button
              onClick={onOpenAddAssignment}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] text-xs font-semibold shadow-2xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Goal</span>
            </button>
          )}

          {onOpenReflection && (
            <button
              onClick={onOpenReflection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] text-xs font-medium shadow-2xs transition-all"
            >
              <span>🌱</span>
              <span>Check-in</span>
            </button>
          )}

          {onNavigateToSchedule && (
            <button
              onClick={onNavigateToSchedule}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-800 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800 text-xs font-semibold shadow-2xs transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. ENERGY SELECTOR (DAILY PULSE - Stitch Screen b8efdc40) */}
      <section className="hero-elem bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-md rounded-2xl p-4 shadow-[0_4px_20px_rgba(2,132,199,0.04)] flex flex-col gap-3 border border-sky-100/80 dark:border-[#334155]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              How's your energy today?
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest">
            [ DAILY PULSE ]
          </span>
        </div>

        {/* 4 Energy Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "low", label: "Low", emoji: "😴" },
            { id: "okay", label: "Okay", emoji: "⛅" },
            { id: "good", label: "Good", emoji: "🌿" },
            { id: "great", label: "Great", emoji: "⚡" },
          ].map((item) => {
            const isActive = energyLevel === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setEnergyLevel(item.id as any)}
                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-[12px] font-semibold gap-1 active:scale-95 transition-all ${
                  isActive
                    ? "bg-gradient-to-b from-sky-500 to-sky-600 text-white font-bold shadow-md shadow-sky-500/20 border border-sky-400"
                    : "bg-sky-50/50 dark:bg-[#0F172A]/50 hover:bg-sky-100/70 dark:hover:bg-[#334155] border border-sky-100/60 dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1]"
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* 7-Day Pulse Indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-sky-100/80 dark:border-[#334155] mt-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
              Last 7 days
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Mon: Good" />
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Tue: Good" />
              <span className="w-2 h-2 rounded-full bg-amber-400" title="Wed: Low" />
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Thu: Good" />
              <span className="w-2 h-2 rounded-full bg-sky-500" title="Fri: Great" />
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Sat: Good" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-700" title="Sun (Today): Good" />
            </div>
          </div>

          {onNavigateToSummary && (
            <button
              onClick={onNavigateToSummary}
              className="text-[11px] text-sky-700 dark:text-sky-400 hover:text-sky-900 font-semibold flex items-center gap-0.5 tracking-tight transition-colors"
            >
              Energy trend • Summary →
            </button>
          )}
        </div>
      </section>

      {/* 3. TACTILE RESET NUDGE BANNER (Stitch Screen b8efdc40) */}
      <motion.div
        whileHover={{ scale: 1.015, y: -1 }}
        whileTap={{ scale: 0.985 }}
        onClick={onNavigateToChat}
        className="hero-elem cursor-pointer group relative overflow-hidden bg-gradient-to-r from-orange-50 via-amber-50/80 to-sky-50/60 dark:from-[#291B16] dark:via-[#261E1A] dark:to-[#17252F] border border-orange-200/70 dark:border-orange-800/50 rounded-2xl p-4 shadow-[0_4px_16px_rgba(249,115,22,0.06)] transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#1E293B] shadow-xs flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/60 group-hover:scale-105 transition-transform shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-700 dark:text-orange-400">
              FEELING OVERWHELMED?
            </span>
            <span className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Need a quick reset? Chat with Nudge
            </span>
          </div>
        </div>
        <div className="relative z-10 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0 group-hover:bg-orange-600 transition-colors">
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </div>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-orange-200/40 dark:bg-orange-500/10 blur-xl pointer-events-none" />
      </motion.div>

      {/* 4. ACTIVE MOMENTUM SECTION (Stitch Screen b8efdc40) */}
      <section className="hero-elem flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Active Momentum
            </h2>
            <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase">
              [ ACTIVE MOMENTUM ]
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">4 active streaks</span>
            <span className="text-sky-200">•</span>
            {onNavigateToMilestones && (
              <button
                onClick={onNavigateToMilestones}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold hover:bg-emerald-100 transition-all active:scale-95 shadow-2xs"
              >
                <span>🌿</span>
                <span>View Badges</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Streak Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xs border border-sky-100/80 dark:border-[#334155] shrink-0">
            <span className="text-base">🔥</span>
            <div className="flex flex-col leading-none">
              <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">12 Days</span>
              <span className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] mt-0.5">Deep Study</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xs border border-sky-100/80 dark:border-[#334155] shrink-0">
            <span className="text-base">🚴</span>
            <div className="flex flex-col leading-none">
              <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">5 Days</span>
              <span className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] mt-0.5">Campus Ride</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xs border border-sky-100/80 dark:border-[#334155] shrink-0">
            <span className="text-base">💧</span>
            <div className="flex flex-col leading-none">
              <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">8 Days</span>
              <span className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] mt-0.5">Hydration</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xs border border-sky-100/80 dark:border-[#334155] shrink-0">
            <span className="text-base">💰</span>
            <div className="flex flex-col leading-none">
              <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">14 Days</span>
              <span className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] mt-0.5">Budget Check</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TODAY'S FLOW & CHECKLIST (Stitch Screen b8efdc40) */}
      <section className="scroll-reveal-widget flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Today's Flow
            </h2>
            <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest">
              [ TODAY'S FLOW ]
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-100/70 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 font-semibold">
              {completedTasksCount} / {totalTasksCount} done
            </span>
          </div>
          <button
            onClick={handleCheerMeOn}
            className="text-[12px] text-sky-700 dark:text-sky-400 font-semibold hover:underline"
          >
            Cheer me on
          </button>
        </div>

        {/* Task Cards Stack */}
        <div className="flex flex-col gap-2.5">
          {flowTasks.map((t) => (
            <div
              key={t.id}
              className="bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md rounded-2xl p-3.5 shadow-xs border border-sky-100/80 dark:border-[#334155] transition-all flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  type="button"
                  aria-label="Toggle task"
                  onClick={() => handleToggleTask(t.id)}
                  className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                    t.isCompleted
                      ? "bg-emerald-500 text-white shadow-xs shadow-emerald-500/30"
                      : "bg-sky-50 dark:bg-[#0F172A] border border-sky-200 dark:border-sky-800 text-transparent hover:border-sky-400"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${t.tagColor}`}>
                      {t.tag}
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium">
                      {t.timeOrMeta}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold truncate ${
                      t.isCompleted
                        ? "line-through opacity-50 text-[#0F172A] dark:text-[#F8FAFC]"
                        : "text-[#0F172A] dark:text-[#F8FAFC]"
                    }`}
                  >
                    {t.title}
                  </span>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    {t.subtitle}
                  </span>
                </div>
              </div>
              <div className={`w-1.5 h-10 rounded-full ${t.accentColor} shrink-0 self-center`} />
            </div>
          ))}

          {/* Interactive Hydration Card */}
          <div className="bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md rounded-2xl p-3.5 shadow-xs border border-sky-100/80 dark:border-[#334155] transition-all flex flex-col gap-2.5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <Droplets className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 text-[11px] font-semibold">
                      Hydration
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium">
                      {waterPercent}% reached
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    2.0L Daily target
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddWater}
                className="px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>250ml</span>
              </button>
            </div>

            {/* Gradient Water Progress Bar */}
            <div className="w-full bg-sky-100/60 dark:bg-sky-950/50 h-2.5 rounded-full overflow-hidden flex">
              <motion.div
                initial={false}
                animate={{ width: `${waterPercent}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full rounded-full shadow-xs"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium">
              <span>{(waterMl / 1000).toFixed(1)}L of 2.0L logged</span>
              <span>{waterPercent >= 100 ? "Goal smashed! 🎉" : "Almost there! 🥤"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FRESHLY UNLOCKED MILESTONE SHOWCASE (Stitch Screen c0cbcd73 & 451c3691) */}
      {showcaseBadge && (
        <section className="scroll-reveal-widget relative overflow-hidden rounded-2xl bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md border border-amber-200/80 dark:border-amber-800/40 p-4 shadow-[0_8px_24px_rgba(249,115,22,0.06)]">
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-orange-100/40 dark:bg-orange-500/10 blur-2xl pointer-events-none" />

          <div className="flex flex-col gap-2 relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                Freshly Unlocked • 2h ago
              </span>
              <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                Sprout Milestone
              </span>
            </div>

            <div className="flex items-center gap-3.5 mt-1">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
                  <span className="text-2xl">{showcaseBadge.icon}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white border-2 border-white dark:border-[#1E293B] flex items-center justify-center text-[10px]">
                  🌿
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                  {showcaseBadge.title}
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-2 mt-0.5 leading-snug">
                  "{showcaseBadge.description}"
                </p>
              </div>
            </div>

            <div className="mt-2 pt-2.5 flex items-center justify-between border-t border-sky-100/70 dark:border-[#334155]">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Added to permanent canopy</span>
              </div>
              <button
                type="button"
                onClick={() => setCelebrationBadge(showcaseBadge)}
                className="px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-all active:scale-95 text-xs font-bold flex items-center gap-1 shadow-2xs"
              >
                <span>❤️</span>
                <span>Celebrate & Reflect</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 7. ACADEMIC SUBJECT MODULES SECTION */}
      <section className="scroll-reveal-widget space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Academic Subject Modules
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100/70 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-semibold border border-sky-200/50 dark:border-sky-800">
                {subjects.length} Subjects
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Click "+ Log Streak" on any subject to record study momentum
            </p>
          </div>
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] text-xs font-semibold shadow-2xs transition-all"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Manage</span>
          </button>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {subjects.map((subj) => {
            const isJustIncremented = streakJustIncremented === subj.id;

            return (
              <motion.div
                key={subj.id}
                whileHover={{ scale: 1.015, y: -2 }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className="subject-card-anim rounded-2xl p-4 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs hover:border-sky-400 dark:hover:border-sky-500 transition-colors relative overflow-hidden flex flex-col justify-between group"
              >
                {/* Left Colored Accent Bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: subj.color }}
                />

                <div className="pl-2 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-2xs"
                        style={{ backgroundColor: `${subj.color}18` }}
                      >
                        {subj.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-[#0F172A] dark:text-[#F8FAFC] leading-snug">
                          {subj.name}
                        </h3>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white inline-block mt-0.5"
                          style={{ backgroundColor: subj.color }}
                        >
                          {subj.code}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                          {subj.streakDays}d
                        </span>
                        <span className="text-sm animate-bounce">🔥</span>
                      </div>
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">
                        {subj.studyMinutesToday}m today
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] line-clamp-2 leading-relaxed">
                    {subj.description || "Active curriculum module with continuous practice blocks."}
                  </p>

                  {subj.nextTopic && (
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#0F172A]/60 border border-slate-200/70 dark:border-[#334155] text-[11px] text-[#475569] dark:text-[#CBD5E1] flex items-center gap-1.5">
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Next:</span>
                      <span className="truncate">{subj.nextTopic}</span>
                    </div>
                  )}
                </div>

                <div className="pl-2 pt-2.5 mt-2.5 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Target: {subj.targetWeeklyHours || 5}h / week
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleIncrementStreak(subj.id, e)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-2xs ${
                      isJustIncremented
                        ? "bg-emerald-600 text-white scale-105"
                        : "bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{isJustIncremented ? "Streak +1! 🎉" : "Log Streak"}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 8. WEEKLY ACADEMIC BALANCE (Circular Progress Dial - Stitch Screen b8efdc40) */}
      <section className="scroll-reveal-widget bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md rounded-2xl p-4 shadow-[0_4px_16px_rgba(15,23,42,0.03)] border border-sky-100/80 dark:border-[#334155] flex items-center gap-4">
        {/* SVG Circular Progress Dial */}
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 48 48">
            <circle
              className="text-sky-100 dark:text-sky-950"
              cx="24"
              cy="24"
              fill="none"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
            />
            <circle
              className="text-sky-500"
              cx="24"
              cy="24"
              fill="none"
              r="20"
              stroke="currentColor"
              strokeDasharray="125.6"
              strokeDashoffset="27.6"
              strokeLinecap="round"
              strokeWidth="4"
            />
          </svg>
          <span className="absolute text-base font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">
            78%
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400 mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              WEEKLY ACADEMIC BALANCE
            </span>
          </div>
          <span className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            4 of 5 focus goals met
          </span>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5 leading-snug">
            Consistent 20-minute daily blocks beat marathon cramming every single time.
          </p>
        </div>
      </section>

      {/* Modals */}
      <SubjectManagementModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        subjects={subjects}
        onSubjectsChange={(updated) => setSubjects(updated)}
        onSelectSubjectForStudy={() => {
          setIsManageModalOpen(false);
          onNavigateToChat();
        }}
      />

      <UnlockedBadgeModal
        badge={celebrationBadge}
        isOpen={Boolean(celebrationBadge)}
        onClose={() => setCelebrationBadge(null)}
        onOpenReflection={onOpenReflection}
      />
    </div>
  );
};
