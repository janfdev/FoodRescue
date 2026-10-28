# 02: Buyer Discovery, Maps, and Escrow Checkout Flow

**What to build:**
Tampilan mobile-first untuk persona Pembeli (*Buyer*):
- Header lokasi (Cirebon Kota) & filter kategori (Roti/Pastry, Makanan Berat, Minuman/Kafe).
- List & Radar Peta Toko terdekat dengan estimasi jarak (km) dan badge "Sisa Kuota" real-time.
- Modal Detail Paket Surprise: Info jam pickup, harga coret, disclaimer isi kejutan.
- Checkout & Mock Payment Gateway: Pilihan metode QRIS / Virtual Account, simulasi 1-klik "Bayar Sekarang".
- State Transition: Pembuatan `Order` dengan status `PAID`, pembuatan record `Escrow` penahanan dana, dan penerbitan Tiket Pengambilan (QR Code + PIN 4-digit).

**Blocked by:** 01-domain-schema-and-seed

**Status:** ready-for-agent

- [ ] Mobile Viewport Buyer dengan Bottom Nav (Jelajah, Pesanan Saya, Profil)
- [ ] Fitur filter jarak dan jam pengambilan
- [ ] Sheet Checkout dengan simulasi pembayaran QRIS instan
- [ ] Halaman Tiket Pengambilan menampilkan QR Code aktif dan PIN
