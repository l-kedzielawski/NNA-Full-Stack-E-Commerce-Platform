"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="relative inline-flex h-8 w-[3.35rem] shrink-0 items-center rounded-full border border-line/70 bg-bg-mid/85 p-1 text-ink/70 transition-all duration-300 hover:border-gold/45 hover:text-ink"
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-gold shadow-[0_4px_14px_rgba(0,0,0,0.26)] transition-transform duration-300 ${isDark ? "translate-x-0" : "translate-x-[1.35rem]"}`}
      />

      <span className="relative z-10 flex w-full items-center justify-between px-[0.05rem]">
        <Moon
          size={13}
          className={`transition-colors duration-300 ${isDark ? "text-bg" : "text-ink/55"}`}
        />
        <Sun
          size={13}
          className={`transition-colors duration-300 ${isDark ? "text-ink/55" : "text-bg"}`}
        />
      </span>
    </button>
  );
}
