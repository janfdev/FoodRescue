# DESIGN.md — SisaRasa (Food Rescue App)

> Panduan visual anti-slop, token tipografi, palet warna, dan arsitektur antarmuka untuk platform penyelamatan makanan surplus Cirebon Raya.

## 1. Identitas & Karakter Desain
* **Konsep:** Gerakan penyelamatan pangan berbasis komunitas lokal. Bersahaja, terpercaya, bertanggung jawab terhadap lingkungan, dan membangkitkan selera makan (*culinary-grounded*).
* **Bukan AI Slop:**
  * Bebas dari emoji dekoratif pada judul atau kartu navigasi.
  * Bebas dari badge kapsul generik di atas headline (*eyebrow badge* yang mengulang isi judul).
  * Bebas dari kartu template repetitif 3 langkah (1-2-3 lingkaran).
  * Bebas dari animasi pulse melayang tanpa henti (*infinite pulsing loops*).
  * Menggunakan data riil mitra Cirebon (Ruby Bakery Tuparev, Kopi Nako Kesambi, Mang Dul Cipto, H. Apud Tuparev).

## 2. Dial Pengaturan (Three Dials)
* **ENERGY:** 2 (Hangat, ramah, membumi, dan meyakinkan tanpa berteriak).
* **RHYTHM:** 2 (Komposisi bervariasi: banner edukasi editorial, grid mitra asimetris, dan feed transaksi dinamis).
* **MOTION:** 1 (Transisi status halus pada hover dan pembukaan modal, tanpa pergerakan konstan).

## 3. Palet Warna (Semantic Tokens)
* **Botanical Green (Primer):**
  * Light: `#15803d` (Emerald-700) / `#166534` (Emerald-800)
  * Dark: `#22c55e` (Emerald-500)
  * Makna: Melambangkan kesegaran, keberlanjutan pangan, dan bumi yang lestari.
* **Warm Amber (Aksen Kuliner):**
  * Light: `#d97706` (Amber-600) / `#b45309` (Amber-700)
  * Dark: `#f59e0b` (Amber-500)
  * Makna: Menggugah selera makan hangat, aroma roti panggangan, dan diskon hemat.
* **Permukaan & Netral (Warm Canvas):**
  * Light Mode Base: `#fafaf9` (Stone-50) dengan kartu `#ffffff` dan border halus `#e7e5e4` (Stone-200).
  * Dark Mode Base: `#18181b` (Zinc-900) dengan kartu `#27272a` (Zinc-800).
* **Kontras Teks:** Teks utama `#1c1917` (Stone-900) memenuhi standar aksesibilitas WCAG AA (>4.5:1).

## 4. Tipografi
* **Font Sans:** Inter / Geist.
* **Gaya:** Bersih, humanis, berjarak baca proporsional.
* **Monospace:** Hanya digunakan untuk data fungsional (Kode Transaksi `RB-xxxx`, PIN 4-Digit `4829`, dan Nomor Resi `SICEPAT-xxx`). Tidak digunakan untuk judul promosi.

## 5. Tata Letak Berdasarkan Persona
1. **Landing Page (`/`):**
   * Header bernavigasi langsung ke portal pembeli, mitra toko, dan super admin.
   * Hero editorial dengan statistik dampak nyata Cirebon (bukan angka khayalan).
   * Showcase langsung Surplus Bag live hari ini yang interaktif dan dapat difilter per area Cirebon (Tuparev, Kesambi, Cipto).
   * Nilai transparansi Rekber Escrow yang menenangkan pembeli dan penjual.
2. **Super Admin Dashboard (`/admin`):**
   * Layout desktop penuh dengan **Sidebar Kiri Tetap**:
     - *Beranda & Metrik Dampak*
     - *Mitra Menunggu (KYC Approval)*
     - *Daftar Transaksi (Escrow Ledger)*
     - *Keuangan & Pencairan (Withdrawal)*
     - *Pengaturan & Audit Sengketa*
   * Panel verifikasi dokumen dengan dialog foto KTP & toko beresolusi tinggi.
3. **Aplikasi Pembeli (`/buyer`):**
   * Frame mobile-first responsif dengan navigasi bawah 4 tab (Jelajah, Pesanan, Dampak, Profil).
   * Modal tiket penjemputan dengan PIN 4-digit kontras tinggi dan QR Code.
