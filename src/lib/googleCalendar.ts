export interface ScheduleEvent {
  id: string;
  title: string;
  timeSlot: string; // e.g. "09:00 AM"
  startTime: string; // "09:30"
  endTime: string; // "10:45"
  category: "Class" | "Focus" | "Recharge" | "Lab" | "Assignment";
  location: string;
  description: string;
  notes?: string;
  date?: string; // YYYY-MM-DD
}

export interface GoogleCalendarConfig {
  isConnected: boolean;
  userEmail: string;
  autoSyncFocusBlocks: boolean;
  defaultRemindersMinutes: number;
}

const GCAL_CONFIG_KEY = "nudge_gcal_config";

export function getGoogleCalendarConfig(): GoogleCalendarConfig {
  try {
    const raw = localStorage.getItem(GCAL_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to load Google Calendar config:", err);
  }
  return {
    isConnected: true,
    userEmail: "maya.student@university.edu",
    autoSyncFocusBlocks: true,
    defaultRemindersMinutes: 15,
  };
}

export function saveGoogleCalendarConfig(config: GoogleCalendarConfig): void {
  try {
    localStorage.setItem(GCAL_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn("Failed to save Google Calendar config:", err);
  }
}

/**
 * Creates a direct Google Calendar Web Intent URL
 */
export function buildGoogleCalendarUrl(
  event: ScheduleEvent,
  eventDateStr: string = "2026-09-25"
): string {
  const [year, month, day] = eventDateStr.split("-").map(Number);
  const [startH, startM] = event.startTime.split(":").map(Number);
  const [endH, endM] = event.endTime.split(":").map(Number);

  const startDate = new Date(year, month - 1, day, startH, startM);
  const endDate = new Date(year, month - 1, day, endH, endM);

  const formatGCalDate = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d+/g, "");

  const datesParam = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;
  const details = `${event.description}${
    event.notes ? `\n\nNudge Note: ${event.notes}` : ""
  }\n\nGenerated with Nudge Student Accountability`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `[Nudge] ${event.title}`,
    dates: datesParam,
    details: details,
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates an iCalendar (.ics) string for importing into Google Calendar
 */
export function generateICS(events: ScheduleEvent[], eventDateStr: string = "2026-09-25"): string {
  const [year, month, day] = eventDateStr.split("-").map(Number);

  const pad = (n: number) => String(n).padStart(2, "0");
  const formatDateICS = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(
      d.getHours()
    )}${pad(d.getMinutes())}00`;

  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nudge Student Companion//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  events.forEach((evt) => {
    const [startH, startM] = evt.startTime.split(":").map(Number);
    const [endH, endM] = evt.endTime.split(":").map(Number);
    const startDate = new Date(year, month - 1, day, startH, startM);
    const endDate = new Date(year, month - 1, day, endH, endM);

    ics.push(
      "BEGIN:VEVENT",
      `UID:${evt.id}-${eventDateStr}@nudge.app`,
      `DTSTAMP:${formatDateICS(new Date())}Z`,
      `DTSTART:${formatDateICS(startDate)}`,
      `DTEND:${formatDateICS(endDate)}`,
      `SUMMARY:[Nudge] ${evt.title}`,
      `DESCRIPTION:${evt.description.replace(/\n/g, "\\n")}`,
      `LOCATION:${evt.location.replace(/,/g, "\\,")}`,
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  });

  ics.push("END:VCALENDAR");
  return ics.join("\r\n");
}

/**
 * Triggers a download of the .ics calendar file
 */
export function downloadICSFile(events: ScheduleEvent[], dateStr: string = "2026-09-25"): void {
  const content = generateICS(events, dateStr);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nudge-schedule-${dateStr}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
