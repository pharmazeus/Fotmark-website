"use client";

import { useSyncExternalStore } from "react";
import { THEME_COLOR, THEME_COLOR_LIGHT } from "@/lib/site";

type Theme = "dark" | "light";

type Props = {
  labels: {
    toggle: string;
    dark: string;
    light: string;
  };
};

const EVENT_NAME = "fotmark-theme-change";

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      "content",
      theme === "light" ? THEME_COLOR_LIGHT : THEME_COLOR,
    );
  try {
    sessionStorage.setItem("fotmark-theme", theme);
  } catch {
    // Storage can be unavailable in privacy-restricted contexts; the DOM theme still works.
  }
  window.dispatchEvent(new CustomEvent<Theme>(EVENT_NAME, { detail: theme }));
}

export function ThemeToggle({ labels }: Props) {
  const theme = useSyncExternalStore(
    (onChange) => {
      window.addEventListener(EVENT_NAME, onChange);
      return () => window.removeEventListener(EVENT_NAME, onChange);
    },
    currentTheme,
    () => "dark" as Theme,
  );

  const nextTheme = theme === "light" ? "dark" : "light";
  const label = nextTheme === "light" ? labels.light : labels.dark;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={theme === "light"}
      onClick={() => {
        const next = currentTheme() === "light" ? "dark" : "light";
        applyTheme(next);
      }}
      className="flex size-9 touch-manipulation items-center justify-center border border-line2 text-ink2 transition-[color,border-color] duration-300 hover:border-acc hover:text-ink"
    >
      {theme === "light" ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-[17px] fill-none stroke-current"
        >
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M18.36 5.64l-1.42 1.42M7.06 16.94l-1.42 1.42" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-[17px] fill-none stroke-current"
        >
          <path d="M20 15.2A8.2 8.2 0 0 1 8.8 4a8.2 8.2 0 1 0 11.2 11.2Z" />
        </svg>
      )}
    </button>
  );
}
