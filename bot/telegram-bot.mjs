import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOKEN = process.env.BOT_TOKEN || "8344846056:AAGYdpzJKbT452VbDre6iksZGC9rzlHmZZ8";
const CHANNEL = "@RageSMPuz"; // Kanal manzili har doim shu bo'ladi
const CHANNEL_URL = "https://t.me/RageSMPuz";
const ADMIN_IDS = [5813733221, 6423987123]; // vebuca va vebuca1 uchun (vebuca1 ID sini o'zingiz kiritasiz)
const PAYMENT_CARD = "9860 1201 6372 1422";
const PAYMENT_OWNER = "ASILBEK BURHONOV";
const PAYMENT_TYPE = "HUMO";
const SUPPORT_CHAT_ID = "-1003826327346";
const RECEIPT_CHAT_ID = "-1003848105340";
const WEBAPP_URL = "https://ragesmpbot.vercel.app/"; // Siz taqdim etgan Vercel havolasi

if (!TOKEN) {
  console.error("BOT_TOKEN topilmadi. Ishga tushirish: BOT_TOKEN=123:ABC node bot/telegram-bot.mjs");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, "storage.json");
const BOT_IMAGE_PATH = path.join(__dirname, "..", "public", "logo.png");

const ABOUT_TEXT = `🤖 <b>RageSMP Bot haqida</b>

Bu — rasmiy RageSMP Telegram boti bo‘lib, server xizmatlaridan tez, qulay va avtomatik tarzda foydalanish imkonini beradi.

🛒 <b>Bot orqali quyidagilarni xarid qilishingiz mumkin:</b>
🎖️ Donat ranklar
🪙 Point va Shardslar
🎁 Omadli Donat Case’lar
🔓 Unban — bloklangan akkauntni tiklash
🔈 Unmute — chatdan chetlatilgan akkauntni qayta ochish
💳 Balansni to‘ldirish va hisobni tekshirish

⚡ Barcha xaridlar avtomatik tarzda ishlaydi — xizmatni tanlang, to‘lovni amalga oshiring va bir necha soniyada qabul qilib oling!

🎮 <b>RageSMP haqida:</b>
— O‘zbekistondagi yirik Minecraft SMP serverlaridan biri
— 24/7 faol server, barqaror ping va kuchli anti-cheat
— O‘zbek tilida tezkor texnik yordam

🧾 Xaridlaringiz tarixini ko‘rish uchun: 📊 Tarix bo‘limidan foydalaning.

❓ Savollar yoki muammo bo‘lsa: @RageSMP_Admin ga murojaat qiling.

👇 Davom etish uchun menyudan kerakli bo‘limni tanlang!`;

const defaultConfig = {
  points: { basePerThousandUZS: 1500, discountPerTenThousandUZS: 0 },
  shards: { basePerThousandUZS: 1000, discountPerTenThousandUZS: 0 },
  ranks: [
    { id: "ragepro", name: "RagePro", priceUZS: 10000 },
    { id: "rageplus", name: "Rage+", priceUZS: 30000, tag: "MASHHUR" },
    { id: "elite", name: "SMP Elite", priceUZS: 50000, tag: "VIP" },
  ],
  cases: [
    { id: "ordinary", name: "Oddiy keys", priceUZS: 5000 },
    { id: "prime", name: "Prime keys", priceUZS: 10000 },
    { id: "crimson", name: "Crimson keys", priceUZS: 15000 },
    { id: "gold", name: "Oltin keys", priceUZS: 20000 },
    { id: "amethyst", name: "Ametist keys", priceUZS: 30000 },
  ],
  services: [
    { id: "unban", name: "Unban", priceUZS: 15000 },
    { id: "unmute", name: "Unmute", priceUZS: 5000 },
  ],
  moderation: {
    blockStickers: true,
    blockEmoji: true,
    floodProtection: true,
    floodLimit: 3,
    floodWindowMs: 7000,
  },
};

function initialStore() {
  return { config: defaultConfig, users: {}, sessions: {}, admins: {}, orders: [], supportMap: {}, receiptMap: {} };
}

function normalizeStore(data) {
  return {
    ...initialStore(),
    ...data,
    config: {
      ...defaultConfig,
      ...(data.config || {}),
      points: { ...defaultConfig.points, ...(data.config?.points || {}) },
      shards: { ...defaultConfig.shards, ...(data.config?.shards || {}) },
      moderation: {
        ...defaultConfig.moderation,
        ...(data.config?.moderation || {}),
        floodLimit: data.config?.moderation?.floodLimit === 5 ? 3 : (data.config?.moderation?.floodLimit || 3),
      },
    },
  };
}

function loadStore() {
  try {
    if (!fs.existsSync(STORE_PATH)) return initialStore();
    return normalizeStore(JSON.parse(fs.readFileSync(STORE_PATH, "utf8")));
  } catch {
    return initialStore();
  }
}

function saveStore(store) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

let store = loadStore();
const floodMemory = new Map();
const warningMemory = new Map();

