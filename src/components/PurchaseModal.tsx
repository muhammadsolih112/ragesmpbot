import { useEffect, useState } from "react";
import { fmtUZS, type Donation } from "../data/donations";
import type { Transaction } from "../data/store";

export default function PurchaseModal({
  d,
  onClose,
  onAddTx,
}: {
  d: Donation | null;
  onClose: () => void;
  onAddTx: (player: string, pkgName: string, price: number, method: Transaction["method"], receiptImage?: string) => void;
}) {
  const [nick, setNick] = useState("");
  const [step, setStep] = useState<"form" | "upload" | "success">("form");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const isCurrency = d?.id.includes("points") || d?.id.includes("shards");
  const unitPrice = d?.price || 0;
  const totalPrice = isCurrency ? unitPrice * quantity : unitPrice;

  useEffect(() => {
    if (d) {
      document.body.style.overflow = "hidden";
      setNick("");
      setStep("form");
      setImage(null);
      setPreview(null);
      setQuantity(1);
    } else {
      document.body.style.overflow = "";
    }
  }, [d]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
    }
  };

  const handleFinish = async () => {
    if (!image || !d) return;
    
    // UI ni darhol o'zgartiramiz
    setStep("success");
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");

    // LocalStorage dagi ma'lumotlarni yangilaymiz (Admin panel uchun)
    const finalPkgName = isCurrency ? `${quantity.toLocaleString()} ${d.name.split(' ')[1]}` : d.name;
    onAddTx(nick, finalPkgName, totalPrice, "Payme", preview || undefined);

    // Telegramga rasm va ma'lumotlarni yuboramiz
    try {
      const formData = new FormData();
      formData.append("chat_id", "-1003848105340"); 
      formData.append("photo", image);
      
      const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
      const caption = `🧾 <b>Yangi Mini App xaridi</b>\n━━━━━━━━━━━━━━━━━━━━\n\n🎮 Nick: <b>${nick}</b>\n🛒 Xarid: <b>${finalPkgName}</b>\n💰 Summa: <b>${fmtUZS(totalPrice)}</b>\n🆔 User: ${user?.first_name || "Noma'lum"} (@${user?.username || "yo'q"})\n🆔 Telegram ID: <code>${user?.id || "noma'lum"}</code>\n\n<i>Tekshirib rankini berish kerak!</i>`;
      formData.append("caption", caption);
      formData.append("parse_mode", "HTML");

      await fetch(`https://api.telegram.org/bot8344846056:AAEPxos-P4229tCUJ_MO_PgfH4mSEN6i7OU/sendPhoto`, {
        method: "POST",
        body: formData,
      });
    } catch (err) {
      console.error("Telegramga yuborishda xato:", err);
    }
  };

  if (!d) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/80 backdrop-blur-md transition-all duration-500"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[32px] border border-orange-500/30 bg-white dark:bg-[#0d0d12] shadow-[0_0_50px_rgba(255,122,24,0.15)] overflow-hidden"
      >
        {/* Header */}
        <div className={`relative h-24 bg-gradient-to-br ${d.color} flex items-center justify-center`}>
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="text-5xl drop-shadow-2xl flicker">{d.emoji}</div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 grid place-items-center rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        <div className="p-6">
          {step === "form" && (
            <div className="fade-up">
              <div className="text-center">
                <h3 className="text-2xl font-black tracking-tight">{d.name}</h3>
                <div className="text-3xl font-black fire-text mt-1">{fmtUZS(totalPrice)}</div>
              </div>

              <div className="mt-6 space-y-4">
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
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold ml-1">Miqdori (x{d.name.split(' ')[0]})</label>
                    <div className="mt-2 flex items-center gap-4">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xl font-bold hover:bg-orange-500/20"
                      >-</button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 h-12 text-center bg-transparent border-b-2 border-orange-500/30 font-bold text-lg outline-none"
                      />
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xl font-bold hover:bg-orange-500/20"
                      >+</button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (nick) setStep("upload");
                  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("medium");
                }}
                disabled={!nick}
                className="mt-8 w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-black fire-gradient shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
              >
                DAVOM ETISH
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
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
