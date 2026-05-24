import logoImg from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="relative border-t border-orange-500/20 mt-10">
      <div className="absolute inset-0 fire-gradient-soft pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-11 w-11 grid place-items-center rounded-xl overflow-hidden shadow-lg shadow-orange-500/40 border border-orange-500/30">
              <img src={logoImg} alt="RageSMP" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-lg font-black">Rage<span className="fire-text">SMP</span></div>
              <div className="text-[10px] uppercase tracking-widest text-orange-500/80">Minecraft Server</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-neutral-500">
            O'zbekistondagi eng qaynoq Minecraft SMP serveri. Olovli sarguzashtlar bizda boshlanadi.
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest font-bold text-orange-500">Tezkor havolalar</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="#donate" className="hover:text-orange-500 transition-colors">Donatlar</a></li>
            <li><a href="#how" className="hover:text-orange-500 transition-colors">Qanday sotib olish</a></li>
            <li><a href="#recent" className="hover:text-orange-500 transition-colors">Tarix & TOP</a></li>
            <li><a href="#faq" className="hover:text-orange-500 transition-colors">FAQ</a></li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest font-bold text-orange-500">Aloqa</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>📱 Telegram: <a className="hover:text-orange-500 font-bold" href="https://t.me/RageSMPuz" target="_blank" rel="noreferrer">@RageSMPuz</a></li>
            <li>👑 Admin: <a className="hover:text-orange-500 font-bold" href="https://t.me/vebuca" target="_blank" rel="noreferrer">@vebuca</a></li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest font-bold text-orange-500">Server</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>IP: <span className="font-mono font-bold text-orange-500">ragesmp.uz</span></li>
            <li>Versiya: <span className="font-bold">1.12.2 dan 1.21.11 gacha</span></li>
            <li>Rejim: <span className="font-bold">SMP</span></li>
            <li>Status: <span className="text-emerald-500 font-bold">● Online</span></li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-orange-500/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs text-neutral-500">© {new Date().getFullYear()} RageSMP. Barcha huquqlar himoyalangan.</div>
          <div className="text-xs text-neutral-500">
            Not affiliated with Mojang or Microsoft. Made with 🔥 in Uzbekistan.
          </div>
        </div>
      </div>
    </footer>
  );
}
