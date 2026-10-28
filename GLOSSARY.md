# Domain Glossary: SisaRasa (RescueBites)

### Core Terms

- **Surprise Bag (Paket Penyelamat)**: Paket makanan layak konsumsi dengan diskon 50-70% dari sisa surplus harian toko. Isi paket bersifat rahasia (*surprise*) tergantung stok toko pada hari itu.
- **Pickup Window (Jendela Pengambilan)**: Rentang waktu harian spesifik (misal: 19:30 - 21:00) yang ditentukan oleh mitra toko saat pembeli wajib datang mengambil makanan (*self-pickup*).
- **Escrow (Rekening Penjamin)**: Mekanisme penahanan dana transaksi oleh platform sejak status `PAID` hingga serah terima fisik terverifikasi, menjaga keamanan dana kedua belah pihak.
- **Pickup Verification (Verifikasi Pengambilan)**: Proses serah-terima fisik di mana Penjual memindai QR Code atau menginput PIN 4-digit milik Pembeli untuk melepaskan dana escrow.
- **Rescue Box**: Kotak kemasan higienis resmi berlogo platform yang wajib dibeli dan digunakan mitra toko (B2B Supply Store) dalam paket 50, 100, atau 200 pcs.
- **Box Compliance (Kepatuhan Kemasan)**: Parameter verifikasi saat pembeli membuat ulasan, memvalidasi apakah penjual menggunakan kemasan resmi Rescue Box.
- **Dispute (Sengketa)**: Kondisi perselisihan transaksi (misal: toko tutup mendadak saat jam pickup) yang memicu intervensi Super Admin untuk pengembalian dana atau sanksi toko.
- **Order State Machine**:
  - `PENDING_PAYMENT`: Pesanan dibuat, menunggu pembayaran.
  - `PAID`: Pembayaran lunas, dana di-escrow, chat aktif, tiket QR/PIN diterbitkan.
  - `READY_FOR_PICKUP`: Toko telah menyiapkan paket saat jam pengambilan dimulai.
  - `COMPLETED`: QR/PIN berhasil diverifikasi kasir toko, dana dilepas ke saldo penjual.
  - `EXPIRED`: Pembeli tidak hadir hingga batas jam pengambilan berakhir.
  - `DISPUTED`: Masalah dilaporkan oleh pembeli/penjual.
  - `REFUNDED`: Dana escrow dikembalikan ke pembeli oleh Super Admin.