function formatNumber(value) {
  return Math.round(Number(value) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function money(valueUZS) {
  if (typeof valueUZS === "string" && (valueUZS.includes("so'm") || valueUZS.includes("sum"))) return valueUZS;
  return `${formatNumber(valueUZS)} so'm`;
}

function calculate(amount, basePerThousandUZS, discountPerTenThousandUZS) {
  const normalized = Math.min(1000000, Math.max(1000, Number(amount) || 1000));
  const base = (normalized / 1000) * basePerThousandUZS;
  const discount = Math.floor(normalized / 10000) * discountPerTenThousandUZS;
  return { amount: normalized, base, discount, total: Math.max(0, base - discount) };
}

async function api(method, payload = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      const response = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!data.ok) throw new Error(`${method}: ${data.description}`);
      return data.result;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`API retry ${i + 1}/${retries} for ${method}: ${error.message}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function apiForm(method, formData, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for photos
      
      const response = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
        method: "POST",
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!data.ok) throw new Error(`${method}: ${data.description}`);
      return data.result;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`API Form retry ${i + 1}/${retries} for ${method}: ${error.message}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

function keyboard(rows) {
  return { inline_keyboard: rows };
}

function rememberBotMessage(chatId, message) {
  const key = String(chatId);
  const previousId = store.users[key]?.lastBotMessageId;
  store.users[key] = { ...(store.users[key] || {}), lastBotMessageId: message.message_id };
  saveStore(store);
  if (previousId && previousId !== message.message_id) deleteMessage(chatId, previousId);
  return message;
}

async function send(chatId, text, replyMarkup, options = {}) {
  const message = await api("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", reply_markup: replyMarkup });
  if (options.replace === false) return message;
  return rememberBotMessage(chatId, message);
}

async function sendRaw(chatId, text, replyMarkup) {
  return api("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", reply_markup: replyMarkup });
}

async function deleteMessage(chatId, messageId) {
  try {
    await api("deleteMessage", { chat_id: chatId, message_id: messageId });
  } catch {
    // Telegram ayrim xabarlarni o'chirishga ruxsat bermasligi mumkin.
  }
}

async function sendPhoto(chatId, photoFileId, caption, replyMarkup) {
  const message = await api("sendPhoto", { chat_id: chatId, photo: photoFileId, caption, parse_mode: "HTML", reply_markup: replyMarkup });
  return rememberBotMessage(chatId, message);
}

async function sendLocalPhoto(chatId, filePath, caption, replyMarkup) {
  const formData = new FormData();
  formData.append("chat_id", String(chatId));
  formData.append("caption", caption);
  formData.append("parse_mode", "HTML");
  if (replyMarkup) formData.append("reply_markup", JSON.stringify(replyMarkup));
  const file = await fs.promises.readFile(filePath);
  formData.append("photo", new Blob([file], { type: "image/png" }), path.basename(filePath));
  const message = await apiForm("sendPhoto", formData);
  return rememberBotMessage(chatId, message);
}

async function sendPhotoRaw(chatId, photoFileId, caption, replyMarkup) {
  return api("sendPhoto", { chat_id: chatId, photo: photoFileId, caption, parse_mode: "HTML", reply_markup: replyMarkup });
}

async function warn(chatId, userId, text) {
  const key = `${chatId}:${userId}`;
  const now = Date.now();
  if ((warningMemory.get(key) || 0) + 2500 > now) return;
  warningMemory.set(key, now);
  const message = await send(chatId, text, undefined, { replace: false });
  setTimeout(() => deleteMessage(chatId, message.message_id), 4500);
}

