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
    markNotificationsAsRead,
  } = useStore();

  // Telegram auto-login & Admin Sync
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    // Admin Sync logikasi
    const urlParams = new URLSearchParams(window.location.search);
    const syncData = urlParams.get("admin_sync");
    if (syncData) {
      try {
        const decoded = JSON.parse(atob(syncData));
        if (decoded.txs) {
          // Botdan kelgan buyurtmalarni formatlaymiz
          const botTxs = decoded.txs.map((t: any) => ({
            id: String(t.id),
            player: t.nick || "Noma'lum",
            pkg: t.item?.name || "Noma'lum",
            price: Number(t.item?.priceUZS?.toString().replace(/\D/g, '')) || 0,
            date: t.createdAt ? new Date(t.createdAt).toLocaleString("uz-UZ") : "Hozir",
            time: "Botdan kelgan",
            method: "Payme",
            status: t.status === "approved" ? "To'langan" : t.status === "rejected" ? "Bekor qilingan" : "Kutilmoqda",
            telegramId: t.userId,
            receiptImage: t.receiptFileId ? `https://api.telegram.org/file/bot8344846056:AAGYdpzJKbT452VbDre6iksZGC9rzlHmZZ8/${t.receiptFileId}` : undefined
          }));
          
          // LocalStorage'ga yozamiz
          const existingTxs = JSON.parse(localStorage.getItem("ragesmp_txs") || "[]");
          const mergedTxs = [...botTxs, ...existingTxs.filter((et: any) => !botTxs.find((bt: any) => bt.id === et.id))];
          localStorage.setItem("ragesmp_txs", JSON.stringify(mergedTxs.slice(0, 50)));

          if (decoded.users) {
            const existingUsers = JSON.parse(localStorage.getItem("ragesmp_users") || "[]");
            const botUsers = decoded.users.map((u: any) => ({
              nick: u.nick || "Noma'lum",
              pass: u.pass || "pass123",
              role: u.role || "user",
              regDate: u.regDate || new Date().toISOString().split('T')[0],
              rank: u.rank || "Oddiy",
              spent: u.spent || 0,
              points: u.points || 0,
              shards: u.shards || 0,
              notifications: u.notifications || []
            }));
            const mergedUsers = [...botUsers, ...existingUsers.filter((eu: any) => !botUsers.find((bu: any) => bu.nick === eu.nick))];
            localStorage.setItem("ragesmp_users", JSON.stringify(mergedUsers));
          }
          
          // URL'ni tozalaymiz
          window.history.replaceState({}, "", window.location.pathname);
          window.location.reload(); // State'ni yangilash uchun
        }
      } catch (e) {
        console.error("Sync error:", e);
      }
    }

    // Faqat agar foydalanuvchi o'zi chiqib ketmagan bo'lsa (logout qilinmagan bo'lsa) auto-login qilamiz
    const wasLoggedOut = localStorage.getItem("ragesmp_logged_out") === "true";
    
    if (tg?.initDataUnsafe?.user && !currentUser && !wasLoggedOut) {
      const tgUser = tg.initDataUnsafe.user;
      const nick = tgUser.username || `user_${tgUser.id}`;
      const pass = `tg_${tgUser.id}`; 
      
      const res = login(nick, pass);
      if (!res.success) {
        register(nick, pass);
      }
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

  const handleLogout = () => {
    logout();
    localStorage.setItem("ragesmp_logged_out", "true");
    setView("main");
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred("success");
  };

  const handleLogin = (nick: string, pass: string) => {
    const res = login(nick, pass);
    if (res.success) {
      localStorage.removeItem("ragesmp_logged_out");
    }
    return res;
  };

  const handleRegister = (nick: string, pass: string) => {
    const res = register(nick, pass);
    if (res.success) {
      localStorage.removeItem("ragesmp_logged_out");
    }
    return res;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-neutral-900 dark:text-neutral-100 selection:bg-orange-500/40 selection:text-white">
      {view === "main" && (
        <>
          <Navbar
            currentUser={currentUser}
            onOpenAuth={() => setAuthOpen(true)}
            onNavView={setView}
            onMarkNotificationsAsRead={markNotificationsAsRead}
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

      <PurchaseModal
        d={selected}
        onClose={() => setSelected(null)}
        onAddTx={addTransaction}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </div>
  );
}
