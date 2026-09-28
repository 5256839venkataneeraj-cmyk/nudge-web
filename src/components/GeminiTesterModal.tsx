import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Database,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  Key,
} from "lucide-react";
import { sendPromptToGeminiRoute } from "../lib/api";
import { MarkdownContent } from "./MarkdownContent";

interface GeminiTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_PROMPTS = [
  "Break down my Bioethics case study into three 20-minute action steps.",
  "Give me a quick 2-minute mindful breathing exercise for study anxiety.",
  "Generate a quick 3-question diagnostic quiz for Organic Chemistry lab.",
];

export const GeminiTesterModal: React.FC<GeminiTesterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("nudge_gemini_api_key") || ""
  );
  const [showKeyInput, setShowKeyInput] = useState(false);

  interface ResultState {
    model: string;
    output: string;
    durationMs?: number;
    loggedToSupabase?: boolean;
    timestamp?: string;
    error?: string;
  }

  const [result, setResult] = useState<ResultState | null>(null);

  const handleSaveKey = (val: string) => {
    setApiKey(val);
    if (val.trim()) {
      localStorage.setItem("nudge_gemini_api_key", val.trim());
    } else {
      localStorage.removeItem("nudge_gemini_api_key");
    }
  };

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend ?? prompt).trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    setResult(null);

    try {
      const data = await sendPromptToGeminiRoute(
        q,
        "You are Nudge, an empathetic academic copilot for university students. Be concise, highly actionable, and warm.",
        apiKey || undefined
      );

      setResult({
        model: data.model || "gemini-3.7-flash",
        output: data.output,
        durationMs: data.durationMs,
        loggedToSupabase: data.loggedToSupabase,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      });
    } catch (err: any) {
      setResult({
        model: "gemini-3.7-flash",
        output: "",
        error: err?.message || "Failed to communicate with /api/gemini wrapper.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-xl bg-[#FAF8F5] rounded-3xl border border-[#E7DFD7] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#EAE2DA] bg-[#F4EFEA]/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#A33C1B] text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[#2D2522]">
                    Gemini 3.7 API Wrapper
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E2F0E7] text-[#245D3A] border border-[#C6E4CE]">
                    Route: /api/gemini
                  </span>
                </div>
                <p className="text-xs text-[#70645D]">
                  Modern <code className="font-mono text-[11px]">@google/genai</code> SDK + Supabase Audit Logging
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#70645D] hover:bg-white hover:text-[#2D2522] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            {/* Optional API Key Input drawer */}
            <div className="bg-white/80 rounded-2xl p-3 border border-[#EAE2DA] shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#70645D]">
                  <Key className="w-3.5 h-3.5 text-[#A33C1B]" />
                  <span>
                    API Key:{" "}
                    <strong>
                      {apiKey
                        ? `Configured (${apiKey.slice(0, 6)}...${apiKey.slice(-4)})`
                        : "Using Server Environment (process.env.GEMINI_API_KEY)"}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className="text-xs text-[#A33C1B] font-semibold hover:underline"
                >
                  {showKeyInput ? "Hide" : "Override Key"}
                </button>
              </div>

              {showKeyInput && (
                <div className="mt-2.5 pt-2.5 border-t border-[#F0EAE4] flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => handleSaveKey(e.target.value)}
                    placeholder="Enter Google AI Studio API Key (AIzaSy...)"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[#D9CEC6] bg-[#FAF8F5] text-xs text-[#2D2522] outline-none focus:border-[#A33C1B]"
                  />
                  {apiKey && (
                    <button
                      type="button"
                      onClick={() => handleSaveKey("")}
                      className="px-2.5 py-1.5 text-xs text-[#70645D] bg-[#F0EAE4] hover:bg-[#E4DCD5] rounded-xl font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Test Prompt Chips */}
            <div>
              <div className="text-[11px] font-bold text-[#8F827A] uppercase tracking-wider mb-2">
                Quick Test Prompts
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(sample);
                      handleSend(sample);
                    }}
                    className="text-left text-xs px-3 py-1.5 rounded-full bg-white hover:bg-[#FCEEEA] text-[#5C5049] hover:text-[#A33C1B] border border-[#E8DFD7] transition-all"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input Form */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#2D2522]">
                Custom Prompt for <span className="text-[#A33C1B]">gemini-3.7-flash</span>:
              </label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask anything or test prompt output..."
                  rows={3}
                  className="w-full p-3.5 rounded-2xl border border-[#D9CEC6] bg-white text-xs sm:text-sm text-[#2D2522] outline-none focus:border-[#A33C1B] focus:ring-2 focus:ring-[#A33C1B]/10 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={!prompt.trim() || isLoading}
                  onClick={() => handleSend()}
                  className="absolute right-2.5 bottom-3 px-3 py-1.5 rounded-xl bg-[#A33C1B] hover:bg-[#882F13] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
              <div className="text-[11px] text-[#8F827A] flex items-center justify-between px-1">
                <span>Press Ctrl + Enter to generate</span>
                <span>Calls <code className="font-mono">app/api/gemini/route.ts</code></span>
              </div>
            </div>

            {/* Result Display */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-4 border ${
                  result.error
                    ? "bg-rose-50/80 border-rose-200 text-rose-900"
                    : "bg-white border-[#E8DFD7] text-[#2D2522]"
                } shadow-xs space-y-3`}
              >
                {/* Meta stats bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#F0EAE4] text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold text-[#2D2522]">
                      <Cpu className="w-3.5 h-3.5 text-[#A33C1B]" />
                      {result.model}
                    </span>
                    {result.durationMs !== undefined && (
                      <span className="flex items-center gap-1 text-[#70645D]">
                        <Clock className="w-3.5 h-3.5" />
                        {result.durationMs}ms
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        result.loggedToSupabase
                          ? "bg-[#E2F0E7] text-[#245D3A]"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      <Database className="w-3 h-3" />
                      {result.loggedToSupabase
                        ? "Logged to Supabase (gemini_logs)"
                        : "Audit Logged (Local Fallback)"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                {result.error ? (
                  <div className="flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Execution Error:</div>
                      <div className="text-rose-700 mt-0.5">{result.error}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm leading-relaxed max-h-60 overflow-y-auto pr-1">
                    <MarkdownContent content={result.output} isAssistant={true} />
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 sm:p-4 border-t border-[#EAE2DA] bg-[#F4EFEA]/80 flex items-center justify-between text-xs text-[#70645D]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Handler: <code className="font-mono text-[#2D2522]">app/api/gemini/route.ts</code></span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#EAE2DA] text-[#2D2522] font-semibold border border-[#D9CEC6] transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