function formatDateTime(date = new Date()) {
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function userMention(from) {
  const name = [from.first_name, from.last_name].filter(Boolean).join(" ") || "Noma'lum";
  return from.username ? `@${from.username}` : name;
}

async function answer(callbackQueryId, text = "") {
  return api("answerCallbackQuery", { callback_query_id: callbackQueryId, text, show_alert: Boolean(text) });
}

async function isSubscribed(userId) {
  try {
    const member = await api("getChatMember", { chat_id: CHANNEL, user_id: userId });
    return ["creator", "administrator", "member"].includes(member.status);
  } catch {
    return false;
  }
}

function setSession(userId, session) {
  store.sessions[userId] = session;
  saveStore(store);
}

function menuRows(userId) {
  const rows = [
    [{ text: "📖 Manga O'qish (Mini App)", web_app: { url: WEBAPP_URL } }],
    [{ text: "🎁 Rank sotib olish", callback_data: "menu_ranks" }, { text: "📦 Donate case", callback_data: "menu_cases" }],
    [{ text: "💎 Point sotib olish", callback_data: "menu_points" }, { text: "🔮 Shard sotib olish", callback_data: "menu_shards" }],
    [{ text: "📡 Unmute", callback_data: "buy_services_1" }, { text: "🚫 Unban", callback_data: "buy_services_0" }],
    [{ text: "ℹ️ Bot haqida", callback_data: "about_bot" }, { text: "📜 Tarix", callback_data: "order_history" }],
    [{ text: "👤 Profil", callback_data: "profile" }, { text: "✏️ Nick o'zgartirish", callback_data: "change_nick" }],
    [{ text: "🆘 Support", callback_data: "support" }],
  ];
  if (isAdmin(userId)) rows.push([{ text: "⚙️ Admin panel", callback_data: "admin_panel" }]);
  return rows;
}

function isEmojiOnly(text) {
  const compact = text.replace(/\s/g, "");
  if (!compact) return false;
  return [...compact].every((char) => /\p{Extended_Pictographic}|\p{Emoji_Presentation}/u.test(char) || ["️", "︎", "‍"].includes(char));
}

function isOnlyCustomEmoji(message) {
  const text = message.text?.replace(/\s/g, "") || "";
  const entities = message.entities || [];
  if (!text || !entities.length) return false;
  return entities.every((entity) => entity.type === "custom_emoji");
}

async function shouldDeleteByModeration(message, userId) {
  if (isAdmin(userId)) return null;
  const moderation = store.config.moderation;
  const text = message.text?.trim() || "";

  if (moderation.blockStickers && message.sticker) return "sticker";
  if (moderation.blockEmoji && text && !text.startsWith("/") && (isEmojiOnly(text) || isOnlyCustomEmoji(message))) return "emoji";

  if (!moderation.floodProtection || text.startsWith("/")) return null;
  const now = Date.now();
  const old = floodMemory.get(userId) || [];
  const next = [...old.filter((time) => now - time < moderation.floodWindowMs), now];
  floodMemory.set(userId, next);
  return next.length > moderation.floodLimit ? "flood" : null;
}

function clearSession(userId) {
  delete store.sessions[userId];
  saveStore(store);
}

async function showSubscribe(chatId) {
  await send(
    chatId,
    `🔥 <b>RageSMP botiga xush kelibsiz!</b>\n\nDavom etish uchun bizning rasmiy kanalga obuna bo'lishingiz shart: <b>${CHANNEL}</b>`,
    keyboard([
      [{ text: "📢 Kanalga obuna bo'lish", url: CHANNEL_URL }],
      [{ text: "✅ Tekshirish", callback_data: "check_sub" }],
    ])
  );
}

async function showOffer(chatId) {
  await send(
    chatId,
    "📄 <b>Oferta shartlari</b>\n\nDonat sotib olish orqali siz to'lov qaytarilmasligini, nick noto'g'ri yozilsa admin bilan bog'lanish kerakligini va barcha donatlar server qoidalariga muvofiq berilishini tasdiqlaysiz.",
    keyboard([[{ text: "✅ Roziman", callback_data: "offer_accept" }]])
  );
}

async function showBotIntro(chatId, userId, mode = "offer") {
  const introRows = menuRows(userId);
  // Introda ham Mini App tugmasini birinchi qatorga qo'shamiz
  const replyMarkup = mode === "offer" ? keyboard([[{ text: "Davom etish", callback_data: "intro_continue" }]]) : keyboard(introRows);
  if (fs.existsSync(BOT_IMAGE_PATH)) {
    await sendLocalPhoto(chatId, BOT_IMAGE_PATH, ABOUT_TEXT, replyMarkup);
    return;
  }
  await send(chatId, ABOUT_TEXT, replyMarkup);
}

async function askNick(chatId, userId) {
  if (store.users[userId]?.nick) return showMainMenu(chatId, userId);
  setSession(userId, { step: "await_nick" });
  await send(chatId, "🎮 Minecraftdagi nick name'ingizni yozing:");
}

async function changeNick(chatId, userId) {
  setSession(userId, { step: "await_nick" });
  await send(chatId, "🎮 Yangi Minecraft nick name'ingizni yozing:");
}

async function showMainMenu(chatId, userId) {
  const user = store.users[userId];
  await send(
    chatId,
    `🔥 <b>RageSMP Premium Bot</b>\n━━━━━━━━━━━━━━━━━━━━\n\n👤 O'yinchi: <b>${user?.nick || "kiritilmagan"}</b>\n🌐 Server: <b>ragesmp.uz</b>\n🎟️ Promo: <code>/promo vebuca</code>\n\nKerakli bo'limni tanlang:`,
    keyboard(menuRows(userId))
  );
}

async function showCurrencyMenu(chatId, userId, kind) {
  const cfg = kind === "points" ? store.config.points : store.config.shards;
  const base = cfg.basePerThousandUZS;
  const discount = cfg.discountPerTenThousandUZS;
  setSession(userId, { step: "await_amount", kind });
  await send(
    chatId,
    `${kind === "points" ? "💎 <b>Point sotib olish</b>" : "🔮 <b>Shard sotib olish</b>"}\n━━━━━━━━━━━━━━━━━━━━\n\n1.000 tasi: <b>${money(base)}</b>\nHar 10.000 uchun skidka: <b>${money(discount)}</b>\n\nMiqdorni yozing.\nEng kami: <b>1.000</b>\nEng ko'pi: <b>1.000.000</b>\n\nMasalan: <code>25000</code>`,
    keyboard([[{ text: "⬅️ Ortga", callback_data: "main_menu" }]])
  );
}

async function showList(chatId, type) {
  const title = type === "ranks" ? "👑 Ranklar" : type === "cases" ? "🔑 Donate caselar" : "🔓 Xizmatlar";
  const items = store.config[type];
  await send(
    chatId,
    `<b>${title}</b>\nKerakli donatni tanlang:`,
    keyboard([
      ...items.map((item, index) => [{ text: `${item.name} - ${money(item.priceUZS)}`, callback_data: `buy_${type}_${index}` }]),
      [{ text: "⬅️ Ortga", callback_data: "main_menu" }],
    ])
  );
}

async function showOrder(chatId, userId, item) {
  setSession(userId, { step: "pending_order", item });
  const text = `📦 <b>BUYURTMA TAFSILOTLARI</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
    `👤 O'yinchi: <b>${store.users[userId]?.nick}</b>\n` +
    `🛒 Xarid: <b>${item.name}</b>\n` +
    `💎 Miqdor: <b>${item.amountLabel || "1 dona"}</b>\n` +
    `💰 To'lov summasi: <b>${money(item.priceUZS)}</b>\n\n` +
    `💳 <b>TO'LOV MA'LUMOTLARI:</b>\n` +
    ` ├ Karta: <code>${PAYMENT_CARD}</code>\n` +
    ` ├ Turi: <b>${PAYMENT_TYPE}</b>\n` +
    ` └ Egasi: <b>${PAYMENT_OWNER}</b>\n\n` +
    `⚡ <i>To'lovni amalga oshirgach, pastdagi tugmani bosing va chek rasmini yuboring.</i>`;

  await send(
    chatId,
    text,
    keyboard([
      [{ text: `✅ TO'LOV QILDIM (${money(item.priceUZS)})`, callback_data: "confirm_order" }],
      [{ text: "⬅️ ORQAGA", callback_data: "main_menu" }]
    ])
  );
}

async function confirmOrder(chatId, userId) {
  const item = store.sessions[userId]?.item;
  if (!item) return showMainMenu(chatId, userId);
  const order = { id: Date.now(), userId, nick: store.users[userId]?.nick, item, createdAt: new Date().toISOString(), status: "new" };
  store.orders.unshift(order);
  setSession(userId, { step: "await_receipt", orderId: order.id });
  saveStore(store);
  
  const text = `🔄 <b>TO'LOVNI TASDIQLASH</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
    `🆔 Buyurtma ID: <code>#${order.id}</code>\n` +
    `🛒 Xarid: <b>${item.name}</b>\n` +
    `💰 Summa: <b>${money(item.priceUZS)}</b>\n\n` +
    `📸 <b>Iltimos, to'lov cheki (rasm) ni yuboring.</b>\n` +
    `<i>Adminlar chekni tekshirib, xaridni faollashtirib berishadi.</i>`;

  await send(chatId, text);
}

async function showAdminLogin(chatId, userId) {
  if (isAdmin(userId)) return showAdminPanel(chatId);
  await send(chatId, "⛔ Siz admin emassiz.");
}

function isAdmin(userId) {
  const user = store.users[userId];
  if (!user) return false;
  return user.role === "admin" || ADMIN_IDS.includes(Number(userId)) || user.nick === "vebuca" || user.nick === "vebuca1";
}

async function showAdminPanel(chatId) {
  const moderation = store.config.moderation;
  const pendingOrders = store.orders.filter(o => o.status === "new" || o.status === "paid_waiting_admin").length;
  
  // Vercel Admin Panel uchun ma'lumotlarni base64 qilamiz (faqat oxirgi 20 ta buyurtma va userlar)
  const syncData = Buffer.from(JSON.stringify({
    txs: store.orders.slice(0, 20),
    users: Object.entries(store.users).map(([id, u]) => ({ ...u, id }))
  })).toString("base64");
  const syncUrl = `${WEBAPP_URL}?admin_sync=${syncData}`;

  const text = `⚙️ <b>ADMIN PANEL</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📊 <b>Statistika:</b>\n` +
    ` └ 📦 Buyurtmalar: <b>${store.orders.length} ta</b>\n` +
    ` └ ⏳ Kutilmoqda: <b>${pendingOrders} ta</b>\n\n` +
    `🛡️ <b>Moderatsiya:</b>\n` +
    ` └ Sticker: ${moderation.blockStickers ? "✅" : "❌"}\n` +
    ` └ Emoji: ${moderation.blockEmoji ? "✅" : "❌"}\n` +
    ` └ Flood: ${moderation.floodProtection ? "✅" : "❌"}\n\n` +
    `🌐 <b>Vercel Admin:</b> <a href="${syncUrl}">Saytni yangilash</a>\n\n` +
    `Tanlang:`;

  await send(
    chatId,
    text,
    keyboard([
      [{ text: `🔔 Yangi buyurtmalar (${pendingOrders})`, callback_data: "admin_orders_pending" }],
      [{ text: "💎 Pointlar", callback_data: "admin_points" }, { text: "🔮 Shardlar", callback_data: "admin_shards" }],
      [{ text: "👑 Ranklar", callback_data: "admin_ranks" }, { text: "🎁 Keyslar", callback_data: "admin_cases" }],
      [{ text: "🔓 Xizmatlar", callback_data: "admin_services" }, { text: "📋 Hammasi", callback_data: "admin_orders_all" }],
      [{ text: "🛡️ Moderatsiya sozlamalari", callback_data: "admin_moderation" }],
      [{ text: "⬅️ Asosiy menyu", callback_data: "main_menu" }],
    ])
  );
}

async function showAdminItems(chatId, userId, type) {
  if (type === "moderation") {
    const moderation = store.config.moderation;
    await send(
      chatId,
      `🛡️ <b>Moderatsiya sozlamalari</b>\n\nSticker: <b>${moderation.blockStickers ? "ON" : "OFF"}</b>\nEmoji: <b>${moderation.blockEmoji ? "ON" : "OFF"}</b>\nFlood: <b>${moderation.floodProtection ? "ON" : "OFF"}</b>\nFlood limit: <b>${moderation.floodLimit} xabar / ${Math.round(moderation.floodWindowMs / 1000)} soniya</b>`,
      keyboard([
        [{ text: `Sticker ${moderation.blockStickers ? "OFF" : "ON"}`, callback_data: "admin_toggle_blockStickers" }],
        [{ text: `Emoji ${moderation.blockEmoji ? "OFF" : "ON"}`, callback_data: "admin_toggle_blockEmoji" }],
        [{ text: `Flood ${moderation.floodProtection ? "OFF" : "ON"}`, callback_data: "admin_toggle_floodProtection" }],
        [{ text: `Flood limit: ${moderation.floodLimit}`, callback_data: "admin_edit_moderation_floodLimit" }],
        [{ text: "⬅️ Admin panel", callback_data: "admin_panel" }],
      ])
    );
    return;
  }
  if (type === "points" || type === "shards") {
    await send(
      chatId,
      `<b>${type}</b> sozlamalari`,
      keyboard([
        [{ text: `1.000 narxi: ${money(store.config[type].basePerThousandUZS)}`, callback_data: `admin_edit_${type}_base` }],
        [{ text: `10.000 skidka: ${money(store.config[type].discountPerTenThousandUZS)}`, callback_data: `admin_edit_${type}_discount` }],
        [{ text: "⬅️ Admin panel", callback_data: "admin_panel" }],
      ])
    );
    return;
  }
  await send(
    chatId,
    `<b>${type}</b> ro'yxati. O'zgartirish uchun itemni tanlang:`,
    keyboard([
      ...store.config[type].map((item, index) => [{ text: `${item.name} - ${money(item.priceUZS)}`, callback_data: `admin_edit_${type}_${index}` }]),
      [{ text: "⬅️ Admin panel", callback_data: "admin_panel" }],
    ])
  );
}

async function promptAdminEdit(chatId, userId, type, key) {
  setSession(userId, { step: "admin_edit", type, key });
  await send(chatId, type === "moderation" ? "Yangi flood limitni raqam bilan yuboring. Masalan: <code>3</code>" : "Yangi narxni UZS da raqam bilan yuboring. Masalan: <code>15000</code>");
}

async function showOrders(chatId, filter = "all") {
  let list = store.orders;
  if (filter === "pending") {
    list = list.filter(o => o.status === "new" || o.status === "paid_waiting_admin");
  }
  list = list.slice(0, 10);

  if (!list.length) {
    return send(chatId, `📭 ${filter === "pending" ? "Yangi" : "Hech qanday"} buyurtmalar topilmadi.`, keyboard([[{ text: "⬅️ Admin panel", callback_data: "admin_panel" }]]));
  }

  for (const order of list) {
    const statusText = order.status === "approved" ? "✅ Tasdiqlangan" : order.status === "rejected" ? "❌ Bekor qilingan" : "⏳ Kutilmoqda";
    const msg = `📦 <b>Buyurtma #${order.id}</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
      `👤 Nick: <b>${escapeHtml(order.nick)}</b>\n` +
      `🛒 Xarid: <b>${escapeHtml(order.item.name)}</b>\n` +
      `💰 Summa: <b>${money(order.item.priceUZS)}</b>\n` +
      `📅 Sana: <i>${formatDateTime(new Date(order.createdAt))}</i>\n` +
      `📊 Status: <b>${statusText}</b>`;

    const buttons = [];
    if (order.status === "new" || order.status === "paid_waiting_admin") {
      buttons.push([{ text: "✅ Tasdiqlash", callback_data: `receipt_accept_${order.id}` }, { text: "❌ Bekor qilish", callback_data: `receipt_reject_${order.id}` }]);
    }

    if (order.receiptFileId) {
      await sendPhotoRaw(chatId, order.receiptFileId, msg, keyboard(buttons));
    } else {
      await sendRaw(chatId, msg, keyboard(buttons));
    }
  }

  await send(chatId, "👆 Yuqoridagilar oxirgi 10 ta buyurtma.", keyboard([[{ text: "⬅️ Admin panel", callback_data: "admin_panel" }]]));
}

async function showUserHistory(chatId, userId) {
  const list = store.orders.filter((order) => String(order.userId) === String(userId)).slice(0, 10);
  if (!list.length) return send(chatId, "📜 Sizda hali buyurtmalar yo'q.", keyboard([[{ text: "⬅️ Orqaga", callback_data: "main_menu" }]]));
  await send(
    chatId,
    `📜 <b>Tarix</b>\n\n${list.map((order) => `#${order.id}\n${order.item.name} - ${money(order.item.priceUZS)}\nStatus: ${order.status}`).join("\n\n")}`,
    keyboard([[{ text: "⬅️ Orqaga", callback_data: "main_menu" }]])
  );
}

async function askSupportQuestion(chatId, userId) {
  setSession(userId, { step: "await_support" });
  await send(chatId, "🆘 Adminga yozmoqchi bo'lgan savolingizni yuboring.", keyboard([[{ text: "⬅️ Orqaga", callback_data: "main_menu" }]]));
}

async function forwardSupportQuestion(message, userId) {
  const chatId = message.chat.id;
  const user = store.users[userId] || {};
  const text = escapeHtml(message.text?.trim() || message.caption?.trim() || "(matnsiz xabar)");
  const supportMessage = await sendRaw(
    SUPPORT_CHAT_ID,
    `🆘 <b>Yangi support murojaat</b>\n━━━━━━━━━━━━━━━━━━━━\n\n📅 Sana: <b>${formatDateTime()}</b>\n👤 Foydalanuvchi: <b>${escapeHtml(userMention(message.from))}</b>\n🆔 User ID: <code>${userId}</code>\n🎮 Nick: <b>${escapeHtml(user.nick || "kiritilmagan")}</b>\n\n💬 <b>Savol:</b>\n${text}\n\nJavob berish uchun shu xabarga reply qiling.`,
  );
  store.supportMap[String(supportMessage.message_id)] = { userId, chatId };
  clearSession(userId);
  saveStore(store);
  await send(chatId, "✅ Savolingiz adminga yuborildi. Admin javobini kuting.");
  return showMainMenu(chatId, userId);
}

async function handleSupportReply(message) {
  if (String(message.chat.id) !== SUPPORT_CHAT_ID) return false;
  const replyId = message.reply_to_message?.message_id;
  if (!replyId) return false;
  const target = store.supportMap[String(replyId)];
  if (!target) return false;
  const answerText = escapeHtml(message.text?.trim() || message.caption?.trim());
  if (!answerText) return false;
  await sendRaw(
    target.chatId,
    `📩 <b>Admin javobi</b>\n━━━━━━━━━━━━━━━━━━━━\n\n${answerText}`,
  );
  await sendRaw(SUPPORT_CHAT_ID, "✅ Javob foydalanuvchiga yuborildi.");
  return true;
}

async function handleReceiptDecision(chatId, userId, data, message) {
  if (!isAdmin(userId)) return send(chatId, "⛔ Siz admin emassiz.");
  const parts = data.split("_");
  const action = parts[1];
  const orderId = parts.slice(2).join("_"); 

  let order = store.orders.find((item) => String(item.id) === String(orderId));
  const approved = action === "accept";
  
  if (!order) {
    const caption = message?.caption || "";
    const tgIdMatch = caption.match(/Telegram ID:\s*(\d+)/i) || caption.match(/ID:\s*(\d+)/i) || caption.match(/User ID:\s*(\d+)/i);
    const itemMatch = caption.match(/Xarid:\s*(.+)/i);
    const priceMatch = caption.match(/Summa:\s*(.+)/i) || caption.match(/To'lov summasi:\s*(.+)/i);

    if (tgIdMatch) {
      order = {
        userId: tgIdMatch[1],
        item: { 
          name: itemMatch ? itemMatch[1].split("\n")[0].trim() : "Noma'lum xarid", 
          priceUZS: priceMatch ? priceMatch[1].split("\n")[0].trim() : "0" 
        },
        id: orderId,
        nick: caption.match(/Nick:\s*(.+)/i)?.[1].split("\n")[0].trim() || "Noma'lum",
        createdAt: new Date().toISOString(),
        status: "new"
      };
      store.orders.unshift(order);
      saveStore(store);
    }
  }

  if (!order) return send(chatId, "❌ Buyurtma topilmadi.");
  
  if (order.status === "approved" || order.status === "rejected") {
    return send(chatId, "⚠️ Bu buyurtma allaqachon tekshirilgan.");
  }

  order.status = approved ? "approved" : "rejected";
  saveStore(store);

  // Sync with Web App for ALL admins
  for (const adminId of ADMIN_IDS) {
    await setMenuButton(adminId, adminId).catch(() => {});
  }

  if (approved) {
    const successMsg = `✅🎉 <b>TABRIKLAYMIZ!</b>\n\n` +
      `🎮 Sizning <b>${escapeHtml(order.item.name)}</b> xaridingiz tasdiqlandi.\n` +
      `💰 Summa: <b>${money(order.item.priceUZS)}</b>\n\n` +
      `🚀 Endi o'yinga kirishingiz mumkin. RageSMP bilan maroqli hordiq chiqaring!`;
    
    await sendRaw(order.userId, successMsg);
    return send(chatId, `✅ <b>#${orderId}</b> buyurtma tasdiqlandi va foydalanuvchiga xabar yuborildi.`);
  }

  const rejectMsg = `❌ <b>TO'LOVINGIZ RAD ETILDI</b>\n\n` +
    `Iltimos, to'lov chekini qaytadan tekshirib yuboring yoki admin bilan bog'laning.\n\n` +
    `🛒 Xarid: <b>${escapeHtml(order.item.name)}</b>`;
    
  await sendRaw(order.userId, rejectMsg);
  return send(chatId, `❌ <b>#${orderId}</b> buyurtma bekor qilindi.`);
}

async function setMenuButton(chatId, userId) {
  try {
    let url = WEBAPP_URL;
    
    // Adminlar uchun ma'lumotlarni sinxronizatsiya qilamiz
    if (isAdmin(userId)) {
      const syncDataObj = {
        txs: store.orders.slice(0, 100), // Oxirgi 100 ta buyurtma
        users: Object.entries(store.users).map(([id, u]) => ({ ...u, id }))
      };
      const syncData = Buffer.from(JSON.stringify(syncDataObj)).toString("base64");
      url += `?admin_sync=${syncData}`;
    }

    await api("setChatMenuButton", {
      chat_id: chatId,
      menu_button: {
        type: "web_app",
        text: "Ochish 📖",
        web_app: { url: url }
      }
    });
    console.log(`Menu button updated for ${chatId} (Admin: ${isAdmin(userId)})`);
  } catch (e) {
    console.error("Menu button o'rnatishda xato:", e.message);
  }
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const userId = String(message.from.id);
  const text = message.text?.trim() || "";
  const session = store.sessions[userId];

  if (await handleSupportReply(message)) return;

  const moderationReason = await shouldDeleteByModeration(message, userId);
  if (moderationReason) {
    await deleteMessage(chatId, message.message_id);
    const warningText =
      moderationReason === "flood"
        ? "⚠️ Flood qilmang. 3 tadan ko'p tez-tez xabar yuborish taqiqlanadi."
        : moderationReason === "sticker"
          ? "⚠️ Sticker yuborish taqiqlangan."
          : "⚠️ Faqat emoji yuborish taqiqlangan.";
    await warn(chatId, userId, warningText);
    return;
  }

  if (text === "/start") {
    await setMenuButton(chatId, userId);
    if (await isSubscribed(message.from.id)) return showBotIntro(chatId, userId, "offer");
    return showSubscribe(chatId);
  }

  if (text === "/admin") return showAdminLogin(chatId, userId);
  if (text === "/menu") return showMainMenu(chatId, userId);

  if (session?.step === "await_support") {
    return forwardSupportQuestion(message, userId);
  }

  if (session?.step === "await_receipt") {
    const photo = message.photo?.at(-1);
    if (!photo) return send(chatId, "Iltimos, to'lov cheki rasmini yuboring.");
    const order = store.orders.find((item) => item.id === session.orderId);
    if (order) {
      order.status = "paid_waiting_admin";
      order.receiptFileId = photo.file_id;
      const receiptMessage = await sendPhotoRaw(
        RECEIPT_CHAT_ID,
        photo.file_id,
        `🧾 <b>Yangi chek</b>\n━━━━━━━━━━━━━━━━━━━━\n\n🆔 Buyurtma: <code>#${order.id}</code>\n📅 Sana: <b>${formatDateTime()}</b>\n👤 Foydalanuvchi: <b>${escapeHtml(userMention(message.from))}</b>\n🆔 User ID: <code>${userId}</code>\n🎮 Nick: <b>${escapeHtml(order.nick || "kiritilmagan")}</b>\n\n🛒 Xarid: <b>${escapeHtml(order.item.name)}</b>\n💰 To'lov summasi: <b>${money(order.item.priceUZS)}</b>\n💳 Karta: <code>${PAYMENT_CARD}</code> (${PAYMENT_TYPE})\n👤 Karta egasi: <b>${PAYMENT_OWNER}</b>\n\nQuyidan tasdiqlang yoki bekor qiling:`,
        keyboard([[{ text: "✅ Tasdiqlash", callback_data: `receipt_accept_${order.id}` }, { text: "❌ Bekor qilish", callback_data: `receipt_reject_${order.id}` }]])
      );
      store.receiptMap[String(receiptMessage.message_id)] = { orderId: order.id, userId, chatId };
      saveStore(store);
    }
    clearSession(userId);
    await send(chatId, "✅ Chek qabul qilindi. Adminlar tekshirganidan keyin sizga xabar yuboriladi.");
    return showMainMenu(chatId, userId);
  }

  if (session?.step === "await_nick") {
    store.users[userId] = { ...(store.users[userId] || {}), nick: text, agreed: true };
    clearSession(userId);
    saveStore(store);
    await send(chatId, `✅ Nick saqlandi: <b>${text}</b>`);
    return showMainMenu(chatId, userId);
  }

  if (session?.step === "await_amount") {
    const amount = Number(text.replace(/\D/g, ""));
    if (!amount) return send(chatId, "Miqdorni raqam bilan yozing. Masalan: <code>25000</code>");
    if (amount < 1000 || amount > 1000000) return send(chatId, "Miqdor 1.000 dan 1.000.000 gacha bo'lishi kerak.");
    const cfg = store.config[session.kind];
    const result = calculate(amount, cfg.basePerThousandUZS, cfg.discountPerTenThousandUZS);
    clearSession(userId);
    return showOrder(chatId, userId, {
      name: `${formatNumber(result.amount)} ${session.kind === "points" ? "Point" : "Shards"}`,
      amountLabel: `${formatNumber(result.amount)} ta`,
      priceUZS: result.total,
    });
  }

  if (session?.step === "admin_login") {
    clearSession(userId);
    return showAdminLogin(chatId, userId);
  }

  if (session?.step === "admin_edit") {
    const value = Number(text.replace(/\D/g, ""));
    if (!value) return send(chatId, "Faqat raqam yuboring. Masalan: 15000");
    const { type, key } = session;
    if (type === "points" || type === "shards") {
      if (key === "base") store.config[type].basePerThousandUZS = value;
      if (key === "discount") store.config[type].discountPerTenThousandUZS = value;
    } else if (type === "moderation") {
      if (key === "floodLimit") store.config.moderation.floodLimit = Math.max(1, Math.min(20, value));
    } else {
      store.config[type][Number(key)].priceUZS = value;
    }
    clearSession(userId);
    saveStore(store);
    await send(chatId, type === "moderation" ? `✅ Flood limit yangilandi: ${store.config.moderation.floodLimit}` : `✅ Narx yangilandi: ${money(value)}`);
    return showAdminPanel(chatId);
  }

  return send(chatId, "Menyuni ochish uchun /menu yoki qayta boshlash uchun /start yuboring.");
}

async function handleCallback(query) {
  const chatId = query.message.chat.id;
  const userId = String(query.from.id);
  const data = query.data;
  await answer(query.id);

  if (data === "check_sub") {
    if (await isSubscribed(query.from.id)) return showBotIntro(chatId, userId, "offer");
    return showSubscribe(chatId);
  }
  if (data === "intro_continue") {
    const user = store.users[userId];
    if (user?.agreed && user?.nick) return showMainMenu(chatId, userId);
    return showOffer(chatId);
  }
  if (data === "offer_accept") return askNick(chatId, userId);
  if (data === "main_menu") return showMainMenu(chatId, userId);
  if (data === "menu_points") return showCurrencyMenu(chatId, userId, "points");
  if (data === "menu_shards") return showCurrencyMenu(chatId, userId, "shards");
  if (data === "menu_ranks") return showList(chatId, "ranks");
  if (data === "menu_cases") return showList(chatId, "cases");
  if (data === "menu_services") return showList(chatId, "services");
  if (data === "confirm_order") return confirmOrder(chatId, userId);
  if (data === "about_bot") return showBotIntro(chatId, userId, "menu");
  if (data === "support") return askSupportQuestion(chatId, userId);
  if (data === "profile") return send(chatId, `👤 <b>Profil</b>\nNick: <b>${store.users[userId]?.nick || "kiritilmagan"}</b>\nUser ID: <code>${userId}</code>`, keyboard([[{ text: "✏️ Nick o'zgartirish", callback_data: "change_nick" }], [{ text: "⬅️ Orqaga", callback_data: "main_menu" }]]));
  if (data === "change_nick") return changeNick(chatId, userId);
  if (data === "order_history") return showUserHistory(chatId, userId);
  if (data.startsWith("receipt_accept_") || data.startsWith("receipt_reject_")) return handleReceiptDecision(chatId, userId, data, query.message);

  if (data.startsWith("buy_points_") || data.startsWith("buy_shards_")) {
    const [, kind, amountRaw] = data.split("_");
    const cfg = store.config[kind];
    const result = calculate(Number(amountRaw), cfg.basePerThousandUZS, cfg.discountPerTenThousandUZS);
    return showOrder(chatId, userId, { name: `${formatNumber(result.amount)} ${kind === "points" ? "Point" : "Shards"}`, priceUZS: result.total });
  }

  if (data.startsWith("buy_")) {
    const [, type, indexRaw] = data.split("_");
    const item = store.config[type][Number(indexRaw)];
    return showOrder(chatId, userId, { name: item.name, priceUZS: item.priceUZS });
  }

  if (data === "admin_panel") {
    if (!isAdmin(userId)) return send(chatId, "⛔ Siz admin emassiz.");
    return showAdminPanel(chatId);
  }
  if (data.startsWith("admin_toggle_")) {
    if (!isAdmin(userId)) return send(chatId, "⛔ Siz admin emassiz.");
    const key = data.replace("admin_toggle_", "");
    if (key in store.config.moderation) {
      store.config.moderation[key] = !store.config.moderation[key];
      saveStore(store);
    }
    return showAdminItems(chatId, userId, "moderation");
  }
  if (data === "admin_orders_pending") return isAdmin(userId) ? showOrders(chatId, "pending") : send(chatId, "⛔ Siz admin emassiz.");
  if (data === "admin_orders_all") return isAdmin(userId) ? showOrders(chatId, "all") : send(chatId, "⛔ Siz admin emassiz.");
  if (data === "admin_orders") return isAdmin(userId) ? showOrders(chatId, "all") : send(chatId, "⛔ Siz admin emassiz.");
  if (data.startsWith("admin_") && !data.startsWith("admin_edit_")) {
    if (!isAdmin(userId)) return send(chatId, "⛔ Siz admin emassiz.");
    return showAdminItems(chatId, userId, data.replace("admin_", ""));
  }
  if (data.startsWith("admin_edit_")) {
    if (!isAdmin(userId)) return send(chatId, "⛔ Siz admin emassiz.");
    const [, , type, key] = data.split("_");
    return promptAdminEdit(chatId, userId, type, key);
  }
}

let offset = 0;
console.log("RageSMP Telegram bot ishga tushdi...");

while (true) {
  try {
    const updates = await api("getUpdates", { offset, timeout: 30, allowed_updates: ["message", "channel_post", "callback_query"] });
    for (const update of updates) {
      offset = update.update_id + 1;
      if (update.message) await handleMessage(update.message);
      if (update.channel_post) await handleSupportReply(update.channel_post);
      if (update.callback_query) await handleCallback(update.callback_query);
    }
  } catch (error) {
    console.error(error.message);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}