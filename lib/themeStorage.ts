export type PortalTheme =
  | "green"
  | "blue"
  | "purple"
  | "sunset"
  | "ruby"
  | "pink"
  | "cyan"
  | "teal"
  | "amber"
  | "indigo"
  | "lime"
  | "slate"
  | "red"
  | "emerald"
  | "dark";

const STORAGE_KEY = "portal-theme";
const DEFAULT_THEME: PortalTheme = "blue";

export function getStoredTheme(): PortalTheme {
  if (typeof window === "undefined") return DEFAULT_THEME;

  const stored = localStorage.getItem(STORAGE_KEY);

  const validThemes: PortalTheme[] = [
    "green",
    "blue",
    "purple",
    "sunset",
    "ruby",
    "pink",
    "cyan",
    "teal",
    "amber",
    "indigo",
    "lime",
    "slate",
    "red",
    "emerald",
    "dark",
  ];

  if (stored && validThemes.includes(stored as PortalTheme)) {
    return stored as PortalTheme;
  }

  return DEFAULT_THEME;
}

export function saveTheme(theme: PortalTheme) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, theme);
}

export function applyTheme(theme: PortalTheme) {
  if (typeof document === "undefined") return;

  const html = document.documentElement;

  html.setAttribute("data-theme", theme);

  html.classList.toggle("dark", theme === "dark");
}