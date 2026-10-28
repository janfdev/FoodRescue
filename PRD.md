# Product Requirement Document (PRD) — SisaRasa (Food Rescue App)

**Kawasan Operasional Perdana:** Cirebon Raya (Kota Cirebon & Kabupaten Cirebon)  
**Tujuan Utama:** Menghubungkan pembeli dengan mitra kuliner lokal untuk menyelamatkan makanan surplus berkualitas dengan diskon 50%–70%, menekan limbah makanan organik (*food waste*), dan mengamankan transaksi dengan sistem rekening bersama (*Escrow Rekber*).

---

## 1. Persona & Kebutuhan Pengguna

### A. Pembeli (Buyer) — Mobile-First Experience
* **Kebutuhan:** Mendapatkan hidangan lezat dan segar dengan harga hemat sebelum toko tutup, tanpa rasa khawatir akan kualitas makanan.
* **Fitur Utama:**
  * **Pilihan Lokasi Dinamis:** Dropdown area penjemputan (Tuparev, Kesambi, Cipto, Karanggetas, Siliwangi, Sunyaragi).
  * **Kategori Makanan:** Roti & Pastry, Makanan Berat Tradisional, Kafe & Minuman, Swalayan & Buah Segar.
  * **Katalog Surprise Bag:** Informasi toko, jarak (km), jam pengambilan spesifik (*pickup window* e.g. 19:30–21:30), harga coret vs harga diskon, kuota tersisa.
  * **Checkout & Pembayaran Aman:** Pembayaran instan via QRIS / E-Wallet dengan proteksi dana ditahan di Rekber platform.
  * **Tiket Pengambilan Interaktif:** Penerbitan QR Code & PIN 4-digit untuk diverifikasi di kasir toko.
  * **Riwayat Pesanan & Chat:** Pelacakan pesanan aktif/selesai, obrolan terenkripsi dengan toko, dan checklist ulasan kepatuhan kemasan (*Rescue Box Compliance*).

### B. Mitra Kuliner (Seller) — Store & Cashier POS
* **Kebutuhan:** Menjual sisa porsi harian untuk menutup biaya bahan baku tanpa merusak citra harga reguler toko.
* **Fitur Utama:**
  * **Manajemen Kuota Surplus:** Pengaturan jumlah kuota harian paket kejutan menjelang sore (15:00–18:00).
  * **Kasir Validasi (POS):** Pemindai QR atau input 4-digit PIN saat pembeli datang untuk melepaskan dana escrow.
  * **B2B Supply Kemasan:** Pemesanan kemasan resmi ramah lingkungan *Rescue Box* (Paket 50, 100, 200 pcs) lengkap dengan resi pelacakan pengiriman SiCepat/JNE.
  * **Dompet Toko & Penarikan Saldo:** Pemantauan pendapatan bersih (88% dari GMV setelah platform fee 12%) dan pengajuan penarikan dana (*withdrawal*) ke rekening bank.

### C. Super Admin — Operational & Financial Control Center
* **Kebutuhan:** Mengontrol ekosistem, memverifikasi kepatuhan mitra, mengelola arus kas rekber, dan menyelesaikan sengketa.
* **Fitur Utama (Layout Desktop dengan Sidebar Kiri):**
  * **Sidebar Navigasi:**
    1. *Beranda (Overview & Impact)*: Metrik porsi terselamatkan, CO2 dicegah, GMV, dan pendapatan komisi platform.
    2. *Mitra Menunggu (KYC Approval)*: Verifikasi pendaftar baru dengan inspeksi foto KTP, foto toko, lokasi, dan menu.
    3. *Daftar Transaksi (Escrow Ledger)*: Audit pesanan aktif, dana tertahan di rekber, dan pesanan selesai.
    4. *Keuangan (Withdrawal Approvals)*: Persetujuan pencairan saldo dompet ke rekening bank mitra.
    5. *Pengaturan & Sengketa (Dispute Resolution)*: Audit log obrolan dan ulasan kepatuhan kemasan.

---

## 2. Model Bisnis & Finansial
* **Take-Rate Platform:** 12% dari setiap transaksi Surprise Bag yang sukses.
* **Pendapatan Toko:** 88% dari harga paket yang dibayar pembeli.
* **Alur Escrow (Rekber):**
  1. Pembeli bayar ➔ Dana masuk status `HELD` di rekening penjamin platform.
  2. Pembeli klaim makanan dengan PIN 4-digit di kasir toko ➔ Status berubah menjadi `RELEASED_TO_SELLER`.
  3. Saldo dompet toko bertambah secara riil dan siap ditarik ke bank.

---

## 3. Parameter Kualitas & Kepatuhan Kemasan (Rescue Box)
* Mitra toko diwajibkan menggunakan kemasan resmi *Rescue Box* berlogo platform.
* Pembeli saat memberikan ulasan mengonfirmasi apakah toko menggunakan kemasan resmi.
* Toko dengan tingkat kepatuhan kemasan di bawah 80% akan menerima peringatan kepatuhan atau pembekuan sementara (*suspension*) oleh Super Admin.
