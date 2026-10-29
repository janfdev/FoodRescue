# 01: Edge Security Headers & Cloudflare Real-IP Resolver

**What to build:**
Menyuntikkan security headers standar OWASP/Cloudflare pada `next.config.ts` dan menyediakan utility `getClientIp(req)` di `src/lib/ip.ts` yang memprioritaskan header `CF-Connecting-IP` dari Cloudflare sebelum `x-forwarded-for` untuk logging audit anti-spoofing.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Security headers (HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy) disetel pada `next.config.ts`.
- [ ] Utility `getClientIp` membaca `cf-connecting-ip`, `x-forwarded-for`, dan `x-real-ip`.
- [ ] Route audit logs dan upload memakai `getClientIp`.
