import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import type { User } from "../data/store";
import logoImg from "../assets/logo.png";

const links = [
  { href: "#home", label: "Asosiy" },
  { href: "#donate", label: "Donatlar" },
  { href: "#how", label: "Sotib olish" },
  { href: "#recent", label: "Tarix" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar({
  currentUser,
  onOpenAuth,
  onNavView,
  onMarkNotificationsAsRead,
}: {
  currentUser: User | null;
  onOpenAuth: () => void;
  onNavView: (view: "main" | "admin" | "profile") => void;
  onMarkNotificationsAsRead: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadCount = currentUser?.notifications.filter(n => !n.read).length || 0;

  const visibleLinks = links.filter((link) => link.href !== "#recent" || currentUser?.role === "admin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-2 border-b border-orange-500/20 glass shadow-lg"
          : "py-3 bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between gap-4">
        <button onClick={() => {
          onNavView("main");
          window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
        }} className="flex items-center gap-2 group text-left">
          <div className="relative h-9 w-9 sm:h-11 sm:w-11 grid place-items-center rounded-xl overflow-hidden shadow-lg shadow-orange-500/40 border border-orange-500/30 group-hover:scale-105 transition-transform">
            <img src={logoImg} alt="RageSMP" className="w-full h-full object-cover" />
          </div>
          <div className="leading-tight">
            <div className="text-base sm:text-lg font-black tracking-tight">
              Rage<span className="fire-text">SMP</span>
            </div>
          </div>
        </button>

        <nav className="hidden lg:flex items-center gap-1">
          {visibleLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => {
                onNavView("main");
                window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
              }}
              className="relative px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-orange-500 dark:hover:text-orange-400 transition-colors group"
            >
              {l.label}
              <span className="absolute left-4 right-4 -bottom-0.5 h-0.5 fire-gradient origin-left scale-x-0 group-hover:scale-x-100 transition-transform" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2 relative">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifs(!showNotifs);
                    if (!showNotifs) onMarkNotificationsAsRead();
                    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
                  }}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 relative hover:bg-orange-500/20 transition-all"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute top-12 right-0 w-64 sm:w-72 max-h-96 overflow-y-auto rounded-2xl border border-orange-500/20 bg-white dark:bg-[#0d0d12] shadow-2xl p-2 z-[60] fade-up">
                    <div className="px-3 py-2 border-b border-orange-500/10 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                      Bildirishnomalar
                    </div>
                    <div className="mt-1 space-y-1">
                      {currentUser.notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-neutral-500">Hozircha xabarlar yo'q</div>
                      ) : (
                        currentUser.notifications.map(n => (
                          <div key={n.id} className={`p-3 rounded-xl text-xs leading-relaxed ${n.read ? 'opacity-60' : 'bg-orange-500/5 border border-orange-500/10'}`}>
                            <div className="font-semibold text-neutral-800 dark:text-neutral-200">{n.text}</div>
                            <div className="mt-1 text-[10px] text-neutral-400">{n.time}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {currentUser.role === "admin" && (
                <button
                  onClick={() => {
                    onNavView("admin");
                    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("medium");
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  ⚙️ Admin
                </button>
              )}
              <button
                onClick={() => {
                  onNavView("profile");
                  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
                }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-300 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
              >
                <span>👤 {currentUser.nick}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("medium");
              }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white fire-gradient hover:scale-105 shadow-md shadow-orange-500/40 transition-transform shine-on-hover"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
              <span className="hidden sm:inline">Kirish</span>
              <span className="sm:hidden">Kirish</span>
            </button>
          )}

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <button onClick={() => setOpen((o) => !o)} className="lg:hidden h-10 w-10 grid place-items-center rounded-xl border border-orange-500/30">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18"/> : <path d="M3 6h18M3 12h18M3 18h18"/>}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden mx-4 mt-3 rounded-2xl border border-orange-500/20 glass p-2 fade-up">
          {visibleLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => { setOpen(false); onNavView("main"); }}
              className="block px-4 py-3 text-sm font-medium hover:text-orange-500"
            >
              {l.label}
            </a>
          ))}
          {currentUser && currentUser.role === "admin" && (
            <button
              onClick={() => { setOpen(false); onNavView("admin"); }}
              className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:text-red-400"
            >
              ⚙️ Admin Panel
            </button>
          )}
        </div>
      )}
    </header>
  );
}
