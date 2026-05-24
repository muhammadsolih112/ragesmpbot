import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle theme"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-orange-500/30 bg-white/70 dark:bg-white/5 backdrop-blur hover:border-orange-500 hover:shadow-[0_0_20px_rgba(255,122,24,0.5)] transition-all duration-300"
    >
      <span className="absolute inset-0 rounded-full fire-gradient opacity-0 hover:opacity-20 transition-opacity" />
      {dark ? (
        // Sun
        <svg className="h-5 w-5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        // Moon
        <svg className="h-5 w-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
