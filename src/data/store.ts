import { useState, useEffect } from "react";

export type TxType = "purchase" | "balance_purchase" | "topup";

export type Transaction = {
  id: string;
  player: string;
  pkg: string;
  price: number;
  time: string;
  date: string;
  method: "Click" | "Payme" | "Uzcard" | "Humo" | "Balance";
  status: "To'langan" | "Kutilmoqda" | "Bekor qilingan";
  type?: TxType; // "purchase" (default), "balance_purchase" (balansdan), "topup" (balans to'ldirish)
  receiptImage?: string; // Base64 encoded image yoki URL
  receiptFileId?: string; // Telegram file_id (botdan kelgan rasm uchun)
  telegramId?: string; // Telegram user ID for notifications
  source?: "site" | "bot"; // Qaerdan kelganligini bilish uchun
  deletedAt?: string;
  deletedAtLabel?: string;
  previousStatus?: Transaction["status"];
};

export type Notification = {
  id: string;
  text: string;
  time: string;
  read: boolean;
};

export type MediaRequest = {
  id: string;
  player: string;
  screenshots: string[];
  telegramUsername: string;
  status: "Kutilmoqda" | "Tasdiqlangan" | "Bekor qilingan";
  date: string;
  time: string;
};

export type User = {
  nick: string;
  pass: string;
  role: "admin" | "user";
  regDate: string;
  rank: string;
  spent: number;
  balance: number; // Foydalanuvchi balansi (so'mda)
  points: number;
  shards: number;
  notifications: Notification[];
  deletedAt?: string;
  deletedAtLabel?: string;
};

const nowLabel = () => new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
const migrateRank = (rank: string) => {
  if (rank === "EMBER") return "PHENTHER";
  if (rank === "FLAME" || rank === "BLAZE") return "PRO";
  if (rank === "INFERNO") return "ELITE";
  if (rank === "PHENTHER") return "RagePro";
  if (rank === "PRO") return "Rage+";
  if (rank === "ELITE") return "SMP Elite";
  return rank;
};
const priceForRank = (rank: string, fallback: number) => {
  if (rank === "RagePro") return 10000;
  if (rank === "Rage+") return 30000;
  if (rank === "SMP Elite") return 50000;
  return fallback;
};
const migrateUsers = (items: User[]) => items.map((u) => ({ ...u, rank: migrateRank(u.rank) }));
const migrateTxs = (items: Transaction[]) =>
  items.map((t) => {
    const pkg = migrateRank(t.pkg);
    return { ...t, pkg, price: priceForRank(pkg, t.price) };
  });
const pruneTrash = <T extends { deletedAt?: string }>(items: T[]) => {
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return items.filter((item) => {
    if (!item.deletedAt) return true;
    const time = Date.parse(item.deletedAt);
    if (Number.isNaN(time)) return true;
    return Date.now() - time < thirtyDays;
  });
};

const INITIAL_USERS: User[] = [
  { nick: "vebuca", pass: "vebuca88888880", role: "admin", regDate: "2026-01-10", rank: "SMP Elite", spent: 500000, balance: 0, points: 1000, shards: 1000, notifications: [] },
  { nick: "vebuca1", pass: "vebucaadmin", role: "admin", regDate: "2026-05-25", rank: "SMP Elite", spent: 0, balance: 0, points: 1000, shards: 1000, notifications: [] },
  { nick: "ShohruhPro", pass: "pass123", role: "user", regDate: "2026-01-12", rank: "SMP Elite", spent: 250000, balance: 0, points: 1000, shards: 1000, notifications: [] },
  { nick: "RageHunter", pass: "pass123", role: "user", regDate: "2026-01-15", rank: "SMP Elite", spent: 190000, balance: 0, points: 2000, shards: 1000, notifications: [] },
  { nick: "ToshkentBoy", pass: "pass123", role: "user", regDate: "2026-01-18", rank: "Rage+", spent: 150000, balance: 0, points: 0, shards: 0, notifications: [] },
  { nick: "AzizbekMC", pass: "pass123", role: "user", regDate: "2026-01-20", rank: "Rage+", spent: 120000, balance: 0, points: 500, shards: 0, notifications: [] },
  { nick: "NightCraft", pass: "pass123", role: "user", regDate: "2026-01-22", rank: "Rage+", spent: 90000, balance: 0, points: 0, shards: 100, notifications: [] },
  { nick: "OlimjonUZ", pass: "pass123", role: "user", regDate: "2026-01-25", rank: "RagePro", spent: 10000, balance: 0, points: 0, shards: 0, notifications: [] },
  { nick: "DonerKing", pass: "pass123", role: "user", regDate: "2026-01-28", rank: "RagePro", spent: 10000, balance: 0, points: 0, shards: 0, notifications: [] },
];

