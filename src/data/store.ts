import { useState, useEffect } from "react";

export type Transaction = {
  id: string;
  player: string;
  pkg: string;
  price: number;
  time: string;
  date: string;
  method: "Click" | "Payme" | "Uzcard" | "Humo";
  status: "To'langan" | "Kutilmoqda" | "Bekor qilingan";
  receiptImage?: string; // Base64 encoded image
  telegramId?: string; // Telegram user ID for notifications
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

export type User = {
  nick: string;
  pass: string;
  role: "admin" | "user";
  regDate: string;
  rank: string;
  spent: number;
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
  { nick: "vebuca", pass: "vebuca101uz", role: "admin", regDate: "2026-01-10", rank: "SMP Elite", spent: 500000, notifications: [] },
  { nick: "ShohruhPro", pass: "pass123", role: "user", regDate: "2026-01-12", rank: "SMP Elite", spent: 250000, notifications: [] },
  { nick: "RageHunter", pass: "pass123", role: "user", regDate: "2026-01-15", rank: "SMP Elite", spent: 190000, notifications: [] },
  { nick: "ToshkentBoy", pass: "pass123", role: "user", regDate: "2026-01-18", rank: "Rage+", spent: 150000, notifications: [] },
  { nick: "AzizbekMC", pass: "pass123", role: "user", regDate: "2026-01-20", rank: "Rage+", spent: 120000, notifications: [] },
  { nick: "NightCraft", pass: "pass123", role: "user", regDate: "2026-01-22", rank: "Rage+", spent: 90000, notifications: [] },
  { nick: "OlimjonUZ", pass: "pass123", role: "user", regDate: "2026-01-25", rank: "RagePro", spent: 10000, notifications: [] },
  { nick: "DonerKing", pass: "pass123", role: "user", regDate: "2026-01-28", rank: "RagePro", spent: 10000, notifications: [] },
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
        const items = parsed.map((u: any) => ({ ...u, notifications: u.notifications || [] }));
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

  const addTransaction = (player: string, pkgName: string, price: number, method: Transaction["method"], receiptImage?: string) => {
    const newTx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      player,
      pkg: pkgName,
      price,
      time: "Hozirgi xarid",
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      method,
      status: "Kutilmoqda",
      receiptImage,
    };
    setTxs([newTx, ...txs]);
  };

  const updateTxStatus = (id: string, status: Transaction["status"]) => {
    setTxs((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          if (status === "To'langan" && t.status !== "To'langan") {
            const newNotif: Notification = {
              id: Math.random().toString(36).substr(2, 9),
              text: `✅ Chekingiz tasdiqlandi! ${t.pkg} ranki berildi.`,
              time: nowLabel(),
              read: false,
            };

            setUsers((usrs) =>
              usrs.map((u) => {
                if (u.nick.toLowerCase() === t.player.toLowerCase()) {
                  return { 
                    ...u, 
                    rank: t.pkg, 
                    spent: u.spent + t.price, 
                    notifications: [newNotif, ...u.notifications]
                  };
                }
                return u;
              })
            );

            if (currentUser && currentUser.nick.toLowerCase() === t.player.toLowerCase()) {
              setCurrentUser((prev) => prev ? ({
                ...prev,
                rank: t.pkg,
                spent: prev.spent + t.price,
                notifications: [newNotif, ...prev.notifications]
              }) : null);
            }
          }
          return { ...t, status };
        }
        return t;
      })
    );
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

  const activeUsers = users.filter((u) => !u.deletedAt);
  const userTrash = users.filter((u) => u.deletedAt);
  const activeTxs = txs.filter((t) => !t.deletedAt);
  const txTrash = txs.filter((t) => t.deletedAt);

  return {
    users: activeUsers,
    txs: activeTxs,
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
  };
}
