# Uzbek Latin Transliteration Frontend (Telegram Mini App)

React 19, TypeScript, Tailwind CSS va Vite asosida yaratilgan zamonaviy Telegram Mini App frontendi. Bu interfeys orqali foydalanuvchilar o'zbek lotin alifbosidagi matnlarni yangi isloh qilingan alifboga tezkor va oson transliteratsiya qilishlari, natijalarni nusxalashlari hamda avvalgi tarjimalar tarixini sahifalar (pagination) orqali ko'rib chiqishlari mumkin.

---

## ✨ Imkoniyatlar

- **Eski $\to$ Yangi alifbo translatsiyasi**: `Sh` $\to$ `Ş`, `Ch` $\to$ `Ç`, `O'` $\to$ `Ō`, `G'` $\to$ `Ğ` harflari konvertatsiyasi.
- **Aqlli tugma nazorati**: Tarjima qilish tugmasi faqat matn kiritilganda va avvalgi yuborilgan matndan farqli bo'lgandagina faollashadi.
- **Telegram WebApp integratsiyasi**: Telegram orqali ochilganda `window.Telegram.WebApp.initData` avtomatik olinib, backend bilan xavfsiz sinxronlashadi.
- **Tarjimalar tarixi**:
  - Matnlar cheklangan balandlikda va ortiqcha qismi ellipsis (`...`) bilan qisqartirilgan holda ko'rsatiladi.
  - Moslashuvchan sahifalash (Pagination) va sahifa o'lchamini tanlash (5, 10, 20, 50).
  - Har qanday tarix elementiga bosilganda asl va tarjima qilingan matn darhol tarjima bo'limiga yuklanadi.
- **Nusxalash (Copy to Clipboard)**: Yagona tugma orqali transliteratsiya natijasini xotiraga nusxalash.

---

## 📁 Loyiha strukturasi

```text
front/
├── .env                  # Muhit o'zgaruvchilari (Git'ga yuklanmaydi)
├── .env.example          # Muhit o'zgaruvchilari namunasi
├── .gitignore            # Git e'tiborsiz qoldiradigan fayllar
├── index.html            # Asosiy HTML sahifa
├── package.json          # Bog'liqliklar va buyruqlar
├── vite.config.ts        # Vite konfiguratsiyasi
├── tsconfig.json         # TypeScript konfiguratsiyasi
├── src/
│   ├── App.tsx           # Asosiy UI va navigatsiya komponenti
│   ├── main.tsx          # React ilovasining kirish nuqtasi
│   ├── index.css         # Tailwind CSS uslublari
│   ├── global.d.ts       # Telegram WebApp global typelari
│   └── services/
│       └── api.ts        # Axios client va Telegram initData interceptor
```

---

## ⚙️ Sozlash va ishga tushirish

### 1. Bog'liqliklarni o'rnatish
```bash
npm install
# yoki bun bilan:
bun install
```

### 2. Muhit o'zgaruvchilarini sozlash
Loyiha ildizida `front/.env` faylini yarating va backend API manzilini ko'rsating:
```env
VITE_API_BASE_URL=https://new-alphabet-back-3.onrender.com/api/v1
```
> **Eslatma:** Backend mahalliy kompyuterda ishlayotgan bo'lsa: `VITE_API_BASE_URL=http://localhost:8000/api/v1`

### 3. Dasturni ishga tushirish
Mahalliy dev serverni ko'tarish:
```bash
npm run dev
# yoki
bun run dev
```

### 4. Ishlab chiqarish (Production) uchun build qilish
```bash
npm run build
```
Natija `dist/` papkasida hosil bo'ladi va uni Vercel, Netlify yoki istalgan statik hostingga joylash mumkin.
