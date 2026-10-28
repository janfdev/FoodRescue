# 05: Live Session Binding and Web Push Notifications

**What to build:**
Pengikatan sesi autentikasi nyata (`useSession()` dari `@/lib/auth-client`) menggantikan dropdown simulasi role switcher, serta integrasi Service Worker untuk Web Push Notifications saat pesanan siap diambil atau menerima pesan chat baru.

**Blocked by:** 04-seeder-and-swr

**Status:** ready-for-agent

- [ ] Integrasi `useSession()` Better-Auth di Navbar, Account, dan protected layout
- [ ] Penguncian rute admin/seller berdasarkan session role nyata di PostgreSQL
- [ ] Service worker helper untuk Web Notification permission & trigger pesan
- [ ] Notifikasi visual saat pesanan berhasil dibayar dan saat serah terima selesai
