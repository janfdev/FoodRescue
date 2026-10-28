# REDESIGN.md — Rerasa (Food Rescue Cirebon)

> Dokumen Arsitektur Desain & Cetak Biru Antarmuka Mobile-First Marketplace dan Portal Enterprise Desktop.  
> Disusun berdasarkan prinsip **Anti-Slop** dan metodologi **Superpowers Brainstorming**.

---

## 1. Visi & Inti Perubahan (Design Intent)

### Masalah pada Desain Sebelumnya:
* Format beranda bergaya *landing page* web korporat dengan banyak teks penjelasan misi, narasi panjang, dan informasi statis yang menghalangi aksi utama pengguna.
* Kartu produk berukuran besar 1 kolom per baris yang membutuhkan scroll panjang di layar ponsel.
* Checkout hanya berupa modal popup sederhana tanpa keleluasaan memilih kuantitas porsi atau metode pembayaran yang fleksibel.

### Solusi Redesign:
1. **Beranda Konsumen (`/` & `/buyer`):** Berubah 100% menjadi antarmuka **Aplikasi Mobile Marketplace Instan** (mirip DANA Deals, GrabFood, ShopeeFood, atau aplikasi gerai kuliner modern). Pada layar desktop, antarmuka dibungkus dalam *Centered Mobile Container* (`max-w-md mx-auto`) dengan latar belakang kanvas bersih.
2. **Katalog Produk Langsung:** Pengguna langsung dihadapkan pada pencarian makanan surplus terdekat di Cirebon, tombol filter cepat, dan **Grid 2 Kolom Kompak** berasio 1:1.
3. **Rute Checkout Mandiri (`/checkout`):** Alur pemesanan dialihkan ke halaman tersendiri yang mendukung:
   * Pemilihan jumlah porsi (*Quantity Counter*: `[-] N [+]`) dengan batas kuota riil.
   * Rincian kalkulasi harga dinamis (Subtotal porsi + Biaya Layanan Aplikasi Rp 1.000).
   * Pemilihan metode pembayaran (QRIS Instan, Tunai di Kasir/COD, dan Virtual Account).
4. **Portal Mitra Toko (`/seller/*`) & Super Admin (`/admin/*`):** Tetap dipertahankan sebagai **Desktop-First Enterprise Dashboard** dengan sidebar navigasi tetap, grafik Recharts, dan tabel manajemen operasional.

---

## 2. Token Desain & Filter Anti-Slop

### Dial Pengaturan Antarmuka:
* **ENERGY:** 2 (Hangat, bersahaja, fokus kuliner lokal, tanpa elemen visual agresif).
* **RHYTHM:** 2 (Rapi, konsisten pada grid 2 kolom mobile, dengan jeda banner sorotan *Last Call*).
* **MOTION:** 1 (Transisi status halus pada tab dan penekanan tombol, tanpa animasi melayang liar).

### Palet Warna Semantik:
* **Botanical Emerald (Aksi Utama):**
  * Light: `#15803d` (Emerald-700) / `#166534` (Emerald-800)
  * Dark: `#22c55e` (Emerald-500)
  * Fungsi: Tombol aksi utama beli, status lencana aktif, dan konfirmasi.
* **Warm Amber (Urgensi Kuliner & Diskon):**
  * Light: `#d97706` (Amber-600) / `#b45309` (Amber-700)
  * Dark: `#f59e0b` (Amber-500)
  * Fungsi: Lencana *Last Call Food*, persentase diskon hemat (60%-70%), dan jam pickup.
* **Surface & Canvas:**
  * Mobile Canvas: `#ffffff` (Card background), `#f8fafc` / `#f4f4f5` (Neutral viewport body).
  * Desktop Backdrop: Tone netral hangat yang membuat bingkai ponsel di tengah tampak elegan.

### Larangan Anti-Slop yang Ditegakkan:
* Bebas dari karakter *em dash* (`—`) di seluruh teks antarmuka.
* Bebas dari emoji dekoratif pada bilah judul, filter kategori, maupun kartu navigasi.
* Bebas dari tombol mati (*zero dead controls*).
* Kontras teks memenuhi standar WCAG AA (>4.5:1).

