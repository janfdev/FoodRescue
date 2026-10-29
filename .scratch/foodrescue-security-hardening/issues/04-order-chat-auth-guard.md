# 04: BOLA/IDOR Fix & Data Scope Guard pada Order & Chat API

**What to build:**
Menutup kebocoran PII massal pada `GET /api/orders` dan melindungi endpoint `GET /api/chat` serta `POST /api/chat` agar hanya pemilik pesanan (buyer) atau mitra toko (seller) terkait yang dapat membaca dan berinteraksi.

**Blocked by:** 03: Fail-Fast Auth Secret & Environment Hardening

**Status:** ready-for-agent

- [ ] `GET /api/orders` menolak request terbuka tanpa filter `buyerId` atau `storeId` yang sah.
- [ ] Endpoint `/api/chat` memvalidasi keterkaitan identitas pemanggil dengan `orderId`.
- [ ] Mencegah kebocoran nomor HP, alamat, dan nominal transaksi pihak lain.