const INITIAL_TXS: Transaction[] = [
  { id: "TX-1001", player: "ShohruhPro", pkg: "SMP Elite", price: 50000, time: "5 daqiqa oldin", date: "2026-02-12 14:32", method: "Payme", status: "To'langan" },
  { id: "TX-1002", player: "AzizbekMC", pkg: "Rage+", price: 30000, time: "12 daqiqa oldin", date: "2026-02-12 14:25", method: "Click", status: "To'langan" },
  { id: "TX-1003", player: "OlimjonUZ", pkg: "RagePro", price: 10000, time: "27 daqiqa oldin", date: "2026-02-12 14:10", method: "Uzcard", status: "To'langan" },
  { id: "TX-1004", player: "DonerKing", pkg: "RagePro", price: 10000, time: "1 soat oldin", date: "2026-02-12 13:30", method: "Click", status: "To'langan" },
  { id: "TX-1005", player: "RageHunter", pkg: "SMP Elite", price: 50000, time: "1 soat oldin", date: "2026-02-12 13:25", method: "Payme", status: "To'langan" },
  { id: "TX-1006", player: "NightCraft", pkg: "Rage+", price: 30000, time: "2 soat oldin", date: "2026-02-12 12:15", method: "Humo", status: "To'langan" },
  { id: "TX-1007", player: "PixelWizard", pkg: "Rage+", price: 30000, time: "3 soat oldin", date: "2026-02-12 11:05", method: "Click", status: "Kutilmoqda" },
  { id: "TX-1008", player: "MrSamarqand", pkg: "RagePro", price: 10000, time: "4 soat oldin", date: "2026-02-12 10:20", method: "Uzcard", status: "To'langan" },
  { id: "TX-1009", player: "ToshkentBoy", pkg: "SMP Elite", price: 50000, time: "5 soat oldin", date: "2026-02-12 09:15", method: "Payme", status: "To'langan" },
  { id: "TX-1010", player: "JizzaxLord", pkg: "Rage+", price: 30000, time: "6 soat oldin", date: "2026-02-12 08:30", method: "Click", status: "Bekor qilingan" },
];

