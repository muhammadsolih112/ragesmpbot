import { useEffect, useMemo, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import type { User } from "../data/store";
import logoImg from "../assets/logo.png";
import BalanceWidget from "./BalanceWidget";

const MEDIA_RULES = [
  { emoji: "⚠️", text: "Agar streamda server IP (ragesmp.uz) ni ko'rsatmasangiz — media rank olinadi!" },
  { emoji: "⚠️", text: "Agar 3 kun davomida stream qilmasangiz — media rank olinadi!" },
  { emoji: "⚠️", text: "Agar streamda chit ishlatsangiz — media rank olinadi!" },
  { emoji: "⚠️", text: "Agar streamda server administratsiyasiga qarshi chiqsangiz — media rank olinadi!" },
];

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
  onOpenTopUp,
}: {
  currentUser: User | null;
  onOpenAuth: () => void;
  onNavView: (view: "main" | "admin" | "profile") => void;
  onMarkNotificationsAsRead: () => void;
  onOpenTopUp: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMediaRules, setShowMediaRules] = useState(false);
  const [mediaEnvelopeClicks, setMediaEnvelopeClicks] = useState(0);

  const userNotifs = currentUser?.notifications || [];

  const pendingOrders = useMemo(() => {
    if (currentUser?.role !== "admin") return [] as any[];
    try {
      const all = JSON.parse(localStorage.getItem("ragesmp_txs") || "[]") as any[];
      return all.filter((t) => t.status === "Kutilmoqda" && !t.deletedAt);
    } catch {
      return [];
    }
  }, [currentUser, showNotifs]);

  const pendingOrdersCount = pendingOrders.length;
  const unreadCount = userNotifs.filter((n) => !n.read).length + pendingOrdersCount;

  const visibleLinks = links.filter((link) => link.href !== "#recent" || currentUser?.role === "admin");
  const isMediaUser = currentUser?.rank === "Media";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mediaEnvelopeClicks >= 2) {
      setShowMediaRules(true);
      setMediaEnvelopeClicks(0);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
    }
  }, [mediaEnvelopeClicks]);

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
              {/* Media Envelope (only for media users) */}
              {isMediaUser && (
                <button
                  onClick={() => {
                    setMediaEnvelopeClicks(prev => prev + 1);
                    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
                  }}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500/20 hover:scale-110 transition-all animate-pulse-slow relative overflow-hidden"
                  title="Konvertni ochish uchun 2 marta bosing"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  {mediaEnvelopeClicks === 1 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                      1
                    </span>
                  )}
                </button>
              )}

              {/* Balance Widget — o'ng tarafda */}
              <BalanceWidget
                balance={currentUser.balance || 0}
                onClick={() => {
                  onOpenTopUp();
                  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("medium");
                }}
              />

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
                  <div className="absolute top-12 right-0 w-72 sm:w-80 max-h-[28rem] overflow-y-auto admin-scrollbar rounded-2xl border border-orange-500/20 bg-white dark:bg-[#0d0d12] shadow-2xl p-2 z-[60] receipt-zoom-in">
                    <div className="px-3 py-2 border-b border-orange-500/10 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0d0d12] z-10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Bildirishnomalar</span>
                      {pendingOrdersCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black uppercase animate-pulse">
                          {pendingOrdersCount} ta yangi
                        </span>
                      )}
                    </div>

                    {currentUser?.role === "admin" && (
                      <button
                        onClick={() => {
                          const tg = window.Telegram?.WebApp;
                          if (tg?.openTelegramLink) {
                            tg.openTelegramLink("https://t.me/RageSMP_bot?start=admin");
                          } else {
                            window.open("https://t.me/RageSMP_bot?start=admin", "_blank");
                          }
                          window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("medium");
                          setShowNotifs(false);
                        }}
                        className="mt-1.5 w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 bg-[length:200%_100%] text-white text-[10px] font-black uppercase tracking-widest hover:bg-right shadow-md shadow-blue-500/30 transition-all duration-700 shine-on-hover"
                        title="Bot xabaridagi 'Saytni yangilash' tugmasini bosing"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                        🤖 Botdan yangilash
                      </button>
                    )}

                    <div className="mt-2 space-y-1.5">
                      {unreadCount === 0 ? (
                        <div className="py-10 text-center text-xs text-neutral-500">
                          <div className="text-3xl mb-2">📭</div>
                          Hozircha xabarlar yo'q
                          {currentUser?.role === "admin" && (
                            <div className="mt-3 text-[10px] text-neutral-400 max-w-[200px] mx-auto leading-relaxed">
                              Botda yangi buyurtmalar bo'lsa, yuqoridagi "Botdan yangilash" tugmasini bosing.
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {currentUser?.role === "admin" && pendingOrders.map((t) => {
                            const hasChek = Boolean(t.receiptImage || t.receiptFileId);
                            const sourceLabel = t.source === "bot" ? "🤖 Botdan" : t.source === "site" ? "🌐 Saytdan" : null;
                            return (
                              <div key={t.id} className="p-3 rounded-xl text-xs leading-relaxed bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="font-black text-red-500 uppercase text-[9px] tracking-widest">⏳ Yangi buyurtma</span>
                                  {sourceLabel && (
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${
                                      t.source === "bot" ? "bg-blue-500/15 text-blue-500" : "bg-emerald-500/15 text-emerald-500"
                                    } uppercase tracking-widest`}>{sourceLabel}</span>
                                  )}
                                </div>
                                <div className="font-black text-sm text-neutral-800 dark:text-neutral-200">
                                  {t.player}
                                </div>
                                <div className="text-[11px] text-orange-500 font-bold mt-0.5">
                                  {t.pkg}
                                </div>
                                <div className="mt-1 text-[10px] text-neutral-400">{t.date}</div>
                                <div className="mt-2 flex gap-1.5">
                                  <button
                                    onClick={() => {
                                      onNavView("admin");
                                      setShowNotifs(false);
                                    }}
                                    className="flex-1 py-1.5 rounded-lg bg-red-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-600 active:scale-95 transition-all"
                                  >
                                    Tekshirish
                                  </button>
                                  {hasChek && (
                                    <button
                                      onClick={() => {
                                        onNavView("admin");
                                        setShowNotifs(false);
                                      }}
                                      title="Chekni admin panelda ko'rish"
                                      className="px-2.5 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-500 hover:bg-blue-500 hover:text-white transition-all text-[10px] font-black"
                                    >
                                      📸
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {userNotifs.map(n => (
                            <div key={n.id} className={`p-3 rounded-xl text-xs leading-relaxed ${n.read ? 'opacity-60' : 'bg-orange-500/5 border border-orange-500/10'}`}>
                              <div className="font-semibold text-neutral-800 dark:text-neutral-200">{n.text}</div>
                              <div className="mt-1 text-[10px] text-neutral-400">{n.time}</div>
                            </div>
                          ))}
                        </>
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
                className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all shadow-sm ${
                  isMediaUser
                    ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white"
                    : "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-300 hover:bg-orange-500 hover:text-white"
                }`}
              >
                {isMediaUser ? (
                  <span className="text-xl">📺</span>
                ) : (
                  <span>👤</span>
                )}
                <span className={isMediaUser ? "font-black" : ""}>
                  {currentUser.nick}
                </span>
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

      {/* Media Rules Modal */}
      {showMediaRules && isMediaUser && (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/60 backdrop-blur-md fade-up">
          <div className="relative w-full max-w-2xl rounded-3xl border-2 border-red-500/40 bg-white dark:bg-[#0d0d12] shadow-2xl shadow-red-500/30 overflow-hidden">
            <button
              onClick={() => setShowMediaRules(false)}
              className="absolute top-4 right-4 h-8 w-8 grid place-items-center rounded-full bg-neutral-200 dark:bg-white/10 hover:bg-red-500 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>

            <div className="p-6 pt-8 pb-4 border-b border-red-500/20 bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10">
              <div className="text-center">
                <div className="inline-grid place-items-center h-12 w-12 rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white text-3xl shadow-lg shadow-red-500/40 mb-4 animate-bounce">
                  📺
                </div>
                <h3 className="text-2xl font-black tracking-tight text-red-600 dark:text-red-400">
                  Tabriklaymiz!
                </h3>
                <p className="text-sm text-neutral-500 mt-2">
                  Siz endi rasmiy RageSMP mediasi!
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm font-bold text-red-500">
                  Media rank qoidalari:
                </p>
              </div>

              <div className="space-y-3">
                {MEDIA_RULES.map((rule, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <span className="text-2xl">{rule.emoji}</span>
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {rule.text}
                  </span>
                </div>
              ))}
              </div>

              <div className="mt-6 pt-4 border-t border-red-500/10">
                <div className="text-center">
                  <p className="text-xs text-neutral-500">
                    Ushbu qoidalarga amal qilmagan holda media rankingiz olinadi!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowMediaRules(false)}
                className="w-full py-3 rounded-2xl text-white font-black bg-gradient-to-r from-red-500 via-red-600 to-red-700 shadow-lg shadow-red-500/30 hover:scale-[1.02] active:scale-95 transition-all text-sm"
              >
                Tushundim
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
