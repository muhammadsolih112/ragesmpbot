import { useEffect, useRef, useState } from "react";
import { fmtUZS } from "../data/donations";
import { useSiteConfig } from "../data/siteConfig";

const PRESETS = [10000, 25000, 50000, 100000, 200000, 500000];
const MIN_AMOUNT = 5000;
const MAX_AMOUNT = 5000000;

export default function TopUpModal({
  open,
  userNick,
  onClose,
  onSubmit,
}: {
  open: boolean;
  userNick: string;
  onClose: () => void;
  onSubmit: (amount: number, receiptImage: string) => void;
}) {
  const { config } = useSiteConfig();
  const [amount, setAmount] = useState<number>(50000);
  const [step, setStep] = useState<"amount" | "payment" | "upload" | "success">("amount");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [copiedCard, setCopiedCard] = useState(false);
  const burstRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setAmount(50000);
      setStep("amount");
      setPreview(null);
      setImageFile(null);
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  if (!open) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX) { h *= MAX / w; w = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        setPreview(canvas.toDataURL("image/jpeg", 0.65));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
  };

  const copyCard = async () => {
    try { await navigator.clipboard.writeText(config.links.paymentCard.replace(/\s/g, "")); } catch {}
    setCopiedCard(true);
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
    setTimeout(() => setCopiedCard(false), 2000);
  };

  const handleSubmit = () => {
    if (!preview) return;
    onSubmit(amount, preview);
    setStep("success");
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
  };

  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center p-3 bg-black/85 backdrop-blur-md receipt-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[28px] border border-emerald-400/40 bg-white dark:bg-[#0d0d12] shadow-[0_30px_80px_-10px_rgba(16,185,129,0.4)] overflow-hidden receipt-zoom-in"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-5 text-white overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="absolute -top-10 -right-10 h-32 w-32 bg-white/15 blur-3xl rounded-full" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full bg-black/25 hover:bg-black/45 hover:rotate-90 text-white backdrop-blur-md transition-all duration-300 z-10"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>

          <div className="relative flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white/25 backdrop-blur-md grid place-items-center text-3xl flex-shrink-0 float-soft">
              💰
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] opacity-80 font-black">Balansni to'ldirish</div>
              <div className="text-xl font-black mt-0.5">{fmtUZS(amount)}</div>
              <div className="text-[10px] opacity-80 mt-0.5">@{userNick}</div>
            </div>
          </div>

          {/* Step indicator */}
          <div className="relative mt-4 flex items-center gap-1.5">
            {["amount", "payment", "upload", "success"].map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  step === s ? "bg-white" : ["amount", "payment", "upload", "success"].indexOf(step) > i ? "bg-white/70" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {step === "amount" && (
            <div className="fade-up space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Summa (so'm)</label>
                <input
                  type="number"
                  value={amount}
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  onChange={(e) => setAmount(Math.max(MIN_AMOUNT, Math.min(MAX_AMOUNT, Number(e.target.value) || 0)))}
                  className="mt-1.5 w-full px-4 py-3 rounded-xl border border-emerald-500/30 bg-neutral-50 dark:bg-white/[0.03] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 outline-none font-mono text-lg font-black transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Tezkor tanlov</label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setAmount(p);
                        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
                      }}
                      className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                        amount === p
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                          : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      {p >= 1000 ? `${p / 1000}K` : p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-neutral-500 leading-relaxed bg-neutral-50 dark:bg-white/[0.02] p-3 rounded-xl border border-neutral-200/60 dark:border-white/5">
                ℹ️ Hisobingiz to'ldirilgandan keyin, sayt orqali to'g'ridan-to'g'ri donat va xizmatlarni sotib olishingiz mumkin.
              </div>

              <button
                onClick={() => setStep("payment")}
                disabled={amount < MIN_AMOUNT}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
              >
                DAVOM ETISH
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
            </div>
          )}

          {step === "payment" && (
            <div className="fade-up space-y-4">
              <h3 className="font-black text-base">💳 To'lov ma'lumotlari</h3>

              <div className="relative rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 dark:from-neutral-800 dark:to-neutral-950 p-5 text-white overflow-hidden shadow-xl">
                <div className="absolute -top-8 -right-8 h-32 w-32 bg-emerald-500/20 blur-2xl rounded-full" />
                <div className="absolute top-2 right-3 text-[10px] uppercase tracking-widest text-emerald-300 font-black">
                  {config.links.paymentBank}
                </div>

                <div className="relative">
                  <div className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold">Karta raqami</div>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="font-mono text-lg sm:text-xl font-black tracking-wider drop-shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                      {config.links.paymentCard}
                    </code>
                    <button
                      onClick={copyCard}
                      className={`relative h-8 w-8 rounded-lg grid place-items-center transition-all ${
                        copiedCard ? "bg-emerald-500 text-white scale-110" : "bg-white/15 text-white hover:bg-white/30"
                      }`}
                    >
                      {copiedCard ? (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7"/></svg>
                      ) : (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      )}
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold">Karta egasi</div>
                    <div className="font-bold text-sm mt-0.5">{config.links.paymentOwner}</div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold">To'lov summasi</div>
                      <div className="text-xl font-black text-emerald-300 mt-0.5">{fmtUZS(amount)}</div>
                    </div>
                    <div ref={burstRef} className="text-3xl float-soft">💸</div>
                  </div>
                </div>
              </div>

              <ol className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-1.5 list-decimal list-inside">
                <li>Yuqoridagi karta raqamiga <b className="text-emerald-500">{fmtUZS(amount)}</b> ni o'tkazing.</li>
                <li>To'lov chekining rasmini olib, keyingi qadamda yuklang.</li>
                <li>Admin tasdiqlaganidan keyin balansingiz to'ldiriladi.</li>
              </ol>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep("amount")}
                  className="flex-1 py-3 rounded-2xl font-bold border border-emerald-500/20 hover:bg-emerald-500/5 transition-all text-sm"
                >
                  Orqaga
                </button>
                <button
                  onClick={() => setStep("upload")}
                  className="flex-[2] py-3 rounded-2xl text-white font-black bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                >
                  TO'LADIM, DAVOM ETISH →
                </button>
              </div>
            </div>
          )}

          {step === "upload" && (
            <div className="fade-up space-y-4">
              <div className="text-center">
                <h3 className="font-black text-base">📸 Chekni yuklang</h3>
                <p className="text-[11px] text-neutral-500 mt-1">{fmtUZS(amount)} miqdordagi to'lovingiz cheki</p>
              </div>

              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`h-48 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 overflow-hidden ${
                  preview ? "border-emerald-500 bg-emerald-500/5" : "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                }`}>
                  {preview ? (
                    <img src={preview} alt="Chek" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="h-12 w-12 rounded-full bg-emerald-500/10 grid place-items-center text-emerald-500">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                      </div>
                      <div className="text-sm font-bold text-neutral-500">Chek rasmini yuklang</div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep("payment")}
                  className="flex-1 py-3 rounded-2xl font-bold border border-emerald-500/20 hover:bg-emerald-500/5 transition-all text-sm"
                >
                  Orqaga
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!imageFile}
                  className="flex-[2] py-3 rounded-2xl text-white font-black bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all text-sm"
                >
                  YUBORISH
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="fade-up text-center py-4">
              <div className="h-20 w-20 mx-auto relative mb-5 grid place-items-center">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-30 animate-pulse rounded-full" />
                <span className="text-7xl relative">⏳</span>
              </div>
              <h3 className="text-2xl font-black text-emerald-500">So'rov yuborildi!</h3>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed px-2">
                Bajarilmoqda — Admin chekni tekshirib tasdiqlagandan keyin balansingizga <b className="text-emerald-500">{fmtUZS(amount)}</b> qo'shiladi.
              </p>
              <button
                onClick={onClose}
                className="mt-6 w-full py-3 rounded-2xl font-bold bg-neutral-100 dark:bg-white/5 hover:bg-emerald-500 hover:text-white transition-all text-sm"
              >
                Yopish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
