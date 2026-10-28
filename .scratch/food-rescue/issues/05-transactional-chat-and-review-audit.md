# 05: Order-Scoped In-App Chat and Box Compliance Review

**What to build:**
Sistem komunikasi dan evaluasi transaksi:
- In-App Chat Engine:
  - Hanya dapat dibuka pada pesanan berstatus `PAID` / `READY_FOR_PICKUP`.
  - Header chat menampilkan ringkasan Order ID, nama paket, dan jam batas pickup.
  - Fitur kirim pesan instan antar pembeli dan kasir toko.
  - Auto-lock sistem: Chat otomatis menjadi *read-only* 24 jam setelah pesanan `COMPLETED`.
- Ulasan & Kepatuhan Kemasan (Review & Rating):
  - Form rating bintang 1-5 dan testimoni makanan.
  - *Box Compliance Checklist*: Pertanyaan wajib "Apakah toko menyerahkan makanan dalam kemasan resmi Rescue Box?".
  - Menghitung rasio kepatuhan mitra (*Box Compliance Rate %*).

**Blocked by:** 04-pickup-handshake-and-escrow-release

**Status:** ready-for-agent

- [ ] Chat room terikat ke Order ID aktif
- [ ] Auto-lock banner dan disabled input jika pesanan selesai >24 jam
- [ ] Form ulasan pembeli dengan checklist kepatuhan kemasan
- [ ] Kalkulasi skor kepatuhan toko berdasarkan input pembeli
