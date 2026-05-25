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
import SyncToast from "./components/SyncToast";
import TopUpModal from "./components/TopUpModal";
import MediaRankRequestModal from "./components/MediaRankRequestModal";
import type { Donation } from "./data/donations";
import { useStore } from "./data/store";
import { useSiteConfig } from "./data/siteConfig";

export default function App() {
  const [selected, setSelected] = useState<Donation | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [view, setView] = useState<"main" | "admin" | "profile">("main");
  const [syncToast, setSyncToast] = useState<{ count: number; ts: number } | null>(null);
  const { config } = useSiteConfig();

  const {
    users,
    txs,
    mediaRequests,
    userTrash,
    txTrash,
    currentUser,
    login,
    register,
    logout,
    addTransaction,
    addTopupRequest,
    addBalancePurchase,
    adjustUserBalance,
    setUserBalance,
    updateTxStatus,
    deleteTx,
    restoreTx,
    permanentDeleteTx,
    updateUserRank,
    deleteUser,
    restoreUser,
    permanentDeleteUser,
    markNotificationsAsRead,
    addMediaRequest,
    updateMediaRequestStatus,
  } = useStore();

  // Telegram auto-login & Admin Sync
  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    // Admin Sync logikasi — URL'dan admin_sync ni qo'lda olamiz
    // (URLSearchParams "+" ni " " ga aylantiradi va base64 ni buzadi)
    const rawSearch = window.location.search || window.location.hash || "";
    const startParam = tg?.initDataUnsafe?.start_param;
    let syncData: string | null = null;
    const match = rawSearch.match(/[?&#]admin_sync=([^&]+)/);
    if (match) {
      syncData = decodeURIComponent(match[1]).replace(/ /g, "+");
    } else if (startParam && startParam.startsWith("admin_sync=")) {
      syncData = decodeURIComponent(startParam.slice("admin_sync=".length)).replace(/ /g, "+");
    }

    // localStorage'dan oldingi sync ni ham tekshiramiz (sahifa qayta yuklansa)
    if (!syncData) {
      const pending = localStorage.getItem("ragesmp_pending_sync");
      if (pending) {
        syncData = pending;
        localStorage.removeItem("ragesmp_pending_sync");
      }
    }

    if (syncData) {
      try {
        // Safe base64 decoding with error handling
        const binary = window.atob(syncData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const decodedStr = new TextDecoder().decode(bytes);
        const decoded = JSON.parse(decodedStr);

        if (decoded && decoded.txs) {
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
            receiptFileId: t.receiptFileId || undefined, // Chek file_id (getFile orqali resolve qilamiz)
            source: "bot",
          }));
          
          // LocalStorage'ga yozamiz
          const existingTxs = JSON.parse(localStorage.getItem("ragesmp_txs") || "[]");
          const mergedTxs = [...botTxs, ...existingTxs.filter((et: any) => !botTxs.find((bt: any) => bt.id === et.id))];
          localStorage.setItem("ragesmp_txs", JSON.stringify(mergedTxs.slice(0, 100)));

          if (decoded.users) {
            const existingUsers = JSON.parse(localStorage.getItem("ragesmp_users") || "[]");
            const botUsers = decoded.users.map((u: any) => {
              const nickLower = u.nick?.toLowerCase();
              const isAdminNick = nickLower === "vebuca" || nickLower === "vebuca1";
              
              const existing = existingUsers.find((ex: any) => ex.nick?.toLowerCase() === nickLower);
              
              return {
                nick: u.nick || "Noma'lum",
                pass: existing ? existing.pass : (nickLower === "vebuca" ? "vebuca88888880" : (nickLower === "vebuca1" ? "vebucaadmin" : "pass123")),
                role: isAdminNick ? "admin" : (existing ? existing.role : "user"),
                regDate: u.regDate || (existing ? existing.regDate : new Date().toISOString().split('T')[0]),
                rank: u.rank || (existing ? existing.rank : "Oddiy"),
                spent: Number(u.spent) || (existing ? existing.spent : 0),
                balance: Number(u.balance ?? (existing ? existing.balance : 0)) || 0,
                points: Number(u.points) || (existing ? existing.points : 1000),
                shards: Number(u.shards) || (existing ? existing.shards : 1000),
                notifications: u.notifications || (existing ? existing.notifications : [])
              };
            });
            
            const mergedUsers = [...botUsers, ...existingUsers.filter((eu: any) => !botUsers.find((bu: any) => bu.nick === eu.nick))];
            localStorage.setItem("ragesmp_users", JSON.stringify(mergedUsers));
            
            const currentUserStr = localStorage.getItem("ragesmp_current_user");
            if (currentUserStr) {
              try {
                const currentU = JSON.parse(currentUserStr);
                const updatedMe = botUsers.find((bu: any) => bu.nick.toLowerCase() === currentU.nick.toLowerCase());
                if (updatedMe) {
                  localStorage.setItem("ragesmp_current_user", JSON.stringify({ ...currentU, ...updatedMe }));
                }
              } catch {}
            }
          }
          
          // Yangi (kutilayotgan) bot buyurtmalari sonini hisoblaymiz
          const oldPendingIds = new Set(
            (JSON.parse(localStorage.getItem("ragesmp_txs") || "[]") as any[])
              .filter((t) => t.status === "Kutilmoqda")
              .map((t) => String(t.id))
          );
          const newPendingFromBot = botTxs.filter((b: any) => b.status === "Kutilmoqda" && !oldPendingIds.has(String(b.id)));
          if (newPendingFromBot.length > 0) {
            localStorage.setItem("ragesmp_last_sync_count", String(newPendingFromBot.length));
          }

          // URL'ni tozalaymiz va yangilaymiz
          window.history.replaceState({}, "", window.location.pathname);
          setTimeout(() => window.location.reload(), 100);
          return;
        }
      } catch (e) {
        console.error("Sync error details:", e);
        // Silently clear URL if corrupted sync data
        window.history.replaceState({}, "", window.location.pathname);
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

  // initial theme — default DARK (night mode), foydalanuvchi xohlasa o'zgartiradi
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const stored = localStorage.getItem("theme");

    if (tg) {
      // Apply TG colors to CSS variables
      const root = document.documentElement;
      if (tg.themeParams.bg_color) root.style.setProperty('--tg-bg', tg.themeParams.bg_color);
      if (tg.themeParams.text_color) root.style.setProperty('--tg-text', tg.themeParams.text_color);
      if (tg.themeParams.hint_color) root.style.setProperty('--tg-hint', tg.themeParams.hint_color);
      if (tg.themeParams.link_color) root.style.setProperty('--tg-link', tg.themeParams.link_color);
      if (tg.themeParams.button_color) root.style.setProperty('--tg-button', tg.themeParams.button_color);
      if (tg.themeParams.button_text_color) root.style.setProperty('--tg-button-text', tg.themeParams.button_text_color);

      // Default: dark. Faqat foydalanuvchi qo'lda "light" tanlagan bo'lsa light qilamiz.
      const dark = stored ? stored === "dark" : true;
      document.documentElement.classList.toggle("dark", dark);
      tg.expand();
      tg.ready();
      return;
    }

    // Brauzer rejimi — default dark, agar saqlangan tanlov bo'lsa shu
    const dark = stored ? stored === "dark" : true;
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  // Sync toast: agar reload'dan keyin yangi bot buyurtmalari kelgan bo'lsa, toast chiqaramiz
  useEffect(() => {
    const lastSyncCount = localStorage.getItem("ragesmp_last_sync_count");
    if (lastSyncCount && Number(lastSyncCount) > 0) {
      setSyncToast({ count: Number(lastSyncCount), ts: Date.now() });
      localStorage.removeItem("ragesmp_last_sync_count");
    }
  }, []);

  // Bot API polling: admin login bo'lganda har 15 soniyada bot HTTP API'sidan buyurtmalarni oladi
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") return;
    const apiUrl = (config.links.botApiUrl || "").trim();
    if (!apiUrl) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const r = await fetch(apiUrl, { cache: "no-store" });
        if (!r.ok) return;
        const data = await r.json();
        if (cancelled) return;

        let hasChanges = false;

        // Sync orders
        if (data?.orders) {
          const existing = JSON.parse(localStorage.getItem("ragesmp_txs") || "[]") as any[];
          const existingIds = new Set(existing.map((t) => String(t.id)));

          const botTxs = (data.orders as any[]).map((t) => {
            const existingTx = existing.find((e) => String(e.id) === String(t.id));
            const botStatus = t.status === "approved" ? "To'langan" : t.status === "rejected" ? "Bekor qilingan" : "Kutilmoqda";
            const status = existingTx && (existingTx.status === "To'langan" || existingTx.status === "Bekor qilingan") 
              ? existingTx.status 
              : botStatus;
            return {
              id: String(t.id),
              player: t.nick || "Noma'lum",
              pkg: t.item?.name || "Noma'lum",
              price: Number(String(t.item?.priceUZS || "0").replace(/\D/g, "")) || 0,
              date: t.createdAt ? new Date(t.createdAt).toLocaleString("uz-UZ") : "Hozir",
              time: "Botdan kelgan",
              method: "Payme",
              status,
              telegramId: t.userId,
              receiptFileId: t.receiptFileId || undefined,
              source: "bot",
              type: "purchase",
            };
          });

          const newOnes = botTxs.filter((b) => !existingIds.has(b.id));
          const hasTxStatusChange = existing.some((e) => {
            const botTx = botTxs.find((b) => b.id === e.id);
            if (!botTx) return false;
            if (e.status === "To'langan" || e.status === "Bekor qilingan") return false;
            return botTx.status !== e.status;
          });
          
          if (newOnes.length > 0 || hasTxStatusChange) {
            hasChanges = true;
            const merged = [...botTxs, ...existing.filter((e) => !botTxs.find((b) => b.id === String(e.id)))];
            localStorage.setItem("ragesmp_txs", JSON.stringify(merged.slice(0, 100)));
            
            // Yangi pending buyurtmalar uchun toast
            const newPending = newOnes.filter((n) => n.status === "Kutilmoqda");
            if (newPending.length > 0) {
              setSyncToast({ count: newPending.length, ts: Date.now() });
            }
          }
        }

        // Sync media requests
        if (data?.mediaRequests) {
          const existingMedia = JSON.parse(localStorage.getItem("ragesmp_media_requests") || "[]") as any[];
          const existingMediaIds = new Set(existingMedia.map((r) => String(r.id)));

          const botMediaRequests = (data.mediaRequests as any[]).map((r) => {
            const existingReq = existingMedia.find((e) => String(e.id) === String(r.id));
            const botStatus = r.status === "approved" ? "Tasdiqlangan" : r.status === "rejected" ? "Bekor qilingan" : "Kutilmoqda";
            const status = existingReq && (existingReq.status === "Tasdiqlangan" || existingReq.status === "Bekor qilingan") 
              ? existingReq.status 
              : botStatus;
            return {
              id: String(r.id),
              player: r.nick || "Noma'lum",
              telegramUsername: r.telegramUsername,
              screenshots: r.screenshots || [],
              status,
              date: r.createdAt ? new Date(r.createdAt).toLocaleString("uz-UZ") : "Hozir",
              time: "Botdan kelgan",
            };
          });

          const newMediaOnes = botMediaRequests.filter((r) => !existingMediaIds.has(r.id));
          const hasStatusChange = existingMedia.some((e) => {
            const botReq = botMediaRequests.find((r) => r.id === e.id);
            if (!botReq) return false;
            if (e.status === "Tasdiqlangan" || e.status === "Bekor qilingan") return false;
            return botReq.status !== e.status;
          });
          
          if (newMediaOnes.length > 0 || hasStatusChange) {
            hasChanges = true;
            const merged = [...botMediaRequests, ...existingMedia.filter((e) => !botMediaRequests.find((r) => r.id === String(e.id)))];
            localStorage.setItem("ragesmp_media_requests", JSON.stringify(merged.slice(0, 100)));
          }
        }

        // Reload if there are changes
        if (hasChanges && !cancelled) {
          setTimeout(() => window.location.reload(), 800);
        }
      } catch {
        // sukut bilan o'tib ketamiz
      }
    };

    poll(); // darhol birinchi marta
    const interval = setInterval(poll, 15000); // har 15 sekundda
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [currentUser, config.links.botApiUrl]);

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
    if (typeof IntersectionObserver === "undefined") {
      // Fallback — browser qadimgi bo'lsa, hammasini darhol ko'rsatamiz
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    // Mount qilingandan keyin observer ulanadi (DOM tayyor bo'lishi uchun)
    const t = setTimeout(() => {
      document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    }, 50);

    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
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
            onOpenTopUp={() => {
              if (!currentUser) {
                setAuthOpen(true);
              } else {
                setTopUpOpen(true);
              }
            }}
          />
          <main>
            <Hero />
            <Marquee />
            <DonateCards onSelect={setSelected} currentUser={currentUser} onOpenAuth={() => setAuthOpen(true)} onOpenMediaModal={() => setMediaModalOpen(true)} />
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
          mediaRequests={mediaRequests}
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
          onAdjustBalance={adjustUserBalance}
          onSetBalance={setUserBalance}
          onUpdateMediaRequestStatus={updateMediaRequestStatus}
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
        currentUser={currentUser}
        onClose={() => setSelected(null)}
        onAddTx={addTransaction}
        onBalancePurchase={addBalancePurchase}
        onOpenTopUp={() => {
          setSelected(null);
          setTopUpOpen(true);
        }}
      />

      <TopUpModal
        open={topUpOpen && !!currentUser}
        userNick={currentUser?.nick || ""}
        onClose={() => setTopUpOpen(false)}
        onSubmit={async (amount, receiptImage) => {
          if (currentUser) {
            await addTopupRequest(currentUser.nick, amount, receiptImage);
          }
        }}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <MediaRankRequestModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        currentUser={currentUser}
        addMediaRequest={addMediaRequest}
      />

      <SyncToast
        toast={syncToast}
        onClose={() => setSyncToast(null)}
        onOpenAdmin={() => {
          setView("admin");
          setSyncToast(null);
        }}
      />
    </div>
  );
}
