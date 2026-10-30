# LAPORAN AUDIT SELURUH SUB-MENU & ALUR SISTEM (RERASA FOOD RESCUE)

> Tanggal Audit: 2026-10-30T00:28:32.199Z  
> Target Live URL: [https://rerasa.fizaa.me](https://rerasa.fizaa.me)  
> Total Sub-Menu Diperiksa: **28 Halaman** | **OK: 2** | **BROKEN: 26**

---

## Matriks Ketersediaan Sub-Menu & Rute

| Role | Nama Sub-Menu / Fitur | Rute URL | HTTP Status | Status Render | Judul / Heading Terdeteksi |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Buyer** | Katalog Beranda | `/` | 200 | **✗ BROKEN** | Segera Habis Malam Ini |
| **Buyer** | Keranjang Makanan | `/cart` | 200 | **✗ BROKEN** | Keranjang Belanja |
| **Buyer** | Checkout Pembayaran | `/checkout?bagId=bag-ruby-1` | 0 | **✗ BROKEN** | undefined |
| **Buyer** | Riwayat Pesanan & Tiket | `/history` | 200 | **✗ BROKEN** | Riwayat Pesanan |
| **Buyer** | Ruang Chat Toko | `/chat` | 0 | **✗ BROKEN** | undefined |
| **Buyer** | Akun & Profil Pembeli | `/account` | 200 | **✗ BROKEN** | Akun & Profil |
| **Buyer** | Registrasi Mitra Baru | `/register-seller` | 200 | **✗ BROKEN** | Pendaftaran Kemitraan Toko |
| **Buyer** | Portal Login | `/login` | 200 | **✗ BROKEN** | Masuk ke Rerasa |
| **Buyer** | Aset Brand & Logo | `/brand` | 200 | **✗ BROKEN** | 3 Opsi Logo Resmi Rerasa Cirebon |
| **Seller** | Kasir POS & Handover | `/seller` | 200 | **✗ BROKEN** | Portal Operasional Mitra |
| **Seller** | Katalog Surprise Bag | `/seller/bags` | 200 | **✗ BROKEN** | Portal Operasional Mitra |
| **Seller** | Tambah Menu Surplus | `/seller/bags/new` | 200 | **✗ BROKEN** | Portal Operasional Mitra |
| **Seller** | Edit Menu Surplus | `/seller/bags/bag-ruby-1/edit` | 200 | **✓ OK** | Portal Operasional Mitra |
| **Seller** | Daftar Pesanan Toko | `/seller/orders` | 200 | **✗ BROKEN** | Portal Operasional Mitra |
| **Seller** | Pengadaan Rescue Box | `/seller/boxes` | 200 | **✗ BROKEN** | Portal Operasional Mitra |
| **Seller** | Keuangan & Saldo Toko | `/seller/finance` | 200 | **✗ BROKEN** | Portal Operasional Mitra |
| **Seller** | Profil & Jam Operasional | `/seller/profile` | 200 | **✗ BROKEN** | Portal Operasional Mitra |
| **Admin** | Action Center & Metrik | `/admin` | 200 | **✗ BROKEN** | Ikhtisar Platform & Dampak Sosial |
| **Admin** | Master Paket Box B2B | `/admin/boxes` | 200 | **✗ BROKEN** | Manajemen & Pengiriman Rescue Box |
| **Admin** | Verifikasi KYC Mitra | `/admin/mitra` | 200 | **✗ BROKEN** | Mitra Menunggu Persetujuan (KYC) |
| **Admin** | Detail Tinjauan Mitra | `/admin/mitra/store-ruby-bakery` | 200 | **✓ OK** | Ruby Bakery & Cake |
| **Admin** | Vault Escrow & Keuangan | `/admin/keuangan` | 200 | **✗ BROKEN** | Pencairan Dana (Payout) & Kas Escrow |
| **Admin** | Audit Rating & Kemasan | `/admin/audit` | 200 | **✗ BROKEN** | Audit Kepatuhan Wadah & Sengketa (Ulasan Pembeli) |
| **Admin** | Audit Trail Tamper-Proof | `/admin/audit-logs` | 200 | **✗ BROKEN** | Audit Log Aktivitas |
| **Admin** | Daftar Semua Transaksi | `/admin/transaksi` | 200 | **✗ BROKEN** | Daftar Transaksi & Rekening Penjamin (Escrow) |
| **Admin** | Chat Sengketa Transaksi | `/admin/transaksi/RB-7821/chat` | 0 | **✗ BROKEN** | undefined |
| **Admin** | Manajemen Pengguna | `/admin/users` | 200 | **✗ BROKEN** | Manajemen Pengguna Terdaftar |
| **Admin** | Profil Super Admin | `/admin/profile` | 200 | **✗ BROKEN** | Profil & Kredensial Administrator |

## Error Konsol Halaman Terdeteksi

- Halaman: `https://rerasa.fizaa.me/seller` -> `Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
- Halaman: `https://rerasa.fizaa.me/seller/bags` -> `Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
- Halaman: `https://rerasa.fizaa.me/seller/bags/new` -> `Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
- Halaman: `https://rerasa.fizaa.me/seller/boxes` -> `Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
- Halaman: `https://rerasa.fizaa.me/seller/finance` -> `Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
- Halaman: `https://rerasa.fizaa.me/seller/profile` -> `Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
- Halaman: `https://rerasa.fizaa.me/admin/boxes` -> `Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
- Halaman: `https://rerasa.fizaa.me/admin/mitra` -> `Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
- Halaman: `https://rerasa.fizaa.me/admin/keuangan` -> `Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
- Halaman: `https://rerasa.fizaa.me/admin/audit` -> `Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
- Halaman: `https://rerasa.fizaa.me/admin/audit-logs` -> `Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
- Halaman: `https://rerasa.fizaa.me/admin/transaksi` -> `Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
- Halaman: `https://rerasa.fizaa.me/admin/users` -> `Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
- Halaman: `https://rerasa.fizaa.me/admin/profile` -> `Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
