# 06: Multi-Module E2E Simulation Test Suite

**What to build:**
Suite pengujian E2E otomatis yang memverifikasi seluruh modul dari hulu ke hilir: pencarian geolokasi via combobox, transaksi pembayaran, pencatatan audit log otomatis, aktivasi flash sale oleh seller, serah terima pesanan kasir, pelepasan dana dompet toko, hingga verifikasi jejak audit di panel Super Admin.

**Blocked by:** 01-audit-log-system, 02-dynamic-location-combobox, 03-seller-flash-sale-sold-out, 04-seeder-and-swr, 05-session-and-notifications

**Status:** ready-for-agent

- [ ] Skenario 1: Query lokasi dinamis dan filtering katalog
- [ ] Skenario 2: Order placement & instant payment confirmation
- [ ] Skenario 3: Otomatisasi pencatatan event ke tabel `audit_logs`
- [ ] Skenario 4: Toggle Flash Sale & status Sold-out card
- [ ] Skenario 5: 1-klik handover kasir & verifikasi penambahan saldo mitra
- [ ] Skenario 6: Super Admin memverifikasi audit log via API
