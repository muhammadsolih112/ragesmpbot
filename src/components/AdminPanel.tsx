import { useState } from "react";
import type { User, Transaction } from "../data/store";
import { fmtUZS } from "../data/donations";

export default function AdminPanel({
  users,
  txs,
  userTrash,
  txTrash,
  onUpdateTxStatus,
  onDeleteTx,
  onRestoreTx,
  onPermanentDeleteTx,
  onUpdateUserRank,
  onDeleteUser,
  onRestoreUser,
  onPermanentDeleteUser,
  onAddSimulatedTx,
  onLogout,
  onBack,
}: {
  users: User[];
  txs: Transaction[];
  userTrash: User[];
  txTrash: Transaction[];
  onUpdateTxStatus: (id: string, status: Transaction["status"]) => void;
  onDeleteTx: (id: string) => void;
  onRestoreTx: (id: string) => void;
  onPermanentDeleteTx: (id: string) => void;
  onUpdateUserRank: (nick: string, rank: string) => void;
  onDeleteUser: (nick: string) => void;
  onRestoreUser: (nick: string) => void;
  onPermanentDeleteUser: (nick: string) => void;
  onAddSimulatedTx: (player: string, pkg: string, price: number, method: Transaction["method"]) => void;
  onLogout: () => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<"overview" | "txs" | "users" | "simulate">("overview");

  // Search & Filters for Txs
  const [searchTx, setSearchTx] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("Barchasi");
  const [txTrashSearch, setTxTrashSearch] = useState("");

  // Search for Users
  const [searchUser, setSearchUser] = useState("");
  const [userTrashSearch, setUserTrashSearch] = useState("");

  // Simulated Tx Form State
  const [simPlayer, setSimPlayer] = useState("");
  const [simPkg, setSimPkg] = useState("SMP Elite");
  const [simPrice, setSimPrice] = useState(50000);
  const [simMethod, setSimMethod] = useState<Transaction["method"]>("Payme");
  const [simMsg, setSimMsg] = useState("");

  const handleQuickAction = async (t: Transaction, status: Transaction["status"]) => {
    onUpdateTxStatus(t.id, status);
    
    // Telegram bildirishnoma yuborish
    if (t.telegramId) {
      try {
        const text = status === "To'langan" 
          ? `✅🎉 <b>Chekingiz tasdiqlandi!</b>\n\n🎮 Endi o'yinga kirib-chiqib, sotib olgan narsalaringizni tekshirib ko'rishingiz mumkin.\n\n🛒 Xarid: <b>${t.pkg}</b>\n💰 Summa: <b>${fmtUZS(t.price)}</b>\n\n🔥 RageSMP bilan zavqlaning!`
          : `❌ <b>To'lovingiz bekor qilingan.</b>\n\nIltimos, qaytadan urinib ko'ring yoki admin bilan bog'laning.\n\n🛒 Xarid: <b>${t.pkg}</b>`;

        await fetch(`https://api.telegram.org/bot8344846056:AAGYdpzJKbT452VbDre6iksZGC9rzlHmZZ8/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: t.telegramId,
            text,
            parse_mode: "HTML"
          })
        });
      } catch (err) {
        console.error("Notification error:", err);
      }
    }
  };

  const allTxs = txs.map((t) => ({ ...t, source: "site", password: "" }));

  // Calculated metrics
  const totalRev = txs.filter((t) => t.status === "To'langan").reduce((s, t) => s + t.price, 0);
  const pendingCount = txs.filter((t) => t.status === "Kutilmoqda").length;
  const totalSales = txs.filter((t) => t.status === "To'langan").length;

  const filteredTxs = allTxs.filter((t) => {
    const matchSearch = t.player.toLowerCase().includes(searchTx.toLowerCase()) || t.pkg.toLowerCase().includes(searchTx.toLowerCase());
    const matchStatus = filterStatus === "Barchasi" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const filteredTxTrash = txTrash.filter((t) => {
    const q = txTrashSearch.toLowerCase();
    return t.player.toLowerCase().includes(q) || t.pkg.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
  });

  const filteredUsers = users.filter((u) => u.nick.toLowerCase().includes(searchUser.toLowerCase()));
  const filteredUserTrash = userTrash.filter((u) => u.nick.toLowerCase().includes(userTrashSearch.toLowerCase()));

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simPlayer) return;
    onAddSimulatedTx(simPlayer, simPkg, Number(simPrice), simMethod);
    setSimMsg("To'lov muvaffaqiyatli qo'shildi va kutilmoqda holatida tushdi!");
    setTimeout(() => setSimMsg(""), 2500);
    setSimPlayer("");
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#08080c] text-neutral-900 dark:text-neutral-100 pt-28 pb-20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full animate-pulse-slow" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-orange-500/20">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-500/30 bg-white dark:bg-white/5 hover:border-orange-500 transition-colors text-sm font-semibold"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Asosiy saytga qaytish
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flicker">
                Rage<span className="fire-text">SMP</span> Boshqaruv Paneli
              </h1>
              <div className="text-xs text-neutral-500 mt-0.5">Admin: <span className="text-orange-500 font-bold">vebuca</span></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all text-sm font-semibold"
            >
              Admin paneldan chiqish
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-orange-500/10 pb-4">
          {[
            { id: "overview", label: "📊 Umumiy Hisobot" },
            { id: "txs", label: `📦 Barcha To'lovlar (${allTxs.length})` },
            { id: "users", label: `👥 Foydalanuvchilar (${users.length})` },
            { id: "simulate", label: "⚡ To'lov Qo'shish (Test)" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t.id
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30"
                  : "bg-white dark:bg-white/5 border border-orange-500/20 text-neutral-600 dark:text-neutral-300 hover:border-orange-500/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {tab === "overview" && (
          <div className="mt-8 space-y-8 fade-up">
            {/* Top Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Taqdiqlangan Daromad", value: fmtUZS(totalRev), sub: "To'langan barcha xaridlar", color: "from-amber-500 to-orange-500", icon: "💰" },
                { label: "Kutilayotgan To'lovlar", value: pendingCount, sub: "Tekshiruvdagi arizalar", color: "from-orange-500 to-red-500", icon: "⏳" },
                { label: "Sotilgan Paketlar", value: totalSales, sub: "Faol donatlar soni", color: "from-red-500 to-rose-500", icon: "📦" },
                { label: "Jami Foydalanuvchilar", value: users.length, sub: "Ro'yxatdan o'tgan o'yinchilar", color: "from-rose-500 to-amber-500", icon: "👥" },
              ].map((c, i) => (
                <div key={i} className="relative group rounded-3xl border border-orange-500/20 bg-white dark:bg-white/[0.03] p-6 overflow-hidden shadow-xl shadow-orange-500/5 hover:border-orange-500/50 transition-all duration-500">
                  <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-br ${c.color} opacity-10 blur-2xl rounded-full group-hover:opacity-20 transition-opacity`} />
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-neutral-500 font-bold">{c.label}</div>
                      <div className="text-2xl sm:text-3xl font-black fire-text mt-2">{c.value}</div>
                    </div>
                    <div className="text-2xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all">{c.icon}</div>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-2 font-medium">{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Pending Requests (Highlighted) */}
            {pendingCount > 0 && (
              <div className="rounded-[32px] border-2 border-orange-500/30 bg-orange-500/5 p-6 animate-pulse-slow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/40">
                      <svg className="h-6 w-6 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <h3 className="text-xl font-black tracking-tight">Kutilayotgan yangi buyurtmalar</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest">DIQQAT</span>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allTxs.filter(t => t.status === "Kutilmoqda").slice(0, 6).map((t) => (
                    <div key={t.id} className="bg-white dark:bg-[#12121a] rounded-2xl p-4 border border-orange-500/20 shadow-lg hover:scale-[1.02] transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-black text-sm">{t.player}</div>
                          <div className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">{t.pkg}</div>
                        </div>
                        <div className="font-mono font-bold text-xs text-neutral-500">{t.id}</div>
                      </div>
                      <div className="mt-3 font-black text-lg fire-text">{fmtUZS(t.price)}</div>
                      <div className="mt-4 flex gap-2">
                        <button 
                          onClick={() => handleQuickAction(t, "To'langan")}
                          className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-[11px] font-black hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all"
                        >
                          TASDIQLASH
                        </button>
                        <button 
                          onClick={() => handleQuickAction(t, "Bekor qilingan")}
                          className="flex-1 py-2 rounded-xl bg-red-500 text-white text-[11px] font-black hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
                        >
                          RAD ETISH
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Stats Bar */}
            <div className="rounded-3xl border border-orange-500/20 bg-white dark:bg-white/[0.03] p-6 shadow-xl shadow-orange-500/5">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Sotuvlar taqsimoti
              </h3>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-black">Paketlar</h4>
                  {["SMP Elite", "Rage+", "RagePro"].map((pkg) => {
                    const count = allTxs.filter((t) => t.pkg === pkg && t.status === "To'langan").length;
                    const max = Math.max(...["SMP Elite", "Rage+", "RagePro"].map((p) => allTxs.filter((x) => x.pkg === p && x.status === "To'langan").length), 1);
                    const pct = (count / max) * 100;
                    return (
                      <div key={pkg} className="space-y-2 group">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="group-hover:text-orange-500 transition-colors">{pkg}</span>
                          <span className="text-neutral-500">{count} ta</span>
                        </div>
                        <div className="h-2.5 w-full bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5">
                          <div className="h-full rounded-full fire-gradient transition-all duration-1000" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-6">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-black">Boshqalar</h4>
                  {["Unban", "Unmute", "1.000 Point", "1.000 Shards"].map((pkg) => {
                    const count = allTxs.filter((t) => t.pkg === pkg && t.status === "To'langan").length;
                    const max = Math.max(...["Unban", "Unmute", "1.000 Point", "1.000 Shards"].map((p) => allTxs.filter((x) => x.pkg === p && x.status === "To'langan").length), 1);
                    const pct = (count / max) * 100;
                    return (
                      <div key={pkg} className="space-y-2 group">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="group-hover:text-blue-500 transition-colors">{pkg}</span>
                          <span className="text-neutral-500">{count} ta</span>
                        </div>
                        <div className="h-2.5 w-full bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent 5 transactions overview */}
            <div className="rounded-3xl border border-orange-500/20 bg-white dark:bg-white/[0.03] p-6 shadow-xl shadow-orange-500/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  So'nggi harakatlar
                </h3>
                <button onClick={() => setTab("txs")} className="text-xs font-black text-orange-500 uppercase tracking-widest hover:underline">
                  Barchasini ko'rish →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-orange-500/10 text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-black">
                      <th className="py-3 px-4">O'yinchi</th>
                      <th className="py-3 px-4">Paket</th>
                      <th className="py-3 px-4">Narx</th>
                      <th className="py-3 px-4">Sana</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-500/10">
                    {allTxs.slice(0, 8).map((t) => (
                      <tr key={t.id} className="hover:bg-orange-500/5 transition-colors group">
                        <td className="py-3 px-4 font-black">{t.player}</td>
                        <td className="py-3 px-4 font-bold text-orange-500">{t.pkg}</td>
                        <td className="py-3 px-4 font-mono font-bold">{fmtUZS(t.price)}</td>
                        <td className="py-3 px-4 text-[11px] text-neutral-500 font-medium">{t.date}</td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                              t.status === "To'langan"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : t.status === "Kutilmoqda"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse"
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
            </div>
          </div>
        )}

        {/* Tab 2: Transactions */}
        {tab === "txs" && (
          <div className="mt-8 space-y-6 fade-up">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-white/[0.03] p-4 rounded-2xl border border-orange-500/20">
              <input
                type="text"
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
                placeholder="O'yinchi yoki paket bo'yicha qidirish..."
                className="px-4 py-2.5 rounded-xl border border-orange-500/30 bg-neutral-50 dark:bg-white/[0.03] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none text-sm w-full sm:w-80"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">Filtr:</span>
                {["Barchasi", "To'langan", "Kutilmoqda", "Bekor qilingan"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filterStatus === st
                        ? "bg-orange-500 text-white shadow"
                        : "bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 hover:bg-orange-500/20"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-orange-500/20 bg-white dark:bg-white/[0.03] overflow-hidden shadow-xl shadow-orange-500/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-orange-500/10 text-xs uppercase tracking-widest text-neutral-500 font-semibold bg-orange-500/5">
                      <th className="py-3.5 px-6">ID / Sana</th>
                      <th className="py-3.5 px-6">O'yinchi</th>
                      <th className="py-3.5 px-6">Paket</th>
                      <th className="py-3.5 px-6">To'lov / Turi</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-500/10">
                    {filteredTxs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-24 text-center">
                          <div className="flex flex-col items-center justify-center gap-3 opacity-30">
                            <div className="text-6xl">📭</div>
                            <div className="text-sm font-black uppercase tracking-widest">To'lovlar topilmadi</div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredTxs.map((t) => (
                        <tr key={t.id} className="hover:bg-orange-500/5 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="font-mono font-bold text-xs text-neutral-600 dark:text-neutral-400 group-hover:text-orange-500 transition-colors">{t.id}</div>
                            <div className="text-[10px] text-neutral-500 mt-1 font-medium">{t.date}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-black text-sm">{t.player}</div>
                            {t.telegramId && <div className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">TG: {t.telegramId}</div>}
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black text-white fire-gradient shadow-sm uppercase tracking-wider">
                              {t.pkg}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-black text-orange-500 text-base">{fmtUZS(t.price)}</div>
                            <div className="text-[10px] text-neutral-500 mt-1 font-bold uppercase tracking-widest">{t.method}</div>
                            {t.receiptImage && (
                              <button 
                                onClick={() => {
                                  const win = window.open("");
                                  win?.document.write(`
                                    <html>
                                      <body style="margin:0; background:#000; display:grid; place-items:center; min-height:100vh;">
                                        <img src="${t.receiptImage}" style="max-width:95%; max-height:95vh; border-radius:12px; box-shadow:0 0 50px rgba(0,0,0,0.5);">
                                      </body>
                                    </html>
                                  `);
                                }}
                                className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[9px] text-blue-500 font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                              >
                                🖼️ Chekni ko'rish
                              </button>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                t.status === "To'langan"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                  : t.status === "Kutilmoqda"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse"
                                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {t.status === "Kutilmoqda" && (
                                <>
                                  <button
                                    onClick={() => handleQuickAction(t, "To'langan")}
                                    className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:scale-110 active:scale-95 shadow-lg shadow-emerald-500/30 transition-all"
                                    title="Tasdiqlash"
                                  >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                                  </button>
                                  <button
                                    onClick={() => handleQuickAction(t, "Bekor qilingan")}
                                    className="h-9 w-9 rounded-xl bg-red-500 text-white flex items-center justify-center hover:scale-110 active:scale-95 shadow-lg shadow-red-500/30 transition-all"
                                    title="Rad etish"
                                  >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12"/></svg>
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => onDeleteTx(t.id)}
                                className="h-9 w-9 rounded-xl bg-neutral-100 dark:bg-white/5 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                title="O'chirish"
                              >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl border border-red-500/20 bg-white dark:bg-white/[0.03] overflow-hidden shadow-xl shadow-red-500/5">
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-red-500/10">
                <div>
                  <h3 className="text-lg font-black text-red-500">Barcha to'lovlar korzinkasi</h3>
                  <p className="text-xs text-neutral-500 mt-1">O'chirilgan to'lovlar 30 kundan keyin avtomatik tozalanadi.</p>
                </div>
                <input
                  value={txTrashSearch}
                  onChange={(e) => setTxTrashSearch(e.target.value)}
                  placeholder="Korzinkadan o'yinchi yoki paket qidirish..."
                  className="px-4 py-2.5 rounded-xl border border-red-500/30 bg-neutral-50 dark:bg-white/[0.03] focus:border-red-500 focus:ring-2 focus:ring-red-500/30 outline-none text-sm w-full sm:w-80"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-red-500/10 text-xs uppercase tracking-widest text-neutral-500 font-semibold bg-red-500/5">
                      <th className="py-3.5 px-6">ID / O'chirilgan vaqt</th>
                      <th className="py-3.5 px-6">O'yinchi</th>
                      <th className="py-3.5 px-6">Paket</th>
                      <th className="py-3.5 px-6">Narx</th>
                      <th className="py-3.5 px-6 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-500/10">
                    {filteredTxTrash.length === 0 ? (
                      <tr><td colSpan={5} className="py-10 text-center text-neutral-500 text-sm">To'lovlar korzinkasi bo'sh.</td></tr>
                    ) : filteredTxTrash.map((t) => (
                      <tr key={t.id} className="hover:bg-red-500/5 transition-colors">
                        <td className="py-4 px-6"><div className="font-mono font-bold text-xs">{t.id}</div><div className="text-[11px] text-red-500 mt-0.5">{t.deletedAtLabel || t.deletedAt}</div></td>
                        <td className="py-4 px-6 font-bold">{t.player}</td>
                        <td className="py-4 px-6 text-orange-500 font-semibold">{t.pkg}</td>
                        <td className="py-4 px-6 font-bold">{fmtUZS(t.price)}</td>
                        <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                          <button onClick={() => onRestoreTx(t.id)} className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors text-xs font-semibold">Qaytarish</button>
                          <button onClick={() => onPermanentDeleteTx(t.id)} className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-colors text-xs font-semibold">Butunlay o'chirish</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl border border-red-500/20 bg-white dark:bg-white/[0.03] overflow-hidden shadow-xl shadow-red-500/5">
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-red-500/10">
                <div>
                  <h3 className="text-lg font-black text-red-500">Foydalanuvchilar korzinkasi</h3>
                  <p className="text-xs text-neutral-500 mt-1">O'chirilgan foydalanuvchilar 30 kundan keyin avtomatik tozalanadi.</p>
                </div>
                <input
                  value={userTrashSearch}
                  onChange={(e) => setUserTrashSearch(e.target.value)}
                  placeholder="Korzinkadan foydalanuvchi qidirish..."
                  className="px-4 py-2.5 rounded-xl border border-red-500/30 bg-neutral-50 dark:bg-white/[0.03] focus:border-red-500 focus:ring-2 focus:ring-red-500/30 outline-none text-sm w-full sm:w-80"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-red-500/10 text-xs uppercase tracking-widest text-neutral-500 font-semibold bg-red-500/5">
                      <th className="py-3.5 px-6">Nick / O'chirilgan vaqt</th>
                      <th className="py-3.5 px-6">Rank</th>
                      <th className="py-3.5 px-6">Jami xarajat</th>
                      <th className="py-3.5 px-6">Rol</th>
                      <th className="py-3.5 px-6 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-500/10">
                    {filteredUserTrash.length === 0 ? (
                      <tr><td colSpan={5} className="py-10 text-center text-neutral-500 text-sm">Foydalanuvchilar korzinkasi bo'sh.</td></tr>
                    ) : filteredUserTrash.map((u) => (
                      <tr key={u.nick} className="hover:bg-red-500/5 transition-colors">
                        <td className="py-4 px-6"><div className="font-bold">{u.nick}</div><div className="text-[11px] text-red-500 mt-0.5">{u.deletedAtLabel || u.deletedAt}</div></td>
                        <td className="py-4 px-6 font-semibold text-orange-500">{u.rank}</td>
                        <td className="py-4 px-6 font-bold">{fmtUZS(u.spent)}</td>
                        <td className="py-4 px-6 text-xs text-neutral-500 capitalize">{u.role}</td>
                        <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                          <button onClick={() => onRestoreUser(u.nick)} className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors text-xs font-semibold">Qaytarish</button>
                          <button onClick={() => onPermanentDeleteUser(u.nick)} className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-colors text-xs font-semibold">Butunlay o'chirish</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Users */}
        {tab === "users" && (
          <div className="mt-8 space-y-6 fade-up">
            <div className="bg-white dark:bg-white/[0.03] p-4 rounded-2xl border border-orange-500/20 flex items-center justify-between">
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="O'yinchi nick'i bo'yicha qidirish..."
                className="px-4 py-2.5 rounded-xl border border-orange-500/30 bg-neutral-50 dark:bg-white/[0.03] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none text-sm w-full sm:w-80"
              />
              <div className="text-xs text-neutral-500">Jami {filteredUsers.length} ta o'yinchi</div>
            </div>

            <div className="rounded-3xl border border-orange-500/20 bg-white dark:bg-white/[0.03] overflow-hidden shadow-xl shadow-orange-500/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-orange-500/10 text-xs uppercase tracking-widest text-neutral-500 font-semibold bg-orange-500/5">
                      <th className="py-3.5 px-6">O'yinchi / Ro'yxatdan o'tgan</th>
                      <th className="py-3.5 px-6">Daraja (Rank)</th>
                      <th className="py-3.5 px-6">Jami Xarajat</th>
                      <th className="py-3.5 px-6">Rol</th>
                      <th className="py-3.5 px-6 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-500/10">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-neutral-500 text-sm">
                          Foydalanuvchilar topilmadi.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.nick} className="hover:bg-orange-500/5 transition-colors items-center">
                          <td className="py-4 px-6">
                            <div className="font-bold text-base flex items-center gap-2">
                              <span>{u.nick}</span>
                              {u.role === "admin" && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500 text-white">ADMIN</span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">Sana: {u.regDate}</div>
                          </td>
                          <td className="py-4 px-6">
                            <select
                              value={u.rank}
                              onChange={(e) => onUpdateUserRank(u.nick, e.target.value)}
                              className="px-3 py-1.5 rounded-xl border border-orange-500/30 bg-neutral-50 dark:bg-white/5 font-bold text-xs focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                            >
                              <option value="Oddiy">Oddiy</option>
                              <option value="RagePro">RagePro</option>
                              <option value="Rage+">Rage+</option>
                              <option value="SMP Elite">SMP Elite</option>
                            </select>
                          </td>
                          <td className="py-4 px-6 font-bold fire-text text-base">{fmtUZS(u.spent)}</td>
                          <td className="py-4 px-6 text-xs text-neutral-500 capitalize">{u.role}</td>
                          <td className="py-4 px-6 text-right">
                            {u.nick.toLowerCase() !== "vebuca" && (
                              <button
                                onClick={() => onDeleteUser(u.nick)}
                                className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-colors text-xs font-semibold"
                              >
                                O'chirish
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Simulate Transaction */}
        {tab === "simulate" && (
          <div className="mt-8 max-w-xl mx-auto rounded-3xl border border-orange-500/20 bg-white dark:bg-white/[0.03] p-8 shadow-xl shadow-orange-500/5 fade-up">
            <h3 className="text-xl font-bold mb-2">To'lov qo'shish (Simulyatsiya)</h3>
            <p className="text-xs text-neutral-500 mb-6">
              Telegram bot orqali qilingan to'lovni admin paneldan qo'lda kiritish yoki test qilish imkoniyati.
            </p>

            {simMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center mb-6">
                {simMsg}
              </div>
            )}

            <form onSubmit={handleSimulateSubmit} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">O'yinchi Nickname</label>
                <input
                  type="text"
                  required
                  value={simPlayer}
                  onChange={(e) => setSimPlayer(e.target.value)}
                  placeholder="Masalan: Steve123"
                  className="mt-1.5 w-full px-4 py-3 rounded-xl border border-orange-500/30 bg-neutral-50 dark:bg-white/[0.03] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none font-mono text-sm transition-all"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Paket</label>
                  <select
                    value={simPkg}
                    onChange={(e) => {
                      setSimPkg(e.target.value);
                      const p = e.target.value === "SMP Elite" ? 50000 : e.target.value === "Rage+" ? 30000 : 10000;
                      setSimPrice(p);
                    }}
                    className="mt-1.5 w-full px-4 py-3 rounded-xl border border-orange-500/30 bg-neutral-50 dark:bg-white/[0.03] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none text-sm font-bold transition-all"
                  >
                    <option value="SMP Elite">SMP Elite (50,000 so'm)</option>
                    <option value="Rage+">Rage+ (30,000 so'm)</option>
                    <option value="RagePro">RagePro (10,000 so'm)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">To'lov Turi</label>
                  <select
                    value={simMethod}
                    onChange={(e) => setSimMethod(e.target.value as any)}
                    className="mt-1.5 w-full px-4 py-3 rounded-xl border border-orange-500/30 bg-neutral-50 dark:bg-white/[0.03] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none text-sm font-bold transition-all"
                  >
                    <option value="Payme">Payme</option>
                    <option value="Click">Click</option>
                    <option value="Uzcard">Uzcard</option>
                    <option value="Humo">Humo</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold fire-gradient hover:shadow-lg hover:shadow-orange-500/50 hover:scale-[1.02] transition-all shine-on-hover"
              >
                To'lovni kiritish
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
