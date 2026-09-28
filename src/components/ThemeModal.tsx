import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sun,
  Moon,
  Smartphone,
  Check,
  X,
  Sparkles,
  Palette,
} from "lucide-react";
import { AppTheme } from "../lib/theme";

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  const isDarkActive =
    currentTheme === "dark" ||
    (currentTheme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const themeOptions: Array<{
    id: AppTheme;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    previewBg: string;
  }> = [
    {
      id: "light",
      label: "Warm Light",
      sublabel: "Warm oat milk & terracotta",
      icon: <Sun className="w-5 h-5 text-amber-500" />,
      previewBg: "bg-[#FAF7F2] border-[#E8DFD5]",
    },
    {
      id: "dark",
      label: "Warm Dark",
      sublabel: "Deep espresso obsidian",
      icon: <Moon className="w-5 h-5 text-[#E07A5F]" />,
      previewBg: "bg-[#141211] border-[#332C29]",
    },
    {
      id: "system",
      label: "System Auto",
      sublabel: "Matches device settings",
      icon: <Smartphone className="w-5 h-5 text-[#70645D]" />,
      previewBg: "bg-gradient-to-r from-[#FAF7F2] to-[#141211] border-[#D9CEC6]",
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-md bg-[#FAF8F5] dark:bg-[#1C1917] rounded-3xl border border-[#E7DFD7] dark:border-[#332C29] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#EAE2DA] dark:border-[#332C29] bg-[#F4EFEA]/80 dark:bg-[#24201E]/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#A33C1B] dark:bg-[#E07A5F] text-white flex items-center justify-center shadow-xs">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[#2D2522] dark:text-[#F5EBE6]">
                    Display & Theme
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FCEEEA] dark:bg-[#2D1B14] text-[#A33C1B] dark:text-[#E07A5F] border border-[#F6D5CB] dark:border-[#4D2D20]">
                    Stitch System
                  </span>
                </div>
                <p className="text-xs text-[#70645D] dark:text-[#A89B95]">
                  Warm tactile minimalism for student focus
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#70645D] dark:text-[#A89B95] hover:bg-white dark:hover:bg-[#2E2824] hover:text-[#2D2522] dark:hover:text-[#F5EBE6] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Theme Selector Grid */}
          <div className="p-4 sm:p-5 space-y-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#8F827A] dark:text-[#A89B95]">
              Theme Preference
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {themeOptions.map((opt) => {
                const isSelected = currentTheme === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onSelectTheme(opt.id)}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all relative ${
                      isSelected
                        ? "bg-white dark:bg-[#24201E] border-[#A33C1B] dark:border-[#E07A5F] shadow-sm ring-2 ring-[#A33C1B]/15"
                        : "bg-white/60 dark:bg-[#1C1917]/60 border-[#EAE2DA] dark:border-[#332C29] hover:bg-white dark:hover:bg-[#24201E]"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#A33C1B] dark:bg-[#E07A5F] text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}

                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FAF8F5] dark:bg-[#141211] shadow-2xs">
                      {opt.icon}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-[#2D2522] dark:text-[#F5EBE6]">
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-[#70645D] dark:text-[#A89B95] leading-tight mt-0.5">
                        {opt.sublabel}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Tactile Switch Row (Matching Stitch screen) */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#24201E] border border-[#EAE2DA] dark:border-[#332C29] flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3 pr-2">
                <div className="w-9 h-9 rounded-full bg-[#FCEEEA] dark:bg-[#35211B] flex items-center justify-center text-[#A33C1B] dark:text-[#E07A5F] shrink-0">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#2D2522] dark:text-[#F5EBE6] block">
                    Warm Dark Mode
                  </span>
                  <p className="text-[11px] text-[#70645D] dark:text-[#A89B95] leading-snug">
                    Deep warm espresso tones to soften glare during late-night study blocks.
                  </p>
                </div>
              </div>

              {/* Toggle switch button */}
              <button
                type="button"
                role="switch"
                aria-checked={isDarkActive}
                onClick={() => onSelectTheme(isDarkActive ? "light" : "dark")}
                className={`w-12 h-7 rounded-full p-0.5 flex items-center transition-colors duration-200 shrink-0 ${
                  isDarkActive
                    ? "bg-[#E07A5F]"
                    : "bg-stone-300 dark:bg-stone-700"
                }`}
              >
                <motion.span
                  layout
                  className={`w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center ${
                    isDarkActive ? "ml-auto text-[#E07A5F]" : "text-stone-500"
                  }`}
                >
                  {isDarkActive ? (
                    <Moon className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Sun className="w-3.5 h-3.5" />
                  )}
                </motion.span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3.5 sm:p-4 border-t border-[#EAE2DA] dark:border-[#332C29] bg-[#F4EFEA]/80 dark:bg-[#24201E]/80 flex items-center justify-between text-xs text-[#70645D] dark:text-[#A89B95]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#A33C1B] dark:text-[#E07A5F]" />
              <span>Synced with Stitch Design System</span>
            </span>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1C1917] hover:bg-[#FAF7F5] dark:hover:bg-[#24201E] text-[#2D2522] dark:text-[#F5EBE6] font-semibold border border-[#D9CEC6] dark:border-[#332C29] shadow-2xs transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
