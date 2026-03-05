# LENTERA - Ramadhan Super App
## Langkah Energi Niat Transaksi Ekonomi Ramadhan Amanah

> Terangi Hati, Sempurnakan Ibadah di Bulan Suci

## 🌟 Visi

Menjadi Ramadhan Super-App paling estetik dan fungsional yang menghubungkan spiritualitas dengan ekonomi digital (Mayar).

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Vanilla CSS + CSS Modules
- **Animations:** GSAP (PillNav), Framer Motion (Donation Cup & Interactions)
- **AI:** Groq SDK (Llama 3.3 70B)
- **Payment:** Mayar.id
- **Prayer Times:** Adhan library

## 📁 Struktur Folder

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # Lentera AI endpoints
│   │   └── webhooks/mayar/ # Payment webhook handler
│   ├── dashboard/         # Main dashboard page
│   ├── globals.css        # Global styles & themes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── views/             # Page components (Quran, Kiblat, etc.)
│   ├── AIChat.tsx         # AI chat interface
│   ├── DonationCup.tsx    # Donation visualization
│   ├── KindnessHub.tsx    # Mayar integration
│   ├── PillNav.tsx        # GSAP navigation
│   ├── PrayerReminder.tsx # Smart alerts
│   ├── SunCycle.tsx       # Dynamic sun background
│   └── ...
├── hooks/
│   ├── useDynamicTheme.ts # Theme sync with prayer times
│   └── useLocation.ts     # High-accuracy GPS
└── lib/
    ├── aiPrompts.ts       # AI prompting system
    ├── kiblat.ts          # Qibla calculation
    ├── lenteraAI.ts       # Groq SDK integration
    ├── mayar.ts           # Mayar payment schema
    ├── prayerTimes.ts     # Prayer times (adhan)
    ├── quran.ts           # Quran API fetcher
    └── smartAlerts.ts     # Notification system
```

## 🎨 Dynamic Themes

Theme berubah otomatis berdasarkan waktu sholat:

| Theme | Waktu | Warna |
|-------|-------|-------|
| Dawn | Subuh - Dhuha | Purple/Pink gradient |
| Day | Dhuha - Ashar | Deep Sea blue |
| Sunset | Ashar - Maghrib | Orange gradient |
| Maghrib | Maghrib - Isya | Red/Dark gradient |
| Night | Isya - Subuh | Deep black |

## 🕌 Fitur Utama

### 1. Landing Page (`/`)
- Cinematic splash screen dengan particles
- TextPressure interactive title
- SunCycle 24 jam background

### 2. Dashboard (`/dashboard`)
- **PillNav** (GSAP) - Smooth navigation
- **CircularText** - Branding logo
- **SunDonationPath** - Jalur sholat presisi
- **DonationCup** - Animasi air waving untuk donasi
- **KindnessHub** - Integrasi Mayar
- **Quran Pro** - Audio + Teks per ayat
- **Lentera AI** - Groq-powered assistant

### 3. Sistem Utama

#### Dynamic Theme
```ts
import { useDynamicTheme } from '@/hooks/useDynamicTheme';
const { theme, currentPrayer, nextPrayer, timeToNextPrayer } = useDynamicTheme(lat, lon);
```

#### Amanah Pledge
Staking dana komitmen via Mayar untuk target ibadah:
- Khatam Al-Qur'an
- Tahajjud 30 Hari
- Sedekah Subuh Harian
- Puasa Tanpa Bolong

#### Smart Alerts
Notifikasi adzan otomatis:
- 15 menit sebelum (Persiapan)
- 10 menit sebelum (Pengingat)
- 5 menit sebelum (Imminent)
- Waktu sholat tiba

## 🔧 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Buat file `.env.local`:
```env
# Groq AI (https://console.groq.com)
GROQ_API_KEY=gsk_xxx

# Mayar Payment (https://mayar.id)
MAYAR_API_KEY=xxx
MAYAR_WEBHOOK_SECRET=xxx

# App URL (untuk webhook)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Development
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

### POST /api/chat
Chat dengan Lentera AI
```json
{
  "messages": [
    { "role": "user", "content": "Saya sedang sedih, beri saya ayat" }
  ],
  "context": {
    "currentPrayer": "maghrib",
    "userMood": "sedih"
  }
}
```

### POST /api/webhooks/mayar
Webhook handler untuk payment Mayar

## 🤝 Integrasi Mayar

### Checkout Session
```ts
import { createCheckoutSession } from '@/lib/mayar';

const session = await createCheckoutSession(userId, amount);
```

### Webhook Handler
Otomatis update Skor Keberkahan saat donasi sukses.

## 📱 Features Checklist

- [x] Quran API integration
- [x] Qibla direction (Great Circle)
- [x] High-accuracy GPS
- [x] Prayer times (adhan library)
- [x] Dynamic themes
- [x] Smart alerts (15/10/5 min)
- [x] Lentera AI (Groq)
- [x] Mayar webhook integration
- [x] Amanah Pledge system
- [ ] Google OAuth login
- [ ] Database integration (Prisma/Drizzle)
- [ ] Push notifications
- [ ] Zakat calculator

## 🎯 Roadmap

### Phase 1 - MVP ✅
- Landing page cinematic
- Dashboard dengan Prayer Times
- Quran reader dengan audio
- Kiblat compass
- Lentera AI basic

### Phase 2 - Payment 🚧
- Mayar checkout integration
- Webhook handler
- Skor Keberkahan system
- Amanah Pledge

### Phase 3 - Polish ⏳
- Database integration
- User authentication
- Push notifications
- Analytics dashboard

## 📄 License

Private Project - LENTERA Team 2026

## 🙏 Credits

- **equran.id** - Quran API
- **adhan** - Prayer times calculation
- **Groq** - AI inference
- **Mayar** - Payment gateway
