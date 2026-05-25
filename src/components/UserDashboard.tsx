import { useState, useEffect, useRef } from "react";
import type { User, Transaction } from "../data/store";
import { donations, fmtUZS, type Donation } from "../data/donations";

function FloatingText({ value, color }: { value: string; color: string }) {
  return (
    <div className={`absolute -top-6 left-1/2 -translate-x-1/2 font-black text-sm animate-bounce-out ${color} pointer-events-none`}>
      {value}
    </div>
  );
}

function BalanceDisplay({ label, value, icon, color, unit, unitColor, bg }: { label: string; value: number; icon: string; color: string; unit: string; unitColor: string; bg: string }) {
  const prevValue = useRef(value);
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    if (value > prevValue.current) {
      setDiff(value - prevValue.current);
      const timer = setTimeout(() => setDiff(null), 2000);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
    prevValue.current = value;
  }, [value]);

  return (
    <div className="relative">
      <div className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">{icon} {label}</div>
      <div className={`text-xl font-black ${color} mt-1 flex items-center gap-1.5 relative`}>
        {value.toLocaleString()}
        <span className={`text-[10px] ${bg} px-1.5 py-0.5 rounded ${unitColor}`}>{unit}</span>
        {diff !== null && <FloatingText value={`+${diff.toLocaleString()}`} color={color} />}
      </div>
    </div>
  );
}

export default function UserDashboard({
  user,
  txs,
  onLogout,
  onBack,
  onBuy,
}: {
  user: User;
  txs: Transaction[];
  onLogout: () => void;
  onBack: () => void;
  onBuy: (d: Donation) => void;
}) {
  const myTxs = txs.filter((t) => t.player.toLowerCase() === user.nick.toLowerCase());
  const currentDonation = donations.find((d) => d.name.toLowerCase() === user.rank.toLowerCase());

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#08080c] text-neutral-900 dark:text-neutral-100 pt-28 pb-20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full animate-pulse-slow" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-orange-500/20">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-500/30 bg-white dark:bg-white/5 hover:border-orange-500 transition-colors text-sm font-semibold"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Asosiy saytga qaytish
            </button>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Shaxsiy <span className="fire-text">Kabinet</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-bold">{user.nick}</div>
              <div className="text-xs text-neutral-500 capitalize">{user.role}</div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all text-sm font-semibold"
            >
              Chiqish
            </button>
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-3 gap-8">
          {/* Left: User Profile & Rank Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="relative rounded-3xl border border-orange-500/30 bg-white/70 dark:bg-white/[0.03] backdrop-blur p-6 overflow-hidden shadow-xl shadow-orange-500/10">
              <div className="absolute top-0 right-0 h-32 w-32 bg-orange-500/20 blur-2xl rounded-full" />
              <div className="relative flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl fire-gradient grid place-items-center text-white text-2xl font-black shadow-lg shadow-orange-500/40">
                  {user.nick[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{user.nick}</h2>
                  <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-semibold text-orange-600 dark:text-orange-400">
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500" />
                    Daraja: {user.rank}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-orange-500/20 grid grid-cols-2 gap-4">
                <BalanceDisplay 
                  label="Pointlar" 
                  value={user.points} 
                  icon="💎" 
                  color="text-blue-500" 
                  unit="PTS" 
                  unitColor="text-blue-600" 
                  bg="bg-blue-500/10" 
                />
                <BalanceDisplay 
                  label="Shardlar" 
                  value={user.shards} 
                  icon="🔮" 
                  color="text-purple-500" 
                  unit="SHD" 
                  unitColor="text-purple-600" 
                  bg="bg-purple-500/10" 
                />
                <div>
                  <div className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">💰 Jami xarajat</div>
                  <div className="text-xl font-black fire-text mt-1">{fmtUZS(user.spent)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">📅 Ro'yxatdan o'tgan</div>
                  <div className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mt-1.5 font-mono">{user.regDate}</div>
                </div>
              </div>

              {currentDonation && (
                <div className="mt-6 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20">
                  <div className="text-xs font-bold text-orange-500 uppercase tracking-widest">Faol Imkoniyatlar</div>
                  <ul className="mt-2 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                    {currentDonation.perks.slice(0, 4).map((p) => (
                      <li key={p} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full fire-gradient" />
                        <span className="line-clamp-1">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Quick Upgrade prompt */}
            <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-500/10 p-6 text-center">
              <div className="text-3xl mb-2">🔥</div>
              <h3 className="font-black text-lg">Donatni kuchaytirish</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                Yangi imkoniyatlarga ega bo'lish uchun yuqoriroq paketni tanlang. Bot orqali avtomatik faollashadi.
              </p>
            </div>
          </div>

          {/* Right: Purchase history & Quick Buy catalog */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-3xl border border-orange-500/20 bg-white/70 dark:bg-white/[0.03] backdrop-blur p-6">
              <h3 className="text-lg font-black tracking-tight mb-4 flex items-center justify-between">
                <span>Shaxsiy Xaridlar Tarixi</span>
                <span className="text-xs font-normal text-neutral-500">{myTxs.length} ta xarid</span>
              </h3>

              {myTxs.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-sm border border-dashed border-orange-500/20 rounded-2xl">
                  Hozircha sizda xaridlar yo'q. Quyidagi paketlardan birini tanlab sotib olishingiz mumkin!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-orange-500/10 text-xs uppercase tracking-widest text-neutral-500 font-semibold">
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Paket</th>
                        <th className="py-3 px-4">Narx</th>
                        <th className="py-3 px-4">To'lov turi</th>
                        <th className="py-3 px-4">Sana</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-500/10">
                      {myTxs.map((t) => (
                        <tr key={t.id} className="hover:bg-orange-500/5 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-neutral-500">{t.id}</td>
                          <td className="py-3 px-4 font-bold text-orange-500">{t.pkg}</td>
                          <td className="py-3 px-4 font-semibold">{fmtUZS(t.price)}</td>
                          <td className="py-3 px-4 text-neutral-500 text-xs">{t.method}</td>
                          <td className="py-3 px-4 text-neutral-500 text-xs">{t.date}</td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                t.status === "To'langan"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                  : t.status === "Kutilmoqda"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Buy Catalog */}
            <div>
              <h3 className="text-lg font-black tracking-tight mb-4">Tezkor Xarid / Paketlar</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {donations.map((d) => (
                  <div key={d.id} className="rounded-2xl border border-orange-500/20 bg-white/70 dark:bg-white/[0.03] p-5 flex flex-col justify-between hover:border-orange-500/50 transition-all lift">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${d.color} grid place-items-center text-xl shadow`}>
                          {d.emoji}
                        </div>
                        <div className="text-right">
                          <div className="font-black text-lg fire-text">{fmtUZS(d.price)}</div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-widest">30 kunlik</div>
                        </div>
                      </div>
                      <h4 className="font-bold text-base mt-4">{d.name}</h4>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{d.tagline}</p>
                    </div>

                    <button
                      onClick={() => onBuy(d)}
                      className="mt-6 w-full py-2.5 rounded-xl text-white font-bold text-sm fire-gradient hover:shadow-lg hover:shadow-orange-500/40 hover:scale-[1.02] transition-all shine-on-hover"
                    >
                      Sotib olish
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
