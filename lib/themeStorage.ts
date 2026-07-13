export type PortalTheme =
  | "green"
  | "blue"
  | "purple"
  | "orange"
  | "red"
  | "gray"
  | "dark"
  | "system";

const STORAGE_KEY = "portal-theme";

export function getStoredTheme(): PortalTheme {
  if (typeof window === "undefined") return "system";

  return (
    (localStorage.getItem(STORAGE_KEY) as PortalTheme) ??
    "system"
  );
}

export function saveTheme(theme: PortalTheme) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, theme);
}

export function applyTheme(theme: PortalTheme) {
  if (typeof document === "undefined") return;

  const html = document.documentElement;

  if (theme === "system") {
    html.removeAttribute("data-theme");

    if (
      window.matchMedia("(prefers-color-scheme: dark)")
        .matches
    ) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    return;
  }

  html.classList.remove("dark");
  html.setAttribute("data-theme", theme);

  if (theme === "dark") {
    html.classList.add("dark");
  }
}