# 01: Domain Schema, Types, and Realistic Cirebon Seed Data

**What to build:**
Sistem fondasi tipe data relasional (TypeScript) dan repository data untuk seluruh domain platform:
- Entitas: `User`, `Store`, `SurpriseBag`, `Order`, `Escrow`, `ChatMessage`, `RescueBoxPackage`, `RescueBoxOrder`, `Review`, `WithdrawalRequest`.
- Seed data realistis wilayah Cirebon Raya (Toko Roti Ruby Tuparev, My Story Cafe Kartini, Kopi Nako CSB, Buana Swalayan Siliwangi).
- Seed paket Surprise Bag dengan jam pickup sore-malam (19.00 - 21.00), harga asli vs diskon 60-70%.
- State repository tersinkronisasi untuk memfasilitasi manipulasi data di sisi client/server.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Definisi tipe domain TypeScript lengkap di `src/types/domain.ts`
- [ ] Dataset seed Cirebon Raya lengkap dengan koordinat latitude/longitude dan jam pickup
- [ ] Persistence store & service helper di `src/services/storeService.ts`
