import { useEffect, useMemo, useState } from "react";
import { fmtUZS, type Donation } from "../data/donations";
import type { Transaction, User } from "../data/store";

const MIN_UNITS = 1;
const MAX_UNITS = 5000; // 5,000,000 ta
const DISCOUNT_PER_10K = 2500;

function calcDiscount(quantity: number, unitPrice: number) {
  // har 10,000 ta uchun 2500 so'm skidka
  const totalUnits = quantity * 1000;
  const tiers = Math.floor(totalUnits / 10000);
  const discount = tiers * DISCOUNT_PER_10K;
  const gross = quantity * unitPrice;
  const net = Math.max(0, gross - discount);
  return { gross, discount, net, tiers };
}

export default function PurchaseModal({
  d,
  currentUser,
  onClose,
  onAddTx,
  onBalancePurchase,
  onOpenTopUp,
}: {
  d: Donation | null;
  currentUser: User | null;
  onClose: () => void;
  onAddTx: (player: string, pkgName: string, price: number, method: Transaction["method"], receiptImage?: string) => void;
  onBalancePurchase: (player: string, pkgName: string, price: number) => { success: boolean; msg: string; tx?: Transaction };
  onOpenTopUp: () => void;
}) {
  const [nick, setNick] = useState("");
  const [step, setStep] = useState<"choose" | "form" | "upload" | "balance_confirm" | "success" | "balance_pending">("choose");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [balanceMsg, setBalanceMsg] = useState<string>("");

  const isCurrency = !!d && (d.id.includes("points") || d.id.includes("shards"));
  const unitPrice = d?.price || 0;
  const { gross, discount, net, tiers } = useMemo(
    () => calcDiscount(quantity, unitPrice),
    [quantity, unitPrice]
  );
  const totalPrice = isCurrency ? net : unitPrice;

  useEffect(() => {
    if (d) {
      document.body.style.overflow = "hidden";
      setNick(currentUser?.nick || "");
      setStep("choose");
      setImage(null);
      setPreview(null);
      setQuantity(1);
      setBalanceMsg("");
    } else {
      document.body.style.overflow = "";
    }
  }, [d, currentUser]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          setPreview(compressedBase64);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
    }
  };

  const handleFinish = async () => {
    if (!image || !d) return;

    setStep("success");
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");

    setTimeout(async () => {
      try {
        const nameParts = d.name.split(' ');
        const pkgLabel = nameParts.length > 1 ? nameParts[1] : d.name;
        const totalUnits = quantity * 1000;
        const finalPkgName = isCurrency
          ? `${totalUnits.toLocaleString()} ${pkgLabel}`
          : d.name;

        await onAddTx(nick, finalPkgName, totalPrice, "Payme", preview || undefined);
      } catch (err) {
        console.error("Xaridni yakunlashda xato:", err);
      }
    }, 100);
  };

  if (!d) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/80 backdrop-blur-md transition-all duration-500"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[32px] border border-orange-500/30 bg-white dark:bg-[#0d0d12] shadow-[0_0_50px_rgba(255,122,24,0.15)] overflow-hidden fade-up"
      >
        {/* Header */}
        <div className={`relative h-24 bg-gradient-to-br ${d.color} flex items-center justify-center`}>
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="text-5xl drop-shadow-2xl flicker">{d.emoji}</div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 grid place-items-center rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-all hover:rotate-90"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        <div className="p-6">
          {step === "choose" && (
            <div className="fade-up">
              <div className="text-center">
                <h3 className="text-2xl font-black tracking-tight">{d.name}</h3>
                <div className="text-3xl font-black fire-text mt-1">{fmtUZS(totalPrice)}</div>
                {d.tagline && <p className="text-xs text-neutral-500 mt-2 max-w-sm mx-auto">{d.tagline}</p>}
              </div>

              {currentUser && (
                <div className="mt-5 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-2">
                  <div className="text-left">
                    <div className="text-[9px] uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 font-black">Sizning balansingiz</div>
                    <div className="text-base font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{fmtUZS(currentUser.balance || 0)}</div>
                  </div>
                  <button
                    onClick={onOpenTopUp}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                  >
                    + To'ldirish
                  </button>
                </div>
              )}

              <div className="mt-5 space-y-3">
                {/* Balansdan to'lash variant */}
                <button
                  disabled={!currentUser || (currentUser.balance || 0) < totalPrice}
                  onClick={() => {
                    if (!currentUser) return;
                    setStep("balance_confirm");
                  }}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                    !currentUser || (currentUser.balance || 0) < totalPrice
                      ? "border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] opacity-60 cursor-not-allowed"
                      : "border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 hover:border-emerald-500 hover:scale-[1.01] shadow-md shadow-emerald-500/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 grid place-items-center text-xl flex-shrink-0">💰</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm">Balansdan to'lash</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Tez</span>
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        {currentUser ? (
                          (currentUser.balance || 0) >= totalPrice
                            ? `Balansingiz: ${fmtUZS(currentUser.balance)} — chek talab qilinmaydi.`
                            : `Yetarli emas. Yana ${fmtUZS(totalPrice - (currentUser.balance || 0))} kerak.`
                        ) : "Avval tizimga kiring."}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Kartadan to'lash variant */}
                <button
                  onClick={() => setStep("form")}
                  className="w-full p-4 rounded-2xl border-2 border-orange-500/40 bg-gradient-to-br from-orange-500/5 to-red-500/5 text-left hover:border-orange-500 hover:scale-[1.01] transition-all shadow-md shadow-orange-500/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl fire-gradient grid place-items-center text-xl flex-shrink-0">💳</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm">Karta orqali to'lash</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Payme/Click/Uzcard/Humo — chek yuklash kerak.
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === "balance_confirm" && currentUser && (
            <div className="fade-up">
              <div className="text-center">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 grid place-items-center text-3xl shadow-lg shadow-emerald-500/30 mb-4">💰</div>
                <h3 className="text-lg font-black">Balansdan to'lash</h3>
                <div className="text-3xl font-black fire-text mt-1 transition-all duration-300">{fmtUZS(totalPrice)}</div>
                {isCurrency && discount > 0 && (
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    <span>🎁</span>
                    <span>-{fmtUZS(discount)} skidka</span>
                  </div>
                )}
                <p className="text-sm text-neutral-500 mt-2 max-w-sm mx-auto">
                  Balansingizdan <b className="text-emerald-500">{fmtUZS(totalPrice)}</b> yechilib, <b className="fire-text">{d.name}</b> sotib olinadi.
                </p>
              </div>

              {isCurrency && (
                <div className="mt-6">
                  <CurrencySlider
                    d={d}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    unitPrice={unitPrice}
                    gross={gross}
                    discount={discount}
                    net={net}
                    tiers={tiers}
                  />
                </div>
              )}

              <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl bg-neutral-50 dark:bg-white/[0.03] p-2.5">
                  <div className="text-[9px] uppercase tracking-widest text-neutral-500 font-black">Hozirgi</div>
                  <div className="font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{fmtUZS(currentUser.balance || 0)}</div>
                </div>
                <div className="rounded-xl bg-red-500/10 p-2.5">
                  <div className="text-[9px] uppercase tracking-widest text-red-500 font-black">−</div>
                  <div className="font-black text-red-500 mt-0.5">{fmtUZS(totalPrice)}</div>
                </div>
                <div className="rounded-xl bg-emerald-500/10 p-2.5">
                  <div className="text-[9px] uppercase tracking-widest text-emerald-600 font-black">Qoladi</div>
                  <div className="font-black text-emerald-600 mt-0.5">{fmtUZS((currentUser.balance || 0) - totalPrice)}</div>
                </div>
              </div>

              {balanceMsg && (
                <div className="mt-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold">{balanceMsg}</div>
              )}

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setStep("choose")}
                  className="flex-1 py-3 rounded-2xl font-bold border border-emerald-500/20 hover:bg-emerald-500/5 transition-all text-sm"
                >
                  Orqaga
                </button>
                <button
                  disabled={(currentUser.balance || 0) < totalPrice}
                  onClick={() => {
                    const nameParts = d.name.split(" ");
                    const pkgLabel = nameParts.length > 1 ? nameParts[1] : d.name;
                    const totalUnits = quantity * 1000;
                    const finalPkgName = isCurrency ? `${totalUnits.toLocaleString()} ${pkgLabel}` : d.name;
                    const res = onBalancePurchase(currentUser.nick, finalPkgName, totalPrice);
                    if (res.success) {
                      setStep("balance_pending");
                      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
                    } else {
                      setBalanceMsg(res.msg);
                    }
                  }}
                  className={`flex-[2] py-3 rounded-2xl text-white font-black bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all text-sm ${(currentUser.balance || 0) < totalPrice ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  TASDIQLASH
                </button>
              </div>
            </div>
          )}

          {step === "balance_pending" && (
            <div className="fade-up text-center py-3">
              <div className="h-20 w-20 mx-auto relative mb-5 grid place-items-center">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <span className="text-3xl">⏳</span>
              </div>
              <h3 className="text-xl font-black text-amber-500">Bajarilmoqda...</h3>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed px-2">
                Buyurtmangiz qabul qilindi va admin tomonidan tekshirilmoqda. Tasdiqlangach, sizga bildirishnoma keladi va <b className="fire-text">{d.name}</b> faollashadi.
              </p>
              <div className="mt-5 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                ⚠️ Donatingiz hozircha "Bajarilmoqda" holatida. Admin tasdiqlaganidan keyin "Muvaffaqiyatli" bo'ladi.
              </div>
              <button
                onClick={onClose}
                className="mt-6 w-full py-3 rounded-2xl font-bold bg-neutral-100 dark:bg-white/5 hover:bg-emerald-500 hover:text-white transition-all text-sm"
              >
                Yopish
              </button>
            </div>
          )}

          {step === "form" && (
            <div className="fade-up">
              <div className="text-center">
                <h3 className="text-2xl font-black tracking-tight">{d.name}</h3>
                <div className="text-3xl font-black fire-text mt-1 transition-all duration-300">{fmtUZS(totalPrice)}</div>
                {isCurrency && discount > 0 && (
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    <span>🎁</span>
                    <span>-{fmtUZS(discount)} skidka</span>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Minecraft Nickname</label>
                  <input
                    value={nick}
                    onChange={(e) => setNick(e.target.value)}
                    placeholder="Steve123..."
                    className="mt-2 w-full px-5 py-4 rounded-2xl border border-orange-500/20 bg-neutral-50 dark:bg-white/[0.03] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none font-mono transition-all"
                  />
                </div>

                {isCurrency && (
                  <CurrencySlider
                    d={d}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    unitPrice={unitPrice}
                    gross={gross}
                    discount={discount}
                    net={net}
                    tiers={tiers}
                  />
                )}
              </div>

              <div className="mt-8 flex gap-2">
                <button
                  onClick={() => setStep("choose")}
                  className="flex-1 py-4 rounded-2xl font-bold border border-orange-500/20 hover:bg-orange-500/5 transition-all text-sm"
                >
                  Orqaga
                </button>
                <button
                  onClick={() => {
                    if (nick) setStep("upload");
                    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("medium");
                  }}
                  disabled={!nick}
                  className="flex-[2] inline-flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-black fire-gradient shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all text-sm"
                >
                  DAVOM ETISH
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </button>
              </div>
            </div>
          )}

          {step === "upload" && (
            <div className="fade-up">
              <div className="text-center mb-6">
                <h3 className="text-xl font-black">To'lov isboti</h3>
                <p className="text-xs text-neutral-500 mt-1">To'lov qilinganidan so'ng chekni yuklang</p>
              </div>

              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`h-48 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 overflow-hidden ${
                  preview ? "border-emerald-500 bg-emerald-500/5" : "border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50"
                }`}>
                  {preview ? (
                    <img src={preview} alt="Proof" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                      </div>
                      <div className="text-sm font-bold text-neutral-500">Rasm yoki chekni yuklang</div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep("form")}
                  className="flex-1 py-4 rounded-2xl font-bold border border-orange-500/20 hover:bg-orange-500/5 transition-all"
                >
                  Orqaga
                </button>
                <button
                  onClick={handleFinish}
                  disabled={!image}
                  className="flex-[2] py-4 rounded-2xl text-white font-black fire-gradient shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
                >
                  YUBORISH
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="fade-up text-center py-4">
              <div className="h-20 w-24 mx-auto relative mb-6">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse" />
                <span className="text-7xl">✅</span>
              </div>
              <h3 className="text-2xl font-black text-emerald-500">Qabul qilindi!</h3>
              <p className="mt-4 text-sm font-medium text-neutral-600 dark:text-neutral-300 leading-relaxed px-2">
                Sizning xabaringiz qabul qilindi. Tez orada ko'rib chiqilib, darajangiz (rank) beriladi.
              </p>
              <div className="mt-6 p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
                <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider">
                  ⚠️ Diqqat: Soxta cheklar yubormang, aks holda donat berilmaydi!
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-8 w-full py-4 rounded-2xl font-bold bg-neutral-100 dark:bg-white/5 hover:bg-orange-500 hover:text-white transition-all"
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

function CurrencySlider({
  d,
  quantity,
  setQuantity,
  unitPrice,
  gross,
  discount,
  net,
  tiers,
}: {
  d: Donation;
  quantity: number;
  setQuantity: (v: number) => void;
  unitPrice: number;
  gross: number;
  discount: number;
  net: number;
  tiers: number;
}) {
  const isPoints = d.id.includes("points");
  const accentClass = isPoints ? "from-amber-400 via-orange-500 to-red-500" : "from-cyan-400 via-blue-500 to-indigo-600";
  const glowClass = isPoints ? "glow-pulse" : "glow-pulse-cyan";
  const ringColor = isPoints ? "rgba(255,122,24,0.55)" : "rgba(34,211,238,0.55)";

  const pct = ((quantity - MIN_UNITS) / (MAX_UNITS - MIN_UNITS)) * 100;

  const totalUnits = quantity * 1000;
  const unitsToNextTier = Math.max(0, ((tiers + 1) * 10000) - totalUnits);
  const remainingQuantity = Math.ceil(unitsToNextTier / 1000);

  const onChange = (val: number) => {
    const clamped = Math.max(MIN_UNITS, Math.min(MAX_UNITS, val));
    setQuantity(clamped);
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">
          Miqdor — chapdan o'ngga suring
        </label>
        <div className={`text-xs font-black ${isPoints ? "text-orange-500" : "text-cyan-500"} font-mono`}>
          {totalUnits.toLocaleString()} {isPoints ? "Point" : "Shards"}
        </div>
      </div>

      {/* Slider card */}
      <div className={`relative rounded-2xl border ${isPoints ? "border-orange-500/30" : "border-cyan-500/30"} bg-gradient-to-r ${isPoints ? "from-orange-500/10 via-amber-500/5 to-red-500/10" : "from-cyan-500/10 via-blue-500/5 to-indigo-500/10"} p-4 overflow-hidden`}>
        {/* glow background */}
        <div
          className="absolute -inset-1 opacity-40 blur-2xl pointer-events-none"
          style={{
            background: `linear-gradient(90deg, ${ringColor} 0%, transparent ${100 - pct}%)`,
            transition: "all 0.4s cubic-bezier(.22,1,.36,1)",
          }}
        />

        <div className="relative">
          {/* range track */}
          <div className="relative h-3 rounded-full bg-neutral-200/50 dark:bg-white/10 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${accentClass} rounded-full transition-all duration-300`}
              style={{ width: `${pct}%` }}
            />
            {/* tier markers (every 100k = quantity 100) */}
            {[100, 500, 1000, 2500, 5000].map((mark) => (
              <div
                key={mark}
                className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-white/40"
                style={{ left: `${((mark - MIN_UNITS) / (MAX_UNITS - MIN_UNITS)) * 100}%` }}
              />
            ))}
          </div>

          {/* native range overlay */}
          <input
            type="range"
            min={MIN_UNITS}
            max={MAX_UNITS}
            step={1}
            value={quantity}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-8 opacity-0 cursor-grab active:cursor-grabbing"
          />

          {/* knob */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-white border-2 ${isPoints ? "border-orange-500" : "border-cyan-500"} ${glowClass} pointer-events-none`}
            style={{ left: `${pct}%`, transition: "left 0.25s cubic-bezier(.22,1,.36,1)" }}
          />
        </div>

        {/* Quick chips + manual */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onChange(Math.max(MIN_UNITS, quantity - 1))}
            className={`h-8 w-8 rounded-lg ${isPoints ? "bg-orange-500/15 border-orange-500/30 text-orange-500" : "bg-cyan-500/15 border-cyan-500/30 text-cyan-500"} border font-black hover:scale-110 transition-transform`}
          >−</button>
          {[1, 5, 10, 50, 100, 500, 1000, 5000].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onChange(q)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                quantity === q
                  ? `${isPoints ? "bg-orange-500" : "bg-cyan-500"} text-white shadow`
                  : `${isPoints ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" : "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20"}`
              }`}
            >
              {q * 1000 >= 1000000 ? `${q / 1000}M` : q * 1000 >= 1000 ? `${q}K` : `${q * 1000}`}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChange(Math.min(MAX_UNITS, quantity + 1))}
            className={`h-8 w-8 rounded-lg ${isPoints ? "bg-orange-500/15 border-orange-500/30 text-orange-500" : "bg-cyan-500/15 border-cyan-500/30 text-cyan-500"} border font-black hover:scale-110 transition-transform`}
          >+</button>
        </div>
      </div>

      {/* Pricing breakdown */}
      <div className="rounded-2xl border border-neutral-200/60 dark:border-white/10 bg-neutral-50 dark:bg-white/[0.02] p-3 space-y-1.5 text-xs">
        <div className="flex justify-between text-neutral-500">
          <span>1.000 {isPoints ? "Point" : "Shards"} narxi</span>
          <span className="font-mono font-bold">{fmtUZS(unitPrice)}</span>
        </div>
        <div className="flex justify-between text-neutral-500">
          <span>{quantity} × {fmtUZS(unitPrice)}</span>
          <span className="font-mono font-bold">{fmtUZS(gross)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-500">
            <span className="font-bold">🎁 Skidka (har 10.000 ga 2.500 so'm)</span>
            <span className="font-mono font-black">−{fmtUZS(discount)}</span>
          </div>
        )}
        <div className="border-t border-neutral-200 dark:border-white/10 pt-1.5 flex justify-between">
          <span className="font-black uppercase tracking-widest text-[10px] text-neutral-500">Jami</span>
          <span className={`font-mono font-black text-base ${isPoints ? "text-orange-500" : "text-cyan-500"}`}>{fmtUZS(net)}</span>
        </div>
        {remainingQuantity > 0 && quantity < MAX_UNITS && (
          <div className="mt-1 text-[10px] text-neutral-400 text-center">
            Yana <b className="text-emerald-500">+{remainingQuantity}</b> ta qo'shsangiz, qo'shimcha <b className="text-emerald-500">{fmtUZS(DISCOUNT_PER_10K)}</b> skidka!
          </div>
        )}
      </div>
    </div>
  );
}
