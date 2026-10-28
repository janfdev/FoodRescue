# 02: Dynamic Location Combobox and Seller Location Field

**What to build:**
Filter lokasi dinamis di landing page (mobile & desktop) menggunakan Combobox (search + scrollable list) yang membaca data riil dari database (`/api/locations`), serta penambahan field area/lokasi wajib pada onboarding & form registrasi gerai seller.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Endpoint `/api/locations` yang mengembalikan daftar area/kecamatan unik dari tabel `stores`
- [ ] Komponen Combobox pencarian lokasi dengan popover di `LandingPage.tsx` dan `BuyerAppView.tsx`
- [ ] Validasi input lokasi/area pada pendaftaran mitra seller dan edit profil toko
- [ ] Fallback data area Cirebon Raya (Tuparev, Kartini, Siliwangi, Kesambi, Harjamukti, Kedawung)
