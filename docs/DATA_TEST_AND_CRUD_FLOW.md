# PANDUAN PENGUJIAN DATA FLOW & CRUD MULTI-ROLE RERASA (FOODRESCUE)

Dokumen ini disusun untuk menguji seluruh siklus transaksi dan operasional platform **Rerasa** secara mandiri (meliputi peran **Super Admin**, **Mitra Toko / Seller**, dan **Pelanggan / Buyer**), membuktikan validitas fungsi CRUD, sinkronisasi antar-role, dan pengujian boundary edge-case.

---

## 1. Kredensial Akun Pengujian

Akses URL Login: `http://localhost:3000/login` (atau klik tombol autofill pada form login).

| Peran (Role) | Nama Pengguna / Entitas | Email Akun | Kata Sandi | Tujuan Verifikasi |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Admin Rerasa (Head of Ops) | `admin@rerasa.com` | `admin123` | Master Paket Box B2B, Verifikasi KYC Mitra, Audit Logistik & Keuangan |
| **Mitra Toko (Seller)** | Siti Rahmawati (`Ruby Bakery & Cake`) | `seller@rerasa.com` | `seller123` | Kasir POS (Penebusan PIN), CRUD Menu Surprise Bag, Pemesanan Box Kemasan, Penarikan Saldo |
| **Pelanggan (Buyer)** | Fauzan Rizqi | `fauzan@gmail.com` | `buyer123` | Eksplorasi Katalog, Interactive Detail Modal, Checkout Escrow, Boarding Pass PIN/QR |

---

## 2. Matriks Pengujian CRUD & Skenario Langkah Demi Langkah

### Skenario A: Super Admin Mengelola Master Paket Box Resmi B2B (CRUD Baru)
> **Tujuan:** Memastikan admin dapat membuat paket kemasan baru dengan kuantitas dan harga kustom, dan paket tersebut langsung tampil di katalog seller.

1. **Login sebagai Super Admin** (`admin@rerasa.com`).
2. Masuk ke menu **Logistik Kemasan Box** (`/admin/boxes`).
3. Pada tabel *Master Paket Rescue Box B2B*, periksa daftar paket default (50, 100, 200 pcs).
4. **[CREATE]** Klik tombol **"+ Tambah Paket Box"**:
   - Jumlah Box: `300` pcs
   - Harga Paket: `Rp 330.000` (Rp 1.100/box)
   - Ukuran Dimensi: `20 x 15 x 7 cm`
   - Keterangan: `Paket Katering Sedang (Tahan Minyak & Panas)`
   - Klik **"Simpan Paket Box"**.
   - *Verifikasi:* Baris paket 300 pcs muncul di tabel Master Paket.
5. **[UPDATE]** Klik tombol **"Edit"** pada salah satu paket:
   - Ubah harga paket menjadi `Rp 320.000`.
   - Klik **"Simpan Perubahan"**.
   - *Verifikasi:* Harga paket dan estimasi harga per unit terupdate seketika.
6. **[DELETE]** Buat paket dummy lalu klik tombol **"Hapus"**:
   - Paket terhapus dari daftar.

---

### Skenario B: Mitra Toko (Seller) Melakukan Pengadaan Box Resmi
> **Tujuan:** Menguji alur seller membeli kemasan B2B dari paket yang dibuat admin, dan admin memproses pengirimannya.

1. **Login sebagai Seller** (`seller@rerasa.com`).
2. Buka menu **Toko Box Resmi B2B** (`/seller/boxes`).
3. Periksa saldo awal dompet mitra (harus Rp 0 sesuai ketentuan pendaftaran awal).
4. Pilih paket box yang telah dibuat admin (misal Paket 100 pcs atau Paket 300 pcs).
5. Klik **"Beli Paket Kemasan"**:
   - Masukkan alamat pengiriman: `Jl. Tuparev No. 88, Kedawung, Cirebon`.
   - Pilih metode pembayaran: `Transfer Bank / Escrow`.
   - Konfirmasi pesanan.
6. **Beralih ke Admin** (`/admin/boxes`):
   - Lihat bagian *Daftar Pesanan Box Masuk dari Mitra*.
   - Ubah status pesanan dari `PENDING` -> `PROCESSING`.
   - Masukkan Nomor Resi Kurir: `SICEPAT-CRB-998877`.
   - Ubah status menjadi `SHIPPED` -> `DELIVERED`.
7. **Kembali ke Seller** (`/seller/boxes`):
   - Status pesanan terupdate `Terkirim` dan kuota stok box fisik bertambah sesuai pcs yang dibeli.

---

### Skenario C: Seller CRUD Katalog Surprise Bag & Penerbitan Menu
> **Tujuan:** Menguji pembuatan menu makanan surplus yang akan tampil di landing page.

1. **Sebagai Seller**, buka menu **Katalog Surprise Bag** (`/seller/bags`).
2. **[CREATE]** Klik tombol **"+ Terbitkan Surprise Bag"** (`/seller/bags/new`):
   - **Judul Paket**: `Surplus Roti Manis & Croissant Mentega`
   - **Kategori**: `Bakery & Pastry`
   - **Harga Normal**: `Rp 50.000`
   - **Harga Diskon (Surplus)**: `Rp 18.000` (Diskon 64%)
   - **Estimasi Berat**: `450 gram`
   - **Peringatan Alergen**: `Mengandung gandum, susu, dan telur.`
   - **Jam Mulai Penjemputan**: `19:30`
   - **Jam Selesai Penjemputan**: `21:30`
   - **Kuota Harian**: `5` paket
   - **Tandai Flash Sale / Last Call**: `Aktif (ON)`
   - Klik **"Terbitkan Menu Surplus"**.
