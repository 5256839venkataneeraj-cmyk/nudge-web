import React, { useState, useEffect } from "react";
import { Wifi } from "lucide-react";

export const PhoneStatusBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState("9:41");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="h-10 px-6 bg-[#FAF7F5] dark:bg-[#141211] flex items-center justify-between text-xs font-bold text-[#2D2522] dark:text-[#F5EBE6] select-none shrink-0 relative z-40 border-b border-[#FAF7F5] dark:border-[#1C1917] transition-colors"
      aria-label="Phone Status Bar"
    >
      {/* Left: Time */}
      <span className="font-semibold tracking-tight text-[13px]">{timeStr}</span>

      {/* Center: Dynamic Island */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-24 h-5 bg-[#181716] dark:bg-[#201C1A] border border-black/10 dark:border-white/10 rounded-full flex items-center justify-between px-2 shadow-xs">
        <span className="w-2.5 h-2.5 rounded-full bg-[#2A2928] dark:bg-[#383330]" />
        <span className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
      </div>

      {/* Right: Cellular, Wifi, Battery */}
      <div className="flex items-center space-x-1.5 text-[#2D2522] dark:text-[#F5EBE6]">
        {/* Cellular Signal Bars */}
        <div className="flex items-end space-x-0.5 h-3">
          <div className="w-0.5 h-1 bg-current rounded-xs" />
          <div className="w-0.5 h-1.5 bg-current rounded-xs" />
          <div className="w-0.5 h-2 bg-current rounded-xs" />
          <div className="w-0.5 h-2.5 bg-current rounded-xs" />
        </div>

        {/* Wifi */}
        <Wifi className="w-3.5 h-3.5" />

        {/* Battery with 98% Pill */}
        <div className="flex items-center">
          <div className="w-5 h-2.5 rounded-[4px] border border-current p-0.5 flex items-center">
            <div className="w-full h-full bg-current rounded-[1px]" />
          </div>
          <div className="w-0.5 h-1 bg-current rounded-r-xs -ml-[1px]" />
        </div>
      </div>
    </div>
  );
};
