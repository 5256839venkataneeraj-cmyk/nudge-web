import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  Flame,
  Check,
  Clock,
  Calendar,
  Plus,
  BookOpen,
  Settings2,
  TrendingUp,
  Brain,
  Zap,
} from "lucide-react";
import { StudentSnapshot, SubjectModule } from "../types";
import {
  getStoredSubjects,
  incrementSubjectStreak,
  saveStoredSubjects,
} from "../lib/subjects";
import { SubjectManagementModal } from "./SubjectManagementModal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface HomeViewProps {
  snapshot: StudentSnapshot | null;
  onNavigateToChat: () => void;
  onNavigateToSnapshot?: () => void;
  onNavigateToSchedule?: () => void;
  onNavigateToMilestones?: () => void;
  onOpenAddAssignment?: () => void;
  onOpenReflection?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  snapshot,
  onNavigateToChat,
  onNavigateToSnapshot,
  onNavigateToSchedule,
  onNavigateToMilestones,
  onOpenAddAssignment,
  onOpenReflection,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [subjects, setSubjects] = useState<SubjectModule[]>(() => getStoredSubjects());
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [streakJustIncremented, setStreakJustIncremented] = useState<string | null>(null);

  // Sync subjects if updated in another component/modal
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

  // GSAP Entrance & Scroll-Triggered Animations (Wellora Aesthetic)
  useGSAP(
    () => {
      // 1. Hero & Study Nudge Reminders entrance: opacity 0, y 30 -> opacity 1, y 0 with power3.out
      gsap.from(".hero-elem", {
        opacity: 0,
        y: 30,
        duration: 0.85,
        stagger: 0.12,
        ease: "power3.out",
      });

      // 2. Subject Cards Stagger Entrance: opacity 0, y 30 -> opacity 1, y 0 with power3.out
      gsap.from(".subject-card-anim", {
        opacity: 0,
        y: 30,
        duration: 0.75,
        stagger: 0.09,
        ease: "power3.out",
        delay: 0.25,
      });

      // 3. Scroll-triggered reveal for bottom widgets
      const widgets = gsap.utils.toArray<HTMLElement>(".scroll-reveal-widget");
      widgets.forEach((widget) => {
        gsap.from(widget, {
          scrollTrigger: {
            trigger: widget,
            start: "top 90%",
            toggleActions: "play none none none",
          },
          opacity: 0,
          y: 25,
          duration: 0.65,
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

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto font-sans w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-7 pb-28 text-[#1E3A34] dark:text-[#E9F3EF]"
    >
      {/* 1. HERO SECTION (Wellora Organic Coaching Aesthetic) */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <span className="hero-elem inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2EE] dark:bg-[#1D3631] text-[#1E3A34] dark:text-[#A3C1AD] text-xs font-semibold tracking-wide border border-[#C8DCD5]/60 dark:border-[#32574F]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5B8A82] dark:bg-[#75A69D] animate-pulse" />
            <span>Wellora Student Study Nudge</span>
          </span>
          <span className="hero-elem text-xs text-[#7E928C] dark:text-[#85A39A]">
            • {subjects.length} Core Subjects Active
          </span>
        </div>

        <div>
          <h1 className="hero-elem font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#1E3A34] dark:text-[#E9F3EF] leading-[1.15]">
            Good morning, <br className="sm:hidden" />
            Maya 🌿
          </h1>
          <p className="hero-elem text-sm sm:text-base text-[#475D57] dark:text-[#BDD4CD] mt-2 leading-relaxed max-w-xl font-normal">
            Ready to build gentle academic momentum? You've logged{" "}
            <span className="font-semibold text-[#1E3A34] dark:text-[#E9F3EF]">
              {totalStudyMinutes} minutes
            </span>{" "}
            across your subjects today.
          </p>
        </div>

        {/* Action Pills Bar */}
        <div className="hero-elem flex items-center gap-2 pt-1 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsManageModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#1E3A34] hover:bg-[#284C44] dark:bg-[#5B8A82] dark:hover:bg-[#4E7972] text-[#F9F6F0] dark:text-[#0F1A18] text-xs font-semibold shadow-xs transition-all duration-200"
            title="Manage Subject Modules"
          >
            <Settings2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Manage Subjects</span>
          </motion.button>

          {onOpenAddAssignment && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenAddAssignment}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-[#152522] hover:bg-[#F9F6F0] dark:hover:bg-[#1D3631] text-[#1E3A34] dark:text-[#E9F3EF] text-xs font-semibold shadow-2xs border border-[#E8E3D7] dark:border-[#243E38] transition-all duration-200"
              title="Add New Assignment"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Goal</span>
            </motion.button>
          )}

          {onOpenReflection && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenReflection}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-[#152522] hover:bg-[#F9F6F0] dark:hover:bg-[#1D3631] text-[#475D57] dark:text-[#BDD4CD] text-xs font-medium shadow-2xs border border-[#E8E3D7] dark:border-[#243E38] transition-all duration-200"
              title="Mindful Reflection & Mood Check-in"
            >
              <span>🌱</span>
              <span>Daily Check-in</span>
            </motion.button>
          )}

          {onNavigateToSchedule && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onNavigateToSchedule}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#EAF2EE] dark:bg-[#192F2A] hover:bg-[#D9E9E2] dark:hover:bg-[#223E37] text-[#1E3A34] dark:text-[#A3C1AD] text-xs font-semibold transition-all duration-200 shadow-2xs border border-[#C8DCD5]/60 dark:border-[#32574F]"
              title="Open Schedule & Calendar"
            >
              <Calendar className="w-3.5 h-3.5 text-[#5B8A82]" />
              <span className="hidden sm:inline">Schedule</span>
            </motion.button>
          )}
        </div>
      </section>

      {/* Organic Curved Wave Divider */}
      <div className="relative w-full overflow-hidden leading-none py-1 pointer-events-none opacity-45 dark:opacity-20" aria-hidden="true">
        <svg
          className="w-full h-6 text-[#A3C1AD] dark:text-[#32574F] fill-current"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,40 L1200,120 L0,120 Z" />
        </svg>
      </div>

      {/* 2. DAILY PSYCHOLOGICAL STUDY NUDGE REMINDER */}
      <motion.div
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.985 }}
        onClick={onNavigateToChat}
        className="hero-elem cursor-pointer rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#EAF2EE] via-[#F2F7F4] to-[#E5EFEA] dark:from-[#162925] dark:via-[#192F2B] dark:to-[#12221F] border border-[#C8DCD5] dark:border-[#2D4E46] shadow-[0_10px_35px_-10px_rgba(30,58,52,0.08)] transition-all duration-300 flex items-center justify-between group"
      >
        <div className="flex items-start sm:items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1E3A34] text-[#1E3A34] dark:text-[#A3C1AD] flex items-center justify-center text-2xl shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-300">
            📐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#5B8A82] dark:text-[#A3C1AD] uppercase tracking-wider">
                DAILY STUDY NUDGE REMINDER
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5B8A82]/15 text-[#1E3A34] dark:text-[#E9F3EF] font-semibold">
                Calculus & Python sprint
              </span>
            </div>
            <div className="font-serif font-medium text-lg sm:text-xl text-[#1E3A34] dark:text-[#E9F3EF] group-hover:text-[#5B8A82] dark:group-hover:text-[#A3C1AD] transition-colors mt-1">
              "Overwhelmed by Calculus problem sets? Start with just 1 integral."
            </div>
            <p className="text-xs sm:text-sm text-[#475D57] dark:text-[#BDD4CD] mt-1 font-sans">
              Tap to talk with Nudge for frictionless breakdown and 15m focus timer.
            </p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#1E3A34] dark:bg-[#5B8A82] text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs ml-3">
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </div>
      </motion.div>

      {/* 3. DYNAMIC SUBJECT MODULES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl font-medium text-[#1E3A34] dark:text-[#E9F3EF]">
                Academic Subject Modules
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EAF2EE] dark:bg-[#1D3631] text-[#1E3A34] dark:text-[#A3C1AD] font-semibold border border-[#C8DCD5]/50 dark:border-[#32574F]">
                {subjects.length} Subjects
              </span>
            </div>
            <p className="text-xs text-[#7E928C] dark:text-[#85A39A] mt-0.5">
              Click "+ Log Streak" on any subject to record study momentum
            </p>
          </div>
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#152522] hover:bg-[#F9F6F0] dark:hover:bg-[#1D3631] border border-[#E8E3D7] dark:border-[#243E38] text-[#1E3A34] dark:text-[#A3C1AD] text-xs font-semibold shadow-2xs transition-all duration-200"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Manage</span>
          </button>
        </div>

        {/* Subjects Grid with GSAP Stagger Animation and Hover States */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {subjects.map((subj) => {
            const isJustIncremented = streakJustIncremented === subj.id;

            return (
              <motion.div
                key={subj.id}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className="subject-card-anim rounded-3xl p-5 bg-white/95 dark:bg-[#152522]/90 backdrop-blur-xl border border-[#E8E3D7] dark:border-[#243E38] shadow-[0_8px_30px_rgb(30,58,52,0.03)] hover:border-[#5B8A82] dark:hover:border-[#5B8A82] transition-colors relative overflow-hidden flex flex-col justify-between group"
              >
                {/* Left Colored Accent Bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: subj.color }}
                />

                <div className="pl-2 space-y-3">
                  {/* Top Bar: Icon, Code Badge, Streak Tag */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-2xs"
                        style={{ backgroundColor: `${subj.color}18` }}
                      >
                        {subj.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-medium text-base sm:text-lg text-[#1E3A34] dark:text-[#E9F3EF] leading-snug">
                            {subj.name}
                          </h3>
                        </div>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white inline-block mt-0.5"
                          style={{ backgroundColor: subj.color }}
                        >
                          {subj.code}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Task-Streak Counter Pill */}
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-sm font-bold text-[#1E3A34] dark:text-[#E9F3EF]">
                          {subj.streakDays}d
                        </span>
                        <span className="text-base animate-bounce">🔥</span>
                      </div>
                      <span className="text-[10px] text-[#7E928C] dark:text-[#85A39A] block">
                        {subj.studyMinutesToday}m today
                      </span>
                    </div>
                  </div>

                  {/* Description / Next Topic */}
                  <p className="text-xs text-[#475D57] dark:text-[#BDD4CD] line-clamp-2 leading-relaxed font-sans">
                    {subj.description || "Active curriculum module with continuous practice blocks."}
                  </p>

                  {subj.nextTopic && (
                    <div className="p-2 rounded-xl bg-[#F9F6F0] dark:bg-[#12201D] border border-[#E8E3D7]/70 dark:border-[#243E38]/60 text-[11px] text-[#475D57] dark:text-[#BDD4CD] flex items-center gap-1.5">
                      <span className="font-semibold text-[#1E3A34] dark:text-[#E9F3EF]">Next:</span>
                      <span className="truncate">{subj.nextTopic}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions: Interactive Streak Logger & Chat Assist */}
                <div className="pl-2 pt-3 mt-3 border-t border-[#E8E3D7]/70 dark:border-[#243E38]/60 flex items-center justify-between">
                  <span className="text-[11px] text-[#7E928C] dark:text-[#85A39A]">
                    Target: {subj.targetWeeklyHours || 5}h / week
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleIncrementStreak(subj.id, e)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
                        isJustIncremented
                          ? "bg-emerald-600 text-white scale-105"
                          : "bg-[#EAF2EE] dark:bg-[#1D3631] hover:bg-[#D9E9E2] dark:hover:bg-[#25443E] text-[#1E3A34] dark:text-[#A3C1AD] border border-[#C8DCD5]/60 dark:border-[#32574F]"
                      }`}
                      title="Increment task study streak by 1 day (+20m)"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{isJustIncremented ? "Streak +1! 🎉" : "Log Streak"}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 4. PROGRESS DASHBOARD: WEEKLY STUDY PACE */}
      <motion.div
        whileHover={{ scale: 1.015, y: -2 }}
        className="scroll-reveal-widget bg-gradient-to-r from-white via-[#F9F6F0] to-[#EAF2EE] dark:from-[#152522] dark:via-[#192F2A] dark:to-[#162723] backdrop-blur-xl rounded-3xl p-6 border border-[#E8E3D7] dark:border-[#243E38] shadow-[0_8px_30px_rgb(30,58,52,0.03)] flex items-center gap-5 transition-all duration-200"
      >
        <div className="w-16 h-16 rounded-full border-4 border-[#5B8A82] dark:border-[#75A69D] flex flex-col items-center justify-center shrink-0 shadow-inner bg-white/60 dark:bg-[#1E3A34]/50">
          <span className="font-serif font-bold text-lg text-[#1E3A34] dark:text-[#E9F3EF]">
            {Math.min(96, Math.max(65, Math.round((totalStreaksCombined / (subjects.length * 15)) * 100)))}%
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-[#5B8A82] dark:text-[#A3C1AD] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            SEMESTER STUDY MOMENTUM
          </span>
          <p className="font-serif text-base sm:text-lg text-[#1E3A34] dark:text-[#E9F3EF] font-medium leading-relaxed mt-0.5">
            You have active streaks running across all {subjects.length} subjects.
          </p>
          <p className="text-xs text-[#7E928C] dark:text-[#85A39A] mt-0.5 font-sans">
            Consistent 20-minute daily blocks beat marathon cramming every single time.
          </p>
        </div>
      </motion.div>

      {/* Dynamic Subject Management Modal */}
      <SubjectManagementModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        subjects={subjects}
        onSubjectsChange={(updated) => setSubjects(updated)}
        onSelectSubjectForStudy={(subj) => {
          setIsManageModalOpen(false);
          onNavigateToChat();
        }}
      />
    </div>
  );
};
