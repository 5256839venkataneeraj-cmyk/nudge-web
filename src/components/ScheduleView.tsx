import React, { useState } from "react";
import {
  Sparkles,
  AlertCircle,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  X,
  ExternalLink,
  Download,
  Settings,
  Plus,
} from "lucide-react";
import {
  ScheduleEvent,
  GoogleCalendarConfig,
  getGoogleCalendarConfig,
  saveGoogleCalendarConfig,
  buildGoogleCalendarUrl,
  downloadICSFile,
} from "../lib/googleCalendar";
import { GoogleCalendarModal } from "./GoogleCalendarModal";

interface ScheduleViewProps {
  onNavigateToChat: () => void;
  onOpenAddAssignment?: () => void;
}

const SCHEDULE_EVENTS: ScheduleEvent[] = [
  {
    id: "evt-calculus",
    title: "Calculus (MATH 201): Multivariable Review",
    timeSlot: "09:00 AM",
    startTime: "09:30",
    endTime: "10:45",
    category: "Class",
    location: "Math Building, Hall 102",
    description: "Lecture on double integrals, flux gradients, and Green's theorem",
    notes: "Math Building, Hall 102 • Prof. Vance",
  },
  {
    id: "evt-engineering",
    title: "Basic Engineering: Statics & Free-Body Sprint",
    timeSlot: "11:00 AM",
    startTime: "11:15",
    endTime: "12:00",
    category: "Focus",
    location: "Engineering Lab 3",
    description: "Truss equilibrium problems and shear moment calculations",
    notes: "Planned by Nudge Smart Timer 45m focus block",
  },
  {
    id: "evt-lunch-cycle",
    title: "Lunch & Campus Fresh Air Loop",
    timeSlot: "12:00 PM",
    startTime: "12:30",
    endTime: "13:15",
    category: "Recharge",
    location: "Campus Green & Student Center",
    description: "Gentle mental reset and active break before Chem Lab",
  },
  {
    id: "evt-chem-lab",
    title: "Applied Chemistry (CHEM 102): Thermodynamics",
    timeSlot: "02:00 PM",
    startTime: "14:00",
    endTime: "15:30",
    category: "Lab",
    location: "Science Complex 402",
    description: "Weekly reaction kinetics & Nernst potential analysis.",
  },
  {
    id: "evt-python-lab",
    title: "Python (CS 105): Pandas & Data Automation",
    timeSlot: "04:00 PM",
    startTime: "16:00",
    endTime: "17:00",
    category: "Focus",
    location: "Library Silent Room 204",
    description: "Dataframe transformations & matrix math.",
  },
];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  onNavigateToChat,
  onOpenAddAssignment,
}) => {
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [selectedDay, setSelectedDay] = useState(25);
  const [showInsight, setShowInsight] = useState(true);
  const [gcalConfig, setGcalConfig] = useState<GoogleCalendarConfig>(() =>
    getGoogleCalendarConfig()
  );
  const [isGCalModalOpen, setIsGCalModalOpen] = useState(false);
  const [syncedEvents, setSyncedEvents] = useState<Record<string, boolean>>({});

  const days = [
    { label: "Mon", date: 23 },
    { label: "Tue", date: 24 },
    { label: "TODAY", date: 25, isToday: true },
    { label: "Thu", date: 26 },
    { label: "Fri", date: 27 },
  ];

  const handleSaveConfig = (updated: GoogleCalendarConfig) => {
    setGcalConfig(updated);
    saveGoogleCalendarConfig(updated);
  };

  const handleSyncSingleEvent = (evt: ScheduleEvent) => {
    setSyncedEvents((prev) => ({ ...prev, [evt.id]: true }));
    const url = buildGoogleCalendarUrl(evt, `2026-09-${selectedDay}`);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="h-full overflow-y-auto bg-[#FAF8F5] dark:bg-[#141211] px-3 sm:px-6 py-4 text-[#2D2522] dark:text-[#F5EBE6] font-sans w-full max-w-xl mx-auto space-y-3.5 sm:space-y-4 pb-28 box-border overflow-x-hidden">
      {/* 1. Day View / Week View Pill Toggle */}
      <div className="bg-[#EFEAE5] dark:bg-[#24201E] p-1 rounded-full flex items-center max-w-xs mx-auto border border-[#E2D8D0] dark:border-[#332C29]">
        <button
          onClick={() => setViewMode("day")}
          className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
            viewMode === "day"
              ? "bg-white dark:bg-[#1C1917] text-[#2D2522] dark:text-[#F5EBE6] shadow-xs"
              : "text-[#70645D] dark:text-[#A89B95]"
          }`}
        >
          Day View
        </button>
        <button
          onClick={() => setViewMode("week")}
          className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
            viewMode === "week"
              ? "bg-white dark:bg-[#1C1917] text-[#2D2522] dark:text-[#F5EBE6] shadow-xs"
              : "text-[#70645D] dark:text-[#A89B95]"
          }`}
        >
          Week View
        </button>
      </div>

      {/* 2. Date Selector Bar */}
      <div className="flex items-center justify-between gap-1 sm:gap-2 pt-1 w-full max-w-full">
        {days.map((d) => (
          <button
            key={d.date}
            onClick={() => setSelectedDay(d.date)}
            className={`flex-1 min-w-0 py-2 sm:py-2.5 px-0.5 sm:px-1 rounded-2xl flex flex-col items-center transition-all ${
              d.isToday
                ? "bg-[#A33C1B] dark:bg-[#E07A5F] text-white shadow-md ring-2 ring-[#A33C1B]/30"
                : "bg-white dark:bg-[#1C1917] text-[#2D2522] dark:text-[#F5EBE6] border border-[#E9DFD7] dark:border-[#332C29]"
            }`}
          >
            <span
              className={`text-[9.5px] sm:text-[10px] font-bold ${
                d.isToday ? "text-[#FCEEEA] dark:text-[#2D1B14]" : "text-[#8A7D75] dark:text-[#A89B95]"
              }`}
            >
              {d.label}
            </span>
            <span className="text-sm sm:text-base font-bold mt-0.5">{d.date}</span>
            {d.isToday && <span className="w-1 h-1 rounded-full bg-white mt-0.5 sm:mt-1" />}
          </button>
        ))}
      </div>

      {/* 3. Google Calendar Connected Sync Banner */}
      <div className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-[#1C1917] border border-[#EAE2DA] dark:border-[#332C29] shadow-sm flex items-center justify-between gap-2 sm:gap-3 w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FAF8F5] dark:bg-[#24201E] border border-[#EAE2DA] dark:border-[#3D3430] flex items-center justify-center shrink-0 shadow-2xs">
            {/* Google Calendar Multi-color G */}
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-[#2D2522] dark:text-[#F5EBE6] truncate">
                Google Calendar
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                Connected
              </span>
            </div>
            <p className="text-[10.5px] sm:text-[11px] text-[#70645D] dark:text-[#A89B95] truncate max-w-[130px] xs:max-w-[200px] sm:max-w-none">
              {gcalConfig.userEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {onOpenAddAssignment && (
            <button
              onClick={onOpenAddAssignment}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#9D3E1A] hover:bg-[#BD5630] text-[11px] sm:text-xs font-bold text-white flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
              title="Add New Assignment or Task"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}

          <button
            onClick={() => setIsGCalModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#FCEEEA] dark:bg-[#2D1B14] hover:bg-[#F9DDD5] text-[11px] sm:text-xs font-bold text-[#A33C1B] dark:text-[#E07A5F] flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
            title="Google Calendar Sync Settings"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 4. Nudge Insight Banner */}
      {showInsight && (
        <div className="bg-[#FCEEEA] dark:bg-[#2D1B14] border border-[#F6D5CB] dark:border-[#4D2D20] rounded-3xl p-3.5 sm:p-4 flex items-start justify-between gap-2 shadow-xs w-full max-w-full overflow-hidden">
          <div className="flex items-start space-x-2.5 sm:space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-[#A33C1B] dark:bg-[#E07A5F] text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-[#A33C1B] dark:text-[#E07A5F] uppercase tracking-wider">
                NUDGE INSIGHT • Just now
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#2D2522] dark:text-[#F5EBE6] mt-0.5 break-words">
                Nudge optimized your afternoon for maximum focus!
              </div>
              <p className="text-xs text-[#70645D] dark:text-[#A89B95] mt-1 leading-relaxed break-words">
                Buffered 30 mins after Chem Lab to prevent cognitive burnout.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInsight(false)}
            className="text-[#8A7D75] dark:text-[#A89B95] hover:text-[#2D2522] dark:hover:text-[#F5EBE6] p-1 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5. Urgent Quiz Due Tonight Banner */}
      <div className="bg-[#FBEAE9] dark:bg-[#321614] border border-[#F5CAC7] dark:border-[#522320] rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
            !
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm text-rose-950 dark:text-rose-100">
              Psych 101 Quiz Due Tonight
            </div>
            <div className="text-[11px] text-rose-800 dark:text-rose-300">
              11:59 PM • Canvas Portal
            </div>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-[#201312] text-rose-700 dark:text-rose-300 text-[10px] font-bold border border-rose-200 dark:border-rose-900">
          Urgent
        </span>
      </div>

      {/* 6. Schedule Timeline with Direct Google Calendar Actions */}
      <div className="space-y-4 pt-1">
        {SCHEDULE_EVENTS.map((evt) => {
          const isSynced = syncedEvents[evt.id];
          const isFocus = evt.category === "Focus";
          const isRecharge = evt.category === "Recharge";

          return (
            <div key={evt.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8A7D75] dark:text-[#A89B95] block">
                  {evt.timeSlot}
                </span>

                {/* Google Calendar quick action button */}
                <button
                  onClick={() => handleSyncSingleEvent(evt)}
                  className={`text-[11px] font-bold flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg ${
                    isSynced
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                      : "text-[#70645D] dark:text-[#A89B95] hover:text-[#A33C1B] dark:hover:text-[#E07A5F] hover:bg-white dark:hover:bg-[#1C1917]"
                  }`}
                  title={
                    isSynced
                      ? "Event sent to Google Calendar"
                      : "Add this block to Google Calendar"
                  }
                >
                  {isSynced ? (
                    <>
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>In GCal</span>
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="w-3 h-3" />
                      <span>Add to GCal</span>
                    </>
                  )}
                </button>
              </div>

              <div
                className={`rounded-3xl p-4 border shadow-xs transition-all ${
                  isFocus
                    ? "bg-gradient-to-r from-[#FCEEEA] to-[#F9E2DB] dark:from-[#2D1B14] dark:to-[#251711] border-[#F4D1C5] dark:border-[#4D2D20]"
                    : isRecharge
                    ? "bg-[#EDF6F0] dark:bg-[#18261E] border-[#D5EAD9] dark:border-[#223B2C]"
                    : "bg-white dark:bg-[#1C1917] border-[#EAE2DA] dark:border-[#332C29]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isFocus
                          ? "bg-[#A33C1B] dark:bg-[#E07A5F] text-white"
                          : isRecharge
                          ? "bg-[#E2F0E7] dark:bg-[#1F3E2B] text-[#245D3A] dark:text-[#88B998]"
                          : "bg-[#EBE8F7] dark:bg-[#252238] text-[#4A4382] dark:text-[#A8A2D8]"
                      }`}
                    >
                      {evt.category}
                    </span>
                    {isFocus && (
                      <span className="text-xs font-semibold text-[#A33C1B] dark:text-[#E07A5F]">
                        Planned by Nudge
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#70645D] dark:text-[#A89B95] font-medium">
                    {evt.startTime} – {evt.endTime}
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-[#2D2522] dark:text-[#F5EBE6]">
                  {evt.title}
                </h3>

                <p className="text-xs text-[#70645D] dark:text-[#A89B95] mt-1">
                  {evt.description}
                </p>

                {evt.location && (
                  <div className="text-xs text-[#70645D] dark:text-[#A89B95] flex items-center gap-1 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#A33C1B] dark:text-[#E07A5F] shrink-0" />
                    <span className="truncate">{evt.location}</span>
                  </div>
                )}

                {/* Focus Card Bottom Chat/Timer Bar */}
                {isFocus && (
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F2C9BD] dark:border-[#4D2D20]">
                    <span className="text-xs font-medium text-[#A33C1B] dark:text-[#E07A5F] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#A33C1B] dark:bg-[#E07A5F] animate-pulse" />
                      Smart Timer 45m
                    </span>
                    <button
                      onClick={onNavigateToChat}
                      className="px-3.5 py-1 rounded-full bg-white dark:bg-[#1C1917] text-[#A33C1B] dark:text-[#E07A5F] text-xs font-bold shadow-xs hover:bg-[#FAF7F5] dark:hover:bg-[#24201E] border border-[#F2C9BD] dark:border-[#4D2D20] transition-colors"
                    >
                      Chat Nudge
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Google Calendar Settings & Batch Sync Modal */}
      <GoogleCalendarModal
        isOpen={isGCalModalOpen}
        onClose={() => setIsGCalModalOpen(false)}
        config={gcalConfig}
        onSaveConfig={handleSaveConfig}
        events={SCHEDULE_EVENTS}
        selectedDateStr={`2026-09-${selectedDay}`}
      />
    </div>
  );
};
