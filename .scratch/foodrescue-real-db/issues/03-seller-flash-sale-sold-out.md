# 03: Seller Flash Sale Control and Sold Out Grayscale UI

**What to build:**
Kontrol manual bagi mitra toko untuk mengaktifkan atau menonaktifkan status Flash Sale jelang tutup toko (`isLastCall`), serta pembaruan antarmuka kartu produk di frontend: jika stok habis (`quotaRemaining === 0`), card otomatis menjadi grayscale dengan overlay badge tegas "HABIS TERJUAL" dan tombol beli nonaktif.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Toggle switch "Flash Sale Jelang Tutup" di halaman `/seller/bags`
- [ ] Pengaturan kuota stok Surprise Bag harian oleh seller
- [ ] Card UI anti-slop: efek grayscale `grayscale opacity-75` saat stok 0
- [ ] Overlay badge "HABIS TERJUAL" kontras tinggi di atas gambar produk
- [ ] Disabled state pada tombol pembelian dengan teks "Stok Habis Hari Ini"
