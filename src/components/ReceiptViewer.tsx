import { useEffect, useState } from "react";
import type { Transaction } from "../data/store";
import { fmtUZS } from "../data/donations";

const BOT_TOKEN = "8344846056:AAGYdpzJKbT452VbDre6iksZGC9rzlHmZZ8";

// Cache resolved telegram file URLs so we don't hit getFile multiple times
const fileUrlCache = new Map<string, string>();

async function resolveTelegramFileUrl(fileId: string): Promise<string | null> {
  const cached = fileUrlCache.get(fileId);
  if (cached) return cached;
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${encodeURIComponent(fileId)}`);
    const data = await r.json();
    if (data?.ok && data?.result?.file_path) {
      const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
      fileUrlCache.set(fileId, url);
      return url;
    }
  } catch (err) {
    console.error("getFile error:", err);
  }
  return null;
}

export default function ReceiptViewer({
  tx,
  onClose,
}: {
  tx: Transaction | null;
  onClose: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!tx) return;
    document.body.style.overflow = "hidden";
    setZoom(false);
    setError(null);

    // Agar receiptImage to'g'ridan-to'g'ri (base64/URL) bor bo'lsa
    if (tx.receiptImage && (tx.receiptImage.startsWith("data:") || tx.receiptImage.startsWith("http"))) {
      setImageUrl(tx.receiptImage);
      setLoading(false);
      return;
    }

    // Agar faqat file_id bor bo'lsa, getFile orqali yuklash kerak
    if (tx.receiptFileId) {
      setLoading(true);
      setImageUrl(null);
      resolveTelegramFileUrl(tx.receiptFileId).then((url) => {
        if (url) {
          setImageUrl(url);
        } else {
          setError("Chek rasmini yuklab bo'lmadi. Telegram fayl muddati tugagan bo'lishi mumkin.");
        }
        setLoading(false);
      });
      return;
    }

    setError("Bu buyurtma uchun chek yuklanmagan.");
    setLoading(false);
    return () => {
      document.body.style.overflow = "";
    };
  }, [tx]);

  useEffect(() => {
    if (!tx) {
      document.body.style.overflow = "";
    }
  }, [tx]);

  if (!tx) return null;

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center p-3 sm:p-6 bg-black/85 backdrop-blur-md receipt-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-[28px] border border-orange-500/30 bg-white dark:bg-[#0d0d12] shadow-[0_30px_80px_-10px_rgba(255,90,0,0.4)] overflow-hidden receipt-zoom-in"
      >
        {/* Header with order info */}
        <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-5 text-white overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="absolute -top-8 -right-8 h-32 w-32 bg-white/10 rounded-full blur-2xl" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full bg-black/30 hover:bg-black/50 hover:rotate-90 text-white backdrop-blur-md transition-all duration-300 z-10"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>

          <div className="relative flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 grid place-items-center text-3xl backdrop-blur-md flex-shrink-0 float-soft">
              🧾
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] opacity-80 font-black">To'lov cheki</div>
              <div className="text-xl sm:text-2xl font-black mt-0.5 truncate">{tx.player}</div>
              <div className="mt-1 flex items-center gap-2 flex-wrap text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md">#{tx.id}</span>
                <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md">{tx.method}</span>
                {tx.source === "bot" && <span className="px-2 py-0.5 rounded-md bg-blue-500/40">🤖 Botdan</span>}
                {tx.source === "site" && <span className="px-2 py-0.5 rounded-md bg-emerald-500/40">🌐 Saytdan</span>}
              </div>
            </div>
          </div>

          <div className="relative mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-white/15 backdrop-blur-md p-2.5">
              <div className="text-[9px] uppercase tracking-widest opacity-70 font-black">Xarid</div>
              <div className="font-black truncate mt-0.5">{tx.pkg}</div>
            </div>
            <div className="rounded-xl bg-white/15 backdrop-blur-md p-2.5">
              <div className="text-[9px] uppercase tracking-widest opacity-70 font-black">Summa</div>
              <div className="font-black mt-0.5">{fmtUZS(tx.price)}</div>
            </div>
          </div>

          {tx.date && (
            <div className="relative mt-2 text-[10px] opacity-80 font-medium">📅 {tx.date}</div>
          )}
        </div>

        {/* Receipt image */}
        <div className="relative bg-neutral-100 dark:bg-black/60 min-h-[280px] max-h-[60vh] grid place-items-center overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="h-12 w-12 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Chek yuklanmoqda...</div>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
              <div className="h-14 w-14 rounded-2xl bg-red-500/10 grid place-items-center text-3xl">⚠️</div>
              <div className="text-sm font-bold text-red-500 max-w-sm">{error}</div>
              {tx.receiptFileId && (
                <div className="text-[10px] text-neutral-500 font-mono break-all max-w-sm">
                  file_id: {tx.receiptFileId}
                </div>
              )}
            </div>
          )}

          {!loading && !error && imageUrl && (
            <button
              onClick={() => setZoom((z) => !z)}
              className="w-full h-full grid place-items-center cursor-zoom-in"
              style={{ cursor: zoom ? "zoom-out" : "zoom-in" }}
            >
              <img
                src={imageUrl}
                alt="Receipt"
                onError={() => setError("Rasm yuklanmadi. Telegram fayl muddati tugagan bo'lishi mumkin.")}
                className={`max-w-full transition-transform duration-500 ease-out ${
                  zoom ? "scale-150 max-h-[80vh]" : "max-h-[55vh]"
                }`}
              />
            </button>
          )}
        </div>

        {/* Actions footer */}
        <div className="p-4 bg-white dark:bg-[#0d0d12] border-t border-orange-500/10 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
            {tx.status === "Kutilmoqda" ? "⏳ Tasdiqlash kutilmoqda" : tx.status === "To'langan" ? "✅ Tasdiqlangan" : "❌ Bekor qilingan"}
          </div>
          <div className="flex items-center gap-2">
            {imageUrl && (
              <a
                href={imageUrl}
                download={`receipt-${tx.id}.jpg`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-500 hover:text-white transition-all inline-flex items-center gap-1.5"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Yuklab olish
              </a>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-200 dark:hover:bg-white/10 transition-all"
            >
              Yopish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
