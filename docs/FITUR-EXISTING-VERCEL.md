# Fitur Existing & Status Environment Vercel - FoodRescue

Dokumen ini memetakan seluruh fitur aplikasi yang siap berjalan seketika saat di-*deploy* ke Vercel, dampak pengisian *environment variables*, serta analisis kesiapan integrasi Google OAuth dan Database PostgreSQL.

---

## 1. Analisis Environment Variables di Vercel

### Apakah aplikasi akan langsung berjalan dengan ENV sekarang?
**YA, aplikasi langsung berjalan 100% lancar.**
- Arsitektur aplikasi saat ini dibangun dengan prinsip *graceful fallback* berbasis simulasi domain (`storeService`).
- Jika `DATABASE_URL` belum diisi, frontend dan seluruh alur transaksi menggunakan penyimpanan state lokal reaktif (`localStorage`) yang telah diisi 16 akun demo siap pakai.
- Jika `S3_*` diisi di Vercel Dashboard, rute serverless API `/api/upload` seketika aktif dan langsung mengunggah dokumen/foto ke storage Dahono S3.

### Matriks Kesiapan Variabel Environment

| Variabel di Vercel | Status Saat Ini | Dampak Saat Diisi |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Siap | Menentukan base URL untuk link callback, metadata PWA, dan sharing tiket. |
| `S3_ENDPOINT_URL` | Siap | Mengaktifkan endpoint Dahono S3 (`https://s3.dahono.com`). |
| `S3_ACCESS_KEY_ID` | Siap | Kredensial autentikasi API Dahono S3. |
| `S3_SECRET_ACCESS_KEY` | Siap | Secret key enkripsi unggah file. |
| `S3_BUCKET_NAME` | Siap | Bucket tujuan berkas KYC & avatar pengguna (`bkt-2a45ca39de27ab13`). |
| `S3_REGION` | Siap | Region default S3 (`us-east-1`). |
| `DATABASE_URL` / `POSTGRES_URL` | Drizzle Ready | Menghubungkan Drizzle ORM ke PostgreSQL live (Neon / Supabase). |
| `GOOGLE_CLIENT_ID` | Perlu Auth Handler | Kredensial OAuth Google (memerlukan endpoint `/api/auth/[...all]`). |
| `GOOGLE_CLIENT_SECRET` | Perlu Auth Handler | Kredensial rahasia Google OAuth. |

---

## 2. Fitur Existing yang Bisa Langsung Dijalankan di Vercel

Seluruh alur fitur di bawah ini dapat diuji secara langsung oleh tim penguji maupun klien:

### A. Autentikasi Cepat & Switcher Akun Demo
1. **16 Akun Demo Terdaftar**:
   - **2 Akun Admin**: Ahmad Fauzi (`admin@rerasa.com`), Dewi Sartika (`dewi.ops@rerasa.com`).
   - **6 Akun Mitra Toko**: Ruby Bakery, Kopi Nako, Nasi Jamblang Mang Dul, Empal Gentong H. Apud, Martabak SF, Dapur Ciremai.
   - **8 Akun Pelanggan (Buyer)**: Fauzan Rizqi, Budi Santoso, Anisa, Dimas, Rina, Eko, Mega, Reza.
2. **1-Click Role Switcher**:
   - Di halaman `/login` dan popover profile di navbar, pengguna dapat berganti akun dan role secara instan tanpa perlu repot mengetik password.
3. **Pendaftaran Otomatis User Baru**:
   - Memasukkan email baru otomatis membuat akun `buyer` dengan avatar DiceBear Adventurer Neutral resmi.

### B. Pengalaman Pelanggan (Buyer Portal)
1. **Katalog & Geofilter Makanan Surplus**:
   - Filter lokasi area (Tuparev, Kartini, Siliwangi, Kesambi, Harjamukti).
   - Filter kategori makanan (Bakery & Pastry, Makanan Berat, Kafe & Minuman, Swalayan & Buah).
   - Banner Flash Sale penawaran kilat jelang toko tutup.
   - Navigasi horizontal ramah desktop dengan scroll mouse wheel dan kursor tangan (*grab / grabbing*).
2. **Keranjang & Checkout Instan**:
   - Floating cart bar dengan total akumulasi dinamis.
   - Halaman `/checkout` dengan rincian biaya transparan (harga makanan surplus + biaya layanan platform Rp 1.000).
   - Simulasi pembayaran instan (QRIS).
