/* ==========================================================================
   NUDGE+ CENTRAL RUNTIME CONFIGURATION
   Single Source of Truth for Models, Endpoints, and Pipeline Config
   ========================================================================== */

(function (window) {
  'use strict';

  const CONFIG_STORAGE_KEY_MODEL = 'nudge_gemini_model';

  const NudgeConfig = {
    // Single source of truth for Gemini model configuration
    gemini: {
      defaultModel: 'gemini-2.0-flash',
      fallbackModels: ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash'],
      apiKey: '',
      // Catalog of models for reference, validation, and UI select
      catalog: [
        {
          id: 'gemini-2.0-flash',
          name: 'Gemini 2.0 Flash',
          desc: 'High capacity, low latency & structured JSON extraction (Recommended & Stable)',
          isRecommended: true
        },
        {
          id: 'gemini-2.5-flash',
          name: 'Gemini 2.5 Flash',
          desc: 'Latest high-speed reasoning model checkpoint',
          isFast: true
        },
        {
          id: 'gemini-flash-latest',
          name: 'gemini-flash-latest',
          desc: 'Auto-updating alias • Always points to newest flash checkpoint',
          isAlias: true
        },
        {
          id: 'gemini-3.7-flash',
          name: 'Gemini 3.7 Flash',
          desc: 'Preview model (May experience high traffic / 503 capacity limits)',
          isPreview: true
        },
        {
          id: 'gemini-1.5-flash',
          name: 'Gemini 1.5 Flash',
          desc: 'Universal legacy fallback model',
          isLegacy: true
        }
      ],
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models'
    },

    supabase: {
      configTable: 'app_config' // Table name if remote config table is created in Supabase
    },

    /**
     * Resolves the active Gemini model name at runtime:
     * 1. Checks user-configured override in localStorage
     * 2. Falls back to defaultModel ('gemini-3.7-flash')
     * @returns {string} The active model identifier
     */
    getActiveGeminiModel() {
      try {
        const stored = localStorage.getItem(CONFIG_STORAGE_KEY_MODEL);
        if (stored && stored.trim()) {
          // If stored model is an older deprecated string, we log a heads-up
          if (stored.includes('1.5') || stored.includes('2.5')) {
            console.warn(`[NudgeConfig] Warning: Stored model "${stored}" is deprecated and may return 404. Consider updating to "${this.gemini.defaultModel}".`);
          }
          return stored.trim();
        }
      } catch (_) {}
      return this.gemini.defaultModel;
    },

    /**
     * Updates the active Gemini model name in single config storage
     * @param {string} modelName - The model identifier to store
     * @returns {string} The active model after update
     */
    setActiveGeminiModel(modelName) {
      const clean = (modelName || '').trim();
      try {
        if (clean) {
          localStorage.setItem(CONFIG_STORAGE_KEY_MODEL, clean);
          console.log(`[NudgeConfig] Active Gemini model updated to: "${clean}"`);
        } else {
          localStorage.removeItem(CONFIG_STORAGE_KEY_MODEL);
          console.log(`[NudgeConfig] Active Gemini model reset to default: "${this.gemini.defaultModel}"`);
        }
      } catch (_) {}
      return this.getActiveGeminiModel();
    },

    /**
     * Pulls remote config from Supabase config table (e.g. app_config { key, value })
     * @param {object} supabaseService - Instance of SupabaseService
     * @returns {Promise<string|null>} Remote model if retrieved
     */
    async fetchRemoteModelConfig(supabaseService) {
      if (!supabaseService || !supabaseService.isConfigured) return null;
      try {
        const { url, key } = supabaseService.getCredentials();
        const res = await fetch(`${url}/rest/v1/${this.supabase.configTable}?key=eq.gemini_model&select=value`, {
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
          }
        });
        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0 && rows[0].value) {
            const remoteModel = rows[0].value.trim();
            console.log(`[NudgeConfig] Fetched remote model from Supabase app_config: "${remoteModel}"`);
            return remoteModel;
          }
        }
      } catch (err) {
        console.info('[NudgeConfig] Remote config table check bypassed:', err.message);
      }
      return null;
    }
  };

  window.NudgeConfig = NudgeConfig;

})(window);
