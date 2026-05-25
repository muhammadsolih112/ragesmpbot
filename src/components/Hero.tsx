import { useEffect, useRef, useState } from "react";
import Embers from "./Embers";
import { useSiteConfig } from "../data/siteConfig";

type Burst = { id: number };
type CopyVariant = "ip" | "promo";

function CopyBurst({ onDone, label, variant }: { onDone: () => void; label: string; variant: CopyVariant }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1900);
    return () => clearTimeout(t);
  }, [onDone]);

  const orangePalette = ["#ff7a18", "#ffb800", "#ff2d00", "#fff7e6", "#ffd166", "#ff5500"];
  const emeraldPalette = ["#10b981", "#34d399", "#6ee7b7", "#22d3ee", "#fff", "#a7f3d0"];
  const palette = variant === "ip" ? orangePalette : emeraldPalette;
  const flashClass = variant === "ip" ? "copy-glow-orange" : "copy-glow-pulse";
  const stars = ["✨", "⭐", "💫", "🌟"];

  // 22 ta konfetti — har xil shakl va o'lcham
  const confetti = Array.from({ length: 22 }).map((_, i) => {
    const angle = (i / 22) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const dist = 55 + Math.random() * 65;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 20; // slight upward bias
    const size = 5 + Math.random() * 7;
    const isRect = i % 3 === 0;
    return {
      dx,
      dy,
      color: palette[i % palette.length],
      delay: i * 0.012,
      size,
      isRect,
      rotate: Math.random() * 360,
    };
  });

  // 8 ta uchqun (spark)
  const sparks = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const dist = 45 + Math.random() * 20;
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      color: palette[i % palette.length],
      delay: i * 0.025,
    };
  });

  // 4 ta yulduzcha
  const starParticles = Array.from({ length: 4 }).map((_, i) => {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const dist = 70 + Math.random() * 20;
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist - 10,
      emoji: stars[i % stars.length],
      delay: 0.1 + i * 0.05,
    };
  });

  return (
    <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center overflow-visible">
      {/* glow flash overlay */}
      <span className={`${flashClass} absolute inset-0 rounded-2xl`} />
      <span className="copy-flash absolute inset-0 rounded-2xl" />

      {/* double ripples */}
      <span className={`copy-ripple absolute inset-0 ${variant === "ip" ? "bg-orange-500/40" : "bg-emerald-500/40"}`} />
      <span className="copy-ripple-2 absolute inset-0" />

      {/* sparks */}
      {sparks.map((s, i) => (
        <span
          key={`spark-${i}`}
          className="spark-piece"
          style={{
            ["--dx" as any]: `${s.dx}px`,
            ["--dy" as any]: `${s.dy}px`,
            background: `linear-gradient(180deg, ${s.color}, transparent)`,
            boxShadow: `0 0 10px ${s.color}`,
            animationDelay: `${s.delay}s`,
            transformOrigin: "center",
            transform: `rotate(${Math.atan2(s.dy, s.dx) * (180 / Math.PI) + 90}deg)`,
          }}
        />
      ))}

      {/* confetti */}
      {confetti.map((c, i) => (
        <span
          key={`conf-${i}`}
          className="confetti-piece"
          style={{
            ["--dx" as any]: `${c.dx}px`,
            ["--dy" as any]: `${c.dy}px`,
            width: `${c.size}px`,
            height: c.isRect ? `${c.size * 0.4}px` : `${c.size}px`,
            background: c.color,
            borderRadius: c.isRect ? "2px" : "50%",
            boxShadow: `0 0 8px ${c.color}80`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      {/* yulduzlar */}
      {starParticles.map((s, i) => (
        <span
          key={`star-${i}`}
          className="star-piece"
          style={{
            ["--dx" as any]: `${s.dx}px`,
            ["--dy" as any]: `${s.dy}px`,
            animationDelay: `${s.delay}s`,
          }}
        >
          {s.emoji}
        </span>
      ))}

      {/* success pill */}
      <div className={`copy-pop absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full ${
        variant === "ip"
          ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
          : "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
      } text-white text-[11px] font-black uppercase tracking-widest shadow-[0_10px_30px_-5px_rgba(74,222,128,0.7)] flex items-center gap-2 whitespace-nowrap`}>
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
          <path className="check-draw" d="M5 12l5 5L20 7" />
        </svg>
        {label}
      </div>
    </div>
  );
}

export default function Hero() {
  const { config } = useSiteConfig();
  const ip = config.links.serverIp;
  const promoCode = config.links.promoCode;
  const promoBonus = config.links.promoBonus;
  const serverVersion = config.links.serverVersion;

  const [ipBursts, setIpBursts] = useState<Burst[]>([]);
  const [promoBursts, setPromoBursts] = useState<Burst[]>([]);
  const [ipShake, setIpShake] = useState(0);
  const [promoShake, setPromoShake] = useState(0);
  const burstId = useRef(0);
  const [onlinePlayers, setOnlinePlayers] = useState(127);
  const [totalPlayers, setTotalPlayers] = useState(() => {
    const savedTotal = localStorage.getItem("ragesmp_total_players");
    if (savedTotal) {
      const num = parseInt(savedTotal, 10);
      if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K+`;
      }
      return `${num}+`;
    }
    return "3.4K+";
  });
  const [serverStatus, setServerStatus] = useState(true);

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await fetch(`https://api.mcsrvstat.us/3/${ip}`);
        const data = await response.json();
        
        if (data.online) {
          setServerStatus(true);
          setOnlinePlayers(data.players.online);
          
          let newTotal = 0;
          if (data.players.uuid) {
            newTotal = data.players.uuid.length;
          }
          
          const savedTotal = localStorage.getItem("ragesmp_total_players");
          let maxTotal = savedTotal ? parseInt(savedTotal, 10) : 0;
          
          if (newTotal > maxTotal) {
            maxTotal = newTotal;
            localStorage.setItem("ragesmp_total_players", String(maxTotal));
          }
          
          if (maxTotal >= 1000) {
            setTotalPlayers(`${(maxTotal / 1000).toFixed(1)}K+`);
          } else {
            setTotalPlayers(`${maxTotal}+`);
          }
        } else {
          setServerStatus(false);
          setOnlinePlayers(0);
        }
      } catch (error) {
        console.error("Failed to fetch server status:", error);
      }
    };

    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 30000);

    return () => clearInterval(interval);
  }, [ip]);

  const copyIp = async () => {
    try {
      await navigator.clipboard.writeText(ip);
    } catch {}
    const id = ++burstId.current;
    setIpBursts((b) => [...b, { id }]);
    setIpShake((k) => k + 1);
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
  };

  const copyPromo = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
    } catch {}
    const id = ++burstId.current;
    setPromoBursts((b) => [...b, { id }]);
    setPromoShake((k) => k + 1);
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
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
              <span className={`absolute inset-0 rounded-full animate-ping ${serverStatus ? "bg-emerald-500" : "bg-red-500"}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${serverStatus ? "bg-emerald-500" : "bg-red-500"}`} />
            </span>
            {serverStatus ? "ONLINE" : "OFFLINE"} — {serverVersion}
          </div>

          <h1 className="mt-4 sm:mt-6 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95]">
            Olovli<br />
            <span className="fire-text">RageSMP</span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-xl">
            O'zbekistondagi eng qaynoq SMP server. Do'stlaring bilan o'yna,
            va maxsus donatlarni qo'lga kirit!
          </p>

          {/* IP + Promo bir qatorda */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch gap-3">
            {/* IP block */}
            <div className="relative group flex-1">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-700" />
              <button
                key={`ip-${ipShake}`}
                onClick={copyIp}
                className={`relative w-full flex items-center justify-between gap-3 rounded-2xl border border-orange-500/40 bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl px-4 sm:px-5 py-3 sm:py-3.5 hover:border-orange-500 hover:scale-[1.015] active:scale-[0.98] transition-all ${ipShake > 0 ? "copy-shake" : ""}`}
              >
                <div className="text-left min-w-0">
                  <div className="text-[9px] uppercase tracking-[0.3em] text-orange-500 font-black">Server IP</div>
                  <div className="mt-0.5 font-mono font-black text-base sm:text-xl text-neutral-900 dark:text-white tracking-wide truncate">{ip}</div>
                </div>
                <span className="relative grid place-items-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl fire-gradient text-white flex-shrink-0 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </span>
                {ipBursts.map((b) => (
                  <CopyBurst key={b.id} variant="ip" label="✓ IP nusxalandi" onDone={() => setIpBursts((arr) => arr.filter((x) => x.id !== b.id))} />
                ))}
              </button>
            </div>

            {/* Promo block — IP ning o'ng tarafida, kichikroq */}
            <div className="relative group sm:w-[44%] sm:max-w-[280px]">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 rounded-2xl blur opacity-40 group-hover:opacity-75 transition duration-1000" />
              <button
                key={`promo-${promoShake}`}
                onClick={copyPromo}
                className={`relative w-full flex items-center gap-2.5 rounded-2xl border border-emerald-400/50 bg-gradient-to-r from-emerald-900/85 via-emerald-800/85 to-cyan-900/85 px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-xl shadow-lg shadow-emerald-500/25 hover:scale-[1.015] active:scale-[0.98] transition-transform ${promoShake > 0 ? "copy-shake" : ""}`}
              >
                <div className="text-base sm:text-lg float-soft">🎟️</div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <code className="font-mono text-xs sm:text-sm font-black text-white drop-shadow-[0_0_12px_rgba(74,222,128,0.7)] tracking-tight truncate">{promoCode}</code>
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-emerald-200 mt-0.5 truncate">
                    {promoBonus}
                  </div>
                </div>
                <span className="flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-emerald-500/30 border border-emerald-400/50 grid place-items-center text-emerald-200 group-hover:bg-emerald-500/50 group-hover:scale-110 transition-all">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </span>
                {promoBursts.map((b) => (
                  <CopyBurst key={b.id} variant="promo" label="✓ Promo nusxalandi" onDone={() => setPromoBursts((arr) => arr.filter((x) => x.id !== b.id))} />
                ))}
              </button>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#donate"
              onClick={() => window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light")}
              className="group relative flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-xl text-white font-bold fire-gradient shadow-xl shadow-orange-500/40 hover:shadow-orange-500/60 hover:scale-[1.02] active:scale-[0.98] transition-all shine-on-hover"
            >
              <span>🔥 Donat olish</span>
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
          </div>

          {/* mini-stats */}
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            {[
              { label: "Online", value: String(onlinePlayers) },
              { label: "Ro'yxatdan", value: totalPlayers },
              { label: "Uptime", value: "99.9%" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-orange-500/20 bg-white/60 dark:bg-white/[0.03] backdrop-blur p-3 text-center hover:border-orange-500/60 hover:-translate-y-1 transition-all duration-500">
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
          <div className="absolute inset-8 rounded-full border border-orange-500/20 spin-reverse" />
          <div className="absolute inset-16 rounded-full border border-orange-500/10" />

          {/* center diamond/orb */}
          <div
            ref={orbRef}
            className="absolute inset-24 rounded-full fire-gradient grid place-items-center shadow-[0_0_80px_rgba(255,90,0,0.6)] flicker"
            style={{
              transition: "transform 0.35s cubic-bezier(.22,1,.36,1)",
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
                <div className="relative h-14 w-14 rounded-2xl glass border border-orange-500/40 grid place-items-center text-2xl shadow-lg hover:scale-110 transition-transform float-soft">
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