export function useStore() {
  const [users, setUsers] = useState<User[]>(() => {
    const s = localStorage.getItem("ragesmp_users");
    if (s) {
      try {
        const parsed = JSON.parse(s);
        const items = parsed.map((u: any) => ({
          ...u,
          points: u.points || 0,
          shards: u.shards || 0,
          balance: Number(u.balance) || 0,
          notifications: u.notifications || []
        }));
        return migrateUsers(pruneTrash(items));
      } catch {}
    }
    localStorage.setItem("ragesmp_users", JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  });

  const [txs, setTxs] = useState<Transaction[]>(() => {
    const s = localStorage.getItem("ragesmp_txs");
    if (s) {
      try { return migrateTxs(pruneTrash(JSON.parse(s))); } catch {}
    }
    localStorage.setItem("ragesmp_txs", JSON.stringify(INITIAL_TXS));
    return INITIAL_TXS;
  });

  const [mediaRequests, setMediaRequests] = useState<MediaRequest[]>(() => {
    const s = localStorage.getItem("ragesmp_media_requests");
    if (s) {
      try { return JSON.parse(s); } catch {}
    }
    localStorage.setItem("ragesmp_media_requests", JSON.stringify([]));
    return [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const s = localStorage.getItem("ragesmp_current_user");
    if (s) {
      try { 
        const u = JSON.parse(s);
        return { ...u, notifications: u.notifications || [] };
      } catch {}
    }
    return null;
  });

  useEffect(() => {
    try {
      localStorage.setItem("ragesmp_users", JSON.stringify(users));
    } catch (e) {
      console.error("LocalStorage save error (users):", e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem("ragesmp_txs", JSON.stringify(txs));
    } catch (e) {
      console.error("LocalStorage save error (txs):", e);
      // If quota exceeded, try to save without images to keep data
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        const leanTxs = txs.map(t => ({ ...t, receiptImage: undefined }));
        localStorage.setItem("ragesmp_txs", JSON.stringify(leanTxs));
      }
    }
  }, [txs]);

  useEffect(() => {
    try {
      localStorage.setItem("ragesmp_media_requests", JSON.stringify(mediaRequests));
    } catch (e) {
      console.error("LocalStorage save error (media requests):", e);
    }
  }, [mediaRequests]);

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem("ragesmp_current_user", JSON.stringify(currentUser));
      } catch (e) {
        console.error("LocalStorage save error (currentUser):", e);
      }
    } else {
      localStorage.removeItem("ragesmp_current_user");
    }
  }, [currentUser]);

  const login = (nick: string, pass: string): { success: boolean; msg: string; user?: User } => {
    const u = users.find((x) => x.nick.toLowerCase() === nick.toLowerCase() && !x.deletedAt);
    if (!u) {
      return { success: false, msg: "Foydalanuvchi topilmadi. Avval ro'yxatdan o'ting!" };
    }
    if (u.pass !== pass) {
      return { success: false, msg: "Parol noto'g'ri kiritildi!" };
    }
    setCurrentUser(u);
    return { success: true, msg: "Muvaffaqiyatli kirdingiz!", user: u };
  };

  const register = (nick: string, pass: string): { success: boolean; msg: string; user?: User } => {
    if (!nick || nick.length < 3) return { success: false, msg: "Nick kamida 3 ta harfdan iborat bo'lishi kerak!" };
    if (!pass || pass.length < 4) return { success: false, msg: "Parol kamida 4 ta belgidan iborat bo'lishi kerak!" };
    
    const exists = users.find((x) => x.nick.toLowerCase() === nick.toLowerCase() && !x.deletedAt);
    if (exists) {
      return { success: false, msg: "Bu nick allaqachon band qilingan!" };
    }

    const newUser: User = {
      nick,
      pass,
      role: nick.toLowerCase() === "vebuca" ? "admin" : "user",
      regDate: new Date().toISOString().split("T")[0],
      rank: "Oddiy",
      spent: 0,
      balance: 0,
      points: 1.000,
      shards: 1.000,
      notifications: [],
    };

    const updated = [...users, newUser];
    setUsers(updated);
    setCurrentUser(newUser);
    return { success: true, msg: "Muvaffaqiyatli ro'yxatdan o'tdingiz!", user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addTransaction = async (player: string, pkgName: string, price: number, method: Transaction["method"], receiptImage?: string) => {
    const newTx: Transaction = {
      id: String(Date.now()),
      player,
      pkg: pkgName,
      price,
      time: "Hozirgi xarid",
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      method,
      status: "Kutilmoqda",
      receiptImage,
      source: "site",
    };
    setTxs([newTx, ...txs]);

    // Try to send the transaction to bot API
    try {
      let botApiUrl = "";
      try {
        const siteConfigRaw = localStorage.getItem("ragesmp_site_config");
        if (siteConfigRaw) {
          const siteConfig = JSON.parse(siteConfigRaw);
          botApiUrl = siteConfig.links?.botApiUrl || "";
        }
      } catch {}

      if (botApiUrl) {
        const baseUrl = botApiUrl.replace(/\/api\/orders.*$/, "");
        const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
        
        await fetch(`${baseUrl}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            player,
            pkg: pkgName,
            price,
            method,
            receiptImage,
            telegramId: tgUser?.id,
            telegramUsername: tgUser?.username ? `@${tgUser.username}` : tgUser?.first_name
          })
        });
      }
    } catch (err) {
      console.error("Failed to send transaction to bot:", err);
    }
  };

  const applyApproval = (t: Transaction) => {
    const type = t.type || "purchase";
    const isTopup = type === "topup";
    const isBalancePurchase = type === "balance_purchase";

    const text = isTopup
      ? `💰 Balansingiz tasdiqlandi: +${t.price.toLocaleString()} so'm hisobingizga qo'shildi.`
      : isBalancePurchase
      ? `✅ Donatingiz muvaffaqiyatli sotib olindi! Endi o'yinga kirib chiqib tekshirib olishingiz mumkin. Xarid: ${t.pkg}`
      : `✅ Chekingiz tasdiqlandi! ${t.pkg} xaridi faollashtirildi.`;

    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      time: nowLabel(),
      read: false,
    };

    const patchUser = (u: User): User => {
      if (u.nick.toLowerCase() !== t.player.toLowerCase()) return u;
      let updated: User = { ...u, notifications: [newNotif, ...u.notifications] };

      if (isTopup) {
        // Balans to'ldirish
        updated.balance = (updated.balance || 0) + t.price;
      } else {
        // Xarid (oddiy yoki balansdan) — spent + rank/points/shards
        updated.spent = (updated.spent || 0) + t.price;
        if (t.pkg.toLowerCase().includes("point")) {
          const amount = parseInt(t.pkg.replace(/\D/g, "")) || 0;
          updated.points += amount;
        } else if (t.pkg.toLowerCase().includes("shard")) {
          const amount = parseInt(t.pkg.replace(/\D/g, "")) || 0;
          updated.shards += amount;
        } else if (!isBalancePurchase || t.pkg) {
          // Rank xaridi
          updated.rank = t.pkg;
        }
      }
      return updated;
    };

    setUsers((usrs) => usrs.map(patchUser));
    if (currentUser && currentUser.nick.toLowerCase() === t.player.toLowerCase()) {
      setCurrentUser((prev) => (prev ? patchUser(prev) : prev));
    }
  };

  const applyRejection = (t: Transaction) => {
    const type = t.type || "purchase";
    const isBalancePurchase = type === "balance_purchase";

    const text = type === "topup"
      ? `❌ Balansni to'ldirish so'rovingiz bekor qilindi. Iltimos, admin bilan bog'laning.`
      : isBalancePurchase
      ? `❌ Xaridingiz bekor qilindi. Balansingiz qaytarildi (+${t.price.toLocaleString()} so'm).`
      : `❌ Chekingiz bekor qilindi. Iltimos, qaytadan urinib ko'ring.`;

    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      time: nowLabel(),
      read: false,
    };

    const patchUser = (u: User): User => {
      if (u.nick.toLowerCase() !== t.player.toLowerCase()) return u;
      let updated: User = { ...u, notifications: [newNotif, ...u.notifications] };

      if (isBalancePurchase) {
        // Balansdan xarid bekor qilinsa balansni qaytaramiz
        updated.balance = (updated.balance || 0) + t.price;
      }
      return updated;
    };

    setUsers((usrs) => usrs.map(patchUser));
    if (currentUser && currentUser.nick.toLowerCase() === t.player.toLowerCase()) {
      setCurrentUser((prev) => (prev ? patchUser(prev) : prev));
    }
  };

  const updateTxStatus = async (id: string, status: Transaction["status"]) => {
    // MUHIM: side effect'larni (applyApproval/applyRejection) updater ichida CHAQIRMAYMIZ,
    // chunki React StrictMode'da updater 2 marta ishlaydi va balans 2x qo'shiladi.
    const target = txs.find((t) => t.id === id);
    if (!target) return;
    const prevStatus = target.status;

    setTxs((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));

    // If this is a bot-sourced transaction, sync the status to the bot's API
    if (target.source === "bot" || target.telegramId) {
      try {
        // Get bot API URL from localStorage (siteConfig)
        let botApiUrl = "";
        try {
          const siteConfigRaw = localStorage.getItem("ragesmp_site_config");
          if (siteConfigRaw) {
            const siteConfig = JSON.parse(siteConfigRaw);
            botApiUrl = siteConfig.links?.botApiUrl || "";
          }
        } catch {}

        if (botApiUrl) {
          // Extract the base URL (remove /api/orders if present)
          const baseUrl = botApiUrl.replace(/\/api\/orders.*$/, "");
          const botStatus = status === "To'langan" ? "approved" : "rejected";
          
          await fetch(`${baseUrl}/api/orders/${id}/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: botStatus })
          });
        }
      } catch (err) {
        console.error("Failed to sync status to bot:", err);
      }
    }

    if (status === "To'langan" && prevStatus !== "To'langan") {
      applyApproval(target);
    } else if (status === "Bekor qilingan" && prevStatus !== "Bekor qilingan") {
      applyRejection(target);
    }
  };

  // Balansdan xarid: balans darhol yechiladi, status = Kutilmoqda
  const addBalancePurchase = (player: string, pkgName: string, price: number): { success: boolean; msg: string; tx?: Transaction } => {
    const user = users.find((u) => u.nick.toLowerCase() === player.toLowerCase() && !u.deletedAt);
    if (!user) return { success: false, msg: "Foydalanuvchi topilmadi." };
    if ((user.balance || 0) < price) {
      return { success: false, msg: `Balans yetarli emas. Sizda ${user.balance.toLocaleString()} so'm bor, kerak: ${price.toLocaleString()} so'm.` };
    }

    const newTx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      player,
      pkg: pkgName,
      price,
      time: "Hozirgi xarid",
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      method: "Balance",
      status: "Kutilmoqda",
      type: "balance_purchase",
      source: "site",
    };

    // Balansdan darhol yechiamiz
    const patchUser = (u: User): User => {
      if (u.nick.toLowerCase() !== player.toLowerCase()) return u;
      return { ...u, balance: (u.balance || 0) - price };
    };
    setUsers((usrs) => usrs.map(patchUser));
    if (currentUser && currentUser.nick.toLowerCase() === player.toLowerCase()) {
      setCurrentUser((prev) => (prev ? patchUser(prev) : prev));
    }

    setTxs((prev) => [newTx, ...prev]);
    return { success: true, msg: "Bajarilmoqda — admin tasdiqlaganidan keyin faollashadi.", tx: newTx };
  };

  // Balansni to'ldirish so'rovi
  const addTopupRequest = async (player: string, amount: number, receiptImage?: string): Promise<Transaction> => {
    const newTx: Transaction = {
      id: String(Date.now()),
      player,
      pkg: `Balans to'ldirish (${amount.toLocaleString()} so'm)`,
      price: amount,
      time: "Balans to'ldirish",
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      method: "Payme",
      status: "Kutilmoqda",
      type: "topup",
      source: "site",
      receiptImage,
    };
    setTxs((prev) => [newTx, ...prev]);

    // Try to send the top-up request to bot API
    try {
      let botApiUrl = "";
      try {
        const siteConfigRaw = localStorage.getItem("ragesmp_site_config");
        if (siteConfigRaw) {
          const siteConfig = JSON.parse(siteConfigRaw);
          botApiUrl = siteConfig.links?.botApiUrl || "";
        }
      } catch {}

      if (botApiUrl) {
        const baseUrl = botApiUrl.replace(/\/api\/orders.*$/, "");
        const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
        
        await fetch(`${baseUrl}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            player,
            pkg: `Balans to'ldirish (${amount.toLocaleString()} so'm)`,
            price: amount,
            method: "Payme",
            receiptImage,
            telegramId: tgUser?.id,
            telegramUsername: tgUser?.username ? `@${tgUser.username}` : tgUser?.first_name
          })
        });
      }
    } catch (err) {
      console.error("Failed to send topup to bot:", err);
    }

    return newTx;
  };

  // Admin: foydalanuvchi balansini qo'lda boshqarish
  const adjustUserBalance = (nick: string, delta: number, reason: string = "Admin tomonidan o'zgartirildi") => {
    const notif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      text: delta > 0
        ? `💰 Balansingizga +${delta.toLocaleString()} so'm qo'shildi. ${reason}`
        : delta < 0
        ? `📉 Balansingizdan ${Math.abs(delta).toLocaleString()} so'm yechildi. ${reason}`
        : `🔄 Balansingiz 0 ga tushirildi. ${reason}`,
      time: nowLabel(),
      read: false,
    };

    const patchUser = (u: User): User => {
      if (u.nick.toLowerCase() !== nick.toLowerCase()) return u;
      const newBal = Math.max(0, (u.balance || 0) + delta);
      return { ...u, balance: newBal, notifications: [notif, ...u.notifications] };
    };
    setUsers((usrs) => usrs.map(patchUser));
    if (currentUser && currentUser.nick.toLowerCase() === nick.toLowerCase()) {
      setCurrentUser((prev) => (prev ? patchUser(prev) : prev));
    }
  };

  const setUserBalance = (nick: string, balance: number) => {
    const notif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      text: `🔄 Balansingiz ${balance.toLocaleString()} so'm ga o'rnatildi (admin tomonidan).`,
      time: nowLabel(),
      read: false,
    };
    const patchUser = (u: User): User => {
      if (u.nick.toLowerCase() !== nick.toLowerCase()) return u;
      return { ...u, balance: Math.max(0, balance), notifications: [notif, ...u.notifications] };
    };
    setUsers((usrs) => usrs.map(patchUser));
    if (currentUser && currentUser.nick.toLowerCase() === nick.toLowerCase()) {
      setCurrentUser((prev) => (prev ? patchUser(prev) : prev));
    }
  };

  const markNotificationsAsRead = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, notifications: currentUser.notifications.map(n => ({ ...n, read: true })) };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.nick === currentUser.nick ? updated : u));
  };

  const deleteTx = (id: string) => {
    setTxs((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, previousStatus: t.status, deletedAt: new Date().toISOString(), deletedAtLabel: nowLabel() }
          : t
      )
    );
  };

  const restoreTx = (id: string) => {
    setTxs((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const { deletedAt, deletedAtLabel, previousStatus, ...rest } = t;
        void deletedAt;
        void deletedAtLabel;
        return { ...rest, status: previousStatus || t.status };
      })
    );
  };

  const permanentDeleteTx = (id: string) => {
    setTxs((prev) => prev.filter((t) => t.id !== id));
  };

  const updateUserRank = (nick: string, rank: string) => {
    setUsers((prev) => prev.map((u) => (u.nick.toLowerCase() === nick.toLowerCase() ? { ...u, rank } : u)));
    if (currentUser && currentUser.nick.toLowerCase() === nick.toLowerCase()) {
      setCurrentUser((prev) => prev ? ({ ...prev, rank }) : null);
    }
  };

  const deleteUser = (nick: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.nick.toLowerCase() === nick.toLowerCase()
          ? { ...u, deletedAt: new Date().toISOString(), deletedAtLabel: nowLabel() }
          : u
      )
    );
  };

  const restoreUser = (nick: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.nick.toLowerCase() !== nick.toLowerCase()) return u;
        const { deletedAt, deletedAtLabel, ...rest } = u;
        void deletedAt;
        void deletedAtLabel;
        return rest;
      })
    );
  };

  const permanentDeleteUser = (nick: string) => {
    setUsers((prev) => prev.filter((u) => u.nick.toLowerCase() !== nick.toLowerCase()));
  };

  const addMediaRequest = (player: string, screenshots: string[], telegramUsername: string): MediaRequest => {
    const newReq: MediaRequest = {
      id: String(Date.now()),
      player,
      screenshots,
      telegramUsername,
      status: "Kutilmoqda",
      date: new Date().toLocaleString("uz-UZ"),
      time: "Hozirgi so'rov",
    };
    console.log("Adding media request:", newReq);
    setMediaRequests((prev) => {
      const updated = [newReq, ...prev];
      console.log("Updated media requests:", updated);
      return updated;
    });
    return newReq;
  };

  const updateMediaRequestStatus = (id: string, status: MediaRequest["status"]) => {
    const target = mediaRequests.find((r) => r.id === id);
    if (!target) return;

    setMediaRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

    // Add notification to user
    if (target.player) {
      const newNotif: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        text: status === "Tasdiqlangan"
          ? "🎉 Tabriklaymiz! Siz endi RageSMP serverida Media siz! Media rank faollashtirildi!"
          : "❌ Media rank so'rovingiz bekor qilindi. Iltimos, admin bilan bog'laning.",
        time: nowLabel(),
        read: false,
      };

      const patchUser = (u: User): User => {
        if (u.nick.toLowerCase() !== target.player.toLowerCase()) return u;
        let updated: User = { ...u, notifications: [newNotif, ...u.notifications] };
        if (status === "Tasdiqlangan") {
          updated.rank = "Media";
        }
        return updated;
      };

      setUsers((usrs) => usrs.map(patchUser));
      if (currentUser && currentUser.nick.toLowerCase() === target.player.toLowerCase()) {
        setCurrentUser((prev) => (prev ? patchUser(prev) : prev));
      }
    }
  };

  const activeUsers = users.filter((u) => !u.deletedAt);
  const userTrash = users.filter((u) => u.deletedAt);
  const activeTxs = txs.filter((t) => !t.deletedAt);
  const txTrash = txs.filter((t) => t.deletedAt);

  return {
    users: activeUsers,
    txs: activeTxs,
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
  };
}
