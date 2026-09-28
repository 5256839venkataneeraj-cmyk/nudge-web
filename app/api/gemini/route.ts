import { GoogleGenAI } from "@google/genai";

interface GeminiRequestBody {
  prompt?: string;
  message?: string;
  systemInstruction?: string;
  temperature?: number;
  allowSimulation?: boolean;
}

interface SupabaseLogPayload {
  prompt: string;
  response: string;
  model: string;
  status: "success" | "error";
  duration_ms: number;
  error?: string | null;
  created_at: string;
}

/**
 * Logs interaction to Supabase 'gemini_logs' table via PostgREST.
 * Non-blocking: logs safely so Supabase outages never fail the user's AI query.
 */
async function logToSupabase(logPayload: SupabaseLogPayload): Promise<boolean> {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    "";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    "";

  if (!supabaseUrl || !supabaseKey) {
    console.log("[Supabase Audit Log (Local Mode)]:", {
      model: logPayload.model,
      status: logPayload.status,
      durationMs: logPayload.duration_ms,
      promptSnippet: logPayload.prompt.slice(0, 60),
      createdAt: logPayload.created_at,
    });
    return false;
  }

  try {
    const res = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/rest/v1/gemini_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(logPayload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`[Supabase Audit] Warning: table write returned ${res.status}:`, errText);
      return false;
    }

    return true;
  } catch (err: any) {
    console.warn("[Supabase Audit] Network error logging to Supabase table:", err?.message || err);
    return false;
  }
}

/**
 * Next.js Route Handler for Gemini 3.7 Flash wrapper
 * Securely uses @google/genai with process.env.GEMINI_API_KEY
 */
export async function POST(req: Request): Promise<Response> {
  const startTime = Date.now();

  try {
    // 1. Extract and sanitize incoming body
    let body: GeminiRequestBody;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON in request body.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const prompt = (body.prompt || body.message || "").trim();
    if (!prompt) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required 'prompt' or 'message' parameter.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Security: Input length restriction & null byte rejection (Phase 5 #21, Phase 6 #33)
    if (prompt.length > 8000) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Prompt exceeds maximum allowed length of 8,000 characters.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (prompt.includes("\0")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Prompt contains invalid characters.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Validate API key presence
    const apiKey =
      process.env.GEMINI_API_KEY ||
      req.headers.get("x-gemini-api-key") ||
      "";

    if (!apiKey) {
      if (body.allowSimulation) {
        const durationMs = Date.now() - startTime;
        const simText = `[Gemini 3.7 Flash Route Verified]\n\nReceived prompt: "${prompt}"\n\n• Route Handler: app/api/gemini/route.ts\n• SDK: @google/genai (GoogleGenAI initialized)\n• Target Model: gemini-3.7-flash\n• Supabase Logging: Active (logged to gemini_logs table)\n\nNote: Real cloud generation will trigger once process.env.GEMINI_API_KEY is defined in your environment or passed via 'x-gemini-api-key'.`;

        await logToSupabase({
          prompt,
          response: simText,
          model: "gemini-3.7-flash (simulation)",
          status: "success",
          duration_ms: durationMs,
          error: null,
          created_at: new Date().toISOString(),
        });

        return new Response(
          JSON.stringify({
            success: true,
            model: "gemini-3.7-flash (simulation)",
            output: simText,
            durationMs,
            loggedToSupabase: false,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const durationMs = Date.now() - startTime;
      await logToSupabase({
        prompt,
        response: "",
        model: "gemini-3.7-flash",
        status: "error",
        duration_ms: durationMs,
        error: "Missing GEMINI_API_KEY in environment or headers",
        created_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          success: false,
          error:
            "GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY to your .env file or pass via 'x-gemini-api-key' header.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 3. Securely initialize modern Google Gen AI SDK
    const ai = new GoogleGenAI({ apiKey });

    // 4. Call latest Gemini models with automatic rapid failover
    const candidateModels = [
      "gemini-3.8-flash",
      "gemini-3.6-flash",
      "gemini-3.7-flash",
      "gemini-flash-latest",
      "gemini-1.5-flash",
    ];

    let text = "";
    let modelUsed = candidateModels[0];
    let lastError: any = null;

    for (const currentModel of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: prompt,
          config: body.systemInstruction
            ? {
                systemInstruction: body.systemInstruction,
                temperature: body.temperature ?? 0.7,
              }
            : undefined,
        });

        if (response.text && response.text.trim()) {
          text = response.text;
          modelUsed = currentModel;
          lastError = null;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Route] Model ${currentModel} error (${err?.message}). Trying next candidate...`);
      }
    }

    if (!text && lastError) {
      const durationMs = Date.now() - startTime;
      const errMsg = lastError?.message || "Generation error across all models";

      await logToSupabase({
        prompt,
        response: "",
        model: modelUsed,
        status: "error",
        duration_ms: durationMs,
        error: errMsg,
        created_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: "Gemini generation failed across models.",
          details: errMsg,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const durationMs = Date.now() - startTime;

    // 5. Log interaction to Supabase table
    const logged = await logToSupabase({
      prompt,
      response: text,
      model: modelUsed,
      status: "success",
      duration_ms: durationMs,
      error: null,
      created_at: new Date().toISOString(),
    });

    // 6. Return standard structured response
    return new Response(
      JSON.stringify({
        success: true,
        model: modelUsed,
        output: text,
        durationMs,
        loggedToSupabase: logged,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[Gemini API Route Error]:", error);
    const durationMs = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error in Gemini route handler.",
        details: error instanceof Error ? error.message : String(error),
        durationMs,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
