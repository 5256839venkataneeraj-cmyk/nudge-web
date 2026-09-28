import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Plus,
  Calendar,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { AssignmentItem, StudentSnapshot } from "../types";
import { getStoredSubjects } from "../lib/subjects";

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAssignment: (assignment: AssignmentItem) => Promise<void> | void;
  snapshot: StudentSnapshot | null;
}

export const AddAssignmentModal: React.FC<AddAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAddAssignment,
  snapshot,
}) => {
  const [subjectsList] = useState(() => getStoredSubjects());
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState(() => subjectsList[0]?.name || "Calculus");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  });
  const [dueTime, setDueTime] = useState("11:59 PM");
  const [workload, setWorkload] = useState<"light" | "moderate" | "heavy">("moderate");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [generateSteps, setGenerateSteps] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const estMinutes = workload === "light" ? 90 : workload === "moderate" ? 180 : 360;
      const formattedDate = new Date(dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const newAssignment: AssignmentItem = {
        id: "asg_" + Date.now(),
        title: title.trim(),
        course,
        dueDate: `${formattedDate}, ${dueTime}`,
        dueLabel: `Due ${formattedDate}`,
        priority,
        estMinutes,
        completed: false,
        progress: 0,
      };

      await onAddAssignment(newAssignment);
      setTitle("");
      onClose();
    } catch (err) {
      console.error("Error creating assignment:", err);
    } finally {
      setIsSubmitting(false);
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
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#CAEBD1] dark:bg-[#486551]/30 text-[#042011] dark:text-[#CAEBD1] text-[10px] font-bold w-fit uppercase">
                <Sparkles className="w-3 h-3 text-[#314D3A] dark:text-[#CAEBD1]" />
                Gentle Flow Setup
              </span>
              <h2 className="text-xl font-extrabold text-[#1F1B1A] dark:text-[#F6ECEA] mt-1">
                Add New Assignment
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/80 dark:bg-[#2C2422] text-[#70645D] dark:text-[#A89E97] hover:text-[#2D2522] dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Scrollable Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-5">
            {/* Mindful Pacing Active Banner */}
            <div className="rounded-2xl bg-white dark:bg-[#251E1C] p-3.5 border border-[#EAE0DE] dark:border-[#382F2C] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFDBCF]/60 dark:bg-[#9D3E1A]/20 flex items-center justify-center text-xl shrink-0">
                ☕
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#9D3E1A] dark:text-[#FFB59C]">
                  Mindful Pacing Active
                </p>
                <p className="text-[11px] text-[#70645D] dark:text-[#A89E97] truncate">
                  We automatically protect your downtime and sleep schedule.
                </p>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA] flex justify-between">
                <span>Assignment Title</span>
                <span className="text-[11px] text-[#8A726A] font-normal">Required</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bioethics Case Study Analysis"
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#EAE0DE] dark:border-[#382F2C] text-sm text-[#1F1B1A] dark:text-[#F6ECEA] placeholder:text-[#8A726A]/70 focus:outline-none focus:ring-2 focus:ring-[#9D3E1A]"
              />
            </div>

            {/* Course Select Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA]">
                Subject / Course
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {subjectsList.map((c) => {
                  const isSelected = course === c.name;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCourse(c.name)}
                      className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? "bg-[#1E3A34] dark:bg-[#5B8A82] text-white shadow-xs"
                          : "bg-white dark:bg-[#251E1C] text-[#475D57] dark:text-[#A89E97] border border-[#E8E3D7] dark:border-[#382F2C]"
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#9D3E1A]" />
                  <span>Target Due Date</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#EAE0DE] dark:border-[#382F2C] text-xs font-medium text-[#1F1B1A] dark:text-[#F6ECEA] focus:outline-none focus:ring-2 focus:ring-[#9D3E1A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#9D3E1A]" />
                  <span>Target Time</span>
                </label>
                <select
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#EAE0DE] dark:border-[#382F2C] text-xs font-medium text-[#1F1B1A] dark:text-[#F6ECEA] focus:outline-none focus:ring-2 focus:ring-[#9D3E1A]"
                >
                  <option value="11:59 PM">11:59 PM (Midnight)</option>
                  <option value="5:00 PM">5:00 PM (End of Day)</option>
                  <option value="12:00 PM">12:00 PM (Noon)</option>
                  <option value="9:00 AM">9:00 AM (Morning Lecture)</option>
                </select>
              </div>
            </div>

            {/* Workload Sizing */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA]">
                Estimated Effort / Workload
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "light", label: "Light", time: "1–2 hrs", emoji: "🌱" },
                  { id: "moderate", label: "Moderate", time: "3–5 hrs", emoji: "⚡" },
                  { id: "heavy", label: "Deep Dive", time: "6+ hrs", emoji: "📚" },
                ].map((w) => {
                  const isSelected = workload === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWorkload(w.id as any)}
                      className={`p-3 rounded-2xl text-left border flex flex-col justify-between transition-all ${
                        isSelected
                          ? "bg-[#FFDBCF]/50 dark:bg-[#9D3E1A]/20 border-[#9D3E1A]"
                          : "bg-white dark:bg-[#251E1C] border-[#EAE0DE] dark:border-[#382F2C]"
                      }`}
                    >
                      <span className="text-base">{w.emoji}</span>
                      <div className="mt-1">
                        <span className="text-xs font-bold block text-[#1F1B1A] dark:text-[#F6ECEA]">
                          {w.label}
                        </span>
                        <span className="text-[10px] text-[#70645D] dark:text-[#A89E97]">
                          {w.time}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Selector */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#EAE0DE] dark:border-[#382F2C]">
              <span className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA]">
                Academic Priority
              </span>
              <div className="flex gap-1.5">
                {(["low", "medium", "high"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                      priority === p
                        ? p === "high"
                          ? "bg-rose-500 text-white"
                          : p === "medium"
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-500 text-white"
                        : "bg-[#F6ECEA] dark:bg-[#2D2522] text-[#56423C] dark:text-[#A89E97]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-Breakdown Toggle */}
            <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#CAEBD1]/30 dark:bg-[#486551]/15 border border-[#CAEBD1] dark:border-[#486551]/30 cursor-pointer">
              <input
                type="checkbox"
                checked={generateSteps}
                onChange={(e) => setGenerateSteps(e.target.checked)}
                className="mt-1 rounded text-[#486551] focus:ring-[#486551]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#042011] dark:text-[#CAEBD1] block">
                  Generate Gentle Micro-Steps with Nudge AI
                </span>
                <span className="text-[#314D3A] dark:text-[#AECEB6] text-[11px]">
                  Breaks this assignment into 20-30 min bite-sized checkpoints to prevent procrastination.
                </span>
              </div>
            </label>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-full bg-white dark:bg-[#251E1C] border border-[#EAE0DE] dark:border-[#382F2C] text-xs font-bold text-[#56423C] dark:text-[#A89E97] hover:bg-[#F6ECEA]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="flex-1 py-3 px-4 rounded-full bg-[#9D3E1A] text-white text-xs font-bold shadow-md hover:bg-[#BD5630] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <span>Add to Schedule</span>
                    <Plus className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
