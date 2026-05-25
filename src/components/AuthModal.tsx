import { useState } from "react";
import type { User } from "../data/store";

export default function AuthModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (nick: string, pass: string) => { success: boolean; msg: string; user?: User };
  onRegister: (nick: string, pass: string) => { success: boolean; msg: string; user?: User };
}) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [nick, setNick] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (tab === "login") {
      const res = onLogin(nick, pass);
      if (res.success) {
        setSuccess(res.msg);
        setTimeout(() => {
          onClose();
          setNick("");
          setPass("");
          setSuccess("");
        }, 1000);
      } else {
        setError(res.msg);
      }
    } else {
      const res = onRegister(nick, pass);
      if (res.success) {
        setSuccess(res.msg);
        setTimeout(() => {
          onClose();
          setNick("");
          setPass("");
          setSuccess("");
        }, 1000);
      } else {
        setError(res.msg);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/60 backdrop-blur-md fade-up">
      <div className="relative w-full max-w-md rounded-3xl border border-orange-500/40 bg-white dark:bg-[#0d0d12] shadow-2xl shadow-orange-500/30 overflow-hidden">
        <div className="relative p-6 pt-8 pb-4 border-b border-orange-500/20 bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 grid place-items-center rounded-full bg-neutral-200 dark:bg-white/10 hover:bg-orange-500 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
          <div className="text-center">
            <div className="inline-grid place-items-center h-12 w-12 rounded-2xl fire-gradient text-white text-2xl shadow-lg shadow-orange-500/40 mb-2">
              🎮
            </div>
            <h3 className="text-2xl font-black tracking-tight">Rage<span className="fire-text">SMP</span> Avtorizatsiya</h3>
            <p className="text-xs text-neutral-500 mt-1">Minecraft serverdagi nick va parolingizdan foydalaning</p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 via-transparent to-orange-500/15 border border-orange-500/30">
              <span className="text-xs font-bold text-orange-500">
                🔥 Akkountingiz bo'lsa <span className="font-black fire-text">login</span> qiling, agar bo'lmasa <span className="font-black fire-text">nick</span> va <span className="font-black fire-text">parol</span> bilan <span className="font-black fire-text">register</span> qiling!
              </span>
            </div>
          </div>

          <div className="mt-6 flex rounded-xl p-1 bg-neutral-100 dark:bg-white/5 border border-orange-500/20">
            <button
              type="button"
              onClick={() => { setTab("login"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === "login"
                  ? "bg-white dark:bg-white/10 text-orange-500 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
              }`}
            >
              Kirish
            </button>
            <button
              type="button"
              onClick={() => { setTab("register"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === "register"
                  ? "bg-white dark:bg-white/10 text-orange-500 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
              }`}
            >
              Ro'yxatdan o'tish
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center">
              {success}
            </div>
          )}

          <div>
            <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Minecraft Nickname</label>
            <input
              type="text"
              required
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              placeholder="Masalan: Steve123"
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-orange-500/30 bg-neutral-50 dark:bg-white/[0.03] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none font-mono text-sm transition-all"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Parol</label>
            <input
              type="password"
              required
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-orange-500/30 bg-neutral-50 dark:bg-white/[0.03] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none font-mono text-sm transition-all"
            />
            {tab === "register" && (
              <p className="mt-1 text-[11px] text-neutral-500">
                O'yinda `/register parol parol` yozgan parolingizni kiriting.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="mt-2 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold fire-gradient hover:shadow-lg hover:shadow-orange-500/50 hover:scale-[1.02] transition-all shine-on-hover"
          >
            {tab === "login" ? "Tizimga kirish" : "Ro'yxatdan o'tish"}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>

          <div className="mt-4 pt-4 border-t border-orange-500/10 text-center">
            <div className="text-[11px] text-neutral-400">
              🔒 <span className="font-semibold text-orange-500">Xavfsiz tizim</span> · Barcha ma'lumotlar shifrlangan holda saqlanadi.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