3. *Verifikasi:* Menu muncul di tabel seller dengan toggle status aktif dan kuota 5/5.
4. **[UPDATE]** Klik tombol **"Edit"** pada menu:
   - Ubah kuota menjadi `6` paket atau edit harga diskon menjadi `Rp 17.500`.
   - Simpan perubahan dan pastikan data terupdate di tabel.
5. **[TOGGLE SOLD-OUT]** Klik tombol switch sold-out:
   - Status seketika berubah menjadi Nonaktif/Habis tanpa menghapus data menu.

---

### Skenario D: Pelanggan (Buyer) Menguji Interactive Detail Modal & Checkout Escrow
> **Tujuan:** Memvalidasi tampilan landing page, interaksi detail sheet dengan avatar mitra, dan penerbitan kode penjemputan.

1. **Buka Landing Page** (`http://localhost:3000/`).
2. Periksa tampilan kartu makanan:
   - Filter Kategori: Pilih `Bakery & Pastry`.
   - Filter Kawasan: Pilih `Tuparev, Cirebon`.
   - Section **Flash Sale**: Menu surplus bertanda Last Call dari Ruby Bakery tampil di slider horizontal.
3. **[TEST INTERACTIVE DETAIL SHEET / DRAWER]**:
   - Klik langsung pada salah satu kartu produk makanan.
   - *Verifikasi Hasil:*
     - Muncul slide-over modal dari bawah (bottom sheet).
     - Menampilkan logo/avatar resmi gerai Ruby Bakery.
     - Nama gerai, alamat penjemputan (`Jl. Tuparev No. 88`), jam penjemputan (`19:30 - 21:30`).
     - Badge diskon (misal `-64%`), deskripsi kelayakan surplus makanan, sisa kuota porsi.
     - Tombol aksi: `+ Ke Keranjang` dan `Beli Sekarang ->`.
4. Klik **"Beli Sekarang"** untuk menuju halaman Checkout (`/checkout`):
   - Verifikasi rincian harga:
     - Harga Makanan: `Rp 18.000`
     - Biaya Layanan Escrow: `Rp 1.000`
     - Total Pembayaran: `Rp 19.000`
   - Pilih metode pembayaran: `QRIS` atau `Virtual Account BCA`.
   - Klik **"Bayar & Konfirmasi Pesanan"**.
5. *Verifikasi Boarding Pass*:
   - Tampil **Kode Pesanan** (contoh: `RB-9102`).
   - Tampil **PIN Kasir 4-Digit** (contoh: `7421`).
   - Tampil **QR Code Penebusan**.

---

### Skenario E: Validasi Kasir POS Seller & Pencairan Saldo Dompet
> **Tujuan:** Memvalidasi pelunasan pesanan melalui PIN dan verifikasi otomatis masuknya dana ke dompet mitra.

1. **Buka Dashboard Seller** (`/seller`):
   - Menu Kasir POS berada di posisi paling atas navigasi operasional.
   - Masukkan 4-digit PIN penjemputan dari pelanggan (contoh: `7421`).
   - Klik **"Validasi PIN"**.
2. *Verifikasi Hasil:*
   - Sistem mencocokkan kode secara instan.
   - Muncul alert sukses konfirmasi penyerahan makanan.
   - Status pesanan berpindah dari `READY_FOR_PICKUP` menjadi `COMPLETED`.
   - Perhitungan Dana:
     - GMV: `Rp 18.000`
     - Platform Take-Rate (12%): `Rp 2.160` masuk ke sistem.
     - Pendapatan Bersih Mitra (88%): `Rp 15.840` masuk ke dompet seller.
3. Buka menu **Keuangan & Rekening** (`/seller/finance`):
   - Saldo dompet yang sebelumnya `Rp 0` kini bertambah menjadi `Rp 15.840`.
   - Riwayat mutasi kredit menampilkan penerimaan dana dari pesanan tersebut.
4. **[WITHDRAWAL]** Uji coba pengajuan penarikan dana:
   - Masukkan nominal penarikan (misal `Rp 15.000`).
   - Konfirmasi nomor rekening penampung BCA.
   - Pengajuan berstatus `PENDING` dan saldo tertahan berkurang.

---

### Skenario F: Super Admin Rekonsiliasi Keuangan & Audit Log
> **Tujuan:** Memverifikasi integritas audit trail log dan persetujuan pencairan dana mitra.

1. **Sebagai Super Admin**, buka menu **Keuangan & Escrow** (`/admin/keuangan`):
   - Verifikasi kesehatan Vault Escrow: Total Likuiditas vs Kewajiban Dana Mengendap.
   - Pada tabel *Permintaan Pencairan Dana Mitra*, periksa penarikan dari Ruby Bakery.
   - Klik tombol **"Setujui Transfer"**.
   - Status berubah menjadi `APPROVED` dan dana terkirim secara simulated.
2. Buka menu **Audit Trail Log** (`/admin/audit-logs`):
   - Verifikasi setiap tindakan sistem tercatat tanpa celah (Action: `WITHDRAWAL_APPROVED`, `PACKAGE_CREATED`, `ORDER_COMPLETED`).
   - Mencantumkan identitas pelaku, role, IP address, dan timestamp.
