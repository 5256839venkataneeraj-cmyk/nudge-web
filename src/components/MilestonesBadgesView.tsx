import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Sprout,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
  TreeDeciduous,
  Filter,
} from "lucide-react";
import {
  MilestoneBadge,
  getLocalMilestones,
} from "../lib/milestones";
import { UnlockedBadgeModal } from "./UnlockedBadgeModal";

interface MilestonesBadgesViewProps {
  onNavigateBack: () => void;
  onOpenReflection?: () => void;
}

export const MilestonesBadgesView: React.FC<MilestonesBadgesViewProps> = ({
  onNavigateBack,
  onOpenReflection,
}) => {
  const [milestones] = useState<MilestoneBadge[]>(() => getLocalMilestones());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeModalBadge, setActiveModalBadge] = useState<MilestoneBadge | null>(null);

  const unlockedCount = milestones.filter((m) => m.isUnlocked).length;
  const totalCount = milestones.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const filteredBadges = milestones.filter((b) => {
    if (selectedCategory === "all") return true;
    return b.category === selectedCategory;
  });

  return (
    <div className="h-full overflow-y-auto font-sans w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CAEBD1] dark:bg-[#486551]/30 text-[#042011] dark:text-[#CAEBD1] text-xs font-bold">
            <Sprout className="w-3.5 h-3.5 text-[#314D3A] dark:text-[#CAEBD1]" />
            <span>Growth Journal</span>
          </div>

          <button
            onClick={onNavigateBack}
            className="inline-flex items-center gap-1 text-[#56423C] dark:text-[#A89E97] hover:text-[#9D3E1A] dark:hover:text-[#FFB59C] text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F1B1A] dark:text-[#F6ECEA]">
          Milestones & Badges
        </h1>
        <p className="text-xs sm:text-sm text-[#56423C] dark:text-[#B5A49F] leading-relaxed">
          Gentle growth over time. Badges rooted in consistency, not streaks to stress over.
        </p>
      </div>

      {/* Stage Card (Flourishing Seedling) */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#201B1A] p-5 sm:p-6 shadow-sm border border-[#EAE0DE] dark:border-[#382F2C]">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#CAEBD1]/40 dark:bg-[#486551]/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#486551] dark:text-[#AECEB6] uppercase tracking-wider">
                Current Stage
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#1F1B1A] dark:text-[#F6ECEA] mt-0.5">
                Level 3: Flourishing Seedling
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#CAEBD1] dark:bg-[#486551]/40 flex items-center justify-center text-2xl shadow-xs">
              🪴
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#1F1B1A] dark:text-[#F6ECEA]">
                {unlockedCount} of {totalCount} Milestones Rooted
              </span>
              <span className="font-bold text-[#486551] dark:text-[#AECEB6]">
                {progressPercent}% Nourished
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#F6ECEA] dark:bg-[#2C2422] overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[#486551] to-[#6C8A74]"
              />
            </div>
          </div>

          {/* Stage Subtitle */}
          <div className="flex items-center gap-2 pt-1 border-t border-[#F0E6E4] dark:border-[#382F2C] text-xs text-[#56423C] dark:text-[#A89E97]">
            <Sparkles className="w-3.5 h-3.5 text-[#D96B43]" />
            <span>
              2 more badges to unfurl <strong className="text-[#1F1B1A] dark:text-[#F6ECEA]">Deep Taproot</strong> tier.
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { id: "all", label: "All Milestones" },
          { id: "habits", label: "Habits & Rhythm" },
          { id: "study", label: "Study Cadence" },
          { id: "wellness", label: "Rest & Wellness" },
          { id: "mindset", label: "Mindset Reset" },
        ].map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-[#9D3E1A] text-white shadow-xs"
                  : "bg-white dark:bg-[#24201E] text-[#56423C] dark:text-[#A89E97] border border-[#EAE0DE] dark:border-[#382F2C] hover:bg-[#F6ECEA] dark:hover:bg-[#2D2724]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredBadges.map((badge) => {
          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveModalBadge(badge)}
              className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                badge.isUnlocked
                  ? "bg-white dark:bg-[#201B1A] border-[#EAE0DE] dark:border-[#382F2C] shadow-xs hover:border-[#D96B43]/50"
                  : "bg-[#F6ECEA]/60 dark:bg-[#1A1615] border-dashed border-[#DDBCB1] dark:border-[#342C2A] opacity-75"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-2xs ${
                      badge.isUnlocked
                        ? "bg-[#FFDBCF]/60 dark:bg-[#9D3E1A]/20"
                        : "bg-[#EAE0DE] dark:bg-[#282220] grayscale"
                    }`}
                  >
                    {badge.icon}
                  </div>
                  {badge.isUnlocked && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#CAEBD1] text-[#042011] flex items-center justify-center text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-[#314D3A]" />
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    badge.isUnlocked
                      ? "bg-[#CAEBD1] dark:bg-[#486551]/30 text-[#042011] dark:text-[#CAEBD1]"
                      : "bg-[#EAE0DE] dark:bg-[#2A2422] text-[#70645D] dark:text-[#8E827D]"
                  }`}
                >
                  {badge.isUnlocked ? "Rooted" : "In Progress"}
                </span>
              </div>

              <div className="mt-3 space-y-1">
                <h3 className="font-bold text-sm text-[#1F1B1A] dark:text-[#F6ECEA] flex items-center gap-1.5">
                  <span>{badge.title}</span>
                  {!badge.isUnlocked && <Lock className="w-3 h-3 text-[#8A726A]" />}
                </h3>
                <p className="text-xs text-[#56423C] dark:text-[#A89E97] line-clamp-2">
                  {badge.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#F0E6E4] dark:border-[#2C2422] flex items-center justify-between text-[11px]">
                <span className="text-[#8A726A] dark:text-[#8E827D]">
                  {badge.progressText}
                </span>
                {badge.isUnlocked && (
                  <span className="text-[#9D3E1A] dark:text-[#FFB59C] font-semibold">
                    View Celebration →
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Unlocked Celebration Modal */}
      <UnlockedBadgeModal
        badge={activeModalBadge}
        isOpen={Boolean(activeModalBadge)}
        onClose={() => setActiveModalBadge(null)}
        onOpenReflection={onOpenReflection}
      />
    </div>
  );
};
