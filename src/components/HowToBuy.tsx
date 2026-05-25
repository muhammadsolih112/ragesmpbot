import { useSiteConfig } from "../data/siteConfig";

const steps = [
  {
    n: "01",
    title: "Telegram botga o'ting",
    desc: "@RageSMP_bot ga kiring va /start tugmasini bosing.",
    icon: "💬",
  },
  {
    n: "02",
    title: "Nick'ingizni kiriting",
    desc: "Bot sizdan Minecraft o'yindagi nick'ingizni so'raydi. To'g'ri yozing!",
    icon: "🎮",
  },
  {
    n: "03",
    title: "Paketni tanlang",
    desc: "RagePro, Rage+ yoki SMP Elite paketlaridan birini tanlang.",
    icon: "🔥",
  },
  {
    n: "04",
    title: "To'lovni amalga oshiring",
    desc: "Click, Payme yoki Uzcard orqali xavfsiz tarzda to'lang.",
    icon: "💳",
  },
  {
    n: "05",
    title: "Tayyor!",
    desc: "5 soniya ichida donat avtomatik tarzda hisobingizga qo'shiladi.",
    icon: "✅",
  },
];

export default function HowToBuy() {
  const { config } = useSiteConfig();
  const botUrl = config.links.telegramBot;
  const botHandle = (() => {
    try {
      const u = new URL(botUrl);
      const path = u.pathname.replace(/\//g, "");
      return path ? `@${path}` : "@RageSMP_bot";
    } catch {
      return "@RageSMP_bot";
    }
  })();

  return (
    <section id="how" className="relative py-24 overflow-hidden reveal">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute -top-20 left-1/2 h-[430px] w-[620px] -translate-x-1/2 rounded-full bg-orange-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-semibold text-orange-600 dark:text-orange-300">
            📦 SOTIB OLISH BOSQICHLARI
          </div>
          <h2 className="mt-4 text-4xl sm:text-5xl font-black tracking-tighter">
            <span className="fire-text">5 ta oddiy</span> qadam
          </h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Telegram bot orqali donat sotib olish 1 daqiqada amalga oshadi.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          {steps.map((s, i) => (
            <div key={s.n} className={`relative reveal reveal-delay-${(i % 3) + 1}`}>
              <div className="h-full rounded-2xl border border-orange-500/20 bg-white/70 dark:bg-white/[0.03] backdrop-blur p-5 hover:border-orange-500/60 transition-colors lift">
                <div className="flex items-start justify-between">
                  <div className="text-4xl">{s.icon}</div>
                  <div className="text-2xl font-black fire-text opacity-70">{s.n}</div>
                </div>
                <h3 className="mt-4 font-bold text-lg">{s.title}</h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="pointer-events-none absolute top-1/2 -right-6 z-20 hidden -translate-y-1/2 text-orange-500/55 lg:block">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <a
            href={botUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-white font-bold fire-gradient shadow-xl shadow-orange-500/40 hover:shadow-orange-500/60 hover:scale-[1.03] transition-all shine-on-hover"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21.95 4.36 18.7 19.7c-.24 1.08-.88 1.34-1.78.83l-4.92-3.62-2.37 2.28c-.26.26-.48.48-.99.48l.35-5.02 9.13-8.25c.4-.35-.09-.55-.62-.2L6.21 13.05 1.34 11.5c-1.06-.34-1.08-1.06.22-1.57L20.59 2.9c.88-.34 1.65.21 1.36 1.46z"/></svg>
            {botHandle} ga o'tish
          </a>
        </div>
      </div>
    </section>
  );
}