---

## 3. Peta Navigasi & Struktur Rute

```
Aplikasi Rerasa (Food Rescue Cirebon)
├── / (Beranda Aplikasi Konsumen - Mobile Viewport)
│   ├── Top Bar (Lokasi Penjemputan, Search Bar, Profil)
│   ├── Banner Spotlight (Penawaran Darurat Last Call Food)
│   ├── Quick Bubbles (Filter Kategori: Roti, Nasi, Kopi, Segar, Last Call)
│   ├── 2-Column Marketplace Grid (Foto 1:1, Harga Coret, Sisa Kuota, Tombol Ambil)
│   └── Floating Bottom Navigation (Jelajah, Tiket Saya, Profil)
│
├── /checkout?bagId=[id] (Rute Checkout & Hitung Kuantitas)
│   ├── Ringkasan Paket & Jam Ambil Mitra
│   ├── Penghitung Jumlah Porsi ([-] N [+])
│   ├── Pilihan Metode Pembayaran (QRIS, Tunai/COD Kasir, VA)
│   ├── Identitas Pengambil (Nama & WhatsApp)
│   └── Tombol Bayar & Terbitkan Tiket
│
├── /login (Halaman Autentikasi & Akun Demo)
│
├── /seller/* (Portal Mitra Toko - Desktop Layout)
│   ├── /seller (Kasir POS Verifikasi PIN)
│   ├── /seller/bags (Manajemen Kuota & Tambah Surprise Bag)
│   ├── /seller/orders (Histori Pesanan & Tren Penjualan)
│   ├── /seller/boxes (Pemesanan Box B2B & Tracking Resi)
│   └── /seller/finance (Dompet Saldo & Penarikan Dana)
│
└── /admin/* (Pusat Komando Super Admin - Desktop Layout)
    ├── /admin (Ringkasan Metrik & Analisis Dampak)
    ├── /admin/mitra (Verifikasi KYC Calon Toko Baru)
    ├── /admin/transaksi (Audit Rekber Escrow & Sengketa)
    ├── /admin/keuangan (Persetujuan Pencairan Dana)
    ├── /admin/users (Manajemen Pengguna & Paginasi)
    └── /admin/audit (Audit Kepatuhan Kemasan Ramah Lingkungan)
```

---

## 4. Rincian Tata Letak Halaman Konsumen

### 4.1. Beranda Mobile (`/`)
* **Wadah Viewport:** Dibungkus dalam kontainer berukuran maksimal `max-w-md mx-auto` dengan shadow halus dan border di layar desktop.
* **Top App Bar (Fixed):**
  * Baris 1: Ikon Lokasi (`MapPin`), teks *"Lokasi Ambil: Cirebon Kota (Tuparev)"*, dan Avatar Profil (Dicebear Notionists) dengan popover menu.
  * Baris 2: Kolom input pencarian cepat (*"Cari roti, resto, atau area..."*) dengan ikon kaca pembesar.
* **Spotlight Banner (Last Call Food):**
  * Kartu berlatar amber hangat dengan aksen waktu hitung mundur jelang toko tutup malam ini.
* **Kategori Cepat (*Horizontal Scroll/Grid*):**
  * 5 Ikon lingkaran sentuh responsif: *Semua*, *Roti & Pastry*, *Makanan Berat*, *Kafe & Minuman*, *Bahan Segar*, dan *Last Call*.
* **Katalog 2 Kolom (*Marketplace Cards*):**
  * Kartu berdesain rasio aspek 1:1 untuk gambar produk.
  * Lencana diskon hemat di pojok atas (misal: `-63%`).
  * Lencana status: `Last Call` atau `Sisa N paket`.
  * Judul paket makanan (maksimal 2 baris).
  * Nama toko mitra kuliner lokal Cirebon.
  * Harga diskon tebal hijau (misal: `Rp 24.000`) dan harga normal toko dicoret (misal: `Rp 65.000`).
  * Tombol aksi: `Ambil` (langsung mengarahkan ke rute `/checkout?bagId=...`).
