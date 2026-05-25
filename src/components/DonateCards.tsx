import { useState } from "react";
import { fmtUZS, type Donation } from "../data/donations";
import { useSiteConfig } from "../data/siteConfig";
import type { User } from "../data/store";

export default function DonateCards({ onSelect, currentUser, onOpenAuth, onOpenMediaModal }: { onSelect: (d: Donation) => void; currentUser: User | null; onOpenAuth: () => void; onOpenMediaModal: () => void }) {
  const { config } = useSiteConfig();
  const [activeTab, setActiveTab] = useState<"ranks" | "media" | "services" | "currencies">("ranks");

  const getItems = () => {
    switch (activeTab) {
      case "services": return config.services;
      case "currencies": return config.currencies;
      case "media": return [];
      default: return config.donations;
    }
  };

  return (
    <section id="donate" className="relative py-12 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Header activeTab={activeTab} />

        {/* Tabs */}
        <div className="mt-8 flex justify-center gap-2 p-1 bg-orange-500/5 rounded-2xl border border-orange-500/10 max-w-md mx-auto">
          {[
            { id: "ranks", label: "👑 Ranklar" },
            { id: "media", label: "📺 Media" },
            { id: "services", label: "🔓 Xizmatlar" },
            { id: "currencies", label: "💎 Valyuta" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? tab.id === "media"
                    ? "bg-white dark:bg-white/10 text-red-500 shadow-sm"
                    : "bg-white dark:bg-white/10 text-orange-500 shadow-sm"
                  : "text-neutral-500 hover:text-orange-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "media" ? (
          <div className="mt-10 sm:mt-14 text-center">
            <div className="rounded-[32px] border-2 border-red-500/30 bg-red-500/5 p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 h-40 w-40 bg-gradient-to-br from-red-500/20 to-red-700/10 blur-3xl rounded-full animate-pulse-slow" />
              <div className="relative z-10">
                <div className="h-20 w-20 mx-auto rounded-[40px] bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white text-4xl shadow-xl shadow-red-500/40 mb-4 grid place-items-center">
                  📺
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-red-600 dark:text-red-400 mb-2">
                  YouTube va Streamerlar uchun <span className="fire-text">Media Rank</span>
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto mb-6">
                  Media rank olish uchun quyidagi shartlarni bajarishingiz kerak. So'rov yuboring va adminlar tekshirib, rankni faollashtirsin!
                </p>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      onOpenAuth();
                      return;
                    }
                    onOpenMediaModal();
                    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("medium");
                  }}
                  className="px-8 py-4 rounded-2xl text-white font-black bg-gradient-to-r from-red-500 via-red-600 to-red-700 shadow-xl shadow-red-500/40 hover:scale-[1.05] active:scale-95 transition-all shine-on-hover text-base"
                >
                  So'rov yuborish
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getItems().map((d, i) => (
              <Card key={d.id} d={d} delay={i * 0.1} onSelect={onSelect} currentUser={currentUser} onOpenAuth={onOpenAuth} onOpenMediaModal={onOpenMediaModal} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center text-sm text-neutral-500 max-w-lg mx-auto">
          Barcha to'lovlar ushbu <span className="font-semibold text-orange-500">Mini App</span> orqali xavfsiz amalga oshiriladi.
          Donat darhol o'yindagi akkauntingizga qo'shiladi.
        </div>
      </div>
    </section>
  );
}

function Header({ activeTab }: { activeTab: string }) {
  const getTitle = () => {
    switch (activeTab) {
      case "services": return <>Maxsus <span className="fire-text">xizmatlar</span></>;
      case "currencies": return <>O'yin <span className="fire-text">valyutalari</span></>;
      default: return <>O'zingga mos <span className="fire-text">olovni</span> tanla</>;
    }
  };

  const getSub = () => {
    switch (activeTab) {
      case "services": return "Unban va Unmute xizmatlari orqali cheklovlarni olib tashlang.";
      case "currencies": return "Point va Shards sotib olib, o'yinda ustunlikka erishing.";
      default: return "3 ta paket — har birida o'ziga xos imkoniyatlar. Tezkor va xavfsiz xarid.";
    }
  };

  return (
    <div className="text-center max-w-3xl mx-auto fade-up">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-semibold text-orange-600 dark:text-orange-300 uppercase">
        🔥 {activeTab === "ranks" ? "Donat paketlar" : activeTab === "services" ? "Xizmatlar" : "Valyuta"}
      </div>
      <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tighter leading-tight">
        {getTitle()}
      </h2>
      <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
        {getSub()}
      </p>
    </div>
  );
}

function Card({ d, delay, onSelect, currentUser, onOpenAuth, onOpenMediaModal }: { d: Donation; delay: number; onSelect: (d: Donation) => void; currentUser: any; onOpenAuth: () => void; onOpenMediaModal: () => void }) {
  const [hover, setHover] = useState(false);

  const handleClick = () => {
    if (d.id === "media") {
      if (!currentUser) {
        onOpenAuth();
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("medium");
        return;
      }
      onOpenMediaModal();
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("medium");
      return;
    }

    if (!currentUser) {
      onOpenAuth();
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("medium");
      return;
    }
    onSelect(d);
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("medium");
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative fade-up"
      style={{ animationDelay: `${delay}s` }}
    >
      {d.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-white fire-gradient shadow-lg shadow-orange-500/50">
          {d.badge.toUpperCase()}
        </div>
      )}

      <div className="relative h-full lift rounded-3xl border border-orange-500/20 dark:border-orange-500/15 bg-white/80 dark:bg-white/[0.03] backdrop-blur p-5 sm:p-6 overflow-hidden group flex flex-col shadow-xl shadow-orange-500/5">
        {/* glow */}
        <div
          className={`absolute -top-20 -right-20 h-48 w-48 rounded-full blur-3xl transition-opacity duration-500 ${
            hover ? "opacity-60" : "opacity-30"
          } bg-gradient-to-br ${d.color}`}
        />

        <div className="relative flex h-full flex-col">
          <div className={`inline-grid place-items-center h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br ${d.color} text-2xl sm:text-3xl shadow-lg`}>
            {d.emoji}
          </div>

          <div className="mt-4 sm:mt-5 flex items-baseline gap-2">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">{d.name}</h3>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 min-h-[2rem] sm:min-h-[2.5rem]">{d.tagline}</p>

          <div className="mt-4 sm:mt-5">
            <div className="text-2xl sm:text-3xl font-black fire-text">{fmtUZS(d.price)}</div>
            <div className="text-[10px] sm:text-[11px] uppercase tracking-widest text-neutral-500 mt-0.5">30 kunlik to'lov</div>
          </div>

          <ul className="mt-4 sm:mt-5 space-y-2 flex-1">
            {d.perks.slice(0, 5).map((p) => (
              <li key={p} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full fire-gradient flex-shrink-0" />
                <span className="line-clamp-2">{p}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleClick}
            className={`mt-6 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold ${d.id === "media" ? "bg-gradient-to-r from-red-500 via-red-600 to-red-700 shadow-lg shadow-red-500/30" : "fire-gradient shadow-lg shadow-orange-500/30"} hover:scale-[1.02] active:scale-95 transition-all shine-on-hover`}
          >
            {d.id === "media" ? "So'rov yuborish" : "Tanlash"}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
