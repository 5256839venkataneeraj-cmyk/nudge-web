export type AppTheme = "light" | "dark" | "system";

const STORAGE_KEY_THEME = "nudge_app_theme";

export function getSavedTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_THEME) as AppTheme;
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
  } catch {}
  return "light";
}

export function applyTheme(theme: AppTheme): boolean {
  const root = document.documentElement;
  let isDark = false;

  if (theme === "dark") {
    isDark = true;
  } else if (theme === "system") {
    isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  } else {
    isDark = false;
  }

  if (isDark) {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  }

  try {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  } catch {}

  return isDark;
}
