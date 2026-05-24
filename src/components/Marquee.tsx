const items = [
  "🔥 RageSMP",
  "💸 Donate",
  "🧩 1.12.2 - 1.21.11",
  "📲 Telegram",
  "🛡️ SMP",
  "🎟️ /promo vebuca",
  "🇺🇿 Uzbekistan",
];

export default function Marquee() {
  const arr = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-orange-500/20 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 py-4">
      <div className="flex gap-12 marquee-track whitespace-nowrap will-change-transform">
        {arr.map((t, i) => (
          <span key={i} className="text-lg font-black tracking-wider text-neutral-400 dark:text-neutral-500 hover:text-orange-500 transition-colors">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
