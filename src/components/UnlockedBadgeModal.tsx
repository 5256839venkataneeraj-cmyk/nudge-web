import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Check, Sprout, CheckCircle2 } from "lucide-react";
import {
  MilestoneBadge,
  updateMilestoneReflection,
} from "../lib/milestones";

interface UnlockedBadgeModalProps {
  badge: MilestoneBadge | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReflection?: () => void;
}

const DEFAULT_MOOD_TAGS = [
  "🍃 Clear-headed",
  "🦆 Duck pond",
  "⚡ High Energy",
  "🌅 Crisp Morning",
  "📚 Library Zone",
  "☕ Warm Brew",
];

export const UnlockedBadgeModal: React.FC<UnlockedBadgeModalProps> = ({
  badge,
  isOpen,
  onClose,
  onOpenReflection,
}) => {
  const [reflectionText, setReflectionText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [displayOnHome, setDisplayOnHome] = useState(true);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  useEffect(() => {
    if (badge) {
      setReflectionText(
        badge.reflectionNote ||
          "Felt so much more clear-headed for Chem Lab after pedaling past the duck pond."
      );
      setSelectedTags(badge.moodTags || ["🍃 Clear-headed", "🦆 Duck pond"]);
      setDisplayOnHome(badge.displayOnHome ?? true);
      setIsSavedNotice(false);
    }
  }, [badge]);

  if (!isOpen || !badge) return null;

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveReflection = () => {
    if (!badge) return;
    updateMilestoneReflection(
      badge.id,
      reflectionText,
      selectedTags,
      displayOnHome
    );
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
    }, 2000);
  };

  const stats = badge.stats || {
    stat1Label: "Miles Pedaled",
    stat1Value: "35.2",
    stat2Label: "Fresh Air Reset",
    stat2Value: "175m",
    stat3Label: "Gentle Rhythm",
    stat3Value: "7 / 7",
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#2D2522]/55 backdrop-blur-md"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="relative w-full max-w-md bg-[#FFF8F6] dark:bg-[#1E1917] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#F0E6E4] dark:border-[#382F2C] overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"
        >
          {/* Gentle background radiant glow blobs */}
          <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-[#D96B43]/15 dark:bg-[#D96B43]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-14 -left-14 w-48 h-48 rounded-full bg-[#CAEBD1]/40 dark:bg-[#486551]/15 blur-3xl pointer-events-none" />

          {/* Top Bar with Close Button */}
          <div className="flex items-center justify-between pb-1 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CAEBD1] dark:bg-[#486551]/30 text-[#042011] dark:text-[#CAEBD1] text-[11px] font-bold tracking-wide uppercase">
              <Sprout className="w-3.5 h-3.5 text-[#314D3A] dark:text-[#CAEBD1]" />
              {badge.tier.toUpperCase()} MILESTONE UNLOCKED
            </span>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="w-8 h-8 rounded-full bg-white/90 dark:bg-[#2C2422] text-[#70645D] dark:text-[#A89E97] hover:text-[#2D2522] dark:hover:text-white flex items-center justify-center transition-colors text-sm font-bold shadow-xs active:scale-95"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pr-0.5 space-y-4 pt-2 relative z-10 no-scrollbar">
            {/* Centered Hero Badge Visual with Ambient Aura & Botanical Particles */}
            <div className="relative flex flex-col items-center justify-center py-2">
              {/* Glowing background concentric rings */}
              <motion.div
                animate={{ scale: [0.95, 1.06, 0.95], opacity: [0.35, 0.65, 0.35] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute w-44 h-44 rounded-full bg-[#D96B43]/15 dark:bg-[#D96B43]/10 pointer-events-none"
              />
              <motion.div
                animate={{ scale: [1, 1.14, 1], opacity: [0.2, 0.45, 0.2] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
                className="absolute w-52 h-52 rounded-full bg-[#CAEBD1]/30 dark:bg-[#486551]/15 pointer-events-none"
              />

              {/* Floating Botanical Particles */}
              <span className="absolute top-1 right-12 text-emerald-600 text-sm animate-pulse select-none pointer-events-none">
                🌱
              </span>
              <span className="absolute bottom-2 left-10 text-amber-600 text-xs animate-bounce select-none pointer-events-none">
                ✨
              </span>
              <span className="absolute top-6 left-12 text-emerald-500 text-sm select-none pointer-events-none">
                🍃
              </span>

              {/* Main Badge Circle Emblem */}
              <motion.div
                initial={{ rotate: -12, scale: 0.85 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                className="relative"
              >
                <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#D96B43] to-[#B34C26] shadow-lg shadow-[#D96B43]/30 flex items-center justify-center text-white border-4 border-white dark:border-[#1E1917]">
                  <span className="text-4xl select-none">{badge.icon}</span>
                </div>
                {/* Botanical Root Badge Accent */}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#EAF0EB] dark:bg-[#203629] border-2 border-white dark:border-[#1E1917] flex items-center justify-center text-xs shadow-xs">
                  🌿
                </div>
              </motion.div>

              {/* Badge Title & Unlock Meta */}
              <h2 className="text-xl font-extrabold text-[#1F1B1A] dark:text-[#F6ECEA] mt-3 tracking-tight text-center">
                {badge.title}
              </h2>
              <p className="text-xs font-medium text-[#70645D] dark:text-[#A89E97] mt-0.5 text-center flex items-center justify-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{badge.unlockedAt || "Rooted this morning at 8:45 AM • Week 8"}</span>
              </p>
            </div>

            {/* Story / Context Snippet */}
            <div className="bg-gradient-to-br from-[#FAF3F0] to-[#FFF8F6] dark:from-[#251E1B] dark:to-[#1E1917] border border-amber-200/50 dark:border-[#382F2C] rounded-2xl p-3.5 text-center shadow-2xs">
              <p className="text-[12px] sm:text-[13px] text-[#56423C] dark:text-[#C5B7B2] leading-relaxed italic">
                "{badge.celebrationNote || badge.description}"
              </p>
            </div>

            {/* 3 Growth Stats Chips */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white dark:bg-[#251E1B] rounded-2xl p-2.5 text-center border border-[#F0E6E4] dark:border-[#382F2C] shadow-2xs">
                <span className="block text-base font-extrabold text-[#D96B43]">
                  {stats.stat1Value || "35.2"}
                </span>
                <span className="block text-[10px] font-medium uppercase tracking-wider text-[#8A726A] dark:text-[#9A8B85] mt-0.5">
                  {stats.stat1Label || "Miles Pedaled"}
                </span>
              </div>
              <div className="bg-white dark:bg-[#251E1B] rounded-2xl p-2.5 text-center border border-[#F0E6E4] dark:border-[#382F2C] shadow-2xs">
                <span className="block text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                  {stats.stat2Value || "175m"}
                </span>
                <span className="block text-[10px] font-medium uppercase tracking-wider text-[#8A726A] dark:text-[#9A8B85] mt-0.5">
                  {stats.stat2Label || "Fresh Air Reset"}
                </span>
              </div>
              <div className="bg-white dark:bg-[#251E1B] rounded-2xl p-2.5 text-center border border-[#F0E6E4] dark:border-[#382F2C] shadow-2xs">
                <span className="block text-base font-extrabold text-[#1F1B1A] dark:text-[#F6ECEA]">
                  {stats.stat3Value || "7 / 7"}
                </span>
                <span className="block text-[10px] font-medium uppercase tracking-wider text-[#8A726A] dark:text-[#9A8B85] mt-0.5">
                  {stats.stat3Label || "Gentle Rhythm"}
                </span>
              </div>
            </div>

            {/* Growth Ring Progress Mini Banner */}
            <div className="px-3.5 py-2.5 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 rounded-2xl flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-sm shrink-0">
                🌱
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  Deep Taproot Tier Progress
                </p>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80">
                  Adds +1 Year Ring to your Habit Canopy
                </p>
              </div>
            </div>

            {/* Personal Reflection Note Card (Interactive Editor) */}
            <div className="p-3.5 bg-white dark:bg-[#241E1C] rounded-2xl border-2 border-[#D96B43]/50 dark:border-[#D96B43]/40 shadow-xs space-y-2.5">
              {/* Header with Editing Indicator */}
              <div className="flex items-center justify-between pb-1.5 border-b border-[#F0E6E4] dark:border-[#382F2C]">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D96B43] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D96B43]" />
                  </span>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-[#D96B43]">
                    Editing Reflection Note
                  </span>
                </div>
                <span className="text-[10px] text-[#8A726A] dark:text-[#9A8B85] font-medium">
                  Prompt: What felt good?
                </span>
              </div>

              {/* Textarea Box */}
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                maxLength={180}
                rows={2}
                placeholder="Record a sensory detail or feeling..."
                className="w-full text-xs text-[#1F1B1A] dark:text-[#F6ECEA] leading-relaxed italic bg-[#FFF8F6] dark:bg-[#1A1615] border border-[#D96B43]/30 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#D96B43]/20 focus:border-[#D96B43] resize-none transition-all placeholder:text-[#8A726A]/70"
              />

              {/* Memory Mood Tag Pills */}
              <div>
                <p className="text-[10px] font-semibold text-[#8A726A] dark:text-[#9A8B85] uppercase tracking-wider mb-1.5">
                  Memory Mood Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_MOOD_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all active:scale-95 flex items-center gap-1 ${
                          isSelected
                            ? "bg-[#EBF3EC] dark:bg-[#203629] border border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300 shadow-2xs font-semibold"
                            : "bg-[#F6ECEA] dark:bg-[#2D2522] hover:bg-[#EAE0DE] border border-[#EAE0DE] dark:border-[#382F2C] text-[#56423C] dark:text-[#A89E97]"
                        }`}
                      >
                        <span>{tag}</span>
                        {isSelected && <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Char count & Save CTA */}
              <div className="flex items-center justify-between pt-2 border-t border-[#F0E6E4] dark:border-[#382F2C]">
                <span className="text-[10px] text-[#8A726A] dark:text-[#9A8B85] font-medium">
                  {reflectionText.length} / 180 chars •{" "}
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    {isSavedNotice ? "Saved to canopy! ✨" : "Auto-saved"}
                  </span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveReflection}
                    className="px-3.5 py-1.5 rounded-full bg-[#D96B43] hover:bg-[#c25a33] active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-[#D96B43]/30 transition-all"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Save Reflection</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Permanent Canopy Toggle Row */}
            <div className="flex items-center justify-between py-2 px-1">
              <span className="text-xs font-semibold text-[#1F1B1A] dark:text-[#F6ECEA]">
                Display on Home Dashboard
              </span>

              {/* Tactile Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={displayOnHome}
                onClick={() => setDisplayOnHome((prev) => !prev)}
                className={`w-10 h-6 rounded-full p-0.5 flex items-center transition-colors duration-200 ${
                  displayOnHome ? "bg-emerald-600" : "bg-[#DDBCB1] dark:bg-[#483E3B]"
                }`}
              >
                <motion.div
                  layout
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                    displayOnHome ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Bottom Button */}
          <div className="pt-3 border-t border-[#F0E6E4] dark:border-[#352D2A] mt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-full bg-white dark:bg-[#2C2422] border border-[#EAE0DE] dark:border-[#3D3532] text-xs font-bold text-[#56423C] dark:text-[#D1C4C0] hover:bg-[#F6ECEA] dark:hover:bg-[#342C29] transition-colors"
            >
              Close & Keep Growing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
