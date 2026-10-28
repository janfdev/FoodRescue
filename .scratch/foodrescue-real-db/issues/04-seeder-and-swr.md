# 04: Real Database Seeder and SWR Data-Fetching Layer

**What to build:**
Penyusunan skrip `src/db/seed.ts` komprehensif yang memuat gerai mitra nyata Cirebon dengan logo tajam, katalog Surprise Bag aktif, dan formula keuangan riil. Mengintegrasikan SWR (`useSWR`) pada frontend untuk data fetching langsung dari REST API `/api/*` tanpa ketergantungan `const` mockup.

**Blocked by:** 01-audit-log-system, 02-dynamic-location-combobox

**Status:** ready-for-agent

- [ ] Skrip `src/db/seed.ts` dengan data gerai Cirebon (Ruby Bakery, Kopi Nako, Nasi Jamblang Mang Dul, dll)
- [ ] Integrasi `swr` package di frontend
- [ ] Custom hooks: `useBags()`, `useStores()`, `useOrders()`, `useLocations()`
- [ ] Agregasi metrik di admin/seller dihitung langsung dari data real
