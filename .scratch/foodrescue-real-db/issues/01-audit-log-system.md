# 01: Audit Log Table, API, and Super Admin UI

**What to build:**
Sistem pencatatan audit log otomatis untuk setiap aktivitas krusial di platform (pembelian, serah terima pesanan, pembekuan user, persetujuan toko, pencairan dana). Dilengkapi dengan endpoint API `GET /api/admin/audit-logs` dan antarmuka `/admin/audit-logs` di sidebar Super Admin.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Tabel `audit_logs` di Drizzle ORM `src/db/schema.ts`
- [ ] Helper backend `recordAuditLog()` untuk mencatat event
- [ ] REST API `/api/admin/audit-logs` dengan filter aksi & aktor
- [ ] Halaman UI `/admin/audit-logs` di layout admin dengan badge status dan angka tabular
