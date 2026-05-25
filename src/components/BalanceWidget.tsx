import { fmtUZS } from "../data/donations";

export default function BalanceWidget({
  balance,
  onClick,
}: {
  balance: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title="Balansni to'ldirish"
      className="group relative inline-flex items-center gap-2 pl-2 pr-3 py-1.5 sm:py-2 rounded-xl border border-emerald-400/50 bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-emerald-500/15 hover:from-emerald-500/30 hover:to-cyan-500/20 hover:scale-[1.04] active:scale-95 transition-all shadow-md shadow-emerald-500/20"
    >
      <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-400/30 via-cyan-400/30 to-emerald-400/30 blur opacity-40 group-hover:opacity-80 transition" />
      <span className="relative h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 grid place-items-center text-white text-sm shadow-md">
        💰
      </span>
      <div className="relative text-left leading-none">
        <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300 font-black">Balans</div>
        <div className="text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-100 mt-0.5">
          {fmtUZS(balance)}
        </div>
      </div>
      <svg className="relative h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
    </button>
  );
}
