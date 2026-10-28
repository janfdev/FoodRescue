# 04: Physical Pickup Verification and Escrow Settlement

**What to build:**
Fitur verifikasi serah-terima fisik antara Kasir Toko dan Pembeli:
- Kasir Scanner View: Pemindai QR berbasis browser kamera atau input cepat PIN 4-digit manual.
- Validasi Keamanan: Mengecek apakah pesanan berstatus `PAID` / `READY_FOR_PICKUP` dan cocok dengan toko tersebut.
- Otomasi Escrow Release:
  - Mengubah status pesanan menjadi `COMPLETED`.
  - Menghitung potongan komisi platform (misal: 12% take-rate).
  - Mengkreditkan sisa dana bersih (88%) ke saldo dompet Seller secara real-time.
- Formulir penarikan saldo (*Withdrawal Request*) oleh Seller ke bank lokal (BCA, Mandiri, BRI).

**Blocked by:** 02-buyer-discovery-and-checkout, 03-seller-quota-and-b2b-box-store

**Status:** ready-for-agent

- [ ] Antarmuka kasir verifikasi PIN 4-digit dan QR Code
- [ ] Logika otomatis pelepasan escrow dan pemotongan komisi 12%
- [ ] Update saldo dompet penjual secara real-time
- [ ] Fitur pengajuan penarikan dana (withdrawal)
