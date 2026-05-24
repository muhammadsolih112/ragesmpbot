import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import DonateCards from "./components/DonateCards";
import HowToBuy from "./components/HowToBuy";
import RecentPurchases from "./components/RecentPurchases";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import PurchaseModal from "./components/PurchaseModal";
import AuthModal from "./components/AuthModal";
import AdminPanel from "./components/AdminPanel";
import UserDashboard from "./components/UserDashboard";
import type { Donation } from "./data/donations";
import { useStore } from "./data/store";

export default function App() {
  const [selected, setSelected] = useState<Donation | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [view, setView] = useState<"main" | "admin" | "profile">("main");

  const {
    users,
    txs,
    userTrash,
    txTrash,
    currentUser,
    login,
    register,
    logout,
    addTransaction,
    updateTxStatus,
    deleteTx,
    restoreTx,
    permanentDeleteTx,
    updateUserRank,
    deleteUser,
    restoreUser,
    permanentDeleteUser,
  } = useStore();

  // Telegram auto-login
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user && !currentUser) {
      const tgUser = tg.initDataUnsafe.user;
      const nick = tgUser.username || `user_${tgUser.id}`;
      const pass = `tg_${tgUser.id}`; // Simple internal password for TG users
      
      // Try to login, if fails register
      const res = login(nick, pass);
      if (!res.success) {
        register(nick, pass);
      }
      tg.expand();
      tg.ready();
    }
  }, [currentUser, login, register]);

  // initial theme
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      // Apply TG colors to CSS variables
      const root = document.documentElement;
      if (tg.themeParams.bg_color) root.style.setProperty('--tg-bg', tg.themeParams.bg_color);
      if (tg.themeParams.text_color) root.style.setProperty('--tg-text', tg.themeParams.text_color);
      if (tg.themeParams.hint_color) root.style.setProperty('--tg-hint', tg.themeParams.hint_color);
      if (tg.themeParams.link_color) root.style.setProperty('--tg-link', tg.themeParams.link_color);
      if (tg.themeParams.button_color) root.style.setProperty('--tg-button', tg.themeParams.button_color);
      if (tg.themeParams.button_text_color) root.style.setProperty('--tg-button-text', tg.themeParams.button_text_color);

      const isDark = tg.colorScheme === "dark";
      document.documentElement.classList.toggle("dark", isDark);
      tg.expand();
      tg.ready();
      return;
    }

    const stored = localStorage.getItem("theme");
    const dark =
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  // Handle BackButton in TG
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    if (view !== "main") {
      tg.BackButton.show();
      tg.BackButton.onClick(() => setView("main"));
    } else {
      tg.BackButton.hide();
    }
  }, [view]);

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [view]);

  // Whenever currentUser changes or logs out, ensure view is appropriate
  const handleLogout = () => {
    logout();
    setView("main");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-neutral-900 dark:text-neutral-100 selection:bg-orange-500/40 selection:text-white">
      {view === "main" && (
        <>
          <Navbar
            currentUser={currentUser}
            onOpenAuth={() => setAuthOpen(true)}
            onNavView={setView}
          />
          <main>
            <Hero />
            <Marquee />
            <DonateCards onSelect={setSelected} />
            <HowToBuy />
            {currentUser?.role === "admin" && <RecentPurchases />}
            <FAQ />
          </main>
          <Footer />
        </>
      )}

      {view === "admin" && (
        <AdminPanel
          users={users}
          txs={txs}
          userTrash={userTrash}
          txTrash={txTrash}
          onUpdateTxStatus={updateTxStatus}
          onDeleteTx={deleteTx}
          onRestoreTx={restoreTx}
          onPermanentDeleteTx={permanentDeleteTx}
          onUpdateUserRank={updateUserRank}
          onDeleteUser={deleteUser}
          onRestoreUser={restoreUser}
          onPermanentDeleteUser={permanentDeleteUser}
          onAddSimulatedTx={addTransaction}
          onLogout={handleLogout}
          onBack={() => setView("main")}
        />
      )}

      {view === "profile" && currentUser && (
        <UserDashboard
          user={currentUser}
          txs={txs}
          onLogout={handleLogout}
          onBack={() => setView("main")}
          onBuy={setSelected}
        />
      )}

      <PurchaseModal d={selected} onClose={() => setSelected(null)} />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLogin={login}
        onRegister={register}
      />
    </div>
  );
}
