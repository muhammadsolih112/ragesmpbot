import { useEffect, useState } from "react";

export default function SyncToast({
  toast,
  onClose,
  onOpenAdmin,
}: {
  toast: { count: number; ts: number } | null;
  onClose: () => void;
  onOpenAdmin: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 400);
      }, 6000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-[200] transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="relative w-[90vw] max-w-sm rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 shadow-[0_20px_60px_-10px_rgba(59,130,246,0.6)] border border-cyan-400/50 receipt-zoom-in">
        {/* glow background */}
        <div className="absolute inset-0 grid-bg opacity-15" />
        <div className="absolute -top-12 -right-12 h-40 w-40 bg-cyan-400/40 blur-3xl rounded-full" />

        <div className="relative p-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md grid place-items-center text-2xl flex-shrink-0 float-soft">
              🤖
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-200 font-black">Botdan</div>
              <div className="text-white font-black text-base leading-tight mt-0.5">
                {toast.count} ta yangi buyurtma keldi!
              </div>
              <div className="text-xs text-cyan-100 mt-1 font-medium">
                Tekshirish va tasdiqlash uchun admin panelga o'ting.
              </div>
            </div>
            <button
              onClick={() => {
                setVisible(false);
                setTimeout(onClose, 300);
              }}
              className="h-7 w-7 rounded-lg bg-black/30 hover:bg-black/50 text-white grid place-items-center flex-shrink-0 transition-all"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>

          <button
            onClick={onOpenAdmin}
            className="mt-3 w-full py-2.5 rounded-xl bg-white text-blue-700 font-black text-xs uppercase tracking-widest hover:bg-cyan-50 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
          >
            📋 Admin panelga o'tish
          </button>
        </div>
      </div>
    </div>
  );
}
