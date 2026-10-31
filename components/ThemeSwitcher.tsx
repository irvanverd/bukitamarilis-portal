
"use client";

import { useEffect, useState } from "react";
import {
  applyTheme,
  getStoredTheme,
  saveTheme,
  PortalTheme,
} from "@/lib/themeStorage";

const themes: {
  id: PortalTheme;
  name: string;
  color: string;
}[] = [
  {
    id: "green",
    name: "Green",
    color: "#16A34A",
  },
  {
    id: "blue",
    name: "Ocean",
    color: "#2563EB",
  },
  {
    id: "purple",
    name: "Lavender",
    color: "#7C3AED",
  },
  {
    id: "sunset",
    name: "Sunset",
    color: "#EA580C",
  },
  {
    id: "ruby",
    name: "Ruby",
    color: "#E11D48",
  },
  {
    id: "pink",
    name: "Rose",
    color: "#DB2777",
  },
  {
    id: "cyan",
    name: "Cyan",
    color: "#0891B2",
  },
  {
    id: "teal",
    name: "Teal",
    color: "#0D9488",
  },
  {
    id: "amber",
    name: "Amber",
    color: "#D97706",
  },
  {
    id: "indigo",
    name: "Indigo",
    color: "#4F46E5",
  },
  {
    id: "lime",
    name: "Lime",
    color: "#65A30D",
  },
  {
    id: "slate",
    name: "Modern Gray",
    color: "#475569",
  },
  {
    id: "red",
    name: "Red",
    color: "#DC2626",
  },
  {
    id: "emerald",
    name: "Emerald",
    color: "#059669",
  },
  {
    id: "dark",
    name: "Dark",
    color: "#27272A",
  },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] =
    useState<PortalTheme>("blue");

  useEffect(() => {
    const current = getStoredTheme();

    setTheme(current);
    applyTheme(current);
  }, []);

  function changeTheme(value: PortalTheme) {
    setTheme(value);
    saveTheme(value);
    applyTheme(value);
  }

  return (
    <select
      value={theme}
      onChange={(e) =>
        changeTheme(e.target.value as PortalTheme)
      }
      className="
        rounded-lg
        border
        px-3
        py-2
        text-sm
        bg-background
        cursor-pointer
        focus:outline-none
        focus:ring-2
        focus:ring-primary
      "
      aria-label="Pilih tema tampilan"
    >
      {themes.map((item) => (
        <option key={item.id} value={item.id}>
          ● {item.name}
        </option>
      ))}
    </select>
  );
}
