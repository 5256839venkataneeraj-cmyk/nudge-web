import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  Heart,
  Save,
  Mic,
  MicOff,
  Smile,
  Zap,
  CloudFog,
  Moon,
  Target,
} from "lucide-react";
import { StudentSnapshot, MoodState } from "../types";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

interface ReflectionNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: StudentSnapshot | null;
  onSaveReflection: (updatedMood: MoodState) => Promise<void> | void;
}

const MOOD_OPTIONS = [
  {
    score: 4,
    label: "Balanced & Grounded",
    energy: "Medium" as const,
    emoji: "🌿",
    desc: "Steady pacing, manageable workload",
  },
  {
    score: 5,
    label: "Energized & Motivated",
    energy: "High" as const,
    emoji: "⚡",
    desc: "High focus, ready for complex papers",
  },
  {
    score: 2,
    label: "A bit Overwhelmed",
    energy: "Low" as const,
    emoji: "⛅",
    desc: "Brain fog or deadlines stacking up",
  },
  {
    score: 1,
    label: "Fatigued & Running on Fumes",
    energy: "Low" as const,
    emoji: "😴",
    desc: "Need early bedtime and gentler blocks",
  },
  {
    score: 4,
    label: "In the Zone",
    energy: "High" as const,
    emoji: "🎯",
    desc: "Locked in, minimizing distractions",
  },
];

const QUICK_TAGS = [
  "PubMed sources found",
  "Cleared morning fog",
  "Avoided doomscrolling",
  "Bioethics sprint complete",
  "Need early bedtime",
  "10-min tea breather",
];

export const ReflectionNoteModal: React.FC<ReflectionNoteModalProps> = ({
  isOpen,
  onClose,
  snapshot,
  onSaveReflection,
}) => {
  const [selectedMood, setSelectedMood] = useState(
    () =>
      MOOD_OPTIONS.find((m) => m.label === snapshot?.mood?.label) ||
      MOOD_OPTIONS[0]
  );
  const [note, setNote] = useState(snapshot?.mood?.note || "");
  const [isSaving, setIsSaving] = useState(false);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
  } = useSpeechRecognition();

  // If speech transcription occurs, append to reflection note
  React.useEffect(() => {
    if (transcript) {
      setNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
  }, [transcript]);

  if (!isOpen) return null;

  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleAddTag = (tag: string) => {
    setNote((prev) => (prev ? `${prev}. ${tag}` : tag));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated: MoodState = {
        score: selectedMood.score,
        label: selectedMood.label,
        energy: selectedMood.energy,
        note: note.trim() || undefined,
      };
      await onSaveReflection(updated);
      onClose();
    } catch (err) {
      console.error("Failed to save reflection note:", err);
    } finally {
      setIsSaving(false);
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

        {/* Modal Sheet */}
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
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFDBCF] dark:bg-[#9D3E1A]/25 text-[#9D3E1A] dark:text-[#FFB59C] text-[10px] font-bold w-fit uppercase">
                <Heart className="w-3 h-3 text-[#D96B43]" />
                Mindful Check-in
              </span>
              <h2 className="text-xl font-extrabold text-[#1F1B1A] dark:text-[#F6ECEA] mt-1">
                Reflect & Ground
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/80 dark:bg-[#2C2422] text-[#70645D] dark:text-[#A89E97] hover:text-[#2D2522] dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto py-4 space-y-5">
            {/* Mood Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA] block">
                How does your mental energy feel right now?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MOOD_OPTIONS.map((m) => {
                  const isSelected = selectedMood.label === m.label;
                  return (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setSelectedMood(m)}
                      className={`p-3 rounded-2xl text-left border flex items-center gap-3 transition-all ${
                        isSelected
                          ? "bg-[#FFDBCF]/60 dark:bg-[#9D3E1A]/20 border-[#9D3E1A] shadow-xs"
                          : "bg-white dark:bg-[#251E1C] border-[#EAE0DE] dark:border-[#382F2C] hover:bg-[#F6ECEA]"
                      }`}
                    >
                      <span className="text-2xl shrink-0">{m.emoji}</span>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA] block truncate">
                          {m.label}
                        </span>
                        <span className="text-[10px] text-[#70645D] dark:text-[#A89E97] block truncate">
                          {m.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Inspiration Tags */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#8A726A] dark:text-[#9A8B85]">
                Tap to include in journal:
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {QUICK_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleAddTag(t)}
                    className="px-2.5 py-1 rounded-full bg-white dark:bg-[#251E1C] border border-[#EAE0DE] dark:border-[#382F2C] text-[11px] text-[#56423C] dark:text-[#A89E97] hover:bg-[#F6ECEA] transition-colors"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Note Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1F1B1A] dark:text-[#F6ECEA]">
                  Personal Reflection Note
                </label>
                {isSupported && (
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                      isListening
                        ? "bg-rose-500 text-white animate-pulse"
                        : "bg-[#F6ECEA] dark:bg-[#2C2422] text-[#9D3E1A] dark:text-[#FFB59C]"
                    }`}
                  >
                    {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    <span>{isListening ? "Listening..." : "Dictate Note"}</span>
                  </button>
                )}
              </div>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What helped you stay grounded today? Did you tackle that section, or did you need a breather? Zero judgment here..."
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#251E1C] border border-[#EAE0DE] dark:border-[#382F2C] text-xs leading-relaxed text-[#1F1B1A] dark:text-[#F6ECEA] placeholder:text-[#8A726A]/70 focus:outline-none focus:ring-2 focus:ring-[#9D3E1A]"
              />
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-[#F0E6E4] dark:border-[#352D2A] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 text-xs font-bold text-[#70645D] dark:text-[#A89E97] hover:underline"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="py-2.5 px-6 rounded-full bg-[#9D3E1A] text-white text-xs font-bold shadow-xs hover:bg-[#BD5630] disabled:opacity-50 flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save to Journal"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
