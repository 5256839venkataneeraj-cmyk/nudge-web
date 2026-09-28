import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Trash2, Edit3, Check, RotateCcw, BookOpen, Sparkles } from "lucide-react";
import { SubjectModule } from "../types";
import { addSubject, updateSubject, deleteSubject, resetToDefaultSubjects } from "../lib/subjects";

interface SubjectManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectModule[];
  onSubjectsChange: (updated: SubjectModule[]) => void;
  onSelectSubjectForStudy?: (subject: SubjectModule) => void;
}

const EMOJI_OPTIONS = ["📐", "⚙️", "🧪", "🐍", "📖", "🌿", "⚡", "🔬", "💻", "📊", "🎨", "🌍", "🧠", "📝", "💡"];
const COLOR_PRESETS = [
  { label: "Sage", hex: "#5B8A82" },
  { label: "Forest", hex: "#3A6351" },
  { label: "Teal", hex: "#4A7C59" },
  { label: "Soft Mint", hex: "#6F9E8B" },
  { label: "Eucalyptus", hex: "#7EA89B" },
  { label: "Warm Sand", hex: "#9E8B6F" },
  { label: "Terracotta", hex: "#B86B53" },
];

export const SubjectManagementModal: React.FC<SubjectManagementModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onSubjectsChange,
  onSelectSubjectForStudy,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [icon, setIcon] = useState("📐");
  const [color, setColor] = useState("#5B8A82");
  const [description, setDescription] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setCode("");
    setIcon("📐");
    setColor("#5B8A82");
    setDescription("");
    setWeeklyHours(5);
    setError(null);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (subject: SubjectModule) => {
    setEditingId(subject.id);
    setName(subject.name);
    setCode(subject.code);
    setIcon(subject.icon);
    setColor(subject.color);
    setDescription(subject.description || "");
    setWeeklyHours(subject.targetWeeklyHours || 5);
    setIsAdding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a subject name.");
      return;
    }

    if (editingId) {
      const updated = updateSubject(editingId, {
        name: name.trim(),
        code: code.trim().toUpperCase() || name.slice(0, 4).toUpperCase(),
        icon,
        color,
        description: description.trim(),
        targetWeeklyHours: weeklyHours,
      });
      onSubjectsChange(updated);
    } else {
      const updated = addSubject({
        name: name.trim(),
        code: code.trim().toUpperCase() || name.slice(0, 4).toUpperCase(),
        icon,
        color,
        description: description.trim(),
        streakDays: 1,
        studyMinutesToday: 0,
        openTasksCount: 0,
        targetWeeklyHours: weeklyHours,
      });
      onSubjectsChange(updated);
    }

    resetForm();
  };

  const handleDelete = (id: string, subjectName: string) => {
    if (window.confirm(`Are you sure you want to remove "${subjectName}" from your curriculum?`)) {
      const updated = deleteSubject(id);
      onSubjectsChange(updated);
      if (editingId === id) resetForm();
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm("Reset all subjects back to the default core curriculum (Calculus, Basic Engineering, Applied Chemistry, Python, English, Environmental Science)?")) {
      const updated = resetToDefaultSubjects();
      onSubjectsChange(updated);
      resetForm();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="w-full max-w-lg bg-[#F9F6F0] dark:bg-[#12201D] border border-[#E8E3D7] dark:border-[#243E38] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-[#E8E3D7] dark:border-[#243E38] flex items-center justify-between bg-white/60 dark:bg-[#152522]/60 backdrop-blur-md">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#EAF2EE] dark:bg-[#1D3631] text-[#1E3A34] dark:text-[#A3C1AD] flex items-center justify-center text-lg shadow-xs">
                📚
              </div>
              <div>
                <h2 className="font-serif text-xl font-medium text-[#1E3A34] dark:text-[#E9F3EF]">
                  Manage Curriculum
                </h2>
                <p className="text-xs text-[#7E928C] dark:text-[#85A39A]">
                  Add, customize, and track your active academic subjects
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#7E928C] hover:text-[#1E3A34] dark:hover:text-[#E9F3EF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Top Action Bar: Add or Reset */}
            {!isAdding && !editingId && (
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1E3A34] hover:bg-[#284C44] dark:bg-[#5B8A82] dark:hover:bg-[#4E7972] text-[#F9F6F0] dark:text-[#0F1A18] text-xs font-semibold shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Subject</span>
                </button>
                <button
                  onClick={handleResetDefaults}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white dark:bg-[#152522] hover:bg-[#FAF7F2] text-[#7E928C] hover:text-[#1E3A34] dark:hover:text-[#E9F3EF] text-xs font-medium border border-[#E8E3D7] dark:border-[#243E38] shadow-2xs transition-colors"
                  title="Reset to 6 Default Subjects"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Defaults</span>
                </button>
              </div>
            )}

            {/* Add / Edit Form */}
            {(isAdding || editingId) && (
              <form onSubmit={handleSave} className="p-5 rounded-2xl bg-white dark:bg-[#152522] border border-[#E8E3D7] dark:border-[#243E38] space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-1 border-b border-[#E8E3D7] dark:border-[#243E38]">
                  <span className="font-serif font-medium text-sm text-[#1E3A34] dark:text-[#E9F3EF]">
                    {editingId ? "Edit Subject Module" : "Create New Subject Module"}
                  </span>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-[#7E928C] hover:text-[#1E3A34] dark:hover:text-[#E9F3EF]"
                  >
                    Cancel
                  </button>
                </div>

                {error && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-[#1E3A34] dark:text-[#E9F3EF]">
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Calculus"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E3D7] dark:border-[#243E38] bg-[#F9F6F0] dark:bg-[#12201D] text-sm text-[#1E3A34] dark:text-[#E9F3EF] outline-none focus:ring-2 focus:ring-[#5B8A82]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1E3A34] dark:text-[#E9F3EF]">
                      Code
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="MATH 201"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E3D7] dark:border-[#243E38] bg-[#F9F6F0] dark:bg-[#12201D] text-sm text-[#1E3A34] dark:text-[#E9F3EF] outline-none focus:ring-2 focus:ring-[#5B8A82]"
                    />
                  </div>
                </div>

                {/* Emoji Icon Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1E3A34] dark:text-[#E9F3EF]">
                    Choose Subject Icon
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[#F9F6F0] dark:bg-[#12201D] border border-[#E8E3D7] dark:border-[#243E38]">
                    {EMOJI_OPTIONS.map((em) => (
                      <button
                        type="button"
                        key={em}
                        onClick={() => setIcon(em)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-transform ${
                          icon === em
                            ? "bg-[#5B8A82] text-white scale-110 shadow-xs"
                            : "hover:bg-white/70 dark:hover:bg-white/10"
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Palette Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1E3A34] dark:text-[#E9F3EF]">
                    Accent Tone
                  </label>
                  <div className="flex items-center gap-2">
                    {COLOR_PRESETS.map((p) => (
                      <button
                        type="button"
                        key={p.hex}
                        onClick={() => setColor(p.hex)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          color === p.hex ? "ring-2 ring-[#1E3A34] dark:ring-white scale-110" : ""
                        }`}
                        style={{ backgroundColor: p.hex }}
                        title={p.label}
                      >
                        {color === p.hex && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description & Target */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E3A34] dark:text-[#E9F3EF]">
                    Focus Topics / Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Key concepts, syllabus topics, or notes..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E3D7] dark:border-[#243E38] bg-[#F9F6F0] dark:bg-[#12201D] text-xs text-[#1E3A34] dark:text-[#E9F3EF] outline-none focus:ring-2 focus:ring-[#5B8A82]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#7E928C]">Target: {weeklyHours} hrs / week</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-3.5 py-1.5 rounded-xl border border-[#E8E3D7] dark:border-[#243E38] text-xs font-medium text-[#475D57] dark:text-[#BDD4CD]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#5B8A82] hover:bg-[#4D766F] text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      {editingId ? "Update Subject" : "Save Subject"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Existing Subjects List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7E928C] dark:text-[#85A39A]">
                  Active Subjects ({subjects.length})
                </span>
                <span className="text-[11px] text-[#7E928C]">Click to edit or adjust streak</span>
              </div>

              <div className="space-y-2.5">
                {subjects.map((subj) => (
                  <div
                    key={subj.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#152522] border border-[#E8E3D7] dark:border-[#243E38] flex items-center justify-between group hover:border-[#5B8A82] dark:hover:border-[#5B8A82] transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-2xs"
                        style={{ backgroundColor: `${subj.color}15`, color: subj.color }}
                      >
                        {subj.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-medium text-sm text-[#1E3A34] dark:text-[#E9F3EF] truncate">
                            {subj.name}
                          </h4>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white"
                            style={{ backgroundColor: subj.color }}
                          >
                            {subj.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#7E928C] dark:text-[#85A39A] flex items-center gap-2 mt-0.5 font-sans">
                          <span>🔥 {subj.streakDays}d streak</span>
                          <span>•</span>
                          <span>⏱️ {subj.studyMinutesToday}m today</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(subj)}
                        className="p-1.5 rounded-lg text-[#7E928C] hover:text-[#1E3A34] dark:hover:text-[#E9F3EF] hover:bg-[#F9F6F0] dark:hover:bg-[#12201D] transition-colors"
                        title="Edit Subject"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(subj.id, subj.name)}
                        className="p-1.5 rounded-lg text-[#7E928C] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
