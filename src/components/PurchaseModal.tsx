import { useEffect, useState } from "react";
import { fmtUZS, type Donation } from "../data/donations";

export default function PurchaseModal({ d, onClose }: { d: Donation | null; onClose: () => void }) {
  const [nick, setNick] = useState("");
  const [step, setStep] = useState<"form" | "confirm">("form");

  useEffect(() => {
    if (d) {
      document.body.style.overflow = "hidden";
      setNick("");
      setStep("form");
      
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.MainButton.setText(`TO'LOV: ${fmtUZS(d.price)}`);
        tg.MainButton.show();
        tg.MainButton.onClick(() => {
          if (step === "form") setStep("confirm");
        });
      }
    } else {
      document.body.style.overflow = "";
      window.Telegram?.WebApp?.MainButton.hide();
    }
    return () => {
      document.body.style.overflow = "";
      window.Telegram?.WebApp?.MainButton.hide();
    };
  }, [d, step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!d) return null;

  const handlePay = () => {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
    // In a real app, this would trigger a payment invoice
    alert(`${d.name} uchun to'lov so'rovi yuborildi!`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/60 backdrop-blur-md fade-up"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl border border-orange-500/40 bg-white dark:bg-[#0d0d12] shadow-2xl shadow-orange-500/30 overflow-hidden"
      >
        <div className={`relative h-28 sm:h-32 bg-gradient-to-br ${d.color} grid place-items-center overflow-hidden`}>
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-6xl sm:text-7xl drop-shadow-2xl flicker">{d.emoji}</div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 h-8 w-8 sm:h-9 sm:w-9 grid place-items-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        <div className="p-5 sm:p-6 pt-8 sm:pt-10">
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{d.name}</h3>
            <div className="mt-2 text-3xl sm:text-4xl font-black fire-text">{fmtUZS(d.price)}</div>
          </div>

          <div className="mt-6">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Minecraft Nickname</label>
            <input
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              placeholder="Masalan: Steve123"
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-orange-500/30 bg-neutral-50 dark:bg-white/[0.03] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none font-mono text-sm transition-all"
            />
          </div>

          <div className="mt-5 space-y-3">
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Afzalliklar:</div>
            <ul className="grid grid-cols-1 gap-2">
              {d.perks.slice(0, 6).map((p) => (
                <li key={p} className="flex items-center gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 bg-orange-500/5 p-2 rounded-lg border border-orange-500/10">
                  <span className="h-1.5 w-1.5 rounded-full fire-gradient flex-shrink-0" />
                  <span className="truncate">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handlePay}
            disabled={!nick}
            className="mt-8 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-black fire-gradient shadow-xl shadow-orange-500/40 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shine-on-hover"
          >
            <span>TO'LOV QILISH</span>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
          
          <p className="mt-4 text-center text-[10px] text-neutral-500 uppercase tracking-tighter">
            Donat darhol akkauntingizga qo'shiladi
          </p>
        </div>
      </div>
    </div>
  );
}
