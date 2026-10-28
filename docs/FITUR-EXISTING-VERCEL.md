# Fitur Existing & Status Environment Vercel - FoodRescue

Dokumen ini memetakan seluruh fitur aplikasi yang siap berjalan seketika saat di-*deploy* ke Vercel, dampak pengisian *environment variables*, daftar REST API endpoints, serta integrasi Better-Auth (Google OAuth) dan Database PostgreSQL Drizzle ORM.

---

## 1. Analisis Environment Variables di Vercel

### Apakah aplikasi akan langsung berjalan dengan ENV sekarang?
**YA, aplikasi langsung berjalan 100% lancar.**
- Arsitektur aplikasi dibangun dengan prinsip *graceful fallback* berbasis simulasi domain (`storeService`) dan dual-layer database connectivity.
- Jika `DATABASE_URL` belum diisi, frontend dan seluruh REST API menggunakan penyimpanan state lokal reaktif (`localStorage` / in-memory) yang telah diisi 16 akun demo dan katalog makanan surplus Cirebon Raya.
- Begitu variabel `DATABASE_URL`, `GOOGLE_CLIENT_ID`, dan `S3_*` diisi di Vercel Dashboard, seluruh fitur backend, OAuth, dan cloud storage langsung aktif otomatis tanpa perlu mengubah kode.

### Matriks Kesiapan Variabel Environment

| Variabel di Vercel | Status Saat Ini | Dampak Saat Diisi |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Siap | Menentukan base URL untuk link callback OAuth, metadata PWA, dan sharing tiket. |
| `BETTER_AUTH_SECRET` | Siap | Secret key enkripsi sesi cookie Better-Auth (min. 32 karakter). |
| `BETTER_AUTH_URL` | Siap | URL callback endpoint Better-Auth di Vercel. |
| `GOOGLE_CLIENT_ID` | Siap | Client ID Google Cloud Console untuk login 1-klik dengan Google. |
| `GOOGLE_CLIENT_SECRET` | Siap | Client Secret Google Cloud Console. |
| `DATABASE_URL` / `POSTGRES_URL` | Drizzle Ready | Menghubungkan Drizzle ORM ke PostgreSQL live (Neon / Supabase / VPS). |
| `S3_ENDPOINT_URL` | Siap | Mengaktifkan endpoint Dahono S3 (`https://s3.dahono.com`). |
| `S3_ACCESS_KEY_ID` | Siap | Kredensial akses Dahono S3. |
| `S3_SECRET_ACCESS_KEY` | Siap | Secret key otentikasi unggah file Dahono S3. |
| `S3_BUCKET_NAME` | Siap | Bucket tujuan berkas KYC & avatar pengguna (`bkt-2a45ca39de27ab13`). |
| `S3_REGION` | Siap | Region default S3 (`us-east-1`). |

---

## 2. Katalog REST API Serverless Endpoints

FoodRescue kini dilengkapi dengan sekumpulan endpoint serverless Next.js App Router yang mendukung operasi hybrid (Database PostgreSQL + Fallback State):

### A. Autentikasi (`/api/auth/[...all]`)
- **Engine**: Better-Auth v1.7.14 dengan adapter resmi Drizzle ORM.
- **Provider**: Google OAuth (Social Login) dan Email/Password.
- **Session Management**: Cookie HTTP-Only aman, otomatis mengelola refresh token dan rotasi sesi.
- **Tabel Database**: `users`, `sessions`, `accounts`, `verifications`.

### B. Obrolan Langsung (`/api/chat`)
- `GET /api/chat?orderId={id}`: Mengambil seluruh riwayat pesan obrolan untuk pesanan tertentu.
- `POST /api/chat`: Mengirim pesan baru antar pembeli dan mitra toko dengan dukungan avatar DiceBear.

### C. Manajemen Pesanan (`/api/orders`)
- `GET /api/orders`: Mengambil daftar pesanan (mendukung filter `?buyerId=...` dan `?storeId=...`).
- `POST /api/orders`: Membuat pesanan baru, mengunci dana ke rekening penampung (*Escrow HELD*), dan men-generate 4-digit PIN verifikasi.

### D. Validasi POS Kasir (`/api/orders/verify`)
- `POST /api/orders/verify`: Kasir mitra memasukkan 4-digit PIN atau scan QR pembeli.
- Mengubah status pesanan menjadi `COMPLETED`, merilis dana penampung (*Escrow RELEASED*), dan menambahkan saldo bersih (88%) ke dompet mitra.

### E. Katalog Surprise Bags & Mitra Toko
- `GET /api/bags`: Mengambil daftar Surprise Bag aktif dengan kuota tersisa dan jendela waktu pengambilan (*pickup window*).
- `GET /api/stores`: Mengambil daftar mitra toko terverifikasi dengan titik koordinat dan kategori.

### F. Media Storage Dahono S3 (`/api/upload`)
- `POST /api/upload`: Menerima file multipart form-data (bukti KYC, foto toko fisik, avatar profil) dan mengunggahnya langsung ke S3 Dahono via AWS SDK v3.

---

## 3. Fitur Existing yang Bisa Langsung Dijalankan di Vercel

### A. Autentikasi Cepat & Switcher Akun Demo
1. **16 Akun Demo Terdaftar**:
   - **2 Akun Admin**: Ahmad Fauzi (`admin@rerasa.com`), Dewi Sartika (`dewi.ops@rerasa.com`).
   - **6 Akun Mitra Toko**: Ruby Bakery, Kopi Nako, Nasi Jamblang Mang Dul, Empal Gentong H. Apud, Martabak SF, Dapur Ciremai.
   - **8 Akun Pelanggan (Buyer)**: Fauzan Rizqi, Budi Santoso, Anisa, Dimas, Rina, Eko, Mega, Reza.
2. **1-Click Role Switcher**:
   - Di halaman `/login` dan popover profile di navbar, pengguna dapat berganti akun dan role secara instan tanpa perlu repot mengetik password.
3. **Pendaftaran Otomatis User Baru**:
   - Pengguna baru otomatis memperoleh role `buyer` dan default avatar DiceBear Adventurer Neutral.

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
   - In-app chat terisolasi per nomor pesanan (`/chat?orderId=...`) dengan *Optimistic UI Update* (0ms latency pengiriman).
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

---

## 4. Cara Mengonfigurasi Google OAuth di Google Cloud Console

1. Buka [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials).
2. Buat **OAuth 2.0 Client IDs** (Web application).
3. Masukkan **Authorized JavaScript origins**:
   - `http://localhost:3000` (untuk pengujian lokal)
   - `https://your-domain.vercel.app` (domain Vercel Anda)
4. Masukkan **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.vercel.app/api/auth/callback/google`
5. Salin Client ID dan Client Secret ke menu **Environment Variables** di Vercel Dashboard sebagai `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET`.
