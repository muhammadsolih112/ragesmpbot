import { useEffect, useState } from "react";
import Embers from "./Embers";

export default function Hero() {
  const ip = "ragesmp.uz";
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const copyPromo = () => {
    navigator.clipboard.writeText("/promo vebuca");
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("medium");
  };

  return (
    <section id="home" className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent dark:via-orange-500/10" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-orange-500/20 blur-3xl dark:bg-orange-500/15" />
      <Embers count={28} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div className="fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-300 text-xs font-semibold shadow-sm">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            ONLINE — 1.12.2 - 1.21.11
          </div>

          <h1 className="mt-4 sm:mt-6 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95]">
            Olovli<br />
            <span className="fire-text">RageSMP</span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-xl">
            O'zbekistondagi eng qaynoq SMP server. Do'stlaring bilan o'yna,
            va maxsus donatlarni qo'lga kirit!
          </p>

          <div className="mt-6 sm:mt-8 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 rounded-2xl blur opacity-40 group-hover:opacity-75 transition duration-1000 animate-pulse" />
            <div className="relative flex items-center gap-3 sm:gap-4 rounded-2xl border border-emerald-400/50 bg-gradient-to-r from-emerald-900/80 via-emerald-800/80 to-cyan-900/80 px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-xl shadow-2xl shadow-emerald-500/20">
              <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-xl sm:text-2xl animate-bounce">
                🎟️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-emerald-300 font-black">Promo kod</span>
                </div>
                <div className="mt-0.5 flex items-baseline gap-2 sm:gap-3">
                  <code className="font-mono text-xl sm:text-3xl font-black text-white drop-shadow-[0_0_20px_rgba(74,222,128,0.6)] tracking-wider">/promo vebuca</code>
                </div>
              </div>
              <button
                onClick={copyPromo}
                className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 grid place-items-center text-emerald-300 hover:bg-emerald-500/40 hover:scale-110 transition-all"
                title="Nusxa olish"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#donate"
              onClick={() => window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light")}
              className="group relative flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-xl text-white font-bold fire-gradient shadow-xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all shine-on-hover"
            >
              <span>🔥 Donat olish</span>
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
            <button
              onClick={copy}
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-3 pl-4 pr-2 py-2 sm:py-2.5 rounded-xl border border-orange-500/30 bg-white/70 dark:bg-white/5 backdrop-blur hover:border-orange-500 transition-all"
            >
              <div className="text-left">
                <div className="text-[9px] uppercase tracking-widest text-neutral-500">IP</div>
                <div className="font-mono font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">{ip}</div>
              </div>
              <span className="grid place-items-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg fire-gradient text-white flex-shrink-0">
                {copied ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7"/></svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                )}
              </span>
            </button>
          </div>

          {/* mini-stats */}
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            {[
              { label: "Online", value: "127" },
              { label: "Ro'yxatdan", value: "3.4K+" },
              { label: "Uptime", value: "99.9%" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-orange-500/20 bg-white/60 dark:bg-white/[0.03] backdrop-blur p-3 text-center hover:border-orange-500/60 transition-colors">
                <div className="text-2xl font-black fire-text">{s.value}</div>
                <div className="text-[11px] uppercase tracking-wider text-neutral-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — animated showcase */}
        <HeroVisual />
      </div>

      {/* fading curve at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-white dark:to-[#0a0a0f] pointer-events-none" />
    </section>
  );
}

import { useRef } from "react";

function HeroVisual() {
  const orbRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let rafId: number;
    const onMove = (e: MouseEvent) => {
      if (!orbRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (orbRef.current) {
          orbRef.current.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${-x}deg)`;
        }
      });
    };
    
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="relative h-[500px] hidden lg:block fade-up" style={{ animationDelay: "0.2s" }}>
      {/* rotating ring */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative h-[420px] w-[420px]">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-orange-500/30 spin-slow" />
          <div className="absolute inset-8 rounded-full border border-orange-500/20" />
          <div className="absolute inset-16 rounded-full border border-orange-500/10" />

          {/* center diamond/orb */}
          <div
            ref={orbRef}
            className="absolute inset-24 rounded-full fire-gradient grid place-items-center shadow-[0_0_80px_rgba(255,90,0,0.6)] flicker"
            style={{
              transition: "transform 0.2s ease-out",
            }}
          >
            <div className="text-7xl drop-shadow-2xl">🔥</div>
          </div>

          {/* orbiting badges */}
          {[
            { emoji: "💎", angle: 0, label: "Diamond" },
            { emoji: "⚔️", angle: 72, label: "PvP" },
            { emoji: "🏰", angle: 144, label: "Build" },
            { emoji: "👑", angle: 216, label: "VIP" },
            { emoji: "🎁", angle: 288, label: "Donate" },
          ].map((b) => {
            const rad = (b.angle * Math.PI) / 180;
            const r = 200;
            const x = Math.cos(rad) * r;
            const y = Math.sin(rad) * r;
            return (
              <div
                key={b.label}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ transform: `translate(${x}px, ${y}px) translate(-50%, -50%)` }}
              >
                <div className="relative h-14 w-14 rounded-2xl glass border border-orange-500/40 grid place-items-center text-2xl shadow-lg hover:scale-110 transition-transform">
                  {b.emoji}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