* **Floating Bottom Bar:**
  * Tombol 1: **Jelajah** (Katalog Beranda).
  * Tombol 2: **Tiket Saya** (Dilengkapi badge merah kecil berisi jumlah tiket aktif penjemputan).
  * Tombol 3: **Profil / Bantuan**.

---

### 4.2. Rute Checkout Mandiri (`/checkout`)
* **Header:** Tombol kembali (*Back Button*) ke beranda dengan judul *"Konfirmasi Pesanan"*.
* **Kartu Rincian Paket:**
  * Menampilkan foto, nama paket, nama toko mitra, dan jam ambil pasti (misal: *19:30 - 21:00 WIB*).
* **Penghitung Kuantitas (*Quantity Stepper*):**
  * Tombol minus (`-`), angka jumlah pesanan, dan tombol plus (`+`).
  * Batas maksimal dikunci sesuai `quotaRemaining` dari database/state agar tidak terjadi *overselling*.
* **Pemilih Metode Pembayaran (*Payment Selector*):**
  * Opsi 1: **QRIS Instan (Simulasi Otomatis)** — kode QR muncul di layar, pembayaran diverifikasi seketika.
  * Opsi 2: **Tunai di Kasir (COD)** — bayar langsung saat mengambil di toko mitra.
  * Opsi 3: **Transfer Bank / Virtual Account (BCA, Mandiri, BNI)**.
* **Formulir Pengambil:**
  * Nama lengkap pemesan dan nomor WhatsApp untuk pengiriman tiket.
* **Rincian Biaya Transparan:**
  * Subtotal Makanan: `Kuantitas x Harga Diskon`.
  * Biaya Layanan Aplikasi: `Rp 1.000` (tetap).
  * Total Pembayaran yang harus dibayar pembeli.
* **Tombol Aksi Bawah (*Sticky Bottom*):**
  * Tombol hijau tegas: *"Bayar & Dapatkan Tiket (Rp X.XXX)"*.
  * Ketika ditekan, pesanan tersimpan di sistem, kuota berkurang, dan pengguna langsung dialihkan ke tiket voucher aktif.

---

## 5. Rencana Eksekusi (Implementation Steps)

1. **Pembuatan Berkas Komponen Mobile Beranda:**
   * Membangun `MobileMarketplaceView.tsx` yang mengemas header app bar, banner spotlight, quick bubbles, grid 2 kolom, dan bottom nav.
2. **Penyusunan Rute Checkout (`/src/app/checkout/page.tsx`):**
   * Mengambil data `bagId` dari query string.
   * Mengimplementasikan penghitung kuantitas, pemilihan pembayaran, formulir nama/WA, dan submit order.
3. **Penyelarasan Rute Tiket Penjemputan:**
   * Memastikan setelah checkout berhasil, tiket langsung terbuka dengan PIN 4-digit untuk diverifikasi di kasir seller.
4. **Proteksi Layout Desktop Seller & Super Admin:**
   * Memastikan `/seller/*` dan `/admin/*` tetap berjalan normal dalam mode desktop enterprise.
5. **Uji Kompilasi Turbopack & Verifikasi Simulasi E2E:**
   * Menjalankan `bun run build` dan `bun run src/test/e2eSimulation.test.ts`.

---

## 6. Daftar Verifikasi Anti-Slop (Delivery Gate Checklist)

- [x] Zero em dash (`—`) pada seluruh teks antarmuka.
- [x] Zero tombol mati: seluruh aksi kartu menuju ke rute checkout nyata.
- [x] Ukuran tap target di mobile memenuhi standar minimal 44x44 piksel.
- [x] Warna diskon dan harga kontras tinggi (WCAG AA).
- [x] Layout desktop `/seller` dan `/admin` tidak terpengaruh oleh layout mobile konsumen.
- [x] Data toko dan makanan menggunakan data riil Cirebon tanpa klaim palsu.
