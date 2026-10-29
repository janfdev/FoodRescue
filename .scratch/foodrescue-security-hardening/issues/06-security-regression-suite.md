# 06: Security Regression & Verification Test Suite

**What to build:**
Suite pengujian otomatis komprehensif `src/test/securityAudit.test.ts` untuk memastikan seluruh guard keamanan Cloudflare edge, proteksi upload, dan pencegahan IDOR teruji dan berfungsi 100%.

**Blocked by:** 01, 02, 03, 04, 05

**Status:** ready-for-agent

- [ ] Pengujian penolakan upload file ilegal / melebihi ukuran 5MB.
- [ ] Pengujian ekstraksi IP Cloudflare `CF-Connecting-IP`.
- [ ] Pengujian pencegahan BOLA/IDOR pada Order dan Chat API.
- [ ] Pengujian verifikasi pesanan dengan validasi otorisasi seller.
