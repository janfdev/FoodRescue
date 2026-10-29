# 02: S3 Upload Gate & Storage Protection

**What to build:**
Mencegah eksploitasi kuota dan upload file berbahaya pada `/api/upload` dengan validasi ukuran file (maksimal 5MB), whitelist MIME type (`image/jpeg`, `image/png`, `image/webp`), dan whitelist nama folder (`kyc`, `stores`, `products`).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Validasi batasan ukuran file maksimum 5MB di `/api/upload`.
- [ ] Whitelist MIME type hanya untuk format gambar yang diizinkan.
- [ ] Sanitasi parameter `folder` agar tidak ada path traversal.