3. **Tiket Digital & Escrow Protection**:
   - Halaman `/tickets` menampilkan tiket aktif lengkap dengan 4-digit PIN unik dan QR code dinamis untuk verifikasi fisik di kasir toko.
   - In-app chat terisolasi per nomor pesanan (`/chat?orderId=...`) untuk koordinasi langsung dengan kasir toko.
4. **Rating & Audit Kepatuhan Kemasan**:
   - Formulir ulasan bintang 1-5 dan verifikasi apakah toko menyajikan makanan menggunakan kemasan resmi FoodRescue.

### C. Portal Mitra Toko (Seller Dashboard - `/seller/*`)
1. **Ringkasan Outlet (`/seller`)**:
   - Metrik penjualan harian, saldo dompet, kuota bag aktif, dan skor kepatuhan box.
2. **POS Validasi Pesanan (`/seller/orders`)**:
   - Kasir toko memasukkan 4-digit PIN pembeli -> pesanan selesai seketika -> dana escrow dilepas ke saldo dompet toko secara otomatis (88% dari subtotal).
3. **Manajemen Menu Bag (`/seller/bags`)**:
   - Tambah, edit, aktifkan, dan nonaktifkan kuota Surprise Bag harian serta atur jam pickup.
4. **B2B Packaging Store (`/seller/boxes`)**:
   - Pemesanan kemasan resmi ramah lingkungan (paket 50, 100, atau 200 pcs) dengan estimasi pengiriman kurir lokal.
5. **Keuangan & Payout (`/seller/finance`)**:
   - Histori mutasi saldo dompet dan formulir pengajuan penarikan dana (*withdrawal*) ke rekening bank mitra.

### D. Portal Administrator (Admin Dashboard - `/admin/*`)
1. **Ringkasan Eksekutif (`/admin`)**:
   - Metrik agregat seluruh platform: total omset, dana escrow tertahan, total emisi karbon terselamatkan, dan total kg makanan yang berhasil diselamatkan.
2. **Kurasi & Verifikasi Mitra (`/admin/mitra`)**:
   - Verifikasi dokumen KYC toko pendaftar baru (KTP pemilik & foto toko fisik) -> opsi Setujui (*Approve*) atau Tangguhkan (*Suspend*).
3. **Monitoring Escrow & Pesanan (`/admin/transaksi`)**:
   - Pelacakan seluruh status pesanan pembeli di semua mitra secara terpusat.
4. **Manajemen Pengguna Terpusat (`/admin/users`)**:
   - Pencarian user berdasar nama/email.
   - Filter role (`buyer`, `seller`, `admin`).
   - Tombol blokir (*Suspend*) dan aktifkan kembali (*Activate*) akun pengguna.
   - Tampilan avatar DiceBear Adventurer Neutral terintegrasi.
5. **Audit Kepatuhan & Sengketa (`/admin/audit`)**:
   - Penanganan keluhan pembeli (Dispute Resolution): keputusan refund dana ke pembeli atau pelepasan dana ke mitra.
6. **Approval Penarikan Dana Toko (`/admin/keuangan`)**:
   - Verifikasi rekening bank dan persetujuan transfer penarikan saldo toko.

### E. Integrasi Media Storage (Dahono S3)
- API endpoint `POST /api/upload` siap menerima file berkas (KTP, bukti toko, foto avatar profil).
- File langsung diunggah ke Dahono S3 dan mengembalikan URL publik resmi untuk disimpan ke entitas profil pengguna.

---

## 3. Catatan Integrasi Google OAuth & Transisi Database Live

1. **Tentang Penambahan Google Client ID & Secret**:
   - Saat ini kode di frontend menyediakan alur *passwordless / email-based sign in*.
   - Jika ingin mengaktifkan tombol **"Masuk dengan Google"**, kita tinggal menambahkan library autentikasi standar Next.js (seperti `@auth/core` atau `better-auth`) dan menghubungkannya dengan `users` tabel database yang sudah siap di `src/db/schema.ts`.
2. **Promosi Role Pengguna (Buyer -> Admin / Seller)**:
   - Setiap pengguna baru yang mendaftar via Google otomatis memperoleh role default **`buyer`**.
   - Admin yang sedang login dapat membuka menu `/admin/users` dan mempromosikan akun tersebut menjadi **`admin`** atau menautkannya ke toko sebagai **`seller`**.
