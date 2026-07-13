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
    name: "Amarilis",
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
    id: "orange",
    name: "Sunset",
    color: "#EA580C",
  },
  {
    id: "red",
    name: "Ruby",
    color: "#DC2626",
  },
  {
    id: "gray",
    name: "Modern Gray",
    color: "#64748B",
  },
  {
    id: "dark",
    name: "Dark",
    color: "#111827",
  },
  {
    id: "system",
    name: "System",
    color: "#9CA3AF",
  },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] =
    useState<PortalTheme>("system");

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
        changeTheme(
          e.target.value as PortalTheme
        )
      }
      className="
      rounded-lg
      border
      px-3
      py-2
      text-sm
      bg-background
      "
    >
      {themes.map((item) => (
        <option
          key={item.id}
          value={item.id}
        >
          {item.name}
        </option>
      ))}
    </select>
  );
}