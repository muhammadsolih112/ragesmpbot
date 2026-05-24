import { useState } from "react";

const faqs = [
  {
    q: "Donat qancha vaqtga beriladi?",
    a: "Barcha donatlar 30 kunga (1 oy) beriladi. Vaqt tugagach, yana qayta sotib olishingiz mumkin.",
  },
  {
    q: "To'lovdan keyin donat qachon yetadi?",
    a: "Mini App orqali to'lov amalga oshirilgandan so'ng 5-10 soniya ichida avtomatik tarzda akkauntingizga qo'shiladi.",
  },
  {
    q: "Qaysi to'lov turlarini qabul qilasiz?",
    a: "Click, Payme, Uzcard, HUMO va bank kartalar orqali to'lash mumkin. Hammasi xavfsiz Mini App ichida amalga oshadi.",
  },
  {
    q: "Agar nick'imni xato yozsam nima bo'ladi?",
    a: "Administratorga (@RageSMP_admin) murojaat qiling — donatni to'g'ri akkauntga ko'chirib beramiz.",
  },
  {
    q: "Bir nechta donat sotib olsam, kuchayadimi?",
    a: "Faqat eng yuqori paket faollashadi. Lekin RagePro → Rage+ → SMP Elite yo'lida narx farqi to'lovi orqali yuqorilashingiz mumkin.",
  },
  {
    q: "Server qaysi versiyada ishlaydi?",
    a: "Server 1.12.2 dan 1.21.11 gacha bo'lgan barcha versiyalarda ishlaydi. Java va Bedrock orqali muammosiz kirishingiz mumkin.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  const toggle = (i: number) => {
    setOpen(open === i ? -1 : i);
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
  };

  return (
    <section id="faq" className="relative py-16 sm:py-24 reveal">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-semibold text-orange-600 dark:text-orange-300">
            ❓ SAVOL-JAVOB
          </div>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tighter">
            Tez-tez beriladigan <span className="fire-text">savollar</span>
          </h2>
        </div>

        <div className="mt-10 sm:mt-12 space-y-3">
          {faqs.map((f, i) => {
            const active = open === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border transition-all backdrop-blur ${
                  active
                    ? "border-orange-500/60 bg-white/90 dark:bg-white/[0.05] shadow-lg shadow-orange-500/10"
                    : "border-orange-500/20 bg-white/70 dark:bg-white/[0.03] hover:border-orange-500/40"
                }`}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left"
                >
                  <span className="font-semibold text-sm sm:text-lg">{f.q}</span>
                  <span
                    className={`flex-shrink-0 grid place-items-center h-7 w-7 sm:h-8 sm:w-8 rounded-full fire-gradient text-white transition-transform ${
                      active ? "rotate-45" : ""
                    }`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: active ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 sm:px-6 pb-4 sm:pb-5 text-xs sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
