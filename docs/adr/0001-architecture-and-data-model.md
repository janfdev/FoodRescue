# ADR 0001: Unified Next.js 15 PWA & Responsive Single-Engine Architecture

## Status
Accepted

## Context
Proyek Food Rescue App (SisaRasa / RescueBites) untuk wilayah Cirebon Raya membutuhkan simulasi kerja penuh dalam batas waktu 48 jam. Platform melibatkan tiga persona:
1. **Buyer** (Mobile-first, mencari toko terdekat, pesan makanan, bayar escrow, in-app chat, tiket QR).
2. **Seller** (Mobile/Tablet, atur kuota paket, B2B order box, scan QR / PIN tiket, pantau pendapatan).
3. **Super Admin** (Desktop Web, approval mitra, inventory box, finance withdrawal, penengah sengketa).

Membangun 3 repo terpisah (Mobile React Native/Flutter, Backend NestJS/Fastify, dan Web Admin) akan menghabiskan waktu pada koordinasi network, API routing cross-origin, dan setup emulator seluler.

## Decision
1. **Monorepo Unified Next.js 15 (App Router)**:
   - Satu codebase TypeScript terpadu.
   - Persona Buyer & Seller di-render dalam **Mobile Viewport Frame** (`max-w-md mx-auto`) dengan nuansa native mobile UX (bottom navigation, sticky header, touch-friendly sheets).
   - Persona Super Admin di-render dalam **Desktop Layout** dengan responsive dashboard sidebar.
   - Switcher role instan di header atas untuk memudahkan pengujian/evaluasi persona tanpa logout-login berulang kali.
2. **Data & State Architecture**:
   - Skema domain relasional terstruktur (`User`, `Store`, `SurpriseBag`, `Order`, `Escrow`, `ChatMessage`, `RescueBoxOrder`, `Review`, `Withdrawal`).
   - Repository pattern yang dilengkapi **Seed Data realistis Cirebon Raya** (toko roti ternama Cirebon, kafe, swalayan lokal, GPS koordinat riil Grage Mall, CSB Mall, Tuparev).
   - Mock Payment Gateway & QR Camera Engine berbasis web (`html5-qrcode` & `qrcode.react`) sehingga demo scan QR fisik antar-layar (layar HP scan layar laptop) langsung berfungsi nyata.
3. **In-App Chat Engine**:
   - Terikat ketat pada `order_id` yang berstatus `PAID` / `READY_FOR_PICKUP`.
   - Otomatis terkunci menjadi *read-only* 24 jam setelah status `COMPLETED`.
   - Logging tersentralisasi agar Super Admin dapat mengaudit saat terjadi sengketa (*dispute*).

## Consequences
- **Positive**: Seluruh fitur dapat dijalankan secara instan di browser mana pun (bahkan dapat diakses bersamaan dari smartphone via IP lokal).
- **Positive**: Menghilangkan risiko kegagalan build native compiler seluler dan CORS error.
- **Trade-off**: Notifikasi mobile disimulasikan menggunakan browser toast/banner real-time alih-alih native FCM background service.
