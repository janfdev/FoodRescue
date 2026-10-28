# DESIGN.md: Rerasa (Food Rescue Cirebon Raya)

> Dokumen acuan arsitektur visual, token desain, prinsip anti-slop, dan tata letak antarmuka resmi untuk platform penyelamatan makanan surplus Rerasa.

---

## 1. Identitas Brand & Filosofi Desain

* **Nama Platform:** **Rerasa** (re-taste: merayakan kembali kelezatan makanan berkualitas dari mitra kuliner lokal Cirebon sebelum jam tutup toko).
* **Mascot & Brand Mark:**
  * Maskot R berbentuk kepala unggas ramah dengan paruh oranye yang membentuk kaki huruf R (`/public/brand/rerasa-mascot-r.svg`).
  * Simbol keberlanjutan pangan, keramahan lokal, dan kesegaran produk.
* **Bukan AI Slop:**
  * Bebas dari karakter *em dash* (`—`) di seluruh teks antarmuka dan salinan sistem.
  * Bebas dari emoji dekoratif pada bilah navigasi, filter kategori, maupun kartu menu.
  * Bebas dari badge kapsul generik di atas headline (*eyebrow badge* yang mengulang isi judul).
  * Bebas dari animasi *pulsing* melayang liar tanpa henti.
  * Berlandaskan data riil mitra kuliner Cirebon: Ruby Bakery Tuparev, Kopi Nako Kesambi, Nasi Jamblang Mang Dul, Martabak San Francisco Kejaksan, dan Empal Gentong H. Apud.

---

## 2. Dial Pengaturan Antarmuka (Three Dials)

* **ENERGY:** 2 (Hangat, bersahaja, fokus kuliner lokal, tanpa elemen visual agresif).
* **RHYTHM:** 2 (Komposisi terstruktur: grid 2 kolom mobile yang padat dengan jeda banner sorotan *Last Call Food*).
* **MOTION:** 1 (Transisi status mikro yang halus pada tab dan penekanan tombol, tanpa pergerakan liar).

---

## 3. Palet Warna Semantik (Semantic Tokens)

* **Botanical Emerald (Warna Primer Penyelamatan Pangan):**
  * Light: `#15803d` (Emerald-700) / `#166534` (Emerald-800)
  * Dark: `#22c55e` (Emerald-500)
  * Makna: Melambangkan kesegaran pangan, keberlanjutan lingkungan, dan aksi penyelamatan.
* **Warm Amber (Aksen Kuliner & Urgensi Diskon):**
  * Light: `#d97706` (Amber-600) / `#b45309` (Amber-700)
  * Dark: `#f59e0b` (Amber-500)
  * Makna: Menggugah selera makan hangat, aroma panggangan roti sore, diskon hemat (60% s/d 70%), dan penawaran kilat *Last Call Food*.
* **Permukaan & Netral (Warm Canvas):**
  * Mobile Viewport: `#ffffff` (Card background), `#fafaf9` / `#f4f4f5` (Neutral container).
  * Desktop Canvas: Latar belakang netral hangat yang membuat bingkai ponsel di tengah terlihat elegan.
* **Kontras Aksesibilitas:** Seluruh teks memenuhi standar WCAG AA (>4.5:1 untuk teks normal).

---

## 4. Tipografi

* **Font Utama:** `Plus Jakarta Sans` dan `Poppins` (Google Fonts).
* **Karakter Tipografi:** Bersih, humanis, bersahaja, dan mudah dibaca pada layar kecil ponsel.
* **Monospace Fungsional:** `JetBrains Mono` / `Geist Mono` hanya digunakan untuk identitas operasional kasir:
  * Kode Pesanan (e.g. `RB-8492`)
  * PIN 4-Digit Pengambilan Kasir (e.g. `4829`)
  * Nomor Resi Logistik Box B2B (e.g. `SICEPAT-CRB-831873`)

---

## 5. Arsitektur Ganda (Dual-Paradigm Architecture)

Projek ini mengadopsi arsitektur terpisah berdasarkan kebutuhan spesifik pengguna:

```
RERASA CIREBON RAYA
├── PARADIGMA 1: KONSUMEN (MOBILE-FIRST MARKETPLACE)
│   ├── / (Katalog Beranda Instan)
│   ├── /checkout (Rute Checkout & Pemilihan Pembayaran)
│   ├── /history (Halaman Riwayat Pesanan & Voucher Pengambilan)
│   ├── /account (Halaman Akun & Profil Pengguna)
│   ├── /login (Halaman Masuk Dedicated & Google OAuth)
│   └── /brand (Showcase Aset Vektor Logo)
│
└── PARADIGMA 2: OPERASIONAL MITRA & ADMIN (DESKTOP-FIRST ENTERPRISE)
    ├── /seller/* (Portal Kasir POS, Kuota Paket, Analitik Recharts, Box B2B, Dompet)
    └── /admin/* (Command Center Super Admin, Verifikasi KYC, Rekber Escrow, Keuangan, Users)
```

---

## 6. Spesifikasi Antarmuka Konsumen (Mobile App View)

### 6.1. Beranda Marketplace (`/` & `/buyer`)
* **Wadah Viewport:** Dibungkus dalam kontainer `max-w-md mx-auto` dengan shadow halus pada tampilan desktop, dan memenuhi layar penuh pada ponsel.
* **Sticky Top App Bar:**
  * Tombol Lokasi: Menampilkan kawasan penjemputan (*"Cirebon Kota • Tuparev"*) dengan popover untuk memilih kawasan (*Semua, Tuparev, Kesambi, Pekiringan, Karanggetas, Kejaksan*).
  * Kotak Pencarian: Input pencarian cepat menu dan gerai.
  * Avatar Profil: Menampilkan foto Dicebear Notionists dengan menu popover (*Pusat Kendali Admin/Seller, Tiket Saya, dan Switch Akun Demo*).
* **Banner Sorotan (Spotlight Last Call Food):** Menyorot paket cuci gudang malam hari dengan diskon 60% s/d 70% sebelum toko tutup.
* **Gelembung Kategori Cepat (Horizontal Scrollable):**
  * Dibungkus dengan `w-full overflow-x-auto scroll-smooth scrollbar-none` dan `w-max flex-nowrap`.
  * Pilihan kategori: *Semua*, *Roti & Pastry*, *Makanan Berat*, *Kafe & Kopi*, *Bahan Segar*, dan *Last Call*.
* **Katalog 2 Kolom Kompak (*Marketplace Grid*):**
  * Foto produk kompak (`h-24` s/d `h-28`) berasio 4:3.
  * Lencana diskon hemat di pojok kiri atas (misal: `-63%`) dan lencana *Last Call*.
  * Indikator sisa kuota porsi (`Sisa N`).
  * Nama mitra kuliner Cirebon, nama paket, dan jam ambil (*pickup window*).
  * Harga diskon hijau tebal dan harga normal dicoret.
  * Tombol **"Ambil"** yang mengarahkan langsung ke rute `/checkout?bagId=[id]`.
* **Floating Bottom Navigation:** Tiga tombol navigasi bawah mengambang:
  * **Jelajah** (`/`)
  * **Riwayat** (`/history` dengan lencana indikator pesanan aktif)
  * **Akun** (`/account`)

---

### 6.2. Rute Checkout Mandiri (`/checkout`)
* **Ringkasan Paket:** Foto produk, nama toko mitra, kawasan, dan jadwal jam penjemputan.
* **Penghitung Kuantitas Porsi (*Quantity Stepper*):**
  * Tombol `[-] N [+]` dibatasi minimal 1 dan maksimal sesuai sisa kuota riil (`bag.quotaRemaining`).
* **Pemilihan Metode Pembayaran:**
  * *QRIS Instan (Simulasi)*
  * *Bayar Tunai di Kasir (COD)*
  * *Transfer Virtual Account Bank (BCA, Mandiri, BNI)*
* **Formulir Pengambil:** Input Nama Lengkap & Nomor WhatsApp yang otomatis tersinkronisasi ke `localStorage`.
* **Kalkulasi Biaya Transparan:**
  * Subtotal Makanan: `Kuantitas x Harga Diskon`.
  * Biaya Layanan Aplikasi: `Rp 1.000` (tetap).
  * Total Tagihan Pembeli.
* **Penyimpanan Pesanan Otomatis:** Setelah order dibuat, voucher penjemputan diterbitkan dengan PIN 4-digit kasir dan QR Code SVG di halaman riwayat.

---

### 6.3. Halaman Riwayat Pesanan (`/history`)
* **Tab Navigasi:**
  * *Pesanan Aktif*: Menampilkan voucher yang siap diambil di gerai mitra.
  * *Riwayat Selesai*: Pesanan yang telah selesai diserahterimakan.
* **Kartu Voucher:**
  * Menampilkan PIN 4-digit dalam box kontras amber besar.
  * QR Code berukuran 110x110 px yang dapat dipindai staf kasir.
  * Tombol membuka obrolan langsung (*Chat In-App*) dengan kasir toko.

