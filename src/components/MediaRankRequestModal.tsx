import { useState } from "react";
import type { User } from "../data/store";

const REQUIREMENTS = [
  { emoji: "📺", text: "+1 000 obunachi" },
  { emoji: "👥", text: "Streamda kamida 50 ta online" },
  { emoji: "🎥", text: "Biz bilan aloqaga chiqishdan oldin 7 ta stream qilgan bo'lishi" },
  { emoji: "👁️", text: "Stream prasmotrlari kamida 500+ tadan ko'p" },
  { emoji: "🌐", text: "Ekranda server ip si (ragesmp.uz) turishi majburiy!" },
];

export default function MediaRankRequestModal({ isOpen, onClose, currentUser, addMediaRequest }: { isOpen: boolean; onClose: () => void; currentUser: User | null; addMediaRequest: (player: string, screenshots: string[], telegramUsername: string) => any }) {
  const [step, setStep] = useState<"requirements" | "form" | "success">("requirements");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [telegramUsername, setTelegramUsername] = useState("");
  const [checked, setChecked] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && screenshots.length < 8) {
          setScreenshots((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (screenshots.length === 0) {
      alert("Iltimos, kamida bitta screenshot yuklang!");
      return;
    }
    if (!telegramUsername.trim()) {
      alert("Iltimos, telegram usernameingizni yozing!");
      return;
    }
    addMediaRequest(currentUser.nick, screenshots, telegramUsername);
    setStep("success");
    setTimeout(() => {
      setStep("requirements");
      setScreenshots([]);
      setTelegramUsername("");
      setChecked(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/60 backdrop-blur-md fade-up">
      <div className="relative w-full max-w-2xl rounded-3xl border border-red-500/40 bg-white dark:bg-[#0d0d12] shadow-2xl shadow-red-500/30 overflow-hidden">
        <button
          onClick={() => {
            setStep("requirements");
            setScreenshots([]);
            setTelegramUsername("");
            setChecked(false);
            onClose();
          }}
          className="absolute top-4 right-4 h-8 w-8 grid place-items-center rounded-full bg-neutral-200 dark:bg-white/10 hover:bg-red-500 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>

        {step === "success" ? (
          <div className="p-16 text-center">
            <div className="h-24 w-24 mx-auto rounded-[48px] bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white text-6xl shadow-xl shadow-red-500/40 mb-6 grid place-items-center animate-bounce">
              ✅
            </div>
            <h2 className="text-4xl font-black tracking-tight fire-text animate-pulse mb-4">
              So'rovingiz qabul qilindi!
            </h2>
            <p className="text-sm text-neutral-500">
              Tez orada adminlar siz bilan bog'lanishadi!
            </p>
          </div>
        ) : step === "requirements" ? (
          <>
            <div className="p-6 pt-8 pb-4 border-b border-red-500/20 bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10">
              <div className="text-center">
                <div className="inline-grid place-items-center h-12 w-12 rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white text-2xl shadow-lg shadow-red-500/40 mb-2">
                  📺
                </div>
                <h3 className="text-2xl font-black tracking-tight text-red-600 dark:text-red-400">Media Rank Shartlari</h3>
                <p className="text-xs text-neutral-500 mt-1">Iltimos, quyidagi shartlarni o'qing</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3">
                {REQUIREMENTS.map((req, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                    <span className="text-xl">{req.emoji}</span>
                    <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{req.text}</span>
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded-lg accent-red-500"
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="font-bold text-red-600 dark:text-red-400">Bular menda mavjud</span> deb tasdiqlayman
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep("requirements");
                    setChecked(false);
                    onClose();
                  }}
                  className="py-3 rounded-2xl font-bold border border-red-500/20 hover:bg-red-500/5 transition-all text-sm"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  disabled={!checked}
                  onClick={() => setStep("form")}
                  className="py-3 rounded-2xl text-white font-black bg-gradient-to-r from-red-500 via-red-600 to-red-700 shadow-lg shadow-red-500/30 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Davom etish
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 pt-8 pb-4 border-b border-red-500/20 bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10">
              <div className="text-center">
                <div className="inline-grid place-items-center h-12 w-12 rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white text-2xl shadow-lg shadow-red-500/40 mb-2">
                  📺
                </div>
                <h3 className="text-2xl font-black tracking-tight text-red-600 dark:text-red-400">Media Rank So'rov</h3>
                <p className="text-xs text-neutral-500 mt-1">Quyidagi ma'lumotlarni to'ldiring</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-sm font-bold text-red-500">Qilgan streamlaringiz va kanalingiz rasmini shu yerga yuklang</p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {screenshots.map((src, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden border border-red-500/30 aspect-square group">
                    <img src={src} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(i)}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {screenshots.length < 8 && (
                  <label className="rounded-xl border border-dashed border-red-500/30 bg-red-500/5 aspect-square grid place-items-center cursor-pointer hover:bg-red-500/10 transition-colors">
                    <div className="text-center">
                      <div className="text-2xl">📸</div>
                      <div className="text-xs text-red-500 mt-1">Yuklash</div>
                    </div>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
                  </label>
                )}
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Telegram Username</label>
                <input
                  type="text"
                  required
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  placeholder="@username"
                  className="mt-1.5 w-full px-4 py-3 rounded-xl border border-red-500/30 bg-neutral-50 dark:bg-white/[0.03] focus:border-red-500 focus:ring-2 focus:ring-red-500/30 outline-none font-mono text-sm transition-all"
                />
                <p className="mt-1 text-[11px] text-neutral-500">Aloqaga chiqishimiz uchun telegram usernameingizni yozib qoldiring</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setStep("requirements")}
                  className="py-3 rounded-2xl font-bold border border-red-500/20 hover:bg-red-500/5 transition-all text-sm"
                >
                  Ortga
                </button>
                <button
                  type="submit"
                  className="py-3 rounded-2xl text-white font-black bg-gradient-to-r from-red-500 via-red-600 to-red-700 shadow-lg shadow-red-500/30 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                >
                  So'rov yuborish
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
