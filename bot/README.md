# RageSMP Telegram Bot

Bot imkoniyatlari:

- `/start` bosilganda `@RageSMPuz` kanaliga majburiy obuna tekshiradi.
- Oferta shartlariga rozilik oladi.
- Minecraft nick name so'raydi.
- Point, Shards, Unban, Unmute, Donate case va Ranklarni ko'rsatadi.
- Obuna tasdiqlangandan keyin cookie rasmi bilan RageSMP bot haqida ma'lumot yuboradi.
- Narxlar sayt default narxlari bilan bir xil boshlanadi.
- Bot ichida admin panel bor.

Admin panel:

- Admin panel faqat shu Telegram user ID lar uchun ko'rinadi va ochiladi: `1977379033`, `8371570021`.
- Oddiy foydalanuvchilarga admin panel tugmasi ko'rinmaydi.

Ishga tushirish:

```bash
node bot/telegram-bot.mjs
```

Kanal username o'zgarsa:

```bash
REQUIRED_CHANNEL=@RageSMPuz node bot/telegram-bot.mjs
```

Eslatma:

- Bot `bot/storage.json` faylida foydalanuvchilar, buyurtmalar va admin o'zgartirgan narxlarni saqlaydi.
- Majburiy obunani tekshirish ishlashi uchun bot kanalga admin sifatida qo'shilgan bo'lishi kerak.