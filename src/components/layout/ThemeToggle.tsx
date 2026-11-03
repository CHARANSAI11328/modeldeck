"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { getInitialTheme, applyTheme, Theme } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = getInitialTheme();
    setTheme(current);
    applyTheme(current);
    setMounted(true);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      const saved = localStorage.getItem("modeldeck-theme");
      if (saved === "system") {
        applyTheme("system");
      }
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-lg border border-border bg-surface-2 opacity-50" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      title={`Switch to ${isDark ? "Light" : "Dark"} mode (Linear / Apple aesthetic)`}
      className="group relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-1 hover:bg-surface-2 hover:border-zinc-400 dark:hover:border-zinc-700 text-foreground transition-all duration-300 shadow-sm focus-visible:ring-2 focus-visible:ring-primary overflow-hidden"
    >
      <div className="relative h-4 w-4">
        {/* Sun Icon for Light Mode */}
        <Sun
          className={`absolute inset-0 h-4 w-4 text-amber-500 transition-all duration-500 ease-out transform ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          }`}
        />
        {/* Moon Icon for Dark Mode */}
        <Moon
          className={`absolute inset-0 h-4 w-4 text-blue-400 transition-all duration-500 ease-out transform ${
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

