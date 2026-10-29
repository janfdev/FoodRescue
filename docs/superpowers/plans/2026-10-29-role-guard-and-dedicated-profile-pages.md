# Plan & Tickets: Role-based Route Protection, Dedicated Profile Pages & Surprise Bag Editor

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menegakkan proteksi akses role via Next.js Middleware (`/account` hanya untuk buyer), memindahkan pengelolaan profil Seller & Admin dari dialog modal menjadi halaman penuh terdedikasi (`/seller/profile` dan `/admin/profile`), serta menambahkan fitur edit lengkap Surprise Bag berbasis halaman terdedikasi (`/seller/bags/[id]/edit`).

**Architecture:** 
- Next.js Edge Middleware (`src/middleware.ts`) membaca cookie sesi (`rerasa_user_role` dan Better-Auth session) dan memblokir akses non-buyer ke `/account`.
- Sync cookie auth otomatis di `storeService.setCurrentUser` & `loginWithEmail`.
- UI/UX Dedicated Pages di `/seller/profile`, `/admin/profile`, dan `/seller/bags/[id]/edit` mengikuti prinsip anti-slop R-01..R-38 (no em-dash, tabular-nums, semantic tokens).
- Service method `storeService.updateSurpriseBag(bagId, partialData)` untuk update in-memory state.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui, Better-Auth, Drizzle ORM.

---

## Tracer-Bullet Tickets (Matt Pocock Style)

### Ticket 01: Next.js Middleware Role Guard for `/account`
- **What to build:** Next.js Edge Middleware (`src/middleware.ts`) yang memvalidasi cookie role pengguna (`rerasa_user_role` / better-auth session). Jika role adalah `seller`, redirect 307 ke `/seller`. Jika role adalah `admin`, redirect 307 ke `/admin`. Jika belum login atau role `buyer`, izinkan akses normal ke `/account`.
- **Blocked by:** None (can start immediately).
- **Status:** ready-for-agent
- [ ] Buat cookie sinkronisasi role (`rerasa_user_role`) di `storeService` dan auth handlers.
- [ ] Buat `src/middleware.ts` dengan matcher `['/account']`.
- [ ] Jalankan verifikasi manual/curl test untuk role seller & admin redirect.

### Ticket 02: Dedicated Profile Pages for Seller & Admin
- **What to build:** Halaman penuh terdedikasi (`/seller/profile/page.tsx` dan `/admin/profile/page.tsx`) menggantikan dialog pop-up. Menyediakan form profil lengkap, logo selector ZonaLogo, dan pengaturan operasional gerai, serta tautan sidebar aktif di portal Seller dan Admin.
- **Blocked by:** Ticket 01.
- **Status:** ready-for-agent
- [ ] Tambahkan menu navigasi "Profil & Akun" pada sidebar & mobile menu `SellerLayout` (`/seller/layout.tsx`).
- [ ] Tambahkan menu navigasi "Profil Admin" pada sidebar & mobile menu `AdminLayout` (`/admin/layout.tsx`).
- [ ] Implementasikan halaman `/seller/profile/page.tsx` dengan responsive desktop/mobile layout.
- [ ] Implementasikan halaman `/admin/profile/page.tsx` dengan form super admin.

### Ticket 03: Dedicated Surprise Bag Edit Page (`/seller/bags/[id]/edit`)
- **What to build:** Halaman penuh terdedikasi `/seller/bags/[id]/edit` yang memuat data Surprise Bag yang dipilih, memungkinkan pengubahan judul, deskripsi, kategori, harga normal, harga surplus diskon, kuota harian, jam pickup, dan unggah foto/ganti gambar, disertai tombol tindakan "Edit Paket" pada daftar katalog `/seller/bags`.
- **Blocked by:** Ticket 02.
- **Status:** ready-for-agent
- [ ] Tambahkan method `updateSurpriseBag(bagId, partialData)` pada `storeService.ts`.
- [ ] Tambahkan tombol "Edit Paket" pada kartu Surprise Bag di `/seller/bags/page.tsx` yang mengarahkan ke `/seller/bags/[id]/edit`.
- [ ] Buat halaman `/seller/bags/[id]/edit/page.tsx` lengkap dengan pre-fill form, validasi anti-slop, dan tombol simpan perubahan.
- [ ] Tambahkan pengujian otomatis E2E (`bun run src/test/e2eSimulation.test.ts`) dan build verifikasi.
