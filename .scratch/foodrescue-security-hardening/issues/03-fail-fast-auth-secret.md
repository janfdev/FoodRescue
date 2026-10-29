# 03: Fail-Fast Auth Secret & Environment Hardening

**What to build:**
Menghilangkan hardcoded fallback secret pada `src/lib/auth.ts` dan menerapkan runtime validation yang melempar error startup saat `NODE_ENV === "production"` tanpa secret yang aman.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Penghapusan static secret fallback berisiko di `src/lib/auth.ts`.
- [ ] Fail-fast exception jika dijalankan di production tanpa secret yang kuat.
- [ ] Dokumentasi requirement env var pada `.env.example`.
