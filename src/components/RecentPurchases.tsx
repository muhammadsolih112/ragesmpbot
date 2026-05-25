import { useState } from "react";
import { recentPurchases, topDonators, fmtUZS, donations as defaultDonations } from "../data/donations";

export default function RecentPurchases() {
  const [tab, setTab] = useState<"recent" | "top">("recent");

  return (
    <section id="recent" className="relative py-24 reveal">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-semibold text-orange-600 dark:text-orange-300">
            📊 STATISTIKA
          </div>
          <h2 className="mt-4 text-4xl sm:text-5xl font-black tracking-tighter">
            Sotib olingan <span className="fire-text">donatlar</span>
          </h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Telegram bot orqali sotib olingan barcha donatlar shu yerda jonli ko'rsatiladi.
          </p>
        </div>

        {/* tabs */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex p-1 rounded-full border border-orange-500/20 bg-white/70 dark:bg-white/5 backdrop-blur">
            <TabBtn active={tab === "recent"} onClick={() => setTab("recent")}>So'nggi xaridlar</TabBtn>
            <TabBtn active={tab === "top"} onClick={() => setTab("top")}>TOP donaterlar</TabBtn>
          </div>
        </div>

        <div className="mt-10">
          {tab === "recent" ? <RecentList /> : <TopList />}
        </div>
      </div>
    </section>
  );
}

function TabBtn({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
        active
          ? "text-white fire-gradient shadow-md shadow-orange-500/40"
          : "text-neutral-600 dark:text-neutral-300 hover:text-orange-500"
      }`}
    >
      {children}
    </button>
  );
}

function pkgColor(pkg: string) {
  const d = defaultDonations.find((x) => x.name === pkg);
  return d?.color ?? "from-orange-500 to-red-500";
}
function pkgEmoji(pkg: string) {
  const d = defaultDonations.find((x) => x.name === pkg);
  return d?.emoji ?? "🔥";
}

function RecentList() {
  const mergedPurchases = recentPurchases.map((p) => ({ ...p, source: "demo" }));

  return (
    <div className="rounded-3xl border border-orange-500/20 bg-white/70 dark:bg-white/[0.03] backdrop-blur overflow-hidden">
      <div className="hidden md:grid grid-cols-12 px-6 py-3 text-[11px] uppercase tracking-widest text-neutral-500 border-b border-orange-500/10 font-semibold">
        <div className="col-span-1">#</div>
        <div className="col-span-4">O'yinchi</div>
        <div className="col-span-3">Paket</div>
        <div className="col-span-2">Narx</div>
        <div className="col-span-2 text-right">Vaqt</div>
      </div>
      <ul className="divide-y divide-orange-500/10">
        {mergedPurchases.map((p, i) => (
          <li
            key={i}
            className="grid grid-cols-2 md:grid-cols-12 items-center gap-y-2 px-6 py-4 hover:bg-orange-500/5 transition-colors reveal"
            style={{ transitionDelay: `${(i % 10) * 0.05}s` }}
          >
            <div className="hidden md:block col-span-1 text-sm font-mono text-neutral-400">#{(i + 1).toString().padStart(3, "0")}</div>
            <div className="col-span-1 md:col-span-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${pkgColor(p.pkg)} grid place-items-center text-white font-black text-sm shadow`}>
                {p.player[0]}
              </div>
              <div>
                <div className="font-semibold text-sm">{p.player}</div>
                <div className="text-[11px] text-neutral-500 md:hidden">{p.time}</div>
              </div>
            </div>
            <div className="col-span-1 md:col-span-3">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black text-white bg-gradient-to-r ${pkgColor(p.pkg)} shadow-sm`}>
                <span>{pkgEmoji(p.pkg)}</span>
                <span>{p.pkg}</span>
              </span>
            </div>
            <div className="col-span-1 md:col-span-2 font-bold text-orange-500 text-sm">{fmtUZS(p.price)}</div>
            <div className="col-span-1 md:col-span-2 text-right text-xs text-neutral-500 font-medium">{p.time}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TopList() {
  const max = Math.max(...topDonators.map((t) => t.total));
  return (
    <div className="grid gap-3">
      {topDonators.map((t, i) => {
        const pct = (t.total / max) * 100;
        const medal = ["🥇", "🥈", "🥉"][i] ?? `#${i + 1}`;
        return (
          <div
            key={t.player}
            className="relative rounded-2xl border border-orange-500/20 bg-white/70 dark:bg-white/[0.03] backdrop-blur p-5 overflow-hidden reveal"
            style={{ transitionDelay: `${i * 0.08}s` }}
          >
            <div
              className="absolute inset-y-0 left-0 fire-gradient opacity-10"
              style={{ width: `${pct}%` }}
            />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl w-10 text-center">{medal}</div>
                <div>
                  <div className="font-bold text-lg">{t.player}</div>
                  <div className="text-xs text-neutral-500">{t.packages} ta paket sotib olgan</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-black fire-text text-xl">{fmtUZS(t.total)}</div>
                <div className="text-[10px] uppercase tracking-widest text-neutral-500">Jami</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