---

### 6.4. Halaman Akun & Profil (`/account`)
* **Kartu Profil:** Menampilkan identitas pengguna, nomor telepon, email, dan lencana peran.
* **Banner Akses Peran Khusus:**
  * *Pusat Kendali Super Admin* (`/admin`) untuk akun admin.
  * *Portal Mitra Kuliner POS* (`/seller`) untuk akun toko.
* **Pintasan Peran Demo:** Pengganti peran instan (Admin, Seller, Buyer) untuk keperluan pengujian tanpa kata sandi.

---

## 7. Spesifikasi Antarmuka Operasional Desktop

### 7.1. Portal Mitra Toko (`/seller/*`)
Mengadopsi pola `@bagui/dashboard-store` dengan sidebar tetap dan 5 sub-rute modular:
* `/seller`: Kasir POS untuk validasi PIN 4-digit pembeli dan pelepasan dana escrow seketika.
* `/seller/bags`: Manajemen kuota harian, status penjualan aktif/nonaktif, dan modal formulir **"Terbitkan Surprise Bag Baru"** dengan kalkulasi diskon otomatis serta unggah foto S3.
* `/seller/orders`: Histori transaksi masuk dan grafik tren analitik omzet mingguan serta jam sibuk pickup via Recharts.
* `/seller/boxes`: Pengadaan kemasan ramah lingkungan B2B Rescue Box dan pelacakan nomor resi pengiriman.
* `/seller/finance`: Rekap saldo dompet toko (*earning net 88%*) dan pengajuan penarikan dana ke rekening bank.

---

### 7.2. Pusat Kendali Super Admin (`/admin/*`)
Dashboard operasional command center dengan 6 sub-rute modular:
* `/admin`: Ringkasan metrik dampak lingkungan Cirebon (porsi makanan terselamatkan, kg limbah dicegah) dan grafik area GMV mingguan via Recharts.
* `/admin/mitra`: Antarmuka persetujuan KYC calon mitra baru dengan modal peninjauan foto KTP dan gerai toko beresolusi tinggi.
* `/admin/transaksi`: Buku besar rekening penjamin (*Escrow Ledger*) dan pemantauan obrolan sengketa pesanan.
* `/admin/keuangan`: Persetujuan penarikan dana mitra toko dan pesanan kemasan box B2B.
* `/admin/users`: Manajemen pengguna multi-peran dengan filter pencarian dan paginasi client 5 data per halaman.
* `/admin/audit`: Pengawasan kepatuhan kemasan ramah lingkungan gerai kuliner.

---

## 8. Arsitektur Database & Penyimpanan Berkas

* **ORM:** Drizzle ORM dengan driver `pg` (Node-Postgres Pool) dan deteksi SSL otomatis untuk PostgreSQL Cloud (Supabase, Neon) maupun Coolify VPS.
* **Skema Relasional (11 Tabel & 7 Enum):**
  * `users`, `stores`, `surprise_bags`, `orders`, `escrow_accounts`, `chat_messages`, `rescue_box_packages`, `rescue_box_orders`, `reviews`, `withdrawal_requests`, `dispute_tickets`.
* **Penyimpanan Berkas S3:**
  * Modul `src/lib/s3.ts` dan rute API `POST /api/upload` yang mendukung AWS S3 dan Dahono S3 (*forcePathStyle: true*) untuk unggah foto produk dan bukti usaha KYC.
* **Mode Seeding:**
  * Minimal Bootstrap: Menginisialisasi akun Super Admin (`admin@rerasa.com`).
  * Full Demo (`SEED_FULL_DEMO=true`): Menginjeksi gerai percontohan Cirebon dan paket makanannya.

---

## 9. Standar Kualitas Anti-Slop (Delivery Gate)

1. **Zero Em Dash:** Tidak ada penggunaan karakter *em dash* (`—`) di seluruh antarmuka.
2. **Zero Dead Buttons:** Seluruh tombol navigasi, pemilihan kategori, pemesanan, dan penarikan saldo memiliki rute atau aksi yang benar-benar berfungsi.
3. **Responsive Resilience:** Tampilan mobile berfokus 100% pada transaksi cepat, sementara dashboard operasional tetap lega dan informatif di layar desktop.
4. **Data Nyata & Transparan:** Menggunakan nama gerai dan kawasan nyata Cirebon dengan rincian biaya yang jujur dan transparan.
