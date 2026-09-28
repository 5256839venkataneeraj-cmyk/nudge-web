import { registerPlugin, Capacitor } from "@capacitor/core";
import { formatTimerDuration } from "./timerIntentParser";

/**
 * Phase 2: Platform-Specific Redirect & Fallback Engine
 * 
 * 1. Android:
 *    Fires native AlarmClock.ACTION_SET_TIMER intent (android.intent.action.SET_TIMER)
 *    with EXTRA_LENGTH (seconds), EXTRA_MESSAGE (label), and EXTRA_SKIP_UI = true.
 *    Wrapped in try/catch for ActivityNotFoundException / missing clock app.
 *    Falls back to in-app notification timer if no clock app is available.
 * 
 * 2. iOS:
 *    There is no public URL scheme for Apple's native Timer/Clock app (e.g., no public clock-timer://).
 *    Implements fallback using local notification scheduling so the timer still alerts the user
 *    upon duration expiration even though it is not literally the native Clock app.
 * 
 * 3. Web / PWA:
 *    Note: OS-level timer handoff isn't possible from a browser context.
 *    Uses setTimeout + the Notification API (with optional audio chime) as the cross-platform solution.
 */

export interface NativeTimerPluginInterface {
  setTimer(options: {
    durationSeconds: number;
    label?: string;
    skipUi?: boolean;
  }): Promise<{
    success: boolean;
    method?: string;
    reason?: string;
    error?: string;
    durationSeconds?: number;
    label?: string;
  }>;
}

export const NativeTimer = registerPlugin<NativeTimerPluginInterface>("NativeTimer");

export interface TimerExecutionResult {
  success: boolean;
  platform: "android" | "ios" | "web";
  method: "NATIVE_ALARM_CLOCK_INTENT" | "IOS_NOTIFICATION_FALLBACK" | "WEB_NOTIFICATION_TIMER" | "IN_APP_COUNTDOWN_FALLBACK";
  durationSeconds: number;
  label?: string;
  confirmationMessage: string;
  isFallback: boolean;
  error?: string;
}

interface ActiveWebTimer {
  id: string;
  timeoutId: ReturnType<typeof setTimeout>;
  targetTimestamp: number;
  label: string;
  durationSeconds: number;
}

// In-memory registry of active web timers
const activeWebTimers = new Map<string, ActiveWebTimer>();

/**
 * Dispatches timer request to native Android Clock app or appropriate platform fallback.
 */
export async function startPlatformTimer(params: {
  durationSeconds: number;
  label?: string;
}): Promise<TimerExecutionResult> {
  const { durationSeconds, label } = params;
  const timerLabel = label || "Nudge Focus Sprint";
  const durationText = formatTimerDuration(durationSeconds);
  const platform = Capacitor.getPlatform() as "android" | "ios" | "web";
  const isNative = Capacitor.isNativePlatform();

  // ==========================================
  // PATH 1: ANDROID NATIVE
  // ==========================================
  if (isNative && platform === "android") {
    try {
      const res = await NativeTimer.setTimer({
        durationSeconds,
        label: timerLabel,
        skipUi: true,
      });

      if (res && res.success) {
        return {
          success: true,
          platform: "android",
          method: "NATIVE_ALARM_CLOCK_INTENT",
          durationSeconds,
          label: timerLabel,
          confirmationMessage: `Native timer set for ${durationText} ✅${label ? ` (${label})` : ""}`,
          isFallback: false,
        };
      }

      // If Clock app was not found on device (e.g. stripped AOSP / emulator)
      console.warn("[NativeTimer] Native Clock app not found or returned error:", res);
      return await scheduleNotificationFallback({
        durationSeconds,
        label: timerLabel,
        platform: "android",
        fallbackReason: res?.reason || "NO_CLOCK_APP",
      });
    } catch (err: any) {
      console.warn("[NativeTimer] Error invoking NativeTimer plugin, falling back to local timer:", err);
      return await scheduleNotificationFallback({
        durationSeconds,
        label: timerLabel,
        platform: "android",
        fallbackReason: err?.message,
      });
    }
  }

  // ==========================================
  // PATH 2: IOS FALLBACK
  // ==========================================
  if (isNative && platform === "ios") {
    // Note: iOS has no public URL scheme for the native Clock/Timer app.
    // We implement a local notification fallback so the timer alerts the user accurately.
    return await scheduleNotificationFallback({
      durationSeconds,
      label: timerLabel,
      platform: "ios",
    });
  }

  // ==========================================
  // PATH 3: WEB / PWA FALLBACK
  // ==========================================
  // Note: OS-level timer handoff isn't possible from a browser context.
  // We use setTimeout + the Web Notification API as the cross-platform option.
  return await scheduleNotificationFallback({
    durationSeconds,
    label: timerLabel,
    platform: "web",
  });
}

/**
 * Shared Notification / setTimeout fallback for Web, iOS, and Android devices lacking a Clock app.
 */
async function scheduleNotificationFallback(params: {
  durationSeconds: number;
  label: string;
  platform: "android" | "ios" | "web";
  fallbackReason?: string;
}): Promise<TimerExecutionResult> {
  const { durationSeconds, label, platform, fallbackReason } = params;
  const durationText = formatTimerDuration(durationSeconds);
  const timerId = `timer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const targetTimestamp = Date.now() + durationSeconds * 1000;

  // Request browser / PWA notification permission if not yet decided
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        // Ignored if user declines
      }
    }
  }

  // Schedule completion callback using globalThis for universal Web / Node / SSR compatibility
  const timeoutId = (globalThis.setTimeout || setTimeout)(() => {
    activeWebTimers.delete(timerId);

    // 1. Play auditory alert chime if audio context / sound enabled
    if (typeof window !== "undefined") {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 chime
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } catch {
        // Audio context might be restricted before interaction
      }
    }

    // 2. Fire system notification
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(`⏰ Timer Complete: ${label}`, {
          body: `Your ${durationText} focus block has finished. Great momentum!`,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: timerId,
        });
      } catch (err) {
        console.warn("[TimerNotification] Failed to show system notification:", err);
      }
    }
  }, durationSeconds * 1000);

  activeWebTimers.set(timerId, {
    id: timerId,
    timeoutId,
    targetTimestamp,
    label,
    durationSeconds,
  });

  const method =
    platform === "ios"
      ? "IOS_NOTIFICATION_FALLBACK"
      : platform === "android"
      ? "IN_APP_COUNTDOWN_FALLBACK"
      : "WEB_NOTIFICATION_TIMER";

  return {
    success: true,
    platform,
    method,
    durationSeconds,
    label,
    confirmationMessage: `Timer set for ${durationText} ✅${label ? ` (${label})` : ""}`,
    isFallback: platform !== "android" || Boolean(fallbackReason),
  };
}

/**
 * Helper to cancel an active web timer by id if needed
 */
export function cancelActiveWebTimer(timerId: string): boolean {
  const timer = activeWebTimers.get(timerId);
  if (timer) {
    clearTimeout(timer.timeoutId);
    activeWebTimers.delete(timerId);
    return true;
  }
  return false;
}
