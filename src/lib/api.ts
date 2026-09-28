import { StudentSnapshot, EdgeFunctionChatResponse, NudgeTone } from "../types";
import { getLocalStudentSnapshot, saveLocalStudentSnapshot } from "./storage";

// Base URL support: Empty string for Web/PWA; configurable for Native Android (e.g. http://10.0.2.2:3000)
export const API_BASE = ((import.meta as any).env?.VITE_API_BASE_URL || "").replace(/\/$/, "");

export async function fetchLiveSnapshot(): Promise<StudentSnapshot> {
  try {
    const res = await fetch(`${API_BASE}/api/supabase/snapshot`);
    if (res.ok) {
      const data = await res.json();
      saveLocalStudentSnapshot(data);
      return data;
    }
  } catch (err) {
    console.warn("[Snapshot] Remote fetch failed, falling back to on-device snapshot cache:", err);
  }
  return getLocalStudentSnapshot();
}

export async function updateLiveSnapshot(patch: Partial<StudentSnapshot>): Promise<StudentSnapshot> {
  const current = getLocalStudentSnapshot();
  const updated: StudentSnapshot = {
    ...current,
    ...patch,
    lastUpdated: new Date().toISOString(),
  };
  saveLocalStudentSnapshot(updated);

  try {
    const res = await fetch(`${API_BASE}/api/supabase/snapshot`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const serverData = await res.json();
      saveLocalStudentSnapshot(serverData);
      return serverData;
    }
  } catch (err) {
    console.warn("[Snapshot] Remote update failed, persisted to on-device cache:", err);
  }
  return updated;
}

export async function sendChatMessageToEdgeFunction(params: {
  message: string;
  snapshot: StudentSnapshot;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  tone?: NudgeTone;
}): Promise<EdgeFunctionChatResponse> {
  const savedKey = (typeof localStorage !== "undefined" && localStorage.getItem("nudge_gemini_api_key")) || "";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (savedKey) {
    headers["x-gemini-api-key"] = savedKey;
  }

  const res = await fetch(`${API_BASE}/api/functions/nudge-chat`, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  if (res.status === 429) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Rate limit exceeded. Please wait ${errorData.retryAfter || 30} seconds.`
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.details || `Edge function failed (${res.status})`);
  }

  return res.json();
}

export async function fetchEdgeFunctionCode(): Promise<string> {
  const res = await fetch(`${API_BASE}/api/supabase/edge-function-code`);
  if (!res.ok) {
    throw new Error("Failed to load edge function code");
  }
  const data = await res.json();
  return data.code;
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const arrayBuffer = await audioBlob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  const res = await fetch(`${API_BASE}/api/functions/transcribe-audio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      audioBase64: base64,
      mimeType: audioBlob.type || "audio/webm",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.details || "Audio transcription failed");
  }

  const data = await res.json();
  return data.transcript || "";
}

/**
 * Direct caller for the Next.js / Express Gemini 3.7 Flash Route wrapper at /api/gemini
 */
export async function sendPromptToGeminiRoute(
  prompt: string,
  systemInstruction?: string,
  apiKeyOverride?: string
): Promise<{
  success: boolean;
  model: string;
  output: string;
  durationMs?: number;
  loggedToSupabase?: boolean;
  error?: string;
  details?: string;
}> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const key = apiKeyOverride || localStorage.getItem("nudge_gemini_api_key");
  if (key) {
    headers["x-gemini-api-key"] = key;
  }

  const res = await fetch("/api/gemini", {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt,
      systemInstruction,
      allowSimulation: !key,
    }),
  });

  const data = await res.json();
  if (!res.ok && !data.output) {
    throw new Error(data.error || `Gemini API returned status ${res.status}`);
  }
  return data;
}

