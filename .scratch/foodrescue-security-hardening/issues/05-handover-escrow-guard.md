# 05: Handover Verification Guard & Anti-Brute-Force Escrow

**What to build:**
Mencegah klaim sepihak dan pencairan escrow prematur pada `POST /api/orders/verify` dengan memastikan hanya kasir/seller pemilik toko terkait yang dapat menyelesaikan pesanan dan merilis saldo.

**Blocked by:** 04: BOLA/IDOR Fix & Data Scope Guard pada Order & Chat API

**Status:** ready-for-agent

- [ ] Validasi kepemilikan toko (`storeId`) saat memverifikasi pesanan di `/api/orders/verify`.
- [ ] Penolakan request jika seller tidak memiliki hak atas pesanan tersebut.
- [ ] Perekaman audit log terperinci atas upaya verifikasi pesanan.
