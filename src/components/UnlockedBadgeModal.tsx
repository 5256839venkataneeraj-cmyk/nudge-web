import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Check, Share2, Sprout } from "lucide-react";
import { MilestoneBadge } from "../lib/milestones";

interface UnlockedBadgeModalProps {
  badge: MilestoneBadge | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReflection?: () => void;
}

export const UnlockedBadgeModal: React.FC<UnlockedBadgeModalProps> = ({
  badge,
  isOpen,
  onClose,
  onOpenReflection,
}) => {
  if (!isOpen || !badge) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop with warm blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#2D2522]/50 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="relative w-full max-w-sm bg-[#FFF8F6] dark:bg-[#1E1917] rounded-3xl p-6 shadow-2xl border border-[#F0E6E4] dark:border-[#382F2C] overflow-hidden z-10"
        >
          {/* Gentle background radiant auras */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#FFDBCF]/40 dark:bg-[#A33C1B]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-[#CAEBD1]/35 dark:bg-[#486551]/15 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-[#2C2422] text-[#70645D] dark:text-[#A89E97] hover:text-[#2D2522] dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Pill */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CAEBD1] dark:bg-[#486551]/30 text-[#042011] dark:text-[#CAEBD1] text-[11px] font-bold tracking-wide uppercase">
              <Sprout className="w-3 h-3 text-[#314D3A] dark:text-[#CAEBD1]" />
              {badge.tier.toUpperCase()} MILESTONE ROOTED
            </span>
          </div>

          {/* Radiant Hero Badge Emblem with Concentric Rings */}
          <div className="relative flex items-center justify-center my-6">
            {/* Concentric radiant pulsing rings */}
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.35, 0.6, 0.35] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="absolute w-36 h-36 rounded-full bg-[#FFDBCF]/50 dark:bg-[#A33C1B]/25"
            />
            <motion.div
              animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.45, 0.2] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
              className="absolute w-44 h-44 rounded-full bg-[#CAEBD1]/40 dark:bg-[#486551]/20"
            />

            {/* Core Badge Disc */}
            <motion.div
              initial={{ rotate: -15, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#9D3E1A] to-[#D96B43] flex items-center justify-center shadow-[0_12px_28px_-6px_rgba(157,62,26,0.35)]"
            >
              <span className="text-4xl select-none">{badge.icon}</span>

              {/* Decorative mini leaf sprout */}
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#CAEBD1] text-[#042011] flex items-center justify-center shadow-xs border border-white dark:border-[#1E1917]">
                <Sprout className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          </div>

          {/* Badge Title & Description */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-extrabold text-[#1F1B1A] dark:text-[#F6ECEA] tracking-tight">
              {badge.title}
            </h3>
            <p className="text-xs text-[#56423C] dark:text-[#B5A49F] leading-relaxed px-2">
              {badge.description}
            </p>

            {/* Celebration Note Block */}
            <div className="mt-3 p-3 rounded-2xl bg-white/70 dark:bg-[#282220] border border-[#EAE0DE] dark:border-[#3A322F] text-left">
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#9D3E1A] dark:text-[#FFB59C]">
                <Sparkles className="w-3 h-3 text-[#D96B43]" />
                <span>Nudge Grounding Reflection</span>
              </div>
              <p className="text-[11px] text-[#70645D] dark:text-[#A89E97] mt-1 italic">
                "{badge.celebrationNote}"
              </p>
              {badge.unlockedAt && (
                <div className="mt-2 text-[10px] text-[#8A726A] dark:text-[#9A8B85] flex items-center justify-between border-t border-[#F0E6E4] dark:border-[#382F2C] pt-1.5">
                  <span>Rooted in consistency</span>
                  <span className="font-medium">{badge.unlockedAt}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 space-y-2">
            {onOpenReflection && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onClose();
                  onOpenReflection();
                }}
                className="w-full py-3 px-4 rounded-full bg-[#9D3E1A] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(157,62,26,0.3)] hover:bg-[#BD5630] transition-colors"
              >
                <span>Add Reflection Note</span>
                <Check className="w-3.5 h-3.5" />
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-full bg-white dark:bg-[#2C2422] border border-[#EAE0DE] dark:border-[#3D3532] text-xs font-semibold text-[#56423C] dark:text-[#D1C4C0] hover:bg-[#F6ECEA] dark:hover:bg-[#342C29] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Keep Growing</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
